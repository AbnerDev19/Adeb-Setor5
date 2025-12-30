// Importar do CDN (Links diretos para funcionar no navegador sem instalação)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Suas credenciais do projeto "adeb-setor5"
const firebaseConfig = {
    apiKey: "AIzaSyCmM0pqJ1szKIHYM-TLSJfJouD8CQjs0Wk",
    authDomain: "adeb-setor5.firebaseapp.com",
    projectId: "adeb-setor5",
    storageBucket: "adeb-setor5.firebasestorage.app",
    messagingSenderId: "175849481012",
    appId: "1:175849481012:web:b9a883c161e2172653fb61"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportar as ferramentas para os outros arquivos usarem
export { db, collection, addDoc, onSnapshot, query, orderBy };