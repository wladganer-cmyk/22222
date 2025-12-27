// firebase-config.js
// ВАЖНО: Замените эти значения на свои из Firebase Console

const firebaseConfig = {
    apiKey: "AIzaSyC_abcdefghijklmnopqrstuvwxyz123456",
    authDomain: "sobko-cheese.firebaseapp.com",
    projectId: "sobko-cheese",
    storageBucket: "sobko-cheese.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Экспорт сервисов
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebase, auth, db, storage };
}