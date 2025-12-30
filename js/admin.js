// js/admin.js
import { db, collection, addDoc, auth, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase-config.js';

// --- CONFIGURAÇÃO DE SEGURANÇA ---
// COLOQUE AQUI OS E-MAILS DA LIDERANÇA QUE PODEM ACESSAR
const EMAILS_PERMITIDOS = [
    "seu.email@gmail.com",
    "email.pastor@gmail.com",
    "secretaria.adeb@gmail.com"
];

const adminSection = document.getElementById('admin-section');
const btnLoginToggle = document.getElementById('btnLogin');
const loginText = document.getElementById('loginText');
const loginContainer = document.getElementById('login-form-container');
const eventContainer = document.getElementById('event-form-container');
const btnLoginGoogle = document.getElementById('btnLoginGoogle'); // Novo botão
const btnLogout = document.getElementById('btnLogout');
const btnSave = document.getElementById('btnSaveEvent');

// 1. Monitorar Autenticação
onAuthStateChanged(auth, async(user) => {
    if (user) {
        // Verifica se o e-mail está na lista permitida
        if (EMAILS_PERMITIDOS.includes(user.email)) {
            // PERMITIDO
            console.log("Líder conectado:", user.email);
            loginContainer.style.display = "none";
            eventContainer.style.display = "block";
            loginText.innerText = "Painel (Logado)";
        } else {
            // BLOQUEADO (Logou, mas não é líder)
            alert("Acesso Negado: Este e-mail Google não tem permissão de liderança.");
            await signOut(auth); // Expulsa o usuário
        }
    } else {
        // NINGUÉM LOGADO
        loginContainer.style.display = "block";
        eventContainer.style.display = "none";
        loginText.innerText = "Área do Líder";
    }
});

// 2. Toggle Sidebar
btnLoginToggle.addEventListener('click', () => {
    if (adminSection.style.display === "none" || adminSection.style.display === "") {
        adminSection.style.display = "block";
        setTimeout(() => adminSection.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
        adminSection.style.display = "none";
    }
});

// 3. Login com Google
if (btnLoginGoogle) {
    btnLoginGoogle.addEventListener('click', async() => {
        try {
            await signInWithPopup(auth, provider);
            // O onAuthStateChanged vai lidar com o resto
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com Google.");
        }
    });
}

// 4. Logout
btnLogout.addEventListener('click', async() => {
    await signOut(auth);
});

// 5. Salvar Evento
btnSave.addEventListener('click', async() => {
    const title = document.getElementById('evtTitle').value;
    const date = document.getElementById('evtDate').value;
    const loc = document.getElementById('evtLoc').value;

    if (!title || !date) return alert('Preencha título e data.');

    // Dupla verificação de segurança antes de salvar
    if (!auth.currentUser || !EMAILS_PERMITIDOS.includes(auth.currentUser.email)) {
        return alert("Erro de segurança: Você não tem permissão.");
    }

    btnSave.innerText = "Salvando...";
    try {
        await addDoc(collection(db, "eventos"), {
            title: title,
            date: date,
            location: loc,
            time: '19:30',
            createdAt: new Date(),
            createdBy: auth.currentUser.email
        });
        alert('Evento salvo!');
        document.getElementById('evtTitle').value = '';
        document.getElementById('evtDate').value = '';
        document.getElementById('evtLoc').value = '';
    } catch (e) {
        console.error(e);
        alert("Erro ao salvar.");
    } finally {
        btnSave.innerText = "Salvar Evento";
    }
});