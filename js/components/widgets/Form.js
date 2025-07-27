// Form Widget - Manages form data and provides form context
const Form = {
    name: 'Form',
    props: {
        widgetId: String,
        meta: Object,
        allData: Object,
        formData: Object,
        children: Object
    },
    setup(props, { slots }) {
        const { ref, reactive, computed, onMounted, inject, provide } = Vue;
        const pagemaker = inject('pagemaker');
        
        // Form-specific data
        const localFormData = reactive({});
        
        // Initialize form data
        const initializeFormData = async () => {
            // Start with existing formData
            Object.assign(localFormData, props.formData || {});
            
            // Load data from data-get if specified
            if (props.meta['data-get'] || props.meta['pm::dataGet']) {
                await loadFormData();
            }
            
            // Apply default values from form fields
            applyDefaultValues();
        };
        
        // Load data from API endpoint
        const loadFormData = async () => {
            try {
                const dataGet = props.meta['data-get'] || props.meta['pm::dataGet'];
                
                if (typeof dataGet === 'string') {
                    const response = await ApiService.get(dataGet);
                    if (response.success) {
                        Object.assign(localFormData, response.return || response.data || {});
                    }
                } else if (typeof dataGet === 'object') {
                    const response = await ApiService.get(dataGet.url, dataGet.params);
                    if (response.success) {
                        const data = response.return || response.data || {};
                        
                        // Apply response mapping if specified
                        if (dataGet.mapping) {
                            Object.keys(dataGet.mapping).forEach(key => {
                                const sourcePath = dataGet.mapping[key];
                                localFormData[key] = getNestedValue(data, sourcePath);
                            });
                        } else {
                            Object.assign(localFormData, data);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading form data:', error);
            }
        };
        
        // Apply default values from child field definitions
        const applyDefaultValues = () => {
            if (!props.children) return;
            
            const processChild = (child, path = '') => {
                if (child.type || child['pm::type'] || child['@type']) {
                    const name = child.name || path;
                    if (name && (child.default !== undefined || child.value !== undefined)) {
                        if (localFormData[name] === undefined) {
                            localFormData[name] = child.default || child.value;
                        }
                    }
                }
                
                // Process nested children
                const children = child.childs || child.children;
                if (children) {
                    Object.keys(children).forEach(key => {
                        processChild(children[key], key);
                    });
                }
            };
            
            Object.keys(props.children).forEach(key => {
                processChild(props.children[key], key);
            });
        };
        
        // Get nested value from object using dot notation
        const getNestedValue = (obj, path) => {
            return path.split('.').reduce((current, key) => {
                return current && current[key] !== undefined ? current[key] : undefined;
            }, obj);
        };
        
        // Form classes
        const formClasses = computed(() => {
            const classes = ['pm-form'];
            
            if (props.meta.className) {
                classes.push(props.meta.className);
            }
            
            if (props.meta['pm::className']) {
                classes.push(props.meta['pm::className']);
            }
            
            return classes;
        });
        
        // Form styles
        const formStyles = computed(() => {
            const styles = {};
            
            if (props.meta.style) {
                Object.assign(styles, props.meta.style);
            }
            
            if (props.meta.padding) styles.padding = props.meta.padding;
            if (props.meta.margin) styles.margin = props.meta.margin;
            if (props.meta.display) styles.display = props.meta.display;
            if (props.meta.gap) styles.gap = props.meta.gap;
            
            return styles;
        });
        
        // Form attributes
        const formAttributes = computed(() => {
            const attrs = {};
            
            if (props.meta.name || props.meta['pm::name']) {
                attrs.name = props.meta.name || props.meta['pm::name'];
            }
            
            if (props.meta.action) attrs.action = props.meta.action;
            if (props.meta.method) attrs.method = props.meta.method;
            if (props.meta.enctype) attrs.enctype = props.meta.enctype;
            
            return attrs;
        });
        
        // Form label
        const formLabel = computed(() => {
            return props.meta.label || props.meta['pm::label'] || null;
        });
        
        // Handle form submission
        const handleSubmit = async (event) => {
            event.preventDefault();
            
            // Validate form
            const isValid = await validateForm();
            
            if (isValid) {
                // Execute form actions
                const actions = props.meta.onSubmit || props.meta.onsubmit || [];
                
                if (Array.isArray(actions)) {
                    for (const action of actions) {
                        await executeFormAction(action);
                    }
                } else if (actions) {
                    await executeFormAction(actions);
                }
            }
        };
        
        // Validate form
        const validateForm = async () => {
            // Emit validation event to all form children
            pagemaker.broadcast('validate', props.widgetId, {});
            
            // For now, assume valid - would need to collect validation results
            return true;
        };
        
        // Execute form action
        const executeFormAction = async (action) => {
            if (!action || typeof action !== 'object') return;
            
            switch (action.action) {
                case 'submit':
                    await submitForm(action);
                    break;
                    
                default:
                    // Delegate to button action system
                    break;
            }
        };
        
        // Submit form data
        const submitForm = async (action) => {
            try {
                const submitData = { ...localFormData };
                
                // Add additional post data
                if (action.additional_post) {
                    for (const key of action.additional_post) {
                        if (pagemaker.state.allData[key] !== undefined) {
                            submitData[key] = pagemaker.state.allData[key];
                        }
                    }
                }
                
                const response = await ApiService.post(action.url || props.meta.action, submitData);
                
                if (response.success) {
                    // Handle success
                    if (action.onSuccess) {
                        await executeFormAction(action.onSuccess);
                    }
                    
                    // Update allData if needed
                    if (action.updateAllData !== false) {
                        Object.assign(pagemaker.state.allData, response.return || response.data || {});
                    }
                } else {
                    // Handle error
                    if (action.onError) {
                        await executeFormAction(action.onError);
                    }
                }
            } catch (error) {
                console.error('Form submission error:', error);
                if (action.onError) {
                    await executeFormAction(action.onError);
                }
            }
        };
        
        // Update form data and sync with PageMaker
        const updateFormData = (path, value) => {
            if (path.includes('.')) {
                const keys = path.split('.');
                let current = localFormData;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
            } else {
                localFormData[path] = value;
            }
            
            // Sync with main PageMaker formData
            pagemaker.updateData(path, value, true);
        };
        
        // Provide form context to children
        provide('form', {
            formData: localFormData,
            updateFormData,
            validateForm
        });
        
        // Initialize on mount
        onMounted(() => {
            initializeFormData();
        });
        
        return {
            localFormData,
            formClasses,
            formStyles,
            formAttributes,
            formLabel,
            handleSubmit
        };
    },
    template: `
        <form
            v-bind="formAttributes"
            :class="formClasses"
            :style="formStyles"
            @submit="handleSubmit"
        >
            <legend v-if="formLabel" class="pm-form-label">
                {{ formLabel }}
            </legend>
            
            <slot></slot>
        </form>
    `
}; 