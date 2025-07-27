// Grid Widget - Displays tabular data [[memory:3784291]]
const Grid = {
    name: 'Grid',
    props: {
        widgetId: String,
        meta: Object,
        allData: Object,
        formData: Object,
        children: Object
    },
    setup(props) {
        const { ref, computed, onMounted, inject } = Vue;
        const pagemaker = inject('pagemaker');
        
        const gridData = ref([]);
        const loading = ref(false);
        const error = ref(null);
        
        // Grid columns from children metadata
        const columns = computed(() => {
            if (!props.children) return [];
            
            return Object.keys(props.children).map(key => {
                const child = props.children[key];
                return {
                    id: key,
                    field: child.field || key,
                    label: child.label || child['pm::label'] || key,
                    type: child.type || child['pm::type'] || 'text',
                    width: child.width,
                    editable: child.editable || false,
                    hidden: child.hidden || false,
                    meta: child
                };
            });
        });
        
        // Grid classes
        const gridClasses = computed(() => {
            const classes = ['pm-grid'];
            
            if (props.meta.className) {
                classes.push(props.meta.className);
            }
            
            if (props.meta['pm::className']) {
                classes.push(props.meta['pm::className']);
            }
            
            return classes;
        });
        
        // Grid styles
        const gridStyles = computed(() => {
            const styles = {};
            
            if (props.meta.style) {
                Object.assign(styles, props.meta.style);
            }
            
            if (props.meta.height) styles.height = props.meta.height;
            if (props.meta.width) styles.width = props.meta.width;
            
            return styles;
        });
        
        // Load grid data
        const loadGridData = async () => {
            loading.value = true;
            error.value = null;
            
            try {
                const dataGet = props.meta['data-get'] || props.meta['pm::dataGet'];
                
                if (dataGet) {
                    let url = dataGet;
                    let params = {};
                    
                    if (typeof dataGet === 'object') {
                        url = dataGet.url;
                        params = dataGet.params || {};
                    }
                    
                    const response = await ApiService.get(url, params);
                    
                    if (response.success) {
                        const data = response.return || response.data || [];
                        gridData.value = Array.isArray(data) ? data : [];
                    } else {
                        error.value = 'Failed to load grid data';
                    }
                } else {
                    // Use static data from allData or formData
                    const dataSource = props.meta.dataSource || props.widgetId;
                    const sourceData = props.allData[dataSource] || props.formData[dataSource] || [];
                    gridData.value = Array.isArray(sourceData) ? sourceData : [];
                }
            } catch (err) {
                error.value = err.message;
                console.error('Error loading grid data:', err);
            } finally {
                loading.value = false;
            }
        };
        
        // Format cell value based on column type
        const formatCellValue = (value, column) => {
            if (value === null || value === undefined) return '';
            
            switch (column.type) {
                case 'date':
                    try {
                        return new Date(value).toLocaleDateString();
                    } catch {
                        return value;
                    }
                case 'currency':
                    try {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        }).format(value);
                    } catch {
                        return value;
                    }
                case 'number':
                    try {
                        return parseFloat(value).toLocaleString();
                    } catch {
                        return value;
                    }
                default:
                    return value.toString();
            }
        };
        
        // Get cell value from row data
        const getCellValue = (row, column) => {
            const field = column.field;
            
            if (field.includes('.')) {
                // Handle nested properties
                const keys = field.split('.');
                let value = row;
                for (const key of keys) {
                    if (value && typeof value === 'object') {
                        value = value[key];
                    } else {
                        return '';
                    }
                }
                return value;
            }
            
            return row[field];
        };
        
        // Handle cell edit (if editable)
        const handleCellEdit = (rowIndex, columnId, newValue) => {
            const column = columns.value.find(col => col.id === columnId);
            if (column && column.editable) {
                const row = gridData.value[rowIndex];
                if (row) {
                    row[column.field] = newValue;
                    
                    // Broadcast update
                    pagemaker.broadcast('gridCellUpdate', props.widgetId, {
                        rowIndex,
                        field: column.field,
                        value: newValue,
                        row
                    });
                }
            }
        };
        
        // Handle row selection
        const handleRowSelect = (row, rowIndex) => {
            pagemaker.broadcast('gridRowSelect', props.widgetId, {
                row,
                rowIndex
            });
        };
        
        // Initialize on mount
        onMounted(() => {
            loadGridData();
        });
        
        return {
            gridData,
            loading,
            error,
            columns,
            gridClasses,
            gridStyles,
            formatCellValue,
            getCellValue,
            handleCellEdit,
            handleRowSelect,
            loadGridData
        };
    },
    template: `
        <div :class="gridClasses" :style="gridStyles">
            <div v-if="loading" class="pm-grid-loading">
                Loading grid data...
            </div>
            
            <div v-else-if="error" class="pm-grid-error">
                Error: {{ error }}
                <button @click="loadGridData" class="pm-button pm-button-sm">Retry</button>
            </div>
            
            <div v-else-if="gridData.length === 0" class="pm-grid-empty">
                No data available
            </div>
            
            <table v-else class="pm-grid-table">
                <thead class="pm-grid-header">
                    <tr>
                        <th
                            v-for="column in columns"
                            :key="column.id"
                            v-show="!column.hidden"
                            :style="{ width: column.width }"
                            class="pm-grid-header-cell"
                        >
                            {{ column.label }}
                        </th>
                    </tr>
                </thead>
                <tbody class="pm-grid-body">
                    <tr
                        v-for="(row, rowIndex) in gridData"
                        :key="rowIndex"
                        class="pm-grid-row"
                        @click="handleRowSelect(row, rowIndex)"
                    >
                        <td
                            v-for="column in columns"
                            :key="column.id"
                            v-show="!column.hidden"
                            class="pm-grid-cell"
                            :class="{ 'pm-grid-cell-editable': column.editable }"
                        >
                            <input
                                v-if="column.editable"
                                :value="getCellValue(row, column)"
                                @change="handleCellEdit(rowIndex, column.id, $event.target.value)"
                                class="pm-grid-input"
                            />
                            <span v-else>
                                {{ formatCellValue(getCellValue(row, column), column) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}; 