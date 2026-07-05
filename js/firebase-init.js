// Firebase initialization
// Exposes db, storage, appId, and the specific Firestore/Storage functions
// used elsewhere as window globals, since this file (a real ES module) can't
// share top-level bindings with the plain <script type="text/babel"> files
// the rest of the app uses.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAT795plnO85IoAlZGQaIi6l7iXkX15Gww",
    authDomain: "order-history-test.firebaseapp.com",
    projectId: "order-history-test",
    storageBucket: "order-history-test.firebasestorage.app",
    messagingSenderId: "234548535985",
    appId: "1:234548535985:web:8b39f7c00da4568c4bf890"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Expose to the global scope for the other (non-module) script files
window.db = db;
window.storage = storage;
window.appId = appId;
window.collection = collection;
window.onSnapshot = onSnapshot;
window.doc = doc;
window.setDoc = setDoc;
window.deleteDoc = deleteDoc;
window.getDoc = getDoc;
window.ref = ref;
window.uploadBytes = uploadBytes;
window.getDownloadURL = getDownloadURL;

// Signal that firebase is ready (used defensively, though in practice the
// other scripts only touch these globals inside effects/handlers that run
// after initial mount, not during the initial synchronous render).
window.dispatchEvent(new Event('firebase-ready'));
