// Struk dan Riwayat Transaksi dengan Real-time Status Tracking
let transactions = [];
let currentReceiptTransaction = null;
let autoRefreshInterval = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadTransactions();
    setupSampleData();
    startAutoRefresh();
});

// Auto refresh setiap 5 detik untuk update status
function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        loadTransactions();
    }, 5000); // Refresh every 5 seconds
}

// Stop auto refresh saat page tidak aktif
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
    } else {
        startAutoRefresh();
    }
});

function setupSampleData() {
    // Sample data hanya untuk demo jika tidak ada transaksi
    if (transactions.length === 0) {
        const sampleTransactions = [
            {
                id: 'TRX-SAMPLE-' + Date.now(),
                customer: 'Customer Demo',
                email: 'demo@example.com',
                phone: '081234567890',
                address: 'Jl. Contoh No. 123, Jakarta',
                items: [
                    {
                        id: 1,
                        name: 'Bakso Tuna Original',
                        price: 35000,
                        quantity: 2,
                        img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format'
                    }
                ],
                subtotal: 70000,
                shipping: 15000,
                total: 85000,
                paymentMethod: 'cod',
                status: 'pending',
                date: new Date().toISOString(),
                statusHistory: [
                    {
                        status: 'pending',
                        timestamp: new Date().toISOString(),
                        message: 'Pesanan diterima, menunggu konfirmasi'
                    }
                ]
            }
        ];
        
        // Jangan overwrite jika sudah ada transaksi real
        const existingTransactions = JSON.parse(localStorage.getItem('customer-transactions')) || [];
        if (existingTransactions.length === 0) {
            localStorage.setItem('customer-transactions', JSON.stringify(sampleTransactions));
        }
    }
}

function loadTransactions() {
    // Load dari localStorage dengan refresh
    transactions = JSON.parse(localStorage.getItem('customer-transactions')) || [];
    
    const statusFilter = document.getElementById('status-filter').value;
    const periodFilter = document.getElementById('period-filter').value;
    const searchTerm = document.getElementById('search-transactions').value.toLowerCase();
    
    let filteredTransactions = transactions;
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.status === statusFilter
        );
    }
    
    // Apply period filter
    if (periodFilter !== 'all') {
        const now = new Date();
        filteredTransactions = filteredTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            
            switch(periodFilter) {
                case 'today':
                    return transactionDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return transactionDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return transactionDate >= monthAgo;
                case 'last3months':
                    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    return transactionDate >= threeMonthsAgo;
                default:
                    return true;
            }
        });
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(transaction => 
            transaction.id.toLowerCase().includes(searchTerm) ||
            transaction.customer.toLowerCase().includes(searchTerm) ||
            transaction.items.some(item => item.name.toLowerCase().includes(searchTerm))
        );
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    displayTransactions(filteredTransactions);
}

function displayTransactions(transactionsToShow) {
    const container = document.getElementById('transactions-list');
    const emptyState = document.getElementById('empty-state');
    
    if (transactionsToShow.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    
    container.innerHTML = transactionsToShow.map(transaction => `
        <div class="transaction-card" onclick="showTransactionDetail('${transaction.id}')">
            <div class="transaction-header">
                <div class="transaction-info">
                    <h3>Pesanan #${transaction.id}</h3>
                    <div class="transaction-id">ID: ${transaction.id}</div>
                </div>
                <div class="transaction-status-badge">
                    ${getStatusBadgeHTML(transaction.status)}
                </div>
            </div>
            
            <!-- Status Timeline -->
            <div class="status-timeline">
                ${getStatusTimeline(transaction.status)}
            </div>
            
            <div class="transaction-details">
                <div class="detail-item">
                    <span class="detail-label">📅 Tanggal</span>
                    <span class="detail-value">${formatDateTime(transaction.date)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">💰 Total</span>
                    <span class="detail-value">Rp ${transaction.total.toLocaleString('id-ID')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">💳 Metode Bayar</span>
                    <span class="detail-value">${getPaymentMethodText(transaction.paymentMethod)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">📦 Items</span>
                    <span class="detail-value">${transaction.items.length} produk</span>
                </div>
            </div>
            
            <div class="transaction-items">
                <div class="items-preview">
                    ${transaction.items.slice(0, 3).map(item => `
                        <div class="item-preview">
                            <img src="${item.img}" alt="${item.name}">
                            <span>${item.name} (${item.quantity})</span>
                        </div>
                    `).join('')}
                    ${transaction.items.length > 3 ? 
                        `<div class="item-preview">+${transaction.items.length - 3} lainnya</div>` : ''}
                </div>
            </div>
            
            <!-- Status Message -->
            <div class="status-message ${transaction.status}">
                ${getStatusMessage(transaction.status)}
            </div>
            
            <div class="transaction-actions">
                <button class="action-btn btn-receipt" onclick="event.stopPropagation(); showReceipt('${transaction.id}')">
                    🧾 Lihat Struk
                </button>
                <button class="action-btn btn-reorder" onclick="event.stopPropagation(); reorder('${transaction.id}')">
                    🔄 Pesan Lagi
                </button>
                <button class="action-btn btn-complain" onclick="event.stopPropagation(); contactSupport('${transaction.id}')">
                    💬 Bantuan
                </button>
            </div>
        </div>
    `).join('');
}

function getStatusBadgeHTML(status) {
    const statusConfig = {
        'pending': { text: 'Menunggu Konfirmasi', class: 'status-pending', icon: '⏳', color: '#ff9800' },
        'processing': { text: 'Sedang Diproses', class: 'status-processing', icon: '🔄', color: '#2196f3' },
        'completed': { text: 'Selesai', class: 'status-completed', icon: '✅', color: '#4caf50' },
        'cancelled': { text: 'Dibatalkan', class: 'status-cancelled', icon: '❌', color: '#f44336' },
        'waiting_payment': { text: 'Menunggu Pembayaran', class: 'status-pending', icon: '💳', color: '#ff9800' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return `<span class="${config.class}" style="background: ${config.color}15; color: ${config.color}; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 0.9em;">${config.icon} ${config.text}</span>`;
}

function getStatusTimeline(status) {
    const steps = [
        { key: 'pending', label: 'Diterima', icon: '📋' },
        { key: 'processing', label: 'Diproses', icon: '🔄' },
        { key: 'completed', label: 'Selesai', icon: '✅' }
    ];
    
    const statusOrder = ['pending', 'processing', 'completed'];
    const currentIndex = statusOrder.indexOf(status);
    
    if (status === 'cancelled') {
        return `
            <div class="timeline">
                <div class="timeline-step cancelled">
                    <div class="timeline-icon">❌</div>
                    <div class="timeline-label">Dibatalkan</div>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="timeline">
            ${steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const status = isCompleted ? 'completed' : (isActive ? 'active' : 'pending');
                
                return `
                    <div class="timeline-step ${status}">
                        <div class="timeline-icon">${step.icon}</div>
                        <div class="timeline-label">${step.label}</div>
                    </div>
                    ${index < steps.length - 1 ? '<div class="timeline-line ' + (isCompleted ? 'completed' : '') + '"></div>' : ''}
                `;
            }).join('')}
        </div>
    `;
}

function getStatusMessage(status) {
    const messages = {
        'pending': '⏳ Pesanan Anda telah diterima dan menunggu konfirmasi dari admin.',
        'processing': '🔄 Pesanan Anda sedang diproses dan akan segera dikirim.',
        'completed': '✅ Pesanan Anda telah selesai! Terima kasih telah berbelanja di Tuna Delight.',
        'cancelled': '❌ Pesanan Anda telah dibatalkan. Hubungi admin untuk informasi lebih lanjut.',
        'waiting_payment': '💳 Menunggu pembayaran. Silakan upload bukti transfer.'
    };
    
    return messages[status] || messages['pending'];
}

function showTransactionDetail(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    const modalHTML = `
        <div id="transaction-detail-modal" class="modal active">
            <div class="modal-content large" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>📋 Detail Pesanan - ${transaction.id}</h3>
                    <button onclick="closeTransactionDetail()" class="close-btn">×</button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <!-- Status Timeline -->
                    <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 25px; border-radius: 15px; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 20px; text-align: center; color: #1565c0;">📊 Status Pesanan</h4>
                        ${getStatusTimeline(transaction.status)}
                        <div style="text-align: center; margin-top: 20px; padding: 15px; background: white; border-radius: 10px;">
                            ${getStatusBadgeHTML(transaction.status)}
                            <p style="margin-top: 10px; color: #666; font-size: 0.9em;">
                                ${getStatusMessage(transaction.status)}
                            </p>
                        </div>
                    </div>
                    
                    <!-- Detail Info -->
                    <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; border: 1px solid #e0e0e0;">
                        <h4 style="margin-bottom: 15px; color: #1565c0;">📦 Informasi Pesanan</h4>
                        <div class="detail-row">
                            <span class="detail-label">🆔 ID Transaksi:</span>
                            <span class="detail-value"><strong>${transaction.id}</strong></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">📅 Tanggal:</span>
                            <span class="detail-value">${formatDateTime(transaction.date)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">💳 Metode Bayar:</span>
                            <span class="detail-value">${getPaymentMethodText(transaction.paymentMethod)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">📍 Alamat:</span>
                            <span class="detail-value">${transaction.address}</span>
                        </div>
                    </div>
                    
                    <!-- Products -->
                    <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; border: 1px solid #e0e0e0;">
                        <h4 style="margin-bottom: 15px; color: #1565c0;">🛒 Produk yang Dipesan</h4>
                        ${transaction.items.map(item => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <img src="${item.img}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
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
                    
                    <!-- Summary -->
                    <div style="background: #f1f8e9; padding: 20px; border-radius: 10px; border: 1px solid #c5e1a5;">
                        <h4 style="margin-bottom: 15px; color: #2e7d32;">💰 Ringkasan Pembayaran</h4>
                        <div class="detail-row">
                            <span class="detail-label">Subtotal:</span>
                            <span class="detail-value">Rp ${transaction.subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Ongkir:</span>
                            <span class="detail-value">${transaction.shipping === 0 ? 'GRATIS 🎉' : `Rp ${transaction.shipping.toLocaleString('id-ID')}`}</span>
                        </div>
                        <div class="detail-row" style="border-top: 2px solid #4caf50; padding-top: 10px; margin-top: 10px;">
                            <span class="detail-label"><strong>TOTAL:</strong></span>
                            <span class="detail-value" style="font-size: 1.3em; color: #2e7d32; font-weight: bold;">
                                Rp ${transaction.total.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Contact Support -->
                    <div style="text-align: center; margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 10px;">
                        <p style="color: #666; margin-bottom: 10px;">Butuh bantuan dengan pesanan ini?</p>
                        <button onclick="contactSupport('${transaction.id}')" style="background: #25d366; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            💬 Hubungi Admin via WhatsApp
                        </button>
                    </div>
                </div>
                <div class="modal-actions">
                    <button onclick="showReceipt('${transaction.id}')" class="submit-btn" style="background: #2196f3;">
                        🧾 Lihat Struk
                    </button>
                    <button onclick="closeTransactionDetail()" class="cancel-btn">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('transaction-detail-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeTransactionDetail() {
    const modal = document.getElementById('transaction-detail-modal');
    if (modal) {
        modal.remove();
    }
}

function showReceipt(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    currentReceiptTransaction = transaction;
    
    const subtotal = transaction.subtotal || transaction.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = transaction.shipping || (subtotal > 100000 ? 0 : 15000);
    const total = transaction.total || (subtotal + shipping);
    
    const receiptContent = document.getElementById('receipt-content');
    receiptContent.innerHTML = `
        <div class="receipt">
            <div class="receipt-header">
                <h2>TUNA DELIGHT</h2>
                <p>Specialis Bakso & Nugget Ikan Tuna</p>
                <p>📞 0813-5553-3024 | 📧 renalkulati20@gmail.com</p>
                <p>${formatReceiptDate(transaction.date)}</p>
            </div>
            
            <div class="receipt-details">
                <div class="receipt-row">
                    <span class="receipt-label">ID Transaksi:</span>
                    <span class="receipt-value">${transaction.id}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Customer:</span>
                    <span class="receipt-value">${transaction.customer}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Status:</span>
                    <span class="receipt-value">
                        ${getStatusText(transaction.status)}
                    </span>
                </div>
            </div>
            
            <div class="receipt-items">
                <div style="text-align: center; margin-bottom: 10px; font-weight: bold;">
                    DETAIL PRODUK
                </div>
                ${transaction.items.map(item => `
                    <div class="receipt-item">
                        <div class="item-name">${item.name}</div>
                        <div class="item-quantity">${item.quantity}x</div>
                        <div class="item-price">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="receipt-totals">
                <div class="receipt-row">
                    <span class="receipt-label">Subtotal:</span>
                    <span class="receipt-value">Rp ${subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Ongkos Kirim:</span>
                    <span class="receipt-value">${shipping === 0 ? 'GRATIS' : `Rp ${shipping.toLocaleString('id-ID')}`}</span>
                </div>
                <div class="total-row grand-total">
                    <span>TOTAL:</span>
                    <span>Rp ${total.toLocaleString('id-ID')}</span>
                </div>
            </div>
            
            <div class="receipt-footer">
                <p><strong>Terima kasih atas pembelian Anda!</strong></p>
                <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
                <p>Untuk pertanyaan hubungi: 0813-5553-3024</p>
                <p style="margin-top: 10px; font-style: italic;">"Rasa Laut Terbaik dalam Setiap Gigitan"</p>
            </div>
        </div>
    `;
    
    document.getElementById('receipt-modal').classList.add('active');
}

function printReceipt() {
    window.print();
}

function closeReceipt() {
    document.getElementById('receipt-modal').classList.remove('active');
    currentReceiptTransaction = null;
}

function printAllReceipts() {
    if (transactions.length > 0) {
        showReceipt(transactions[0].id);
        setTimeout(() => {
            printReceipt();
        }, 500);
    }
}

function reorder(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    transaction.items.forEach(item => {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                img: item.img
            });
        }
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    showNotification('Produk berhasil ditambahkan ke keranjang! 🛒');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function contactSupport(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    const message = `Halo Admin Tuna Delight! Saya butuh bantuan untuk transaksi ${transaction.id}. Status: ${getStatusText(transaction.status)}`;
    const whatsappUrl = `https://wa.me/6281355533024?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function filterTransactions() {
    loadTransactions();
}

// Utility Functions
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

function formatReceiptDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50, #66bb6a);
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
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function goToHome() {
    window.location.href = 'home.html';
}

function goToProducts() {
    window.location.href = 'index.html';
}

// Export functions for global access
window.showReceipt = showReceipt;
window.closeReceipt = closeReceipt;
window.printReceipt = printReceipt;
window.printAllReceipts = printAllReceipts;
window.reorder = reorder;
window.contactSupport = contactSupport;
window.filterTransactions = filterTransactions;
window.goToHome = goToHome;
window.goToProducts = goToProducts;
window.showTransactionDetail = showTransactionDetail;
window.closeTransactionDetail = closeTransactionDetail;