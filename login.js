document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // Se o usuário já tem um token, não deveria estar na página de login.
    if (localStorage.getItem('authToken')) {
        window.location.href = '/dashboard.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = ''; 

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer login.');
            }

            // Login bem-sucedido: Salva o token e redireciona
            localStorage.setItem('authToken', data.token);
            window.location.href = '/dashboard.html'; 

        } catch (error) {
            errorMessage.textContent = error.message;
        }
    });
});