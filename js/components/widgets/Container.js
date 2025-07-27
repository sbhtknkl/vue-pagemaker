// Container Widget - Most common widget, acts as wrapping div
const Container = {
    name: 'Container',
    props: {
        widgetId: String,
        meta: Object,
        allData: Object,
        formData: Object,
        children: Object
    },
    setup(props, { slots }) {
        const { computed, inject } = Vue;
        const pagemaker = inject('pagemaker');
        
        // Container styles based on meta properties
        const containerStyles = computed(() => {
            const styles = {};
            
            if (props.meta.style) {
                Object.assign(styles, props.meta.style);
            }
            
            if (props.meta.width) styles.width = props.meta.width;
            if (props.meta.height) styles.height = props.meta.height;
            if (props.meta.margin) styles.margin = props.meta.margin;
            if (props.meta.padding) styles.padding = props.meta.padding;
            if (props.meta.display) styles.display = props.meta.display;
            if (props.meta.flexDirection) styles.flexDirection = props.meta.flexDirection;
            if (props.meta.justifyContent) styles.justifyContent = props.meta.justifyContent;
            if (props.meta.alignItems) styles.alignItems = props.meta.alignItems;
            if (props.meta.gap) styles.gap = props.meta.gap;
            if (props.meta.overflow) styles.overflow = props.meta.overflow;
            
            return styles;
        });
        
        // Container classes
        const containerClasses = computed(() => {
            const classes = ['pm-container'];
            
            if (props.meta.className) {
                classes.push(props.meta.className);
            }
            
            if (props.meta['pm::className']) {
                classes.push(props.meta['pm::className']);
            }
            
            // Grid system support
            if (props.meta.spanX) {
                classes.push(`span-x-${props.meta.spanX}`);
            }
            if (props.meta.spanY) {
                classes.push(`span-y-${props.meta.spanY}`);
            }
            
            return classes;
        });
        
        // Handle container label
        const containerLabel = computed(() => {
            return props.meta.label || props.meta['pm::label'] || null;
        });
        
        return {
            containerStyles,
            containerClasses,
            containerLabel
        };
    },
    template: `
        <div 
            :class="containerClasses"
            :style="containerStyles"
            :id="widgetId"
        >
            <label v-if="containerLabel" class="pm-container-label">
                {{ containerLabel }}
            </label>
            <slot></slot>
        </div>
    `
}; 