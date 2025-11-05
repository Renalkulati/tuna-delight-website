// Script lengkap untuk halaman beranda
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll untuk navigasi
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Tambahkan partikel
    for (let i = 0; i < 20; i++) {
        createParticle();
    }

    // Load top products
    loadTopProducts();
});

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDelay = Math.random() * 4 + 's';
    document.body.appendChild(particle);
}

function loadTopProducts() {
    const topProducts = [
        {
            id: 1,
            name: 'Bakso Tuna Original',
            price: 35000,
            img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format',
            sold: 150
        },
        {
            id: 4, 
            name: 'Nugget Tuna Crispy',
            price: 28000,
            img: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop&auto=format',
            sold: 120
        },
        {
            id: 9,
            name: 'Bakso Tuna Komplit', 
            price: 45000,
            img: 'https://images.unsplash.com/photo-1555072956-7758af8e8e39?w=400&h=300&fit=crop&auto=format',
            sold: 95
        }
    ];

    const grid = document.getElementById('top-products-grid');
    if (grid) {
        grid.innerHTML = topProducts.map(product => `
            <div class="product-card">
                <img src="${product.img}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <p class="sold">📦 ${product.sold}+ terjual</p>
                <button onclick="window.location.href='index.html'">Beli Sekarang</button>
            </div>
        `).join('');
    }
}