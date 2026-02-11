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
    if (!title) return "Geral";
    const t = title.toLowerCase();
    if (t.includes("jovem") || t.includes("jovens")) return "Jovens";
    if (t.includes("adolescente") || t.includes("adolescentes")) return "Adolescentes";
    if (t.includes("varões") || t.includes("homens")) return "Varões";
    if (t.includes("irmãs") || t.includes("mulher") || t.includes("senhoras") || t.includes("círculo")) return "Irmãs";
    if (t.includes("criança") || t.includes("infantil")) return "Crianças";
    return "Geral";
}

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

// --- RENDERIZAR CALENDÁRIO COM CORES ---
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    if (monthYearEl) monthYearEl.innerText = `${monthNames[month]} ${year}`;

    if (daysContainer) {
        daysContainer.innerHTML = "";
        for (let i = 0; i < firstDay; i++) {
            daysContainer.innerHTML += `<div class="day empty"></div>`;
        }

        for (let i = 1; i <= lastDate; i++) {
            const checkDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const eventObj = filteredData.find(e => e.date === checkDate);
            const hasEvent = !!eventObj;
            
            // Lógica de Cor da Bolinha (Prioridade: Local > Setorial > Geral)
            let colorClass = '';
            if (hasEvent) {
                // Normaliza o tipo para minúsculo para bater com o CSS
                const tipo = (eventObj.type || 'outra').toLowerCase();
                colorClass = `type-${tipo}`; // ex: type-local (Azul), type-setorial (Roxo)
            }

            const div = document.createElement('div');
            div.className = `day ${hasEvent ? 'has-event' : ''} ${colorClass}`;
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

function renderEventsForCurrentMonth() {
    if (!eventsListEl) return;
    eventsListEl.innerHTML = "";
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

// --- RENDERIZAR LISTA COM TAGS INTELIGENTES ---
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
        
        // 1. Tag de TIPO (Principal: Local = Azul, Setorial = Roxo)
        const typeRaw = ev.type ? ev.type.toLowerCase() : 'outra';
        const typeLabel = typeRaw.charAt(0).toUpperCase() + typeRaw.slice(1); // Capitalize
        const typeClass = `tag-${typeRaw}`;

        // 2. Tag de DEPARTAMENTO (Secundária)
        const deptName = ev.departamento || detectDepartment(ev.title);
        // Só mostra se NÃO for "Geral"
        const showDeptTag = deptName.toLowerCase() !== 'geral';
        const deptClass = `dept-${deptName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;

        // Montagem do HTML
        let tagsHTML = `<span class="badge ${typeClass}">${typeLabel}</span>`;
        if (showDeptTag) {
            tagsHTML += `<span class="badge ${deptClass}">${deptName}</span>`;
        }

        eventsListEl.innerHTML += `
            <div class="event-item" data-id="${ev.id}">
                <div class="date-badge">
                    <span class="d-num">${dia}</span>
                    <span class="d-month">${monthShort}</span>
                </div>
                <div class="event-info">
                    <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:6px;">
                        ${tagsHTML}
                    </div>
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

const btnPrev = document.getElementById('prevMonth');
const btnNext = document.getElementById('nextMonth');
if(btnPrev) btnPrev.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); updateInterface(); });
if(btnNext) btnNext.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); updateInterface(); });

initRealtimeListener();