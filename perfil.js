// public/js/perfil.js
document.addEventListener('DOMContentLoaded', function() {
    // Importante: Chama a função para proteger a página
    protectPage();

    // --- Seleção dos Elementos ---
    const toggleEditButton = document.getElementById('toggleEditButton');
    const formInputs = document.querySelectorAll('.profile-input');
    const profileData = {}; // Objeto para guardar os dados dos inputs

    let isEditMode = false;

    // --- FUNÇÕES ---
    async function loadProfile() {
        try {
            const response = await fetch('/api/auth/profile');
            if (!response.ok) {
                if(response.status === 401) logout(); // Se token inválido, desloga
                throw new Error('Não foi possível carregar o perfil.');
            }
            const user = await response.json();

            // Preenche os campos do formulário
            document.getElementById('nome').value = user.nome || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('cargo').value = user.cargo || '';
            document.getElementById('bio').value = user.biografia || '';
            document.getElementById('linkedin1').value = user.linkedin_url || '';
            document.getElementById('github').value = user.github_url || '';
            document.getElementById('lattes').value = user.lattes_url || '';
            document.getElementById('website').value = user.website_url || '';

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    async function saveProfile() {
        // Coleta os dados dos inputs
        const updatedData = {
            nome: document.getElementById('nome').value,
            cargo: document.getElementById('cargo').value,
            biografia: document.getElementById('bio').value,
            linkedin_url: document.getElementById('linkedin1').value,
            github_url: document.getElementById('github').value,
            lattes_url: document.getElementById('lattes').value,
            website_url: document.getElementById('website').value,
        };

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Erro ao salvar.');
            
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    // --- LÓGICA DO BOTÃO ---
    toggleEditButton.addEventListener('click', function() {
        isEditMode = !isEditMode;

        formInputs.forEach(input => {
            input.disabled = !isEditMode;
        });

        if (isEditMode) {
            this.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Alterações';
            this.classList.replace('btn-primary', 'btn-success');
            if(formInputs.length > 0) formInputs[0].focus();
        } else {
            // Se saiu do modo de edição, salva os dados
            saveProfile();
            this.innerHTML = '<i class="fa-solid fa-pencil"></i> Editar Perfil';
            this.classList.replace('btn-success', 'btn-primary');
        }
    });

    // Carrega o perfil ao iniciar a página
    loadProfile();
});