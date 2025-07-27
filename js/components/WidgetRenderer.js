// Widget Renderer - Handles dynamic widget loading and rendering
const WidgetRenderer = {
    name: 'WidgetRenderer',
    props: {
        metadata: {
            type: Object,
            required: true
        },
        widgetId: {
            type: String,
            required: true
        },
        allData: {
            type: Object,
            default: () => ({})
        },
        formData: {
            type: Object,
            default: () => ({})
        }
    },
    setup(props) {
        const { computed, inject } = Vue;
        const pagemaker = inject('pagemaker');
        
        // Widget type mapping following PageMaker patterns [[memory:3786039]]
        const widgetTypeMap = {
            'container': 'Container',
            'form': 'Form',
            'input': 'Input',
            'string': 'Input', // alias
            'email': 'Input',
            'password': 'Input',
            'button': 'Button',
            'label': 'Label',
            'select': 'Select',
            'grid_agura': 'Grid', // [[memory:3784291]]
            'grid': 'Grid',
            'tabs': 'Tabs',
            'tab': 'Tab',
            'card': 'Card',
            'flexbox': 'Container',
            'header': 'Label',
            'phone': 'Input',
            'checkbox': 'Checkbox',
            'radio': 'Radio'
        };
        
        // Parse widget metadata following PageMaker structure
        const parsedWidget = computed(() => {
            if (!props.metadata) return null;
            
            const meta = { ...props.metadata };
            let widgetType = null;
            let widgetMeta = {};
            let children = {};
            
            // Handle new format with pm::Type and pm::Meta [[memory:3786039]]
            if (meta['pm::Type'] || meta['@type']) {
                widgetType = meta['pm::Type'] || meta['@type'];
                
                // Extract meta properties (regular properties inside pm::Meta)
                if (meta['pm::Meta'] || meta['@meta']) {
                    widgetMeta = { ...meta['pm::Meta'] || meta['@meta'] };
                }
                
                // Extract children (everything else except uppercase special properties)
                Object.keys(meta).forEach(key => {
                    if (!key.startsWith('pm::') && !key.startsWith('@') && 
                        !['Type', 'Meta', 'Modals', 'Childs'].includes(key)) {
                        children[key] = meta[key];
                    }
                });
            }
            // Handle old format with type and childs
            else if (meta.type) {
                widgetType = meta.type;
                widgetMeta = { ...meta };
                delete widgetMeta.type;
                delete widgetMeta.childs;
                
                if (meta.childs) {
                    children = meta.childs;
                }
            }
            
            return {
                type: widgetType,
                meta: widgetMeta,
                children: children
            };
        });
        
        // Get component name for dynamic loading
        const componentName = computed(() => {
            if (!parsedWidget.value?.type) return null;
            
            const type = parsedWidget.value.type.toLowerCase();
            return widgetTypeMap[type] || 'Container'; // Default to Container
        });
        
        // Check if widget has children
        const hasChildren = computed(() => {
            return parsedWidget.value?.children && 
                   Object.keys(parsedWidget.value.children).length > 0;
        });
        
        // Get widget properties
        const widgetProps = computed(() => {
            return {
                widgetId: props.widgetId,
                meta: parsedWidget.value?.meta || {},
                allData: props.allData,
                formData: props.formData,
                children: parsedWidget.value?.children || {}
            };
        });
        
        return {
            parsedWidget,
            componentName,
            hasChildren,
            widgetProps
        };
    },
    template: `
        <component 
            v-if="componentName && parsedWidget"
            :is="componentName"
            v-bind="widgetProps"
        >
            <!-- Render children recursively -->
            <template v-if="hasChildren">
                <widget-renderer
                    v-for="(childMeta, childId) in parsedWidget.children"
                    :key="childId"
                    :metadata="childMeta"
                    :widget-id="childId"
                    :all-data="allData"
                    :form-data="formData"
                />
            </template>
        </component>
    `
}; 