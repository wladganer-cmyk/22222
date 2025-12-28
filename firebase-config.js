// firebase-config.js
// ⚠️ ЗАМЕНИТЕ ЭТИ ДАННЫЕ НА СВОИ С FIREBASE CONSOLE ⚠️

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCAwsUfEa4zkAq-aM1Xc-uE9b3phnQTyYU",
  authDomain: "sirvornya-sobko.firebaseapp.com",
  projectId: "sirvornya-sobko",
  storageBucket: "sirvornya-sobko.firebasestorage.app",
  messagingSenderId: "56185607530",
  appId: "1:56185607530:web:82ff25d529d049d4e08113",
  measurementId: "G-Q8022N5S96"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
        const offlineData = {
            collection: collectionName,
            documentId: documentId,
            data: data,
            timestamp: new Date().toISOString(),
            error: error.message
        };
        
        const offlineQueue = JSON.parse(localStorage.getItem('firebase_offline_queue') || '[]');
        offlineQueue.push(offlineData);
        localStorage.setItem('firebase_offline_queue', JSON.stringify(offlineQueue));
        
        console.log('📝 Данные сохранены в очередь оффлайн синхронизации');
        return false;
    }
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

// Функция для синхронизации оффлайн данных
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
    
    for (let i = 0; i < offlineQueue.length; i++) {
        const item = offlineQueue[i];
        
        try {
            await saveToFirebase(item.collection, item.documentId, item.data);
            successfulSyncs.push(i);
        } catch (error) {
            console.log(`❌ Не удалось синхронизировать запись ${i}:`, error);
        }
    }
    
    // Удаляем успешно синхронизированные записи
    if (successfulSyncs.length > 0) {
        const newQueue = offlineQueue.filter((_, index) => !successfulSyncs.includes(index));
        localStorage.setItem('firebase_offline_queue', JSON.stringify(newQueue));
        console.log(`✅ Синхронизировано ${successfulSyncs.length} записей`);
    }
}

// Настройка слушателя изменений в реальном времени
function setupFirebaseListener(collectionName, documentId, callback) {
    if (!checkFirebaseConnection()) {
        return () => {}; // Возвращаем пустую функцию для отписки
    }
    
    try {
        const unsubscribe = db.collection(collectionName).doc(documentId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    callback(doc.data());
                }
            }, (error) => {
                console.error(`❌ Ошибка слушателя Firebase:`, error);
            });
        
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

// Функция для очистки старых данных
function cleanupOldData(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    // Здесь можно добавить логику очистки старых данных
    // Например, удаление старых заказов или временных файлов
    console.log(`🧹 Очистка данных старше ${daysOld} дней`);
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
        syncOfflineQueue();
    });
    
    window.addEventListener('offline', () => {
        console.log('📴 Потеряно соединение с интернетом');
    });
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

// Автоматическая инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем Firebase
    initializeFirebase();
    
    // Инициализируем оффлайн синхронизацию
    initOfflineSync();
    
    // Запускаем первоначальную синхронизацию
    setTimeout(syncOfflineQueue, 5000);
});

console.log('✅ Firebase конфигурация загружена');

