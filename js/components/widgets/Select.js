// Select Widget - Dropdown selection
const Select = {
    name: 'Select',
    props: {
        widgetId: String,
        meta: Object,
        allData: Object,
        formData: Object
    },
    emits: ['change'],
    setup(props, { emit }) {
        const { ref, computed, watch, inject, onMounted } = Vue;
        const pagemaker = inject('pagemaker');
        
        const selectedValue = ref('');
        const options = ref([]);
        
        // Initialize value
        const initializeValue = () => {
            const name = props.meta.name || props.widgetId;
            let value = '';
            
            if (props.formData && props.formData[name] !== undefined) {
                value = props.formData[name];
            } else if (props.allData && props.allData[name] !== undefined) {
                value = props.allData[name];
            } else if (props.meta.default !== undefined) {
                value = props.meta.default;
            } else if (props.meta.value !== undefined) {
                value = props.meta.value;
            }
            
            selectedValue.value = value;
        };
        
        // Load options
        const loadOptions = async () => {
            // Static options from meta
            if (props.meta.options || props.meta['pm::options']) {
                options.value = props.meta.options || props.meta['pm::options'];
                return;
            }
            
            // Dynamic options from API
            if (props.meta.optionsUrl || props.meta['options-get']) {
                try {
                    const url = props.meta.optionsUrl || props.meta['options-get'];
                    const response = await ApiService.get(url);
                    
                    if (response.success) {
                        const data = response.return || response.data || [];
                        
                        // Apply options mapping if specified
                        if (props.meta.optionsMapping) {
                            options.value = data.map(item => ({
                                key: item[props.meta.optionsMapping.key],
                                label: item[props.meta.optionsMapping.label],
                                value: item[props.meta.optionsMapping.value] || item[props.meta.optionsMapping.key]
                            }));
                        } else {
                            options.value = data;
                        }
                    }
                } catch (error) {
                    console.error('Error loading select options:', error);
                    options.value = [];
                }
            }
        };
        
        // Watch for data changes
        watch([() => props.formData, () => props.allData], () => {
            initializeValue();
        }, { deep: true });
        
        // Select classes
        const selectClasses = computed(() => {
            const classes = ['pm-select'];
            
            if (props.meta.className) {
                classes.push(props.meta.className);
            }
            
            return classes;
        });
        
        // Select attributes
        const selectAttributes = computed(() => {
            const attrs = {
                id: props.widgetId,
                name: props.meta.name || props.widgetId
            };
            
            if (props.meta.required) attrs.required = true;
            if (props.meta.disabled) attrs.disabled = true;
            if (props.meta.multiple) attrs.multiple = true;
            
            return attrs;
        });
        
        // Select label
        const selectLabel = computed(() => {
            return props.meta.label || props.meta['pm::label'] || null;
        });
        
        // Handle selection change
        const handleChange = (event) => {
            const value = event.target.value;
            selectedValue.value = value;
            
            // Update data in PageMaker
            const name = props.meta.name || props.widgetId;
            pagemaker.updateData(name, value, true);
            
            emit('change', { value });
        };
        
        // Initialize on mount
        onMounted(async () => {
            await loadOptions();
            initializeValue();
        });
        
        return {
            selectedValue,
            options,
            selectClasses,
            selectAttributes,
            selectLabel,
            handleChange
        };
    },
    template: `
        <div class="pm-select-wrapper">
            <label v-if="selectLabel" :for="widgetId" class="pm-label">
                {{ selectLabel }}
                <span v-if="meta.required" class="pm-required">*</span>
            </label>
            
            <select
                v-bind="selectAttributes"
                :class="selectClasses"
                :value="selectedValue"
                @change="handleChange"
            >
                <option v-if="meta.placeholder" value="">{{ meta.placeholder }}</option>
                <option
                    v-for="option in options"
                    :key="option.key || option.value"
                    :value="option.key || option.value"
                >
                    {{ option.label || option.text }}
                </option>
            </select>
        </div>
    `
}; 