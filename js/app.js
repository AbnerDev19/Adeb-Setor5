import { db, collection, onSnapshot, query, orderBy } from './firebase-config.js';

let eventsData = [];
let filteredData = [];
let currentDate = new Date();

// Elementos DOM
const monthYearEl = document.getElementById('monthYear');
const daysContainer = document.getElementById('daysContainer');
const eventsListEl = document.getElementById('eventsList');
const filterDept = document.getElementById('filterDept');
const filterIgreja = document.getElementById('filterIgreja');
const btnClear = document.getElementById('btnClearFilters');
const btnToggleSidebar = document.getElementById('btnToggleSidebar'); // Botão sidebar

// --- INICIALIZAÇÃO ---
function initRealtimeListener() {
    const q = query(collection(db, "eventos"), orderBy("date"));

    onSnapshot(q, (snapshot) => {
        eventsData = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            eventsData.push({
                id: doc.id,
                ...data,
                _searchTitle: (data.title || "").toLowerCase(),
                _searchLoc: (data.location || "").toLowerCase(),
                _dept: (data.departamento || detectDepartment(data.title)).toLowerCase()
            });
        });
        applyFilters();
    });
}

function detectDepartment(title) {
    if (!title) return "geral";
    const t = title.toLowerCase();
    if (t.includes("jovem") || t.includes("jovens")) return "Jovens";
    if (t.includes("adolescente") || t.includes("adolescentes")) return "Adolescentes";
    if (t.includes("varões") || t.includes("homens")) return "Varões";
    if (t.includes("irmãs") || t.includes("mulher") || t.includes("senhoras") || t.includes("círculo")) return "Irmãs";
    if (t.includes("criança") || t.includes("infantil")) return "Crianças";
    return "Geral";
}

// --- LÓGICA DE FILTROS ---
function applyFilters() {
    const deptValue = filterDept ? filterDept.value.toLowerCase() : "";
    const locValue = filterIgreja ? filterIgreja.value.toLowerCase() : "";

    filteredData = eventsData.filter(ev => {
        const matchDept = deptValue === "" || ev._dept.includes(deptValue) || ev._searchTitle.includes(deptValue);
        const matchLoc = locValue === "" || ev._searchLoc.includes(locValue);
        return matchDept && matchLoc;
    });

    updateInterface();
}

if (filterDept) filterDept.addEventListener('change', applyFilters);
if (filterIgreja) filterIgreja.addEventListener('change', applyFilters);
if (btnClear) {
    btnClear.addEventListener('click', () => {
        filterDept.value = "";
        filterIgreja.value = "";
        applyFilters();
    });
}

function updateInterface() {
    renderCalendar();
    renderEventsForCurrentMonth();
}

// --- CALENDÁRIO (CORRIGIDO) ---
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    if (monthYearEl) monthYearEl.innerText = `${monthNames[month]} ${year}`;

    if (daysContainer) {
        daysContainer.innerHTML = ""; // Limpa tudo

        // Dias vazios (padding)
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = "day empty";
            daysContainer.appendChild(emptyDiv);
        }

        // Dias do mês
        for (let i = 1; i <= lastDate; i++) {
            const checkDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const eventObj = filteredData.find(e => e.date === checkDate);
            const hasEvent = !!eventObj;

            let typeClass = '';
            if (hasEvent && eventObj.type) {
                typeClass = `type-${eventObj.type}`;
            }

            const div = document.createElement('div');
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

// --- LISTAGEM DE EVENTOS ---
function renderEventsForCurrentMonth() {
    if (!eventsListEl) return;

    const viewYear = currentDate.getFullYear();
    const viewMonth = currentDate.getMonth();

    const list = filteredData.filter(ev => {
        const [ano, mes, dia] = ev.date.split('-').map(Number);
        return ano === viewYear && (mes - 1) === viewMonth;
    });

    renderListHTML(list, `Eventos de ${monthYearEl.innerText}`);
}

function renderEventsByDay(dateString) {
    const list = filteredData.filter(e => e.date === dateString);
    const [ano, mes, dia] = dateString.split('-');
    renderListHTML(list, `Eventos do dia ${dia}/${mes}`);
}

function renderListHTML(list, titleOverride = null) {
    eventsListEl.innerHTML = "";
    const cardTitle = document.querySelector('.card-title');
    if (cardTitle && titleOverride) cardTitle.innerText = titleOverride;

    if (list.length === 0) {
        eventsListEl.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--text-secondary); font-style: italic;">Nenhum evento encontrado.</div>`;
        return;
    }

    list.forEach(ev => {
                const [ano, mes, dia] = ev.date.split('-');
                const dateObj = new Date(ano, mes - 1, dia);
                const monthShort = dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');

                const typeClass = ev.type ? `tag-${ev.type}` : 'tag-outra';
                const typeLabel = ev.type ? ev.type.charAt(0).toUpperCase() + ev.type.slice(1) : '';
                const deptName = ev.departamento || detectDepartment(ev.title);
                const deptClass = `dept-${deptName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;

                eventsListEl.innerHTML += `
            <div class="event-item" data-id="${ev.id}">
                <div class="date-badge">
                    <span class="d-num">${dia}</span>
                    <span class="d-month">${monthShort}</span>
                </div>
                <div class="event-info">
                    <div style="display:flex; flex-wrap:wrap; align-items:center; gap:5px; margin-bottom:6px;">
                        ${ev.type ? `<span class="badge-admin ${typeClass}" style="font-size:0.7rem; padding:2px 8px; border-radius:4px;">${typeLabel}</span>` : ''}
                        <span class="tag-dept ${deptClass}">${deptName}</span>
                    </div>
                    <h4 style="margin:0; line-height:1.2;">${ev.title}</h4>
                    <div class="event-meta" style="margin-top: 5px;">
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

// --- NAVEGAÇÃO E SIDEBAR ---
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

// Sidebar Toggle (Corrigido)
if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        if(sidebar) sidebar.classList.toggle('open');
    });
}

// Inicializa
initRealtimeListener();