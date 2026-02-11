import { db, collection, addDoc, getDocs, deleteDoc, writeBatch, doc } from './firebase-config.js';

// 1. DADOS DO PDF + REGRA DE NEGÓCIO
const eventosPDF = [
    // JANEIRO
    { date: '2026-01-19', title: 'Aniversário Pr. Eraldo', loc: 'Candangolândia', type: 'setorial', dept: 'Geral' },
    // FEVEREIRO
    { date: '2026-02-21', title: 'Aniversário Pr. Orcival Pereira Xavier', loc: 'Sede', type: 'geral', dept: 'Geral' },
    // MARÇO
    { date: '2026-03-07', title: 'Dia Internacional da Mulher', loc: 'Guará I', type: 'setorial', dept: 'Irmãs' },
    { date: '2026-03-08', title: 'Aniversário Pr. Francisco', loc: 'Vereda Grande', type: 'setorial', dept: 'Geral' },
    { date: '2026-03-14', title: 'Festival Primavera', loc: 'Núcleo Bandeirante', type: 'setorial', dept: 'Geral' },
    { date: '2026-03-15', title: 'Festival Primavera (Enc)', loc: 'Núcleo Bandeirante', type: 'setorial', dept: 'Geral' },
    { date: '2026-03-26', title: 'Festividade Adolescentes (Cj. Cálamo)', loc: 'Núcleo Bandeirante', type: 'setorial', dept: 'Adolescentes' },
    { date: '2026-03-27', title: 'Festividade Jovens (Cj. Alfa)', loc: 'Núcleo Bandeirante', type: 'setorial', dept: 'Jovens' },
    { date: '2026-03-28', title: 'Festividade Irmãs (Louvor Celeste)', loc: 'Núcleo Bandeirante', type: 'setorial', dept: 'Irmãs' },
    // MAIO
    { date: '2026-05-01', title: 'Evangelismo', loc: 'Vargem Bonita', type: 'setorial', dept: 'Geral' },
    { date: '2026-05-09', title: 'Festividade UCADEB', loc: 'Lúcio Costa', type: 'setorial', dept: 'Crianças' },
    { date: '2026-05-16', title: 'Pré-Congresso UNAADEB', loc: 'Sede', type: 'geral', dept: 'Adolescentes' },
    { date: '2026-05-17', title: 'Aniversário Pb. Ivanilton', loc: 'Park Way', type: 'setorial', dept: 'Geral' },
    { date: '2026-05-18', title: 'Aniversário Pb. Luis Carlos', loc: 'Vila Cahuy', type: 'setorial', dept: 'Geral' },
    { date: '2026-05-22', title: 'Festividade Adolescentes', loc: 'Guará I', type: 'setorial', dept: 'Adolescentes' },
    { date: '2026-05-23', title: 'Festividade Adolescentes (Enc)', loc: 'Guará I', type: 'setorial', dept: 'Adolescentes' },
    { date: '2026-05-30', title: 'Aniversário Coral Maranata', loc: 'Sede', type: 'setorial', dept: 'Geral' },
    // JUNHO
    { date: '2026-06-14', title: 'Aniversário Pr. Carlos Alencar', loc: 'Guará II', type: 'setorial', dept: 'Geral' },
    { date: '2026-06-18', title: 'Festividade Varões', loc: 'Lúcio Costa', type: 'setorial', dept: 'Varões' },
    { date: '2026-06-19', title: 'Festividade Jovens e Adolescentes', loc: 'Lúcio Costa', type: 'setorial', dept: 'Jovens' },
    { date: '2026-06-20', title: 'Festividade Irmãs', loc: 'Lúcio Costa', type: 'setorial', dept: 'Irmãs' },
    { date: '2026-06-27', title: 'Festa dos Estados', loc: 'Guará I', type: 'setorial', dept: 'Geral' },
    { date: '2026-06-28', title: 'Festa dos Estados (Enc)', loc: 'Guará I', type: 'setorial', dept: 'Geral' },
    // JULHO
    { date: '2026-07-04', title: 'Pré-Congresso UFADEB', loc: 'Sede', type: 'geral', dept: 'Irmãs' },
    { date: '2026-07-09', title: 'Aniversário Pr. Silva', loc: 'Guará I', type: 'setorial', dept: 'Geral' },
    { date: '2026-07-12', title: 'Aniversário Pr. Izacc', loc: 'Paraíba', type: 'setorial', dept: 'Geral' },
    { date: '2026-07-17', title: 'Retiro UMADEB (Início)', loc: 'Externo', type: 'geral', dept: 'Jovens' },
    { date: '2026-07-25', title: 'Festividade UCADEB', loc: 'Candangolândia', type: 'setorial', dept: 'Crianças' },
    { date: '2026-07-25', title: 'Aniversário Pr. Saul Tavares (Coord)', loc: 'Candangolândia', type: 'setorial', dept: 'Geral' },
    // AGOSTO
    { date: '2026-08-01', title: 'Festividade Jovens e Adolescentes', loc: 'Candangolândia', type: 'setorial', dept: 'Jovens' },
    { date: '2026-08-15', title: 'Festividade Adolescentes', loc: 'Vila Cahuy', type: 'setorial', dept: 'Adolescentes' },
    { date: '2026-08-21', title: 'Evento Pérolas Setorial', loc: 'Sede', type: 'setorial', dept: 'Irmãs' },
    { date: '2026-08-22', title: 'Evento Pérolas Setorial (Enc)', loc: 'Sede', type: 'setorial', dept: 'Irmãs' },
    { date: '2026-08-28', title: 'Festividade Varões', loc: 'Guará I', type: 'setorial', dept: 'Varões' },
    { date: '2026-08-29', title: 'Festividade Irmãs', loc: 'Guará I', type: 'setorial', dept: 'Irmãs' },
    { date: '2026-08-30', title: 'Festividade Irmãs (Enc)', loc: 'Guará I', type: 'setorial', dept: 'Irmãs' },
    { date: '2026-08-31', title: 'Aniversário Pr. Walber', loc: 'Vargem Bonita', type: 'setorial', dept: 'Geral' },
    // SETEMBRO
    { date: '2026-09-03', title: 'Festividade Varões', loc: 'Guará II', type: 'setorial', dept: 'Varões' },
    { date: '2026-09-04', title: 'Festividade Irmãs', loc: 'Guará II', type: 'setorial', dept: 'Irmãs' },
    { date: '2026-09-05', title: 'Festividade Jovens', loc: 'Guará II', type: 'setorial', dept: 'Jovens' },
    { date: '2026-09-11', title: 'Festividade Primavera', loc: 'Núcleo Bandeirante', type: 'setorial', dept: 'Geral' },
    { date: '2026-09-12', title: 'Festividade Primavera (Enc)', loc: 'Núcleo Bandeirante', type: 'setorial', dept: 'Geral' },
    { date: '2026-09-25', title: 'Festividade Departamentos', loc: 'Vereda Grande', type: 'setorial', dept: 'Geral' },
    { date: '2026-09-26', title: 'Festividade Departamentos', loc: 'Park Way', type: 'setorial', dept: 'Geral' },
    // OUTUBRO
    { date: '2026-10-01', title: 'Aniversário Irmã Dinalziza', loc: 'Núcleo Bandeirante', type: 'setorial', dept: 'Irmãs' },
    { date: '2026-10-03', title: 'Pré-Congresso UDVADEB', loc: 'Sede', type: 'geral', dept: 'Varões' },
    { date: '2026-10-10', title: 'Congresso Setorial UCADEB', loc: 'Sede', type: 'setorial', dept: 'Crianças' },
    { date: '2026-10-17', title: 'Festividade UCADEB', loc: 'Guará II', type: 'setorial', dept: 'Crianças' },
    { date: '2026-10-24', title: 'SEMADEB Setorial (Cruzada)', loc: 'Sede', type: 'setorial', dept: 'Geral' },
    { date: '2026-10-27', title: 'Aniversário Pr. William', loc: 'Lúcio Costa', type: 'setorial', dept: 'Geral' },
    { date: '2026-10-30', title: 'Festividade Jovens', loc: 'Guará I', type: 'setorial', dept: 'Jovens' },
    { date: '2026-10-31', title: 'Festividade Jovens (Enc)', loc: 'Guará I', type: 'setorial', dept: 'Jovens' },
    // NOVEMBRO
    { date: '2026-11-20', title: 'Festividade Varões', loc: 'Candangolândia', type: 'setorial', dept: 'Varões' },
    { date: '2026-11-21', title: 'Festividade UCADEB (Manhã/Tarde)', loc: 'Guará I', type: 'setorial', dept: 'Crianças' },
    { date: '2026-11-21', title: 'Festividade Irmãs', loc: 'Candangolândia', type: 'setorial', dept: 'Irmãs' },
    { date: '2026-11-28', title: 'Pré-Congresso UMADEB', loc: 'Sede', type: 'geral', dept: 'Jovens' }
];

// 2. FUNÇÃO RECORRENTES
function gerarEventosRecorrentes() {
    const eventos = [];
    const inicio = new Date('2026-01-01');
    const fim = new Date('2026-12-31');
    const atual = new Date(inicio);

    while (atual <= fim) {
        const diaSemana = atual.getDay();
        const diaMes = atual.getDate();
        const dataStr = atual.toISOString().split('T')[0];
        const isSegundoSabado = (diaSemana === 6 && diaMes >= 8 && diaMes <= 14);

        if (isSegundoSabado) {
            eventos.push({ date: dataStr, title: 'Santa Ceia', loc: 'Candangolândia', type: 'local', dept: 'Geral', time: '19:30' });
        } else if (diaSemana === 0) {
            eventos.push({ date: dataStr, title: 'Culto da Família', loc: 'Candangolândia', type: 'local', dept: 'Geral', time: '18:30' });
        } else if (diaSemana === 2) {
            eventos.push({ date: dataStr, title: 'Culto de Ensino', loc: 'Candangolândia', type: 'local', dept: 'Geral', time: '19:30' });
        } else if (diaSemana === 4) {
            eventos.push({ date: dataStr, title: 'Culto de Libertação', loc: 'Candangolândia', type: 'local', dept: 'Geral', time: '19:30' });
        }
        atual.setDate(atual.getDate() + 1);
    }
    return eventos;
}

// 3. FUNÇÃO EXECUTORA (Atrelada ao window)
window.executarCarga = async function () {
    const senha = prompt("Digite a senha de Admin para RESETAR o banco:");
    if (senha !== "1234") return alert("Senha incorreta.");

    if (!confirm("⚠️ ATENÇÃO: Isso vai APAGAR TODOS os eventos atuais e recriar a agenda de 2026 do zero. Continuar?")) return;

    try {
        document.body.style.cursor = "wait";
        console.log("Apagando eventos antigos...");

        // Apaga coleção antiga
        const snapshot = await getDocs(collection(db, "eventos"));
        const deleteBatch = writeBatch(db);
        snapshot.forEach((doc) => deleteBatch.delete(doc.ref));
        await deleteBatch.commit();

        // Gera novos
        const recorrentes = gerarEventosRecorrentes();
        const todosEventos = [...eventosPDF, ...recorrentes];
        console.log(`Inserindo ${todosEventos.length} novos eventos...`);

        // Insere em lotes
        let batch = writeBatch(db);
        let count = 0;
        const total = todosEventos.length;

        for (let i = 0; i < total; i++) {
            const ev = todosEventos[i];
            const ref = doc(collection(db, "eventos"));
            batch.set(ref, {
                title: ev.title, date: ev.date, location: ev.loc,
                type: ev.type, departamento: ev.dept, time: ev.time || '19:30',
                createdAt: new Date()
            });
            count++;
            if (count >= 400 || i === total - 1) {
                await batch.commit();
                batch = writeBatch(db);
                count = 0;
            }
        }

        alert("✅ Sucesso! Agenda 2026 carregada e colorida.");
        document.body.style.cursor = "default";
        window.location.reload();

    } catch (e) {
        console.error(e);
        alert("Erro: " + e.message);
        document.body.style.cursor = "default";
    }
};

console.log("Módulo de carga carregado com sucesso!");