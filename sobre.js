document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.profile-nav-summary a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Calcula a posição do elemento e subtrai um pouco para não colar no topo
                const headerOffset = 90; // Espaço para o cabeçalho, se ele for fixo
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});