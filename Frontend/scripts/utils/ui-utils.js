// Show alert message
export function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alert);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 150);
        }
    }, 5000);
}

// Create alert container if it doesn't exist
function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1050';
    document.body.appendChild(container);
    return container;
}

// Show loading spinner
export function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">${message}</span>
            </div>
            <p class="mt-2">${message}</p>
        </div>
    `;
}

// Hide loading spinner
export function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}

// Format date
export function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Get status badge color
export function getStatusBadgeColor(status) {
    switch (status?.toUpperCase()) {
        case 'PENDING': return 'warning';
        case 'ACCEPTED': return 'success';
        case 'REJECTED': return 'danger';
        case 'DONE': return 'info';
        default: return 'secondary';
    }
}

// Create status badge HTML
export function createStatusBadge(status) {
    const color = getStatusBadgeColor(status);
    return `<span class="badge bg-${color}">${status}</span>`;
}

// Handle form submission with validation
export async function handleFormSubmit(form, validationFn, submitFn) {
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate data
        const errors = validationFn(data);
        if (errors.length > 0) {
            showAlert(errors.join('\\n'), 'danger');
            return false;
        }

        // Submit data
        await submitFn(data);
        return true;
    } catch (error) {
        showAlert(error.message || 'An error occurred', 'danger');
        return false;
    }
}

// Enable/disable form submission
export function setFormSubmitting(form, isSubmitting) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = isSubmitting;
        if (isSubmitting) {
            const originalText = submitBtn.textContent;
            submitBtn.setAttribute('data-original-text', originalText);
            submitBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Loading...
            `;
        } else {
            const originalText = submitBtn.getAttribute('data-original-text');
            if (originalText) {
                submitBtn.textContent = originalText;
            }
        }
    }
}

// Populate form fields with data
export function populateForm(form, data) {
    Object.entries(data).forEach(([key, value]) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = value;
            } else {
                input.value = value;
            }
        }
    });
}
