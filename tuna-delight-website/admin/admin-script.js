// Enhanced Admin JavaScript dengan fitur premium dan tracking status
let currentAdminSection = 'dashboard';
let currentPaymentId = null;
let currentTransactionId = null;
let products = JSON.parse(localStorage.getItem('admin-products')) || [];
let transactions = JSON.parse(localStorage.getItem('admin-transactions')) || [];
let banners = JSON.parse(localStorage.getItem('admin-banners')) || [];
let payments = JSON.parse(localStorage.getItem('admin-payments')) || [];
let activities = JSON.parse(localStorage.getItem('admin-activities')) || [];

// KONFIGURASI NOTIFIKASI WHATSAPP KE CUSTOMER
const CUSTOMER_NOTIFICATION_CONFIG = {
    whatsapp: {
        baseUrl: 'https://wa.me/'
    }
};

// Initialize dengan data sample
function initializeSampleData() {
    if (products.length === 0) {
        products = [
            {
                id: 1,
                name: 'Bakso Tuna Original Premium',
                desc: 'Bakso ikan tuna dengan rasa original yang gurih dan tekstur kenyal sempurna. Dibuat dari 100% daging tuna pilihan.',
                price: 45000,
                category: 'bakso',
                img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format',
                stock: 50,
                featured: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Nugget Tuna Crispy',
                desc: 'Nugget ikan tuna dengan lapisan crispy golden brown yang sempurna. Cocok untuk camilan keluarga.',
                price: 32000,
                category: 'nugget',
                img: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop&auto=format',
                stock: 75,
                featured: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Tuna Steak Premium',
                desc: 'Steak tuna segar dengan bumbu spesial, siap masak dalam 10 menit. Kualitas restaurant.',
                price: 65000,
                category: 'olahan',
                img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format',
                stock: 25,
                featured: true,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('admin-products', JSON.stringify(products));
    }
    
    if (banners.length === 0) {
        banners = [
            {
                id: 1,
                title: 'Grand Opening Promo!',
                image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&h=400&fit=crop&auto=format',
                link: '#promo',
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('admin-banners', JSON.stringify(banners));
    }
}

// Login Function dengan animasi
document.getElementById('admin-login').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.querySelector('.btn-text').textContent;
    loginBtn.querySelector('.btn-text').textContent = 'Memproses...';
    loginBtn.disabled = true;
    
    setTimeout(() => {
        if (username === 'admin' && password === 'password123') {
            document.querySelector('.login-card').style.animation = 'successLogin 0.6s ease';
            
            setTimeout(() => {
                document.getElementById('login-section').classList.remove('active');
                document.getElementById('admin-dashboard').classList.remove('hidden');
                loadAdminData();
                showNotification('Selamat datang di Dashboard Tuna Delight!', 'success');
            }, 600);
        } else {
            showNotification('Username atau password salah!', 'error');
            loginBtn.querySelector('.btn-text').textContent = originalText;
            loginBtn.disabled = false;
            
            document.querySelector('.login-card').style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                document.querySelector('.login-card').style.animation = '';
            }, 500);
        }
    }, 1500);
});

// Logout dengan konfirmasi
function logout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('login-section').classList.add('active');
        document.getElementById('admin-login').reset();
        
        const loginBtn = document.querySelector('.login-btn');
        loginBtn.querySelector('.btn-text').textContent = 'Masuk ke Dashboard';
        loginBtn.disabled = false;
    }
}

// Load Admin Data
function loadAdminData() {
    // Refresh semua data dari localStorage
    products = JSON.parse(localStorage.getItem('admin-products')) || [];
    transactions = JSON.parse(localStorage.getItem('admin-transactions')) || [];
    banners = JSON.parse(localStorage.getItem('admin-banners')) || [];
    payments = JSON.parse(localStorage.getItem('admin-payments')) || [];
    activities = JSON.parse(localStorage.getItem('admin-activities')) || [];
    
    initializeSampleData();
    updateDashboardStats();
    loadRecentActivity();
    loadTransactionsTable();
}

// Navigasi section dengan smooth transition
function showAdminSection(section) {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    const contentArea = document.querySelector('.admin-content');
    contentArea.style.opacity = '0.5';
    
    setTimeout(() => {
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        document.getElementById(`admin-${section}-section`).classList.add('active');
        currentAdminSection = section;
        
        refreshSectionData(section);
        contentArea.style.opacity = '1';
    }, 300);
}

function refreshSectionData(section) {
    switch(section) {
        case 'dashboard':
            updateDashboardStats();
            loadRecentActivity();
            break;
        case 'products':
            loadProductsTable();
            break;
        case 'transactions':
            loadTransactionsTable();
            break;
        case 'banners':
            loadBannersGrid();
            break;
        case 'payments':
            loadPaymentsTable();
            break;
    }
}

// Enhanced Dashboard Stats
function updateDashboardStats() {
    // Refresh data dari localStorage
    transactions = JSON.parse(localStorage.getItem('admin-transactions')) || [];
    payments = JSON.parse(localStorage.getItem('admin-payments')) || [];
    
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-transactions').textContent = transactions.length;
    
    const totalRevenue = transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, transaction) => sum + transaction.total, 0);
    document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
    
    const pending = transactions.filter(t => t.status === 'pending' || t.status === 'processing').length;
    document.getElementById('pending-verification').textContent = pending;
    
    // Update badges
    document.getElementById('products-badge').textContent = products.length;
    document.getElementById('transactions-badge').textContent = transactions.length;
    document.getElementById('banners-badge').textContent = banners.length;
    document.getElementById('payments-badge').textContent = pending;
    document.getElementById('pending-count').textContent = pending;
}

function loadRecentActivity() {
    activities = JSON.parse(localStorage.getItem('admin-activities')) || [];
    const activityList = document.getElementById('activity-list');
    const recentActivities = activities.slice(0, 5);
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666;">
                📭 Belum ada aktivitas terbaru
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-message">${activity.message}</div>
                <div class="activity-time">${formatTimeAgo(activity.time)}</div>
            </div>
        </div>
    `).join('');
}

// ============================================
// MANAJEMEN TRANSAKSI DENGAN STATUS TRACKING
// ============================================

function loadTransactionsTable() {
    // Refresh data dari localStorage
    transactions = JSON.parse(localStorage.getItem('admin-transactions')) || [];
    
    const tbody = document.getElementById('transactions-table-body');
    
    // Update stats
    const totalCount = transactions.length;
    const pendingCount = transactions.filter(t => t.status === 'pending').length;
    const completedCount = transactions.filter(t => t.status === 'completed').length;
    
    document.getElementById('total-transactions-count').textContent = totalCount;
    document.getElementById('pending-transactions').textContent = pendingCount;
    document.getElementById('completed-transactions').textContent = completedCount;
    
    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
                    📭 Belum ada transaksi
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    tbody.innerHTML = sortedTransactions.map(transaction => `
        <tr style="cursor: pointer;" onclick="viewTransactionDetail('${transaction.id}')">
            <td>
                <strong style="color: #1565c0;">${transaction.id}</strong>
            </td>
            <td>
                <div>
                    <strong>${transaction.customer}</strong>
                    <div style="font-size: 0.8em; color: #666;">${transaction.email}</div>
                    <div style="font-size: 0.8em; color: #666;">📞 ${transaction.phone}</div>
                </div>
            </td>
            <td>
                <div style="font-size: 0.9em;">
                    ${transaction.items.slice(0, 2).map(item => 
                        `${item.name} (${item.quantity}x)`
                    ).join(', ')}
                    ${transaction.items.length > 2 ? `<br><small>+${transaction.items.length - 2} lainnya</small>` : ''}
                </div>
            </td>
            <td>
                <strong style="color: #1976d2;">Rp ${transaction.total.toLocaleString('id-ID')}</strong>
            </td>
            <td>
                ${getStatusBadge(transaction.status)}
            </td>
            <td>
                <small>${formatDateTime(transaction.date)}</small>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn-sm btn-view" onclick="event.stopPropagation(); viewTransactionDetail('${transaction.id}')" title="Lihat Detail">
                        👁️
                    </button>
                    <button class="btn-sm btn-edit" onclick="event.stopPropagation(); updateTransactionStatus('${transaction.id}')" title="Update Status">
                        ✏️
                    </button>
                    <button class="btn-sm" style="background: #4caf50; color: white;" onclick="event.stopPropagation(); notifyCustomer('${transaction.id}')" title="Notifikasi Customer">
                        📱
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusBadge(status) {
    const statusConfig = {
        'pending': { text: 'Pending', class: 'status-pending', icon: '⏳' },
        'processing': { text: 'Diproses', class: 'status-processing', icon: '🔄' },
        'completed': { text: 'Selesai', class: 'status-completed', icon: '✅' },
        'cancelled': { text: 'Dibatalkan', class: 'status-cancelled', icon: '❌' },
        'waiting_payment': { text: 'Menunggu Bayar', class: 'status-pending', icon: '💳' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return `<span class="${config.class}">${config.icon} ${config.text}</span>`;
}

// View Transaction Detail Modal
function viewTransactionDetail(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
        showNotification('Transaksi tidak ditemukan!', 'error');
        return;
    }
    
    currentTransactionId = transactionId;
    
    // Create modal
    const modalHTML = `
        <div id="transaction-detail-modal" class="modal active">
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>📋 Detail Transaksi - ${transaction.id}</h3>
                    <button onclick="closeTransactionDetailModal()" class="close-btn">×</button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <div class="transaction-detail-grid">
                        <!-- Status Section -->
                        <div class="detail-card" style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                            <h4 style="margin-bottom: 15px; color: #1565c0;">📊 Status Pesanan</h4>
                            <div style="font-size: 1.2em; margin-bottom: 10px;">
                                ${getStatusBadge(transaction.status)}
                            </div>
                            <div style="display: flex; gap: 10px; margin-top: 15px;">
                                <button onclick="changeTransactionStatus('${transaction.id}', 'processing')" class="btn-sm" style="background: #2196f3; color: white; flex: 1;">
                                    🔄 Set Diproses
                                </button>
                                <button onclick="changeTransactionStatus('${transaction.id}', 'completed')" class="btn-sm" style="background: #4caf50; color: white; flex: 1;">
                                    ✅ Set Selesai
                                </button>
                            </div>
                        </div>
                        
                        <!-- Customer Info -->
                        <div class="detail-card">
                            <h4 style="margin-bottom: 15px; color: #1565c0;">👤 Informasi Customer</h4>
                            <div class="detail-row">
                                <span class="detail-label">Nama:</span>
                                <span class="detail-value"><strong>${transaction.customer}</strong></span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Email:</span>
                                <span class="detail-value">${transaction.email}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">WhatsApp:</span>
                                <span class="detail-value">
                                    ${transaction.phone}
                                    <button onclick="openWhatsApp('${transaction.phone}')" style="margin-left: 10px; padding: 4px 8px; background: #25d366; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                        📱 Chat
                                    </button>
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Alamat:</span>
                                <span class="detail-value">${transaction.address}</span>
                            </div>
                        </div>
                        
                        <!-- Order Info -->
                        <div class="detail-card">
                            <h4 style="margin-bottom: 15px; color: #1565c0;">📦 Detail Pesanan</h4>
                            <div class="detail-row">
                                <span class="detail-label">ID Transaksi:</span>
                                <span class="detail-value"><strong>${transaction.id}</strong></span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Tanggal:</span>
                                <span class="detail-value">${formatDateTime(transaction.date)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Metode Bayar:</span>
                                <span class="detail-value">${getPaymentMethodText(transaction.paymentMethod)}</span>
                            </div>
                        </div>
                        
                        <!-- Products List -->
                        <div class="detail-card" style="grid-column: 1 / -1;">
                            <h4 style="margin-bottom: 15px; color: #1565c0;">🛒 Produk yang Dipesan</h4>
                            <div class="items-list">
                                ${transaction.items.map(item => `
                                    <div class="item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                                        <div style="display: flex; align-items: center; gap: 15px;">
                                            <img src="${item.img}" alt="${item.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                                            <div>
                                                <strong>${item.name}</strong>
                                                <div style="font-size: 0.9em; color: #666;">
                                                    ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                        <div style="font-weight: bold; color: #1976d2;">
                                            Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Payment Summary -->
                        <div class="detail-card" style="grid-column: 1 / -1; background: #f1f8e9;">
                            <h4 style="margin-bottom: 15px; color: #2e7d32;">💰 Ringkasan Pembayaran</h4>
                            <div class="detail-row">
                                <span class="detail-label">Subtotal:</span>
                                <span class="detail-value">Rp ${transaction.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Ongkos Kirim:</span>
                                <span class="detail-value">
                                    ${transaction.shipping === 0 ? 'GRATIS 🎉' : `Rp ${transaction.shipping.toLocaleString('id-ID')}`}
                                </span>
                            </div>
                            <div class="detail-row" style="border-top: 2px solid #4caf50; padding-top: 10px; margin-top: 10px;">
                                <span class="detail-label"><strong>TOTAL:</strong></span>
                                <span class="detail-value" style="font-size: 1.3em; color: #2e7d32; font-weight: bold;">
                                    Rp ${transaction.total.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button onclick="notifyCustomer('${transaction.id}')" class="submit-btn" style="background: #2196f3;">
                        📱 Kirim Notifikasi ke Customer
                    </button>
                    <button onclick="closeTransactionDetailModal()" class="cancel-btn">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('transaction-detail-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeTransactionDetailModal() {
    const modal = document.getElementById('transaction-detail-modal');
    if (modal) {
        modal.remove();
    }
}

// Update Transaction Status
function updateTransactionStatus(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    const newStatus = prompt(
        `Update status untuk ${transaction.id}\n\n` +
        `Status saat ini: ${getStatusText(transaction.status)}\n\n` +
        `Pilih status baru:\n` +
        `1. pending\n` +
        `2. processing\n` +
        `3. completed\n` +
        `4. cancelled\n\n` +
        `Masukkan pilihan (1-4):`,
        '2'
    );
    
    if (!newStatus) return;
    
    const statusMap = {
        '1': 'pending',
        '2': 'processing',
        '3': 'completed',
        '4': 'cancelled'
    };
    
    const selectedStatus = statusMap[newStatus];
    if (!selectedStatus) {
        showNotification('Pilihan tidak valid!', 'error');
        return;
    }
    
    changeTransactionStatus(transactionId, selectedStatus);
}

function changeTransactionStatus(transactionId, newStatus) {
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) return;
    
    const oldStatus = transactions[transactionIndex].status;
    transactions[transactionIndex].status = newStatus;
    transactions[transactionIndex].statusUpdatedAt = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('admin-transactions', JSON.stringify(transactions));
    
    // Update customer transactions too
    let customerTransactions = JSON.parse(localStorage.getItem('customer-transactions')) || [];
    const customerIndex = customerTransactions.findIndex(t => t.id === transactionId);
    if (customerIndex !== -1) {
        customerTransactions[customerIndex].status = newStatus;
        customerTransactions[customerIndex].statusUpdatedAt = new Date().toISOString();
        localStorage.setItem('customer-transactions', JSON.stringify(customerTransactions));
    }
    
    // Add activity log
    addActivity({
        type: 'transaction',
        message: `Status transaksi ${transactionId} diubah dari "${getStatusText(oldStatus)}" ke "${getStatusText(newStatus)}"`,
        icon: '📋'
    });
    
    // Refresh tables
    loadTransactionsTable();
    updateDashboardStats();
    
    // Close detail modal if open
    closeTransactionDetailModal();
    
    showNotification(`Status berhasil diubah menjadi "${getStatusText(newStatus)}"!`, 'success');
    
    // Auto notify customer
    if (newStatus === 'processing' || newStatus === 'completed') {
        if (confirm('Kirim notifikasi WhatsApp ke customer tentang perubahan status ini?')) {
            notifyCustomer(transactionId);
        }
    }
}

// Notify Customer via WhatsApp
function notifyCustomer(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
        showNotification('Transaksi tidak ditemukan!', 'error');
        return;
    }
    
    const statusMessages = {
        'pending': {
            title: '⏳ Pesanan Diterima',
            message: 'Pesanan Anda telah kami terima dan akan segera kami proses.'
        },
        'processing': {
            title: '🔄 Pesanan Sedang Diproses',
            message: 'Pesanan Anda sedang kami siapkan dan akan segera dikirim.'
        },
        'completed': {
            title: '✅ Pesanan Selesai',
            message: 'Pesanan Anda telah selesai diproses. Terima kasih telah berbelanja di Tuna Delight!'
        },
        'cancelled': {
            title: '❌ Pesanan Dibatalkan',
            message: 'Mohon maaf, pesanan Anda telah dibatalkan. Hubungi kami untuk informasi lebih lanjut.'
        }
    };
    
    const statusInfo = statusMessages[transaction.status] || statusMessages['pending'];
    
    const whatsappMessage = `
Halo *${transaction.customer}*! 👋

${statusInfo.title}

━━━━━━━━━━━━━━━━━━━━

📋 *DETAIL PESANAN ANDA*
🆔 ID Pesanan: *${transaction.id}*

🛒 *Produk:*
${transaction.items.map(item => `• ${item.name} (${item.quantity}x)`).join('\n')}

💰 *Total: Rp ${transaction.total.toLocaleString('id-ID')}*

📊 *Status: ${getStatusText(transaction.status)}*
📅 Tanggal: ${new Date(transaction.date).toLocaleDateString('id-ID')}

━━━━━━━━━━━━━━━━━━━━

${statusInfo.message}

Untuk informasi lebih lanjut, hubungi kami:
📞 WhatsApp: 0813-5553-3024
📧 Email: renalkulati20@gmail.com

Terima kasih telah mempercayai *Tuna Delight* 🐟

_Rasa Laut Terbaik dalam Setiap Gigitan_
    `.trim();
    
    // Clean phone number (remove +, spaces, etc)
    let cleanPhone = transaction.phone.replace(/[^0-9]/g, '');
    
    // Ensure it starts with 62
    if (!cleanPhone.startsWith('62')) {
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '62' + cleanPhone.substring(1);
        } else {
            cleanPhone = '62' + cleanPhone;
        }
    }
    
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `${CUSTOMER_NOTIFICATION_CONFIG.whatsapp.baseUrl}${cleanPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    addActivity({
        type: 'notification',
        message: `Notifikasi dikirim ke ${transaction.customer} untuk transaksi ${transaction.id}`,
        icon: '📱'
    });
    
    showNotification('Notifikasi WhatsApp dibuka! Silakan kirim pesan.', 'success');
}

function openWhatsApp(phone) {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone.startsWith('62')) {
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '62' + cleanPhone.substring(1);
        } else {
            cleanPhone = '62' + cleanPhone;
        }
    }
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Menunggu Konfirmasi',
        'processing': 'Sedang Diproses',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan',
        'waiting_payment': 'Menunggu Pembayaran'
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

// Enhanced Product Management
function loadProductsTable() {
    const tbody = document.getElementById('products-table-body');
    const searchTerm = document.getElementById('product-search')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('category-filter')?.value || '';
    
    let filteredProducts = products;
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.desc.toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.category === categoryFilter
        );
    }
    
    if (!tbody) return;
    
    tbody.innerHTML = filteredProducts.map(product => `
        <tr>
            <td>
                <img src="${product.img}" alt="${product.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
            </td>
            <td>
                <strong>${product.name}</strong>
                ${product.featured ? '<span style="color: #ffd54f; margin-left: 5px;">⭐</span>' : ''}
            </td>
            <td>
                <span class="category-badge ${product.category}">
                    ${getCategoryName(product.category)}
                </span>
            </td>
            <td><strong>${formatCurrency(product.price)}</strong></td>
            <td>
                <span class="stock-indicator ${product.stock > 20 ? 'high' : product.stock > 5 ? 'medium' : 'low'}">
                    ${product.stock}
                </span>
            </td>
            <td>
                <span class="status-${product.stock > 0 ? 'active' : 'inactive'}">
                    ${product.stock > 0 ? 'Aktif' : 'Habis'}
                </span>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn-sm btn-edit" onclick="editProduct(${product.id})" title="Edit">
                        ✏️
                    </button>
                    <button class="btn-sm btn-delete" onclick="deleteProduct(${product.id})" title="Hapus">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openProductForm(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    
    if (productId) {
        title.textContent = '✏️ Edit Produk';
        const product = products.find(p => p.id === productId);
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-desc').value = product.desc;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-img').value = product.img;
        document.getElementById('product-stock').value = product.stock || 0;
        
        updateImagePreview('product-image-preview', product.img);
    } else {
        title.textContent = '➕ Tambah Produk Baru';
        form.reset();
        document.getElementById('product-id').value = '';
        document.getElementById('product-image-preview').innerHTML = 'Gambar akan ditampilkan di sini';
    }
    
    modal.style.display = 'flex';
    modal.classList.add('active');
}

function closeProductForm() {
    document.getElementById('product-modal').style.display = 'none';
}

function editProduct(productId) {
    openProductForm(productId);
}

function deleteProduct(productId) {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('admin-products', JSON.stringify(products));
        loadProductsTable();
        updateDashboardStats();
        showNotification('Produk berhasil dihapus!', 'success');
    }
}

// Banners Management
function loadBannersGrid() {
    const grid = document.getElementById('banners-grid');
    if (!grid) return;
    
    if (banners.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                📭 Belum ada banner
            </div>
        `;
        return;
    }
    
    grid.innerHTML = banners.map(banner => `
        <div class="banner-card">
            <img src="${banner.image}" alt="${banner.title}">
            <div class="banner-info">
                <h4>${banner.title}</h4>
                <p style="font-size: 0.9em; color: #666; margin: 10px 0;">
                    ${banner.link || 'Tidak ada link'}
                </p>
                <div style="margin: 10px 0;">
                    <span class="${banner.active ? 'status-active' : 'status-inactive'}">
                        ${banner.active ? '✅ Aktif' : '❌ Nonaktif'}
                    </span>
                </div>
                <div class="banner-actions">
                    <button class="btn-sm btn-edit" onclick="editBanner(${banner.id})">
                        ✏️ Edit
                    </button>
                    <button class="btn-sm btn-delete" onclick="deleteBanner(${banner.id})">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openBannerForm() {
    document.getElementById('banner-modal').style.display = 'flex';
}

function closeBannerForm() {
    document.getElementById('banner-modal').style.display = 'none';
}

function editBanner(bannerId) {
    const banner = banners.find(b => b.id === bannerId);
    if (banner) {
        document.getElementById('banner-title').value = banner.title;
        document.getElementById('banner-image').value = banner.image;
        document.getElementById('banner-link').value = banner.link || '';
        document.getElementById('banner-active').checked = banner.active;
        openBannerForm();
    }
}

function deleteBanner(bannerId) {
    if (confirm('Apakah Anda yakin ingin menghapus banner ini?')) {
        banners = banners.filter(b => b.id !== bannerId);
        localStorage.setItem('admin-banners', JSON.stringify(banners));
        loadBannersGrid();
        showNotification('Banner berhasil dihapus!', 'success');
    }
}

// Payments Management
function loadPaymentsTable() {
    payments = JSON.parse(localStorage.getItem('admin-payments')) || [];
    const tbody = document.getElementById('payments-table-body');
    if (!tbody) return;
    
    if (payments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                    📭 Belum ada pembayaran yang perlu diverifikasi
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td><strong>${payment.orderId}</strong></td>
            <td>${payment.customer || payment.senderName}</td>
            <td>${payment.senderBank} → ${payment.targetBank}</td>
            <td><strong>Rp ${payment.amount.toLocaleString('id-ID')}</strong></td>
            <td>
                <button onclick="viewPaymentProof('${payment.id}')" class="btn-sm btn-view">
                    🖼️ Lihat
                </button>
            </td>
            <td>
                <span class="status-${payment.status}">
                    ${payment.status === 'pending' ? '⏳ Pending' : '✅ Verified'}
                </span>
            </td>
            <td><small>${formatDate(payment.date)}</small></td>
            <td>
                <div class="btn-group">
                    <button class="btn-sm" style="background: #4caf50; color: white;" onclick="verifyPayment('${payment.id}', true)">
                        ✅
                    </button>
                    <button class="btn-sm" style="background: #f44336; color: white;" onclick="verifyPayment('${payment.id}', false)">
                        ❌
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function viewPaymentProof(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    currentPaymentId = paymentId;
    
    const modal = document.getElementById('payment-proof-modal');
    document.getElementById('proof-image').src = payment.proofFile || 'https://via.placeholder.com/400x300?text=Bukti+Transfer';
    
    const details = document.getElementById('payment-details');
    details.innerHTML = `
        <div style="padding: 20px;">
            <h4 style="margin-bottom: 15px; color: #1565c0;">💳 Detail Pembayaran</h4>
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${payment.orderId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Pengirim:</span>
                <span class="detail-value">${payment.customer || payment.senderName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Bank Pengirim:</span>
                <span class="detail-value">${payment.senderBank}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Bank Tujuan:</span>
                <span class="detail-value">${payment.targetBank}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Jumlah:</span>
                <span class="detail-value"><strong>Rp ${payment.amount.toLocaleString('id-ID')}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tanggal Transfer:</span>
                <span class="detail-value">${payment.transferDate}</span>
            </div>
            ${payment.notes ? `
                <div class="detail-row">
                    <span class="detail-label">Catatan:</span>
                    <span class="detail-value">${payment.notes}</span>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closePaymentProof() {
    document.getElementById('payment-proof-modal').style.display = 'none';
}

function verifyPayment(paymentId, isApproved) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const action = isApproved ? 'menyetujui' : 'menolak';
    if (!confirm(`Apakah Anda yakin ingin ${action} pembayaran ini?`)) return;
    
    payment.status = isApproved ? 'verified' : 'rejected';
    payment.verifiedAt = new Date().toISOString();
    
    localStorage.setItem('admin-payments', JSON.stringify(payments));
    
    // Update transaction status
    const transactionIndex = transactions.findIndex(t => t.id === payment.orderId);
    if (transactionIndex !== -1) {
        transactions[transactionIndex].status = isApproved ? 'processing' : 'cancelled';
        localStorage.setItem('admin-transactions', JSON.stringify(transactions));
        
        // Update customer transactions
        let customerTransactions = JSON.parse(localStorage.getItem('customer-transactions')) || [];
        const customerIndex = customerTransactions.findIndex(t => t.id === payment.orderId);
        if (customerIndex !== -1) {
            customerTransactions[customerIndex].status = isApproved ? 'processing' : 'cancelled';
            localStorage.setItem('customer-transactions', JSON.stringify(customerTransactions));
        }
    }
    
    addActivity({
        type: 'payment',
        message: `Pembayaran ${payment.orderId} ${isApproved ? 'diverifikasi' : 'ditolak'}`,
        icon: isApproved ? '✅' : '❌'
    });
    
    closePaymentProof();
    loadPaymentsTable();
    loadTransactionsTable();
    updateDashboardStats();
    
    showNotification(
        isApproved ? 'Pembayaran berhasil diverifikasi!' : 'Pembayaran ditolak!',
        isApproved ? 'success' : 'error'
    );
}

// Utility Functions
function addActivity(activity) {
    activities = JSON.parse(localStorage.getItem('admin-activities')) || [];
    activities.unshift({
        id: 'ACT-' + Date.now(),
        ...activity,
        time: new Date().toISOString()
    });
    localStorage.setItem('admin-activities', JSON.stringify(activities));
}

function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID');
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

function getCategoryName(category) {
    const categories = {
        'bakso': 'Bakso Tuna',
        'nugget': 'Nugget Tuna',
        'olahan': 'Olahan Lainnya',
        'promo': 'Promo Spesial'
    };
    return categories[category] || category;
}

function updateImagePreview(previewId, imageUrl) {
    const preview = document.getElementById(previewId);
    if (imageUrl) {
        preview.innerHTML = `
            <img src="${imageUrl}" alt="Preview" 
                 style="max-width: 100%; max-height: 200px; border-radius: 8px;">
            <div style="margin-top: 10px; color: #666; font-size: 0.9em;">
                Preview Gambar
            </div>
        `;
    } else {
        preview.innerHTML = 'Masukkan URL gambar untuk melihat preview';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('success-notification');
    const messageEl = document.getElementById('success-message');
    
    messageEl.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function goToHomepage() {
    window.location.href = 'home.html';
}

function generateReport() {
    showNotification('Laporan sedang dipersiapkan...', 'success');
    setTimeout(() => {
        const reportData = {
            totalProducts: products.length,
            totalTransactions: transactions.length,
            totalRevenue: transactions.reduce((sum, t) => sum + t.total, 0),
            pendingPayments: payments.filter(p => p.status === 'pending').length,
            generatedAt: new Date().toISOString()
        };
        
        console.log('Generated Report:', reportData);
        showNotification('Laporan berhasil di-generate!', 'success');
    }, 2000);
}

// Real-time image preview
if (document.getElementById('product-img')) {
    document.getElementById('product-img').addEventListener('input', function(e) {
        updateImagePreview('product-image-preview', e.target.value);
    });
}

if (document.getElementById('banner-image')) {
    document.getElementById('banner-image').addEventListener('input', function(e) {
        updateImagePreview('banner-image-preview', e.target.value);
    });
}

// Search and filter functionality
if (document.getElementById('product-search')) {
    document.getElementById('product-search').addEventListener('input', loadProductsTable);
}
if (document.getElementById('category-filter')) {
    document.getElementById('category-filter').addEventListener('change', loadProductsTable);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes successLogin {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        .category-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 600;
        }
        
        .category-badge.bakso { background: #e3f2fd; color: #1565c0; }
        .category-badge.nugget { background: #fff3e0; color: #ef6c00; }
        .category-badge.olahan { background: #e8f5e8; color: #2e7d32; }
        .category-badge.promo { background: #fce4ec; color: #c2185b; }
        
        .stock-indicator {
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.8em;
        }
        
        .stock-indicator.high { background: #e8f5e8; color: #2e7d32; }
        .stock-indicator.medium { background: #fff3e0; color: #ef6c00; }
        .stock-indicator.low { background: #ffebee; color: #c62828; }
        
        .status-pending { background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600; }
        .status-processing { background: #d1edff; color: #004085; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600; }
        .status-completed { background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600; }
        .status-cancelled { background: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600; }
        .status-active { background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600; }
        .status-inactive { background: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600; }
        
        .detail-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 15px;
        }
        
        .transaction-detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 600;
            color: #666;
        }
        
        .detail-value {
            text-align: right;
            color: #333;
        }
        
        .proof-image-container {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .proof-image-container img {
            max-width: 100%;
            max-height: 400px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .verify-btn {
            background: linear-gradient(135deg, #4caf50, #66bb6a);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .verify-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
        }
        
        .reject-btn {
            background: linear-gradient(135deg, #f44336, #e57373);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .reject-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
        }
    `;
    document.head.appendChild(style);
});

// Export functions untuk global access
window.logout = logout;
window.showAdminSection = showAdminSection;
window.loadProductsTable = loadProductsTable;
window.openProductForm = openProductForm;
window.closeProductForm = closeProductForm;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewTransactionDetail = viewTransactionDetail;
window.closeTransactionDetailModal = closeTransactionDetailModal;
window.updateTransactionStatus = updateTransactionStatus;
window.changeTransactionStatus = changeTransactionStatus;
window.notifyCustomer = notifyCustomer;
window.openWhatsApp = openWhatsApp;
window.loadBannersGrid = loadBannersGrid;
window.openBannerForm = openBannerForm;
window.closeBannerForm = closeBannerForm;
window.editBanner = editBanner;
window.deleteBanner = deleteBanner;
window.loadPaymentsTable = loadPaymentsTable;
window.viewPaymentProof = viewPaymentProof;
window.closePaymentProof = closePaymentProof;
window.verifyPayment = verifyPayment;
window.goToHomepage = goToHomepage;
window.generateReport = generateReport;