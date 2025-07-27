// PageMaker Utilities - Helper functions for PageMaker operations
const PageMakerUtils = {
    
    // Parse variables in text {varname} or complex expressions
    parseVariables(text, context = {}) {
        if (typeof text !== 'string') {
            return text;
        }
        
        return text.replace(/\{([^}]+)\}/g, (match, expression) => {
            try {
                return this.evaluateExpression(expression, context);
            } catch (error) {
                console.warn('Error parsing variable:', expression, error);
                return match;
            }
        });
    },
    
    // Evaluate simple expressions like varname=='value'?'yes':'no'
    evaluateExpression(expression, context = {}) {
        // Remove whitespace
        expression = expression.trim();
        
        // Simple variable lookup
        if (!expression.includes('?') && !expression.includes('==')) {
            const value = this.getNestedValue(context, expression);
            return value !== undefined ? value : `{${expression}}`;
        }
        
        // Ternary expression
        if (expression.includes('?')) {
            const parts = expression.split('?');
            if (parts.length === 2) {
                const condition = parts[0].trim();
                const outcomes = parts[1].split(':');
                if (outcomes.length === 2) {
                    const trueValue = outcomes[0].trim().replace(/'/g, '');
                    const falseValue = outcomes[1].trim().replace(/'/g, '');
                    
                    if (this.evaluateCondition(condition, context)) {
                        return trueValue;
                    } else {
                        return falseValue;
                    }
                }
            }
        }
        
        return `{${expression}}`;
    },
    
    // Evaluate conditions like varname=='value'
    evaluateCondition(condition, context = {}) {
        if (condition.includes('==')) {
            const [left, right] = condition.split('==').map(s => s.trim());
            const leftValue = this.getNestedValue(context, left);
            const rightValue = right.replace(/'/g, ''); // Remove quotes
            return leftValue == rightValue;
        }
        
        if (condition.includes('!=')) {
            const [left, right] = condition.split('!=').map(s => s.trim());
            const leftValue = this.getNestedValue(context, left);
            const rightValue = right.replace(/'/g, '');
            return leftValue != rightValue;
        }
        
        // Simple truthiness check
        const value = this.getNestedValue(context, condition);
        return !!value;
    },
    
    // Get nested value from object using dot notation
    getNestedValue(obj, path) {
        if (!obj || !path) return undefined;
        
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    },
    
    // Set nested value in object using dot notation
    setNestedValue(obj, path, value) {
        if (!obj || !path) return;
        
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
    },
    
    // Deep merge objects
    deepMerge(target, source) {
        if (!source || typeof source !== 'object') {
            return target;
        }
        
        if (!target || typeof target !== 'object') {
            return source;
        }
        
        const result = { ...target };
        
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key], source[key]);
            } else {
                result[key] = source[key];
            }
        });
        
        return result;
    },
    
    // Clone object deeply
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = this.deepClone(obj[key]);
        });
        
        return cloned;
    },
    
    // Format values based on type
    formatValue(value, format) {
        if (value === null || value === undefined) {
            return '';
        }
        
        switch (format) {
            case 'currency':
                try {
                    return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(parseFloat(value));
                } catch {
                    return value;
                }
                
            case 'number':
                try {
                    return parseFloat(value).toLocaleString();
                } catch {
                    return value;
                }
                
            case 'date':
                try {
                    return new Date(value).toLocaleDateString();
                } catch {
                    return value;
                }
                
            case 'datetime':
                try {
                    return new Date(value).toLocaleString();
                } catch {
                    return value;
                }
                
            case 'percent':
                try {
                    return (parseFloat(value) * 100).toFixed(2) + '%';
                } catch {
                    return value;
                }
                
            default:
                return value.toString();
        }
    },
    
    // Generate unique ID
    generateId(prefix = 'pm') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // Validate email
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Check if object is empty
    isEmpty(obj) {
        if (!obj) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return false;
    },
    
    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Convert CSS string to object
    parseCssStyle(styleString) {
        const styles = {};
        if (!styleString) return styles;
        
        styleString.split(';').forEach(rule => {
            const [property, value] = rule.split(':').map(s => s.trim());
            if (property && value) {
                const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                styles[camelProperty] = value;
            }
        });
        
        return styles;
    },
    
    // Convert object to CSS string
    objectToCssStyle(styleObj) {
        if (!styleObj || typeof styleObj !== 'object') return '';
        
        return Object.keys(styleObj).map(key => {
            const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${kebabKey}: ${styleObj[key]}`;
        }).join('; ');
    }
}; 