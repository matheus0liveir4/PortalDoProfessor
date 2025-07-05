document.addEventListener('DOMContentLoaded', () => {

    const calendarBody = document.getElementById('calendar-body');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const eventsListContainer = document.getElementById('events-list-container');
    
    // Modal Elements
    const modal = document.getElementById('event-modal');
    const closeModalBtn = modal.querySelector('.close-modal-btn');
    const addEventSidebarBtn = document.getElementById('add-event-sidebar-btn');
    const eventForm = document.getElementById('event-form');
    const modalTitle = document.getElementById('modal-title');
    const deleteEventBtn = document.getElementById('delete-event-btn');

    let currentDate = new Date();
    let events = [
        // Exemplo de evento inicial
        { id: 1, title: 'Reunião Pedagógica', date: '2025-07-04', type: 'reuniao' },
        { id: 2, title: 'Entrega de Notas', date: '2025-07-13', type: 'prazo' },
        { id: 3, title: 'Aula de Reforço', date: '2025-07-16', type: 'aula' },
        { id: 4, title: 'Palestra Convidada', date: '2025-07-18', type: 'aula' },
        { id: 5, title: 'Festa Julina', date: '2025-07-24', type: 'pessoal' },
    ];

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

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
        
        const monthEvents = events
            .filter(e => new Date(e.date).getFullYear() === year && new Date(e.date).getMonth() === month)
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
            const eventDate = new Date(event.date);
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.dataset.eventId = event.id;
            eventItem.innerHTML = `
                <div class="event-date">
                    <div class="day">${eventDate.getDate()}</div>
                    <div class="month">${monthNames[eventDate.getMonth()].substring(0, 3)}</div>
                </div>
                <div class="event-details">
                    <h4>${event.title}</h4>
                    <p>Tipo: ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>
                </div>`;
            eventsListContainer.appendChild(eventItem);
        });
    }

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
            if(date) document.getElementById('event-date').value = date;
        }
    }
    const closeModal = () => modal.classList.add('hidden');

    // --- Event Listeners ---
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
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    eventForm.addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('event-id').value;
        const newEvent = {
            id: id ? parseInt(id) : Date.now(),
            title: document.getElementById('event-title').value,
            date: document.getElementById('event-date').value,
            type: document.getElementById('event-type').value,
        };

        if(id) { // Edit
            events = events.map(ev => ev.id === newEvent.id ? newEvent : ev);
        } else { // Add
            events.push(newEvent);
        }
        renderCalendar();
        closeModal();
    });
    
    deleteEventBtn.addEventListener('click', () => {
        const id = document.getElementById('event-id').value;
        if(confirm('Tem certeza que deseja apagar este evento?')) {
            events = events.filter(ev => ev.id !== parseInt(id));
            renderCalendar();
            closeModal();
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

    renderCalendar();
});