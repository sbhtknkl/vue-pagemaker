// Metadata Service - Handles PageMaker metadata loading and processing
const MetadataService = {
    cache: new Map(),
    defaults: null,
    
    // Initialize and load default settings
    async init() {
        try {
            await this.loadDefaults();
        } catch (error) {
            console.error('Failed to initialize MetadataService:', error);
        }
    },
    
    // Load default settings (pme_defaults.json equivalent)
    async loadDefaults() {
        try {
            // For demo purposes, use a basic defaults object
            // In real implementation, this would load from pme_defaults.json
            this.defaults = {
                settings: {
                    returnKey: 'return',
                    successKey: 'success'
                },
                widgets: {
                    // Widget aliases and defaults
                    string: {
                        type: 'input'
                    },
                    email: {
                        type: 'input',
                        inputType: 'email'
                    },
                    password: {
                        type: 'input',
                        inputType: 'password'
                    },
                    currency: {
                        type: 'input',
                        inputType: 'number',
                        format: 'currency'
                    }
                }
            };
            
            console.log('Default settings loaded');
        } catch (error) {
            console.error('Error loading defaults:', error);
            this.defaults = { settings: {}, widgets: {} };
        }
    },
    
    // Get default settings
    getDefaults() {
        return this.defaults;
    },
    
    // Load metadata from URL
    async loadMetadata(url, useCache = true) {
        // Check cache first
        if (useCache && this.cache.has(url)) {
            return this.cache.get(url);
        }
        
        try {
            const response = await ApiService.get(url);
            
            if (response.success) {
                const metadata = response.return || response.data;
                const processedMetadata = this.processMetadata(metadata);
                
                // Cache the result
                if (useCache) {
                    this.cache.set(url, processedMetadata);
                }
                
                return processedMetadata;
            } else {
                throw new Error(response.error || 'Failed to load metadata');
            }
        } catch (error) {
            console.error('Error loading metadata from', url, error);
            throw error;
        }
    },
    
    // Process metadata - apply defaults, resolve aliases, etc.
    processMetadata(metadata) {
        if (!metadata || typeof metadata !== 'object') {
            return metadata;
        }
        
        // Deep clone to avoid modifying original
        const processed = JSON.parse(JSON.stringify(metadata));
        
        // Process recursively
        this.processNode(processed);
        
        return processed;
    },
    
    // Process individual node in metadata tree
    processNode(node) {
        if (!node || typeof node !== 'object') {
            return;
        }
        
        // Apply widget aliases and defaults
        if (node.type || node['pm::type'] || node['@type']) {
            this.applyWidgetDefaults(node);
        }
        
        // Process children recursively
        const children = node.childs || node.children || {};
        Object.values(children).forEach(child => {
            if (typeof child === 'object') {
                this.processNode(child);
            }
        });
        
        // Process other object properties
        Object.keys(node).forEach(key => {
            if (typeof node[key] === 'object' && 
                !['childs', 'children'].includes(key)) {
                this.processNode(node[key]);
            }
        });
    },
    
    // Apply widget defaults and aliases
    applyWidgetDefaults(node) {
        const type = node.type || node['pm::type'] || node['@type'];
        
        if (type && this.defaults?.widgets?.[type]) {
            const widgetDefaults = this.defaults.widgets[type];
            
            // Apply defaults (don't override existing values)
            Object.keys(widgetDefaults).forEach(key => {
                if (node[key] === undefined) {
                    node[key] = widgetDefaults[key];
                }
            });
        }
    },
    
    // Parse variable expressions {varname} or {varname=='value'?'yes':'no'}
    parseExpression(expression, context = {}) {
        if (typeof expression !== 'string') {
            return expression;
        }
        
        return expression.replace(/\{([^}]+)\}/g, (match, expr) => {
            try {
                // Simple variable substitution
                if (expr.includes('?') || expr.includes('==')) {
                    // Complex expression - would need proper expression parser
                    // For now, return as-is
                    return match;
                } else {
                    // Simple variable lookup
                    const value = context[expr];
                    return value !== undefined ? value : match;
                }
            } catch (error) {
                console.warn('Error parsing expression:', expr, error);
                return match;
            }
        });
    },
    
    // Resolve meta-get references
    async resolveMetaGet(node, context = {}) {
        if (!node || typeof node !== 'object') {
            return node;
        }
        
        const metaGet = node['meta-get'];
        if (metaGet) {
            try {
                // Parse the meta-get URL with context variables
                const url = this.parseExpression(metaGet, context);
                const subMetadata = await this.loadMetadata(url);
                
                // Merge the loaded metadata
                Object.assign(node, subMetadata);
                delete node['meta-get'];
            } catch (error) {
                console.error('Error resolving meta-get:', metaGet, error);
            }
        }
        
        return node;
    },
    
    // Clear cache
    clearCache() {
        this.cache.clear();
    },
    
    // Get cached metadata
    getCached(url) {
        return this.cache.get(url);
    },
    
    // Validate metadata structure
    validateMetadata(metadata) {
        // Basic validation - in real implementation would use JSON schema
        if (!metadata || typeof metadata !== 'object') {
            return { valid: false, errors: ['Metadata must be an object'] };
        }
        
        // Check for required success/return structure for PageMaker
        if (metadata.success === undefined && metadata.return === undefined) {
            console.warn('Metadata may not follow PageMaker format (missing success/return)');
        }
        
        return { valid: true, errors: [] };
    }
}; 