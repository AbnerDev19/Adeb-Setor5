// js/admin.js
import { db, collection, addDoc, auth, provider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';

// --- SEGURANÇA ---
const GMAIL_PERMITIDOS = [
    "abneroliveira19072004@gmail.com",
    "lideranca@adeb.com"
];

// Elementos Principais
const adminSection = document.getElementById('admin-section');
const btnLoginToggle = document.getElementById('btnLogin');
const loginText = document.getElementById('loginText');
const loginContainer = document.getElementById('login-form-container');
const eventContainer = document.getElementById('event-form-container');
const loginError = document.getElementById('loginError');
// 1. MONITOR DE LOGIN
onAuthStateChanged(auth, async(user) => {
    if (user) {
        // --- CORREÇÃO AQUI ---
        // Verifica se existe providerData e pega o primeiro provider de forma segura
        let isGoogle = false;
        if (user.providerData && user.providerData.length > 0) {
            isGoogle = user.providerData[0].providerId === 'google.com';
        }

        // Se for Google e não estiver na lista, TCHAU.
        if (isGoogle && !GMAIL_PERMITIDOS.includes(user.email)) {
            alert(`Acesso Negado: O e-mail ${user.email} não tem permissão.`);
            await signOut(auth);
            return;
        }
        console.log("Logado:", user.email);
        if (loginContainer) loginContainer.style.display = "none";
        if (eventContainer) eventContainer.style.display = "block";
        if (loginText) loginText.innerText = "Painel (Logado)";
    } else {
        if (loginContainer) loginContainer.style.display = "block";
        if (eventContainer) eventContainer.style.display = "none";
        if (loginText) loginText.innerText = "Área do Líder";
    }
});

// 2. Abrir/Fechar Painel da Sidebar
if (btnLoginToggle) {
    btnLoginToggle.addEventListener('click', () => {
        if (adminSection.style.display === "none" || adminSection.style.display === "") {
            adminSection.style.display = "block";
            setTimeout(() => adminSection.scrollIntoView({ behavior: 'smooth' }), 100);
        } else {
            adminSection.style.display = "none";
        }
    });
}

// 3. Botão Entrar com SENHA
const btnPass = document.getElementById('btnLoginPass');
if (btnPass) {
    btnPass.addEventListener('click', async() => {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;

        if (loginError) loginError.style.display = "none";
        btnPass.innerText = "...";

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            // Limpa campos
            document.getElementById('loginEmail').value = "";
            document.getElementById('loginPass').value = "";
        } catch (error) {
            console.error(error);
            if (loginError) {
                loginError.innerText = "E-mail ou senha incorretos.";
                loginError.style.display = "block";
            }
        } finally {
            btnPass.innerText = "Entrar";
        }
    });
}

// 4. Botão Entrar com GOOGLE
const btnGoogle = document.getElementById('btnLoginGoogle');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async() => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erro Google:", error);
            alert("Erro ao conectar com Google. (Verifique se o Popup não foi bloqueado)");
        }
    });
}

// 5. Botão SAIR
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', async() => {
        await signOut(auth);
    });
}

// 6. Botão SALVAR EVENTO
const btnSave = document.getElementById('btnSaveEvent');
if (btnSave) {
    btnSave.addEventListener('click', async() => {
        const title = document.getElementById('evtTitle').value;
        const date = document.getElementById('evtDate').value;
        const loc = document.getElementById('evtLoc').value;

        if (!title || !date) return alert('Preencha título e data.');
        if (!auth.currentUser) return alert("Erro: Não logado.");

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
            alert('Evento salvo com sucesso!');
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
}