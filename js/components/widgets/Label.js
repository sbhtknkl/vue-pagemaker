// Label Widget - Displays text and headers
const Label = {
    name: 'Label',
    props: {
        widgetId: String,
        meta: Object,
        allData: Object,
        formData: Object
    },
    setup(props) {
        const { computed } = Vue;
        
        // Label text with variable interpolation
        const labelText = computed(() => {
            let text = props.meta.label || props.meta['pm::label'] || props.meta.text || '';
            
            // Handle variable interpolation {varname}
            if (text && typeof text === 'string') {
                text = text.replace(/\{([^}]+)\}/g, (match, varName) => {
                    // Look for variable in formData first, then allData
                    const value = props.formData?.[varName] || props.allData?.[varName];
                    return value !== undefined ? value : match;
                });
            }
            
            return text;
        });
        
        // Label element type (h1, h2, h3, p, span, etc.)
        const labelElement = computed(() => {
            if (props.meta.element) return props.meta.element;
            if (props.meta.type === 'header') return 'h2';
            if (props.meta.header) return `h${props.meta.header}`;
            return 'span';
        });
        
        // Label classes
        const labelClasses = computed(() => {
            const classes = ['pm-label'];
            
            if (props.meta.className) {
                classes.push(props.meta.className);
            }
            
            if (props.meta['pm::className']) {
                classes.push(props.meta['pm::className']);
            }
            
            // Type-specific classes
            if (props.meta.type === 'header') {
                classes.push('pm-label-header');
            }
            
            return classes;
        });
        
        // Label styles
        const labelStyles = computed(() => {
            const styles = {};
            
            if (props.meta.style) {
                Object.assign(styles, props.meta.style);
            }
            
            if (props.meta.color) styles.color = props.meta.color;
            if (props.meta.fontSize) styles.fontSize = props.meta.fontSize;
            if (props.meta.fontWeight) styles.fontWeight = props.meta.fontWeight;
            if (props.meta.textAlign) styles.textAlign = props.meta.textAlign;
            if (props.meta.margin) styles.margin = props.meta.margin;
            if (props.meta.padding) styles.padding = props.meta.padding;
            
            return styles;
        });
        
        return {
            labelText,
            labelElement,
            labelClasses,
            labelStyles
        };
    },
    template: `
        <component
            :is="labelElement"
            :class="labelClasses"
            :style="labelStyles"
            :id="widgetId"
        >
            {{ labelText }}
        </component>
    `
}; 