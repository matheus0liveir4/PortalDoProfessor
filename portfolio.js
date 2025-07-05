document.addEventListener('DOMContentLoaded', () => {

    const addProjectBtn = document.querySelector('.btn-add-project');
    const modal = document.getElementById('project-modal');
    const closeModalBtn = modal.querySelector('.close-modal-btn');
    const projectForm = document.getElementById('project-form');
    const modalTitle = document.getElementById('modal-title');
    const projectsContainer = document.getElementById('project-sections-container');

    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => {
        modal.classList.add('hidden');
        projectForm.reset();
        document.getElementById('project-id').value = '';
    };
    
    // --- ATUALIZAR CONTAGEM DE PROJETOS ---
    function updateProjectCounts() {
        document.querySelectorAll('.portfolio-summary .count').forEach(counter => {
            const category = counter.dataset.countFor;
            const count = document.querySelectorAll(`.project-section[data-category='${category}'] .project-item`).length;
            counter.textContent = count;
        });
    }

    // --- ABRIR MODAL PARA CRIAR PROJETO ---
    addProjectBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Adicionar Novo Projeto';
        openModal();
    });

    // --- FECHAR MODAL ---
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    // --- LÓGICA DE AÇÕES NOS PROJETOS (EDITAR E APAGAR) ---
    projectsContainer.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');

        if (editBtn) {
            const projectItem = editBtn.closest('.project-item');
            const id = projectItem.dataset.id;
            const title = projectItem.querySelector('h3').textContent;
            const description = projectItem.querySelector('p').textContent;
            const category = projectItem.closest('.project-section').dataset.category;
            const status = projectItem.querySelector('.status-badge').classList.contains('status-concluido') ? 'concluido' : 'andamento';
            const tags = Array.from(projectItem.querySelectorAll('.tags span')).map(tag => tag.textContent).join(', ');
            const period = projectItem.querySelector('.meta-info span').innerText;
            const link = projectItem.querySelector('.meta-info a')?.href || '';

            modalTitle.textContent = 'Editar Projeto';
            document.getElementById('project-id').value = id;
            document.getElementById('project-title').value = title;
            document.getElementById('project-description').value = description;
            document.getElementById('project-category').value = category;
            document.getElementById('project-status').value = status;
            document.getElementById('project-tags').value = tags;
            document.getElementById('project-period').value = period;
            document.getElementById('project-link').value = link;

            openModal();
        }

        if (deleteBtn) {
            const projectItem = deleteBtn.closest('.project-item');
            if (confirm('Tem certeza que deseja apagar este projeto?')) {
                projectItem.style.transition = 'opacity 0.3s, transform 0.3s';
                projectItem.style.opacity = '0';
                projectItem.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    projectItem.remove();
                    updateProjectCounts();
                }, 300);
            }
        }
    });

    // --- LÓGICA PARA SALVAR (CRIAR E EDITAR) ---
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const projectData = {
            id: document.getElementById('project-id').value,
            title: document.getElementById('project-title').value,
            description: document.getElementById('project-description').value,
            category: document.getElementById('project-category').value,
            status: document.getElementById('project-status').value,
            tags: document.getElementById('project-tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
            period: document.getElementById('project-period').value,
            link: document.getElementById('project-link').value
        };

        if (projectData.id) {
            // EDITAR
            const projectItem = document.querySelector(`.project-item[data-id='${projectData.id}']`);
            if(projectItem) {
                // Se a categoria mudou, move o elemento
                const currentCategory = projectItem.closest('.project-section').dataset.category;
                if(currentCategory !== projectData.category) {
                     const newParent = document.querySelector(`.project-section[data-category='${projectData.category}'] .project-list`);
                     projectItem.remove(); // Remove do DOM antigo
                     const newHTML = createProjectHTML(projectData); // Cria o novo HTML
                     newParent.insertAdjacentHTML('beforeend', newHTML); // Adiciona ao novo local
                } else {
                     // Apenas atualiza o conteúdo
                     projectItem.innerHTML = createProjectHTML(projectData, true);
                }
            }
        } else {
            // CRIAR
            projectData.id = Date.now();
            const projectHTML = createProjectHTML(projectData);
            const targetList = document.querySelector(`.project-section[data-category='${projectData.category}'] .project-list`);
            targetList.insertAdjacentHTML('beforeend', projectHTML);
        }
        
        updateProjectCounts();
        closeModal();
    });
    
    // --- FUNÇÃO PARA CRIAR O HTML DE UM PROJETO ---
    function createProjectHTML(data, innerOnly = false) {
        const statusClass = data.status === 'concluido' ? 'status-concluido' : 'status-andamento';
        const statusText = `${data.category.charAt(0).toUpperCase() + data.category.slice(1)} ${data.status === 'concluido' ? 'Concluído' : 'Em Andamento'}`;
        const tagsHTML = data.tags.map(tag => `<span>${tag}</span>`).join('');
        const linkHTML = data.link ? `<a href="${data.link}" target="_blank"><i class="fa-solid fa-external-link-alt"></i></a>` : '';
        
        const innerHTML = `
            <div class="timeline"><div class="dot"></div></div>
            <div class="project-details">
                <div class="project-actions">
                    <button class="btn-icon btn-edit" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon btn-delete" title="Apagar"><i class="fa-solid fa-trash"></i></button>
                </div>
                <span class="status-badge ${statusClass}">${statusText}</span>
                <h3>${data.title}</h3>
                <p>${data.description}</p>
                <div class="tags">${tagsHTML}</div>
                <div class="meta-info">
                    <span><i class="fa-solid fa-calendar-alt"></i> ${data.period}</span>
                    ${linkHTML}
                </div>
            </div>`;
            
        return innerOnly ? innerHTML.replace('<div class="timeline"><div class="dot"></div></div>', '') : `<article class="project-item" data-id="${data.id}">${innerHTML}</article>`;
    }
    
    // Inicializar contagem
    updateProjectCounts();
});