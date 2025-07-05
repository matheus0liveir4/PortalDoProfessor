// public/materiais.js
document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://localhost:3000/api/materiais';

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

    // --- CARREGAR E RENDERIZAR MATERIAIS ---
    const fetchAndRenderMaterials = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erro ao buscar dados da API');
            const materiais = await response.json();

            // Limpa todos os grids antes de renderizar
            document.querySelectorAll('.material-grid').forEach(grid => grid.innerHTML = '');

            if (materiais.length === 0) {
                // Opcional: Mostrar uma mensagem se não houver materiais
                console.log('Nenhum material encontrado.');
                return;
            }

            // Adiciona cada material ao seu respectivo grid de categoria
            materiais.forEach(material => {
                const cardHTML = createMaterialCard(material);
                const targetGrid = document.querySelector(`.material-section[data-category='${material.categoria}'] .material-grid`);
                if (targetGrid) {
                    targetGrid.insertAdjacentHTML('beforeend', cardHTML);
                }
            });
        } catch (error) {
            console.error('Falha ao carregar materiais:', error);
            // Poderia mostrar uma mensagem de erro na tela para o usuário
        }
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

    // --- LÓGICA DE SALVAR (CRIAR E EDITAR) VIA API ---
    materialForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('material-id').value;
        const materialData = {
            titulo: document.getElementById('material-title').value,
            descricao: document.getElementById('material-description').value,
            categoria: document.getElementById('material-category').value,
            tipo_arquivo: document.getElementById('material-type').value,
            tamanho_arquivo: document.getElementById('material-size').value,
            link_download: document.getElementById('material-link').value,
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(materialData),
            });

            if (!response.ok) throw new Error(`Erro ao ${id ? 'atualizar' : 'criar'} material.`);
            
            closeModal();
            fetchAndRenderMaterials(); // Recarrega os materiais para exibir a mudança
        } catch (error) {
            console.error('Erro ao salvar material:', error);
            alert(`Falha ao salvar. ${error.message}`);
        }
    });

    // --- LÓGICA DE AÇÕES NOS CARDS (EDITAR E APAGAR) ---
    materialsContainer.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        const card = e.target.closest('.material-card');

        if (!card) return;
        const id = card.dataset.id;

        if (editBtn) {
            // A lógica de preencher o modal pode continuar a mesma,
            // pois os dados já estão no card.
            modalTitle.textContent = 'Editar Material';
            document.getElementById('material-id').value = id;
            document.getElementById('material-title').value = card.querySelector('h3').textContent;
            document.getElementById('material-description').value = card.querySelector('p').textContent;
            document.getElementById('material-category').value = card.closest('.material-section').dataset.category;
            document.getElementById('material-type').value = card.querySelector('.file-info span:nth-child(1)').textContent;
            document.getElementById('material-size').value = card.querySelector('.file-info span:nth-child(2)').textContent;
            document.getElementById('material-link').value = card.querySelector('.btn-download').href;
            
            openModal();
        }

        if (deleteBtn) {
            if (confirm('Tem certeza que deseja apagar este material?')) {
                try {
                    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Erro ao apagar o material no servidor.');
                    
                    // Animação e remoção do DOM
                    card.style.transition = 'opacity 0.3s, transform 0.3s';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => card.remove(), 300);

                } catch (error) {
                    console.error('Erro ao apagar:', error);
                    alert(`Falha ao apagar. ${error.message}`);
                }
            }
        }
    });

    // --- FUNÇÃO PARA CRIAR HTML DO CARD ---
    function createMaterialCard(data) {
        return `
            <article class="material-card" data-id="${data.id}">
                <div class="card-content">
                    <h3>${data.titulo}</h3>
                    <p>${data.descricao}</p>
                    <div class="file-info">
                        <span>${data.tipo_arquivo}</span><span>${data.tamanho_arquivo}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon btn-delete" title="Apagar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <a href="${data.link_download}" class="btn btn-download" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-download"></i> Download</a>
                </div>
            </article>
        `;
    }

    // --- LÓGICA DOS FILTROS ---
    filterTabs.addEventListener('click', e => {
        e.preventDefault();
        const clickedTab = e.target.closest('.tab-link');
        if (!clickedTab) return;

        filterTabs.querySelector('.active').classList.remove('active');
        clickedTab.classList.add('active');

        const filterValue = clickedTab.dataset.filter;
        document.querySelectorAll('.material-section').forEach(section => {
            section.style.display = (filterValue === 'todos' || section.dataset.category === filterValue) ? 'block' : 'none';
        });
    });

    // --- INICIALIZAÇÃO ---
    fetchAndRenderMaterials();
});