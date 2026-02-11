import { db, collection, addDoc, deleteDoc, doc, auth, provider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';

// --- 1. LISTA DE ADMINS (Apenas estes podem CRIAR/EXCLUIR na Agenda Geral e VER EBD) ---
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

// --- 2. MONITOR DE LOGIN ---
onAuthStateChanged(auth, async (user) => {
    // Referências aos botões do menu
    const linkJovens = document.getElementById('linkJovens');
    const linkEBD = document.getElementById('linkEBD');

    if (user) {
        console.log("Usuário logado:", user.email);

        // Verifica se é Admin
        let isGoogle = user.providerData.some(p => p.providerId === 'google.com');
        const isAdmin = !isGoogle || GMAIL_PERMITIDOS.includes(user.email);

        // --- REGRA 1: Botão Jovens (Visível para todos os logados) ---
        if (linkJovens) linkJovens.style.display = "flex";

        // --- REGRA 2: Botão EBD (Apenas Admin) ---
        if (linkEBD) {
            linkEBD.style.display = isAdmin ? "flex" : "none";
        }

        // UI de Login
        if (loginContainer) loginContainer.style.display = "none";

        if (isAdmin) {
            // ADMIN
            if (eventContainer) eventContainer.style.display = "block";
            if (loginText) loginText.innerText = "Admin";

            // Injeta estilo para botão de excluir
            if (!document.getElementById('admin-styles')) {
                const style = document.createElement('style');
                style.id = 'admin-styles';
                style.innerHTML = `.btn-delete-event { display: block !important; }`;
                document.head.appendChild(style);
            }
        } else {
            // LÍDER COMUM
            if (eventContainer) eventContainer.style.display = "none";
            if (loginText) loginText.innerText = "Líder";
            const style = document.getElementById('admin-styles');
            if (style) style.remove();
        }

    } else {
        // DESLOGADO
        if (linkJovens) linkJovens.style.display = "none";
        if (linkEBD) linkEBD.style.display = "none";
        if (loginContainer) loginContainer.style.display = "block";
        if (eventContainer) eventContainer.style.display = "none";
        if (loginText) loginText.innerText = "Área do Líder";

        const style = document.getElementById('admin-styles');
        if (style) style.remove();
    }
});

// --- 3. FUNCIONALIDADES DOS BOTÕES ---

if (btnLoginToggle) {
    btnLoginToggle.addEventListener('click', () => {
        if (adminSection) {
            const isHidden = window.getComputedStyle(adminSection).display === "none";
            adminSection.style.display = isHidden ? "block" : "none";
            if (isHidden) setTimeout(() => adminSection.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    });
}

const btnGoogle = document.getElementById('btnLoginGoogle');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        try { await signInWithPopup(auth, provider); }
        catch (error) { console.error(error); alert("Erro ao conectar Google."); }
    });
}

const btnPass = document.getElementById('btnLoginPass');
if (btnPass) {
    btnPass.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;
        try { await signInWithEmailAndPassword(auth, email, pass); }
        catch (error) {
            if (loginError) { loginError.innerText = "Dados incorretos."; loginError.style.display = "block"; }
        }
    });
}

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', async () => await signOut(auth));
}

// Salvar Evento (Admin)
const btnSave = document.getElementById('btnSaveEvent');
if (btnSave) {
    btnSave.addEventListener('click', async () => {
        const title = document.getElementById('evtTitle').value;
        const date = document.getElementById('evtDate').value;
        const loc = document.getElementById('evtLoc').value;
        const type = document.getElementById('tipoEvento').value;
        const dept = document.getElementById('evtDept').value;

        if (!title || !date || !type || !dept) return alert('Preencha todos os campos obrigatórios.');

        // Validação de segurança simples no front
        if (!auth.currentUser) return alert("Não logado.");

        btnSave.innerText = "Salvando...";
        try {
            await addDoc(collection(db, "eventos"), {
                title, date, location: loc, type, departamento: dept,
                time: '19:30', createdAt: new Date(), createdBy: auth.currentUser.email
            });
            alert('Evento salvo!');
            // Limpa form
            document.getElementById('evtTitle').value = '';
            document.getElementById('evtDate').value = '';
            document.getElementById('evtLoc').value = '';
            // Reseta selects para o "Selecione..." (índice 0)
            document.getElementById('tipoEvento').selectedIndex = 0;
            document.getElementById('evtDept').selectedIndex = 0;
        } catch (e) { console.error(e); alert("Erro ao salvar."); }
        finally { btnSave.innerText = "Salvar Evento"; }
    });
}

window.deleteEvent = async function (id) {
    if (!auth.currentUser) return alert("Login necessário.");
    if (!confirm("Excluir este evento?")) return;
    try { await deleteDoc(doc(db, "eventos", id)); }
    catch (e) { console.error(e); alert("Erro ao excluir."); }
}