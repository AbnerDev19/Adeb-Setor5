import { db, collection, addDoc, deleteDoc, doc, auth, provider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';

// --- 1. LISTA DE ADMINS (Apenas estes podem CRIAR/EXCLUIR na Agenda Geral) ---
const GMAIL_PERMITIDOS = [
    "abneroliveira19072004@gmail.com",
    "geo.eraldo@gmail.com"
];

// Elementos do DOM (Painéis)
const adminSection = document.getElementById('admin-section');
const btnLoginToggle = document.getElementById('btnLogin');
const loginText = document.getElementById('loginText');
const loginContainer = document.getElementById('login-form-container');
const eventContainer = document.getElementById('event-form-container');
const loginError = document.getElementById('loginError');

// --- 2. MONITOR DE LOGIN (O Coração da Lógica) ---
onAuthStateChanged(auth, async(user) => {
    // Pegamos o elemento AQUI dentro para garantir que ele existe
    const linkJovens = document.getElementById('linkJovens');

    if (user) {
        console.log("Usuário logado:", user.email); // Para você ver no Console (F12)

        // ============================================================
        // 1. REGRA VISUAL: Se tá logado, MOSTRA o botão de Jovens
        // ============================================================
        if (linkJovens) {
            linkJovens.style.display = "flex"; 
            console.log("Botão Jovens: Exibido");
        } else {
            console.warn("Aviso: Botão 'linkJovens' não encontrado no HTML.");
        }

        // ============================================================
        // 2. REGRA DE PERMISSÃO: Verifica se é Admin ou Líder Comum
        // ============================================================
        let isGoogle = false;
        if (user.providerData && user.providerData.length > 0) {
            isGoogle = user.providerData.some(p => p.providerId === 'google.com');
        }

        // Se é Google e não está na lista, é apenas líder (vê botão, mas não edita agenda geral)
        const isAdmin = !isGoogle || GMAIL_PERMITIDOS.includes(user.email);

        // Esconde form de login (pois já entrou)
        if (loginContainer) loginContainer.style.display = "none";
        
        if (isAdmin) {
            // ADMIN: Vê painel de criar eventos
            if (eventContainer) eventContainer.style.display = "block";
            if (loginText) loginText.innerText = "Painel (Admin)";
            
            // Ativa botão de excluir (CSS Injetado)
            if (!document.getElementById('admin-styles')) {
                const style = document.createElement('style');
                style.id = 'admin-styles';
                style.innerHTML = `.btn-delete-event { display: block !important; }`;
                document.head.appendChild(style);
            }
        } else {
            // LÍDER COMUM: Não vê painel de criar, mas continua logado
            if (eventContainer) eventContainer.style.display = "none";
            if (loginText) loginText.innerText = "Líder Logado";
            
            // Remove botão excluir se existir
            const style = document.getElementById('admin-styles');
            if (style) style.remove();
        }

    } else {
        console.log("Usuário desconectado.");

        // ============================================================
        // USUÁRIO DESLOGADO: Esconde botão e mostra login
        // ============================================================
        
        if (linkJovens) {
            linkJovens.style.display = "none";
        }

        if (loginContainer) loginContainer.style.display = "block";
        if (eventContainer) eventContainer.style.display = "none";
        if (loginText) loginText.innerText = "Área do Líder";

        const style = document.getElementById('admin-styles');
        if (style) style.remove();
    }
});

// --- 3. FUNCIONALIDADES DOS BOTÕES ---

// Toggle do Painel (Abrir/Fechar ao clicar em "Área do Líder")
if (btnLoginToggle) {
    btnLoginToggle.addEventListener('click', () => {
        if (adminSection) {
            const isHidden = window.getComputedStyle(adminSection).display === "none";
            adminSection.style.display = isHidden ? "block" : "none";
            // Scroll suave até o painel
            if (isHidden) setTimeout(() => adminSection.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    });
}

// Botão Login Google
const btnGoogle = document.getElementById('btnLoginGoogle');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async() => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erro Google:", error);
            alert("Erro ao conectar com Google. Veja o console.");
        }
    });
}

// Botão Login Senha
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

// Botão Sair
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', async() => await signOut(auth));
}

// Botão Salvar Evento (Apenas Admin)
const btnSave = document.getElementById('btnSaveEvent');
if (btnSave) {
    btnSave.addEventListener('click', async() => {
        const title = document.getElementById('evtTitle').value;
        const date = document.getElementById('evtDate').value;
        const loc = document.getElementById('evtLoc').value;
        const type = document.getElementById('tipoEvento').value;
        const dept = document.getElementById('evtDept').value; 

        if (!title || !date) return alert('Preencha título e data.');
        
        // Segurança Extra
        if (!auth.currentUser) return alert("Erro: Não logado.");
        const user = auth.currentUser;
        let isGoogle = false;
        if (user.providerData && user.providerData.length > 0) isGoogle = true;
        
        if (isGoogle && !GMAIL_PERMITIDOS.includes(user.email)) {
            return alert("Sem permissão para alterar a agenda principal.");
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

// Função Global de Excluir
window.deleteEvent = async function(id) {
    if (!auth.currentUser) return alert("Você precisa estar logado.");
    
    const user = auth.currentUser;
    let isGoogle = false;
    if (user.providerData && user.providerData.length > 0) isGoogle = true;
    
    if (isGoogle && !GMAIL_PERMITIDOS.includes(user.email)) {
        return alert("Sem permissão para excluir.");
    }

    if (!confirm("Tem certeza que deseja EXCLUIR este evento?")) return;
    try {
        await deleteDoc(doc(db, "eventos", id));
    } catch (e) {
        console.error(e);
        alert("Erro ao excluir.");
    }
}