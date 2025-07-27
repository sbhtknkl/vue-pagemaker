// Input Widget - Handles various input types
const Input = {
    name: 'Input',
    props: {
        widgetId: String,
        meta: Object,
        allData: Object,
        formData: Object
    },
    emits: ['update:modelValue', 'change'],
    setup(props, { emit }) {
        const { ref, computed, watch, inject } = Vue;
        const pagemaker = inject('pagemaker');
        
        // Input value management
        const inputValue = ref('');
        
        // Initialize value
        const initializeValue = () => {
            const name = props.meta.name || props.widgetId;
            let value = '';
            
            // Get value from formData or allData
            if (props.formData && props.formData[name] !== undefined) {
                value = props.formData[name];
            } else if (props.allData && props.allData[name] !== undefined) {
                value = props.allData[name];
            } else if (props.meta.default !== undefined) {
                value = props.meta.default;
            } else if (props.meta.value !== undefined) {
                value = props.meta.value;
            }
            
            inputValue.value = value;
        };
        
        // Initialize on mount
        initializeValue();
        
        // Watch for external data changes
        watch([() => props.formData, () => props.allData], () => {
            initializeValue();
        }, { deep: true });
        
        // Input type determination
        const inputType = computed(() => {
            const metaType = props.meta.type || props.meta['pm::type'] || 'text';
            
            switch (metaType.toLowerCase()) {
                case 'email':
                    return 'email';
                case 'password':
                    return 'password';
                case 'phone':
                    return 'tel';
                case 'number':
                case 'currency':
                    return 'number';
                case 'date':
                    return 'date';
                case 'time':
                    return 'time';
                case 'datetime':
                    return 'datetime-local';
                default:
                    return 'text';
            }
        });
        
        // Input attributes
        const inputAttributes = computed(() => {
            const attrs = {
                id: props.widgetId,
                name: props.meta.name || props.widgetId,
                type: inputType.value
            };
            
            if (props.meta.placeholder) attrs.placeholder = props.meta.placeholder;
            if (props.meta.required) attrs.required = true;
            if (props.meta.readonly) attrs.readonly = true;
            if (props.meta.disabled) attrs.disabled = true;
            if (props.meta.maxLength) attrs.maxlength = props.meta.maxLength;
            if (props.meta.minLength) attrs.minlength = props.meta.minLength;
            if (props.meta.min) attrs.min = props.meta.min;
            if (props.meta.max) attrs.max = props.meta.max;
            if (props.meta.step) attrs.step = props.meta.step;
            if (props.meta.pattern) attrs.pattern = props.meta.pattern;
            if (props.meta.autocomplete) attrs.autocomplete = props.meta.autocomplete;
            
            // Special handling for numbersOnly
            if (props.meta.numbersOnly) {
                attrs.inputmode = 'numeric';
                attrs.pattern = '[0-9]*';
            }
            
            return attrs;
        });
        
        // Input classes
        const inputClasses = computed(() => {
            const classes = ['pm-input'];
            
            if (props.meta.className) {
                classes.push(props.meta.className);
            }
            
            if (props.meta.validation && !isValid.value) {
                classes.push('pm-input-invalid');
            }
            
            return classes;
        });
        
        // Input label
        const inputLabel = computed(() => {
            return props.meta.label || props.meta['pm::label'] || null;
        });
        
        // Validation
        const validationRules = computed(() => {
            return props.meta.validation || [];
        });
        
        const validationErrors = ref([]);
        
        const isValid = computed(() => {
            return validationErrors.value.length === 0;
        });
        
        // Validate input
        const validateInput = (value) => {
            validationErrors.value = [];
            
            for (const rule of validationRules.value) {
                switch (rule.type) {
                    case 'required':
                        if (!value || value.toString().trim() === '') {
                            validationErrors.value.push(rule.message || 'This field is required');
                        }
                        break;
                    case 'email':
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (value && !emailRegex.test(value)) {
                            validationErrors.value.push(rule.message || 'Invalid email format');
                        }
                        break;
                    case 'minLength':
                        if (value && value.length < rule.value) {
                            validationErrors.value.push(rule.message || `Minimum length is ${rule.value}`);
                        }
                        break;
                    case 'maxLength':
                        if (value && value.length > rule.value) {
                            validationErrors.value.push(rule.message || `Maximum length is ${rule.value}`);
                        }
                        break;
                    case 'min':
                        if (value && parseFloat(value) < rule.value) {
                            validationErrors.value.push(rule.message || `Minimum value is ${rule.value}`);
                        }
                        break;
                    case 'max':
                        if (value && parseFloat(value) > rule.value) {
                            validationErrors.value.push(rule.message || `Maximum value is ${rule.value}`);
                        }
                        break;
                }
            }
            
            return validationErrors.value.length === 0;
        };
        
        // Handle input change
        const handleInput = (event) => {
            const value = event.target.value;
            inputValue.value = value;
            
            // Update data in PageMaker
            const name = props.meta.name || props.widgetId;
            pagemaker.updateData(name, value, true); // Update in formData
            
            // Validate
            validateInput(value);
            
            emit('change', { value, valid: isValid.value, errors: validationErrors.value });
        };
        
        return {
            inputValue,
            inputType,
            inputAttributes,
            inputClasses,
            inputLabel,
            validationErrors,
            isValid,
            handleInput
        };
    },
    template: `
        <div class="pm-input-wrapper">
            <label v-if="inputLabel" :for="widgetId" class="pm-label">
                {{ inputLabel }}
                <span v-if="meta.required" class="pm-required">*</span>
            </label>
            
            <input
                v-bind="inputAttributes"
                :class="inputClasses"
                :value="inputValue"
                @input="handleInput"
            />
            
            <div v-if="validationErrors.length > 0" class="pm-input-errors">
                <div v-for="error in validationErrors" :key="error" class="pm-input-error">
                    {{ error }}
                </div>
            </div>
        </div>
    `
}; 