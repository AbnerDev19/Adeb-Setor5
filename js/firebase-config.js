// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// ADICIONADO: GoogleAuthProvider e signInWithPopup
import { getAuth, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCmM0pqJ1szKIHYM-TLSJfJouD8CQjs0Wk", // Suas chaves continuam as mesmas
    authDomain: "adeb-setor5.firebaseapp.com",
    projectId: "adeb-setor5",
    storageBucket: "adeb-setor5.firebasestorage.app",
    messagingSenderId: "175849481012",
    appId: "1:175849481012:web:b9a883c161e2172653fb61"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); // Configura o Google

export {
    db,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc,
    auth,
    signOut,
    onAuthStateChanged,
    provider,
    signInWithPopup // Exporta as novas funções
};