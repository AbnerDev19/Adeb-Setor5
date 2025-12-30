import { db, collection, addDoc, deleteDoc, doc, auth, provider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';

// --- 1. SEGURANÇA (WHITELIST) ---
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
        // Verifica se é login via Google
        let isGoogle = false;
        if (user.providerData && user.providerData.length > 0) {
            isGoogle = user.providerData.some(p => p.providerId === 'google.com');
        }

        const isAllowed = !isGoogle || GMAIL_PERMITIDOS.includes(user.email);

        if (!isAllowed) {
             alert(`ACESSO NEGADO: O e-mail ${user.email} não tem permissão de liderança.`);
             await signOut(auth);
             return;
        }

        // LÍDER AUTENTICADO
        if(loginContainer) loginContainer.style.display = "none";
        if(eventContainer) eventContainer.style.display = "block";
        if(loginText) loginText.innerText = "Painel (Logado)";

        // Estilo para o botão de excluir
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

// Login Google
const btnGoogle = document.getElementById('btnLoginGoogle');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erro Google:", error);
            if (error.code !== 'auth/popup-closed-by-user') {
                alert("Erro no login com Google. Veja o console (F12).");
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

// --- SALVAR EVENTO (CORRIGIDO PARA SALVAR O TIPO/COR) ---
const btnSave = document.getElementById('btnSaveEvent');
if (btnSave) {
    btnSave.addEventListener('click', async () => {
        const title = document.getElementById('evtTitle').value;
        const date = document.getElementById('evtDate').value;
        const loc = document.getElementById('evtLoc').value;
        // Pega o tipo selecionado (local, setorial, geral, etc)
        const type = document.getElementById('tipoEvento').value; 

        if(!title || !date) return alert('Preencha título e data.');
        if (!auth.currentUser) return alert("Erro: Não logado.");

        btnSave.innerText = "Salvando...";
        try {
            await addDoc(collection(db, "eventos"), {
                title: title,
                date: date,
                location: loc,
                type: type, // SALVA O TIPO NO BANCO
                time: '19:30',
                createdAt: new Date(),
                createdBy: auth.currentUser.email
            });
            alert('Evento salvo!');
            
            // Limpa campos
            document.getElementById('evtTitle').value = '';
            document.getElementById('evtDate').value = '';
            document.getElementById('evtLoc').value = '';
            // Opcional: Resetar selects
            // document.getElementById('selectIgreja').value = ''; 
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar.");
        } finally {
            btnSave.innerText = "Salvar Evento";
        }
    });
}

// Função de Excluir
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