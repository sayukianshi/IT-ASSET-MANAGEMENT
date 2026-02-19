// Authentication functions
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        utils.showAlert('Please enter email and password', 'warning');
        return;
    }

    try {
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...';

        await api.login(email, password);
        
        utils.showAlert('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        utils.showAlert(error.message || 'Login failed', 'danger');
    } finally {
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        api.logout();
        window.location.href = 'login.html';
    }
}

async function checkAuth() {
    try {
        const data = await api.verifyToken();
        return data.user;
    } catch (error) {
        // Token is invalid, remove it and redirect to login
        api.logout();
        window.location.href = 'login.html';
        return null;
    }
}

// Load user information
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay) {
            userDisplay.textContent = user.name;
        }
        
        // Show/hide admin features
        const usersNavItem = document.getElementById('usersNavItem');
        if (usersNavItem && user.role === 'admin') {
            usersNavItem.style.display = 'block';
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            login();
        });
    }
});

// Export functions
window.auth = {
    login,
    logout,
    checkAuth,
    loadUserInfo
};