// API Service - Handles HTTP requests following PageMaker patterns
const ApiService = {
    baseUrl: '',
    
    // Initialize with base URL
    init(baseUrl = '') {
        this.baseUrl = baseUrl;
        
        // Configure axios defaults
        axios.defaults.timeout = 30000;
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        
        // Add response interceptor to handle PageMaker response format
        axios.interceptors.response.use(
            response => {
                // PageMaker expects success:true and return:{} structure
                if (response.data && typeof response.data === 'object') {
                    return response.data;
                }
                return response;
            },
            error => {
                console.error('API Error:', error);
                
                // Return PageMaker-style error response
                return {
                    success: false,
                    error: error.message || 'Request failed',
                    return: null
                };
            }
        );
    },
    
    // Build full URL
    buildUrl(endpoint) {
        if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
            return endpoint;
        }
        
        const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${base}${path}`;
    },
    
    // GET request
    async get(endpoint, params = {}) {
        try {
            const url = this.buildUrl(endpoint);
            const config = {
                params: params
            };
            
            console.log('API GET:', url, params);
            const response = await axios.get(url, config);
            
            // Ensure PageMaker format
            if (response && typeof response === 'object') {
                if (response.success === undefined) {
                    return {
                        success: true,
                        return: response.data || response,
                        data: response.data || response
                    };
                }
                return response;
            }
            
            return {
                success: true,
                return: response,
                data: response
            };
        } catch (error) {
            console.error('GET Error:', error);
            return {
                success: false,
                error: error.message || 'GET request failed',
                return: null
            };
        }
    },
    
    // POST request
    async post(endpoint, data = {}) {
        try {
            const url = this.buildUrl(endpoint);
            
            console.log('API POST:', url, data);
            const response = await axios.post(url, data);
            
            // Ensure PageMaker format
            if (response && typeof response === 'object') {
                if (response.success === undefined) {
                    return {
                        success: true,
                        return: response.data || response,
                        data: response.data || response
                    };
                }
                return response;
            }
            
            return {
                success: true,
                return: response,
                data: response
            };
        } catch (error) {
            console.error('POST Error:', error);
            return {
                success: false,
                error: error.message || 'POST request failed',
                return: null
            };
        }
    },
    
    // PUT request
    async put(endpoint, data = {}) {
        try {
            const url = this.buildUrl(endpoint);
            
            console.log('API PUT:', url, data);
            const response = await axios.put(url, data);
            
            return this.normalizeResponse(response);
        } catch (error) {
            console.error('PUT Error:', error);
            return {
                success: false,
                error: error.message || 'PUT request failed',
                return: null
            };
        }
    },
    
    // DELETE request
    async delete(endpoint) {
        try {
            const url = this.buildUrl(endpoint);
            
            console.log('API DELETE:', url);
            const response = await axios.delete(url);
            
            return this.normalizeResponse(response);
        } catch (error) {
            console.error('DELETE Error:', error);
            return {
                success: false,
                error: error.message || 'DELETE request failed',
                return: null
            };
        }
    },
    
    // Normalize response to PageMaker format
    normalizeResponse(response) {
        if (response && typeof response === 'object') {
            if (response.success === undefined) {
                return {
                    success: true,
                    return: response.data || response,
                    data: response.data || response
                };
            }
            return response;
        }
        
        return {
            success: true,
            return: response,
            data: response
        };
    },
    
    // Upload file
    async uploadFile(endpoint, file, additionalData = {}) {
        try {
            const url = this.buildUrl(endpoint);
            const formData = new FormData();
            
            formData.append('file', file);
            
            // Add additional data
            Object.keys(additionalData).forEach(key => {
                formData.append(key, additionalData[key]);
            });
            
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            return this.normalizeResponse(response);
        } catch (error) {
            console.error('Upload Error:', error);
            return {
                success: false,
                error: error.message || 'File upload failed',
                return: null
            };
        }
    }
}; 