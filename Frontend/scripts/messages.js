import { API_CONFIG, HTTP_METHODS } from './utils/api-config.js';
import { getUser, logout } from './utils/auth-utils.js';

let currentUser = null;
let currentRequestId = null;
let acceptedRequests = new Map();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if user is logged in
        currentUser = getUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Set user name in the navbar
        document.getElementById('userName').textContent = currentUser.name || 'User';

        // Load user's messages and accepted requests
        const [messagesResponse, requestsResponse] = await Promise.all([
            fetch(`${API_CONFIG.BASE_URL}/messages/user/${currentUser.id}`, {
                method: HTTP_METHODS.GET
            }),
            fetch(`${API_CONFIG.BASE_URL}/requests/user/${currentUser.id}/accepted`, {
                method: HTTP_METHODS.GET
            })
        ]);
        
        if (!messagesResponse.ok || !requestsResponse.ok) {
            throw new Error('Failed to load messages or requests');
        }

        const messages = await messagesResponse.json();
        const requests = await requestsResponse.json();

        // Create message threads for both existing messages and accepted requests without messages
        const threads = new Map();

        // Process existing messages first
        messages.forEach(message => {
            if (!threads.has(message.requestId)) {
                threads.set(message.requestId, {
                    requestId: message.requestId,
                    otherUser: message.senderId === currentUser.id ? message.receiverName : message.senderName,
                    lastMessage: message
                });
            }
        });

        // Add accepted requests that don't have messages yet
        requests.forEach(request => {
            if (!threads.has(request.id)) {
                threads.set(request.id, {
                    requestId: request.id,
                    otherUser: request.requesterId === currentUser.id ? request.ownerName : request.requesterName,
                    lastMessage: null
                });
            }
        });

        // Store accepted requests for reference
        acceptedRequests = threads;

        // Display all threads
        displayMessageThreads(threads);

        // Setup message form
        document.getElementById('messageForm').addEventListener('submit', handleSendMessage);
    } catch (error) {
        console.error('Initialization error:', error);
        showAlert('Failed to load messages: ' + (error.message || 'Unknown error'), 'danger');
    }
});

function displayMessageThreads(threads) {
    const threadsContainer = document.getElementById('messageThreads');
    
    threadsContainer.innerHTML = threads.size ? Array.from(threads.values())
        .map(thread => `
            <a href="#" class="list-group-item message-thread" 
               onclick="window.loadRequestMessages(${thread.requestId}, '${thread.otherUser}')">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">
                        <i class="bi bi-person-circle me-2"></i>
                        ${thread.otherUser}
                    </h6>
                    ${thread.lastMessage ? 
                        `<small class="text-muted">${formatDate(thread.lastMessage.sentAt)}</small>` : 
                        '<small class="text-primary">New conversation</small>'}
                </div>
                ${thread.lastMessage ? 
                    `<p class="message-preview mb-0">${thread.lastMessage.content}</p>` :
                    '<p class="message-preview mb-0 text-muted">Start a new conversation</p>'}
            </a>
        `).join('') : `
        <div class="text-center p-4">
            <i class="bi bi-chat-dots display-4 text-muted"></i>
            <p class="mt-3 mb-0 text-muted">No conversations yet</p>
            <p class="text-muted small">Messages will appear here for your accepted requests</p>
        </div>`;
}

window.loadRequestMessages = async function(requestId, otherUser) {
    currentRequestId = requestId;
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/messages/request/${requestId}`, {
            method: HTTP_METHODS.GET
        });
        
        if (!response.ok) {
            throw new Error('Failed to load messages');
        }

        const messages = await response.json();
        displayMessages(messages, otherUser);
    } catch (error) {
        console.error('Error loading request messages:', error);
        showAlert('Failed to load conversation: ' + (error.message || 'Unknown error'), 'danger');
    }
}

function displayMessages(messages, otherUser) {
    document.getElementById('threadHeader').textContent = `Conversation with ${otherUser}`;
    document.getElementById('messageForm').classList.remove('d-none');
    
    const messageList = document.getElementById('messageList');
    
    if (messages.length === 0) {
        messageList.innerHTML = `
            <div class="text-center p-4">
                <i class="bi bi-chat-dots display-4 text-muted"></i>
                <p class="mt-3 mb-0 text-muted">No messages in this conversation yet</p>
                <p class="text-muted small">Start the conversation by sending a message</p>
            </div>`;
    } else {
        // Sort messages by sent time, oldest first
        const sortedMessages = [...messages].sort((a, b) => 
            new Date(a.sentAt) - new Date(b.sentAt)
        );
        
        messageList.innerHTML = sortedMessages.map(message => `
            <div class="message-bubble ${message.senderId === currentUser.id ? 'sent' : 'received'}">
                <div class="message-content">${message.content.trim()}</div><div class="message-time">${formatDate(message.sentAt)}</div>
            </div>
        `).join('');
    }
    
    // Scroll to bottom
    messageList.scrollTop = messageList.scrollHeight;
}

async function handleSendMessage(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content || !currentRequestId) return;
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/messages/send/${currentRequestId}?senderId=${currentUser.id}`, {
            method: HTTP_METHODS.POST,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: content
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }
        
        // Clear input and reload messages
        messageInput.value = '';
        const thread = acceptedRequests.get(currentRequestId);
        if (thread) {
            await loadRequestMessages(currentRequestId, thread.otherUser);
        }
        // Refresh threads list
        const [messagesResponse, requestsResponse] = await Promise.all([
            fetch(`${API_CONFIG.BASE_URL}/messages/user/${currentUser.id}`, {
                method: HTTP_METHODS.GET
            }),
            fetch(`${API_CONFIG.BASE_URL}/requests/user/${currentUser.id}/accepted`, {
                method: HTTP_METHODS.GET
            })
        ]);
        
        if (!messagesResponse.ok || !requestsResponse.ok) {
            throw new Error('Failed to refresh message list');
        }

        const messages = await messagesResponse.json();
        const requests = await requestsResponse.json();
        
        // Create message threads for both existing messages and accepted requests without messages
        const threads = new Map();
        messages.forEach(message => {
            if (!threads.has(message.requestId)) {
                threads.set(message.requestId, {
                    requestId: message.requestId,
                    otherUser: message.senderId === currentUser.id ? message.receiverName : message.senderName,
                    lastMessage: message
                });
            }
        });
        requests.forEach(request => {
            if (!threads.has(request.id)) {
                threads.set(request.id, {
                    requestId: request.id,
                    otherUser: request.requesterId === currentUser.id ? request.ownerName : request.requesterName,
                    lastMessage: null
                });
            }
        });
        acceptedRequests = threads;
        displayMessageThreads(threads);
    } catch (error) {
        console.error('Error sending message:', error);
        showAlert('Failed to send message: ' + (error.message || 'Unknown error'), 'danger');
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
}

function showAlert(message, type = 'danger') {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed bottom-0 end-0 m-3`;
    alertContainer.role = 'alert';
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertContainer);

    setTimeout(() => {
        if (alertContainer && document.body.contains(alertContainer)) {
            alertContainer.remove();
        }
    }, 5000);
}

// Make logout function available globally
window.logout = () => {
    localStorage.clear();
    window.location.href = 'login.html';
};