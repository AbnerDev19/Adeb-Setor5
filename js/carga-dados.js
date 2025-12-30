// js/carga-dados.js
import { db, collection, addDoc } from './firebase-config.js';

// --- CONFIGURAÇÃO ---
const ANO = 2026;

// 1. Eventos Fixos do PDF (Datas Específicas)
const eventosPDF = [
    // JANEIRO
    { title: "Reunião Geral de Obreiros", date: "2026-01-03", time: "09:00", location: "Templo Sede" },
    { title: "Aniversário Irmã Dianna", date: "2026-01-08", time: "19:30", location: "Sede Taguatinga" },
    // FEVEREIRO
    { title: "Reunião Coord. Setor", date: "2026-02-07", time: "09:00", location: "Auditório 1 Sede" },
    { title: "Congresso UMADEB", date: "2026-02-14", time: "19:00", location: "Pavilhão de Exposições" }, // Início
    { title: "Aniversário Pr. Orcival", date: "2026-02-19", time: "19:30", location: "Igreja Sede" },
    // ABRIL
    { title: "AGO - Assembleia Geral", date: "2026-04-04", time: "09:00", location: "Templo Sede" },
    { title: "EBOM - Escola Bíblica", date: "2026-04-17", time: "19:00", location: "Igreja Sede" },
    // MAIO
    { title: "Reunião Geral de Obreiros", date: "2026-05-02", time: "09:00", location: "Igreja Sede" },
    { title: "Seminário Harpa Cristã", date: "2026-05-01", time: "19:00", location: "Igreja Sede" },
    // JUNHO
    { title: "Congresso UNAADEB", date: "2026-06-04", time: "19:00", location: "A definir" },
    { title: "Batismo Geral", date: "2026-06-21", time: "14:00", location: "Setores" },
    // JULHO
    { title: "Reunião Geral de Obreiros", date: "2026-07-04", time: "09:00", location: "Igreja Sede" },
    // AGOSTO
    { title: "Reunião Coord. Setor", date: "2026-08-01", time: "09:00", location: "Auditório Sede" },
    { title: "Conferência Missionária", date: "2026-08-14", time: "19:00", location: "Igreja Sede" },
    // SETEMBRO
    { title: "Reunião Geral de Obreiros", date: "2026-09-05", time: "09:00", location: "Igreja Sede" },
    { title: "Congresso UFADEB", date: "2026-09-19", time: "19:00", location: "Arena Hall" },
    // OUTUBRO
    { title: "Reunião Coord. Setor", date: "2026-10-03", time: "09:00", location: "Templo Sede" },
    { title: "AGO - COMADEBG", date: "2026-10-16", time: "19:00", location: "Templo Sede" },
    // NOVEMBRO
    { title: "Congresso UDVADEB", date: "2026-11-06", time: "19:00", location: "Igreja Sede" },
    // DEZEMBRO
    { title: "Reunião Geral de Obreiros", date: "2026-12-05", time: "09:00", location: "Igreja Sede" }
];

// 2. Função para Gerar Cultos Recorrentes
function gerarRecorrentes() {
    const eventos = [];
    const dataInicial = new Date(ANO, 0, 1); // 01/01/2026
    const dataFinal = new Date(ANO, 11, 31); // 31/12/2026

    for (let d = new Date(dataInicial); d <= dataFinal; d.setDate(d.getDate() + 1)) {
        const diaSemana = d.getDay(); // 0=Dom, 1=Seg, 2=Ter...
        const dataFormatada = d.toISOString().split('T')[0];
        const diaMes = d.getDate();
        
        // Verifica se é o 2º Sábado do Mês (Santa Ceia)
        // Lógica: É sábado (6) e o dia está entre 8 e 14.
        const ehSegundoSabado = (diaSemana === 6 && diaMes >= 8 && diaMes <= 14);

        if (ehSegundoSabado) {
            eventos.push({
                title: "Culto de Santa Ceia",
                date: dataFormatada,
                time: "19:30", // Conforme PDF para a maioria das ceias
                location: "Igreja Sede",
                type: "ceia"
            });
            continue; // Se é Santa Ceia, não adiciona outro culto no horário
        }

        // Culto Público (Domingo)
        if (diaSemana === 0) {
            eventos.push({ title: "Culto Público", date: dataFormatada, time: "18:30", location: "Local", type: "rotina" });
        }
        // Culto de Ensino (Terça)
        else if (diaSemana === 2) {
            eventos.push({ title: "Culto de Ensino", date: dataFormatada, time: "19:30", location: "Local", type: "rotina" });
        }
        // Culto de Oração (Quinta)
        else if (diaSemana === 4) {
            eventos.push({ title: "Culto de Oração", date: dataFormatada, time: "19:30", location: "Local", type: "rotina" });
        }
    }
    return eventos;
}

// 3. Função Principal de Disparo
window.rodarCarga = async function() {
    if(!confirm("Tem certeza que quer gerar TODOS os eventos de 2026? Isso pode duplicar se já tiver rodado.")) return;

    console.log("Iniciando carga...");
    const recorrentes = gerarRecorrentes();
    const todos = [...eventosPDF, ...recorrentes];

    let contador = 0;
    for (const ev of todos) {
        await addDoc(collection(db, "eventos"), {
            ...ev,
            createdAt: new Date(),
            createdBy: "Script Automático"
        });
        contador++;
        console.log(`Adicionado: ${ev.title} em ${ev.date}`);
    }
    
    alert(`Sucesso! ${contador} eventos adicionados ao banco de dados.`);
}
