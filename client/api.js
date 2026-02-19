// API configuration and functions
const API_BASE_URL = 'http://localhost:5000/api';

class Api {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('token');
    }

    // Helper method to make API requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Set up headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add authorization header if token exists
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        // Set up request options
        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Save token and user info
        this.token = data.token;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data;
    }

    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async verifyToken() {
        return await this.request('/auth/verify');
    }

    // Asset methods
    async getAssets(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/assets?${queryString}` : '/assets';
        return await this.request(endpoint);
    }

    async getAsset(id) {
        return await this.request(`/assets/${id}`);
    }

    async createAsset(assetData) {
        return await this.request('/assets', {
            method: 'POST',
            body: JSON.stringify(assetData)
        });
    }

    async updateAsset(id, assetData) {
        return await this.request(`/assets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(assetData)
        });
    }

    async deleteAsset(id) {
        return await this.request(`/assets/${id}`, {
            method: 'DELETE'
        });
    }

    async assignAsset(assetId, userId) {
        return await this.request(`/assets/${assetId}/assign`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    async unassignAsset(assetId) {
        return await this.request(`/assets/${assetId}/unassign`, {
            method: 'POST'
        });
    }

    // User methods
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/users?${queryString}` : '/users';
        return await this.request(endpoint);
    }

    async getUser(id) {
        return await this.request(`/users/${id}`);
    }

    async createUser(userData) {
        return await this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(id, userData) {
        return await this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(id) {
        return await this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    // Report methods
    async getAssetReport() {
        return await this.request('/reports/assets');
    }

    async getUserReport() {
        return await this.request('/reports/users');
    }

    async getMaintenanceReport() {
        return await this.request('/reports/maintenance');
    }

    // Logout method
    logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

// Create and export API instance
const api = new Api();
window.api = api;