// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Senin Proje Ayarların
const firebaseConfig = {
  apiKey: "AIzaSyDjAWNot4t2YRSTdpZpNavHtYA_yxX2ot4",
  authDomain: "perseus-tmc.firebaseapp.com",
  projectId: "perseus-tmc",
  storageBucket: "perseus-tmc.firebasestorage.app",
  messagingSenderId: "222871630187",
  appId: "1:222871630187:web:399ca53d57e49eac4e5c2e"
};

// Firebase'i Başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Veritabanını dışarıya aç (Diğer dosyalar kullanabilsin diye)
export { db };