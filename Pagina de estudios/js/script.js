// js/script.js - Con animaciones, frases motivacionales y videos
console.log('🟢 script.js cargado');

// ================================================
// ===== FRASES MOTIVACIONALES =====
// ================================================

const frasesMotivacionales = [
    {
        texto: "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito. Si amas lo que estás haciendo, tendrás éxito.",
        autor: "Albert Schweitzer"
    },
    {
        texto: "La educación es el arma más poderosa que puedes usar para cambiar el mundo.",
        autor: "Nelson Mandela"
    },
    {
        texto: "El único modo de hacer un gran trabajo es amar lo que haces.",
        autor: "Steve Jobs"
    },
    {
        texto: "No importa lo lento que vayas, mientras no te detengas.",
        autor: "Confucio"
    },
    {
        texto: "El aprendizaje es un tesoro que seguirá a su dueño a todas partes.",
        autor: "Proverbio chino"
    },
    {
        texto: "La mente que se abre a una nueva idea nunca volverá a su tamaño original.",
        autor: "Albert Einstein"
    },
    {
        texto: "El conocimiento es poder. La información es liberadora. La educación es la premisa del progreso.",
        autor: "Kofi Annan"
    },
    {
        texto: "Cada día sabemos más y entendemos menos. Esa es la paradoja del conocimiento.",
        autor: "Albert Einstein"
    },
    {
        texto: "El estudio es el alimento del alma, el conocimiento es la luz de la mente.",
        autor: "Séneca"
    },
    {
        texto: "No hay atajos para el éxito. Es el resultado de la preparación, el trabajo duro y el aprendizaje constante.",
        autor: "Colin Powell"
    }
];

const frasesCortas = [
    "El conocimiento es poder",
    "Aprender es crecer",
    "Cada día es una oportunidad",
    "El esfuerzo siempre vale la pena",
    "La educación es la clave del éxito",
    "Nunca dejes de aprender",
    "El estudio es el camino al progreso",
    "La curiosidad es el motor del aprendizaje"
];

function cambiarFrase() {
    const textEl = document.getElementById('fraseMotivacional');
    const authorEl = document.getElementById('autorFrase');
    
    if (!textEl || !authorEl) return;
    
    let nuevaFrase;
    let intentos = 0;
    do {
        const randomIndex = Math.floor(Math.random() * frasesMotivacionales.length);
        nuevaFrase = frasesMotivacionales[randomIndex];
        intentos++;
    } while (nuevaFrase.texto === textEl.textContent && frasesMotivacionales.length > 1 && intentos < 20);
    
    textEl.style.opacity = '0';
    authorEl.style.opacity = '0';
    
    setTimeout(() => {
        textEl.textContent = `"${nuevaFrase.texto}"`;
        authorEl.textContent = `— ${nuevaFrase.autor}`;
        textEl.style.opacity = '1';
        authorEl.style.opacity = '1';
    }, 300);
}

function cambiarFraseMini() {
    const el = document.getElementById('fraseMotivacionalMini');
    if (!el) return;
    
    let nuevaFrase;
    do {
        nuevaFrase = frasesCortas[Math.floor(Math.random() * frasesCortas.length)];
    } while (nuevaFrase === el.textContent && frasesCortas.length > 1);
    
    el.style.opacity = '0';
    setTimeout(() => {
        el.textContent = `"${nuevaFrase}"`;
        el.style.opacity = '1';
    }, 300);
}

// ================================================
// ===== SALUDO POR HORA =====
// ================================================

function getGreeting() {
    const hour = new Date().getHours();
    let greeting, emoji;
    
    if (hour >= 5 && hour < 12) {
        greeting = 'Buenos días';
        emoji = '☀️';
    } else if (hour >= 12 && hour < 18) {
        greeting = 'Buenas tardes';
        emoji = '🌤️';
    } else if (hour >= 18 && hour < 22) {
        greeting = 'Buenas noches';
        emoji = '🌙';
    } else {
        greeting = 'Buenas noches';
        emoji = '🌙';
    }
    
    return { greeting, emoji };
}

// ================================================
// ===== SISTEMA DE NIVELES =====
// ================================================

function getLevel(xp) {
    const levels = [
        { min: 0, title: 'Explorador', emoji: '🌱' },
        { min: 100, title: 'Aprendiz', emoji: '📖' },
        { min: 300, title: 'Estudiante', emoji: '📚' },
        { min: 600, title: 'Académico', emoji: '🎓' },
        { min: 1000, title: 'Maestro', emoji: '🏆' },
        { min: 1500, title: 'Sabio', emoji: '🧠' },
        { min: 2000, title: 'Leyenda', emoji: '⭐' }
    ];
    
    let currentLevel = levels[0];
    let nextLevel = levels[1];
    
    for (let i = 0; i < levels.length; i++) {
        if (xp >= levels[i].min) {
            currentLevel = levels[i];
            nextLevel = levels[i + 1] || levels[i];
        }
    }
    
    const currentMin = currentLevel.min;
    const nextMin = nextLevel.min;
    const xpInLevel = xp - currentMin;
    const xpNeeded = nextMin - currentMin;
    const progress = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;
    
    return {
        current: currentLevel,
        next: nextLevel,
        progress: progress,
        xp: xp,
        xpInLevel: xpInLevel,
        xpNeeded: xpNeeded
    };
}

function calculateXP(data) {
    let xp = 0;
    data.materias.forEach(m => {
        xp += (m.nota || 0) * 10;
        xp += (m.materiales?.length || 0) * 5;
        if (m.nota >= 6) xp += 20;
    });
    return Math.round(xp);
}

// ================================================
// ===== MISIÓN DEL DÍA =====
// ================================================

function getDailyMission() {
    const missions = [
        { text: 'Completa 1 material de estudio', reward: '10 XP', emoji: '📄' },
        { text: 'Estudia durante 30 minutos', reward: '15 XP', emoji: '⏰' },
        { text: 'Revisa una materia que tengas pendiente', reward: '20 XP', emoji: '📚' },
        { text: 'Completa todas las tareas del día', reward: '25 XP', emoji: '✅' },
        { text: 'Lee un nuevo material', reward: '10 XP', emoji: '📖' }
    ];
    
    const day = new Date().getDate();
    const index = day % missions.length;
    return missions[index];
}

// ================================================
// ===== PRÓXIMA CLASE =====
// ================================================

function getNextClass() {
    const clases = [
        { name: 'Matemáticas', time: '14:30', emoji: '📐', teacher: 'Dr. Rodríguez' },
        { name: 'Física', time: '10:00', emoji: '⚛️', teacher: 'Dr. Martínez' },
        { name: 'Química', time: '16:00', emoji: '🧪', teacher: 'Dra. López' },
        { name: 'Programación', time: '09:00', emoji: '💻', teacher: 'Ing. Gómez' }
    ];
    
    const hour = new Date().getHours();
    if (hour < 10) return clases[0];
    if (hour < 12) return clases[1];
    if (hour < 16) return clases[2];
    return clases[3];
}

// ================================================
// ===== VIDEOS (ARCHIVOS LOCALES) =====
// ================================================

const VIDEOS_KEY = 'estudio_videos';

// Variable global para el video seleccionado
window.videoArchivoSeleccionado = null;

// Función para manejar la selección del video
window.handleVideoSelect = function(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    
    console.log('🎬 Video seleccionado:', file ? file.name : 'ninguno');
    
    if (!file) {
        document.getElementById('video-file-name-display').style.display = 'none';
        window.videoArchivoSeleccionado = null;
        return;
    }
    
    // Validar tamaño (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        alert(`⚠️ El video es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)} MB). El límite es 50 MB.`);
        fileInput.value = '';
        document.getElementById('video-file-name-display').style.display = 'none';
        window.videoArchivoSeleccionado = null;
        return;
    }
    
    // Validar tipo de video
    const tiposPermitidos = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (!tiposPermitidos.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi|mkv|flv|wmv)$/i)) {
        alert('⚠️ Formato de video no permitido. Solo se aceptan: MP4, WebM, MOV, AVI, MKV, FLV, WMV');
        fileInput.value = '';
        document.getElementById('video-file-name-display').style.display = 'none';
        window.videoArchivoSeleccionado = null;
        return;
    }
    
    // Guardar el archivo
    window.videoArchivoSeleccionado = file;
    document.getElementById('video-file-name-display').style.display = 'block';
    document.getElementById('video-file-name-text').textContent = file.name + ' (' + (file.size / 1024 / 1024).toFixed(2) + ' MB)';
    console.log('✅ Video guardado correctamente:', file.name);
};

// Función para subir video (archivo)
function subirVideoArchivo() {
    const titulo = document.getElementById('video-titulo').value.trim();
    const descripcion = document.getElementById('video-descripcion').value.trim();
    const categoria = document.getElementById('video-categoria').value;
    const archivo = window.videoArchivoSeleccionado;
    
    if (!titulo) {
        alert('Ingresa un título para el video');
        document.getElementById('video-titulo').focus();
        return;
    }
    
    if (!archivo) {
        alert('Selecciona un archivo de video');
        return;
    }
    
    // Mostrar loading
    const btn = document.querySelector('#modal-subir-video .btn-success');
    const originalText = btn ? btn.innerHTML : 'Subir Video';
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        btn.disabled = true;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const videoData = e.target.result;
        
        const videos = cargarVideos();
        const nuevoVideo = {
            id: Date.now(),
            titulo: titulo,
            url: videoData,
            descripcion: descripcion || 'Sin descripción',
            categoria: categoria,
            fecha: new Date().toISOString(),
            nombreArchivo: archivo.name,
            tamanio: archivo.size,
            tipo: archivo.type,
            vistas: 0
        };
        
        videos.push(nuevoVideo);
        guardarVideos(videos);
        renderVideos();
        cerrarModalSubirVideo();
        
        // Limpiar variables
        window.videoArchivoSeleccionado = null;
        document.getElementById('video-file-input').value = '';
        document.getElementById('video-file-name-display').style.display = 'none';
        
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
        
        alert('✅ Video subido correctamente');
    };
    
    reader.onerror = function() {
        alert('❌ Error al leer el archivo. Intenta nuevamente.');
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };
    
    reader.readAsDataURL(archivo);
}

function cargarVideos() {
    const stored = localStorage.getItem(VIDEOS_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return [];
        }
    }
    return [];
}

function guardarVideos(videos) {
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
}

function renderVideos() {
    const videos = cargarVideos();
    const grid = document.getElementById('videos-grid');
    const empty = document.getElementById('videos-empty');
    
    if (!grid) return;
    
    if (videos.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    if (empty) empty.style.display = 'none';
    
    videos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    const categorias = {
        'matemáticas': '📐 Matemáticas',
        'física': '⚛️ Física',
        'química': '🧪 Química',
        'programación': '💻 Programación',
        'historia': '📜 Historia',
        'idiomas': '🌍 Idiomas',
        'otro': '📌 Otro'
    };
    
    grid.innerHTML = videos.map(video => {
        let thumbnailHtml = '';
        if (video.url && video.url.startsWith('data:video/')) {
            thumbnailHtml = `
                <div class="video-thumbnail" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                    <i class="fas fa-video"></i>
                    <span class="play-icon"><i class="fas fa-play-circle"></i></span>
                    <span class="video-duracion">🎬 ${video.nombreArchivo || 'Video'}</span>
                </div>
            `;
        } else if (video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be'))) {
            thumbnailHtml = `
                <div class="video-thumbnail">
                    <img src="https://img.youtube.com/vi/${extraerIdVideo(video.url)}/hqdefault.jpg" 
                         alt="${video.titulo}"
                         onerror="this.style.display='none'">
                    <span class="play-icon"><i class="fas fa-play-circle"></i></span>
                    <span class="video-duracion">▶ Ver</span>
                </div>
            `;
        } else {
            thumbnailHtml = `
                <div class="video-thumbnail" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                    <i class="fas fa-link"></i>
                    <span class="play-icon"><i class="fas fa-play-circle"></i></span>
                </div>
            `;
        }
        
        return `
            <div class="video-card" onclick="verVideo(${video.id})">
                ${thumbnailHtml}
                <div class="video-info">
                    <div class="video-titulo">${video.titulo}</div>
                    <div class="video-desc">${video.descripcion || ''}</div>
                    <div class="video-meta">
                        <span class="video-categoria">${categorias[video.categoria] || '📌 Otro'}</span>
                        <span>${formatearFecha(video.fecha)}</span>
                        <button class="video-eliminar" onclick="event.stopPropagation(); eliminarVideo(${video.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function extraerIdVideo(url) {
    if (!url) return 'dQw4w9WgXcQ';
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : 'dQw4w9WgXcQ';
}

function formatearFecha(fecha) {
    if (!fecha) return 'Reciente';
    const date = new Date(fecha);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Ahora mismo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} d`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function verVideo(id) {
    const videos = cargarVideos();
    const video = videos.find(v => v.id === id);
    if (!video) return;
    
    document.getElementById('video-visor-titulo').textContent = video.titulo;
    document.getElementById('video-visor-descripcion').textContent = video.descripcion || '';
    document.getElementById('video-visor-meta').textContent = `📅 ${formatearFecha(video.fecha)} · 📎 ${video.nombreArchivo || 'Video'} · ${video.categoria ? '📌 ' + video.categoria : ''}`;
    
    const contenido = document.getElementById('video-visor-contenido');
    
    if (video.url && video.url.startsWith('data:video/')) {
        contenido.innerHTML = `
            <div class="visor-video-container">
                <video controls autoplay>
                    <source src="${video.url}" type="${video.tipo || 'video/mp4'}">
                    Tu navegador no soporta la reproducción de videos.
                </video>
            </div>
        `;
    } else if (video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be'))) {
        const videoId = extraerIdVideo(video.url);
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        contenido.innerHTML = `
            <div class="visor-video-container">
                <iframe src="${embedUrl}" allowfullscreen></iframe>
            </div>
        `;
    } else {
        contenido.innerHTML = `
            <div class="visor-enlace">
                <p style="margin-bottom: 1rem; color: #4a5568;">🔗 ${video.descripcion || 'Enlace'}</p>
                <a href="${video.url}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt"></i> Abrir enlace
                </a>
                <p style="margin-top: 1rem; color: #718096; font-size: 0.85rem;">${video.url}</p>
            </div>
        `;
    }
    
    document.getElementById('modal-ver-video').classList.add('active');
}

function eliminarVideo(id) {
    if (!confirm('¿Eliminar este video?')) return;
    
    let videos = cargarVideos();
    videos = videos.filter(v => v.id !== id);
    guardarVideos(videos);
    renderVideos();
}

function abrirSubirVideo() {
    document.getElementById('modal-subir-video').classList.add('active');
    document.getElementById('video-titulo').focus();
    document.getElementById('video-file-input').value = '';
    document.getElementById('video-file-name-display').style.display = 'none';
    window.videoArchivoSeleccionado = null;
}

function cerrarModalSubirVideo() {
    document.getElementById('modal-subir-video').classList.remove('active');
    document.getElementById('video-titulo').value = '';
    document.getElementById('video-descripcion').value = '';
    document.getElementById('video-categoria').value = 'otro';
    document.getElementById('video-file-input').value = '';
    document.getElementById('video-file-name-display').style.display = 'none';
    window.videoArchivoSeleccionado = null;
}

// ================================================
// ===== RENDERIZAR INICIO =====
// ================================================

window.renderInicio = function() {
    console.log('🟢 renderInicio()');
    
    const data = window.EstudianteData ? window.EstudianteData.load() : null;
    if (data) {
        // Actualizar nombre
        const nombreEl = document.getElementById('nombreUsuario');
        if (nombreEl) {
            const nombres = data.perfil.nombre.split(' ');
            nombreEl.textContent = nombres[0];
        }
        
        // Saludo
        const greetingEl = document.getElementById('greetingTime');
        if (greetingEl) {
            const { greeting, emoji } = getGreeting();
            greetingEl.textContent = `${greeting}, ${data.perfil.nombre.split(' ')[0]} ${emoji}`;
        }
        
        // Frase corta
        const fraseCortaEl = document.getElementById('fraseCorta');
        if (fraseCortaEl) {
            const frases = frasesCortas;
            fraseCortaEl.textContent = frases[Math.floor(Math.random() * frases.length)];
        }
        
        // Nivel
        const xp = calculateXP(data);
        const level = getLevel(xp);
        
        const levelTitleMini = document.getElementById('levelTitleMini');
        const levelNameMini = document.getElementById('levelNameMini');
        const levelXpMini = document.getElementById('levelXpMini');
        const levelProgressMini = document.getElementById('levelProgressMini');
        
        if (levelTitleMini) levelTitleMini.textContent = level.current.emoji;
        if (levelNameMini) levelNameMini.textContent = `Nivel ${level.current.title}`;
        if (levelXpMini) levelXpMini.textContent = `${level.xp} XP`;
        if (levelProgressMini) {
            levelProgressMini.style.width = `${level.progress}%`;
        }
        
        // Estadísticas
        const stats = window.EstudianteData.updateEstadisticas(data);
        
        const statPromedio = document.getElementById('stat-promedio');
        const statMaterias = document.getElementById('stat-materias');
        const statMateriales = document.getElementById('stat-materiales');
        const statCursos = document.getElementById('stat-cursos');
        
        if (statPromedio) {
            animarNumero(statPromedio, 0, parseFloat(stats.promedio) || 0);
        }
        if (statMaterias) {
            animarNumero(statMaterias, 0, stats.totalMaterias || 0);
        }
        if (statMateriales) {
            animarNumero(statMateriales, 0, stats.totalMateriales || 0);
        }
        if (statCursos) {
            animarNumero(statCursos, 0, stats.aprobadas || 0);
        }
        
        // Próxima clase
        const nextClass = getNextClass();
        const classNameEl = document.getElementById('nextClassName');
        const classTimeEl = document.getElementById('nextClassTime');
        if (classNameEl) classNameEl.textContent = nextClass.name;
        if (classTimeEl) {
            const now = new Date();
            const [hours, minutes] = nextClass.time.split(':');
            const classTime = new Date();
            classTime.setHours(parseInt(hours), parseInt(minutes), 0);
            const diffMin = Math.round((classTime - now) / 60000);
            const timeText = diffMin > 0 ? `en ${diffMin} minutos` : diffMin === 0 ? '¡Ahora!' : 'Ya pasó';
            classTimeEl.textContent = `${nextClass.time} · ${timeText}`;
        }
        
        // Misión
        const mission = getDailyMission();
        const missionTextEl = document.getElementById('missionText');
        const missionRewardEl = document.getElementById('missionReward');
        if (missionTextEl) missionTextEl.textContent = mission.text;
        if (missionRewardEl) missionRewardEl.textContent = `🏆 ${mission.reward}`;
    }
    
    // Renderizar videos
    renderVideos();
};

// ================================================
// ===== FUNCIÓN PARA ANIMAR NÚMEROS =====
// ================================================

function animarNumero(elemento, inicio, fin) {
    if (!elemento) return;
    const duracion = 1000;
    const inicioTiempo = performance.now();
    
    function actualizar(tiempoActual) {
        const progreso = Math.min((tiempoActual - inicioTiempo) / duracion, 1);
        const valor = inicio + (fin - inicio) * easeOutCubic(progreso);
        elemento.textContent = fin % 1 === 0 ? Math.round(valor) : valor.toFixed(1);
        
        if (progreso < 1) {
            requestAnimationFrame(actualizar);
        } else {
            elemento.textContent = fin % 1 === 0 ? Math.round(fin) : fin.toFixed(1);
        }
    }
    
    requestAnimationFrame(actualizar);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ================================================
// ===== PERFIL =====
// ================================================

window.editarPerfil = function() {
    const data = window.EstudianteData ? window.EstudianteData.load() : null;
    if (!data) return;
    
    document.getElementById('edit-nombre').value = data.perfil.nombre;
    document.getElementById('edit-email').value = data.perfil.email;
    document.getElementById('edit-carrera').value = data.perfil.carrera;
    document.getElementById('edit-semestre').value = data.perfil.semestre;
    document.getElementById('edit-universidad').value = data.perfil.universidad;
    document.getElementById('modal-perfil').classList.add('active');
};

window.guardarPerfil = function() {
    const data = window.EstudianteData ? window.EstudianteData.load() : null;
    if (!data) return;
    
    data.perfil.nombre = document.getElementById('edit-nombre').value.trim() || data.perfil.nombre;
    data.perfil.email = document.getElementById('edit-email').value.trim() || data.perfil.email;
    data.perfil.carrera = document.getElementById('edit-carrera').value.trim() || data.perfil.carrera;
    data.perfil.semestre = document.getElementById('edit-semestre').value.trim() || data.perfil.semestre;
    data.perfil.universidad = document.getElementById('edit-universidad').value.trim() || data.perfil.universidad;
    
    window.EstudianteData.save(data);
    document.getElementById('modal-perfil').classList.remove('active');
    
    if (window.actualizarHeader) window.actualizarHeader();
    if (window.renderInicio) window.renderInicio();
    
    alert('✅ Perfil actualizado correctamente');
};

window.actualizarHeader = function() {
    const data = window.EstudianteData ? window.EstudianteData.load() : null;
    if (!data) return;
    
    const profileName = document.querySelector('.profile-name');
    if (profileName) {
        const nombres = data.perfil.nombre.split(' ');
        profileName.textContent = nombres[0] + (nombres[1] ? ' ' + nombres[1].charAt(0) + '.' : '');
    }
    
    const bienvenida = document.getElementById('bienvenida');
    if (bienvenida) {
        bienvenida.textContent = `Bienvenida, ${data.perfil.nombre.split(' ')[0]}`;
    }
    
    const nombreHero = document.getElementById('nombreUsuario');
    if (nombreHero) {
        const nombres = data.perfil.nombre.split(' ');
        nombreHero.textContent = nombres[0];
    }
};

// ================================================
// ===== TOGGLE MISIÓN =====
// ================================================

function toggleMission(el) {
    el.classList.toggle('completed');
    if (el.classList.contains('completed')) {
        alert('🎉 ¡Misión completada! +10 XP bonus');
    }
}

// ================================================
// ===== INICIALIZAR =====
// ================================================

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.renderInicio) window.renderInicio();
        if (window.actualizarHeader) window.actualizarHeader();
    }, 400);
});

