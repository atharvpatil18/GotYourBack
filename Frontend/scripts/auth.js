import { api } from './api.js';
import { showAlert } from './utils.js';

// Handle logout
export function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Check if user is logged in
export function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    
    try {
        const userObj = JSON.parse(user);
        if (!userObj || !userObj.id) {
            localStorage.clear();
            window.location.href = 'login.html';
            return null;
        }
        return userObj;
    } catch (e) {
        localStorage.clear();
        window.location.href = 'login.html';
        return null;
    }
}

// Handle login
export async function login(email, password) {
    try {
        const response = await api.login({ email, password });
        localStorage.setItem('user', JSON.stringify({
            id: response.id,
            name: response.name,
            email: response.email,
            token: response.token
        }));
        return response;
    } catch (error) {
        showAlert(error.message || 'Login failed', 'danger');
        throw error;
    }
}

// Handle signup
export async function signup(userData) {
    try {
        const response = await api.signup(userData);
        showAlert('Signup successful! Please login.', 'success');
        return response;
    } catch (error) {
        showAlert(error.message || 'Signup failed', 'danger');
        throw error;
    }
}
import { showAlert } from './utils.js';

// Authentication related functions and event handlers

// Function to handle form validation
const validateForm = (form) => {
    form.classList.add('was-validated');
    return form.checkValidity();
};

// Function to toggle password visibility
const setupPasswordToggle = () => {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            toggleBtn.querySelector('i').classList.toggle('bi-eye');
            toggleBtn.querySelector('i').classList.toggle('bi-eye-slash');
        });
    }
};

// Function to handle login
async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!validateForm(form)) return;

    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;

    try {
        const response = await api.login({ email, password });
        if (response.success) {
            localStorage.setItem('user', JSON.stringify({
                id: response.id,
                name: response.name,
                email: response.email
            }));
            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showAlert(response.message || 'Login failed', 'danger');
        }
    } catch (error) {
        showAlert(error.message || 'Login failed', 'danger');
    }
}

// Function to handle signup
const handleSignup = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    if (!validateForm(form)) return;

    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;

    try {
        await api.signup({ name, email, password });
        showAlert('Account created successfully! Please login.', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
};

// Check authentication status
const checkAuth = () => {
    const userStr = localStorage.getItem('user');
    const protectedPages = ['index.html', 'dashboard.html', 'postItem.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    let user = null;
    try {
        user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        localStorage.removeItem('user');
    }
    
    if ((!user || !user.id) && protectedPages.includes(currentPage)) {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return false;
    } else if (user && user.id && (currentPage === 'login.html' || currentPage === 'signup.html')) {
        window.location.href = 'index.html';
        return true;
    }
    return user && user.id ? user : false;
};

// Initialize auth features
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupPasswordToggle();

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

// Logout function
export const logout = () => {
    localStorage.clear();
    window.location.href = 'login.html';
};

// Export auth functions for use in other modules
export { checkAuth, setupPasswordToggle };