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
// PETICIÓN DE ORACIÓN - CORREO
// ================================
async function enviarPeticion() {
    const nombre   = document.getElementById('oracion-nombre').value.trim();
    const peticion = document.getElementById('oracion-peticion').value.trim();
    const mensaje  = document.getElementById('oracion-mensaje');

    if (!nombre) { alert('Por favor ingresa tu nombre 😊'); return; }
    if (!peticion) { alert('Por favor escribe tu petición de oración 🙏'); return; }

    const btn = document.querySelector('.oracion-btn');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        const res = await fetch('/enviar-peticion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, peticion })
        });
        const data = await res.json();

        if (data.ok) {
            mensaje.className = 'oracion-mensaje oracion-ok';
            mensaje.textContent = '🙏 ¡Petición enviada! Nuestro equipo pastoral orará por ti.';
            document.getElementById('oracion-nombre').value = '';
            document.getElementById('oracion-peticion').value = '';
        } else {
            mensaje.className = 'oracion-mensaje oracion-error';
            mensaje.textContent = '❌ Hubo un error al enviar. Inténtalo de nuevo.';
        }
    } catch {
        mensaje.className = 'oracion-mensaje oracion-error';
        mensaje.textContent = '❌ Hubo un error al enviar. Inténtalo de nuevo.';
    } finally {
        btn.disabled = false;
        btn.textContent = '🙏 Enviar Petición de Oración';
        mensaje.style.display = 'block';
        setTimeout(() => { mensaje.style.display = 'none'; }, 6000);
    }
}
