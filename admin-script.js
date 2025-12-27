// admin-script.js - Админ-панель (исправленная версия)

// Константы для ключей localStorage
const PRODUCTS_KEY = 'products';
const SETTINGS_KEY = 'siteSettings';
const COLORS_KEY = 'siteColors';
const IMAGES_KEY = 'siteImages';
const ORDERS_KEY = 'orders';

// Данные
let currentEditProductId = null;
let currentViewOrderId = null;
let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initDefaultData();
    setupTabs();
    loadProducts();
    loadOrders();
    updateStatistics();
    setupEventListeners();
    loadSettings();
    loadColors();
    loadImages();
});

// Инициализация дефолтных данных
function initDefaultData() {
    // Дефолтные товары
    if (!localStorage.getItem(PRODUCTS_KEY)) {
        const defaultProducts = [
            {
                id: 1,
                name: "Пармезан 2 года",
                category: "cheese",
                weight: "100 гр",
                price: 490,
                image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGNEY0RjQiLz48cGF0aCBkPSJNNzAgNzBMMTAwIDEwMEwxMzAgNzAiIHN0cm9rZT0iI0JDRDJFMSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjRUVFRUVFIiBzdHJva2U9IiNCQ0QyRTEiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik05MCA5MEgxMTBWMTEwSDkwWiIgZmlsbD0iI0JDRDJFMSIvPjwvc3ZnPg==",
                description: "Выдержанный итальянский пармезан",
                isNew: true,
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: "Буррата",
                category: "cheese",
                weight: "100 гр",
                price: 220,
                image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGNEY0RjQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjYwIiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNCQ0QyRTEiIHN0cm9rZS13aWR0aD0iNCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iI0JDRDJFMSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTcwIDEwMEgxMzBNMTAwIDcwVjEzMCIgc3Ryb2tlPSIjQkNEMkUxIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=",
                description: "Итальянский сыр с нежной текстурой",
                isNew: false,
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    }

    // Дефолтные настройки
    if (!localStorage.getItem(SETTINGS_KEY)) {
        const defaultSettings = {
            siteName: "Сыроварня SOBKO",
            siteDescription: "Ремесленный сыр из фермерского молока",
            phone1: "8-952-322-45-85",
            contactName1: "Ольга",
            phone2: "8-902-635-33-03",
            contactName2: "Владимир",
            minOrder: 1000,
            freeDelivery: 2500,
            deliveryCost: 300,
            pickupAddress: "Краснокамск, ул. Геофизиков, 6, ТЦ Добрыня",
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    }

    // Дефолтные цвета
    if (!localStorage.getItem(COLORS_KEY)) {
        const defaultColors = {
            primaryColor: "#1B5E20",
            accentColor: "#FFD700",
            backgroundColor: "#FFF5F5"
        };
        localStorage.setItem(COLORS_KEY, JSON.stringify(defaultColors));
    }

    // Дефолтные изображения
    if (!localStorage.getItem(IMAGES_KEY)) {
        const defaultImages = {
            logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyOCIgZmlsbD0iIzFCNUUyMCIvPjxwYXRoIGQ9Ik0yMCAzNUwzMCA0NUw0MCAyNSIgc3Ryb2tlPSIjRkZEIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==",
            banner: ""
        };
        localStorage.setItem(IMAGES_KEY, JSON.stringify(defaultImages));
    }

    // Дефолтные заказы
    if (!localStorage.getItem(ORDERS_KEY)) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    }
}

// Настройка вкладок
function setupTabs() {
    const tabLinks = document.querySelectorAll('.admin-nav a');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            tabLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            
            this.classList.add('active');
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.add('active');
            
            if (tabId === 'products') {
                loadProducts();
            } else if (tabId === 'orders') {
                loadOrders();
            } else if (tabId === 'content') {
                loadImages();
            }
        });
    });
}

// Загрузка товаров
function loadProducts() {
    const productsList = document.getElementById('productsList');
    const productsCount = document.getElementById('productsCount');
    
    if (!productsList) return;
    
    productsList.innerHTML = '';
    
    const allProducts = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    
    const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    
    const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            (product.description || '').toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    if (filteredProducts.length === 0) {
        productsList.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить критерии поиска или добавьте новый товар</p>
            </div>
        `;
        if (productsCount) productsCount.textContent = '0';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsList.appendChild(productCard);
    });
    
    if (productsCount) productsCount.textContent = filteredProducts.length;
}

// Создание карточки товара
function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card-admin';
    div.dataset.id = product.id;
    
    const badge = product.isNew ? '<span class="product-badge badge-new">НОВИНКА</span>' : '';
    const statusBadge = product.isActive !== false ? '' : '<span class="product-badge badge-inactive">НЕ АКТИВЕН</span>';
    
    const productImage = product.image || getDefaultProductImage();
    
    div.innerHTML = `
        <div class="product-image-admin">
            <img src="${productImage}" alt="${product.name}" onerror="this.src='${getDefaultProductImage()}'">
        </div>
        <div class="product-info-admin">
            <div class="product-header-admin">
                <h4>${product.name}</h4>
                <div>
                    ${badge}
                    ${statusBadge}
                </div>
            </div>
            <p class="product-meta">${getCategoryName(product.category)} • ${product.weight || 'Не указано'}</p>
            <p class="product-price-admin">${product.price ? product.price.toLocaleString() : '0'} ₽</p>
            <p class="product-description">${product.description || ''}</p>
            <div class="product-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i> Изменить
                </button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        </div>
    `;
    
    return div;
}

function getCategoryName(category) {
    const categories = {
        'new': 'Новинки',
        'meat': 'Мясная продукция',
        'dessert': 'Десерты',
        'cheese': 'Сыры',
        'milk': 'Молочная продукция'
    };
    return categories[category] || category;
}

function getDefaultProductImage() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGNEY0RjQiLz48cGF0aCBkPSJNNzAgNzBMMTAwIDEwMEwxMzAgNzAiIHN0cm9rZT0iI0JDRDJFMSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjRUVFRUVFIiBzdHJva2U9IiNCQ0QyRTEiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik05MCA5MEgxMTBWMTEwSDkwWiIgZmlsbD0iI0JDRDJFMSIvPjwvc3ZnPg==';
}

// Поиск товаров
function searchProducts() {
    loadProducts();
}

function filterProducts() {
    loadProducts();
}

// Модальное окно товара
function openAddProductModal() {
    currentEditProductId = null;
    document.getElementById('modalTitle').textContent = 'Добавить товар';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('previewImage').src = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('noImage').style.display = 'flex';
    document.getElementById('productModal').style.display = 'flex';
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    currentEditProductId = id;
    document.getElementById('modalTitle').textContent = 'Редактировать товар';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productWeight').value = product.weight || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productIsNew').checked = product.isNew || false;
    document.getElementById('productIsActive').checked = product.isActive !== false;
    
    if (product.image) {
        document.getElementById('previewImage').src = product.image;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('noImage').style.display = 'none';
    } else {
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('noImage').style.display = 'flex';
    }
    
    document.getElementById('productModal').style.display = 'flex';
}

function previewImage(event) {
    const input = event.target;
    const preview = document.getElementById('previewImage');
    const noImage = document.getElementById('noImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            imagePreview.style.display = 'block';
            noImage.style.display = 'none';
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Функция сохранения продукта - ИСПРАВЛЕНА
function saveProduct(event) {
    event.preventDefault();
    
    const id = currentEditProductId || Date.now();
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const weight = document.getElementById('productWeight').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const description = document.getElementById('productDescription').value.trim();
    const isNew = document.getElementById('productIsNew').checked;
    const isActive = document.getElementById('productIsActive').checked;
    
    // Валидация
    if (!name) {
        showNotification('Введите название товара', 'error');
        return false;
    }
    
    if (price <= 0) {
        showNotification('Введите корректную цену', 'error');
        return false;
    }
    
    const imageInput = document.getElementById('productImage');
    
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const image = e.target.result;
            saveProductFinal(id, name, category, weight, price, description, isNew, isActive, image);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else if (currentEditProductId) {
        const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
        const oldProduct = products.find(p => p.id === currentEditProductId);
        const image = oldProduct?.image || getDefaultProductImage();
        saveProductFinal(id, name, category, weight, price, description, isNew, isActive, image);
    } else {
        const image = getDefaultProductImage();
        saveProductFinal(id, name, category, weight, price, description, isNew, isActive, image);
    }
    
    return false;
}

function saveProductFinal(id, name, category, weight, price, description, isNew, isActive, image) {
    const productData = {
        id,
        name,
        category,
        weight,
        price,
        image: image,
        description,
        isNew,
        isActive: isActive !== false,
        createdAt: new Date().toISOString()
    };
    
    let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    
    if (currentEditProductId) {
        const index = products.findIndex(p => p.id === currentEditProductId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
    } else {
        products.push(productData);
    }
    
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    
    // Устанавливаем флаг обновления для главного сайта
    localStorage.setItem('lastProductsUpdate', Date.now().toString());
    
    showNotification(currentEditProductId ? 'Товар обновлен!' : 'Товар добавлен!', 'success');
    
    // Закрываем модалку и обновляем список
    setTimeout(() => {
        closeModal();
        loadProducts();
    }, 500);
}

function deleteProduct(id) {
    showConfirm('Удалить товар?', function() {
        let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        
        // Устанавливаем флаг обновления
        localStorage.setItem('lastProductsUpdate', Date.now().toString());
        
        showNotification('Товар удален!', 'success');
        loadProducts();
    });
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    currentEditProductId = null;
}

// Управление заказами
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    const ordersCount = document.getElementById('ordersCount');
    
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    
    const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
    const dateFilter = document.getElementById('orderDateFilter')?.value || 'all';
    
    let filteredOrders = orders;
    
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    if (dateFilter !== 'all') {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            
            switch(dateFilter) {
                case 'today':
                    return orderDate >= startOfDay;
                case 'week':
                    return orderDate >= startOfWeek;
                case 'month':
                    return orderDate >= startOfMonth;
                default:
                    return true;
            }
        });
    }
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-clipboard-list"></i>
                <h3>Заказы не найдены</h3>
                <p>Нет заказов по выбранным критериям</p>
            </div>
        `;
        if (ordersCount) ordersCount.textContent = '0';
        return;
    }
    
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    filteredOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
    
    if (ordersCount) ordersCount.textContent = filteredOrders.length;
}

function createOrderCard(order) {
    const div = document.createElement('div');
    div.className = 'order-card';
    div.dataset.id = order.id;
    
    const statusClass = getStatusClass(order.status);
    const totalAmount = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    
    div.innerHTML = `
        <div class="order-header">
            <div class="order-info">
                <span class="order-id">Заказ #${order.id}</span>
                <span class="order-date">${formatDate(order.createdAt)}</span>
            </div>
            <span class="order-status ${statusClass}">${getStatusText(order.status)}</span>
        </div>
        <div class="order-details">
            <div class="customer-info">
                <p><strong>${order.customerName}</strong></p>
                <p>${order.phone}</p>
                <p>${order.address || 'Самовывоз'}</p>
            </div>
            <div class="order-items">
                <p><strong>Товары:</strong></p>
                ${order.items?.map(item => `
                    <p>${item.name} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} ₽</p>
                `).join('') || '<p>Нет товаров</p>'}
            </div>
            <div class="order-total">
                <p><strong>Итого:</strong> ${totalAmount.toLocaleString()} ₽</p>
            </div>
        </div>
        <div class="order-actions">
            <button class="btn-view" onclick="viewOrder(${order.id})">
                <i class="fas fa-eye"></i> Подробнее
            </button>
            ${order.status === 'pending' ? `
                <button class="btn-confirm" onclick="confirmOrder(${order.id})">
                    <i class="fas fa-check"></i> Подтвердить
                </button>
                <button class="btn-cancel" onclick="cancelOrder(${order.id})">
                    <i class="fas fa-times"></i> Отменить
                </button>
            ` : ''}
        </div>
    `;
    
    return div;
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

function viewOrder(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    
    currentViewOrderId = id;
    document.getElementById('viewOrderId').textContent = `Заказ #${order.id}`;
    document.getElementById('viewOrderDate').textContent = formatDate(order.createdAt);
    document.getElementById('viewCustomerName').textContent = order.customerName;
    document.getElementById('viewCustomerPhone').textContent = order.phone;
    document.getElementById('viewCustomerAddress').textContent = order.address || 'Самовывоз';
    document.getElementById('viewOrderStatus').textContent = getStatusText(order.status);
    document.getElementById('viewOrderStatus').className = `order-status ${getStatusClass(order.status)}`;
    
    const itemsList = document.getElementById('viewOrderItems');
    itemsList.innerHTML = '';
    
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item-detail';
            itemElement.innerHTML = `
                <p><strong>${item.name}</strong></p>
                <p>${item.quantity} × ${item.price.toLocaleString()} ₽ = ${(item.quantity * item.price).toLocaleString()} ₽</p>
            `;
            itemsList.appendChild(itemElement);
        });
    }
    
    const total = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    document.getElementById('viewOrderTotal').textContent = `${total.toLocaleString()} ₽`;
    
    document.getElementById('orderModal').style.display = 'flex';
}

function confirmOrder(id) {
    updateOrderStatus(id, 'confirmed');
}

function cancelOrder(id) {
    updateOrderStatus(id, 'cancelled');
}

function completeOrder(id) {
    updateOrderStatus(id, 'completed');
}

function updateOrderStatus(id, status) {
    let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        
        showNotification(`Статус заказа #${id} изменен на "${getStatusText(status)}"`, 'success');
        loadOrders();
    }
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

// Статистика
function updateStatistics() {
    const totalOrders = document.getElementById('totalOrders');
    const totalRevenue = document.getElementById('totalRevenue');
    const pendingOrders = document.getElementById('pendingOrders');
    
    if (!totalOrders || !totalRevenue || !pendingOrders) return;
    
    const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    
    // Общее количество заказов
    totalOrders.textContent = allOrders.length;
    
    // Общая выручка
    const revenue = allOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => {
            const orderTotal = order.items?.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0) || 0;
            return sum + orderTotal;
        }, 0);
    
    totalRevenue.textContent = `${revenue.toLocaleString()} ₽`;
    
    // Ожидающие заказы
    const pendingCount = allOrders.filter(order => order.status === 'pending').length;
    pendingOrders.textContent = pendingCount;
}

// Загрузка настроек
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    
    if (document.getElementById('siteName')) {
        document.getElementById('siteName').value = settings.siteName || 'Сыроварня SOBKO';
    }
    if (document.getElementById('siteDescription')) {
        document.getElementById('siteDescription').value = settings.siteDescription || 'Ремесленный сыр из фермерского молока';
    }
    if (document.getElementById('phone1')) {
        document.getElementById('phone1').value = settings.phone1 || '8-952-322-45-85';
    }
    if (document.getElementById('contactName1')) {
        document.getElementById('contactName1').value = settings.contactName1 || 'Ольга';
    }
    if (document.getElementById('phone2')) {
        document.getElementById('phone2').value = settings.phone2 || '8-902-635-33-03';
    }
    if (document.getElementById('contactName2')) {
        document.getElementById('contactName2').value = settings.contactName2 || 'Владимир';
    }
    if (document.getElementById('minOrder')) {
        document.getElementById('minOrder').value = settings.minOrder || 1000;
    }
    if (document.getElementById('freeDelivery')) {
        document.getElementById('freeDelivery').value = settings.freeDelivery || 2500;
    }
    if (document.getElementById('deliveryCost')) {
        document.getElementById('deliveryCost').value = settings.deliveryCost || 300;
    }
    if (document.getElementById('pickupAddress')) {
        document.getElementById('pickupAddress').value = settings.pickupAddress || 'Краснокамск, ул. Геофизиков, 6, ТЦ Добрыня';
    }
}

// Сохранение настроек - ИСПРАВЛЕНО
function saveSettings(event) {
    if (event) event.preventDefault();
    
    const settings = {
        siteName: document.getElementById('siteName').value,
        siteDescription: document.getElementById('siteDescription').value,
        phone1: document.getElementById('phone1').value,
        contactName1: document.getElementById('contactName1').value,
        phone2: document.getElementById('phone2').value,
        contactName2: document.getElementById('contactName2').value,
        minOrder: parseInt(document.getElementById('minOrder').value) || 1000,
        freeDelivery: parseInt(document.getElementById('freeDelivery').value) || 2500,
        deliveryCost: parseInt(document.getElementById('deliveryCost').value) || 300,
        pickupAddress: document.getElementById('pickupAddress').value,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    
    // Устанавливаем флаг обновления для главного сайта
    localStorage.setItem('lastSettingsUpdate', Date.now().toString());
    
    showNotification('Настройки сохранены!', 'success');
    return false;
}

// Загрузка цветов
function loadColors() {
    const colors = JSON.parse(localStorage.getItem(COLORS_KEY)) || {};
    
    if (document.getElementById('primaryColor')) {
        document.getElementById('primaryColor').value = colors.primaryColor || '#1B5E20';
    }
    if (document.getElementById('accentColor')) {
        document.getElementById('accentColor').value = colors.accentColor || '#FFD700';
    }
    if (document.getElementById('backgroundColor')) {
        document.getElementById('backgroundColor').value = colors.backgroundColor || '#FFF5F5';
    }
}

// Сохранение цветов - ИСПРАВЛЕНО
function saveColors(event) {
    if (event) event.preventDefault();
    
    const colors = {
        primaryColor: document.getElementById('primaryColor').value,
        accentColor: document.getElementById('accentColor').value,
        backgroundColor: document.getElementById('backgroundColor').value
    };
    
    localStorage.setItem(COLORS_KEY, JSON.stringify(colors));
    
    // Устанавливаем флаг обновления для главного сайта
    localStorage.setItem('lastColorsUpdate', Date.now().toString());
    
    showNotification('Цвета сохранены!', 'success');
    return false;
}

// Загрузка изображений
function loadImages() {
    const images = JSON.parse(localStorage.getItem(IMAGES_KEY)) || {};
    const logo = images.logo;
    const banner = images.banner;
    
    if (logo) {
        const logoElement = document.getElementById('siteLogo');
        const currentLogoElement = document.getElementById('currentLogo');
        if (logoElement) logoElement.src = logo;
        if (currentLogoElement) currentLogoElement.src = logo;
    }
    
    if (banner) {
        const bannerElement = document.getElementById('mainBanner');
        if (bannerElement) bannerElement.src = banner;
    }
}

// Настройка обработчиков событий - ИСПРАВЛЕНО
function setupEventListeners() {
    // Изменение баннера - ИСПРАВЛЕНО
    const bannerUpload = document.getElementById('bannerUpload');
    if (bannerUpload) {
        bannerUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const bannerData = e.target.result;
                    
                    const images = JSON.parse(localStorage.getItem(IMAGES_KEY)) || {};
                    images.banner = bannerData;
                    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
                    
                    // Устанавливаем флаг обновления для главного сайта
                    localStorage.setItem('lastImagesUpdate', Date.now().toString());
                    
                    const bannerElement = document.getElementById('mainBanner');
                    if (bannerElement) {
                        bannerElement.src = bannerData;
                        bannerElement.style.display = 'block';
                    }
                    
                    showNotification('Баннер обновлен!', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Изменение логотипа - ИСПРАВЛЕНО
    const logoUpload = document.getElementById('logoUpload');
    if (logoUpload) {
        logoUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const logoData = e.target.result;
                    
                    const images = JSON.parse(localStorage.getItem(IMAGES_KEY)) || {};
                    images.logo = logoData;
                    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
                    
                    // Устанавливаем флаг обновления для главного сайта
                    localStorage.setItem('lastImagesUpdate', Date.now().toString());
                    
                    const logoElement = document.getElementById('siteLogo');
                    const currentLogoElement = document.getElementById('currentLogo');
                    if (logoElement) logoElement.src = logoData;
                    if (currentLogoElement) currentLogoElement.src = logoData;
                    
                    showNotification('Логотип обновлен!', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Сброс баннера - ИСПРАВЛЕНО
    const resetBannerBtn = document.querySelector('.btn-default');
    if (resetBannerBtn) {
        resetBannerBtn.addEventListener('click', function() {
            const images = JSON.parse(localStorage.getItem(IMAGES_KEY)) || {};
            images.banner = '';
            localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
            
            // Устанавливаем флаг обновления
            localStorage.setItem('lastImagesUpdate', Date.now().toString());
            
            const bannerElement = document.getElementById('mainBanner');
            if (bannerElement) {
                bannerElement.style.display = 'none';
            }
            
            showNotification('Баннер сброшен!', 'info');
        });
    }
    
    // Сохранение цветов - привязываем кнопку
    const saveColorsBtn = document.querySelector('.btn-save-colors');
    if (saveColorsBtn) {
        saveColorsBtn.addEventListener('click', saveColors);
    }
    
    // Сохранение настроек - привязываем форму
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveSettings);
    }
    
    // Сброс настроек
    const resetSettingsBtn = document.querySelector('.btn-reset');
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', function() {
            if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
                localStorage.removeItem(SETTINGS_KEY);
                localStorage.removeItem(COLORS_KEY);
                localStorage.removeItem(IMAGES_KEY);
                
                initDefaultData();
                loadSettings();
                loadColors();
                loadImages();
                showNotification('Настройки сброшены!', 'info');
            }
        });
    }
    
    // Закрытие модальных окон
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
        if (e.target.classList.contains('close-modal')) {
            e.target.closest('.modal').style.display = 'none';
        }
    });
}

// Вспомогательные функции
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
        z-index: 3000;
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

function showConfirm(message, callback) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmAction = document.getElementById('confirmAction');
    
    if (!confirmModal || !confirmMessage || !confirmAction) return;
    
    confirmMessage.textContent = message;
    confirmAction.onclick = function() {
        callback();
        closeConfirmModal();
    };
    confirmModal.style.display = 'flex';
}

function closeConfirmModal() {
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        confirmModal.style.display = 'none';
    }
}

function logout() {
    if (confirm('Выйти из админ-панели?')) {
        window.location.href = '../index.html';
    }
}

// Глобальные функции
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.saveProduct = saveProduct;
window.closeModal = closeModal;
window.previewImage = previewImage;
window.searchProducts = searchProducts;
window.filterProducts = filterProducts;
window.openAddProductModal = openAddProductModal;
window.saveSettings = saveSettings;
window.saveColors = saveColors;
window.logout = logout;
window.viewOrder = viewOrder;
window.confirmOrder = confirmOrder;
window.cancelOrder = cancelOrder;
window.completeOrder = completeOrder;
window.closeOrderModal = closeOrderModal;

// Стили для анимаций
if (!document.querySelector('#adminStyles')) {
    const style = document.createElement('style');
    style.id = 'adminStyles';
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
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        }
    `;
    document.head.appendChild(style);
}