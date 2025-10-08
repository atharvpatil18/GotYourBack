import { api } from './api.js';
import { showAlert } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // Load items
    await loadItems();

    // Setup filter form
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', handleFilterSubmit);
    }
});

async function loadItems(queryString = '') {
    try {
        const items = await api.getItems(queryString);
        displayItems(items);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

function displayItems(items) {
    const itemsContainer = document.getElementById('itemsContainer');
    if (!itemsContainer) return;

    // Filter out items with DONE status
    items = items.filter(item => item.status !== 'DONE');

    if (items.length === 0) {
        itemsContainer.innerHTML = '<div class="col-12"><p class="text-center">No items found.</p></div>';
        return;
    }

    const itemsHtml = items.map(item => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                ${item.imageUrl ? `
                    <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;">
                ` : ''}
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <div class="mb-2">
                        <span class="badge bg-${item.type === 'LEND' ? 'success' : 'primary'}">
                            ${item.type}
                        </span>
                        ${item.urgency === 'URGENT' ? '<span class="badge bg-danger ms-1">URGENT</span>' : ''}
                        <span class="badge bg-secondary ms-1">${item.category}</span>
                    </div>
                    ${item.ownerId !== parseInt(localStorage.getItem('userId')) && item.status === 'AVAILABLE' ? `
                        <button class="btn btn-primary btn-sm" onclick="handleRequest(${item.id})">
                            Request Item
                        </button>
                    ` : ''}
                    ${item.status !== 'AVAILABLE' ? `
                        <span class="badge bg-secondary">${item.status}</span>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');

    itemsContainer.innerHTML = itemsHtml;
}

async function handleFilterSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    let queryParams = [];
    for (let [key, value] of formData.entries()) {
        // Only add parameters that have actual values
        if (value && value.trim() !== '') {
            if (key === 'type') {
                value = value.toUpperCase(); // Ensure type is uppercase (SELL/LEND)
            }
            queryParams.push(`${key}=${encodeURIComponent(value)}`);
        }
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    await loadItems(queryString);
}

async function handleRequest(itemId) {
    try {
        await api.createRequest(itemId);
        showAlert('Request sent successfully!', 'success');
        await loadItems(); // Refresh the items list
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}