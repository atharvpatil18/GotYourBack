const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api',
    ENDPOINTS: {
        SIGNUP: '/auth/signup',
        LOGIN: '/auth/login',
        ITEMS: '/items',
        USER_ITEMS: (userId) => `/items/user/${userId}`,
        USER_REQUESTS: (userId) => `/requests/user/${userId}`,
        RECEIVED_REQUESTS: (userId) => `/requests/received/${userId}`,
        REQUESTS: '/requests',
        PROFILE: (userId) => `/users/${userId}/profile`,
        MESSAGES: '/messages',
        USER_MESSAGES: (userId) => `/messages/user/${userId}`,
        REQUEST_MESSAGES: (requestId) => `/messages/request/${requestId}`,
        ACCEPTED_REQUESTS: (userId) => `/requests/user/${userId}/accepted`
    }
};

const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
};

export { API_CONFIG, HTTP_METHODS };
