import { db, collection, addDoc, getDocs, deleteDoc, writeBatch, doc } from './firebase-config.js';

// ==========================================
// 1. DADOS DA AGENDA DO SETOR (DO PDF)
// ==========================================
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

// ==========================================
// 2. FUNÇÃO GERADORA DE RECORRENTES (LOCAL)
// ==========================================
function gerarEventosRecorrentes() {
    const eventos = [];
    const inicio = new Date('2026-01-01');
    const fim = new Date('2026-12-31');
    const atual = new Date(inicio);

    while (atual <= fim) {
        const diaSemana = atual.getDay(); // 0=Dom, 1=Seg, 2=Ter...
        const diaMes = atual.getDate();
        const dataStr = atual.toISOString().split('T')[0];

        // Regra do 2º Sábado (Santa Ceia)
        // O 2º sábado sempre cai entre os dias 8 e 14
        const isSegundoSabado = (diaSemana === 6 && diaMes >= 8 && diaMes <= 14);

        if (isSegundoSabado) {
            eventos.push({
                date: dataStr,
                title: 'Santa Ceia',
                loc: 'Candangolândia',
                type: 'local', // AZUL
                dept: 'Geral',
                time: '19:30'
            });
        }
        else if (diaSemana === 0) { // Domingo
            eventos.push({
                date: dataStr,
                title: 'Culto da Família',
                loc: 'Candangolândia',
                type: 'local',
                dept: 'Geral',
                time: '18:30'
            });
        }
        else if (diaSemana === 2) { // Terça
            eventos.push({
                date: dataStr,
                title: 'Culto de Ensino',
                loc: 'Candangolândia',
                type: 'local',
                dept: 'Geral',
                time: '19:30'
            });
        }
        else if (diaSemana === 4) { // Quinta
            eventos.push({
                date: dataStr,
                title: 'Culto de Libertação',
                loc: 'Candangolândia',
                type: 'local',
                dept: 'Geral',
                time: '19:30'
            });
        }

        atual.setDate(atual.getDate() + 1); // Próximo dia
    }
    return eventos;
}

// ==========================================
// 3. FUNÇÃO PRINCIPAL DE CARGA
// ==========================================
window.carregarDados = async function() {
    const senha = prompt("Senha de Admin:");
    if (senha !== "1234") return alert("Senha incorreta!");

    if (!confirm("ISSO APAGARÁ TODOS OS EVENTOS EXISTENTES E RECRIARÁ O BANCO. TEM CERTEZA?")) return;

    try {
        console.log("Iniciando limpeza...");
        
        // 1. Limpar Coleção 'eventos'
        const snapshot = await getDocs(collection(db, "eventos"));
        const deleteBatch = writeBatch(db);
        let countDel = 0;
        
        snapshot.forEach((doc) => {
            deleteBatch.delete(doc.ref);
            countDel++;
        });
        await deleteBatch.commit();
        console.log(`${countDel} eventos apagados.`);

        // 2. Preparar Novos Dados
        const recorrentes = gerarEventosRecorrentes();
        const todosEventos = [...eventosPDF, ...recorrentes];
        
        console.log(`Criando ${todosEventos.length} novos eventos...`);

        // 3. Inserir em Lotes (Batches de 500)
        const total = todosEventos.length;
        let batch = writeBatch(db);
        let count = 0;

        for (let i = 0; i < total; i++) {
            const ev = todosEventos[i];
            const ref = doc(collection(db, "eventos")); // ID Automático
            
            batch.set(ref, {
                title: ev.title,
                date: ev.date,
                location: ev.loc,
                type: ev.type, // local, setorial, geral
                departamento: ev.dept,
                time: ev.time || '19:30',
                createdAt: new Date()
            });

            count++;
            // Firebase limite de 500 writes por batch
            if (count >= 400 || i === total - 1) {
                await batch.commit();
                batch = writeBatch(db); // Novo batch
                count = 0;
                console.log(`Processados: ${i + 1}/${total}`);
            }
        }

        alert("Banco de dados recriado com sucesso!");
        window.location.reload();

    } catch (e) {
        console.error("Erro fatal:", e);
        alert("Erro ao processar. Verifique o console.");
    }
};