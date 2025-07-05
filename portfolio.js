// public/portfolio.js
document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://localhost:3000/api/projetos';

    // --- Seleção de Elementos ---
    const addProjectBtn = document.querySelector('.btn-add-project');
    const modal = document.getElementById('project-modal');
    const closeModalBtn = modal.querySelector('.close-modal-btn');
    const projectForm = document.getElementById('project-form');
    const modalTitle = document.getElementById('modal-title');
    const projectsContainer = document.getElementById('project-sections-container');

    // --- Funções do Modal ---
    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => {
        modal.classList.add('hidden');
        projectForm.reset();
        document.getElementById('project-id').value = '';
    };
    
    // --- FUNÇÕES DE RENDERIZAÇÃO E DADOS ---
    function updateProjectCounts() {
        document.querySelectorAll('.portfolio-summary .count').forEach(counter => {
            const category = counter.dataset.countFor;
            const count = document.querySelectorAll(`.project-section[data-category='${category}'] .project-item`).length;
            counter.textContent = count;
        });
    }
    
    function createProjectHTML(data) {
        const statusClass = data.status === 'concluido' ? 'status-concluido' : 'status-andamento';
        const categoryText = data.categoria.charAt(0).toUpperCase() + data.categoria.slice(1);
        const statusText = `${categoryText} ${data.status === 'concluido' ? 'Concluído' : 'Em Andamento'}`;
        
        // Converte a string de tags do DB em um array para renderização
        const tagsArray = typeof data.tags === 'string' ? data.tags.split(',').filter(Boolean) : (data.tags || []);
        const tagsHTML = tagsArray.map(tag => `<span>${tag.trim()}</span>`).join('');
        const linkHTML = data.link_externo ? `<a href="${data.link_externo}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-external-link-alt"></i></a>` : '';
        
        return `
            <article class="project-item" data-id="${data.id}">
                <div class="timeline"><div class="dot"></div></div>
                <div class="project-details">
                    <div class="project-actions">
                        <button class="btn-icon btn-edit" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon btn-delete" title="Apagar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <h3>${data.titulo}</h3>
                    <p>${data.descricao}</p>
                    <div class="tags">${tagsHTML}</div>
                    <div class="meta-info">
                        <span><i class="fa-solid fa-calendar-alt"></i> ${data.periodo}</span>
                        ${linkHTML}
                    </div>
                </div>
            </article>`;
    }

    async function fetchAndRenderProjects() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erro ao buscar projetos');
            const projetos = await response.json();

            // Limpa todas as listas de projetos existentes
            document.querySelectorAll('.project-list').forEach(list => list.innerHTML = '');

            projetos.forEach(projeto => {
                const projectHTML = createProjectHTML(projeto);
                const targetList = document.querySelector(`.project-section[data-category='${projeto.categoria}'] .project-list`);
                if(targetList) {
                    targetList.insertAdjacentHTML('beforeend', projectHTML);
                }
            });

            updateProjectCounts();
        } catch (error) {
            console.error(error);
            alert('Não foi possível carregar os projetos.');
        }
    }

    // --- OUVINTES DE EVENTOS (Event Listeners) ---
    addProjectBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Adicionar Novo Projeto';
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    projectsContainer.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        const projectItem = e.target.closest('.project-item');

        if (!projectItem) return;
        const id = projectItem.dataset.id;

        if (editBtn) {
            modalTitle.textContent = 'Editar Projeto';
            document.getElementById('project-id').value = id;
            document.getElementById('project-title').value = projectItem.querySelector('h3').textContent;
            document.getElementById('project-description').value = projectItem.querySelector('p').textContent;
            document.getElementById('project-category').value = projectItem.closest('.project-section').dataset.category;
            document.getElementById('project-status').value = projectItem.querySelector('.status-badge').classList.contains('status-concluido') ? 'concluido' : 'andamento';
            document.getElementById('project-tags').value = Array.from(projectItem.querySelectorAll('.tags span')).map(tag => tag.textContent).join(', ');
            document.getElementById('project-period').value = projectItem.querySelector('.meta-info span').innerText.trim();
            document.getElementById('project-link').value = projectItem.querySelector('.meta-info a')?.href || '';
            openModal();
        }

        if (deleteBtn) {
            if (confirm('Tem certeza que deseja apagar este projeto?')) {
                fetch(`${API_URL}/${id}`, { method: 'DELETE' })
                    .then(response => {
                        if (!response.ok) throw new Error('Falha ao apagar projeto');
                        projectItem.style.transition = 'opacity 0.3s, transform 0.3s';
                        projectItem.style.opacity = '0';
                        projectItem.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            projectItem.remove();
                            updateProjectCounts();
                        }, 300);
                    })
                    .catch(error => {
                        console.error(error);
                        alert(error.message);
                    });
            }
        }
    });

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('project-id').value;
        const projectData = {
            titulo: document.getElementById('project-title').value,
            descricao: document.getElementById('project-description').value,
            categoria: document.getElementById('project-category').value,
            status: document.getElementById('project-status').value,
            // Envia as tags como um array, o backend vai converter para string
            tags: document.getElementById('project-tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
            periodo: document.getElementById('project-period').value,
            link_externo: document.getElementById('project-link').value
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData),
            });
            if (!response.ok) throw new Error('Falha ao salvar o projeto');

            closeModal();
            fetchAndRenderProjects(); // Recarrega todos os projetos do servidor
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });
    
    // --- INICIALIZAÇÃO ---
    fetchAndRenderProjects();
});