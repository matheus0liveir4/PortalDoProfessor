document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://localhost:3000/api/eventos';

    // --- Seleção de Elementos ---
    const calendarBody = document.getElementById('calendar-body');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const eventsListContainer = document.getElementById('events-list-container');
    
    // --- Elementos do Modal ---
    const modal = document.getElementById('event-modal');
    const closeModalBtn = modal.querySelector('.close-modal-btn');
    const addEventSidebarBtn = document.getElementById('add-event-sidebar-btn');
    const eventForm = document.getElementById('event-form');
    const modalTitle = document.getElementById('modal-title');
    const deleteEventBtn = document.getElementById('delete-event-btn');

    let currentDate = new Date();
    let events = []; // Os eventos agora serão carregados da API

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderCalendar() {
        calendarBody.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

        // Dias do mês anterior
        for (let i = firstDayOfMonth; i > 0; i--) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day-cell', 'other-month');
            dayCell.textContent = lastDateOfPrevMonth - i + 1;
            calendarBody.appendChild(dayCell);
        }

        // Dias do mês atual
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day-cell');
            dayCell.textContent = i;
            // O formato da data deve ser YYYY-MM-DD para corresponder ao input e ao banco
            dayCell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add('today');
            }

            const dayEvents = events.filter(e => e.date === dayCell.dataset.date);
            if (dayEvents.length > 0) {
                const pinIcon = document.createElement('i');
                pinIcon.className = `bx bxs-pin pin-icon ${dayEvents[0].type}`;
                dayCell.appendChild(pinIcon);
            }
            calendarBody.appendChild(dayCell);
        }
        renderEventsList();
    }

    function renderEventsList() {
        eventsListContainer.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // A data no JS inclui fuso horário, então comparamos apenas ano e mês
        const monthEvents = events
            .filter(e => {
                const eventDate = new Date(e.date);
                return eventDate.getFullYear() === year && eventDate.getMonth() === month;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (monthEvents.length === 0) {
            eventsListContainer.innerHTML = `
                <div class="no-events-placeholder">
                    <i class='bx bx-calendar-x'></i>
                    <span>Nenhum evento neste mês.</span>
                </div>`;
            return;
        }

        monthEvents.forEach(event => {
            const eventDate = new Date(event.date); // A data já vem no formato certo do DB
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.dataset.eventId = event.id;
            eventItem.innerHTML = `
                <div class="event-date">
                    <div class="day">${eventDate.getUTCDate()}</div>
                    <div class="month">${monthNames[eventDate.getUTCMonth()].substring(0, 3)}</div>
                </div>
                <div class="event-details">
                    <h4>${event.title}</h4>
                    <p>Tipo: ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>
                </div>`;
            eventsListContainer.appendChild(eventItem);
        });
    }

    // --- FUNÇÕES DE INTERAÇÃO COM API ---
    async function fetchEvents() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erro ao buscar eventos');
            events = await response.json();
            renderCalendar();
        } catch (error) {
            console.error(error);
            alert('Não foi possível carregar os eventos.');
        }
    }

    // --- FUNÇÕES DO MODAL ---
    function openModal(date = null, eventToEdit = null) {
        modal.classList.remove('hidden');
        eventForm.reset();
        document.getElementById('event-id').value = '';
        deleteEventBtn.style.display = 'none';

        if(eventToEdit) {
            modalTitle.textContent = 'Editar Evento';
            document.getElementById('event-id').value = eventToEdit.id;
            document.getElementById('event-title').value = eventToEdit.title;
            document.getElementById('event-date').value = eventToEdit.date;
            document.getElementById('event-type').value = eventToEdit.type;
            deleteEventBtn.style.display = 'block';
        } else {
            modalTitle.textContent = 'Adicionar Evento';
            if(date) {
                document.getElementById('event-date').value = date;
            } else {
                // Preenche com a data de hoje se nenhuma data for fornecida
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('event-date').value = today;
            }
        }
    }
    const closeModal = () => modal.classList.add('hidden');
    
    // --- OUVINTES DE EVENTOS (Event Listeners) ---
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    calendarBody.addEventListener('click', e => {
        const dayCell = e.target.closest('.day-cell:not(.other-month)');
        if (dayCell) {
            const date = dayCell.dataset.date;
            const dayEvents = events.filter(ev => ev.date === date);
            openModal(date, dayEvents[0]); // Abre com o primeiro evento do dia, se houver
        }
    });

    addEventSidebarBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    eventForm.addEventListener('submit', async e => {
        e.preventDefault();
        const id = document.getElementById('event-id').value;
        const eventData = {
            title: document.getElementById('event-title').value,
            date: document.getElementById('event-date').value,
            type: document.getElementById('event-type').value,
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            });
            if (!response.ok) throw new Error('Falha ao salvar o evento');
            
            closeModal();
            fetchEvents(); // Recarrega todos os eventos do servidor
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });
    
    deleteEventBtn.addEventListener('click', async () => {
        const id = document.getElementById('event-id').value;
        if(id && confirm('Tem certeza que deseja apagar este evento?')) {
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao apagar o evento');

                closeModal();
                fetchEvents(); // Recarrega todos os eventos do servidor
            } catch(error) {
                console.error(error);
                alert(error.message);
            }
        }
    });
    
    eventsListContainer.addEventListener('click', e => {
        const eventItem = e.target.closest('.event-item');
        if(eventItem) {
            const eventId = parseInt(eventItem.dataset.eventId);
            const eventToEdit = events.find(ev => ev.id === eventId);
            openModal(null, eventToEdit);
        }
    });

    // --- INICIALIZAÇÃO ---
    fetchEvents();
});