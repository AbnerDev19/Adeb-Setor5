import { db, collection, onSnapshot, query, orderBy } from './firebase-config.js';

let eventsData = [];
let currentDate = new Date(); 

const monthYearEl = document.getElementById('monthYear');
const daysContainer = document.getElementById('daysContainer');
const eventsListEl = document.getElementById('eventsList');

function initRealtimeListener() {
    const q = query(collection(db, "eventos"), orderBy("date"));
    
    onSnapshot(q, (snapshot) => {
        eventsData = [];
        snapshot.forEach((doc) => {
            eventsData.push({ id: doc.id, ...doc.data() });
        });
        updateInterface(); 
    });
}

function updateInterface() {
    renderCalendar();
    renderEventsForCurrentMonth();
}

// 2. CALENDÁRIO COM CORES
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
            
            // Procura se tem evento nesse dia e pega o PRIMEIRO evento encontrado
            const eventObj = eventsData.find(e => e.date === checkDate);
            const hasEvent = !!eventObj;

            // Define a classe do tipo (ex: 'type-local', 'type-setorial')
            let typeClass = '';
            if(hasEvent && eventObj.type) {
                typeClass = `type-${eventObj.type}`;
            }
            
            const div = document.createElement('div');
            // Adiciona a classe do tipo na div do dia
            div.className = `day ${hasEvent ? 'has-event' : ''} ${typeClass}`;
            div.innerText = i;
            
            div.addEventListener('click', () => {
                document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
                div.classList.add('active');
                renderEventsByDay(checkDate);
            });
            daysContainer.appendChild(div);
        }
    }
}

// 3. LISTA DE EVENTOS
function renderEventsForCurrentMonth() {
    if(!eventsListEl) return;
    eventsListEl.innerHTML = "";
    
    const viewYear = currentDate.getFullYear();
    const viewMonth = currentDate.getMonth();

    const filtered = eventsData.filter(ev => {
        const [ano, mes, dia] = ev.date.split('-').map(Number); 
        return ano === viewYear && (mes - 1) === viewMonth;
    });

    renderListHTML(filtered, `Eventos de ${monthYearEl.innerText}`);
}

function renderEventsByDay(dateString) {
    const filtered = eventsData.filter(e => e.date === dateString);
    const [ano, mes, dia] = dateString.split('-');
    renderListHTML(filtered, `Eventos do dia ${dia}/${mes}`);
}

function renderListHTML(list, titleOverride = null) {
    eventsListEl.innerHTML = "";
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

        // Tags coloridas na lista
        const tipoClass = ev.type ? `tag-${ev.type}` : 'tag-outra';
        const tipoLabel = ev.type ? ev.type.charAt(0).toUpperCase() + ev.type.slice(1) : '';

        eventsListEl.innerHTML += `
            <div class="event-item" data-id="${ev.id}">
                <div class="date-badge">
                    <span class="d-num">${dia}</span>
                    <span class="d-month">${monthShort}</span>
                </div>
                <div class="event-info">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        ${ev.type ? `<span class="badge-admin ${tipoClass}" style="font-size:0.7rem; padding:2px 8px; border-radius:4px;">${tipoLabel}</span>` : ''}
                        <h4 style="margin:0;">${ev.title}</h4>
                    </div>
                    
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

const btnPrev = document.getElementById('prevMonth');
const btnNext = document.getElementById('nextMonth');

if(btnPrev) btnPrev.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateInterface(); 
});

if(btnNext) btnNext.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateInterface(); 
});

window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    if(sidebar) sidebar.classList.toggle('open');
}

initRealtimeListener();