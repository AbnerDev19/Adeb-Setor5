import { db, collection, addDoc, deleteDoc, doc, auth, provider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';

// --- 1. LISTA DE ADMINS (Para criar eventos no calendário principal) ---
const GMAIL_PERMITIDOS = [
    "abneroliveira19072004@gmail.com",
    "geo.eraldo@gmail.com"
];

// Elementos do DOM
const adminSection = document.getElementById('admin-section');
const btnLoginToggle = document.getElementById('btnLogin');
const loginText = document.getElementById('loginText');
const loginContainer = document.getElementById('login-form-container');
const eventContainer = document.getElementById('event-form-container');
const loginError = document.getElementById('loginError');
const linkJovens = document.getElementById('linkJovens'); // O Botão da Sidebar

// --- 2. MONITOR DE LOGIN ---
onAuthStateChanged(auth, async(user) => {
    if (user) {
        // ============================================================
        // USUÁRIO LOGADO
        // ============================================================
        
        // 1. MOSTRAR O LINK DE JOVENS (Isso atende ao seu pedido)
        if (linkJovens) {
            linkJovens.style.display = "flex";
        }

        // 2. VERIFICAR PERMISSÕES DE ADMIN (Apenas para o painel do Index)
        let isGoogle = false;
        if (user.providerData && user.providerData.length > 0) {
            isGoogle = user.providerData.some(p => p.providerId === 'google.com');
        }

        // Regra: Se é login Google e não está na lista, NÃO é admin global.
        const isAdmin = !isGoogle || GMAIL_PERMITIDOS.includes(user.email);

        // Ajustes visuais da área de login
        if (loginContainer) loginContainer.style.display = "none"; // Esconde formulário de senha
        
        if (isAdmin) {
            // Se for Admin: Mostra o formulário de adicionar eventos
            if (eventContainer) eventContainer.style.display = "block";
            if (loginText) loginText.innerText = "Painel (Admin)";
            
            // Ativa estilo do botão excluir
            if (!document.getElementById('admin-styles')) {
                const style = document.createElement('style');
                style.id = 'admin-styles';
                style.innerHTML = `.btn-delete-event { display: block !important; }`;
                document.head.appendChild(style);
            }
        } else {
            // Se NÃO for Admin:
            // Esconde o formulário de eventos, MAS MANTÉM LOGADO para ver o botão de Jovens
            if (eventContainer) eventContainer.style.display = "none";
            if (loginText) loginText.innerText = "Líder Logado";
            
            // Remove botão excluir se existir
            const style = document.getElementById('admin-styles');
            if (style) style.remove();
        }

    } else {
        // ============================================================
        // USUÁRIO DESLOGADO
        // ============================================================
        
        // 1. ESCONDER O LINK DE JOVENS
        if (linkJovens) {
            linkJovens.style.display = "none";
        }

        // Restaura painel de login
        if (loginContainer) loginContainer.style.display = "block";
        if (eventContainer) eventContainer.style.display = "none";
        if (loginText) loginText.innerText = "Área do Líder";

        const style = document.getElementById('admin-styles');
        if (style) style.remove();
    }
});

// --- 3. FUNCIONALIDADES DO PAINEL (Toggle, Login, Logout, Salvar) ---

// Abrir/Fechar Painel
if (btnLoginToggle) {
    btnLoginToggle.addEventListener('click', () => {
        // Se a seção admin existir (estamos no index.html)
        if (adminSection) {
            const isHidden = window.getComputedStyle(adminSection).display === "none";
            adminSection.style.display = isHidden ? "block" : "none";
            if (isHidden) setTimeout(() => adminSection.scrollIntoView({ behavior: 'smooth' }), 100);
        } else {
            // Se estivermos em outra página (ex: jovens.html), talvez queira voltar ou fazer nada
            // Por enquanto, não faz nada se não achar a section
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

// Salvar Evento (Apenas Admin)
const btnSave = document.getElementById('btnSaveEvent');
if (btnSave) {
    btnSave.addEventListener('click', async() => {
        const title = document.getElementById('evtTitle').value;
        const date = document.getElementById('evtDate').value;
        const loc = document.getElementById('evtLoc').value;
        const type = document.getElementById('tipoEvento').value;
        const dept = document.getElementById('evtDept').value; 

        if (!title || !date) return alert('Preencha título e data.');
        
        // Verificação extra de segurança ao clicar
        if (!auth.currentUser) return alert("Erro: Não logado.");
        
        // Verifica se é admin antes de salvar
        const user = auth.currentUser;
        let isGoogle = false;
        if (user.providerData && user.providerData.length > 0) isGoogle = true;
        
        if (isGoogle && !GMAIL_PERMITIDOS.includes(user.email)) {
            return alert("Você não tem permissão para salvar na agenda geral.");
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
            // Limpa campos
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

// Excluir Evento (Apenas Admin) - Global
window.deleteEvent = async function(id) {
    if (!auth.currentUser) return alert("Você precisa estar logado.");
    
    // Verifica permissão
    const user = auth.currentUser;
    let isGoogle = false;
    if (user.providerData && user.providerData.length > 0) isGoogle = true;
    
    if (isGoogle && !GMAIL_PERMITIDOS.includes(user.email)) {
        return alert("Você não tem permissão para excluir.");
    }

    if (!confirm("Tem certeza que deseja EXCLUIR este evento?")) return;
    try {
        await deleteDoc(doc(db, "eventos", id));
    } catch (e) {
        console.error(e);
        alert("Erro ao excluir.");
    }
}