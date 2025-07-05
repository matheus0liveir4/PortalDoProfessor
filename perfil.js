document.addEventListener('DOMContentLoaded', function() {
    // --- NOVO: Lógica para Edição do Perfil ---
    const toggleEditButton = document.getElementById('toggleEditButton');
    const formInputs = document.querySelectorAll('.profile-input');
    
    // Mantém o estado atual (se estamos em modo de edição ou não)
    let isEditMode = false;

    toggleEditButton.addEventListener('click', function() {
        // Alterna o modo de edição
        isEditMode = !isEditMode;

        // Habilita ou desabilita todos os inputs
        formInputs.forEach(input => {
            input.disabled = !isEditMode;
        });

        // Altera a aparência e o texto do botão
        if (isEditMode) {
            // Entrou no modo de edição
            this.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Alterações';
            this.classList.remove('btn-primary');
            this.classList.add('btn-success'); // Muda a cor para verde
            
            // Foca no primeiro campo do formulário para melhor UX
            if(formInputs.length > 0) {
                formInputs[0].focus();
            }
        } else {
            // Saiu do modo de edição (salvou)
            this.innerHTML = '<i class="fa-solid fa-pencil"></i> Editar Perfil';
            this.classList.remove('btn-success');
            this.classList.add('btn-primary'); // Volta a cor para azul
            
            // Aqui você adicionaria a lógica para enviar os dados para o servidor
            console.log('Alterações salvas (simulação).');
            alert('Perfil atualizado com sucesso!');
        }
    });

});