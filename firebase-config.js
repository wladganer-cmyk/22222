// firebase-config.js
// ⚠️ ЗАМЕНИТЕ ЭТИ ДАННЫЕ НА СВОИ С FIREBASE CONSOLE ⚠️

const firebaseConfig = {
    apiKey: "AIzaSyCAwsUfEa4zkAq-aM1Xc-uE9b3phnQTyYU",
    authDomain: "sirvornya-sobko.firebaseapp.com",
    databaseURL: "https://sirvornya-sobko-default-rtdb.europe-west1.firebasedatabase.app
",
    projectId: "sobko-cheese-shop",
    storageBucket: "sirvornya-sobko",
  messagingSenderId: "56185607530",
  appId: "1:56185607530:web:82ff25d529d049d4e08113",
  measurementId: "G-Q8022N5S96"
};

// Глобальные переменные Firebase
let firebaseApp;
let auth;
let db;
let storage;

// Инициализация Firebase
function initializeFirebase() {
    try {
        // Проверяем, не инициализирован ли Firebase уже
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase успешно инициализирован');
        } else {
            firebaseApp = firebase.app();
            console.log('✅ Firebase уже был инициализирован');
        }
        
        // Инициализируем сервисы
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        
        // Настройка оффлайн поддержки
        if (db) {
            db.enablePersistence()
                .then(() => {
                    console.log('📁 Оффлайн поддержка включена');
                })
                .catch((err) => {
                    console.log('Оффлайн поддержка не доступна:', err);
                });
        }
        
        return true;
    } catch (error) {
        console.error('❌ Ошибка инициализации Firebase:', error);
        
        // Показываем уведомление пользователю
        if (typeof showNotification === 'function') {
            showNotification('⚠️ Ошибка подключения к серверу. Используем локальные данные.', 'error', 5000);
        }
        
        return false;
    }
}

// Проверка подключения к Firebase
function checkFirebaseConnection() {
    if (!db) {
        console.warn('⚠️ Firebase Firestore не доступен');
        return false;
    }
    return true;
}

// Функция для проверки соединения с интернетом
function checkInternetConnection() {
    return navigator.onLine;
}

// Функция для отправки данных в Firebase с обработкой ошибок
async function saveToFirebase(collectionName, documentId, data) {
    if (!checkFirebaseConnection() || !checkInternetConnection()) {
        console.log('📁 Сохранение в Firebase пропущено (нет соединения)');
        return false;
    }
    
    try {
        // Добавляем метаданные
        const dataWithMeta = {
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: 'admin',
            syncStatus: 'synced'
        };
        
        await db.collection(collectionName).doc(documentId).set(dataWithMeta, { merge: true });
        console.log(`✅ Данные сохранены в Firebase: ${collectionName}/${documentId}`);
        return true;
    } catch (error) {
        console.error(`❌ Ошибка сохранения в Firebase:`, error);
        
        // Сохраняем данные для оффлайн синхронизации
        saveToOfflineQueue(collectionName, documentId, data, error);
        
        return false;
    }
}

// Сохранение в очередь оффлайн
function saveToOfflineQueue(collectionName, documentId, data, error) {
    const offlineData = {
        collection: collectionName,
        documentId: documentId,
        data: data,
        timestamp: new Date().toISOString(),
        error: error.message,
        retryCount: 0
    };
    
    const offlineQueue = JSON.parse(localStorage.getItem('firebase_offline_queue') || '[]');
    offlineQueue.push(offlineData);
    localStorage.setItem('firebase_offline_queue', JSON.stringify(offlineQueue));
    
    console.log('📝 Данные сохранены в очередь оффлайн синхронизации');
}

// Функция для загрузки данных из Firebase
async function loadFromFirebase(collectionName, documentId) {
    if (!checkFirebaseConnection() || !checkInternetConnection()) {
        console.log('📁 Загрузка из Firebase пропущена (нет соединения)');
        return null;
    }
    
    try {
        const docRef = db.collection(collectionName).doc(documentId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            console.log(`✅ Данные загружены из Firebase: ${collectionName}/${documentId}`);
            return doc.data();
        } else {
            console.log(`📭 Документ не найден в Firebase: ${collectionName}/${documentId}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Ошибка загрузки из Firebase:`, error);
        return null;
    }
}

// Синхронизация оффлайн данных
async function syncOfflineQueue() {
    if (!checkFirebaseConnection() || !checkInternetConnection()) {
        return;
    }
    
    const offlineQueue = JSON.parse(localStorage.getItem('firebase_offline_queue') || '[]');
    
    if (offlineQueue.length === 0) {
        return;
    }
    
    console.log(`🔄 Синхронизация ${offlineQueue.length} оффлайн записей...`);
    
    const successfulSyncs = [];
    const failedSyncs = [];
    
    for (let i = 0; i < offlineQueue.length; i++) {
        const item = offlineQueue[i];
        
        try {
            await saveToFirebase(item.collection, item.documentId, item.data);
            successfulSyncs.push(i);
            console.log(`✅ Синхронизирована запись ${i}`);
        } catch (error) {
            console.log(`❌ Не удалось синхронизировать запись ${i}:`, error);
            failedSyncs.push(i);
            
            // Увеличиваем счетчик попыток
            if (item.retryCount < 5) {
                item.retryCount++;
                offlineQueue[i] = item;
            }
        }
    }
    
    // Удаляем успешно синхронизированные записи
    if (successfulSyncs.length > 0) {
        const newQueue = offlineQueue.filter((_, index) => !successfulSyncs.includes(index));
        localStorage.setItem('firebase_offline_queue', JSON.stringify(newQueue));
        console.log(`✅ Синхронизировано ${successfulSyncs.length} записей`);
    }
    
    // Обновляем оставшиеся записи
    if (failedSyncs.length > 0) {
        localStorage.setItem('firebase_offline_queue', JSON.stringify(offlineQueue));
    }
}

// Настройка слушателя изменений в реальном времени
function setupFirebaseListener(collectionName, documentId, callback) {
    if (!checkFirebaseConnection()) {
        console.log('❌ Firebase недоступен для слушателя');
        return () => {}; // Возвращаем пустую функцию для отписки
    }
    
    try {
        const unsubscribe = db.collection(collectionName).doc(documentId)
            .onSnapshot(
                // Успешная обработка
                (doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        console.log(`🔄 Получены обновления из Firebase: ${collectionName}/${documentId}`);
                        callback(data);
                    } else {
                        console.log(`📭 Документ не найден: ${collectionName}/${documentId}`);
                    }
                },
                // Обработка ошибок
                (error) => {
                    console.error(`❌ Ошибка слушателя Firebase:`, error);
                    
                    // Пробуем переподключиться через 10 секунд
                    setTimeout(() => {
                        console.log('🔄 Переподключение слушателя Firebase...');
                        setupFirebaseListener(collectionName, documentId, callback);
                    }, 10000);
                }
            );
        
        console.log(`👂 Слушатель Firebase установлен: ${collectionName}/${documentId}`);
        return unsubscribe;
    } catch (error) {
        console.error(`❌ Ошибка настройки слушателя Firebase:`, error);
        return () => {};
    }
}

// Функция для загрузки изображений в Firebase Storage
async function uploadImageToFirebase(file, path) {
    if (!checkFirebaseConnection() || !storage) {
        throw new Error('Firebase Storage не доступен');
    }
    
    try {
        const storageRef = storage.ref();
        const imageRef = storageRef.child(path);
        
        // Загружаем файл
        const snapshot = await imageRef.put(file);
        
        // Получаем URL загруженного файла
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        console.log(`✅ Изображение загружено: ${downloadURL}`);
        return downloadURL;
    } catch (error) {
        console.error('❌ Ошибка загрузки изображения:', error);
        throw error;
    }
}

// Функция для создания уведомления об обновлении
async function notifyClientsAboutUpdate(type = 'site_data') {
    if (!checkFirebaseConnection()) {
        return false;
    }
    
    try {
        await db.collection('updates').doc('last_update').set({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            type: type,
            version: Date.now() // Используем timestamp как версию
        });
        console.log('📢 Клиенты уведомлены об обновлении');
        return true;
    } catch (error) {
        console.log('Не удалось уведомить клиентов:', error);
        return false;
    }
}

// Функция для принудительной проверки обновлений
async function checkForUpdates() {
    if (!checkFirebaseConnection()) {
        return false;
    }
    
    try {
        const updateDoc = await db.collection('updates').doc('last_update').get();
        if (updateDoc.exists) {
            const updateData = updateDoc.data();
            const lastUpdateTime = localStorage.getItem('last_update_time') || '0';
            
            if (updateData.timestamp && updateData.timestamp.toMillis() > parseInt(lastUpdateTime)) {
                console.log('🔄 Обнаружены новые обновления');
                localStorage.setItem('last_update_time', updateData.timestamp.toMillis().toString());
                return true;
            }
        }
        return false;
    } catch (error) {
        console.log('Ошибка проверки обновлений:', error);
        return false;
    }
}

// Инициализация оффлайн синхронизации
function initOfflineSync() {
    // Проверяем соединение каждые 30 секунд
    setInterval(() => {
        if (checkInternetConnection() && checkFirebaseConnection()) {
            syncOfflineQueue();
        }
    }, 30000);
    
    // Слушаем события изменения соединения
    window.addEventListener('online', () => {
        console.log('🌐 Соединение восстановлено');
        showNotification('🌐 Соединение с интернетом восстановлено', 'info', 2000);
        syncOfflineQueue();
    });
    
    window.addEventListener('offline', () => {
        console.log('📴 Потеряно соединение с интернетом');
        showNotification('📴 Отсутствует подключение к интернету', 'warning', 2000);
    });
}

// Тестовая функция для проверки Firebase
async function testFirebaseConnection() {
    if (!checkFirebaseConnection()) {
        console.error('❌ Firebase не подключен!');
        return false;
    }
    
    try {
        const testData = { 
            test: 'Connection test',
            timestamp: new Date().toISOString()
        };
        await db.collection('connection_tests').doc('test').set(testData);
        console.log('✅ Firebase подключен и работает!');
        return true;
    } catch (error) {
        console.error('❌ Ошибка Firebase:', error);
        return false;
    }
}

// Утилита для отправки уведомлений другим вкладкам
function broadcastUpdate(message) {
    // Через BroadcastChannel
    if ('BroadcastChannel' in window) {
        try {
            const channel = new BroadcastChannel('sobko_updates');
            channel.postMessage(message || {
                type: 'data_updated',
                timestamp: Date.now(),
                source: 'firebase'
            });
            console.log('📡 Отправлено сообщение другим вкладкам');
        } catch (e) {
            console.log('BroadcastChannel не поддерживается');
        }
    }
    
    // Через localStorage события
    localStorage.setItem('last_broadcast', Date.now().toString());
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'last_broadcast',
        newValue: Date.now().toString()
    }));
}

// Экспорт для использования в других файлах
window.firebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;
window.checkFirebaseConnection = checkFirebaseConnection;
window.saveToFirebase = saveToFirebase;
window.loadFromFirebase = loadFromFirebase;
window.setupFirebaseListener = setupFirebaseListener;
window.uploadImageToFirebase = uploadImageToFirebase;
window.initOfflineSync = initOfflineSync;
window.notifyClientsAboutUpdate = notifyClientsAboutUpdate;
window.checkForUpdates = checkForUpdates;
window.testFirebaseConnection = testFirebaseConnection;
window.broadcastUpdate = broadcastUpdate;
window.syncOfflineQueue = syncOfflineQueue;

// Автоматическая инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем Firebase
    initializeFirebase();
    
    // Инициализируем оффлайн синхронизацию
    initOfflineSync();
    
    // Запускаем первоначальную синхронизацию
    setTimeout(syncOfflineQueue, 3000);
    
    // Тестируем подключение
    setTimeout(testFirebaseConnection, 5000);
});

console.log('✅ Firebase конфигурация загружена');
