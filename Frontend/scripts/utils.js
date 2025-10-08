// Alert function for showing notifications
export function showAlert(message, type) {
    const alertContainer = document.querySelector('.alert-container');
    if (!alertContainer) return;

    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alertElement);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertElement.parentElement) {
            alertElement.classList.remove('show');
            setTimeout(() => alertElement.remove(), 300);
        }
    }, 5000);
}