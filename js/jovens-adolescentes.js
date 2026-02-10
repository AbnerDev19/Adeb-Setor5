import { db, collection, addDoc, onSnapshot, query, orderBy, where, deleteDoc, doc, auth, onAuthStateChanged } from './firebase-config.js';

// 1. SEGURANÇA (Redireciona para index se não logado)
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        document.getElementById('bodyPage').style.display = 'block';
        const userDisplay = document.getElementById('userEmailDisplay');
        if (userDisplay) userDisplay.innerText = user.email;

        initMembersListener();
        initEscalasListener();
        initEventosDeptListener();
    }
});

// Referências
const listaMembros = document.getElementById('listaMembros');
const listaEscalas = document.getElementById('listaEscalas');
const listaEventos = document.getElementById('listaEventosDept');

// 2. MEMBROS (Genérico)
const btnSaveMember = document.getElementById('btnSaveMember');
if (btnSaveMember) {
    btnSaveMember.addEventListener('click', async() => {
        const nome = document.getElementById('memNome').value;
        const depto = document.getElementById('memDept').value;
        const igreja = document.getElementById('memIgreja').value;
        // ... pegar outros inputs ...

        if (!nome) return alert("Nome obrigatório");

        try {
            await addDoc(collection(db, "membros_dept"), {
                nome,
                departamento: depto,
                congregacao: igreja,
                status: 'Ativo',
                createdAt: new Date()
            });
            alert("Membro Salvo!");
            document.getElementById('memNome').value = "";
        } catch (e) { console.error(e); }
    });
}

function initMembersListener() {
    const q = query(collection(db, "membros_dept"), orderBy("nome"));
    onSnapshot(q, (snap) => {
        listaMembros.innerHTML = "";
        snap.forEach(d => {
            const m = d.data();
            listaMembros.innerHTML += `
                <tr>
                    <td>${m.nome}</td>
                    <td>-</td>
                    <td><span class="tag-dept dept-${m.departamento.toLowerCase()}">${m.departamento}</span></td>
                    <td>${m.status}</td>
                    <td><button onclick="window.delItem('membros_dept','${d.id}')" style="color:red;border:none;cursor:pointer;"><i class="fas fa-trash"></i></button></td>
                </tr>`;
        });
    });
}

// 3. ESCALAS
const btnSaveEscala = document.getElementById('btnSaveEscala');
if (btnSaveEscala) {
    btnSaveEscala.addEventListener('click', async() => {
        const data = document.getElementById('escData').value;
        const funcao = document.getElementById('escFuncao').value;
        const responsaveis = document.getElementById('escNomes').value;

        if (!data || !responsaveis) return alert("Preencha a escala.");

        try {
            await addDoc(collection(db, "escalas_dept"), {
                data,
                funcao,
                responsaveis,
                createdAt: new Date()
            });
            alert("Escala Salva!");
            document.getElementById('escNomes').value = "";
        } catch (e) { console.error(e); }
    });
}

function initEscalasListener() {
    const q = query(collection(db, "escalas_dept"), orderBy("data"));
    onSnapshot(q, (snap) => {
        listaEscalas.innerHTML = "";
        if (snap.empty) {
            listaEscalas.innerHTML = "<tr><td colspan='4'>Nenhuma escala.</td></tr>";
            return;
        }
        snap.forEach(d => {
            const e = d.data();
            const dataF = e.data.split('-').reverse().join('/');
            listaEscalas.innerHTML += `
                <tr>
                    <td>${dataF}</td>
                    <td>${e.funcao}</td>
                    <td>${e.responsaveis}</td>
                    <td><button onclick="window.delItem('escalas_dept','${d.id}')" style="color:red;border:none;cursor:pointer;"><i class="fas fa-trash"></i></button></td>
                </tr>`;
        });
    });
}

// 4. EVENTOS (Atualizado e Limpo)
function initEventosDeptListener() {
    const q = query(collection(db, "eventos"), orderBy("date"));

    onSnapshot(q, (snap) => {
        listaEventos.innerHTML = "";
        const hoje = new Date().toISOString().split('T')[0];

        snap.forEach(docSnap => {
            const ev = docSnap.data();

            // FILTRO GENÉRICO: Busca por 'jovens' ou 'adolescentes' no departamento ou título
            const deptLower = (ev.departamento || ev.title).toLowerCase();
            const ehJovens = deptLower.includes('jovem') || deptLower.includes('jovens');
            const ehAdol = deptLower.includes('adolescente');

            if ((ehJovens || ehAdol) && ev.date >= hoje) {

                // TAGS LIMPAS (Sem nomes de conjunto)
                let tagHTML = "";
                const typeLower = (ev.type || "").toLowerCase();
                const locLower = (ev.location || "").toLowerCase();

                if (typeLower === 'setorial') {
                    tagHTML = `<span class="dept-tag-setorial">SETORIAL</span>`;
                } else if (typeLower === 'geral') {
                    tagHTML = `<span class="dept-tag-outra">GERAL</span>`;
                } else {
                    // Se for Local
                    if (locLower.includes('candangolândia')) {
                        tagHTML = `<span class="dept-tag-local">LOCAL (CANDANGOLÂNDIA)</span>`;
                    } else {
                        tagHTML = `<span class="dept-tag-outra">${ev.location || 'Local'}</span>`;
                    }
                }

                const [ano, mes, dia] = ev.date.split('-');
                const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

                const div = document.createElement('div');
                div.className = "event-card-dept";
                div.innerHTML = `
                    ${tagHTML}
                    <div class="ev-date-big">${dia} <span class="ev-month-small">${meses[parseInt(mes)-1]}</span></div>
                    <div class="ev-title">${ev.title}</div>
                    <div style="color:#64748b; font-size:0.9rem; margin-bottom:15px;">
                        <i class="far fa-clock"></i> ${ev.time || '19:30'}
                    </div>
                    <button class="ev-btn-insc" onclick="alert('Inscrição em breve!')">
                        <i class="fas fa-list-alt"></i> Lista de Inscrição
                    </button>
                `;
                listaEventos.appendChild(div);
            }
        });

        if (listaEventos.innerHTML === "") listaEventos.innerHTML = "<p>Nenhum evento futuro encontrado.</p>";
    });
}

// Função Genérica de Exclusão
window.delItem = async(col, id) => {
    if (confirm("Deseja excluir?")) await deleteDoc(doc(db, col, id));
}