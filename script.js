// script.js - Главный файл сайта (исправленная версия)

// В начало файла добавьте
let cartModalOpen = false;

// Функция открытия корзины
function showCartModal() {
    cartModalOpen = true;
    updateCart(); // Обновляем содержимое
    document.getElementById('cart-modal').style.display = 'flex';
}

// Функция закрытия корзины
function closeCartModal() {
    cartModalOpen = false;
    document.getElementById('cart-modal').style.display = 'none';
}

// Обновленная функция updateCart
function updateCart() {
    const cartItemsModal = document.getElementById('cart-items-modal');
    const cartTotalModal = document.getElementById('cart-total-modal');
    const checkoutBtnModal = document.getElementById('checkout-btn-modal');
    const cartCount = document.getElementById('cart-count');
    
    // Обновляем и модальное окно и обычную корзину (если она осталась)
    [cartItemsModal, cartItems].forEach(cartItemsElement => {
        if (cartItemsElement) {
            cartItemsElement.innerHTML = '';
        }
    });
    
    if (cart.length === 0) {
        if (cartItemsModal) {
            cartItemsModal.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.7);">
                    <i class="fas fa-snowflake" style="font-size: 2.5rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <h4>Корзина пуста</h4>
                    <p style="font-size: 0.9rem;">Добавьте товары для праздничного стола!</p>
                </div>
            `;
        }
        
        if (cartTotalModal) cartTotalModal.textContent = 'Итого: 0 ₽';
        if (cartCount) cartCount.textContent = '0';
        if (checkoutBtnModal) {
            checkoutBtnModal.disabled = true;
            checkoutBtnModal.innerHTML = '<i class="fas fa-gift"></i> Оформить заказ';
        }
        return;
    }
    
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemHTML = `
            <div class="cart-item">
                <div style="display: flex; align-items: center; flex-grow: 1; min-width: 0;">
                    ${item.image ? `<img src="${item.image}" class="cart-item-image">` : 
                    '<div style="width: 40px; height: 40px; background: linear-gradient(135deg, #c62828, #2e7d32); border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 8px;"><i class="fas fa-cheese"></i></div>'}
                    <div style="min-width: 0;">
                        <div style="font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">${item.price} ₽/шт</div>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="changeQuantity(${index}, -1)">-</button>
                    <span style="min-width: 24px; text-align: center; font-weight: bold;">${item.quantity}</span>
                    <button class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</button>
                    <button onclick="removeFromCart(${index})" style="background: #c62828; color: white; border: none; border-radius: 4px; padding: 4px 8px; margin-left: 5px; cursor: pointer; font-size: 0.75rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div style="font-weight: bold; color: var(--christmas-gold); min-width: 70px; text-align: right;">
                    ${itemTotal} ₽
                </div>
            </div>
        `;
        
        if (cartItemsModal) cartItemsModal.innerHTML += cartItemHTML;
    });
    
    // Расчет доставки
    const content = JSON.parse(localStorage.getItem('siteContent')) || {};
    const freeDelivery = content.freeDelivery || 2500;
    const deliveryCost = content.deliveryCost || 500;
    const minOrder = content.minOrder || 1000;
    
    if (cartTotalModal) {
        cartTotalModal.innerHTML = `
            <div style="font-size: 0.9rem;">Товары: ${total} ₽</div>
            <div style="font-size: 0.9rem;">Доставка: ${total >= freeDelivery ? 'Бесплатно 🎁' : `до ${deliveryCost} ₽`} <small style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">(зависит от выбора)</small></div>
            <div style="margin-top: 8px; font-size: 1.4rem; color: var(--christmas-gold);">Итого: от ${total} ₽</div>
        `;
    }
    
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    if (checkoutBtnModal) {
        checkoutBtnModal.disabled = total < minOrder;
        if (total < minOrder) {
            checkoutBtnModal.innerHTML = `<i class="fas fa-exclamation-circle"></i> Минимум ${minOrder} ₽`;
        } else {
            checkoutBtnModal.innerHTML = `<i class="fas fa-gift"></i> Оформить заказ (от ${total} ₽)`;
        }
    }
}

// Обновите функцию changeQuantity чтобы обновлялась и модалка
function changeQuantity(index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }
}

// Обновите функцию removeFromCart
function removeFromCart(index) {
    if (cart[index]) {
        const productName = cart[index].name;
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        showNotification(`"${productName}" удален из корзины`, 'info');
    }
}

// Обновите функцию openOrderModal чтобы закрывать корзину при открытии заказа
function openOrderModal() {
    if (cart.length === 0) {
        showNotification('Корзина пуста!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const content = JSON.parse(localStorage.getItem('siteContent')) || {};
    const minOrder = content.minOrder || 1000;
    
    if (total < minOrder) {
        showNotification(`Минимальная сумма заказа ${minOrder} ₽`, 'error');
        return;
    }
    
    // Закрываем корзину если она открыта
    if (cartModalOpen) {
        closeCartModal();
    }
    
    // Остальной код открытия модалки заказа...
}

// Данные
let products = [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userOrders = JSON.parse(localStorage.getItem('userOrders')) || [];

// Ключи localStorage
const PRODUCTS_KEY = 'products';
const SETTINGS_KEY = 'siteSettings';
const COLORS_KEY = 'siteColors';
const IMAGES_KEY = 'siteImages';

// Переменные для обновления
let lastProductsUpdate = localStorage.getItem('lastProductsUpdate') || '0';
let lastSettingsUpdate = localStorage.getItem('lastSettingsUpdate') || '0';
let lastColorsUpdate = localStorage.getItem('lastColorsUpdate') || '0';
let lastImagesUpdate = localStorage.getItem('lastImagesUpdate') || '0';

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    init();
    startUpdateChecker();
});

function init() {
    loadData();
    loadProducts();
    updateCartCount();
    updateCartDisplay();
    setupEventListeners();
    setupAuth();
    updateUserDisplay();
    loadUserOrders();
    applySiteSettings();
    applySiteColors();
    updateSiteImages();
    loadCategories();
    
    console.log('Сайт инициализирован');
    console.log('Товары:', products.length);
    console.log('Настройки:', JSON.parse(localStorage.getItem(SETTINGS_KEY)));
    console.log('Цвета:', JSON.parse(localStorage.getItem(COLORS_KEY)));
    console.log('Изображения:', JSON.parse(localStorage.getItem(IMAGES_KEY)));
}

// Функция проверки обновлений
function startUpdateChecker() {
    // Проверяем обновления каждую секунду
    setInterval(checkForUpdates, 1000);
}

function checkForUpdates() {
    const currentProductsUpdate = localStorage.getItem('lastProductsUpdate') || '0';
    const currentSettingsUpdate = localStorage.getItem('lastSettingsUpdate') || '0';
    const currentColorsUpdate = localStorage.getItem('lastColorsUpdate') || '0';
    const currentImagesUpdate = localStorage.getItem('lastImagesUpdate') || '0';
    
    // Проверяем товары
    if (currentProductsUpdate !== lastProductsUpdate) {
        console.log('Обнаружено обновление товаров');
        loadData();
        loadProducts();
        lastProductsUpdate = currentProductsUpdate;
    }
    
    // Проверяем настройки
    if (currentSettingsUpdate !== lastSettingsUpdate) {
        console.log('Обнаружено обновление настроек');
        applySiteSettings();
        lastSettingsUpdate = currentSettingsUpdate;
    }
    
    // Проверяем цвета
    if (currentColorsUpdate !== lastColorsUpdate) {
        console.log('Обнаружено обновление цветов');
        applySiteColors();
        lastColorsUpdate = currentColorsUpdate;
    }
    
    // Проверяем изображения
    if (currentImagesUpdate !== lastImagesUpdate) {
        console.log('Обнаружено обновление изображений');
        updateSiteImages();
        lastImagesUpdate = currentImagesUpdate;
    }
}

function loadData() {
    products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    // Фильтруем только активные товары для отображения
    products = products.filter(p => p.isActive !== false);
}

// Загрузка товаров
function loadProducts(category = 'all') {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(p => p.category === category);
    
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-cheese"></i>
                <h3>Товары не найдены</h3>
                <p>Попробуйте выбрать другую категорию</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

// Создание карточки товара
function createProductCard(product) {
    const div = document.createElement('div');
    div.className = `product-card ${product.isNew ? 'new' : ''}`;
    div.dataset.category = product.category;
    
    const productImage = product.image || getDefaultProductImage();
    
    div.innerHTML = `
        <div class="product-image">
            <img src="${productImage}" alt="${product.name}" onerror="this.src='${getDefaultProductImage()}'">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-weight">${product.weight || 'Не указано'}</p>
            <p class="product-price">${product.price ? product.price.toLocaleString() : '0'} ₽</p>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i> В корзину
            </button>
        </div>
    `;
    
    return div;
}

function getDefaultProductImage() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGNEY0RjQiLz48cGF0aCBkPSJNNzAgNzBMMTAwIDEwMEwxMzAgNzAiIHN0cm9rZT0iI0JDRDJFMSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjRUVFRUVFIiBzdHJva2U9IiNCQ0QyRTEiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik05MCA5MEgxMTBWMTEwSDkwWiIgZmlsbD0iI0JDRDJFMSIvPjwvc3ZnPg==';
}

// Корзина
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            weight: product.weight,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    
    showNotification(`${product.name} добавлен в корзину!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification('Товар удален из корзины', 'info');
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        if (totalItems > 0) {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
    });
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFull = document.getElementById('cartFull');
    
    if (!cartItems || !cartTotal || !cartEmpty || !cartFull) return;
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartFull.style.display = 'none';
        cartItems.innerHTML = '';
        cartTotal.textContent = '0 ₽';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartFull.style.display = 'block';
    
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.weight || ''}</p>
                <p class="cart-item-price">${item.price.toLocaleString()} ₽ × ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <span class="cart-item-total">${(item.price * item.quantity).toLocaleString()} ₽</span>
                <button class="remove-from-cart" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItemElement);
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${total.toLocaleString()} ₽`;
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('active');
        updateCartDisplay();
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.remove('active');
    }
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста', 'error');
        return;
    }
    
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    const minOrder = settings.minOrder || 1000;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (total < minOrder) {
        showNotification(`Минимальный заказ: ${minOrder.toLocaleString()} ₽`, 'error');
        return;
    }
    
    document.getElementById('checkoutModal').style.display = 'flex';
}

function submitOrder(event) {
    event.preventDefault();
    
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    
    const order = {
        id: Date.now(),
        customerName: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email') || '',
        address: formData.get('deliveryMethod') === 'delivery' ? formData.get('address') : null,
        deliveryMethod: formData.get('deliveryMethod'),
        paymentMethod: formData.get('paymentMethod'),
        comment: formData.get('comment') || '',
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    if (currentUser) {
        userOrders.push(order);
        localStorage.setItem('userOrders', JSON.stringify(userOrders));
    }
    
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartCount();
    updateCartDisplay();
    closeCart();
    document.getElementById('checkoutModal').style.display = 'none';
    
    showNotification(`Заказ #${order.id} оформлен! Мы свяжемся с вами для подтверждения.`, 'success');
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
}

// Аутентификация
function setupAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            login();
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            register();
        });
    }
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email && password) {
        currentUser = {
            id: Date.now(),
            email: email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserDisplay();
        showNotification('Вход выполнен успешно!', 'success');
        closeAuthModal();
    } else {
        showNotification('Заполните все поля', 'error');
    }
}

function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    currentUser = {
        id: Date.now(),
        name: name,
        email: email,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserDisplay();
        showNotification('Регистрация успешна!', 'success');
        closeAuthModal();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserDisplay();
    showNotification('Вы вышли из системы', 'info');
}

function updateUserDisplay() {
    const userLinks = document.querySelectorAll('.user-link');
    
    userLinks.forEach(link => {
        if (currentUser) {
            link.innerHTML = `
                <i class="fas fa-user"></i>
                <span>${currentUser.name}</span>
                <div class="user-menu">
                    <a href="#" onclick="showUserProfile()"><i class="fas fa-user-circle"></i> Профиль</a>
                    <a href="#" onclick="showUserOrders()"><i class="fas fa-clipboard-list"></i> Мои заказы</a>
                    <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Выйти</a>
                </div>
            `;
        } else {
            link.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Войти</span>
            `;
            link.onclick = function(e) {
                e.preventDefault();
                showAuthModal();
            };
        }
    });
}

function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('loginTab').click();
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function switchAuthTab(tabName) {
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    document.getElementById(tabName + 'Form').classList.add('active');
}

function showUserProfile() {
    const profileModal = document.getElementById('profileModal');
    if (!profileModal) return;
    
    if (currentUser) {
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('profileSince').textContent = formatDate(currentUser.createdAt);
    }
    
    profileModal.style.display = 'flex';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

function showUserOrders() {
    const ordersModal = document.getElementById('ordersModal');
    if (!ordersModal) return;
    
    loadUserOrders();
    ordersModal.style.display = 'flex';
}

function closeOrdersModal() {
    document.getElementById('ordersModal').style.display = 'none';
}

function loadUserOrders() {
    const userOrdersList = document.getElementById('userOrdersList');
    if (!userOrdersList) return;
    
    userOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
    
    if (userOrders.length === 0) {
        userOrdersList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-clipboard-list"></i>
                <h3>У вас пока нет заказов</h3>
                <p>Сделайте свой первый заказ!</p>
            </div>
        `;
        return;
    }
    
    userOrdersList.innerHTML = '';
    
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'user-order';
        orderElement.innerHTML = `
            <div class="user-order-header">
                <span class="order-id">Заказ #${order.id}</span>
                <span class="order-date">${formatDate(order.createdAt)}</span>
                <span class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</span>
            </div>
            <div class="user-order-items">
                ${order.items.map(item => `
                    <div class="user-order-item">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>${(item.price * item.quantity).toLocaleString()} ₽</span>
                    </div>
                `).join('')}
            </div>
            <div class="user-order-footer">
                <span class="order-total">Итого: ${order.total.toLocaleString()} ₽</span>
            </div>
        `;
        userOrdersList.appendChild(orderElement);
    });
}

function getStatusClass(status) {
    switch(status) {
        case 'confirmed': return 'status-confirmed';
        case 'pending': return 'status-pending';
        case 'cancelled': return 'status-cancelled';
        case 'completed': return 'status-completed';
        default: return '';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'confirmed': return 'Подтвержден';
        case 'pending': return 'Ожидает';
        case 'cancelled': return 'Отменен';
        case 'completed': return 'Выполнен';
        default: return status;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Настройки сайта - ИСПРАВЛЕННАЯ ВЕРСИЯ
function applySiteSettings() {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    
    console.log('Применяем настройки:', settings);
    
    // Обновляем название сайта
    const siteTitleElements = document.querySelectorAll('#siteTitle, .site-title, [class*="site-name"], h1');
    siteTitleElements.forEach(element => {
        if (settings.siteName && (element.id === 'siteTitle' || element.classList.contains('site-title'))) {
            element.textContent = settings.siteName;
        }
    });
    
    // Обновляем описание
    const descriptionElements = document.querySelectorAll('#siteDescription, .site-description, [class*="description"]');
    descriptionElements.forEach(element => {
        if (settings.siteDescription && (element.id === 'siteDescription' || element.classList.contains('site-description'))) {
            element.textContent = settings.siteDescription;
        }
    });
    
    // Обновляем телефоны
    const phone1Elements = document.querySelectorAll('.phone1, [data-phone="1"], [href*="tel:8-952-322-45-85"]');
    phone1Elements.forEach(el => {
        if (settings.phone1) {
            el.textContent = settings.phone1;
            el.href = `tel:${settings.phone1.replace(/\D/g, '')}`;
        }
    });
    
    const phone2Elements = document.querySelectorAll('.phone2, [data-phone="2"], [href*="tel:8-902-635-33-03"]');
    phone2Elements.forEach(el => {
        if (settings.phone2) {
            el.textContent = settings.phone2;
            el.href = `tel:${settings.phone2.replace(/\D/g, '')}`;
        }
    });
    
    // Обновляем условия доставки
    const minOrderElements = document.querySelectorAll('#minOrderValue, .min-order, [data-min-order]');
    minOrderElements.forEach(el => {
        if (settings.minOrder) {
            el.textContent = `${settings.minOrder.toLocaleString()} ₽`;
        }
    });
    
    const freeDeliveryElements = document.querySelectorAll('#freeDeliveryValue, .free-delivery, [data-free-delivery]');
    freeDeliveryElements.forEach(el => {
        if (settings.freeDelivery) {
            el.textContent = `${settings.freeDelivery.toLocaleString()} ₽`;
        }
    });
    
    const deliveryCostElements = document.querySelectorAll('#deliveryCostValue, .delivery-cost, [data-delivery-cost]');
    deliveryCostElements.forEach(el => {
        if (settings.deliveryCost) {
            el.textContent = `${settings.deliveryCost.toLocaleString()} ₽`;
        }
    });
    
    const pickupAddressElements = document.querySelectorAll('#pickupAddress, .pickup-address, [data-pickup-address]');
    pickupAddressElements.forEach(el => {
        if (settings.pickupAddress) {
            el.textContent = settings.pickupAddress;
        }
    });
}

// Применение цветов - ИСПРАВЛЕННАЯ ВЕРСИЯ
function applySiteColors() {
    const colors = JSON.parse(localStorage.getItem(COLORS_KEY)) || {};
    
    console.log('Применяем цвета:', colors);
    
    if (colors.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', colors.primaryColor);
        
        // Обновляем все элементы с primary цветом
        const primaryElements = document.querySelectorAll('.btn-primary, .primary-bg, [style*="background-color: var(--primary-color)"]');
        primaryElements.forEach(el => {
            el.style.backgroundColor = colors.primaryColor;
        });
        
        const primaryTextElements = document.querySelectorAll('.primary-text, [style*="color: var(--primary-color)"]');
        primaryTextElements.forEach(el => {
            el.style.color = colors.primaryColor;
        });
    }
    
    if (colors.accentColor) {
        document.documentElement.style.setProperty('--accent-color', colors.accentColor);
        
        const accentElements = document.querySelectorAll('.btn-accent, .accent-bg, .highlight');
        accentElements.forEach(el => {
            el.style.backgroundColor = colors.accentColor;
        });
        
        const accentTextElements = document.querySelectorAll('.accent-text');
        accentTextElements.forEach(el => {
            el.style.color = colors.accentColor;
        });
    }
    
    if (colors.backgroundColor) {
        document.documentElement.style.setProperty('--background-color', colors.backgroundColor);
        document.body.style.backgroundColor = colors.backgroundColor;
        
        const bgElements = document.querySelectorAll('.bg-light, .section-bg');
        bgElements.forEach(el => {
            el.style.backgroundColor = colors.backgroundColor;
        });
    }
}

// Обновление изображений сайта - ИСПРАВЛЕННАЯ ВЕРСИЯ
function updateSiteImages() {
    const images = JSON.parse(localStorage.getItem(IMAGES_KEY)) || {};
    
    console.log('Обновляем изображения:', images);
    
    // Обновляем логотип
    if (images.logo) {
        // Ищем все изображения логотипа
        const logoSelectors = [
            '.logo', 
            '.site-logo', 
            '.header-logo',
            'img[src*="logo"]',
            'img[alt*="лого"]',
            'img[alt*="logo"]',
            'img[class*="logo"]'
        ];
        
        logoSelectors.forEach(selector => {
            const logoElements = document.querySelectorAll(selector);
            logoElements.forEach(element => {
                // Проверяем, что это действительно логотип (по размеру или классу)
                if (element.width <= 100 || element.height <= 100 || element.classList.contains('logo')) {
                    element.src = images.logo;
                    element.style.display = 'block';
                    
                    element.onerror = function() {
                        console.log('Ошибка загрузки логотипа, используется дефолтный');
                        this.src = getDefaultLogoImage();
                    };
                }
            });
        });
    }
    
    // Обновляем баннер
    if (images.banner) {
        const bannerSelectors = [
            '.banner',
            '.hero-banner',
            '.main-banner',
            '[class*="banner"]',
            'img[src*="banner"]',
            'img[alt*="баннер"]'
        ];
        
        bannerSelectors.forEach(selector => {
            const bannerElements = document.querySelectorAll(selector);
            bannerElements.forEach(element => {
                // Проверяем, что это баннер (обычно большие изображения)
                if (element.width >= 500 || element.classList.contains('banner')) {
                    element.src = images.banner;
                    element.style.display = 'block';
                    
                    element.onerror = function() {
                        console.log('Ошибка загрузки баннера');
                        this.style.display = 'none';
                    };
                }
            });
        });
    } else {
        // Если баннера нет, скрываем баннерные элементы
        const bannerElements = document.querySelectorAll('[class*="banner"]');
        bannerElements.forEach(element => {
            if (element.tagName === 'IMG') {
                element.style.display = 'none';
            }
        });
    }
}

function getDefaultLogoImage() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyOCIgZmlsbD0iIzFCNUUyMCIvPjxwYXRoIGQ9Ik0yMCAzNUwzMCA0NUw0MCAyNSIgc3Ryb2tlPSIjRkZEIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==';
}

function loadCategories() {
    const categoryNav = document.getElementById('categoryNav');
    if (!categoryNav) return;
    
    const categories = [
        { id: 'all', name: 'Все товары', icon: 'fa-store' },
        { id: 'cheese', name: 'Сыры', icon: 'fa-cheese' },
        { id: 'milk', name: 'Молочная продукция', icon: 'fa-wine-bottle' },
        { id: 'meat', name: 'Мясная продукция', icon: 'fa-drumstick-bite' },
        { id: 'dessert', name: 'Десерты', icon: 'fa-ice-cream' },
        { id: 'new', name: 'Новинки', icon: 'fa-star' }
    ];
    
    categoryNav.innerHTML = '';
    
    categories.forEach(category => {
        const categoryElement = document.createElement('a');
        categoryElement.href = '#';
        categoryElement.className = 'category-link';
        categoryElement.dataset.category = category.id;
        categoryElement.innerHTML = `
            <i class="fas ${category.icon}"></i>
            <span>${category.name}</span>
        `;
        
        categoryElement.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            loadProducts(category.id);
        });
        
        categoryNav.appendChild(categoryElement);
    });
    
    const firstCategory = categoryNav.querySelector('.category-link');
    if (firstCategory) {
        firstCategory.classList.add('active');
    }
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Закрытие модальных окон
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
            e.target.closest('.modal').style.display = 'none';
        }
    });
    
    // Переключение способа доставки
    const deliveryMethodRadios = document.querySelectorAll('input[name="deliveryMethod"]');
    if (deliveryMethodRadios) {
        deliveryMethodRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                const addressField = document.getElementById('addressField');
                if (addressField) {
                    addressField.style.display = this.value === 'delivery' ? 'block' : 'none';
                }
            });
        });
    }
    
    // Открытие/закрытие корзины
    document.addEventListener('click', function(e) {
        if (e.target.closest('.cart-toggle') || e.target.classList.contains('cart-toggle')) {
            toggleCart();
        }
        
        if (e.target.classList.contains('close-cart') || 
            (e.target.closest('.cart-sidebar') && e.target.classList.contains('overlay'))) {
            closeCart();
        }
    });
    
    // Закрытие корзины при клике вне её
    document.addEventListener('click', function(e) {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartToggle = document.querySelector('.cart-toggle');
        
        if (cartSidebar && cartSidebar.classList.contains('active') && 
            !cartSidebar.contains(e.target) && 
            !cartToggle.contains(e.target)) {
            closeCart();
        }
    });
}

// Глобальные функции для использования в HTML
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.closeCart = closeCart;
window.checkout = checkout;
window.submitOrder = submitOrder;
window.closeCheckoutModal = closeCheckoutModal;
window.login = login;
window.register = register;
window.logout = logout;
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.showUserProfile = showUserProfile;
window.closeProfileModal = closeProfileModal;
window.showUserOrders = showUserOrders;
window.closeOrdersModal = closeOrdersModal;

// Анимации для уведомлений
if (!document.querySelector('#notificationStyles')) {
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .no-products, .no-orders {
            text-align: center;
            padding: 50px 20px;
            color: #7f8c8d;
        }
        
        .no-products i, .no-orders i {
            font-size: 4rem;
            margin-bottom: 20px;
            color: #bdc3c7;
        }
        
        .no-products h3, .no-orders p {
            margin: 10px 0;
        }
        
        /* CSS переменные для цветов */
        :root {
            --primary-color: #1B5E20;
            --accent-color: #FFD700;
            --background-color: #FFF5F5;
        }
        
        .btn-primary {
            background-color: var(--primary-color);
        }
        
        .btn-accent {
            background-color: var(--accent-color);
        }
        
        body {
            background-color: var(--background-color);
        }
    `;
    document.head.appendChild(style);
}