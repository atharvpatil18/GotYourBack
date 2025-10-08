import { api } from './api.js';
import { showAlert } from './utils.js';

let editingItemId = null;

// Auth check
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

// Load item for editing
async function loadItem(itemId) {
    try {
        const item = await api.getItemById(itemId);
        
        // Fill form fields
        document.getElementById('name').value = item.name;
        document.getElementById('description').value = item.description;
        document.getElementById('category').value = item.category;
        document.getElementById('type').value = item.type;
        document.getElementById('urgent').checked = item.urgency === 'URGENT';
        document.getElementById('imageUrl').value = item.imageUrl || '';

        // Update form title and submit button
        document.getElementById('formTitle').textContent = 'Edit Item';
        document.getElementById('submitButton').textContent = 'Update Item';
        
        editingItemId = itemId;
    } catch (error) {
        console.error('Error loading item:', error);
        showAlert('Failed to load item details', 'danger');
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

    const itemData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        type: document.getElementById('type').value,
        urgent: document.getElementById('urgent').checked,
        imageUrl: document.getElementById('imageUrl').value || null,
        ownerId: user.id
    };

    try {
        if (editingItemId) {
            // Update existing item
            await api.updateItem(editingItemId, { ...itemData, id: editingItemId });
            showAlert('Item updated successfully', 'success');
        } else {
            // Create new item
            await api.createItem(itemData);
            showAlert('Item posted successfully', 'success');
        }
        
        // Clear form and redirect to dashboard
        form.reset();
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Error saving item:', error);
        showAlert(error.message || 'Failed to save item', 'danger');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!user) return;

    // Check if editing an existing item
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
        loadItem(editId);
    }

    // Set up form submission
    const form = document.getElementById('itemForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    // Update user name
    document.getElementById('userName').textContent = user.name || 'User';
});

// Make logout function available globally
window.logout = () => {
    localStorage.clear();
    window.location.href = 'login.html';
};