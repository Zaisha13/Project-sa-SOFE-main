/* PURPOSE: Manual Order functionality — walk-in customer order processing */

// Check authentication
function checkCashierAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!isLoggedIn || !currentUser) {
        window.location.href = 'login_cashier.html';
        return false;
    }
    
    try {
        const user = JSON.parse(currentUser);
        if (!user || user.role !== 'cashier') {
            window.location.href = 'login_cashier.html';
            return false;
        }
        return true;
    } catch (e) {
        window.location.href = 'login_cashier.html';
        return false;
    }
}

// Get cashier branch from current user
function getCashierBranch() {
    // This is the Fairview portal: always use Fairview as the branch
    return 'SM Fairview';
}

// Get menu items from storage or defaults
function getMenuItems() {
    try {
        const storedMenu = JSON.parse(localStorage.getItem('jessie_menu') || '[]');
        if (Array.isArray(storedMenu) && storedMenu.length > 0) {
            return storedMenu;
        }
        return DEFAULT_MENU_ITEMS;
    } catch (error) {
        console.error('Error parsing menu items:', error);
        return DEFAULT_MENU_ITEMS;
    }
}

// Default menu items
const DEFAULT_MENU_ITEMS = [
    { id: 1, name: 'Pure Sugarcane', desc: 'Freshly pressed sugarcane juice', priceRegular: 79, priceTall: 109, img: 'pure-sugarcane.png' },
    { id: 2, name: 'Calamansi Cane', desc: 'A zesty twist on classic sugarcane juice', priceRegular: 89, priceTall: 119, img: 'calamansi-cane.png' },
    { id: 3, name: 'Lemon Cane', desc: 'Freshly squeezed lemon combined with sugarcane', priceRegular: 89, priceTall: 119, img: 'lemon-cane.png' },
    { id: 4, name: 'Yakult Cane', desc: 'Sugarcane juice and Yakult', priceRegular: 89, priceTall: 119, img: 'yakult-cane.png' },
    { id: 5, name: 'Calamansi Yakult Cane', desc: 'Calamansi, Yakult, and sugarcane', priceRegular: 99, priceTall: 129, img: 'calamansi-yakult-cane.png' },
    { id: 6, name: 'Lemon Yakult Cane', desc: 'Lemon, Yakult, and sugarcane', priceRegular: 99, priceTall: 129, img: 'lemon-yakult-cane.png' },
    { id: 7, name: 'Lychee Cane', desc: 'Lychee and sugarcane juice', priceRegular: 99, priceTall: 129, img: 'lychee-cane.png' },
    { id: 8, name: 'Orange Cane', desc: 'Orange juice blended with sugarcane', priceRegular: 109, priceTall: 139, img: 'orange-cane.png' },
    { id: 9, name: 'Passion Fruit Cane', desc: 'Passion fruit and sugarcane', priceRegular: 109, priceTall: 139, img: 'passion-fruit-cane.png' },
    { id: 10, name: 'Watermelon Cane', desc: 'Watermelon and sugarcane juice', priceRegular: 109, priceTall: 139, img: 'watermelon-cane.png' },
    { id: 11, name: 'Dragon Fruit Cane', desc: 'Dragon fruit and sugarcane juice', priceRegular: 119, priceTall: 149, img: 'dragon-fruit-cane.png' },
    { id: 12, name: 'Strawberry Yogurt Cane', desc: 'Strawberry yogurt and sugarcane', priceRegular: 119, priceTall: 149, img: 'strawberry-yogurt-cane.png' }
];

// Normalize image path
function normalizeImagePath(src) {
    if (!src) return '';
    if (typeof src !== 'string') return '';
    const s = src.trim();
    if (!s) return '';
    if (s.startsWith('data:') || s.startsWith('http://') || s.startsWith('https://')) {
        return s;
    }
    if (s.startsWith('./') || s.startsWith('../')) {
        return s;
    }
    return `../../assets/images/${s}`;
}

// Initialize page
let cart = [];
let modalState = {};

document.addEventListener('DOMContentLoaded', function() {
    if (!checkCashierAuth()) return;
    
    // Set cashier name
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const cashierName = document.getElementById('cashier-name');
        if (cashierName && (currentUser.name || currentUser.username)) {
            cashierName.textContent = currentUser.name || currentUser.username;
        }
    } catch (e) {
        console.error('Error getting cashier name:', e);
    }
    
    // Load menu items
    const menuItems = getMenuItems();
    renderMenu(menuItems);
    
    // Setup logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                window.location.href = 'login_cashier.html';
            }
        });
    }
    
    // Set branch display to cashier branch
    try {
        const branchDisplay = document.getElementById('branchDisplay');
        if (branchDisplay) {
            branchDisplay.value = getCashierBranch();
        }
    } catch(_){}

    // Setup checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', openCheckoutModal);
    }
});

// Render menu items
function renderMenu(menuItems) {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    menuGrid.innerHTML = menuItems.map(item => {
        const imagePath = normalizeImagePath(item.img);
        return `
            <div class="menu-item" onclick="openCustomizationModal(${item.id})">
                <img src="${imagePath}" alt="${item.name}" onerror="this.src='../../assets/images/logo.png'">
                <div class="menu-item-name">${item.name}</div>
            </div>
        `;
    }).join('');
}

// Open customization modal
function openCustomizationModal(productId) {
    const menuItems = getMenuItems();
    const product = menuItems.find(p => p.id === productId);
    
    if (!product) {
        alert('Product not found');
        return;
    }
    
    // Set modal state
    modalState = {
        productId: productId,
        size: 'Regular',
        qty: 1,
        special: 'None',
        notes: ''
    };
    
    // Update modal content
    const modalImg = document.getElementById('modal-drink-image');
    const modalName = document.getElementById('modal-drink-name');
    const modalQty = document.getElementById('modalQty');
    
    if (modalImg) modalImg.src = normalizeImagePath(product.img);
    if (modalName) modalName.textContent = product.name;
    if (modalQty) modalQty.value = 1;
    
    updateModalPrice();
    
    // Show modal
    const modal = document.getElementById('customizationModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close customization modal
function closeCustomizationModal() {
    const modal = document.getElementById('customizationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Select size
function selectSize(size) {
    modalState.size = size;
    updateModalPrice();
    
    // Update button states
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.size === size) {
            btn.classList.add('active');
        }
    });
}

// Select special
function selectSpecial(special) {
    modalState.special = special;
    updateModalPrice();
    
    // Update button states
    document.querySelectorAll('.special-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.special === special) {
            btn.classList.add('active');
        }
    });
}

// Increase quantity
function increaseQty() {
    const qty = parseInt(document.getElementById('modalQty').value) || 1;
    document.getElementById('modalQty').value = qty + 1;
    modalState.qty = qty + 1;
    updateModalPrice();
}

// Decrease quantity
function decreaseQty() {
    const qty = parseInt(document.getElementById('modalQty').value) || 1;
    if (qty > 1) {
        document.getElementById('modalQty').value = qty - 1;
        modalState.qty = qty - 1;
        updateModalPrice();
    }
}

// Update quantity
function updateQty(value) {
    const qty = parseInt(value) || 1;
    modalState.qty = qty;
    updateModalPrice();
}

// Update modal price
function updateModalPrice() {
    const menuItems = getMenuItems();
    const product = menuItems.find(p => p.id === modalState.productId);
    
    if (!product) {
        document.getElementById('modalPrice').textContent = '₱0.00';
        return;
    }
    
    // Get base price based on size
    let basePrice = 0;
    if (modalState.size === 'Regular') {
        basePrice = product.priceRegular || 0;
    } else if (modalState.size === 'Tall') {
        basePrice = product.priceTall || product.priceRegular || 0;
    }
    
    // Add special instruction price
    if (modalState.special === 'No Ice') {
        basePrice += 20;
    }
    
    const totalPrice = basePrice * modalState.qty;
    
    document.getElementById('modalPrice').textContent = `₱${totalPrice.toFixed(2)}`;
}

// Confirm add to cart
function confirmAddToCart() {
    const menuItems = getMenuItems();
    const product = menuItems.find(p => p.id === modalState.productId);
    
    if (!product) {
        alert('Product not found');
        return;
    }
    
    // Get notes from textarea
    const notesTextarea = document.getElementById('modalNotes');
    if (notesTextarea) {
        modalState.notes = notesTextarea.value.trim();
    }
    
    // Calculate price
    let basePrice = 0;
    if (modalState.size === 'Regular') {
        basePrice = product.priceRegular || 0;
    } else if (modalState.size === 'Tall') {
        basePrice = product.priceTall || product.priceRegular || 0;
    }
    
    if (modalState.special === 'No Ice') {
        basePrice += 20;
    }
    
    const price = basePrice;
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => 
        item.productId === modalState.productId && 
        item.size === modalState.size && 
        item.special === modalState.special &&
        item.notes === modalState.notes
    );
    
    if (existingItem) {
        existingItem.qty += modalState.qty;
    } else {
        cart.push({
            productId: modalState.productId,
            name: product.name,
            size: modalState.size,
            special: modalState.special,
            notes: modalState.notes,
            price: price,
            qty: modalState.qty,
            img: product.img
        });
    }
    
    closeCustomizationModal();
    updateCartUI();
}

// Update cart UI
function updateCartUI() {
    renderCart();
    updateTotal();
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
    
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) {
        cartCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }
}

// Render cart items
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-cart-plus"></i>
                <p>No items in cart</p>
            </div>
        `;
        return;
    }
    
    cartItems.innerHTML = cart.map((item, index) => {
        const imagePath = normalizeImagePath(item.img);
        const itemTotal = item.qty * item.price;
        
        return `
            <div class="cart-item">
                <img class="cart-item-image" src="${imagePath}" alt="${item.name}" onerror="this.src='../../assets/images/logo.png'">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-size">${item.size}${item.special !== 'None' ? ' • ' + item.special : ''}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="qty-display">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <div class="cart-item-price">₱${itemTotal.toFixed(2)}</div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Update quantity
function updateQuantity(index, change) {
    if (index < 0 || index >= cart.length) return;
    
    cart[index].qty += change;
    
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    
    updateCartUI();
}

// Remove from cart
function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    cart.splice(index, 1);
    updateCartUI();
}

// Clear cart
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        updateCartUI();
    }
}

// Update total
function updateTotal() {
    const totalEl = document.getElementById('total');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    if (totalEl) totalEl.textContent = `₱${total.toFixed(2)}`;
}

// Open checkout modal
function openCheckoutModal() {
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close checkout modal
function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        document.getElementById('customerForm').reset();
        // Refill branch display
        const branchDisplay = document.getElementById('branchDisplay');
        if (branchDisplay) branchDisplay.value = getCashierBranch();
    }
}

// Generate order ID
function generateOrderId() {
    try {
        const orders = JSON.parse(localStorage.getItem('jessie_orders') || '[]');
        let maxNum = 0;
        orders.forEach(o => {
            if (!o || !o.id) return;
            const id = String(o.id).trim();
            if (/^\d+$/.test(id)) {
                maxNum = Math.max(maxNum, parseInt(id, 10));
                return;
            }
            const m = id.match(/(\d+)$/);
            if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
        });
        const next = maxNum + 1;
        return 'ORD-' + String(next).padStart(3, '0');
    } catch (err) {
        return 'ORD-' + String(Date.now()).slice(-6);
    }
}

// Place manual order
function placeManualOrder() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const branch = getCashierBranch();
    const specialNotes = document.getElementById('specialNotes').value.trim();
    
    if (!customerName) {
        alert('Please enter customer name');
        return;
    }
    
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    const order = {
        id: generateOrderId(),
        customerName: customerName,
        customerUsername: '',
        customerEmail: 'N/A',
        customerPhone: customerPhone || 'N/A',
        customerNotes: specialNotes,
        branch: branch,
        items: cart.map(item => ({
            name: item.name,
            size: item.size,
            special: item.special,
            notes: item.notes,
            qty: item.qty,
            price: item.price
        })),
        subtotal: total,
        tax: 0,
        total: total.toFixed(2),
        status: 'Pending',
        timestamp: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        orderType: 'Walk-in',
        isGuest: true
    };
    
    // Save order
    try {
        const orders = JSON.parse(localStorage.getItem('jessie_orders') || '[]');
        orders.push(order);
        localStorage.setItem('jessie_orders', JSON.stringify(orders));
        
        // Clear cart
        cart = [];
        updateCartUI();
        closeCheckoutModal();
        
        alert(`Order ${order.id} placed successfully!`);
        
        // Redirect back to dashboard
        setTimeout(() => {
            window.location.href = 'cashier.html#orders';
        }, 1500);
    } catch (error) {
        console.error('Error saving order:', error);
        alert('Error saving order');
    }
}

console.log('Manual order page loaded');
