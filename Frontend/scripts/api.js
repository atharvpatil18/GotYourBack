import { API_CONFIG, HTTP_METHODS } from './utils/api-config.js';

// Helper function to handle API responses
async function handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
}

// Helper function to make API requests
async function makeRequest(endpoint, method = HTTP_METHODS.GET, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const config = {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
    return handleResponse(response);
}

// API functions
export const api = {
    // Auth endpoints
    signup: (userData) => makeRequest(API_CONFIG.ENDPOINTS.SIGNUP, HTTP_METHODS.POST, userData),

    login: async (credentials) => {
        const data = await makeRequest(API_CONFIG.ENDPOINTS.LOGIN, HTTP_METHODS.POST, credentials);
        if (data.id) {
            localStorage.setItem('user', JSON.stringify({
                id: data.id,
                name: data.name,
                email: data.email
            }));
        }
        return data;
    },

    // Items endpoints
    getItems: (queryString = '') => makeRequest(API_CONFIG.ENDPOINTS.ITEMS + queryString),

    getItemById: (itemId) => makeRequest(`${API_CONFIG.ENDPOINTS.ITEMS}/${itemId}`),

    createItem: async (itemData) => {
        const userStr = localStorage.getItem('user');
        let user;
        try {
            user = JSON.parse(userStr);
            if (!user || !user.id) throw new Error();
        } catch (e) {
            throw new Error('User not logged in');
        }

        // Validate required fields
        if (!itemData.name || !itemData.description || !itemData.category || !itemData.type) {
            throw new Error('All fields are required');
        }

        // Additional validation
        if (itemData.name.trim().length < 3) {
            throw new Error('Item name must be at least 3 characters long');
        }
        if (itemData.description.trim().length < 10) {
            throw new Error('Description must be at least 10 characters long');
        }

        return makeRequest(API_CONFIG.ENDPOINTS.ITEMS, HTTP_METHODS.POST, {
            name: itemData.name,
            description: itemData.description,
            category: itemData.category,
            type: itemData.type.toUpperCase(),
            urgency: itemData.urgent ? 'URGENT' : 'NORMAL',
            imageUrl: itemData.imageUrl,
            ownerId: parseInt(user.id, 10)
        });
    },

    updateItem: async (itemId, itemData) => {
        const userStr = localStorage.getItem('user');
        let user;
        try {
            user = JSON.parse(userStr);
            if (!user || !user.id) throw new Error();
        } catch (e) {
            throw new Error('User not logged in');
        }

        // Validate required fields
        if (!itemData.name || !itemData.description || !itemData.category || !itemData.type) {
            throw new Error('All fields are required');
        }

        return makeRequest(`${API_CONFIG.ENDPOINTS.ITEMS}/${itemId}`, HTTP_METHODS.PUT, {
            name: itemData.name,
            description: itemData.description,
            category: itemData.category,
            type: itemData.type.toUpperCase(),
            urgency: itemData.urgent ? 'URGENT' : 'NORMAL',
            imageUrl: itemData.imageUrl,
            ownerId: parseInt(user.id, 10)
        });
    },

    // User items and requests
    getUserItems: (userId) => makeRequest(API_CONFIG.ENDPOINTS.USER_ITEMS(userId)),

    getUserRequests: (userId) => makeRequest(API_CONFIG.ENDPOINTS.USER_REQUESTS(userId)),

    getReceivedRequests: (userId) => makeRequest(API_CONFIG.ENDPOINTS.RECEIVED_REQUESTS(userId)),

    // Request endpoints
    createRequest: async (itemId) => {
        const userStr = localStorage.getItem('user');
        let user;
        try {
            user = JSON.parse(userStr);
            if (!user || !user.id) throw new Error('Please log in to send a request');
        } catch (e) {
            throw new Error('Please log in to send a request');
        }

        // Check if user is requesting their own item
        const item = await api.getItemById(itemId);
        if (item.ownerId === user.id) {
            throw new Error('You cannot request your own item');
        }

        return makeRequest(API_CONFIG.ENDPOINTS.REQUESTS, HTTP_METHODS.POST, {
            itemId,
            requesterId: user.id
        });
    },

    updateRequestStatus: (requestId, status) => 
        makeRequest(`${API_CONFIG.ENDPOINTS.REQUESTS}/${requestId}/status?status=${status}`, HTTP_METHODS.PUT),

    markRequestAsDone: (requestId) => 
        makeRequest(`${API_CONFIG.ENDPOINTS.REQUESTS}/${requestId}/done`, HTTP_METHODS.PUT),

    // Profile endpoints
    getProfile: (userId) => makeRequest(API_CONFIG.ENDPOINTS.PROFILE(userId)),

    updateProfile: async (userId, profileData) => {
        if (!profileData.name) {
            throw new Error('Name is required');
        }
        // Convert yearOfStudy to number if it exists
        if (profileData.yearOfStudy) {
            profileData.yearOfStudy = parseInt(profileData.yearOfStudy, 10);
        }
        return makeRequest(API_CONFIG.ENDPOINTS.PROFILE(userId), HTTP_METHODS.PUT, profileData);
    },

    // Messages endpoints
    getUserMessages: (userId) => makeRequest(API_CONFIG.ENDPOINTS.USER_MESSAGES(userId)),

    getRequestMessages: (requestId) => makeRequest(API_CONFIG.ENDPOINTS.REQUEST_MESSAGES(requestId)),
    
    getAcceptedRequests: (userId) => makeRequest(API_CONFIG.ENDPOINTS.ACCEPTED_REQUESTS(userId)),

    sendMessage: async (requestId, senderId, content) => {
        if (!content || !content.trim()) {
            throw new Error('Message content cannot be empty');
        }
        return makeRequest(`${API_CONFIG.ENDPOINTS.MESSAGES}/send/${requestId}?senderId=${senderId}`, 
            HTTP_METHODS.POST, content);
    }
};