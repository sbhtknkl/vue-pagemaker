// Main PageMaker Component
const PageMaker = {
    name: 'PageMaker',
    props: {
        metadata: {
            type: Object,
            required: true
        },
        apiBaseUrl: {
            type: String,
            default: ''
        },
        httpParams: {
            type: Object,
            default: () => ({})
        }
    },
    emits: ['error', 'action', 'broadcast'],
    setup(props, { emit }) {
        const { ref, reactive, computed, watch, onMounted, provide } = Vue;
        
        // State management
        const state = reactive({
            loading: false,
            error: null,
            allData: {},
            formData: {},
            modals: {},
            broadcasts: new Map()
        });
        
        const activeModals = ref(new Set());
        
        // Provide global state to child components
        provide('pagemaker', {
            state,
            activeModals,
            emit: (event, ...args) => emit(event, ...args),
            openModal,
            closeModal,
            broadcast,
            updateData,
            getData
        });
        
        // Modal management [[memory:3783814]]
        function openModal(modalId) {
            if (state.modals[modalId]) {
                activeModals.value.add(modalId);
            }
        }
        
        function closeModal(modalId) {
            activeModals.value.delete(modalId);
        }
        
        // Communication system - broadcasts between widgets
        function broadcast(action, target, data) {
            const broadcastData = {
                action,
                target,
                data,
                timestamp: Date.now()
            };
            
            state.broadcasts.set(`${target}_${Date.now()}`, broadcastData);
            emit('broadcast', broadcastData);
        }
        
        // Data management
        function updateData(path, value, isForm = false) {
            const target = isForm ? state.formData : state.allData;
            if (path.includes('.')) {
                const keys = path.split('.');
                let current = target;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
            } else {
                target[path] = value;
            }
        }
        
        function getData(path, isForm = false) {
            const target = isForm ? state.formData : state.allData;
            if (!path) return target;
            
            if (path.includes('.')) {
                const keys = path.split('.');
                let current = target;
                for (const key of keys) {
                    if (current && typeof current === 'object') {
                        current = current[key];
                    } else {
                        return undefined;
                    }
                }
                return current;
            }
            return target[path];
        }
        
        // Parse metadata and extract modals [[memory:3786039]]
        const parsedMetadata = computed(() => {
            if (!props.metadata) return null;
            
            const result = { ...props.metadata };
            
            // Extract modals from metadata following PageMaker patterns
            const extractModals = (obj, modals = {}) => {
                if (!obj || typeof obj !== 'object') return modals;
                
                // Check for pm::Modals or Modals (uppercase properties outside pm::Meta)
                if (obj['pm::Modals'] || obj.Modals) {
                    const modalObj = obj['pm::Modals'] || obj.Modals;
                    Object.assign(modals, modalObj);
                }
                
                // Recursively check children
                Object.values(obj).forEach(value => {
                    if (typeof value === 'object' && value !== null) {
                        extractModals(value, modals);
                    }
                });
                
                return modals;
            };
            
            state.modals = extractModals(result);
            return result;
        });
        
        // Root component determination
        const rootComponent = computed(() => {
            if (!parsedMetadata.value) return null;
            
            // Handle both old and new format
            if (parsedMetadata.value.return) {
                return parsedMetadata.value.return;
            }
            
            return parsedMetadata.value;
        });
        
        // Load initial data
        onMounted(async () => {
            try {
                state.loading = true;
                
                // If there's a meta-get in httpParams, fetch initial data
                if (props.httpParams['meta-get']) {
                    const response = await ApiService.get(props.httpParams['meta-get']);
                    if (response.success) {
                        state.allData = response.return || response.data || {};
                    }
                }
                
            } catch (error) {
                state.error = error.message;
                emit('error', error);
            } finally {
                state.loading = false;
            }
        });
        
        return {
            state,
            activeModals,
            parsedMetadata,
            rootComponent,
            openModal,
            closeModal
        };
    },
    template: `
        <div class="pagemaker-root">
            <div v-if="state.loading" class="loading">
                Loading...
            </div>
            
            <div v-else-if="state.error" class="error">
                Error: {{ state.error }}
            </div>
            
            <div v-else-if="rootComponent" class="pagemaker-content">
                <widget-renderer 
                    :metadata="rootComponent"
                    :widget-id="'root'"
                    :all-data="state.allData"
                    :form-data="state.formData"
                />
            </div>
            
            <!-- Modal Overlay -->
            <div v-if="activeModals.size > 0" class="pm-modal-overlay" @click.self="closeModal([...activeModals][0])">
                <div 
                    v-for="modalId in activeModals" 
                    :key="modalId"
                    class="pm-modal"
                    :style="{
                        width: state.modals[modalId]?.width ? state.modals[modalId].width + 'px' : 'auto',
                        height: state.modals[modalId]?.height ? state.modals[modalId].height + 'px' : 'auto'
                    }"
                >
                    <div class="pm-modal-header" v-if="state.modals[modalId]?.title">
                        <h3 class="pm-modal-title">{{ state.modals[modalId].title }}</h3>
                    </div>
                    <div class="pm-modal-body">
                        <widget-renderer 
                            :metadata="state.modals[modalId]?.meta || state.modals[modalId]"
                            :widget-id="modalId"
                            :all-data="state.allData"
                            :form-data="state.formData"
                        />
                    </div>
                </div>
            </div>
        </div>
    `
}; 