document.addEventListener('DOMContentLoaded', () => {

    // --- SELEÇÃO DE ELEMENTOS ---
    const addMaterialBtn = document.querySelector('.btn-add-material');
    const modal = document.getElementById('material-modal');
    const closeModalBtn = modal.querySelector('.close-modal-btn');
    const cancelBtn = modal.querySelector('#cancel-btn');
    const materialForm = document.getElementById('material-form');
    const modalTitle = document.getElementById('modal-title');
    const materialsContainer = document.querySelector('.materials-container');
    const filterTabs = document.querySelector('.filter-tabs');

    // --- FUNÇÕES DO MODAL ---
    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => {
        modal.classList.add('hidden');
        materialForm.reset();
        document.getElementById('material-id').value = '';
    };

    // --- ABRIR MODAL PARA CRIAR NOVO MATERIAL ---
    addMaterialBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Adicionar Novo Material';
        openModal();
    });

    // --- FECHAR MODAL ---
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    // --- LÓGICA DE SALVAR (CRIAR E EDITAR) ---
    materialForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Coletar dados do formulário
        const id = document.getElementById('material-id').value;
        const title = document.getElementById('material-title').value;
        const description = document.getElementById('material-description').value;
        const category = document.getElementById('material-category').value;
        const type = document.getElementById('material-type').value;
        const size = document.getElementById('material-size').value;
        const link = document.getElementById('material-link').value;
        
        if (id) {
            // EDITAR MATERIAL EXISTENTE
            const cardToUpdate = document.querySelector(`.material-card[data-id='${id}']`);
            if (cardToUpdate) {
                cardToUpdate.querySelector('h3').textContent = title;
                cardToUpdate.querySelector('p').textContent = description;
                cardToUpdate.querySelector('.file-info span:nth-child(1)').textContent = type;
                cardToUpdate.querySelector('.file-info span:nth-child(2)').textContent = size;
                cardToUpdate.querySelector('.btn-download').href = link;
                
                // Mover o card se a categoria mudou
                const currentCategory = cardToUpdate.closest('.material-section').dataset.category;
                if(currentCategory !== category) {
                    const newGrid = document.querySelector(`.material-section[data-category='${category}'] .material-grid`);
                    newGrid.appendChild(cardToUpdate);
                }
            }
        } else {
            // CRIAR NOVO MATERIAL
            const newCard = createMaterialCard({ id: Date.now(), title, description, type, size, link });
            const targetGrid = document.querySelector(`.material-section[data-category='${category}'] .material-grid`);
            if (targetGrid) {
                targetGrid.insertAdjacentHTML('beforeend', newCard);
            }
        }
        closeModal();
    });

    // --- LÓGICA DE AÇÕES NOS CARDS (EDITAR E APAGAR) ---
    materialsContainer.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');

        if (editBtn) {
            const card = editBtn.closest('.material-card');
            const id = card.dataset.id;
            const title = card.querySelector('h3').textContent;
            const description = card.querySelector('p').textContent;
            const type = card.querySelector('.file-info span:nth-child(1)').textContent;
            const size = card.querySelector('.file-info span:nth-child(2)').textContent;
            const category = card.closest('.material-section').dataset.category;
            const link = card.querySelector('.btn-download').href;

            // Preencher o modal
            modalTitle.textContent = 'Editar Material';
            document.getElementById('material-id').value = id;
            document.getElementById('material-title').value = title;
            document.getElementById('material-description').value = description;
            document.getElementById('material-category').value = category;
            document.getElementById('material-type').value = type;
            document.getElementById('material-size').value = size;
            document.getElementById('material-link').value = link;
            
            openModal();
        }

        if (deleteBtn) {
            const card = deleteBtn.closest('.material-card');
            if (confirm('Tem certeza que deseja apagar este material?')) {
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => card.remove(), 300);
            }
        }
    });

    // --- FUNÇÃO PARA CRIAR HTML DO CARD ---
    function createMaterialCard(data) {
        return `
            <article class="material-card" data-id="${data.id}">
                <div class="card-content">
                    <h3>${data.title}</h3>
                    <p>${data.description}</p>
                    <div class="file-info">
                        <span>${data.type}</span><span>${data.size}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon btn-delete" title="Apagar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <a href="${data.link}" class="btn btn-download"><i class="fa-solid fa-download"></i> Download</a>
                </div>
            </article>
        `;
    }

    // --- LÓGICA DOS FILTROS ---
    filterTabs.addEventListener('click', e => {
        e.preventDefault();
        const clickedTab = e.target.closest('.tab-link');
        if (!clickedTab) return;

        // Atualizar estado ativo
        filterTabs.querySelector('.active').classList.remove('active');
        clickedTab.classList.add('active');

        const filterValue = clickedTab.dataset.filter;
        const allSections = document.querySelectorAll('.material-section');

        allSections.forEach(section => {
            if (filterValue === 'todos' || section.dataset.category === filterValue) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    });

});
