
// Transactions Management JavaScript
let transactions = JSON.parse(localStorage.getItem('admin-transactions')) || [];
let currentPage = 1;
const itemsPerPage = 10;
let currentTransactionId = null;

// Initialize transactions page
document.addEventListener('DOMContentLoaded', function() {
    loadTransactions();
    setupEventListeners();
    updateStats();
});

function setupEventListeners() {
    // Search functionality
    document.getElementById('transaction-search').addEventListener('input', function(e) {
        currentPage = 1;
        loadTransactions();
    });

    // Filter functionality
    document.getElementById('status-filter').addEventListener('change', function() {
        currentPage = 1;
        loadTransactions();
    });

    document.getElementById('date-filter').addEventListener('change', function() {
        currentPage = 1;
        loadTransactions();
    });
}

function loadTransactions() {
    const searchTerm = document.getElementById('transaction-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    let filteredTransactions = transactions;
    
    // Apply search filter
    if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.id.toLowerCase().includes(searchTerm) ||
            transaction.customer.toLowerCase().includes(searchTerm) ||
            transaction.email.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply status filter
    if (statusFilter) {
        filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.status === statusFilter
        );
    }
    
    // Apply date filter
    if (dateFilter) {
        const now = new Date();
        filteredTransactions = filteredTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            
            switch(dateFilter) {
                case 'today':
                    return transactionDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return transactionDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return transactionDate >= monthAgo;
                default:
                    return true;
            }
        });
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
    
    // Update table
    updateTransactionsTable(paginatedTransactions);
    
    // Update pagination
    updatePagination(totalPages);
}

function updateTransactionsTable(transactionsToShow) {
    const tbody = document.getElementById('transactions-table-body');
    
    if (transactionsToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                    📭 Tidak ada transaksi yang ditemukan
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = transactionsToShow.map(transaction => `
        <tr>
            <td>
                <strong>${transaction.id}</strong>
            </td>
            <td>
                <div>
                    <strong>${transaction.customer}</strong>
                    <div style="font-size: 0.8em; color: #666;">${transaction.email}</div>
                    <div style="font-size: 0.8em; color: #666;">${transaction.phone}</div>
                </div>
            </td>
            <td>
                <div style="font-size: 0.9em;">
                    ${transaction.items.slice(0, 2).map(item => 
                        `${item.name} (${item.quantity}x)`
                    ).join(', ')}
                    ${transaction.items.length > 2 ? `+${transaction.items.length - 2} lainnya` : ''}
                </div>
            </td>
            <td>
                <strong>Rp ${transaction.total.toLocaleString('id-ID')}</strong>
            </td>
            <td>
                <span class="status-badge status-${transaction.status}">
                    ${getStatusText(transaction.status)}
                </span>
            </td>
            <td>
                ${getPaymentMethodText(transaction.paymentMethod)}
            </td>
            <td>
                ${formatDate(transaction.date)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewTransaction('${transaction.id}')" title="Lihat Detail">
                        👁️ Detail
                    </button>
                    <button class="btn btn-edit" onclick="editTransactionStatus('${transaction.id}')" title="Edit Status">
                        ✏️ Status
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePagination(totalPages) {
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    
    const prevBtn = document.querySelector('.page-btn:nth-child(1)');
    const nextBtn = document.querySelector('.page-btn:nth-child(3)');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function changePage(direction) {
    const totalPages = Math.ceil(getFilteredTransactions().length / itemsPerPage);
    
    if (direction === -1 && currentPage > 1) {
        currentPage--;
    } else if (direction === 1 && currentPage < totalPages) {
        currentPage++;
    }
    
    loadTransactions();
}

function getFilteredTransactions() {
    const searchTerm = document.getElementById('transaction-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    let filteredTransactions = transactions;
    
    if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.id.toLowerCase().includes(searchTerm) ||
            transaction.customer.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.status === statusFilter
        );
    }
    
    if (dateFilter) {
        const now = new Date();
        filteredTransactions = filteredTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            
            switch(dateFilter) {
                case 'today':
                    return transactionDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return transactionDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return transactionDate >= monthAgo;
                default:
                    return true;
            }
        });
    }
    
    return filteredTransactions;
}

function updateStats() {
    const totalTransactions = transactions.length;
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const totalRevenue = transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, transaction) => sum + transaction.total, 0);
    
    document.getElementById('total-transactions-count').textContent = totalTransactions;
    document.getElementById('pending-transactions').textContent = pendingTransactions;
    document.getElementById('completed-transactions').textContent = completedTransactions;
    document.getElementById('total-revenue').textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
}

function viewTransaction(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    const detailContainer = document.getElementById('transaction-detail');
    
    const subtotal = transaction.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100000 ? 0 : 15000;
    const total = subtotal + shipping;
    
    detailContainer.innerHTML = `
        <div class="detail-section">
            <h4>📋 Informasi Transaksi</h4>
            <div class="detail-row">
                <span class="detail-label">ID Transaksi:</span>
                <span class="detail-value">${transaction.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                    <span class="status-badge status-${transaction.status}">
                        ${getStatusText(transaction.status)}
                    </span>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tanggal:</span>
                <span class="detail-value">${formatDateTime(transaction.date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Metode Pembayaran:</span>
                <span class="detail-value">${getPaymentMethodText(transaction.paymentMethod)}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <h4>👤 Informasi Customer</h4>
            <div class="detail-row">
                <span class="detail-label">Nama:</span>
                <span class="detail-value">${transaction.customer}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${transaction.email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Telepon:</span>
                <span class="detail-value">${transaction.phone}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Alamat:</span>
                <span class="detail-value">${transaction.address}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <h4>🛍️ Detail Produk</h4>
            <div class="items-list">
                ${transaction.items.map(item => `
                    <div class="item-row">
                        <div class="item-info">
                            <img src="${item.img}" alt="${item.name}" class="item-image">
                            <div>
                                <strong>${item.name}</strong>
                                <div style="font-size: 0.9em; color: #666;">
                                    ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>
                        <div style="font-weight: bold;">
                            Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="detail-section">
            <h4>💰 Ringkasan Pembayaran</h4>
            <div class="detail-row">
                <span class="detail-label">Subtotal:</span>
                <span class="detail-value">Rp ${subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Ongkos Kirim:</span>
                <span class="detail-value">
                    ${shipping === 0 ? 'GRATIS' : `Rp ${shipping.toLocaleString('id-ID')}`}
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total:</span>
                <span class="detail-value" style="font-weight: bold; color: var(--primary-color);">
                    Rp ${total.toLocaleString('id-ID')}
                </span>
            </div>
        </div>
    `;
    
    document.getElementById('transaction-modal').classList.add('active');
}

function editTransactionStatus(transactionId) {
    currentTransactionId = transactionId;
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (transaction) {
        document.getElementById('new-status').value = transaction.status;
        document.getElementById('status-notes').value = '';
    }
    
    document.getElementById('status-modal').classList.add('active');
}

function updateTransactionStatus() {
    const newStatus = document.getElementById('new-status').value;
    const notes = document.getElementById('status-notes').value;
    
    if (!currentTransactionId) return;
    
    const transactionIndex = transactions.findIndex(t => t.id === currentTransactionId);
    if (transactionIndex !== -1) {
        transactions[transactionIndex].status = newStatus;
        transactions[transactionIndex].statusNotes = notes;
        transactions[transactionIndex].statusUpdated = new Date().toISOString();
        
        localStorage.setItem('admin-transactions', JSON.stringify(transactions));
        
        // Update activity log
        addActivity({
            type: 'transaction',
            message: `Status transaksi ${currentTransactionId} diubah menjadi ${getStatusText(newStatus)}`,
            icon: '💳'
        });
        
        loadTransactions();
        updateStats();
        closeStatusModal();
        
        showNotification(`Status transaksi berhasil diubah menjadi ${getStatusText(newStatus)}`, 'success');
    }
}

function closeTransactionModal() {
    document.getElementById('transaction-modal').classList.remove('active');
}

function closeStatusModal() {
    document.getElementById('status-modal').classList.remove('active');
    currentTransactionId = null;
}

// Utility Functions
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pending',
        'processing': 'Processing',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function getPaymentMethodText(method) {
    const methods = {
        'cod': 'Bayar di Tempat (COD)',
        'transfer': 'Transfer Bank',
        'ewallet': 'E-Wallet'
    };
    return methods[method] || method;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function addActivity(activity) {
    let activities = JSON.parse(localStorage.getItem('admin-activities')) || [];
    activities.unshift({
        id: 'ACT-' + Date.now(),
        ...activity,
        time: new Date().toISOString()
    });
    localStorage.setItem('admin-activities', JSON.stringify(activities));
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function goToDashboard() {
    window.location.href = 'admin.html';
}

// Export functions for global access
window.viewTransaction = viewTransaction;
window.editTransactionStatus = editTransactionStatus;
window.closeTransactionModal = closeTransactionModal;
window.closeStatusModal = closeStatusModal;
window.updateTransactionStatus = updateTransactionStatus;
window.changePage = changePage;
window.goToDashboard = goToDashboard;
