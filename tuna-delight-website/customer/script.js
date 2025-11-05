// Data Produk Tuna dengan gambar yang lebih realistis
const products = [
    { 
        id: 1, 
        name: 'Bakso Tuna Original', 
        desc: 'Bakso ikan tuna dengan rasa original yang gurih dan tekstur yang kenyal!', 
        price: 35000, 
        category: 'bakso', 
        img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format' 
    },
    { 
        id: 2, 
        name: 'Bakso Tuna Pedas', 
        desc: 'Bakso tuna dengan level pedas yang menggugah selera, perfect untuk pecinta pedas!', 
        price: 38000, 
        category: 'bakso', 
        img: 'https://images.unsplash.com/photo-1563379091339-03246963d96f?w=400&h=300&fit=crop&auto=format' 
    },
    { 
        id: 3, 
        name: 'Bakso Tuna Keju', 
        desc: 'Bakso tuna dengan isian keju mozzarella yang lumer di mulut!', 
        price: 42000, 
        category: 'bakso', 
        img: 'https://images.unsplash.com/photo-1563379922898-7b23deea60a7?w=400&h=300&fit=crop&auto=format' 
    },
    { 
        id: 4, 
        name: 'Nugget Tuna Crispy', 
        desc: 'Nugget ikan tuna dengan lapisan crispy golden brown yang sempurna!', 
        price: 28000, 
        category: 'nugget', 
        img: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop&auto=format' 
    },
    { 
        id: 5, 
        name: 'Nugget Tuna Sayur', 
        desc: 'Nugget tuna campur sayuran segar untuk keluarga sehat dan bergizi!', 
        price: 32000, 
        category: 'nugget', 
        img: 'https://images.unsplash.com/photo-1594489574897-3b9d706e7f6a?w=400&h=300&fit=crop&auto=format' 
    },
    { 
        id: 6, 
        name: 'Nugget Tuna Pedas Manis', 
        desc: 'Nugget tuna dengan saus pedas manis spesial yang bikin ketagihan!', 
        price: 35000, 
        category: 'nugget', 
        img: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop&auto=format' 
    },
    { 
        id: 7, 
        name: 'Tuna Burger Premium', 
        desc: 'Burger premium dengan patty tuna 100% asli dan sayuran segar!', 
        price: 25000, 
        category: 'olahan', 
        img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format' 
    },
    { 
        id: 8, 
        name: 'Sosis Tuna', 
        desc: 'Sosis dari daging tuna asli tanpa pengawet, rendah lemak tinggi protein!', 
        price: 22000, 
        category: 'olahan', 
        img: 'https://images.unsplash.com/photo-1587339275489-03de0dcc8f5a?w=400&h=300&fit=crop&auto=format' 
    },
    { 
        id: 9, 
        name: 'Bakso Tuna Komplit', 
        desc: 'Paket bakso tuna lengkap dengan kuah kaldu tulang sapi yang gurih!', 
        price: 45000, 
        category: 'promo', 
        img: 'https://images.unsplash.com/photo-1555072956-7758af8e8e39?w=400&h=300&fit=crop&auto=format' 
    },
    { 
        id: 10, 
        name: 'Family Pack Nugget', 
        desc: 'Paket keluarga nugget tuna berbagai varian, cocok untuk semua usia!', 
        price: 85000, 
        category: 'promo', 
        img: 'https://images.unsplash.com/photo-1606755962773-d324e2dabd76?w=400&h=300&fit=crop&auto=format' 
    },
    { 
        id: 11, 
        name: 'Tuna Steak Premium', 
        desc: 'Steak tuna segar dengan bumbu spesial, siap masak dalam 10 menit!', 
        price: 55000, 
        category: 'olahan', 
        img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format' 
    },
    { 
        id: 12, 
        name: 'Keripik Tuna Renyah', 
        desc: 'Keripik tuna dengan tekstur renyah dan rasa gurih yang pas!', 
        price: 18000, 
        category: 'olahan', 
        img: 'https://images.unsplash.com/photo-1566476429725-6c0aaa8bcbfa?w=400&h=300&fit=crop&auto=format' 
    }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentProduct = null;
let currentSection = 'home';
let isAnimating = false;
let selectedPaymentMethod = 'cod';
let currentCheckoutStep = 1;

// KONFIGURASI WHATSAPP
const NOTIFICATION_CONFIG = {
    whatsapp: {
        phone: '6281355533024',
        message: 'Halo Admin Tuna Delight! 🟢 Ada pesanan baru dari customer:'
    },
    email: {
        to: 'renalkulati20@gmail.com',
        subject: 'Pesanan Baru - Tuna Delight'
    },
    admin: {
        name: 'Rena Lkulati',
        store: 'Tuna Delight'
    }
};

// Wait for sync engine to be ready
let syncEngine = null;
document.addEventListener('DOMContentLoaded', function() {
    // Get sync engine instance
    syncEngine = window.TunaDelightSync;
    
    if (syncEngine) {
        console.log('✅ Sync Engine connected to customer app');
    } else {
        console.warn('⚠️ Sync Engine not found - falling back to localStorage');
    }
    
    initializeApp();
});

function initializeApp() {
    // Hide search bar initially
    document.querySelector('.search')?.classList.add('hidden');
    
    // Tampilkan section berdasarkan URL hash
    const hash = window.location.hash.replace('#', '');
    const initialSection = (hash === 'home' || hash === 'products') ? hash : 'home';
    showSection(initialSection);
    
    // Inisialisasi produk
    displayProducts();
    updateCartCount();
    
    // Initialize payment methods
    updatePaymentMethods();
    
    // Tambahkan partikel
    for (let i = 0; i < 15; i++) {
        createParticle();
    }
    
    // Handle resize untuk mobile
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (currentSection === 'products') {
                displayProducts();
            }
        }, 250);
    });
}

// Fungsi untuk mengirim notifikasi WhatsApp ke Admin - TAHAP 2
function sendOrderNotificationToWhatsApp(orderData) {
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100000 ? 0 : 15000;
    const total = subtotal + shipping;
    
    const whatsappMessage = `
${NOTIFICATION_CONFIG.whatsapp.message}

🟢 *PESANAN BARU - TUNA DELIGHT* 🐟
━━━━━━━━━━━━━━━━━━━━

📋 *DETAIL PESANAN*
🆔 ID Pesanan: ${orderData.orderId}

👤 *DATA CUSTOMER:*
Nama: ${orderData.customer}
📧 Email: ${orderData.email}
📞 WhatsApp: ${orderData.phone}
📍 Alamat: ${orderData.address}

🛒 *PRODUK YANG DIPESAN:*
${orderData.items.map(item => `• ${item.name}
   ${item.quantity}x @ Rp ${item.price.toLocaleString('id-ID')}
   Subtotal: Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━

💰 *RINGKASAN PEMBAYARAN:*
Subtotal Produk: Rp ${subtotal.toLocaleString('id-ID')}
Ongkos Kirim: ${shipping === 0 ? 'GRATIS 🎉' : `Rp ${shipping.toLocaleString('id-ID')}`}
━━━━━━━━━━━━━━━━━━━━
*TOTAL BAYAR: Rp ${total.toLocaleString('id-ID')}*

💳 Metode Pembayaran: ${getPaymentMethodText(orderData.paymentMethod)}
📅 Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
⏰ Waktu: ${new Date().toLocaleTimeString('id-ID')}

━━━━━━━━━━━━━━━━━━━━

_Silahkan proses pesanan ini segera dan konfirmasi ke customer._

*Tuna Delight* 🐟
Specialis Bakso & Nugget Ikan Tuna Premium
📞 0813-5553-3024
📧 renalkulati20@gmail.com
    `.trim();

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${NOTIFICATION_CONFIG.whatsapp.phone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    console.log('📱 WhatsApp notification sent to:', NOTIFICATION_CONFIG.whatsapp.phone);
}

// TAHAP 1 -> TAHAP 2: Process Checkout - Validasi dan Kirim WhatsApp
function processCheckout() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!name || !email || !phone || !address) {
        showNotification('Harap lengkapi semua data! 📝');
        return;
    }

    if (!validateEmail(email)) {
        showNotification('Format email tidak valid! ✉️');
        return;
    }

    if (!validatePhone(phone)) {
        showNotification('Format WhatsApp tidak valid! Contoh: 628123456789');
        return;
    }

    const checkoutBtn = document.querySelector('.checkout-btn-final');
    const originalText = checkoutBtn.textContent;
    checkoutBtn.textContent = '⏳ Memproses...';
    checkoutBtn.classList.add('processing');
    checkoutBtn.disabled = true;

    updateCheckoutSteps(2);

    const orderId = 'TRX-' + Date.now();

    const orderData = {
        orderId: orderId,
        customer: name,
        email: email,
        phone: phone,
        address: address,
        items: [...cart],
        paymentMethod: selectedPaymentMethod,
        timestamp: new Date().toISOString()
    };

    setTimeout(() => {
        sendOrderNotificationToWhatsApp(orderData);
        saveTransaction(orderData);
        
        setTimeout(() => {
            showSuccessScreen(orderData);
        }, 1000);
    }, 1500);
}

// Fungsi untuk menyimpan transaksi DENGAN SYNC ENGINE
function saveTransaction(orderData) {
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100000 ? 0 : 15000;
    const total = subtotal + shipping;

    const transaction = {
        id: orderData.orderId,
        customer: orderData.customer,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address,
        items: orderData.items,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        paymentMethod: orderData.paymentMethod,
        status: orderData.paymentMethod === 'cod' ? 'pending' : 'waiting_payment',
        date: orderData.timestamp
    };

    // GUNAKAN SYNC ENGINE untuk save
    if (syncEngine) {
        syncEngine.addTransaction(transaction);
        syncEngine.addActivity({
            type: 'order',
            message: `Pesanan baru dari ${transaction.customer} - ${transaction.id}`,
            icon: '🛒'
        });
        console.log('✅ Transaction saved via Sync Engine');
    } else {
        // Fallback ke localStorage biasa
        let transactions = JSON.parse(localStorage.getItem('customer-transactions')) || [];
        transactions.push(transaction);
        localStorage.setItem('customer-transactions', JSON.stringify(transactions));
        localStorage.setItem('admin-transactions', JSON.stringify(transactions));
        console.log('⚠️ Transaction saved via localStorage fallback');
    }
}

// [SISANYA TETAP SAMA SEPERTI SEBELUMNYA...]
// Copy semua fungsi lainnya dari script.js yang sudah ada
// (showSection, displayProducts, openCart, dll)

function showSection(sectionId) {
    if (sectionId === currentSection || isAnimating) return;
    
    isAnimating = true;
    const oldSection = document.getElementById(currentSection + '-section');
    const newSection = document.getElementById(sectionId + '-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const searchBar = document.querySelector('.search');
    
    navLinks.forEach(link => link.classList.remove('active'));
    const targetLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (targetLink) targetLink.classList.add('active');
    
    if (sectionId === 'products') {
        searchBar?.classList.remove('hidden');
        setTimeout(() => {
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.focus();
        }, 600);
    } else {
        searchBar?.classList.add('hidden');
    }
    
    oldSection?.classList.add('slide-out');
    
    setTimeout(() => {
        oldSection?.classList.remove('active', 'slide-out');
        newSection?.classList.add('active');
        currentSection = sectionId;
        isAnimating = false;
        
        if (sectionId === 'products') {
            displayProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        if(history.pushState) {
            history.pushState(null, null, `#${sectionId}`);
        }
    }, 400);
}

function displayProducts(productsToShow = products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = productsToShow.map(product => `
        <div class="product" data-category="${product.category}">
            <div class="product-image-container">
                <img src="${product.img}" alt="${product.name}" loading="lazy" class="product-image">
                <div class="product-category-badge">${getCategoryIcon(product.category)}</div>
            </div>
            <h3>${product.name}</h3>
            <p>${product.desc}</p>
            <p class="price">Rp ${product.price.toLocaleString('id-ID')}</p>
            <button onclick="openProductDetail(${product.id})" class="product-btn">
                <span class="btn-icon">👁️</span> Lihat Detail
            </button>
        </div>
    `).join('');
}

function getCategoryIcon(category) {
    const icons = {
        'bakso': '🥘',
        'nugget': '🍤',
        'olahan': '🍴',
        'promo': '🎯'
    };
    return icons[category] || '📦';
}

function filterCategory(category) {
    if (isAnimating) return;
    
    const buttons = document.querySelectorAll('.categories button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const filtered = category === 'all' ? products : products.filter(product => product.category === category);
    displayProducts(filtered);
}

let searchTimeout;
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                product.desc.toLowerCase().includes(searchTerm)
            );
            displayProducts(filtered);
        }, 300);
    });
}

function openProductDetail(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;
    
    document.getElementById('detail-img').src = currentProduct.img;
    document.getElementById('detail-img').alt = currentProduct.name;
    document.getElementById('detail-name').textContent = currentProduct.name;
    document.getElementById('detail-desc').textContent = currentProduct.desc;
    document.getElementById('detail-price').textContent = `Rp ${currentProduct.price.toLocaleString('id-ID')}`;
    document.getElementById('detail-quantity').value = 1;
    document.getElementById('product-modal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

function changeQuantity(change) {
    const quantityInput = document.getElementById('detail-quantity');
    let newQuantity = parseInt(quantityInput.value) + change;
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 99) newQuantity = 99;
    quantityInput.value = newQuantity;
}

function addToCartFromDetail() {
    const quantity = parseInt(document.getElementById('detail-quantity').value);
    if (quantity < 1 || quantity > 99) {
        alert('Quantity harus antara 1-99');
        return;
    }
    addToCart(currentProduct.id, quantity);
    closeProductModal();
    updateCartCount();
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
        if (existingItem.quantity > 99) existingItem.quantity = 99;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            img: product.img
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    showNotification('Produk berhasil ditambahkan ke keranjang! 🛒');
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

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) cartCountEl.textContent = total;
}

function openCart() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.img}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;">
            <div class="details">
                <h4>${item.name}</h4>
                <p>Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</p>
            </div>
            <div class="quantity">
                <button onclick="updateCartItem(${item.id}, -1)">-</button>
                <input type="number" value="${item.quantity}" min="1" max="99" onchange="updateCartItemQuantity(${item.id}, this.value)">
                <button onclick="updateCartItem(${item.id}, 1)">+</button>
            </div>
            <div class="remove" onclick="removeFromCart(${item.id})">✖</div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = total.toLocaleString('id-ID');
    document.getElementById('cart-modal').style.display = 'flex';
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

function updateCartItem(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) {
            removeFromCart(productId);
            return;
        }
        if (item.quantity > 99) {
            item.quantity = 99;
            alert('Maksimum quantity adalah 99');
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        openCart();
        updateCartCount();
    }
}

function updateCartItemQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const newQuantity = parseInt(quantity);
        if (newQuantity >= 1 && newQuantity <= 99) {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            openCart();
            updateCartCount();
        } else {
            alert('Quantity harus antara 1-99');
            openCart();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    openCart();
    updateCartCount();
}

function openCheckout() {
    if (cart.length === 0) {
        showNotification('Keranjang belanja kosong! 📦');
        return;
    }
    
    document.getElementById('cart-modal').style.display = 'none';
    
    currentCheckoutStep = 1;
    updateCheckoutSummary();
    resetCheckoutForm();
    
    const checkoutModal = document.getElementById('checkout-modal');
    checkoutModal.style.display = 'flex';
    checkoutModal.style.overflowY = 'auto';
    
    updateCheckoutSteps(1);
}

function closeCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
    document.getElementById('cart-modal').style.display = 'flex';
    currentCheckoutStep = 1;
}

function updateCheckoutSummary() {
    const summaryContainer = document.querySelector('.checkout-summary');
    if (!summaryContainer) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100000 ? 0 : 15000;
    const total = subtotal + shipping;
    
    summaryContainer.innerHTML = `
        <h4 style="margin-bottom: 15px; color: #1565c0;">Ringkasan Pesanan</h4>
        ${cart.map(item => `
            <div class="summary-item">
                <span>${item.name} (${item.quantity}x)</span>
                <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
        `).join('')}
        <div class="summary-item">
            <span>Subtotal</span>
            <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div class="summary-item">
            <span>Ongkos Kirim</span>
            <span>${shipping === 0 ? 'GRATIS' : `Rp ${shipping.toLocaleString('id-ID')}`}</span>
        </div>
        <div class="summary-total">
            <span>TOTAL</span>
            <span>Rp ${total.toLocaleString('id-ID')}</span>
        </div>
        ${shipping === 0 ? '<div style="color: #4caf50; font-size: 0.9em; margin-top: 10px;">🎉 Selamat! Anda mendapatkan gratis ongkir!</div>' : ''}
    `;
}

function resetCheckoutForm() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('address').value = '';
    selectedPaymentMethod = 'cod';
    updatePaymentMethods();
    updateCheckoutSteps(1);
}

function updateCheckoutSteps(activeStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < activeStep) {
            step.classList.add('completed');
        } else if (index + 1 === activeStep) {
            step.classList.add('active');
        }
    });
    currentCheckoutStep = activeStep;
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    updatePaymentMethods();
    
    const selectedElement = event.currentTarget;
    selectedElement.style.transform = 'scale(0.95)';
    setTimeout(() => {
        selectedElement.style.transform = 'scale(1)';
    }, 150);
}

function updatePaymentMethods() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.classList.remove('selected');
        if (method.dataset.method === selectedPaymentMethod) {
            method.classList.add('selected');
        }
    });
    
    const paymentSelect = document.getElementById('payment-method');
    if (paymentSelect) paymentSelect.value = selectedPaymentMethod;
}

function showSuccessScreen(orderData) {
    const checkoutBody = document.querySelector('.checkout-body');
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100000 ? 0 : 15000;
    const total = subtotal + shipping;
    
    updateCheckoutSteps(3);
    
    let successMessage = '';
    let buttonText = '✅ Selesai & Kembali ke Beranda';
    let additionalInfo = '';
    
    if (selectedPaymentMethod === 'transfer') {
        additionalInfo = `
            <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <strong>⚠️ Langkah Selanjutnya:</strong><br>
                Silakan upload bukti transfer Anda di halaman berikutnya untuk verifikasi pembayaran.
            </div>
        `;
        buttonText = '📤 Lanjut ke Upload Bukti Transfer';
    }
    
    successMessage = `
        ✅ <strong>Pesanan Berhasil Dibuat!</strong><br><br>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; text-align: left; margin: 20px 0;">
            <strong>📋 Detail Pesanan:</strong><br>
            🆔 ID Pesanan: <strong>${orderData.orderId}</strong><br>
            👤 Nama: <strong>${orderData.customer}</strong><br>
            📧 Email: <strong>${orderData.email}</strong><br>
            📞 WhatsApp: <strong>${orderData.phone}</strong><br>
            📍 Alamat: <strong>${orderData.address}</strong><br><br>
            
            💰 Total Pembayaran: <strong style="color: #1565c0; font-size: 1.2em;">Rp ${total.toLocaleString('id-ID')}</strong><br>
            💳 Metode: <strong>${getPaymentMethodText(selectedPaymentMethod)}</strong>
        </div>
        
        ${additionalInfo}
        
        <div style="background: #d4edda; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <strong>✅ Notifikasi Terkirim!</strong><br>
            Pesanan Anda telah dikirim ke admin kami melalui WhatsApp dan akan segera diproses.
        </div>
        
        <small style="color: #666;">
            💡 <em>Anda akan menerima konfirmasi dari admin kami segera. Simpan ID Pesanan Anda untuk tracking.</em>
        </small>
    `;
    
    checkoutBody.innerHTML = `
        <div class="success-animation">
            <div class="success-icon">✅</div>
            <h3 class="success-title">Pesanan Berhasil! 🎉</h3>
            <div class="success-message">
                ${successMessage}
            </div>
            <button class="checkout-btn-final" onclick="completeCheckout('${selectedPaymentMethod}')" 
                    style="background: linear-gradient(135deg, #4caf50, #66bb6a); margin-top: 20px;">
                ${buttonText}
            </button>
        </div>
    `;
}

function completeCheckout(paymentMethod = selectedPaymentMethod) {
    if (paymentMethod === 'transfer') {
        const lastTransaction = syncEngine ? 
            syncEngine.getTransactions().slice(-1)[0] : 
            JSON.parse(localStorage.getItem('customer-transactions')).slice(-1)[0];
            
        const tempOrderData = {
            orderId: lastTransaction.id,
            amount: lastTransaction.total,
            customer: lastTransaction.customer,
            email: lastTransaction.email,
            phone: lastTransaction.phone
        };
        localStorage.setItem('temp-order-data', JSON.stringify(tempOrderData));
        
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        document.getElementById('checkout-modal').style.display = 'none';
        
        showNotification('Redirecting ke halaman upload bukti transfer... 📤');
        
        setTimeout(() => {
            window.location.href = 'payment-upload.html';
        }, 2000);
        return;
    }

    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    document.getElementById('checkout-modal').style.display = 'none';
    
    showNotification('✅ Pesanan berhasil! Kembali ke beranda...');
    
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 2000);
}

function getPaymentMethodText(method) {
    const methods = {
        'cod': 'Bayar di Tempat (COD)',
        'transfer': 'Transfer Bank',
        'ewallet': 'E-Wallet'
    };
    return methods[method] || method;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10,13}$/;
    return re.test(phone);
}

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (4 + Math.random() * 4) + 's';
    document.body.appendChild(particle);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const productModal = document.getElementById('product-modal');
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    
    if (productModal && productModal.style.display === 'flex' && e.target === productModal) {
        closeProductModal();
    }
    if (cartModal && cartModal.style.display === 'flex' && e.target === cartModal) {
        closeCart();
    }
    if (checkoutModal && checkoutModal.style.display === 'flex' && e.target === checkoutModal) {
        closeCheckout();
    }
});

// Handle Escape key to close modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
        closeCart();
        closeCheckout();
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentSection) {
        showSection(hash);
    }
});

// Export functions untuk global access
window.completeCheckout = completeCheckout;
window.showSuccessScreen = showSuccessScreen;
window.processCheckout = processCheckout;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.selectPaymentMethod = selectPaymentMethod;
window.showSection = showSection;
window.filterCategory = filterCategory;
window.openProductDetail = openProductDetail;
window.closeProductModal = closeProductModal;
window.changeQuantity = changeQuantity;
window.addToCartFromDetail = addToCartFromDetail;
window.openCart = openCart;
window.closeCart = closeCart;
window.updateCartItem = updateCartItem;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;