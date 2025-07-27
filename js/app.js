// Main Vue Application - PageMaker Engine
const { createApp } = Vue;

// Demo metadata for testing
const demoMetadata = {
    success: true,
    return: {
        main_container: {
            'pm::Type': 'container',
            'pm::Meta': {
                'pm::className': 'demo-page',
                margin: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            },
            
            // Demo modals [[memory:3783814]]
            'pm::Modals': {
                demoModal: {
                    'pm::title': 'Demo Modal',
                    'pm::width': 500,
                    'pm::height': 400,
                    'pm::meta': {
                        'pm::Type': 'form',
                        'pm::Meta': {
                            padding: '20px'
                        },
                        demo_input: {
                            'pm::type': 'input',
                            label: 'Enter something:',
                            placeholder: 'Type here...'
                        },
                        demo_button: {
                            'pm::type': 'button',
                            'pm::title': 'Close Modal',
                            onclick: [{
                                action: 'closeModal',
                                modalId: 'demoModal'
                            }]
                        }
                    }
                }
            },
            
            // Page header
            page_header: {
                'pm::type': 'label',
                element: 'h1',
                label: 'Vue PageMaker Demo',
                'pm::className': 'page-title'
            },
            
            // Demo form
            demo_form: {
                'pm::Type': 'form',
                'pm::Meta': {
                    label: 'Demo Form',
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                },
                
                name_input: {
                    'pm::type': 'input',
                    label: 'Name:',
                    name: 'name',
                    placeholder: 'Enter your name',
                    required: true,
                    validation: [
                        { type: 'required', message: 'Name is required' }
                    ]
                },
                
                email_input: {
                    'pm::type': 'email',
                    label: 'Email:',
                    name: 'email',
                    placeholder: 'Enter your email',
                    required: true,
                    validation: [
                        { type: 'required', message: 'Email is required' },
                        { type: 'email', message: 'Invalid email format' }
                    ]
                },
                
                status_select: {
                    'pm::type': 'select',
                    label: 'Status:',
                    name: 'status',
                    default: 'active',
                    options: [
                        { key: 'active', label: 'Active' },
                        { key: 'inactive', label: 'Inactive' },
                        { key: 'pending', label: 'Pending' }
                    ]
                },
                
                form_actions: {
                    'pm::Type': 'container',
                    'pm::Meta': {
                        display: 'flex',
                        gap: '10px',
                        marginTop: '15px'
                    },
                    
                    submit_btn: {
                        'pm::type': 'button',
                        'pm::title': 'Submit Form',
                        onclick: [{
                            action: 'submit',
                            url: '/api/demo-submit'
                        }]
                    },
                    
                    modal_btn: {
                        'pm::type': 'button',
                        'pm::title': 'Open Modal',
                        'pm::className': 'secondary',
                        onclick: [{
                            action: 'openModal',
                            modalId: 'demoModal'
                        }]
                    }
                }
            },
            
            // Demo grid
            demo_grid: {
                'pm::Type': 'grid_agura', // [[memory:3784291]]
                'pm::Meta': {
                    label: 'Demo Grid',
                    height: '300px',
                    margin: '20px 0'
                },
                
                // Grid columns
                id: {
                    label: 'ID',
                    field: 'id',
                    type: 'number',
                    width: '80px'
                },
                name: {
                    label: 'Name',
                    field: 'name',
                    type: 'text'
                },
                email: {
                    label: 'Email',
                    field: 'email',
                    type: 'text'
                },
                status: {
                    label: 'Status',
                    field: 'status',
                    type: 'text'
                },
                created_date: {
                    label: 'Created',
                    field: 'created_date',
                    type: 'date'
                }
            }
        }
    }
};

// Demo grid data
const demoGridData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', created_date: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending', created_date: '2024-01-16' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', created_date: '2024-01-17' }
];

// Create Vue application
const app = createApp({
    setup() {
        const { ref, onMounted } = Vue;
        
        const loading = ref(false);
        const error = ref(null);
        const pageMetadata = ref(null);
        const apiBaseUrl = ref('');
        
        // Initialize services
        const initializeServices = async () => {
            try {
                // Initialize API service
                ApiService.init(apiBaseUrl.value);
                
                // Initialize metadata service
                await MetadataService.init();
                
                console.log('Services initialized successfully');
            } catch (err) {
                console.error('Failed to initialize services:', err);
                error.value = 'Failed to initialize PageMaker services';
            }
        };
        
        // Load demo data
        const loadDemoData = () => {
            // Set demo metadata
            pageMetadata.value = demoMetadata;
            
            // Mock grid data in allData
            // In real implementation, this would come from API calls
            console.log('Demo data loaded');
        };
        
        // Handle PageMaker errors
        const handleError = (err) => {
            console.error('PageMaker Error:', err);
            error.value = err.message || 'An error occurred in PageMaker';
        };
        
        // Initialize on mount
        onMounted(async () => {
            loading.value = true;
            
            try {
                await initializeServices();
                loadDemoData();
            } catch (err) {
                handleError(err);
            } finally {
                loading.value = false;
            }
        });
        
        return {
            loading,
            error,
            pageMetadata,
            apiBaseUrl,
            handleError
        };
    }
});

// Register all components globally
app.component('PageMaker', PageMaker);
app.component('WidgetRenderer', WidgetRenderer);
app.component('Container', Container);
app.component('Input', Input);
app.component('Button', Button);
app.component('Form', Form);
app.component('Label', Label);
app.component('Select', Select);
app.component('Grid', Grid);

// Mount the application
app.mount('#app');

console.log('Vue PageMaker application started'); 