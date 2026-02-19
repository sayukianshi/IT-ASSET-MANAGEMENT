// Utility functions
function showAlert(message, type = 'info', containerId = 'alertContainer') {
    const alertContainer = document.getElementById(containerId);
    if (!alertContainer) {
        console.error('Alert container not found');
        return;
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function getStatusBadgeClass(status) {
    const statusClasses = {
        'available': 'bg-success',
        'assigned': 'bg-warning',
        'maintenance': 'bg-danger',
        'retired': 'bg-secondary'
    };
    return statusClasses[status] || 'bg-secondary';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoadingSpinner(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="spinner-container">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    }
}

function hideLoadingSpinner(elementId, content = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
    }
}

// Export functions for use in other files
window.utils = {
    showAlert,
    formatDate,
    formatCurrency,
    getStatusBadgeClass,
    debounce,
    showLoadingSpinner,
    hideLoadingSpinner
};