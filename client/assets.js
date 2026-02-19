// Assets page functionality
let currentPage = 1;
let totalPages = 1;
let allAssets = [];
let currentAsset = null;

async function loadAssets(page = 1, filters = {}) {
    try {
        // Show loading
        const tableBody = document.getElementById('assetsTableBody');
        utils.showLoadingSpinner('assetsTableBody');

        // Build query parameters
        const params = { page, limit: 10, ...filters };
        
        const data = await api.getAssets(params);
        allAssets = data.assets;
        currentPage = data.pagination.page;
        totalPages = data.pagination.totalPages;

        // Update table
        updateAssetsTable(data.assets);
        
        // Update pagination
        updatePagination(data.pagination);
    } catch (error) {
        console.error('Error loading assets:', error);
        utils.showAlert('Error loading assets', 'danger');
        document.getElementById('assetsTableBody').innerHTML = 
            '<tr><td colspan="6" class="text-center">Error loading assets</td></tr>';
    }
}

function updateAssetsTable(assets) {
    const tableBody = document.getElementById('assetsTableBody');
    
    if (assets.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No assets found</td></tr>';
        return;
    }

    tableBody.innerHTML = assets.map(asset => `
        <tr>
            <td>${asset.assetTag}</td>
            <td>${asset.name}</td>
            <td>${asset.category}</td>
            <td><span class="badge ${utils.getStatusBadgeClass(asset.status)}">${asset.status}</span></td>
            <td>${asset.assignedTo ? asset.assignedTo.name : 'Unassigned'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewAsset('${asset._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editAsset('${asset._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAsset('${asset._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updatePagination(pagination) {
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;

    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${pagination.page <= 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadAssets(${pagination.page - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === 1 || i === pagination.totalPages || (i >= pagination.page - 1 && i <= pagination.page + 1)) {
            paginationHTML += `
                <li class="page-item ${i === pagination.page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadAssets(${i})">${i}</a>
                </li>
            `;
        } else if (i === pagination.page - 2 || i === pagination.page + 2) {
            paginationHTML += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${pagination.page >= pagination.totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadAssets(${pagination.page + 1})">Next</a>
        </li>
    `;
    
    paginationElement.innerHTML = paginationHTML;
}

async function viewAsset(id) {
    try {
        currentAsset = await api.getAsset(id);
        
        // Update modal content
        const modalBody = document.getElementById('assetModalBody');
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Asset Tag:</strong> ${currentAsset.assetTag}</p>
                    <p><strong>Name:</strong> ${currentAsset.name}</p>
                    <p><strong>Category:</strong> ${currentAsset.category}</p>
                    <p><strong>Status:</strong> <span class="badge ${utils.getStatusBadgeClass(currentAsset.status)}">${currentAsset.status}</span></p>
                    <p><strong>Location:</strong> ${currentAsset.location || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Manufacturer:</strong> ${currentAsset.manufacturer || 'N/A'}</p>
                    <p><strong>Model:</strong> ${currentAsset.model || 'N/A'}</p>
                    <p><strong>Serial Number:</strong> ${currentAsset.serialNumber || 'N/A'}</p>
                    <p><strong>Purchase Date:</strong> ${utils.formatDate(currentAsset.purchaseDate)}</p>
                    <p><strong>Purchase Cost:</strong> ${utils.formatCurrency(currentAsset.purchaseCost)}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <p><strong>Warranty Expiry:</strong> ${utils.formatDate(currentAsset.warrantyExpiry)}</p>
                    <p><strong>Assigned To:</strong> ${currentAsset.assignedTo ? currentAsset.assignedTo.name : 'Unassigned'}</p>
                    <p><strong>Description:</strong> ${currentAsset.description || 'N/A'}</p>
                </div>
            </div>
        `;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('assetModal'));
        modal.show();
    } catch (error) {
        utils.showAlert('Error loading asset details', 'danger');
    }
}

function editAsset(id) {
    window.location.href = `asset-form.html?id=${id}`;
}

async function deleteAsset(id) {
    if (!confirm('Are you sure you want to delete this asset?')) {
        return;
    }

    try {
        await api.deleteAsset(id);
        utils.showAlert('Asset deleted successfully', 'success');
        loadAssets(currentPage);
    } catch (error) {
        utils.showAlert('Error deleting asset', 'danger');
    }
}

// Filter functions
function applyFilters() {
    const filters = {};
    
    const searchValue = document.getElementById('searchInput').value;
    if (searchValue) filters.search = searchValue;
    
    const statusValue = document.getElementById('statusFilter').value;
    if (statusValue) filters.status = statusValue;
    
    const categoryValue = document.getElementById('categoryFilter').value;
    if (categoryValue) filters.category = categoryValue;
    
    loadAssets(1, filters);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    loadAssets(1);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the assets page
    if (window.location.pathname.includes('assets.html')) {
        // Load user info
        auth.loadUserInfo();
        
        // Load initial assets
        loadAssets();
        
        // Set up filter listeners
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce(applyFilters, 500));
        }
        
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', applyFilters);
        }
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', applyFilters);
        }
    }
});