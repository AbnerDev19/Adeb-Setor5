import { db, collection, addDoc, deleteDoc, doc, auth, provider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';

// --- 1. CONFIGURAÇÃO DE SEGURANÇA ---
// Coloque aqui os e-mails que têm permissão TOTAL (Excluir, Editar, Gerar Agenda)
const GMAIL_PERMITIDOS = [
    "SEU.EMAIL.AQUI@gmail.com", 
    "lideranca@adeb.com"
];

// Elementos da Interface
const adminSection = document.getElementById('admin-section');
const btnLoginToggle = document.getElementById('btnLogin');
const loginText = document.getElementById('loginText');
const loginContainer = document.getElementById('login-form-container');
const eventContainer = document.getElementById('event-form-container');
const loginError = document.getElementById('loginError');

// --- 2. MONITOR DE LOGIN & PERMISSÕES ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Verifica se é Google e se está na lista
        let isGoogle = false;
        if (user.providerData && user.providerData.length > 0) {
            isGoogle = user.providerData[0].providerId === 'google.com';
        }

        const isAllowed = !isGoogle || GMAIL_PERMITIDOS.includes(user.email);

        if (!isAllowed) {
             alert(`Acesso Negado: O e-mail ${user.email} não tem permissão de liderança.`);
             await signOut(auth);
             return;
        }

        // LÍDER AUTENTICADO
        console.log("Líder conectado:", user.email);
        if(loginContainer) loginContainer.style.display = "none";
        if(eventContainer) eventContainer.style.display = "block";
        if(loginText) loginText.innerText = "Painel (Logado)";

        // ATIVA BOTÕES DE EXCLUIR (Injeção de CSS)
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

        // Remove botões de excluir
        const style = document.getElementById('admin-styles');
        if(style) style.remove();
    }
});

// --- 3. FUNÇÕES DE INTERFACE ---

// Toggle Sidebar
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

// Login Senha
const btnPass = document.getElementById('btnLoginPass');
if (btnPass) {
    btnPass.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;
        if(loginError) loginError.style.display = "none";
        btnPass.innerText = "...";
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
        } finally {
            btnPass.innerText = "Entrar";
        }
    });
}

// Login Google
const btnGoogle = document.getElementById('btnLoginGoogle');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
            alert("Erro no login Google.");
        }
    });
}

// Logout
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        await signOut(auth);
    });
}

// Salvar Novo Evento
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

// --- 4. FUNÇÃO GLOBAL DE EXCLUIR ---
// (Chamada pelo botão da lixeira no app.js)
window.deleteEvent = async function(id) {
    if(!auth.currentUser) return alert("Você precisa estar logado.");
    if(!confirm("Tem certeza que deseja EXCLUIR este evento?")) return;

    try {
        await deleteDoc(doc(db, "eventos", id));
        alert("Evento excluído com sucesso.");
    } catch (e) {
        console.error(e);
        alert("Erro ao excluir. Verifique suas permissões.");
    }
}

// --- 5. UTILITÁRIO: CARGA AUTOMÁTICA 2026 ---
// Para rodar isso, faça login, abra o Console (F12) e digite: window.carregarAgenda2026()
window.carregarAgenda2026 = async function() {
    if(!auth.currentUser) return alert("Faça login antes de rodar a carga.");
    if(!confirm("ATENÇÃO: Isso vai gerar centenas de eventos para 2026 (Cultos de Domingo, Terça, Quinta e Santa Ceia). Quer continuar?")) return;

    console.log("Iniciando geração da agenda...");
    
    // Lista de Eventos Fixos (Do seu PDF)
    const eventosPDF = [
        { title: "Reunião Geral de Obreiros", date: "2026-01-03", time: "09:00", location: "Templo Sede" },
        { title: "Aniversário Irmã Dianna", date: "2026-01-08", time: "19:30", location: "Sede Taguatinga" },
        { title: "Congresso UMADEB", date: "2026-02-14", time: "19:00", location: "Pavilhão de Exposições" },
        { title: "Aniversário Pr. Orcival", date: "2026-02-19", time: "19:30", location: "Igreja Sede" },
        { title: "AGO - Assembleia Geral", date: "2026-04-04", time: "09:00", location: "Templo Sede" },
        { title: "EBOM - Escola Bíblica", date: "2026-04-17", time: "19:00", location: "Igreja Sede" },
        { title: "Seminário Harpa Cristã", date: "2026-05-01", time: "19:00", location: "Igreja Sede" },
        { title: "Congresso UNAADEB", date: "2026-06-04", time: "19:00", location: "A definir" },
        { title: "Conferência Missionária", date: "2026-08-14", time: "19:00", location: "Igreja Sede" },
        { title: "Congresso UFADEB", date: "2026-09-19", time: "19:00", location: "Arena Hall" },
        { title: "Congresso UDVADEB", date: "2026-11-06", time: "19:00", location: "Igreja Sede" }
    ];

    const batchEvents = [...eventosPDF];
    const startDate = new Date(2026, 0, 1); // 01/01/2026
    const endDate = new Date(2026, 11, 31); // 31/12/2026

    // Gera os recorrentes (Terça, Quinta, Domingo, 2º Sábado)
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay(); // 0=Dom, 6=Sab
        const dateStr = d.toISOString().split('T')[0];
        const dayOfMonth = d.getDate();

        // 2º Sábado (Santa Ceia) - Entre dia 8 e 14
        if (dayOfWeek === 6 && dayOfMonth >= 8 && dayOfMonth <= 14) {
            batchEvents.push({ title: "Santa Ceia", date: dateStr, time: "19:30", location: "Igreja Sede" });
            continue; // Não marca outro evento neste dia
        }

        // Domingo (Culto Público)
        if (dayOfWeek === 0) {
            batchEvents.push({ title: "Culto Público", date: dateStr, time: "18:30", location: "Igreja Sede" });
        }
        // Terça (Culto de Ensino)
        else if (dayOfWeek === 2) {
            batchEvents.push({ title: "Culto de Ensino", date: dateStr, time: "19:30", location: "Igreja Sede" });
        }
        // Quinta (Culto de Oração)
        else if (dayOfWeek === 4) {
            batchEvents.push({ title: "Culto de Oração", date: dateStr, time: "19:30", location: "Igreja Sede" });
        }
    }

    // Envia tudo para o Firebase (Um por um para não estourar limite de lote simples)
    let count = 0;
    for (const ev of batchEvents) {
        await addDoc(collection(db, "eventos"), {
            ...ev,
            createdAt: new Date(),
            createdBy: auth.currentUser.email
        });
        count++;
        if(count % 10 === 0) console.log(`Processados: ${count}...`);
    }

    alert(`Concluído! ${count} eventos foram adicionados à agenda de 2026.`);
}