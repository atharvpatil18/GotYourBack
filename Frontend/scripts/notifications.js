// Notification management
const API_BASE_URL = 'http://localhost:8080/api';

// Fetch notifications for a user
async function fetchNotifications(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

// Fetch unread notifications count
async function fetchUnreadCount(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/unread-count`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch unread count');
        }

        const result = await response.json();
        return result.data || 0;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
}

// Mark notification as read
async function markNotificationAsRead(notificationId) {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('User ID not found');
            return false;
        }
        
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read?userId=${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }

        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
}

// Mark all notifications as read
async function markAllAsRead(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/read-all`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to mark all notifications as read');
        }

        return true;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
    }
}

// Delete notification
async function deleteNotification(notificationId) {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('User ID not found');
            return false;
        }
        
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}?userId=${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete notification');
        }

        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        return false;
    }
}

// Update notification badge
async function updateNotificationBadge() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const count = await fetchUnreadCount(userId);
    const badge = document.getElementById('notification-badge');
    
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }
}

// Load and display notifications
async function loadNotifications() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const notifications = await fetchNotifications(userId);
    const notificationList = document.getElementById('notification-list');
    
    if (!notificationList) return;

    if (notifications.length === 0) {
        notificationList.innerHTML = '<div class="notification-item empty">No notifications</div>';
        return;
    }

    // Clear existing notifications
    notificationList.innerHTML = '';
    
    // Create notification elements safely using DOM methods
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${notification.isRead ? 'read' : 'unread'}`;
        notificationItem.setAttribute('data-id', String(notification.id || ''));
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'notification-icon';
        const icon = document.createElement('i');
        icon.className = `fas ${getNotificationIcon(notification.type)}`;
        iconDiv.appendChild(icon);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'notification-content';
        
        const messageP = document.createElement('p');
        messageP.className = 'notification-message';
        messageP.textContent = notification.message; // Safe text content
        
        const timeSmall = document.createElement('small');
        timeSmall.className = 'notification-time';
        timeSmall.textContent = formatTime(notification.createdAt);
        
        contentDiv.appendChild(messageP);
        contentDiv.appendChild(timeSmall);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'notification-delete';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            handleDeleteNotification(notification.id);
        };
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-times';
        deleteBtn.appendChild(deleteIcon);
        
        notificationItem.appendChild(iconDiv);
        notificationItem.appendChild(contentDiv);
        notificationItem.appendChild(deleteBtn);
        
        notificationList.appendChild(notificationItem);
    });

    // Add click handlers to mark as read
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.addEventListener('click', async function(e) {
            if (e.target.closest('.notification-delete')) return;
            
            const notificationId = this.dataset.id;
            const success = await markNotificationAsRead(notificationId);
            
            if (success) {
                this.classList.remove('unread');
                this.classList.add('read');
                await updateNotificationBadge();
            }
        });
    });
}

// Handle delete notification
async function handleDeleteNotification(notificationId) {
    const success = await deleteNotification(notificationId);
    
    if (success) {
        await loadNotifications();
        await updateNotificationBadge();
    }
}

// Handle mark all as read
async function handleMarkAllRead() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const success = await markAllAsRead(userId);
    
    if (success) {
        await loadNotifications();
        await updateNotificationBadge();
    }
}

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        'REQUEST_CREATED': 'fa-hand-paper',
        'REQUEST_ACCEPTED': 'fa-check-circle',
        'REQUEST_REJECTED': 'fa-times-circle',
        'REQUEST_COMPLETED': 'fa-flag-checkered',
        'MESSAGE_RECEIVED': 'fa-envelope',
        'ITEM_UPDATED': 'fa-edit',
        'ITEM_DELETED': 'fa-trash',
        'REQUEST_STATUS_CHANGED': 'fa-exchange-alt'
    };
    return icons[type] || 'fa-bell';
}

// Format time to relative time (e.g., "2 hours ago")
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// Toggle notification dropdown
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
        if (dropdown.classList.contains('show')) {
            loadNotifications();
        }
    }
}

// Initialize notifications
function initNotifications() {
    updateNotificationBadge();
    
    // Update badge every 30 seconds
    setInterval(updateNotificationBadge, 30000);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('notification-dropdown');
        const bell = document.getElementById('notification-bell');
        
        if (dropdown && bell && !dropdown.contains(e.target) && !bell.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initNotifications);
