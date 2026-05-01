// Intersection Observer para animaciones
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Observar cards de servicios
    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
    // Observar cards de pastores
    document.querySelectorAll('.pastor-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        observer.observe(card);
    });
    // Observar cards de eventos
    document.querySelectorAll('.event-visual-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.pageYOffset > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // Parallax effect para hero decoration
    window.addEventListener('scroll', () => {
        const decoration = document.querySelector('.hero-decoration');
        if (decoration) {
            decoration.style.transform = `translateY(${window.pageYOffset * 0.5}px)`;
        }
    });
});

// ================================
// PETICIÓN DE ORACIÓN - WHATSAPP
// ================================
function enviarPeticion() {
    const nombre = document.getElementById('oracion-nombre').value.trim();
    const peticion = document.getElementById('oracion-peticion').value.trim();

    if (!nombre) {
        alert('Por favor ingresa tu nombre 😊');
        return;
    }
    if (!peticion) {
        alert('Por favor escribe tu petición de oración 🙏');
        return;
    }

    const numero = '56993976371';
    const mensaje = `🙏 *PETICIÓN DE ORACIÓN - ICTUE LAMPA*\n\n*Nombre:* ${nombre}\n\n*Petición:* ${peticion}`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank');
}
