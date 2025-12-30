import { db, collection, onSnapshot, query, orderBy } from './firebase-config.js';

// Estado Global
let eventsData = [];
let currentDate = new Date(); // Começa hoje

// Elementos
const monthYearEl = document.getElementById('monthYear');
const daysContainer = document.getElementById('daysContainer');
const eventsListEl = document.getElementById('eventsList');

// 1. CONEXÃO FIREBASE
function initRealtimeListener() {
    const q = query(collection(db, "eventos"), orderBy("date"));
    
    onSnapshot(q, (snapshot) => {
        eventsData = [];
        snapshot.forEach((doc) => {
            eventsData.push({ id: doc.id, ...doc.data() });
        });
        
        // Atualiza tudo quando chegam dados novos
        updateInterface(); 
    });
}

// Função central que atualiza Calendário E Lista ao mesmo tempo
function updateInterface() {
    renderCalendar();
    renderEventsForCurrentMonth();
}

// 2. CALENDÁRIO
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    if(monthYearEl) monthYearEl.innerText = `${monthNames[month]} ${year}`;

    if(daysContainer) {
        daysContainer.innerHTML = "";

        // Dias vazios
        for (let i = 0; i < firstDay; i++) {
            daysContainer.innerHTML += `<div class="day empty"></div>`;
        }

        // Dias do mês
        for (let i = 1; i <= lastDate; i++) {
            const checkDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const hasEvent = eventsData.some(e => e.date === checkDate);
            
            const div = document.createElement('div');
            div.className = `day ${hasEvent ? 'has-event' : ''}`;
            div.innerText = i;
            
            // Ao clicar, filtra só aquele dia
            div.addEventListener('click', () => {
                document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
                div.classList.add('active');
                renderEventsByDay(checkDate);
            });

            daysContainer.appendChild(div);
        }
    }
}

// 3. LISTA DE EVENTOS (Lógica Nova: Filtra pelo Mês Atual)
function renderEventsForCurrentMonth() {
    if(!eventsListEl) return;
    eventsListEl.innerHTML = "";
    
    // Pega o ano e mês atuais da visualização
    const viewYear = currentDate.getFullYear();
    const viewMonth = currentDate.getMonth(); // 0 a 11

    // Filtra: Ano e Mês precisam bater com a visualização atual
    const filtered = eventsData.filter(ev => {
        // Converte a string "YYYY-MM-DD" para data segura (evita bug de fuso -3h)
        const [ano, mes, dia] = ev.date.split('-').map(Number); 
        // Nota: no JS, mês no construtor começa em 0 (Jan=0), mas no split vem 1. Ajustamos.
        return ano === viewYear && (mes - 1) === viewMonth;
    });

    renderListHTML(filtered, `Eventos de ${monthYearEl.innerText}`);
}

// Mostra eventos de um dia específico (ao clicar na bolinha)
function renderEventsByDay(dateString) {
    const filtered = eventsData.filter(e => e.date === dateString);
    const [ano, mes, dia] = dateString.split('-');
    renderListHTML(filtered, `Eventos do dia ${dia}/${mes}`);
}

// Gera o HTML da lista
function renderListHTML(list, titleOverride = null) {
    eventsListEl.innerHTML = "";

    // Se quiser, pode mudar o título do card para indicar o filtro
    const cardTitle = document.querySelector('.card-title');
    if(cardTitle && titleOverride) cardTitle.innerText = titleOverride;

    if (list.length === 0) {
        eventsListEl.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--text-secondary); font-style: italic;">Nenhum evento neste período.</div>`;
        return;
    }

    list.forEach(ev => {
        const [ano, mes, dia] = ev.date.split('-');
        const dateObj = new Date(ano, mes - 1, dia);
        const monthShort = dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.','');

        eventsListEl.innerHTML += `
            <div class="event-item" data-id="${ev.id}">
                <div class="date-badge">
                    <span class="d-num">${dia}</span>
                    <span class="d-month">${monthShort}</span>
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
                        onclick="window.deleteEvent('${ev.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
}

// 4. BOTÕES DE NAVEGAÇÃO (Avançar/Voltar Mês)
const btnPrev = document.getElementById('prevMonth');
const btnNext = document.getElementById('nextMonth');

if(btnPrev) btnPrev.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateInterface(); // Atualiza calendário E lista
});

if(btnNext) btnNext.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateInterface(); // Atualiza calendário E lista
});

// Mobile
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    if(sidebar) sidebar.classList.toggle('open');
}

// Inicia
initRealtimeListener();