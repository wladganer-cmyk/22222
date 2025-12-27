// sync.js - Синхронизация между админ-панелью и главным сайтом

class DataSync {
    constructor() {
        this.productsKey = 'sobko_products';
        this.settingsKey = 'sobko_settings';
        this.colorsKey = 'sobko_colors';
        this.imagesKey = 'sobko_images';
        this.listeners = new Set();
        
        // Инициализируем дефолтные данные если их нет
        this.initDefaultData();
    }

    // Инициализация дефолтных данных
    initDefaultData() {
        // Дефолтные товары
        if (!localStorage.getItem(this.productsKey)) {
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
            localStorage.setItem(this.productsKey, JSON.stringify(defaultProducts));
        }

        // Дефолтные настройки
        if (!localStorage.getItem(this.settingsKey)) {
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
            localStorage.setItem(this.settingsKey, JSON.stringify(defaultSettings));
        }

        // Дефолтные цвета
        if (!localStorage.getItem(this.colorsKey)) {
            const defaultColors = {
                primaryColor: "#1B5E20",
                accentColor: "#FFD700",
                backgroundColor: "#FFF5F5"
            };
            localStorage.setItem(this.colorsKey, JSON.stringify(defaultColors));
        }

        // Дефолтные изображения
        if (!localStorage.getItem(this.imagesKey)) {
            const defaultImages = {
                logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyOCIgZmlsbD0iIzFCNUUyMCIvPjxwYXRoIGQ9Ik0yMCAzNUwzMCA0NUw0MCAyNSIgc3Ryb2tlPSIjRkZEIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==",
                banner: ""
            };
            localStorage.setItem(this.imagesKey, JSON.stringify(defaultImages));
        }
    }

    // Инициализация
    init() {
        this.setupStorageListeners();
        return this;
    }

    // Получить все товары
    getProducts() {
        const products = JSON.parse(localStorage.getItem(this.productsKey)) || [];
        return products.filter(p => p.isActive !== false);
    }

    // Сохранить товары
    saveProducts(products) {
        localStorage.setItem(this.productsKey, JSON.stringify(products));
        this.notifyListeners('products', products);
        return products;
    }

    // Добавить товар
    addProduct(product) {
        const products = this.getProducts();
        const newProduct = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            isActive: true,
            ...product
        };
        products.push(newProduct);
        return this.saveProducts(products);
    }

    // Обновить товар
    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            return this.saveProducts(products);
        }
        return products;
    }

    // Удалить товар
    deleteProduct(id) {
        const products = this.getProducts();
        const filteredProducts = products.filter(p => p.id !== id);
        return this.saveProducts(filteredProducts);
    }

    // Получить настройки
    getSettings() {
        return JSON.parse(localStorage.getItem(this.settingsKey)) || {};
    }

    // Сохранить настройки
    saveSettings(settings) {
        const current = this.getSettings();
        const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
        localStorage.setItem(this.settingsKey, JSON.stringify(updated));
        this.notifyListeners('settings', updated);
        return updated;
    }

    // Получить цвета
    getColors() {
        return JSON.parse(localStorage.getItem(this.colorsKey)) || {};
    }

    // Сохранить цвета
    saveColors(colors) {
        const current = this.getColors();
        const updated = { ...current, ...colors };
        localStorage.setItem(this.colorsKey, JSON.stringify(updated));
        this.notifyListeners('colors', updated);
        return updated;
    }

    // Сохранить изображение
    saveImage(key, dataUrl) {
        const images = JSON.parse(localStorage.getItem(this.imagesKey)) || {};
        images[key] = dataUrl;
        localStorage.setItem(this.imagesKey, JSON.stringify(images));
        this.notifyListeners('images', { key, dataUrl });
        return dataUrl;
    }

    // Получить изображение
    getImage(key) {
        const images = JSON.parse(localStorage.getItem(this.imagesKey)) || {};
        return images[key];
    }

    // Получить все изображения
    getImages() {
        return JSON.parse(localStorage.getItem(this.imagesKey)) || {};
    }

    // Подписаться на изменения
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // Уведомить подписчиков
    notifyListeners(type, data) {
        this.listeners.forEach(listener => {
            try {
                listener(type, data);
            } catch (error) {
                console.error('Error in listener:', error);
            }
        });
    }

    // Настройка слушателей хранилища
    setupStorageListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.productsKey) {
                this.notifyListeners('products', JSON.parse(e.newValue || '[]'));
            } else if (e.key === this.settingsKey) {
                this.notifyListeners('settings', JSON.parse(e.newValue || '{}'));
            } else if (e.key === this.colorsKey) {
                this.notifyListeners('colors', JSON.parse(e.newValue || '{}'));
            } else if (e.key === this.imagesKey) {
                this.notifyListeners('images', JSON.parse(e.newValue || '{}'));
            }
        });
    }
}

// Глобальный экземпляр
window.dataSync = new DataSync().init();