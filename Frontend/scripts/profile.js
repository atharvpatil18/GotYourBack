import { api } from './api.js';
import { showAlert } from './utils.js';

// Auth check and user data
function getUser() {
    const userStr = localStorage.getItem('user');
    try {
        const user = JSON.parse(userStr);
        if (!user?.id) throw new Error('No user found');
        return user;
    } catch (e) {
        window.location.href = 'login.html';
        return null;
    }
}

// Load profile data
async function loadProfile() {
    const user = getUser();
    if (!user) return;

    // Immediately display user info from localStorage
    document.getElementById('userName').textContent = user.name || 'User';
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('name').value = user.name || '';

    try {
        const response = await api.getProfile(user.id);
        if (!response) throw new Error('Failed to load profile');

        // Update form fields
        document.getElementById('userName').textContent = response.name || user.name || 'User';
        document.getElementById('userEmail').textContent = response.email || user.email;
        document.getElementById('name').value = response.name || user.name || '';
        document.getElementById('department').value = response.department || '';
        document.getElementById('registrationNumber').value = response.registrationNumber || '';
        document.getElementById('yearOfStudy').value = response.yearOfStudy || '';

        // Update stats
        document.getElementById('totalListings').textContent = response.totalListings || 0;
        document.getElementById('activeRequests').textContent = response.activeRequests || 0;
        document.getElementById('completedDeals').textContent = response.completedDeals || 0;
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert(error.message || 'Failed to load profile data', 'danger');
        
        // Keep the initial user data visible even if profile load fails
        document.getElementById('userName').textContent = user.name || 'User';
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('name').value = user.name || '';
    }
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const user = getUser();
    if (!user) return;

    const profileData = {
        name: document.getElementById('name').value,
        department: document.getElementById('department').value,
        registrationNumber: document.getElementById('registrationNumber').value,
        yearOfStudy: document.getElementById('yearOfStudy').value
    };

    try {
        await api.updateProfile(user.id, profileData);
        showAlert('Profile updated successfully', 'success');
        
        // Update stored user data
        const updatedUser = { ...user, name: profileData.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update display name
        document.getElementById('userName').textContent = profileData.name;
    } catch (error) {
        console.error('Error updating profile:', error);
        showAlert(error.message || 'Failed to update profile', 'danger');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});

// Make logout function available globally
window.logout = () => {
    localStorage.clear();
    window.location.href = 'login.html';
};