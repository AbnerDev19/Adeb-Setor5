import { db, collection, addDoc, deleteDoc, doc, auth, provider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';

// --- 1. SEGURANÇA (WHITELIST) ---
// Adicionei os e-mails do Pastor e o seu
const GMAIL_PERMITIDOS = [
    "abneroliveira19072004@gmail.com",
    "geo.eraldo@gmail.com"
];

// Elementos
const adminSection = document.getElementById('admin-section');
const btnLoginToggle = document.getElementById('btnLogin');
const loginText = document.getElementById('loginText');
const loginContainer = document.getElementById('login-form-container');
const eventContainer = document.getElementById('event-form-container');
const loginError = document.getElementById('loginError');

// --- 2. MONITOR DE LOGIN ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Usuário detectado:", user.email);

        // Verifica se é login via Google
        let isGoogle = false;
        if (user.providerData && user.providerData.length > 0) {
            // Verifica se algum provedor é google.com
            isGoogle = user.providerData.some(p => p.providerId === 'google.com');
        }

        // SE FOR GOOGLE, VERIFICA A LISTA. SE FOR SENHA, LIBERA.
        const isAllowed = !isGoogle || GMAIL_PERMITIDOS.includes(user.email);

        if (!isAllowed) {
             alert(`ACESSO NEGADO: O e-mail ${user.email} não tem permissão de liderança.`);
             await signOut(auth); // Expulsa imediatamente
             return;
        }

        // LÍDER AUTENTICADO E PERMITIDO
        if(loginContainer) loginContainer.style.display = "none";
        if(eventContainer) eventContainer.style.display = "block";
        if(loginText) loginText.innerText = "Painel (Logado)";

        // Injeta estilo para mostrar lixeiras
        if (!document.getElementById('admin-styles')) {
            const style = document.createElement('style');
            style.id = 'admin-styles';
            style.innerHTML = `.btn-delete-event { display: block !important; }`;
            document.head.appendChild(style);
        }

    } else {
        // DESLOGADO
        if(loginContainer) loginContainer.style.display = "block";
        if(eventContainer) eventContainer.style.display = "none";
        if(loginText) loginText.innerText = "Área do Líder";

        const style = document.getElementById('admin-styles');
        if(style) style.remove();
    }
});

// --- 3. BOTÕES ---

// Abrir/Fechar Painel
if (btnLoginToggle) {
    btnLoginToggle.addEventListener('click', () => {
        const isHidden = adminSection.style.display === "none" || adminSection.style.display === "";
        adminSection.style.display = isHidden ? "block" : "none";
        if (isHidden) setTimeout(() => adminSection.scrollIntoView({ behavior: 'smooth' }), 100);
    });
}

// Login Google (Corrigido)
const btnGoogle = document.getElementById('btnLoginGoogle');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erro Google:", error);
            // Evita alerta desnecessário se o usuário fechou o popup
            if (error.code !== 'auth/popup-closed-by-user') {
                alert("Erro no login com Google. Verifique o console.");
            }
        }
    });
}

// Login Senha
const btnPass = document.getElementById('btnLoginPass');
if (btnPass) {
    btnPass.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;
        if(loginError) loginError.style.display = "none";
        
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            document.getElementById('loginEmail').value = "";
            document.getElementById('loginPass').value = "";
        } catch (error) {
            console.error(error);
            if(loginError) {
                loginError.innerText = "E-mail ou senha incorretos.";
                loginError.style.display = "block";
            }
        }
    });
}

// Logout
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', async () => await signOut(auth));
}

// Salvar Evento
const btnSave = document.getElementById('btnSaveEvent');
if (btnSave) {
    btnSave.addEventListener('click', async () => {
        const title = document.getElementById('evtTitle').value;
        const date = document.getElementById('evtDate').value;
        const loc = document.getElementById('evtLoc').value;

        if(!title || !date) return alert('Preencha título e data.');
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
}

// Função de Excluir (Global)
window.deleteEvent = async function(id) {
    if(!auth.currentUser) return alert("Você precisa estar logado.");
    if(!confirm("Tem certeza que deseja EXCLUIR este evento?")) return;
    try {
        await deleteDoc(doc(db, "eventos", id));
    } catch (e) {
        console.error(e);
        alert("Erro ao excluir.");
    }
}