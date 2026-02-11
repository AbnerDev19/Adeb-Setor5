import { db, collection, addDoc, onSnapshot, query, orderBy, where, deleteDoc, doc, auth, onAuthStateChanged } from './firebase-config.js';

// --- VERIFICAÇÃO DE LOGIN ---
onAuthStateChanged(auth, (user) => {
    const loading = document.getElementById('loading-screen');
    const app = document.getElementById('app-content');
    
    if (!user) {
        alert("Acesso restrito. Faça login primeiro.");
        window.location.href = "index.html";
    } else {
        if(loading) loading.style.display = 'none';
        if(app) app.style.display = 'block';
        
        const userDisplay = document.getElementById('userEmailDisplay');
        if(userDisplay) userDisplay.innerText = user.email;

        // Inicia Listeners
        initProfessores();
        initTurmas();
        initAlunos();
        initHistorico();
    }
});

// --- 1. PROFESSORES ---
const btnSaveProf = document.getElementById('btnSaveProf');
if(btnSaveProf) {
    btnSaveProf.addEventListener('click', async () => {
        const nome = document.getElementById('profNome').value;
        const classe = document.getElementById('profClasse').value;
        const tel = document.getElementById('profTel').value;
        const cong = document.getElementById('profCongregacao').value;

        if(!nome) return alert("Nome obrigatório");
        
        try {
            await addDoc(collection(db, "professores_ebd"), {
                nome, classe, telefone: tel, congregacao: cong, status: 'Ativo', createdAt: new Date()
            });
            alert("Professor salvo!");
            document.getElementById('profNome').value = '';
        } catch(e) { console.error(e); alert("Erro ao salvar"); }
    });
}

function initProfessores() {
    const q = query(collection(db, "professores_ebd"), orderBy("nome"));
    onSnapshot(q, (snap) => {
        const tbody = document.getElementById('listaProfessores');
        const stat = document.getElementById('statTotalProf');
        if(!tbody) return;
        
        tbody.innerHTML = "";
        if(stat) stat.innerText = snap.size;

        snap.forEach(docSnap => {
            const d = docSnap.data();
            tbody.innerHTML += `
                <tr>
                    <td>${d.nome}</td>
                    <td>${d.classe}</td>
                    <td>${d.congregacao}</td>
                    <td><button class="btn-icon btn-delete" onclick="window.delItem('professores_ebd','${docSnap.id}')"><i class="fas fa-trash"></i></button></td>
                </tr>`;
        });
    });
}

// --- 2. TURMAS ---
const btnSaveTurma = document.getElementById('btnSaveTurma');
if(btnSaveTurma) {
    btnSaveTurma.addEventListener('click', async () => {
        const nome = document.getElementById('turmaNome').value;
        const idade = document.getElementById('turmaIdade').value;
        const prof = document.getElementById('turmaProf').value;
        const cong = document.getElementById('turmaCongregacao').value;

        if(!nome) return alert("Nome da turma obrigatório");

        try {
            await addDoc(collection(db, "turmas_ebd"), {
                nome, idade, professor: prof, congregacao: cong, createdAt: new Date()
            });
            alert("Turma criada!");
            document.getElementById('turmaNome').value = '';
        } catch(e) { console.error(e); }
    });
}

function initTurmas() {
    const q = query(collection(db, "turmas_ebd"), orderBy("nome"));
    onSnapshot(q, (snap) => {
        const tbody = document.getElementById('listaTurmas');
        const selects = [document.getElementById('alunoTurmaSelect'), document.getElementById('chamadaTurmaSelect')];
        
        if(!tbody) return;
        tbody.innerHTML = "";
        
        // Limpa e repopula selects
        selects.forEach(sel => { if(sel) sel.innerHTML = '<option value="">Selecione...</option>'; });

        snap.forEach(docSnap => {
            const d = docSnap.data();
            // Tabela
            tbody.innerHTML += `
                <tr>
                    <td>${d.nome}</td>
                    <td>${d.idade}</td>
                    <td>${d.professor}</td>
                    <td><button class="btn-icon btn-delete" onclick="window.delItem('turmas_ebd','${docSnap.id}')"><i class="fas fa-trash"></i></button></td>
                </tr>`;
            
            // Selects
            selects.forEach(sel => {
                if(sel) sel.innerHTML += `<option value="${d.nome}">${d.nome}</option>`;
            });
        });
    });
}

// --- 3. ALUNOS ---
const btnSaveAluno = document.getElementById('btnSaveAluno');
if(btnSaveAluno) {
    btnSaveAluno.addEventListener('click', async () => {
        const nome = document.getElementById('alunoNome').value;
        const nasc = document.getElementById('alunoNasc').value;
        const turma = document.getElementById('alunoTurmaSelect').value;
        const resp = document.getElementById('alunoResp').value;

        if(!nome || !turma) return alert("Nome e Turma obrigatórios");

        try {
            await addDoc(collection(db, "alunos_ebd"), {
                nome, nascimento: nasc, turma, responsavel: resp, status: 'Ativo', createdAt: new Date()
            });
            alert("Aluno matriculado!");
            document.getElementById('alunoNome').value = '';
        } catch(e) { console.error(e); }
    });
}

function initAlunos() {
    const q = query(collection(db, "alunos_ebd"), orderBy("nome"));
    onSnapshot(q, (snap) => {
        const tbody = document.getElementById('listaAlunos');
        const stat = document.getElementById('statTotalAlunos');
        if(!tbody) return;

        tbody.innerHTML = "";
        if(stat) stat.innerText = snap.size;

        snap.forEach(docSnap => {
            const d = docSnap.data();
            // Idade simples
            let idade = "-";
            if(d.nascimento) {
                const hoje = new Date();
                const nasc = new Date(d.nascimento);
                idade = hoje.getFullYear() - nasc.getFullYear();
            }

            tbody.innerHTML += `
                <tr>
                    <td>${d.nome}</td>
                    <td>${idade} anos</td>
                    <td><span class="status-badge" style="background:#e0f2fe; color:#0369a1;">${d.turma}</span></td>
                    <td><button class="btn-icon btn-delete" onclick="window.delItem('alunos_ebd','${docSnap.id}')"><i class="fas fa-trash"></i></button></td>
                </tr>`;
        });
    });
}

// --- 4. CHAMADA ---
const btnCarregarChamada = document.getElementById('btnCarregarChamada');
if(btnCarregarChamada) {
    btnCarregarChamada.addEventListener('click', async () => {
        const turma = document.getElementById('chamadaTurmaSelect').value;
        const data = document.getElementById('chamadaData').value;
        const area = document.getElementById('areaChamada');
        const tbody = document.getElementById('listaChamadaExecucao');

        if(!turma || !data) return alert("Selecione turma e data");

        // Busca alunos da turma
        const q = query(collection(db, "alunos_ebd"), where("turma", "==", turma));
        
        // Simples fetch once (não realtime pra chamada pra não bugar checkbox)
        const snap = await import('./firebase-config.js').then(m => m.getDocs(q)); // Usando getDocs dinamicamente ou snapshot once
        
        // Nota: no config original não exportei getDocs, vou usar onSnapshot com unsubscribe
        const unsubscribe = onSnapshot(q, (snapshot) => {
            tbody.innerHTML = "";
            if(snapshot.empty) {
                tbody.innerHTML = "<tr><td colspan='3'>Sem alunos nesta turma.</td></tr>";
            } else {
                snapshot.forEach(d => {
                    const aluno = d.data();
                    tbody.innerHTML += `
                        <tr class="row-chamada" data-id="${d.id}" data-nome="${aluno.nome}">
                            <td>${aluno.nome}</td>
                            <td><input type="checkbox" class="check-presence check-p" checked></td>
                            <td><input type="checkbox" class="check-presence check-v"></td>
                        </tr>`;
                });
            }
            area.style.display = 'block';
            unsubscribe(); // Para de ouvir após carregar
        });
    });
}

const btnSalvarChamadaFim = document.getElementById('btnSalvarChamadaFim');
if(btnSalvarChamadaFim) {
    btnSalvarChamadaFim.addEventListener('click', async () => {
        const data = document.getElementById('chamadaData').value;
        const turma = document.getElementById('chamadaTurmaSelect').value;
        const rows = document.querySelectorAll('.row-chamada');
        const visit = document.getElementById('qtdVisitantes').value;
        const oferta = document.getElementById('valorOferta').value;

        let presentes = 0;
        const listaPresentes = [];

        rows.forEach(row => {
            const isP = row.querySelector('.check-p').checked;
            if(isP) {
                presentes++;
                listaPresentes.push({
                    id: row.dataset.id,
                    nome: row.dataset.nome
                });
            }
        });

        try {
            await addDoc(collection(db, "presenca_ebd"), {
                data,
                turma,
                totalPresentes: presentes,
                totalVisitantes: visit,
                oferta: oferta,
                listaPresentes: listaPresentes,
                createdAt: new Date()
            });
            alert("Chamada salva com sucesso!");
            document.getElementById('areaChamada').style.display = 'none';
        } catch(e) { console.error(e); alert("Erro ao salvar"); }
    });
}

// --- 5. HISTÓRICO / RELATÓRIO ---
function initHistorico() {
    const q = query(collection(db, "presenca_ebd"), orderBy("data", "desc"));
    onSnapshot(q, (snap) => {
        const tbody = document.getElementById('listaHistoricoAulas');
        if(!tbody) return;
        tbody.innerHTML = "";

        snap.forEach(d => {
            const h = d.data();
            const dataF = h.data.split('-').reverse().join('/');
            tbody.innerHTML += `
                <tr>
                    <td>${dataF}</td>
                    <td>${h.turma}</td>
                    <td>${h.totalPresentes}</td>
                    <td>${h.totalVisitantes}</td>
                    <td>R$ ${h.oferta || '0,00'}</td>
                </tr>`;
        });
    });
}

// Global Delete
window.delItem = async(col, id) => {
    if(confirm("Deseja excluir?")) await deleteDoc(doc(db, col, id));
}