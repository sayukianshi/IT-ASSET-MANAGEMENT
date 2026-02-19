// Dashboard functionality
let dashboardData = {
    totalAssets: 0,
    availableAssets: 0,
    assignedAssets: 0,
    maintenanceAssets: 0,
    recentAssets: []
};

async function loadDashboard() {
    try {
        // Check authentication
        const user = await auth.checkAuth();
        if (!user) return;

        // Load user info
        auth.loadUserInfo();

        // Load dashboard data
        await Promise.all([
            loadAssetStats(),
            loadRecentAssets()
        ]);

        // Update UI
        updateDashboardUI();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        utils.showAlert('Error loading dashboard', 'danger');
    }
}

async function loadAssetStats() {
    try {
        const data = await api.getAssetReport();
        
        // Update stats
        dashboardData.totalAssets = data.statusCounts.reduce((sum, item) => sum + item.count, 0);
        dashboardData.availableAssets = data.statusCounts.find(item => item._id === 'available')?.count || 0;
        dashboardData.assignedAssets = data.statusCounts.find(item => item._id === 'assigned')?.count || 0;
        dashboardData.maintenanceAssets = data.statusCounts.find(item => item._id === 'maintenance')?.count || 0;
    } catch (error) {
        console.error('Error loading asset stats:', error);
    }
}

async function loadRecentAssets() {
    try {
        const data = await api.getAssets({ limit: 5 });
        dashboardData.recentAssets = data.assets;
    } catch (error) {
        console.error('Error loading recent assets:', error);
    }
}

function updateDashboardUI() {
    // Update stats cards
    document.getElementById('totalAssets').textContent = dashboardData.totalAssets;
    document.getElementById('availableAssets').textContent = dashboardData.availableAssets;
    document.getElementById('assignedAssets').textContent = dashboardData.assignedAssets;
    document.getElementById('maintenanceAssets').textContent = dashboardData.maintenanceAssets;

    // Update recent assets table
    const tableBody = document.getElementById('recentAssetsTable');
    if (tableBody) {
        if (dashboardData.recentAssets.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No recent assets</td></tr>';
        } else {
            tableBody.innerHTML = dashboardData.recentAssets.map(asset => `
                <tr>
                    <td>${asset.assetTag}</td>
                    <td>${asset.name}</td>
                    <td><span class="badge ${utils.getStatusBadgeClass(asset.status)}">${asset.status}</span></td>
                    <td>${asset.assignedTo ? asset.assignedTo.name : 'Unassigned'}</td>
                </tr>
            `).join('');
        }
    }
}

// Quick actions
function generateReport() {
    utils.showAlert('Report generation feature coming soon!', 'info');
}

function exportData() {
    utils.showAlert('Export feature coming soon!', 'info');
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only load dashboard if we're on the dashboard page
    if (window.location.pathname.includes('dashboard.html') || 
        (window.location.pathname.endsWith('/') && !window.location.pathname.includes('login.html'))) {
        loadDashboard();
    }
});