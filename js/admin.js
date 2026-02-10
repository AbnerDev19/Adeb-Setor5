import { db, collection, addDoc, deleteDoc, doc, auth, provider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';

// --- 1. SEGURANÇA (WHITELIST DE ADMINS GERAIS) ---
// Estes usuários podem criar/excluir eventos globais no index.html
const GMAIL_ADMINS = [
    "abneroliveira19072004@gmail.com",
    "geo.eraldo@gmail.com",
    "alenenogueira99@gmail.com"
    // Adicione outros emails de administradores gerais aqui se necessário
];

// Elementos
const adminSection = document.getElementById('admin-section');
const btnLoginToggle = document.getElementById('btnLogin');
const loginText = document.getElementById('loginText');
const loginContainer = document.getElementById('login-form-container');
const eventContainer = document.getElementById('event-form-container');
const loginError = document.getElementById('loginError');
const linkJovens = document.getElementById('linkJovens'); // O botão que estava sumindo

// --- 2. MONITOR DE LOGIN ---
onAuthStateChanged(auth, async(user) => {
    if (user) {
        // --- USUÁRIO LOGADO ---

        // 1. Mostrar o botão da Área de Jovens (Disponível para QUALQUER logado)
        if (linkJovens) linkJovens.style.display = "flex";

        // 2. Verificar se é Admin Geral (Para o painel de adicionar eventos)
        let isGoogle = false;
        if (user.providerData && user.providerData.length > 0) {
            isGoogle = user.providerData.some(p => p.providerId === 'google.com');
        }

        // Regra: Se logou com Google e não está na lista, não é admin (mas continua logado)
        // Se logou com email/senha (login do sistema), assumimos que é admin
        const isAdmin = !isGoogle || GMAIL_ADMINS.includes(user.email);

        if (isAdmin) {
            // É ADMIN: Mostra painel de eventos
            if (loginContainer) loginContainer.style.display = "none";
            if (eventContainer) eventContainer.style.display = "block";
            if (loginText) loginText.innerText = "Painel (Admin)";
            
            // Ativa botão de excluir
            if (!document.getElementById('admin-styles')) {
                const style = document.createElement('style');
                style.id = 'admin-styles';
                style.innerHTML = `.btn-delete-event { display: block !important; }`;
                document.head.appendChild(style);
            }
        } else {
            // NÃO É ADMIN (É apenas um Líder de Depto): 
            // Não desloga! Apenas esconde o painel de criar eventos globais.
            if (loginContainer) loginContainer.style.display = "none"; // Esconde form de login pois já está logado
            if (eventContainer) {
                eventContainer.style.display = "none"; // Esconde painel de admin
                // Opcional: Mostrar mensagem de boas vindas simples no lugar
                // eventContainer.innerHTML = "<p>Bem-vindo, líder! Acesse sua área no menu.</p>"; 
            }
            if (loginText) loginText.innerText = "Líder Logado";
            
            // Remove botão de excluir eventos globais se estiver visível
            const style = document.getElementById('admin-styles');
            if (style) style.remove();
        }

    } else {
        // --- DESLOGADO ---
        if (loginContainer) loginContainer.style.display = "block";
        if (eventContainer) eventContainer.style.display = "none";
        if (loginText) loginText.innerText = "Área do Líder";

        // ESCONDE O BOTÃO DE JOVENS
        if (linkJovens) linkJovens.style.display = "none";

        const style = document.getElementById('admin-styles');
        if (style) style.remove();
    }
});

// --- 3. INTERFACE (O restante do código permanece igual) ---

// Toggle do Painel Admin (Botão da Sidebar)
if (btnLoginToggle) {
    btnLoginToggle.addEventListener('click', () => {
        // Se já estiver na página de Jovens, talvez queira redirecionar?
        // Por enquanto, apenas abre/fecha o painel no index
        if(adminSection) {
            const isHidden = window.getComputedStyle(adminSection).display === "none";
            adminSection.style.display = isHidden ? "block" : "none";
            if (isHidden) setTimeout(() => adminSection.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    });
}

// Login Google
const btnGoogle = document.getElementById('btnLoginGoogle');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async() => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erro Google:", error);
        }
    });
}

// Login Senha
const btnPass = document.getElementById('btnLoginPass');
if (btnPass) {
    btnPass.addEventListener('click', async() => {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;

        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            console.error(error);
            if (loginError) {
                loginError.innerText = "E-mail ou senha incorretos.";
                loginError.style.display = "block";
            }
        }
    });
}

// Logout
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', async() => await signOut(auth));
}

// --- SALVAR EVENTO (Lógica de Admin) ---
const btnSave = document.getElementById('btnSaveEvent');
if (btnSave) {
    btnSave.addEventListener('click', async() => {
        const title = document.getElementById('evtTitle').value;
        const date = document.getElementById('evtDate').value;
        const loc = document.getElementById('evtLoc').value;
        const type = document.getElementById('tipoEvento').value;
        const dept = document.getElementById('evtDept').value; 

        if (!title || !date) return alert('Preencha título e data.');
        if (!auth.currentUser) return alert("Erro: Não logado.");

        // Verificação dupla de segurança no clique
        const user = auth.currentUser;
        let isGoogle = false;
        if (user.providerData && user.providerData.length > 0) {
            isGoogle = user.providerData.some(p => p.providerId === 'google.com');
        }
        if (isGoogle && !GMAIL_ADMINS.includes(user.email)) {
            return alert("Você não tem permissão para criar eventos na agenda geral.");
        }

        btnSave.innerText = "Salvando...";
        try {
            await addDoc(collection(db, "eventos"), {
                title: title,
                date: date,
                location: loc,
                type: type,
                departamento: dept,
                time: '19:30',
                createdAt: new Date(),
                createdBy: auth.currentUser.email
            });
            alert('Evento salvo!');
            document.getElementById('evtTitle').value = '';
            document.getElementById('evtDate').value = '';
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar.");
        } finally {
            btnSave.innerText = "Salvar Evento";
        }
    });
}

// Função Global para Excluir
window.deleteEvent = async function(id) {
    if (!auth.currentUser) return alert("Você precisa estar logado.");
    
    // Verificação de permissão também ao excluir
    const user = auth.currentUser;
    let isGoogle = false;
    if (user.providerData && user.providerData.length > 0) {
        isGoogle = user.providerData.some(p => p.providerId === 'google.com');
    }
    if (isGoogle && !GMAIL_ADMINS.includes(user.email)) {
        return alert("Você não tem permissão para excluir eventos.");
    }

    if (!confirm("Tem certeza que deseja EXCLUIR este evento?")) return;
    try {
        await deleteDoc(doc(db, "eventos", id));
    } catch (e) {
        console.error(e);
        alert("Erro ao excluir.");
    }
}