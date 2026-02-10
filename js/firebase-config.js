import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Suas chaves de configuração
const firebaseConfig = {
    apiKey: "AIzaSyCmM0pqJ1szKIHYM-TLSJfJouD8CQjs0Wk",
    authDomain: "adeb-setor5.firebaseapp.com",
    projectId: "adeb-setor5",
    storageBucket: "adeb-setor5.firebasestorage.app",
    messagingSenderId: "175849481012",
    appId: "1:175849481012:web:b9a883c161e2172653fb61"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); 

export {
    db,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    where,       // <--- ADICIONADO AQUI
    deleteDoc,
    doc,
    auth,
    signOut,
    onAuthStateChanged,
    provider,
    signInWithPopup,
    signInWithEmailAndPassword
};