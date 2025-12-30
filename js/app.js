import { db, collection, onSnapshot, query, orderBy } from './firebase-config.js';

let eventsData = [];
let currentDate = new Date(); // Começa na data de hoje
const monthYearEl = document.getElementById('monthYear');
const daysContainer = document.getElementById('daysContainer');
const eventsListEl = document.getElementById('eventsList');

// --- 1. CONEXÃO COM O BANCO DE DADOS ---
// Essa função "escuta" o banco. Se alguém adicionar algo, o site atualiza sozinho.
function initRealtimeListener() {
    const q = query(collection(db, "eventos"), orderBy("date"));

    onSnapshot(q, (snapshot) => {
        eventsData = []; // Limpa lista antiga
        snapshot.forEach((doc) => {
            eventsData.push(doc.data());
        });

        // Atualiza a tela com os novos dados
        renderCalendar();
        renderEvents();
    });
}

// --- 2. LÓGICA DO CALENDÁRIO (Igual ao anterior) ---
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    monthYearEl.innerText = `${monthNames[month]} ${year}`;

    daysContainer.innerHTML = "";

    // Dias vazios
    for (let i = 0; i < firstDay; i++) {
        daysContainer.innerHTML += `<div class="day empty"></div>`;
    }

    // Dias do mês
    for (let i = 1; i <= lastDate; i++) {
        const checkDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        // Verifica se tem evento na lista carregada do Firebase
        const hasEvent = eventsData.some(e => e.date === checkDate);

        const div = document.createElement('div');
        div.className = `day ${hasEvent ? 'has-event' : ''}`;
        div.innerText = i;

        div.addEventListener('click', () => {
            document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
            div.classList.add('active');
            renderEvents(checkDate);
        });

        daysContainer.appendChild(div);
    }
}

function renderEvents(filterDate = null) {
    eventsListEl.innerHTML = "";

    // Filtra para mostrar apenas eventos futuros ou do dia selecionado
    let filtered = eventsData;

    if (filterDate) {
        filtered = eventsData.filter(e => e.date === filterDate);
    } else {
        // Se não tiver filtro, mostra apenas eventos futuros (a partir de hoje)
        const hoje = new Date().toISOString().split('T')[0];
        filtered = eventsData.filter(e => e.date >= hoje);
    }

    if (filtered.length === 0) {
        eventsListEl.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-secondary);">Nenhum evento encontrado.</div>`;
        return;
    }

    filtered.forEach(ev => {
        // Ajuste de fuso horário simples
        const d = new Date(ev.date + 'T12:00:00');
        const day = d.getDate();
        const month = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');

        eventsListEl.innerHTML += `
            <div class="event-item">
                <div class="date-badge">
                    <span class="d-num">${day}</span>
                    <span class="d-month">${month}</span>
                </div>
                <div class="event-info">
                    <h4>${ev.title}</h4>
                    <div class="event-meta">
                        <span><i class="far fa-clock"></i> ${ev.time || '--:--'}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${ev.location || 'Sede'}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

// Navegação
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Inicia tudo
initRealtimeListener();