/**
 * TUNA DELIGHT - SYNC ENGINE
 * Menghubungkan Admin & Customer secara real-time
 * File ini HARUS ADA di kedua sistem (admin & customer)
 */

// ============================================
// KONFIGURASI SHARED STORAGE KEYS
// ============================================
const SHARED_KEYS = {
    TRANSACTIONS: 'SHARED_transactions',        // Semua transaksi
    PAYMENTS: 'SHARED_payments',                // Bukti transfer
    PRODUCTS: 'SHARED_products',                // Data produk
    BANNERS: 'SHARED_banners',                  // Banner promo
    ACTIVITIES: 'SHARED_activities',            // Log aktivitas
    SYNC_TIMESTAMP: 'SHARED_sync_timestamp',    // Waktu terakhir sync
    LAST_ORDER_ID: 'SHARED_last_order_id'       // ID pesanan terakhir
};

// ============================================
// SYNC ENGINE CLASS
// ============================================
class TunaDelightSyncEngine {
    constructor() {
        this.isInitialized = false;
        this.syncInterval = null;
        this.listeners = {};
    }

    /**
     * Initialize Sync Engine
     */
    init() {
        if (this.isInitialized) return;
        
        console.log('🔄 Tuna Delight Sync Engine initialized');
        this.isInitialized = true;
        
        // Migrate old data to shared storage
        this.migrateOldData();
        
        // Listen to storage changes from other tabs/windows
        window.addEventListener('storage', (e) => this.handleStorageChange(e));
        
        // Periodic sync check (every 3 seconds)
        this.startAutoSync();
        
        return this;
    }

    /**
     * Migrate data lama ke shared storage
     */
    migrateOldData() {
        // Migrate transactions
        const oldAdminTrans = localStorage.getItem('admin-transactions');
        const oldCustomerTrans = localStorage.getItem('customer-transactions');
        
        if (oldAdminTrans && !localStorage.getItem(SHARED_KEYS.TRANSACTIONS)) {
            localStorage.setItem(SHARED_KEYS.TRANSACTIONS, oldAdminTrans);
            console.log('✅ Migrated admin-transactions to SHARED_transactions');
        }
        
        if (oldCustomerTrans && !localStorage.getItem(SHARED_KEYS.TRANSACTIONS)) {
            localStorage.setItem(SHARED_KEYS.TRANSACTIONS, oldCustomerTrans);
            console.log('✅ Migrated customer-transactions to SHARED_transactions');
        }

        // Migrate payments
        const oldPayments = localStorage.getItem('admin-payments');
        if (oldPayments && !localStorage.getItem(SHARED_KEYS.PAYMENTS)) {
            localStorage.setItem(SHARED_KEYS.PAYMENTS, oldPayments);
            console.log('✅ Migrated admin-payments to SHARED_payments');
        }

        // Migrate products
        const oldProducts = localStorage.getItem('admin-products');
        if (oldProducts && !localStorage.getItem(SHARED_KEYS.PRODUCTS)) {
            localStorage.setItem(SHARED_KEYS.PRODUCTS, oldProducts);
            console.log('✅ Migrated admin-products to SHARED_products');
        }

        // Migrate banners
        const oldBanners = localStorage.getItem('admin-banners');
        if (oldBanners && !localStorage.getItem(SHARED_KEYS.BANNERS)) {
            localStorage.setItem(SHARED_KEYS.BANNERS, oldBanners);
            console.log('✅ Migrated admin-banners to SHARED_banners');
        }

        // Migrate activities
        const oldActivities = localStorage.getItem('admin-activities');
        if (oldActivities && !localStorage.getItem(SHARED_KEYS.ACTIVITIES)) {
            localStorage.setItem(SHARED_KEYS.ACTIVITIES, oldActivities);
            console.log('✅ Migrated admin-activities to SHARED_activities');
        }
    }

    /**
     * Start auto sync timer
     */
    startAutoSync() {
        if (this.syncInterval) return;
        
        this.syncInterval = setInterval(() => {
            this.updateSyncTimestamp();
        }, 3000); // Check every 3 seconds
    }

    /**
     * Stop auto sync
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Update sync timestamp
     */
    updateSyncTimestamp() {
        const timestamp = new Date().toISOString();
        localStorage.setItem(SHARED_KEYS.SYNC_TIMESTAMP, timestamp);
    }

    /**
     * Handle storage change events (dari tab/window lain)
     */
    handleStorageChange(event) {
        // Ignore if not our shared keys
        if (!event.key || !event.key.startsWith('SHARED_')) return;
        
        console.log('🔄 Storage changed:', event.key);
        
        // Trigger listeners for this key
        const listeners = this.listeners[event.key] || [];
        listeners.forEach(callback => {
            try {
                callback(JSON.parse(event.newValue), JSON.parse(event.oldValue));
            } catch (e) {
                callback(event.newValue, event.oldValue);
            }
        });

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('tunaDelightSync', {
            detail: {
                key: event.key,
                newValue: event.newValue,
                oldValue: event.oldValue
            }
        }));
    }

    /**
     * Listen to specific key changes
     */
    on(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    }

    /**
     * Remove listener
     */
    off(key, callback) {
        if (!this.listeners[key]) return;
        this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    }

    // ============================================
    // TRANSACTIONS METHODS
    // ============================================

    /**
     * Get all transactions
     */
    getTransactions() {
        const data = localStorage.getItem(SHARED_KEYS.TRANSACTIONS);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save transactions
     */
    saveTransactions(transactions) {
        localStorage.setItem(SHARED_KEYS.TRANSACTIONS, JSON.stringify(transactions));
        this.updateSyncTimestamp();
        
        // Also update old keys for backward compatibility
        localStorage.setItem('admin-transactions', JSON.stringify(transactions));
        localStorage.setItem('customer-transactions', JSON.stringify(transactions));
        
        console.log('✅ Transactions saved and synced');
    }

    /**
     * Add new transaction
     */
    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transactions.push(transaction);
        this.saveTransactions(transactions);
        
        // Save last order ID
        localStorage.setItem(SHARED_KEYS.LAST_ORDER_ID, transaction.id);
        
        console.log('✅ New transaction added:', transaction.id);
        return transaction;
    }

    /**
     * Update transaction
     */
    updateTransaction(transactionId, updates) {
        const transactions = this.getTransactions();
        const index = transactions.findIndex(t => t.id === transactionId);
        
        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...updates };
            this.saveTransactions(transactions);
            console.log('✅ Transaction updated:', transactionId);
            return transactions[index];
        }
        
        return null;
    }

    /**
     * Update transaction status
     */
    updateTransactionStatus(transactionId, newStatus) {
        return this.updateTransaction(transactionId, {
            status: newStatus,
            statusUpdatedAt: new Date().toISOString()
        });
    }

    /**
     * Get transaction by ID
     */
    getTransaction(transactionId) {
        const transactions = this.getTransactions();
        return transactions.find(t => t.id === transactionId);
    }

    // ============================================
    // PAYMENTS METHODS
    // ============================================

    /**
     * Get all payments
     */
    getPayments() {
        const data = localStorage.getItem(SHARED_KEYS.PAYMENTS);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save payments
     */
    savePayments(payments) {
        localStorage.setItem(SHARED_KEYS.PAYMENTS, JSON.stringify(payments));
        this.updateSyncTimestamp();
        
        // Backward compatibility
        localStorage.setItem('admin-payments', JSON.stringify(payments));
        localStorage.setItem('customer-payments', JSON.stringify(payments));
        
        console.log('✅ Payments saved and synced');
    }

    /**
     * Add payment
     */
    addPayment(payment) {
        const payments = this.getPayments();
        payments.push(payment);
        this.savePayments(payments);
        console.log('✅ Payment added:', payment.id);
        return payment;
    }

    /**
     * Update payment status
     */
    updatePaymentStatus(paymentId, status) {
        const payments = this.getPayments();
        const index = payments.findIndex(p => p.id === paymentId);
        
        if (index !== -1) {
            payments[index].status = status;
            payments[index].verifiedAt = new Date().toISOString();
            this.savePayments(payments);
            console.log('✅ Payment status updated:', paymentId);
            return payments[index];
        }
        
        return null;
    }

    // ============================================
    // PRODUCTS METHODS
    // ============================================

    /**
     * Get all products
     */
    getProducts() {
        const data = localStorage.getItem(SHARED_KEYS.PRODUCTS);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save products
     */
    saveProducts(products) {
        localStorage.setItem(SHARED_KEYS.PRODUCTS, JSON.stringify(products));
        this.updateSyncTimestamp();
        localStorage.setItem('admin-products', JSON.stringify(products));
        console.log('✅ Products saved and synced');
    }

    // ============================================
    // ACTIVITIES METHODS
    // ============================================

    /**
     * Get all activities
     */
    getActivities() {
        const data = localStorage.getItem(SHARED_KEYS.ACTIVITIES);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Add activity log
     */
    addActivity(activity) {
        const activities = this.getActivities();
        activities.unshift({
            id: 'ACT-' + Date.now(),
            ...activity,
            time: new Date().toISOString()
        });
        
        // Keep only last 50 activities
        const trimmed = activities.slice(0, 50);
        
        localStorage.setItem(SHARED_KEYS.ACTIVITIES, JSON.stringify(trimmed));
        localStorage.setItem('admin-activities', JSON.stringify(trimmed));
        this.updateSyncTimestamp();
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    /**
     * Clear all shared data (untuk testing)
     */
    clearAllData() {
        Object.values(SHARED_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('🗑️ All shared data cleared');
    }

    /**
     * Get sync status
     */
    getSyncStatus() {
        const timestamp = localStorage.getItem(SHARED_KEYS.SYNC_TIMESTAMP);
        return {
            lastSync: timestamp ? new Date(timestamp) : null,
            isOnline: navigator.onLine,
            transactionCount: this.getTransactions().length,
            paymentCount: this.getPayments().length
        };
    }

    /**
     * Force sync all data
     */
    forceSync() {
        console.log('🔄 Force syncing all data...');
        
        // Re-save all data to trigger sync
        const transactions = this.getTransactions();
        const payments = this.getPayments();
        const products = this.getProducts();
        
        this.saveTransactions(transactions);
        this.savePayments(payments);
        this.saveProducts(products);
        
        console.log('✅ Force sync completed');
    }
}

// ============================================
// INITIALIZE GLOBAL SYNC ENGINE
// ============================================
const syncEngine = new TunaDelightSyncEngine();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        syncEngine.init();
    });
} else {
    syncEngine.init();
}

// Export untuk digunakan di file lain
window.TunaDelightSync = syncEngine;

// Debug info
console.log('🐟 Tuna Delight Sync Engine loaded');
console.log('📊 Sync Status:', syncEngine.getSyncStatus());