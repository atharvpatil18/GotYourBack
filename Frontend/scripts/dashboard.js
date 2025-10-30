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

function displaySoldItems(soldItems = []) {
    const container = document.getElementById('soldItems');
    if (!container) return;

    if (!soldItems.length) {
        const emptyTemplate = document.getElementById('emptySoldItemsTemplate');
        container.innerHTML = emptyTemplate.innerHTML;
        return;
    }

    container.innerHTML = soldItems.map(item => {
        const template = document.getElementById('soldItemTemplate');
        let itemHtml = template.innerHTML
            .replace(/{imageUrl}/g, item.imageUrl || 'assets/placeholder.png')
            .replace(/{name}/g, item.name)
            .replace(/{category}/g, item.category)
            .replace(/{description}/g, item.description)
            .replace(/{buyerName}/g, item.buyerName || 'Unknown');
        return itemHtml;
    }).join('');
}

function displayLentItems(lentItems = [], filter = 'all') {
    const container = document.getElementById('lentItems');
    if (!container) return;

    // Store all items for filtering
    window.allLentItems = lentItems;

    // Filter items based on selection
    let filteredItems = lentItems;
    if (filter === 'currentlylent') {
        filteredItems = lentItems.filter(item => !item.isReturned);
    } else if (filter === 'returned') {
        filteredItems = lentItems.filter(item => item.isReturned);
    }

    if (!filteredItems.length) {
        const emptyTemplate = document.getElementById('emptyLentItemsTemplate');
        container.innerHTML = emptyTemplate.innerHTML;
        return;
    }

    container.innerHTML = filteredItems.map(item => {
        const template = document.getElementById('lentItemTemplate');
        
        // Determine status badge
        let statusBadge = '';
        if (item.isReturned) {
            statusBadge = '<span class="badge bg-success">RETURNED</span>';
        } else {
            statusBadge = '<span class="badge bg-warning text-dark">CURRENTLY LENT</span>';
        }
        
        // Format time information
        let timeInfo = '<div class="small mt-2 text-muted">';
        if (item.lentAt) {
            const lentDate = new Date(item.lentAt);
            timeInfo += `<i class="bi bi-calendar"></i> Lent on ${lentDate.toLocaleDateString()}`;
        }
        if (item.isReturned && item.completedAt) {
            const returnedDate = new Date(item.completedAt);
            timeInfo += ` <i class="bi bi-arrow-return-left ms-2"></i> Returned on ${returnedDate.toLocaleDateString()}`;
        }
        timeInfo += '</div>';
        
        let itemHtml = template.innerHTML
            .replace(/{imageUrl}/g, item.imageUrl || 'assets/placeholder.png')
            .replace(/{name}/g, item.name)
            .replace(/{category}/g, item.category)
            .replace(/{description}/g, item.description)
            .replace(/{borrowerName}/g, item.borrowerName || 'Unknown')
            .replace(/{statusBadge}/g, statusBadge)
            .replace(/{timeInfo}/g, timeInfo);
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
    const user = getUser();

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
            const isBorrower = type === 'sent';
            const isLendType = request.item?.type === 'LEND';
            
            if (!isLendType) {
                // For SELL items, just show Mark as Done
                actionButtons = `
                    <button class="btn btn-outline-primary btn-sm" onclick="updateRequestStatus('${request.id}', 'DONE')" title="Mark as done">
                        <i class="bi bi-check-circle"></i> Mark as Done
                    </button>
                `;
            } else {
                // For LEND items, show lent/receipt flow
                const lenderMarkedAsLent = request.lenderMarkedAsLent || false;
                const borrowerConfirmedReceipt = request.borrowerConfirmedReceipt || false;
                
                let statusHtml = '<div class="small mt-2">';
                
                if (!isBorrower && !lenderMarkedAsLent) {
                    // Owner hasn't marked as lent yet
                    actionButtons = `
                        <button class="btn btn-outline-primary btn-sm" onclick="markAsLent('${request.id}')" title="Mark as lent">
                            <i class="bi bi-box-arrow-right"></i> Mark as Lent
                        </button>
                    `;
                } else if (!isBorrower && lenderMarkedAsLent && !borrowerConfirmedReceipt) {
                    // Owner marked as lent, waiting for borrower to confirm
                    statusHtml += '<span class="text-info"><i class="bi bi-check-circle"></i> Marked as lent</span><br>';
                    statusHtml += '<span class="text-muted"><i class="bi bi-clock"></i> Waiting for borrower to confirm receipt</span>';
                    actionButtons = statusHtml + '</div>';
                } else if (isBorrower && !lenderMarkedAsLent) {
                    // Borrower waiting for owner to mark as lent
                    statusHtml += '<span class="text-muted"><i class="bi bi-clock"></i> Waiting for lender to hand over item</span>';
                    actionButtons = statusHtml + '</div>';
                } else if (isBorrower && lenderMarkedAsLent && !borrowerConfirmedReceipt) {
                    // Borrower can confirm receipt
                    actionButtons = `
                        <button class="btn btn-outline-success btn-sm" onclick="confirmReceipt('${request.id}')" title="Confirm receipt">
                            <i class="bi bi-check-circle"></i> Confirm Receipt
                        </button>
                        <div class="small mt-2">
                            <span class="text-info"><i class="bi bi-info-circle"></i> Item marked as lent by owner</span>
                        </div>
                    `;
                } else if (borrowerConfirmedReceipt) {
                    // Both parties confirmed, show mark as done
                    statusHtml += '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Item received by borrower</span>';
                    actionButtons = `
                        <button class="btn btn-outline-primary btn-sm" onclick="updateRequestStatus('${request.id}', 'DONE')" title="Mark as done">
                            <i class="bi bi-check-circle"></i> Mark as Done
                        </button>
                        ${statusHtml}</div>
                    `;
                }
            }
        } else if (request.status === 'DONE') {
            // Check if this is a LEND or SELL type item
            const isLendType = request.item?.type === 'LEND';
            
            if (isLendType) {
                // Show return confirmation status and buttons for LEND items
                const isBorrower = type === 'sent'; // sent means user is borrower
                const hasUserConfirmed = isBorrower ? request.borrowerConfirmedReturn : request.lenderConfirmedReturn;
                const hasOtherConfirmed = isBorrower ? request.lenderConfirmedReturn : request.borrowerConfirmedReturn;
                
                let confirmationStatus = '<div class="small mt-2">';
                if (hasUserConfirmed && hasOtherConfirmed) {
                    confirmationStatus += '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Return confirmed by both parties</span>';
                } else {
                    if (hasUserConfirmed) {
                        confirmationStatus += '<span class="text-info"><i class="bi bi-check-circle"></i> You confirmed</span><br>';
                    }
                    if (hasOtherConfirmed) {
                        confirmationStatus += `<span class="text-info"><i class="bi bi-check-circle"></i> ${isBorrower ? 'Lender' : 'Borrower'} confirmed</span>`;
                    } else if (hasUserConfirmed) {
                        confirmationStatus += `<span class="text-muted"><i class="bi bi-clock"></i> Waiting for ${isBorrower ? 'lender' : 'borrower'}</span>`;
                    }
                }
                confirmationStatus += '</div>';
                
                if (!hasUserConfirmed) {
                    actionButtons = `
                        <button class="btn btn-outline-success btn-sm" onclick="confirmReturn('${request.id}', ${isBorrower})" title="Confirm ${isBorrower ? 'return' : 'receipt'}">
                            <i class="bi bi-check-circle"></i> Confirm ${isBorrower ? 'Return' : 'Receipt'}
                        </button>
                        ${confirmationStatus}
                    `;
                } else {
                    actionButtons = confirmationStatus;
                }
            } else {
                // For SELL items, just show "Completed" status
                actionButtons = `
                    <div class="small mt-2">
                        <span class="text-success"><i class="bi bi-check-circle-fill"></i> Transaction Completed</span>
                    </div>
                `;
            }
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

async function confirmReturn(requestId, isBorrower) {
    try {
        const user = getUser();
        if (!user) return;
        
        await api.confirmReturn(requestId, user.id, isBorrower);
        showAlert(`Return ${isBorrower ? 'confirmation' : 'receipt'} recorded successfully`, 'success');
        await loadDashboardData();
    } catch (error) {
        console.error('Error confirming return:', error);
        showAlert(error.message || 'Failed to confirm return', 'danger');
    }
}

async function markAsLent(requestId) {
    try {
        const user = getUser();
        if (!user) return;
        
        await api.markAsLent(requestId, user.id);
        showAlert('Item marked as lent successfully', 'success');
        await loadDashboardData();
    } catch (error) {
        console.error('Error marking as lent:', error);
        showAlert(error.message || 'Failed to mark as lent', 'danger');
    }
}

async function confirmReceipt(requestId) {
    try {
        const user = getUser();
        if (!user) return;
        
        await api.confirmReceipt(requestId, user.id);
        showAlert('Receipt confirmed successfully', 'success');
        await loadDashboardData();
    } catch (error) {
        console.error('Error confirming receipt:', error);
        showAlert(error.message || 'Failed to confirm receipt', 'danger');
    }
}

// Export functions to global scope for HTML onclick handlers
window.markAsLent = markAsLent;
window.confirmReceipt = confirmReceipt;

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
        showLoading('soldItems');
        showLoading('lentItems');

        const [userItems, userRequests, receivedRequests, soldItems, lentItems] = await Promise.all([
            api.getUserItems(user.id),
            api.getUserRequests(user.id),
            api.getReceivedRequests(user.id),
            api.getSoldItems(user.id),
            api.getLentItems(user.id)
        ]);

        // Update stats first
        updateStats(userItems, userRequests, receivedRequests);

        // Display data
        displayUserItems(userItems);
        displayRequests(userRequests, receivedRequests);
        displaySoldItems(soldItems);
        displayLentItems(lentItems);

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

        // Setup lent items filters
        document.querySelectorAll('input[name="lentFilter"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const filter = e.target.id.replace('Lent', '').replace('currently', 'currentlyLent').toLowerCase();
                displayLentItems(lentItems, filter);
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
    confirmReturn,
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