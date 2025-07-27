// Button Widget - Handles clicks and PageMaker actions
const Button = {
    name: 'Button',
    props: {
        widgetId: String,
        meta: Object,
        allData: Object,
        formData: Object
    },
    setup(props) {
        const { computed, inject } = Vue;
        const pagemaker = inject('pagemaker');
        
        // Button text
        const buttonText = computed(() => {
            return props.meta.title || props.meta.label || props.meta['pm::title'] || props.meta['pm::label'] || 'Button';
        });
        
        // Button type
        const buttonType = computed(() => {
            return props.meta.buttonType || props.meta.type || 'button';
        });
        
        // Button classes
        const buttonClasses = computed(() => {
            const classes = ['pm-button'];
            
            if (props.meta.className) {
                classes.push(props.meta.className);
            }
            
            if (props.meta['pm::className']) {
                classes.push(props.meta['pm::className']);
            }
            
            // Handle special button styles
            if (props.meta.variant) {
                classes.push(`pm-button-${props.meta.variant}`);
            }
            
            return classes;
        });
        
        // Button styles
        const buttonStyles = computed(() => {
            const styles = {};
            
            if (props.meta.style) {
                Object.assign(styles, props.meta.style);
            }
            
            if (props.meta.background) {
                styles.background = props.meta.background;
            }
            
            if (props.meta.color) {
                styles.color = props.meta.color;
            }
            
            return styles;
        });
        
        // Button attributes
        const buttonAttributes = computed(() => {
            const attrs = {
                type: buttonType.value
            };
            
            if (props.meta.disabled) attrs.disabled = true;
            if (props.meta.form) attrs.form = props.meta.form;
            
            return attrs;
        });
        
        // Handle button click and execute PageMaker actions
        const handleClick = async (event) => {
            // Prevent default if needed
            if (props.meta.preventDefault !== false) {
                event.preventDefault();
            }
            
            // Execute PageMaker actions
            await executeActions();
        };
        
        // Execute actions following PageMaker action system
        const executeActions = async () => {
            const actions = props.meta.onclick || props.meta.onClick || props.meta.pmeOnClick || [];
            
            if (!Array.isArray(actions)) {
                // Single action
                await executeAction(actions);
            } else {
                // Multiple actions
                for (const action of actions) {
                    await executeAction(action);
                }
            }
        };
        
        // Execute individual action
        const executeAction = async (action) => {
            if (!action || typeof action !== 'object') return;
            
            switch (action.action) {
                case 'openModal':
                    if (action.modalId) {
                        pagemaker.openModal(action.modalId);
                    }
                    break;
                    
                case 'closeModal':
                    if (action.modalId) {
                        pagemaker.closeModal(action.modalId);
                    }
                    break;
                    
                case 'submit':
                    await handleSubmit(action);
                    break;
                    
                case 'broadcast':
                    pagemaker.broadcast(action.event || 'update', action.target, action.data);
                    break;
                    
                case 'get':
                case 'update':
                    await handleDataAction(action);
                    break;
                    
                case 'navigate':
                    if (action.url) {
                        window.location.href = action.url;
                    }
                    break;
                    
                default:
                    console.warn('Unknown action type:', action.action);
            }
        };
        
        // Handle form submission
        const handleSubmit = async (action) => {
            try {
                const formData = { ...pagemaker.state.formData };
                
                // Add additional post data
                if (action.additional_post) {
                    for (const key of action.additional_post) {
                        if (pagemaker.state.allData[key] !== undefined) {
                            formData[key] = pagemaker.state.allData[key];
                        }
                    }
                }
                
                // Submit to endpoint
                if (action.url) {
                    const response = await ApiService.post(action.url, formData);
                    
                    if (response.success) {
                        // Handle successful submission
                        if (action.onSuccess) {
                            await executeAction(action.onSuccess);
                        }
                    } else {
                        // Handle error
                        if (action.onError) {
                            await executeAction(action.onError);
                        }
                    }
                }
            } catch (error) {
                console.error('Submit error:', error);
                if (action.onError) {
                    await executeAction(action.onError);
                }
            }
        };
        
        // Handle data actions (get/update)
        const handleDataAction = async (action) => {
            try {
                if (action.url) {
                    const response = await ApiService.get(action.url);
                    
                    if (response.success) {
                        // Update data
                        const targetData = response.return || response.data;
                        if (action.target) {
                            pagemaker.updateData(action.target, targetData);
                        } else {
                            Object.assign(pagemaker.state.allData, targetData);
                        }
                        
                        // Broadcast update
                        if (action.broadcast) {
                            pagemaker.broadcast('update', action.broadcast, targetData);
                        }
                    }
                }
            } catch (error) {
                console.error('Data action error:', error);
            }
        };
        
        return {
            buttonText,
            buttonClasses,
            buttonStyles,
            buttonAttributes,
            handleClick
        };
    },
    template: `
        <button
            v-bind="buttonAttributes"
            :class="buttonClasses"
            :style="buttonStyles"
            @click="handleClick"
        >
            {{ buttonText }}
        </button>
    `
}; 