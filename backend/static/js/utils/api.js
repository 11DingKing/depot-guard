/**
 * API请求模块
 * 封装所有与后端的通信
 */

const API = {
    baseURL: '/api',
    
    getToken() {
        return localStorage.getItem('token');
    },
    
    setToken(token) {
        localStorage.setItem('token', token);
    },
    
    clearToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    async request(url, options = {}) {
        const token = this.getToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };
        
        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }
        
        // FormData不需要Content-Type
        if (config.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        try {
            const response = await fetch(`${this.baseURL}${url}`, config);
            const data = await response.json();
            
            if (response.status === 401) {
                this.clearToken();
                window.location.href = '/login/';
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    },
    
    get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.request(fullUrl, { method: 'GET' });
    },
    
    post(url, data = {}) {
        const isFormData = data instanceof FormData;
        return this.request(url, {
            method: 'POST',
            body: isFormData ? data : data,
        });
    },
    
    put(url, data = {}) {
        const isFormData = data instanceof FormData;
        return this.request(url, {
            method: 'PUT',
            body: isFormData ? data : data,
        });
    },
    
    delete(url) {
        return this.request(url, { method: 'DELETE' });
    },
    
    // ==================== 认证相关 ====================
    
    login(username, password) {
        return this.post('/auth/login/', { username, password });
    },
    
    logout() {
        return this.post('/auth/logout/');
    },
    
    getUserInfo() {
        return this.get('/auth/user/');
    },
    
    // ==================== 用户管理（考勤人员） ====================
    
    getUsers(params = {}) {
        return this.get('/auth/users/', params);
    },
    
    createUser(data) {
        return this.post('/auth/users/', data);
    },
    
    updateUser(id, data) {
        return this.put(`/auth/users/${id}/`, data);
    },
    
    deleteUser(id) {
        return this.delete(`/auth/users/${id}/`);
    },
    
    // ==================== 出库人员管理 ====================
    
    getStockOutPersons(params = {}) {
        return this.get('/stock-out-persons/', params);
    },
    
    createStockOutPerson(data) {
        return this.post('/stock-out-persons/', data);
    },
    
    updateStockOutPerson(id, data) {
        return this.put(`/stock-out-persons/${id}/`, data);
    },
    
    deleteStockOutPerson(id) {
        return this.delete(`/stock-out-persons/${id}/`);
    },
    
    getAdminUsers() {
        return this.get('/admin-users/');
    },
    
    // ==================== 单位管理 ====================
    
    getUnits(params = {}) {
        return this.get('/units/', params);
    },
    
    getAllUnits() {
        return this.get('/units/all/');
    },
    
    createUnit(data) {
        return this.post('/units/', data);
    },
    
    updateUnit(id, data) {
        return this.put(`/units/${id}/`, data);
    },
    
    deleteUnit(id) {
        return this.delete(`/units/${id}/`);
    },
    
    batchDeleteUnits(ids) {
        return this.post('/units/batch-delete/', { ids });
    },
    
    // ==================== 品类管理 ====================
    
    getCategories(params = {}) {
        return this.get('/categories/', params);
    },
    
    getAllCategories() {
        return this.get('/categories/all/');
    },
    
    createCategory(data) {
        return this.post('/categories/', data);
    },
    
    updateCategory(id, data) {
        return this.put(`/categories/${id}/`, data);
    },
    
    deleteCategory(id) {
        return this.delete(`/categories/${id}/`);
    },
    
    batchDeleteCategories(ids) {
        return this.post('/categories/batch-delete/', { ids });
    },
    
    // ==================== 品种管理 ====================
    
    getVarieties(params = {}) {
        return this.get('/varieties/', params);
    },
    
    createVariety(data) {
        return this.post('/varieties/', data);
    },
    
    updateVariety(id, data) {
        return this.put(`/varieties/${id}/`, data);
    },
    
    deleteVariety(id) {
        return this.delete(`/varieties/${id}/`);
    },
    
    batchDeleteVarieties(ids) {
        return this.post('/varieties/batch-delete/', { ids });
    },
    
    downloadVarietyTemplate() {
        const token = this.getToken();
        window.open(`${this.baseURL}/varieties/template/?token=${token}`, '_blank');
    },
    
    previewVarietyImport(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('preview', 'true');
        return this.post('/varieties/import/', formData);
    },
    
    importVarieties(file) {
        const formData = new FormData();
        formData.append('file', file);
        return this.post('/varieties/import/', formData);
    },
    
    // ==================== 仪表盘 ====================
    
    getDashboard() {
        return this.get('/dashboard/');
    },
    
    // ==================== 货物管理 ====================
    
    getGoods(params = {}) {
        return this.get('/goods/', params);
    },
    
    // ==================== 入库管理 ====================
    
    getStockIns(params = {}) {
        return this.get('/stock-in/', params);
    },
    
    // ==================== 出库管理 ====================
    
    getStockOuts(params = {}) {
        return this.get('/stock-out/', params);
    },
    
    // ==================== 预警管理 ====================
    
    getWarnings(params = {}) {
        return this.get('/warnings/', params);
    },
    
    // ==================== 审批管理 ====================
    
    getApprovals(params = {}) {
        return this.get('/approvals/', params);
    },
};

window.API = API;
