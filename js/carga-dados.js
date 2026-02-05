// js/carga-dados.js
import { db, collection, addDoc } from './firebase-config.js';

// --- CONFIGURAÇÃO ---
const ANO = 2026;

// =========================================================================
// 1. AGENDA GERAL (Antiga - Eventos da Sede/Convenção)
// Cor: AMARELO/OURO (type: 'geral')
// =========================================================================
const eventosGerais = [
    // JANEIRO
    { title: "Reunião Geral de Obreiros", date: "2026-01-03", time: "09:00", location: "Templo Sede", type: "geral" },
    { title: "Aniversário Irmã Dianna", date: "2026-01-08", time: "19:30", location: "Sede Taguatinga", type: "geral" },
    // FEVEREIRO
    { title: "Congresso UMADEB", date: "2026-02-14", time: "19:00", location: "Pavilhão de Exposições", type: "geral" }, 
    // MARÇO
    // (Adicione aqui se houver eventos gerais em Março na lista antiga)
    // ABRIL
    { title: "AGO - Assembleia Geral", date: "2026-04-04", time: "09:00", location: "Templo Sede", type: "geral" },
    { title: "EBOM - Escola Bíblica", date: "2026-04-17", time: "19:00", location: "Igreja Sede", type: "geral" },
    // MAIO
    { title: "Reunião Geral de Obreiros", date: "2026-05-02", time: "09:00", location: "Igreja Sede", type: "geral" },
    { title: "Seminário Harpa Cristã", date: "2026-05-01", time: "19:00", location: "Igreja Sede", type: "geral" },
    // JUNHO
    { title: "Congresso UNAADEB", date: "2026-06-04", time: "19:00", location: "A definir", type: "geral" },
    { title: "Batismo Geral", date: "2026-06-21", time: "14:00", location: "Setores", type: "geral" },
    // JULHO
    { title: "Reunião Geral de Obreiros", date: "2026-07-04", time: "09:00", location: "Igreja Sede", type: "geral" },
    // AGOSTO
    { title: "Conferência Missionária", date: "2026-08-14", time: "19:00", location: "Igreja Sede", type: "geral" },
    // SETEMBRO
    { title: "Reunião Geral de Obreiros", date: "2026-09-05", time: "09:00", location: "Igreja Sede", type: "geral" },
    { title: "Congresso UFADEB", date: "2026-09-19", time: "19:00", location: "Arena Hall", type: "geral" },
    // OUTUBRO
    { title: "AGO - COMADEBG", date: "2026-10-16", time: "19:00", location: "Templo Sede", type: "geral" },
    // NOVEMBRO
    { title: "Congresso UDVADEB", date: "2026-11-06", time: "19:00", location: "Igreja Sede", type: "geral" },
    // DEZEMBRO
    { title: "Reunião Geral de Obreiros", date: "2026-12-05", time: "09:00", location: "Igreja Sede", type: "geral" }
];

// =========================================================================
// 2. AGENDA SETORIAL (Nova - PDF Setor 05)
// Cor: ROXO (type: 'setorial')
// =========================================================================
const eventosSetor05 = [
    // --- JANEIRO ---
    { title: "Aniversário Pr. Eraldo", date: "2026-01-19", time: "19:30", location: "Candangolândia", type: "setorial" },
    
    // --- FEVEREIRO ---
    { title: "Aniversário Pr. Orcival Pereira", date: "2026-02-21", time: "19:30", location: "A definir", type: "setorial" },

    // --- MARÇO ---
    { title: "Dia Internacional da Mulher", date: "2026-03-07", time: "19:00", location: "Guará I", type: "setorial" },
    { title: "Aniversário Pr. Francisco", date: "2026-03-08", time: "19:30", location: "Vereda Grande", type: "setorial" },
    { title: "Festival Primavera (Abertura)", date: "2026-03-14", time: "19:00", location: "Núcleo Bandeirante (Sede)", type: "setorial" },
    { title: "Festival Primavera (Encerramento)", date: "2026-03-15", time: "18:00", location: "Núcleo Bandeirante (Sede)", type: "setorial" },
    { title: "Festividade Conjunto Cálamo (Adolescentes)", date: "2026-03-26", time: "19:30", location: "Núcleo Bandeirante", type: "setorial" },
    { title: "Festividade Conjunto Alfa (Jovens)", date: "2026-03-27", time: "19:30", location: "Núcleo Bandeirante", type: "setorial" },
    { title: "Festividade Círculo de Oração (Irmãs)", date: "2026-03-28", time: "19:00", location: "Núcleo Bandeirante", type: "setorial" },

    // --- MAIO ---
    { title: "Evangelismo", date: "2026-05-01", time: "09:00", location: "Vargem Bonita", type: "setorial" },
    { title: "Festividade UCADEB", date: "2026-05-09", time: "19:00", location: "Lúcio Costa", type: "setorial" },
    { title: "Pré-Congresso UNAADEB", date: "2026-05-16", time: "19:00", location: "A definir", type: "setorial" },
    { title: "Aniversário Pb. Ivanilton", date: "2026-05-17", time: "19:30", location: "Park Way", type: "setorial" },
    { title: "Aniversário Pb. Luis Carlos", date: "2026-05-18", time: "19:30", location: "Vila Cahuy", type: "setorial" },
    { title: "Festividade Adolescentes", date: "2026-05-22", time: "19:30", location: "Guará I", type: "setorial" },
    { title: "Festividade Adolescentes (Encerramento)", date: "2026-05-23", time: "19:00", location: "Guará I", type: "setorial" },
    { title: "Aniversário Coral Maranata", date: "2026-05-30", time: "19:00", location: "A definir", type: "setorial" },

    // --- JUNHO ---
    { title: "Aniversário Pr. Carlos Alencar", date: "2026-06-14", time: "19:30", location: "Guará II", type: "setorial" },
    { title: "Festividade Varões", date: "2026-06-18", time: "19:30", location: "Lúcio Costa", type: "setorial" },
    { title: "Festividade Jovens e Adolescentes", date: "2026-06-19", time: "19:30", location: "Lúcio Costa", type: "setorial" },
    { title: "Festividade Irmãs", date: "2026-06-20", time: "19:00", location: "Lúcio Costa", type: "setorial" },
    { title: "Festa dos Estados", date: "2026-06-27", time: "19:00", location: "Guará I", type: "setorial" },
    { title: "Festa dos Estados (Encerramento)", date: "2026-06-28", time: "18:00", location: "Guará I", type: "setorial" },

    // --- JULHO ---
    { title: "Pré-Congresso UFADEB", date: "2026-07-04", time: "19:00", location: "A definir", type: "setorial" },
    { title: "Aniversário Pr. Silva", date: "2026-07-09", time: "19:30", location: "Guará I", type: "setorial" },
    { title: "Aniversário Pr. Izacc", date: "2026-07-12", time: "19:30", location: "Paraíba", type: "setorial" },
    { title: "Retiro UMADEB", date: "2026-07-17", time: "19:00", location: "Local de Retiros", type: "setorial" },
    { title: "Festividade UCADEB", date: "2026-07-25", time: "19:00", location: "Candangolândia", type: "setorial" },
    { title: "Aniversário Pr. Saul Tavares (Coord.)", date: "2026-07-25", time: "19:30", location: "Sede Setorial", type: "setorial" },

    // --- AGOSTO ---
    { title: "Festividade Jovens e Adolescentes", date: "2026-08-01", time: "19:00", location: "Candangolândia", type: "setorial" },
    { title: "Festividade Adolescentes", date: "2026-08-15", time: "19:00", location: "Vila Cahuy", type: "setorial" },
    { title: "Evento Pérolas Setorial", date: "2026-08-21", time: "19:30", location: "Sede Setorial", type: "setorial" },
    { title: "Evento Pérolas Setorial (Encerramento)", date: "2026-08-22", time: "19:00", location: "Sede Setorial", type: "setorial" },
    { title: "Festividade de Varões", date: "2026-08-28", time: "19:30", location: "Guará I", type: "setorial" },
    { title: "Festividade de Irmãs", date: "2026-08-29", time: "19:00", location: "Guará I", type: "setorial" },
    { title: "Festividade de Irmãs (Encerramento)", date: "2026-08-30", time: "18:00", location: "Guará I", type: "setorial" },
    { title: "Aniversário Pr. Walber", date: "2026-08-31", time: "19:30", location: "Vargem Bonita", type: "setorial" },

    // --- SETEMBRO ---
    { title: "Festividade Varões", date: "2026-09-03", time: "19:30", location: "Guará II", type: "setorial" },
    { title: "Festividade Irmãs", date: "2026-09-04", time: "19:30", location: "Guará II", type: "setorial" },
    { title: "Festividade Jovens", date: "2026-09-05", time: "19:00", location: "Guará II", type: "setorial" },
    { title: "Festividade Primavera", date: "2026-09-11", time: "19:30", location: "Núcleo Bandeirante", type: "setorial" },
    { title: "Festividade Primavera (Encerramento)", date: "2026-09-12", time: "19:00", location: "Núcleo Bandeirante", type: "setorial" },
    { title: "Festividade Departamentos", date: "2026-09-25", time: "19:30", location: "Vereda Grande", type: "setorial" },
    { title: "Festividade Departamentos", date: "2026-09-26", time: "19:00", location: "Park Way", type: "setorial" },

    // --- OUTUBRO ---
    { title: "Aniversário Irmã Dinalziza", date: "2026-10-01", time: "19:30", location: "Núcleo Bandeirante", type: "setorial" },
    { title: "Pré-Congresso UDVADEB", date: "2026-10-03", time: "19:00", location: "A definir", type: "setorial" },
    { title: "Congresso Setorial UCADEB", date: "2026-10-10", time: "09:00", location: "Sede Setorial", type: "setorial" },
    { title: "Festividade da UCADEB", date: "2026-10-17", time: "19:00", location: "Guará II", type: "setorial" },
    { title: "SEMADEB Setorial (Cruzada)", date: "2026-10-24", time: "19:00", location: "Sede Setorial", type: "setorial" },
    { title: "Aniversário Pr. William", date: "2026-10-27", time: "19:30", location: "Lúcio Costa", type: "setorial" },
    { title: "Festividade de Jovens", date: "2026-10-30", time: "19:30", location: "Guará I", type: "setorial" },
    { title: "Festividade de Jovens (Encerramento)", date: "2026-10-31", time: "19:00", location: "Guará I", type: "setorial" },

    // --- NOVEMBRO ---
    { title: "Festividade de Varões", date: "2026-11-20", time: "19:30", location: "Candangolândia", type: "setorial" },
    { title: "Festividade UCADEB", date: "2026-11-21", time: "09:00", location: "Guará I", type: "setorial" },
    { title: "Festividade de Irmãs", date: "2026-11-21", time: "19:00", location: "Candangolândia", type: "setorial" },
    { title: "Pré-Congresso UMADEB", date: "2026-11-28", time: "19:00", location: "A definir", type: "setorial" }
];

// =========================================================================
// 3. RECORRENTES (Santa Ceia)
// =========================================================================
function gerarRecorrentes() {
    const eventos = [];
    const dataInicial = new Date(ANO, 0, 1);
    const dataFinal = new Date(ANO, 11, 31);

    for (let d = new Date(dataInicial); d <= dataFinal; d.setDate(d.getDate() + 1)) {
        const diaSemana = d.getDay(); // 0=Dom, 6=Sab
        const dataFormatada = d.toISOString().split('T')[0];
        const diaMes = d.getDate();
        
        // Regra Santa Ceia: 2º Sábado do mês
        const ehSegundoSabado = (diaSemana === 6 && diaMes >= 8 && diaMes <= 14);

        if (ehSegundoSabado) {
            eventos.push({
                title: "Santa Ceia",
                date: dataFormatada,
                time: "19:30",
                location: "Igreja Sede",
                type: "geral" // Mantendo como Geral para destaque
            });
        }
    }
    return eventos;
}

// =========================================================================
// 4. FUNÇÃO DE CARGA (Disparo)
// =========================================================================
window.rodarCarga = async function() {
    const senha = prompt("Digite a senha de admin para confirmar a carga:");
    if(senha !== "1234") return alert("Senha incorreta. Operação cancelada.");

    if(!confirm("Isso vai adicionar eventos GERAIS e SETORIAIS. Deseja continuar?")) return;

    console.log("Iniciando carga completa...");
    
    // Mescla todas as listas
    const recorrentes = gerarRecorrentes();
    const todos = [...eventosGerais, ...eventosSetor05, ...recorrentes];

    let contador = 0;
    try {
        for (const ev of todos) {
            await addDoc(collection(db, "eventos"), {
                ...ev,
                createdAt: new Date(),
                createdBy: "Script Automático (Merge Geral + Setorial)"
            });
            contador++;
            console.log(`[${contador}] Adicionado: ${ev.title} (${ev.type})`);
        }
        alert(`Sucesso! ${contador} eventos adicionados (Gerais + Setoriais).`);
        location.reload(); 
    } catch (error) {
        console.error("Erro na carga:", error);
        alert("Erro ao adicionar eventos. Veja o console.");
    }
}