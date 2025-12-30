import { db, collection, onSnapshot, query, orderBy } from './firebase-config.js';

// Estado Global
let eventsData = [];
let currentDate = new Date(); // Começa hoje

// Elementos do DOM
const monthYearEl = document.getElementById('monthYear');
const daysContainer = document.getElementById('daysContainer');
const eventsListEl = document.getElementById('eventsList');

// --- 1. CONEXÃO COM O BANCO DE DADOS (Tempo Real) ---
function initRealtimeListener() {
    // Busca eventos ordenados por data
    const q = query(collection(db, "eventos"), orderBy("date"));
    
    onSnapshot(q, (snapshot) => {
        eventsData = [];
        snapshot.forEach((doc) => {
            // Salva o ID do documento para podermos apagar depois
            eventsData.push({ id: doc.id, ...doc.data() });
        });
        
        renderCalendar();
        renderEvents(); 
    });
}

// --- 2. LÓGICA DO CALENDÁRIO ---
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    if(monthYearEl) monthYearEl.innerText = `${monthNames[month]} ${year}`;

    if(daysContainer) {
        daysContainer.innerHTML = "";

        // Dias vazios (padding inicial)
        for (let i = 0; i < firstDay; i++) {
            daysContainer.innerHTML += `<div class="day empty"></div>`;
        }

        // Dias do mês
        for (let i = 1; i <= lastDate; i++) {
            const checkDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            // Verifica se tem evento nesse dia
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
}

// --- 3. LÓGICA DA LISTA DE EVENTOS ---
function renderEvents(filterDate = null) {
    if(!eventsListEl) return;
    eventsListEl.innerHTML = "";
    
    let filtered = eventsData;

    if (filterDate) {
        // Se selecionou um dia, mostra só ele
        filtered = eventsData.filter(e => e.date === filterDate);
    } else {
        // Se não, mostra futuros (a partir de hoje)
        const hoje = new Date().toISOString().split('T')[0];
        filtered = eventsData.filter(e => e.date >= hoje);
    }

    if (filtered.length === 0) {
        eventsListEl.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-secondary);">Nenhum evento encontrado.</div>`;
        return;
    }

    filtered.forEach(ev => {
        // Ajuste de Data para evitar bug de fuso horário
        const d = new Date(ev.date + 'T12:00:00'); 
        const day = d.getDate();
        const month = d.toLocaleString('pt-BR', { month: 'short' }).replace('.','');

        // Renderiza o Card
        // NOTA: O botão de excluir começa com style="display:none".
        // O admin.js vai torná-lo visível se o usuário for líder.
        eventsListEl.innerHTML += `
            <div class="event-item" data-id="${ev.id}">
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
                
                <button class="btn-delete-event" 
                        style="display:none; margin-left:auto; background:none; border:none; color:#ef4444; cursor:pointer; padding:10px;" 
                        onclick="window.deleteEvent('${ev.id}')"
                        title="Excluir Evento">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
}

// --- 4. NAVEGAÇÃO E MOBILE ---
const btnPrev = document.getElementById('prevMonth');
const btnNext = document.getElementById('nextMonth');

if(btnPrev) btnPrev.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

if(btnNext) btnNext.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Função para abrir menu no celular (chamada pelo HTML)
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    if(sidebar) sidebar.classList.toggle('open');
}

// Inicia
initRealtimeListener();