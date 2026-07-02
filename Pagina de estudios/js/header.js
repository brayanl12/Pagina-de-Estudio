// js/header.js - Con efecto scroll y navegación
console.log('🔵 header.js cargado');

// Función global de navegación
function navegarA(page) {
    console.log('Navegando a:', page);
    
    // Ocultar todas las secciones
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar la página seleccionada
    let targetSection = document.getElementById(`page-${page}`);
    
    // Si es cursos, buscar dentro del contenedor
    if (page === 'cursos') {
        const container = document.getElementById('cursos-container');
        if (container) {
            targetSection = container.querySelector('#page-cursos');
        }
    }
    
    // Si es clases, buscar dentro del contenedor
    if (page === 'clases') {
        const container = document.getElementById('clases-container');
        if (container) {
            targetSection = container.querySelector('#page-clases');
        }
    }
    
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Inicializar cursos si es necesario
        if (page === 'cursos' && window.Cursos) {
            setTimeout(() => window.Cursos.init(), 200);
        }
        if (page === 'inicio' && window.renderInicio) {
            setTimeout(() => window.renderInicio(), 100);
        }
        if (page === 'clases' && window.Clases) {
            setTimeout(() => {
                if (window.Clases.renderizarTodo) {
                    window.Clases.renderizarTodo();
                }
            }, 200);
        }
    }

    // Actualizar clase active en el menú
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Header iniciado');
    
    // ===== EFECTO DE SCROLL EN EL HEADER =====
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // ===== NAVEGACIÓN =====
    const initialPage = window.location.hash.replace('#', '') || 'inicio';
    setTimeout(() => navegarA(initialPage), 300);
});