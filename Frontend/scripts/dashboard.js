import { api } from './api.js';
import { showAlert } from './utils.js';

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

// Utility functions
function getStatusBadgeColor(status) {
    switch (status?.toUpperCase()) {
        case 'PENDING': return 'warning';
        case 'ACCEPTED': return 'success';
        case 'REJECTED': return 'danger';
        case 'DONE': return 'info';
        default: return 'secondary';
    }
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
}

// Display functions
function displayUserItems(items = []) {
    const container = document.getElementById('myListings');
    if (!container) return;

    if (!items.length) {
        const emptyTemplate = document.getElementById('emptyListingsTemplate');
        container.innerHTML = emptyTemplate.innerHTML;
        return;
    }

    container.innerHTML = items.map(item => {
        const template = document.getElementById('listingItemTemplate');
        let itemHtml = template.innerHTML
            .replace(/{imageUrl}/g, item.imageUrl || 'assets/placeholder.png')
            .replace(/{name}/g, item.name)
            .replace(/{category}/g, item.category)
            .replace(/{type}/g, item.type)
            .replace(/{urgentBadge}/g, item.urgency === 'URGENT' ? '<span class="badge bg-danger">URGENT</span>' : '')
            .replace(/{description}/g, item.description)
            .replace(/{id}/g, item.id)
            .replace(/{itemJson}/g, encodeURIComponent(JSON.stringify(item)));
        return itemHtml;
    }).join('');
}

function displayRequests(userRequests = [], receivedRequests = []) {
    const container = document.getElementById('myRequests');
    if (!container) return;

    // Check if arrays are provided
    userRequests = userRequests || [];
    receivedRequests = receivedRequests || [];

    if (!userRequests.length && !receivedRequests.length) {
        const emptyTemplate = document.getElementById('emptyRequestsTemplate');
        container.innerHTML = emptyTemplate.innerHTML;
        return;
    }

    let html = '';
    const requestTemplate = document.getElementById('requestItemTemplate');

    function createRequestHtml(request, type) {
        let html = requestTemplate.innerHTML
            .replace(/{imageUrl}/g, request.item?.imageUrl || 'assets/placeholder.png')
            .replace(/{name}/g, request.item?.name)
            .replace(/{statusColor}/g, getStatusBadgeColor(request.status))
            .replace(/{status}/g, request.status)
            .replace(/{requestInfo}/g, type === 'sent' ? 
                `to ${request.ownerName}` : 
                `From ${request.requesterName}`);

        let actionButtons = '';
        if (type === 'received' && request.status === 'PENDING') {
            actionButtons = `
                <div class="btn-group">
                    <button class="btn btn-outline-success btn-sm" onclick="updateRequestStatus('${request.id}', 'ACCEPTED')" title="Accept request">
                        <i class="bi bi-check-lg"></i> Accept
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="updateRequestStatus('${request.id}', 'REJECTED')" title="Reject request">
                        <i class="bi bi-x-lg"></i> Reject
                    </button>
                </div>
            `;
        } else if (request.status === 'ACCEPTED') {
            actionButtons = `
                <button class="btn btn-outline-primary btn-sm" onclick="updateRequestStatus('${request.id}', 'DONE')" title="Mark as done">
                    <i class="bi bi-check-circle"></i> Mark as Done
                </button>
            `;
        }
        return html.replace(/{actionButtons}/g, actionButtons);
    }

    if (userRequests.length) {
        html += `
            <h6 class="mb-3"><i class="bi bi-arrow-right"></i> Sent Requests</h6>
            ${userRequests.map(request => createRequestHtml(request, 'sent')).join('')}
        `;
    }

    if (receivedRequests.length) {
        html += `
            ${userRequests.length ? '<h6 class="mt-4 mb-3">' : '<h6 class="mb-3">'}
            <i class="bi bi-arrow-left"></i> Received Requests</h6>
            ${receivedRequests.map(request => createRequestHtml(request, 'received')).join('')}
        `;
    }

    container.innerHTML = html;
}

// Action handlers
async function updateRequestStatus(requestId, status) {
    try {
        if (status === 'DONE') {
            await api.markRequestAsDone(requestId);
        } else {
            await api.updateRequestStatus(requestId, status);
        }
        showAlert('Request status updated successfully', 'success');
        await loadDashboardData();
    } catch (error) {
        console.error('Error updating request:', error);
        showAlert(error.message || 'Failed to update request status', 'danger');
    }
}

async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        await api.deleteItem(itemId);
        showAlert('Item deleted successfully', 'success');
        await loadDashboardData();
    } catch (error) {
        console.error('Error deleting item:', error);
        showAlert(error.message || 'Failed to delete item', 'danger');
    }
}

function updateStats(userItems = [], userRequests = [], receivedRequests = []) {
    document.getElementById('totalListings').textContent = userItems.length;
    document.getElementById('totalRequests').textContent = userRequests.length + receivedRequests.length;
    document.getElementById('completedDeals').textContent = [
        ...userRequests,
        ...receivedRequests
    ].filter(r => r.status === 'DONE').length;
}

// Data loading
async function loadDashboardData() {
    const user = getUser();
    if (!user) return;

    try {
        showLoading('myListings');
        showLoading('myRequests');

        const [userItems, userRequests, receivedRequests] = await Promise.all([
            api.getUserItems(user.id),
            api.getUserRequests(user.id),
            api.getReceivedRequests(user.id)
        ]);

        // Update stats first
        updateStats(userItems, userRequests, receivedRequests);

        // Display data
        displayUserItems(userItems);
        displayRequests(userRequests, receivedRequests);

        // Setup search
        const search = document.getElementById('listingSearch');
        if (search) {
            search.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = userItems.filter(item => 
                    item.name.toLowerCase().includes(term) || 
                    item.description.toLowerCase().includes(term)
                );
                displayUserItems(filtered);
            });
        }

        // Setup filters
        document.querySelectorAll('input[name="requestFilter"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const filter = e.target.id.replace('Requests', '').toLowerCase();
                let filteredSent = [], filteredReceived = [];
                
                if (filter === 'all') {
                    filteredSent = userRequests || [];
                    filteredReceived = receivedRequests || [];
                } else if (filter === 'pending') {
                    filteredSent = (userRequests || []).filter(r => r.status === 'PENDING');
                    filteredReceived = (receivedRequests || []).filter(r => r.status === 'PENDING');
                } else if (filter === 'active') {
                    filteredSent = (userRequests || []).filter(r => r.status === 'ACCEPTED');
                    filteredReceived = (receivedRequests || []).filter(r => r.status === 'ACCEPTED');
                } else if (filter === 'completed') {
                    filteredSent = (userRequests || []).filter(r => r.status === 'DONE');
                    filteredReceived = (receivedRequests || []).filter(r => r.status === 'DONE');
                }

                const filtered = {
                    sent: filteredSent,
                    received: filteredReceived
                };
                displayRequests(filtered.sent, filtered.received);
            });
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Failed to load dashboard data', 'danger');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!user) return;

    document.getElementById('userName').textContent = user.name || 'User';
    loadDashboardData();
});

// Make functions available globally
Object.assign(window, {
    updateRequestStatus,
    deleteItem,
    showItemDetails: item => {
        try {
            const itemData = typeof item === 'string' ? 
                JSON.parse(decodeURIComponent(item)) : item;
            
            const modalElement = document.getElementById('itemDetailsModal');
            const modal = new bootstrap.Modal(modalElement);
            
            // Update modal content
            document.getElementById('modalItemTitle').textContent = itemData.name;
            document.getElementById('modalItemDescription').textContent = itemData.description;
            document.getElementById('modalItemCategory').textContent = itemData.category;
            document.getElementById('modalItemType').textContent = itemData.type;
            document.getElementById('modalItemUrgency').textContent = itemData.urgency || 'NORMAL';
            document.getElementById('modalItemOwner').textContent = itemData.ownerName;
            document.getElementById('modalItemOwnerEmail').textContent = itemData.ownerEmail;
            
            // Show the modal
            modal.show();
        } catch (error) {
            console.error('Error showing item details:', error);
            showAlert('Failed to display item details', 'danger');
        }
    },
    editItem: itemId => {
        // Redirect to editItem.html with the item ID
        window.location.href = `editItem.html?id=${itemId}`;
    },
    logout: () => {
        localStorage.clear();
        window.location.href = 'login.html';
    }
});