// js/clases.js - Módulo de Clases completo con Constructor de Horario integrado
console.log('🟡 clases.js cargado');

const Clases = (function() {
    console.log('🟡 Inicializando módulo Clases');

    // ================================================
    // ===== CONFIGURACIÓN GENERAL =====
    // ================================================

    const CLASES_KEY = 'estudio_clases';
    const HORARIOS_KEY = 'horarios_guardados';
    const BLOQUEO_KEY = 'horario_bloqueado';

    const HORAS_INICIO = 6;
    const HORAS_FIN = 21;
    const INTERVALO_HORAS = 1;
    const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    const COLORES_BLOQUES = {
        'clase': '#667eea',
        'estudio': '#48bb78',
        'almuerzo': '#f6d365',
        'descanso': '#a29bfe',
        'dormir': '#2d3748',
        'ejercicio': '#fc8181',
        'ocio': '#f687b3',
        'trabajo': '#9ae6b4'
    };

    const ICONOS_BLOQUES = {
        'clase': '📚',
        'estudio': '📖',
        'almuerzo': '🍽️',
        'descanso': '☕',
        'dormir': '😴',
        'ejercicio': '🏃',
        'ocio': '🎮',
        'trabajo': '💼'
    };

    const NOMBRES_BLOQUES = {
        'clase': 'Clase',
        'estudio': 'Estudio',
        'almuerzo': 'Almuerzo',
        'descanso': 'Descanso',
        'dormir': 'Dormir',
        'ejercicio': 'Ejercicio',
        'ocio': 'Ocio',
        'trabajo': 'Trabajo'
    };

    // ================================================
    // ===== ESTADO =====
    // ================================================

    let clases = [];
    let claseSeleccionada = null;
    let mesActual = new Date().getMonth();
    let añoActual = new Date().getFullYear();
    let intervalVerificador = null;
    let vistaActual = 'grid';
    let modalidadFiltro = 'todas';
    let estadoFiltro = 'todas';

    // Estado del Constructor de Horario
    let horarios = {};
    let horarioActual = null;
    let bloqueEditando = null;
    let modoSeleccion = false;
    let seleccionInicio = null;
    let horarioBloqueado = false;
    let bloqueArrastrado = null;

    // Flag para saber si estamos en medio de una edición
    let cambiosPendientes = false;

    // ================================================
    // ===== FUNCIONES DE UTILIDAD =====
    // ================================================

    function generarId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    function formatearFecha(fechaStr) {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function formatearHora(hora) {
        const horas = Math.floor(hora);
        const minutos = (hora % 1) * 60;
        if (minutos === 0) {
            return `${String(horas).padStart(2, '0')}:00`;
        }
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }

    function formatearHoraMinutos(hora) {
        const horas = Math.floor(hora);
        const minutos = Math.round((hora % 1) * 60);
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }

    function mostrarNotificacion(mensaje, tipo = 'success') {
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#48bb78' : '#fc8181'};
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideUp 0.3s ease;
            max-width: 400px;
        `;
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        setTimeout(() => {
            notificacion.style.opacity = '0';
            notificacion.style.transition = 'opacity 0.3s ease';
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }

    // ================================================
    // ===== FUNCIONES DE TABS =====
    // ================================================

    function cambiarTab(tab) {
        console.log('🟡 cambiarTab:', tab);
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

        const tabContent = document.getElementById(`tab-${tab}`);
        if (tabContent) tabContent.classList.add('active');

        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
        if (tabBtn) tabBtn.classList.add('active');

        if (tab === 'horario' || tab === 'clases') {
            setTimeout(() => {
                renderizarHorarioConstructor();
                renderizarVistaPreviaClases();
                renderizarTabsHorarios();
                actualizarUIBloqueo();
            }, 300);
        }
    }

    // ================================================
    // ===== FUNCIONES DE CLASES =====
    // ================================================

    function obtenerClasePorDefecto() {
        const ahora = new Date();
        const mañana = new Date(ahora);
        mañana.setDate(ahora.getDate() + 1);
        mañana.setHours(10, 0, 0, 0);

        return {
            id: generarId(),
            nombre: 'Clase de Matemáticas',
            materia: 'Matemáticas',
            modalidad: 'virtual',
            fecha: mañana.toISOString().split('T')[0],
            hora: '10:00',
            duracion: 60,
            horariosAdicionales: [],
            repeticion: 'ninguna',
            diasSemana: [],
            repeticionHasta: '',
            plataforma: 'zoom',
            enlace: 'https://zoom.us/j/123456789',
            ubicacion: '',
            recordatorio: 10,
            estado: 'proxima',
            creado: new Date().toISOString()
        };
    }

    function cargarClases() {
        const stored = localStorage.getItem(CLASES_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.length > 0) {
                    clases = data;
                    return;
                }
            } catch (e) {
                console.error('Error cargando clases:', e);
            }
        }
        clases = [obtenerClasePorDefecto()];
        guardarClases();
    }

    function guardarClases() {
        localStorage.setItem(CLASES_KEY, JSON.stringify(clases));
        actualizarContador();
    }

    function actualizarEstados() {
        const ahora = new Date();
        clases.forEach(clase => {
            const fechaHora = new Date(`${clase.fecha}T${clase.hora}`);
            const diff = (fechaHora - ahora) / 1000 / 60;
            if (diff < -60) {
                clase.estado = 'terminada';
            } else if (diff <= 0) {
                clase.estado = 'en-curso';
            } else {
                clase.estado = 'proxima';
            }
        });
        guardarClases();
    }

    function verificarClasesProximas() {
        const ahora = new Date();
        const claseProxima = clases.find(clase => {
            if (clase.estado === 'terminada' || clase.estado === 'en-curso') return false;
            const fechaHora = new Date(`${clase.fecha}T${clase.hora}`);
            const diff = (fechaHora - ahora) / 1000 / 60;
            return diff > 0 && diff <= (clase.recordatorio || 10);
        });

        if (claseProxima) {
            mostrarRecordatorio(claseProxima);
        } else {
            ocultarRecordatorio();
        }
    }

    function mostrarRecordatorio(clase) {
        const banner = document.getElementById('recordatorio-banner');
        if (!banner) return;

        const titulo = document.getElementById('recordatorio-titulo');
        const descripcion = document.getElementById('recordatorio-descripcion');

        if (titulo) titulo.textContent = `⏰ ¡Tu clase "${clase.nombre}" está por comenzar!`;
        if (descripcion) {
            const fecha = new Date(`${clase.fecha}T${clase.hora}`);
            descripcion.textContent = `${clase.materia || 'General'} - ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hs`;
        }

        banner.style.display = 'flex';
        banner.style.animation = 'slideIn 0.5s ease';
        window.claseRecordatorio = clase;

        if (Notification.permission === 'granted') {
            new Notification('⏰ ¡Tu clase está por comenzar!', {
                body: `${clase.nombre} - ${clase.materia || 'General'}`,
                icon: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4da.png'
            });
        }
    }

    function ocultarRecordatorio() {
        const banner = document.getElementById('recordatorio-banner');
        if (banner) banner.style.display = 'none';
    }

    function unirseAClase() {
        const clase = window.claseRecordatorio || claseSeleccionada;
        if (!clase) {
            alert('No hay clase seleccionada');
            return;
        }

        if (clase.modalidad === 'virtual' && clase.enlace && clase.enlace.startsWith('http')) {
            window.open(clase.enlace, '_blank');
        } else if (clase.modalidad === 'presencial') {
            alert(`📍 Clase presencial en: ${clase.ubicacion || 'Ubicación no especificada'}`);
        } else if (clase.modalidad === 'hibrida') {
            if (clase.enlace && clase.enlace.startsWith('http')) {
                if (confirm(`🔄 Clase híbrida\n📍 Ubicación: ${clase.ubicacion || 'No especificada'}\n🔗 Enlace: ${clase.enlace}\n\n¿Quieres abrir el enlace virtual?`)) {
                    window.open(clase.enlace, '_blank');
                }
            } else {
                alert(`📍 Clase híbrida en: ${clase.ubicacion || 'Ubicación no especificada'}`);
            }
        } else {
            alert('Esta clase no tiene un enlace configurado');
        }
    }

    // ================================================
    // ===== CALENDARIO Y LISTA =====
    // ================================================

    function renderizarCalendario() {
        const grid = document.getElementById('calendario-grid');
        const mesEl = document.getElementById('mes-actual');
        if (!grid) return;

        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        if (mesEl) mesEl.textContent = `${meses[mesActual]} ${añoActual}`;

        const primerDia = new Date(añoActual, mesActual, 1).getDay();
        const diasEnMes = new Date(añoActual, mesActual + 1, 0).getDate();
        const diasEnMesAnterior = new Date(añoActual, mesActual, 0).getDate();
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const hoy = new Date();

        let html = '';
        diasSemana.forEach(dia => {
            html += `<div class="dia-nombre">${dia}</div>`;
        });

        const primerDiaAjustado = primerDia === 0 ? 6 : primerDia - 1;
        for (let i = primerDiaAjustado - 1; i >= 0; i--) {
            const dia = diasEnMesAnterior - i;
            html += `<div class="dia otro-mes">${dia}</div>`;
        }

        for (let dia = 1; dia <= diasEnMes; dia++) {
            const fecha = new Date(añoActual, mesActual, dia);
            const esHoy = fecha.toDateString() === hoy.toDateString();
            const fechaStr = fecha.toISOString().split('T')[0];

            const clasesDia = clases.filter(c => c.fecha === fechaStr);
            const tieneClase = clasesDia.length > 0 && clasesDia.some(c => c.estado !== 'terminada');
            const tieneClasePasada = clasesDia.length > 0 && clasesDia.every(c => c.estado === 'terminada');
            const esMultiple = clasesDia.length > 1;

            let puntoClase = '';
            if (tieneClase) {
                puntoClase = esMultiple ? 'multiple' : '';
            } else if (tieneClasePasada) {
                puntoClase = 'pasada';
            }

            html += `<div class="dia ${esHoy ? 'hoy' : ''}" onclick="Clases.seleccionarDia(${dia})">${dia}`;
            if (puntoClase) {
                html += `<span class="punto-clase ${puntoClase}"></span>`;
            }
            html += `</div>`;
        }

        grid.innerHTML = html;
    }

    function irAHoy() {
        const hoy = new Date();
        mesActual = hoy.getMonth();
        añoActual = hoy.getFullYear();
        renderizarCalendario();
        renderizarListaClases();
    }

    window.Clases = window.Clases || {};
    window.Clases.seleccionarDia = function(dia) {
        const fecha = new Date(añoActual, mesActual, dia);
        const fechaStr = fecha.toISOString().split('T')[0];
        renderizarListaClases(clases.filter(c => c.fecha === fechaStr));
    };

    function cambiarMes(delta) {
        mesActual += delta;
        if (mesActual > 11) {
            mesActual = 0;
            añoActual++;
        } else if (mesActual < 0) {
            mesActual = 11;
            añoActual--;
        }
        renderizarCalendario();
    }

    function cambiarVista(vista) {
        vistaActual = vista;
        document.querySelectorAll('.vista-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.querySelector(`.fa-${vista === 'grid' ? 'th' : vista === 'horizontal' ? 'th-list' : 'list'}`)) {
                btn.classList.add('active');
            }
        });
        const container = document.getElementById('clases-lista-container');
        if (container) {
            container.className = `vista-${vista}`;
        }
        renderizarListaClases();
    }

    function aplicarFiltros() {
        modalidadFiltro = document.getElementById('filtro-modalidad').value;
        estadoFiltro = document.getElementById('filtro-estado').value;
        renderizarListaClases();
    }

    function renderizarListaClases(listaFiltrada = null) {
        const container = document.getElementById('clases-lista-container');
        if (!container) return;

        let lista = listaFiltrada || clases;

        if (modalidadFiltro !== 'todas') {
            lista = lista.filter(c => c.modalidad === modalidadFiltro);
        }
        if (estadoFiltro !== 'todas') {
            lista = lista.filter(c => c.estado === estadoFiltro);
        }

        if (lista.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 2rem 0;">
                    <i class="fas fa-calendar-plus"></i>
                    <p style="font-size: 0.9rem;">No hay clases que coincidan con los filtros</p>
                    <button class="btn btn-primary btn-sm" onclick="abrirAgregarClase()" style="margin-top: 0.5rem;">
                        <i class="fas fa-plus"></i> Agregar Clase
                    </button>
                </div>
            `;
            return;
        }

        const ordenadas = [...lista].sort((a, b) => {
            const fechaA = new Date(`${a.fecha}T${a.hora}`);
            const fechaB = new Date(`${b.fecha}T${b.hora}`);
            return fechaA - fechaB;
        });

        const ahora = new Date();
        const modalidadIconos = { 'virtual': '💻', 'presencial': '🏫', 'hibrida': '🔄' };
        const modalidadClases = { 'virtual': 'virtual', 'presencial': 'presencial', 'hibrida': 'hibrida' };
        const repeticionTextos = {
            'ninguna': 'No repetir',
            'diaria': '📅 Diaria',
            'semanal': '📅 Semanal',
            'quincenal': '📅 Quincenal',
            'mensual': '📅 Mensual'
        };

        container.className = `vista-${vistaActual}`;

        container.innerHTML = ordenadas.map(clase => {
            const fechaHora = new Date(`${clase.fecha}T${clase.hora}`);
            const diff = (fechaHora - ahora) / 1000 / 60;

            let estadoTexto = 'Próxima';
            let estadoClass = 'proxima';
            if (clase.estado === 'en-curso') {
                estadoTexto = '🟢 En curso';
                estadoClass = 'en-curso';
            } else if (clase.estado === 'terminada') {
                estadoTexto = '✅ Terminada';
                estadoClass = 'terminada';
            } else if (diff <= 60) {
                estadoTexto = '🔔 Pronto';
                estadoClass = 'proxima';
            }

            const iconosPlataforma = {
                'zoom': 'fa-video',
                'meet': 'fa-google',
                'teams': 'fa-microsoft',
                'otro': 'fa-link'
            };

            const modalidadInfo = clase.modalidad || 'virtual';
            const modalidadIcono = modalidadIconos[modalidadInfo] || '💻';
            const modalidadClase = modalidadClases[modalidadInfo] || 'virtual';

            let horariosExtra = '';
            if (clase.horariosAdicionales && clase.horariosAdicionales.length > 0) {
                horariosExtra = clase.horariosAdicionales.map(h => h).join(', ');
            }

            let diasRepeticion = '';
            if (clase.repeticion === 'semanal' && clase.diasSemana && clase.diasSemana.length > 0) {
                const nombresDias = {0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb'};
                diasRepeticion = clase.diasSemana.map(d => nombresDias[d]).join(', ');
            }

            return `
                <div class="clase-item" onclick="Clases.verClase('${clase.id}')">
                    <div class="clase-header">
                        <div>
                            <div class="clase-nombre">${clase.nombre}</div>
                            <div style="display: flex; gap: 0.3rem; flex-wrap: wrap; margin-top: 0.2rem;">
                                <span class="clase-materia">${clase.materia || '📚 General'}</span>
                                <span class="clase-modalidad ${modalidadClase}">${modalidadIcono} ${modalidadInfo.charAt(0).toUpperCase() + modalidadInfo.slice(1)}</span>
                                ${clase.repeticion && clase.repeticion !== 'ninguna' ? `<span class="badge-repeticion">${repeticionTextos[clase.repeticion] || 'Repite'}${diasRepeticion ? ` (${diasRepeticion})` : ''}</span>` : ''}
                                ${clase.horariosAdicionales && clase.horariosAdicionales.length > 0 ? `<span class="badge-repeticion" style="background: #fef3c7; color: #d97706;">🕐 +${clase.horariosAdicionales.length}</span>` : ''}
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.3rem;">
                            <span class="badge-estado ${estadoClass}">${estadoTexto}</span>
                            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); Clases.verClase('${clase.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="clase-info">
                        <span><i class="far fa-calendar"></i> ${formatearFecha(clase.fecha)}</span>
                        <span><i class="far fa-clock"></i> ${clase.hora}${horariosExtra ? ` (${horariosExtra})` : ''}</span>
                        ${clase.duracion ? `<span><i class="fas fa-hourglass-half"></i> ${clase.duracion} min</span>` : ''}
                        <span><i class="fas ${iconosPlataforma[clase.plataforma] || 'fa-link'}"></i> ${clase.plataforma || 'Sin plataforma'}</span>
                        ${clase.enlace && clase.modalidad === 'virtual' ? `<span><a href="${clase.enlace}" target="_blank" style="color: #667eea; text-decoration: none;" onclick="event.stopPropagation();"><i class="fas fa-external-link-alt"></i> Unirse</a></span>` : ''}
                        ${clase.ubicacion && clase.modalidad !== 'virtual' ? `<span><i class="fas fa-map-marker-alt"></i> ${clase.ubicacion}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function actualizarContador() {
        const countEl = document.getElementById('clases-count');
        if (countEl) {
            const proximas = clases.filter(c => c.estado !== 'terminada').length;
            countEl.textContent = `${proximas} clases`;
        }
    }

    // ================================================
    // ===== VER CLASE =====
    // ================================================

    window.Clases.verClase = function(id) {
        const clase = clases.find(c => c.id === id);
        if (!clase) return;

        claseSeleccionada = clase;
        window.claseRecordatorio = clase;

        document.getElementById('ver-clase-titulo').textContent = clase.nombre;
        document.getElementById('ver-clase-materia').textContent = `📚 ${clase.materia || 'General'}`;
        document.getElementById('ver-clase-fecha').textContent = formatearFecha(clase.fecha);
        document.getElementById('ver-clase-hora').textContent = clase.hora;
        document.getElementById('ver-clase-duracion-modal').textContent = `${clase.duracion || 60} min`;
        document.getElementById('ver-clase-plataforma').textContent = clase.plataforma || 'Sin plataforma';
        document.getElementById('ver-clase-enlace').textContent = clase.enlace || 'Sin enlace';
        document.getElementById('ver-clase-enlace').href = clase.enlace || '#';
        document.getElementById('ver-clase-ubicacion').textContent = clase.ubicacion || 'No especificada';

        const modalidadInfo = clase.modalidad || 'virtual';
        const modalidadTextos = {
            'virtual': '💻 Virtual',
            'presencial': '🏫 Presencial',
            'hibrida': '🔄 Híbrida'
        };
        document.getElementById('ver-clase-modalidad-texto').textContent = modalidadTextos[modalidadInfo] || '💻 Virtual';

        const estadoEl = document.getElementById('ver-clase-estado');
        if (estadoEl) {
            if (clase.estado === 'en-curso') {
                estadoEl.textContent = '🟢 En curso';
                estadoEl.className = 'badge-estado en-curso';
            } else if (clase.estado === 'terminada') {
                estadoEl.textContent = '✅ Terminada';
                estadoEl.className = 'badge-estado terminada';
            } else {
                estadoEl.textContent = '📅 Próxima';
                estadoEl.className = 'badge-estado proxima';
            }
        }

        document.getElementById('modal-ver-clase').classList.add('active');
    };

    // ================================================
    // ===== AGREGAR CLASE =====
    // ================================================

    function abrirAgregarClase() {
        const select = document.getElementById('clase-materia');
        if (select) {
            let materias = [];
            try {
                const data = window.EstudianteData ? window.EstudianteData.load() : null;
                if (data && data.materias) {
                    materias = data.materias;
                }
            } catch (e) {}

            select.innerHTML = '<option value="general">📚 General</option>';
            materias.forEach(m => {
                const option = document.createElement('option');
                option.value = m.nombre;
                option.textContent = m.nombre;
                select.appendChild(option);
            });
        }

        document.getElementById('clase-edit-id').value = '';
        document.getElementById('modal-agregar-titulo').textContent = '📚 Agregar Clase';
        document.getElementById('btn-guardar-clase-texto').textContent = 'Agregar Clase';
        document.getElementById('clase-nombre').value = '';
        document.getElementById('clase-enlace').value = '';
        document.getElementById('clase-ubicacion').value = '';
        document.getElementById('clase-modalidad').value = 'virtual';
        document.getElementById('clase-plataforma').value = 'zoom';
        document.getElementById('clase-recordatorio').value = '10';
        document.getElementById('clase-repeticion').value = 'ninguna';
        document.getElementById('clase-repeticion-hasta').value = '';
        document.getElementById('clase-duracion').value = '60';
        document.querySelectorAll('#dias-semana-container input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.getElementById('horarios-adicionales-container').innerHTML = `
            <div class="horario-adicional">
                <input type="time" class="horario-adicional-input" placeholder="Hora">
                <button class="btn btn-danger btn-sm" onclick="eliminarHorarioAdicional(this)">✕</button>
            </div>
        `;

        const fechaInput = document.getElementById('clase-fecha');
        if (fechaInput) {
            fechaInput.value = new Date().toISOString().split('T')[0];
        }

        const horaInput = document.getElementById('clase-hora');
        if (horaInput) {
            const ahora = new Date();
            const hora = String(ahora.getHours() + 1).padStart(2, '0');
            const minutos = String(ahora.getMinutes()).padStart(2, '0');
            horaInput.value = `${hora}:${minutos}`;
        }

        mostrarOpcionesRepeticion();
        actualizarCamposModalidad();
        document.getElementById('modal-agregar-clase').classList.add('active');
        setTimeout(() => {
            document.getElementById('clase-nombre').focus();
        }, 100);
    }

    function abrirEditarClase() {
        if (!claseSeleccionada) return;

        const clase = claseSeleccionada;

        const select = document.getElementById('clase-materia');
        if (select) {
            let materias = [];
            try {
                const data = window.EstudianteData ? window.EstudianteData.load() : null;
                if (data && data.materias) {
                    materias = data.materias;
                }
            } catch (e) {}

            select.innerHTML = '<option value="general">📚 General</option>';
            materias.forEach(m => {
                const option = document.createElement('option');
                option.value = m.nombre;
                if (m.nombre === clase.materia) option.selected = true;
                option.textContent = m.nombre;
                select.appendChild(option);
            });
        }

        document.getElementById('clase-edit-id').value = clase.id;
        document.getElementById('modal-agregar-titulo').textContent = '✏️ Editar Clase';
        document.getElementById('btn-guardar-clase-texto').textContent = 'Guardar Cambios';
        document.getElementById('clase-nombre').value = clase.nombre || '';
        document.getElementById('clase-modalidad').value = clase.modalidad || 'virtual';
        document.getElementById('clase-plataforma').value = clase.plataforma || 'zoom';
        document.getElementById('clase-recordatorio').value = clase.recordatorio || '10';
        document.getElementById('clase-repeticion').value = clase.repeticion || 'ninguna';
        document.getElementById('clase-repeticion-hasta').value = clase.repeticionHasta || '';
        document.getElementById('clase-duracion').value = clase.duracion || 60;
        document.getElementById('clase-enlace').value = clase.enlace || '';
        document.getElementById('clase-ubicacion').value = clase.ubicacion || '';
        document.getElementById('clase-fecha').value = clase.fecha || '';
        document.getElementById('clase-hora').value = clase.hora || '';

        document.querySelectorAll('#dias-semana-container input[type="checkbox"]').forEach(cb => {
            cb.checked = clase.diasSemana && clase.diasSemana.includes(parseInt(cb.value));
        });

        const container = document.getElementById('horarios-adicionales-container');
        container.innerHTML = '';
        if (clase.horariosAdicionales && clase.horariosAdicionales.length > 0) {
            clase.horariosAdicionales.forEach(hora => {
                const div = document.createElement('div');
                div.className = 'horario-adicional';
                div.innerHTML = `
                    <input type="time" class="horario-adicional-input" value="${hora}">
                    <button class="btn btn-danger btn-sm" onclick="eliminarHorarioAdicional(this)">✕</button>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = `
                <div class="horario-adicional">
                    <input type="time" class="horario-adicional-input" placeholder="Hora">
                    <button class="btn btn-danger btn-sm" onclick="eliminarHorarioAdicional(this)">✕</button>
                </div>
            `;
        }

        mostrarOpcionesRepeticion();
        actualizarCamposModalidad();

        cerrarModalVerClase();
        document.getElementById('modal-agregar-clase').classList.add('active');
        setTimeout(() => {
            document.getElementById('clase-nombre').focus();
        }, 100);
    }

    function mostrarOpcionesRepeticion() {
        const valor = document.getElementById('clase-repeticion').value;
        const diasContainer = document.getElementById('dias-semana-container');
        const hastaContainer = document.getElementById('repeticion-hasta-container');

        if (valor === 'semanal') {
            diasContainer.style.display = 'block';
        } else {
            diasContainer.style.display = 'none';
        }

        if (valor !== 'ninguna') {
            hastaContainer.style.display = 'block';
            const fechaInput = document.getElementById('clase-repeticion-hasta');
            if (fechaInput && !fechaInput.value) {
                const fecha = new Date();
                fecha.setMonth(fecha.getMonth() + 1);
                fechaInput.value = fecha.toISOString().split('T')[0];
            }
        } else {
            hastaContainer.style.display = 'none';
        }
    }

    function actualizarCamposModalidad() {
        const modalidad = document.getElementById('clase-modalidad').value;
        const campoEnlace = document.getElementById('campo-enlace-clase');
        const campoUbicacion = document.getElementById('campo-ubicacion-clase');

        if (modalidad === 'virtual') {
            campoEnlace.style.display = 'block';
            campoUbicacion.style.display = 'none';
        } else if (modalidad === 'presencial') {
            campoEnlace.style.display = 'none';
            campoUbicacion.style.display = 'block';
        } else {
            campoEnlace.style.display = 'block';
            campoUbicacion.style.display = 'block';
        }
    }

    function agregarHorarioAdicional() {
        const container = document.getElementById('horarios-adicionales-container');
        const div = document.createElement('div');
        div.className = 'horario-adicional';
        div.innerHTML = `
            <input type="time" class="horario-adicional-input" placeholder="Hora">
            <button class="btn btn-danger btn-sm" onclick="eliminarHorarioAdicional(this)">✕</button>
        `;
        container.appendChild(div);
    }

    function eliminarHorarioAdicional(btn) {
        const div = btn.parentElement;
        if (document.querySelectorAll('.horario-adicional').length > 1) {
            div.remove();
        } else {
            alert('Debe haber al menos un horario');
        }
    }

    function guardarClaseForm() {
        const editId = document.getElementById('clase-edit-id').value;
        const nombre = document.getElementById('clase-nombre').value.trim();
        const materia = document.getElementById('clase-materia').value;
        const modalidad = document.getElementById('clase-modalidad').value;
        const fecha = document.getElementById('clase-fecha').value;
        const hora = document.getElementById('clase-hora').value;
        const duracion = parseInt(document.getElementById('clase-duracion').value) || 60;
        const plataforma = document.getElementById('clase-plataforma').value;
        const enlace = document.getElementById('clase-enlace').value.trim();
        const ubicacion = document.getElementById('clase-ubicacion').value.trim();
        const recordatorio = parseInt(document.getElementById('clase-recordatorio').value);
        const repeticion = document.getElementById('clase-repeticion').value;
        const repeticionHasta = document.getElementById('clase-repeticion-hasta').value;

        const diasSemana = [];
        document.querySelectorAll('#dias-semana-container input[type="checkbox"]:checked').forEach(cb => {
            diasSemana.push(parseInt(cb.value));
        });

        const horariosAdicionales = [];
        document.querySelectorAll('.horario-adicional-input').forEach(input => {
            if (input.value) {
                horariosAdicionales.push(input.value);
            }
        });

        if (!nombre) {
            alert('Ingresa el nombre de la clase');
            document.getElementById('clase-nombre').focus();
            return;
        }

        if (!fecha) {
            alert('Selecciona una fecha');
            document.getElementById('clase-fecha').focus();
            return;
        }

        if (!hora) {
            alert('Selecciona una hora');
            document.getElementById('clase-hora').focus();
            return;
        }

        if (editId) {
            const baseId = editId.split('_')[0];
            clases = clases.filter(c => !c.id.startsWith(baseId));
        }

        const nuevaClase = {
            id: generarId(),
            nombre,
            materia: materia === 'general' ? 'General' : materia,
            modalidad,
            fecha,
            hora,
            duracion,
            horariosAdicionales,
            repeticion,
            diasSemana,
            repeticionHasta,
            plataforma,
            enlace: modalidad !== 'presencial' ? enlace : '',
            ubicacion: modalidad !== 'virtual' ? ubicacion : '',
            recordatorio,
            estado: 'proxima',
            creado: new Date().toISOString()
        };

        if (repeticion !== 'ninguna' && repeticionHasta) {
            const clasesGeneradas = generarClasesRecurrentes(nuevaClase);
            clases.push(...clasesGeneradas);
        } else {
            clases.push(nuevaClase);
        }

        guardarClases();
        renderizarTodo();
        cerrarModalAgregarClase();

        mostrarNotificacion(`✅ ${editId ? 'Clase actualizada' : (repeticion !== 'ninguna' ? 'Clases recurrentes agregadas' : 'Clase agregada')} correctamente`);
    }

    function generarClasesRecurrentes(claseBase) {
        const clasesGeneradas = [];
        let fechaActual = new Date(claseBase.fecha);
        const fechaHasta = new Date(claseBase.repeticionHasta);

        if (claseBase.repeticion === 'semanal' && claseBase.diasSemana.length > 0) {
            const diasOrdenados = [...claseBase.diasSemana].sort((a, b) => a - b);
            let diaActual = fechaActual.getDay();
            let indiceDia = diasOrdenados.indexOf(diaActual);

            if (indiceDia === -1) {
                for (let i = 0; i < diasOrdenados.length; i++) {
                    if (diasOrdenados[i] > diaActual) {
                        indiceDia = i;
                        break;
                    }
                }
                if (indiceDia === -1) {
                    indiceDia = 0;
                    fechaActual.setDate(fechaActual.getDate() + (7 - diaActual + diasOrdenados[0]));
                } else {
                    fechaActual.setDate(fechaActual.getDate() + (diasOrdenados[indiceDia] - diaActual));
                }
            }

            let contador = 0;
            while (fechaActual <= fechaHasta && contador < 100) {
                const fechaStr = fechaActual.toISOString().split('T')[0];
                const nuevaClase = {
                    ...claseBase,
                    id: generarId() + '_' + contador,
                    fecha: fechaStr,
                    creado: new Date().toISOString()
                };
                clasesGeneradas.push(nuevaClase);

                contador++;
                let diaActualNum = fechaActual.getDay();
                let siguienteDia = null;

                for (let i = 0; i < diasOrdenados.length; i++) {
                    if (diasOrdenados[i] > diaActualNum) {
                        siguienteDia = diasOrdenados[i];
                        break;
                    }
                }

                if (siguienteDia === null) {
                    siguienteDia = diasOrdenados[0];
                    fechaActual.setDate(fechaActual.getDate() + (7 - diaActualNum + siguienteDia));
                } else {
                    fechaActual.setDate(fechaActual.getDate() + (siguienteDia - diaActualNum));
                }
            }
        } else {
            let contador = 0;
            let fechaIter = new Date(claseBase.fecha);

            while (fechaIter <= fechaHasta && contador < 100) {
                if (contador > 0) {
                    const fechaStr = fechaIter.toISOString().split('T')[0];
                    const nuevaClase = {
                        ...claseBase,
                        id: generarId() + '_' + contador,
                        fecha: fechaStr,
                        creado: new Date().toISOString()
                    };
                    clasesGeneradas.push(nuevaClase);
                }

                contador++;
                if (claseBase.repeticion === 'diaria') {
                    fechaIter.setDate(fechaIter.getDate() + 1);
                } else if (claseBase.repeticion === 'quincenal') {
                    fechaIter.setDate(fechaIter.getDate() + 15);
                } else if (claseBase.repeticion === 'mensual') {
                    fechaIter.setMonth(fechaIter.getMonth() + 1);
                }
            }
        }

        return clasesGeneradas;
    }

    function eliminarClase() {
        if (!claseSeleccionada) return;

        if (!confirm(`¿Eliminar la clase "${claseSeleccionada.nombre}"?`)) return;

        const baseId = claseSeleccionada.id.split('_')[0];
        clases = clases.filter(c => !c.id.startsWith(baseId));

        guardarClases();
        renderizarTodo();
        cerrarModalVerClase();

        mostrarNotificacion('✅ Clase eliminada');
    }

    function cerrarModalAgregarClase() {
        document.getElementById('modal-agregar-clase').classList.remove('active');
    }

    function cerrarModalVerClase() {
        document.getElementById('modal-ver-clase').classList.remove('active');
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - GESTIÓN DE HORARIOS =====
    // ================================================

    function cargarHorarios() {
        const stored = localStorage.getItem(HORARIOS_KEY);
        if (stored) {
            try {
                horarios = JSON.parse(stored);
                Object.keys(horarios).forEach(nombre => {
                    const horario = horarios[nombre];
                    DIAS_SEMANA.forEach(dia => {
                        if (!horario[dia]) horario[dia] = {};
                        for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
                            if (!horario[dia][h]) horario[dia][h] = null;
                        }
                    });
                });
                return;
            } catch (e) {
                console.error('Error cargando horarios:', e);
            }
        }
        const defaultHorario = {};
        DIAS_SEMANA.forEach(dia => {
            defaultHorario[dia] = {};
            for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
                defaultHorario[dia][h] = null;
            }
        });
        horarios = {
            'Universidad': defaultHorario
        };
        guardarHorarios();
    }

    function guardarHorarios() {
        localStorage.setItem(HORARIOS_KEY, JSON.stringify(horarios));
        // Después de guardar, actualizar la vista previa en Mis Clases
        renderizarVistaPreviaClases();
        actualizarUIBloqueo();
    }

    function getHorarioActual() {
        if (!horarioActual || !horarios[horarioActual]) {
            const keys = Object.keys(horarios);
            horarioActual = keys.length > 0 ? keys[0] : 'Universidad';
        }
        return horarioActual;
    }

    function contarBloques(horario) {
        let count = 0;
        DIAS_SEMANA.forEach(dia => {
            for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
                if (horario[dia] && horario[dia][h] && horario[dia][h]?.id) {
                    count++;
                }
            }
        });
        return count;
    }

    function encontrarBloque(id) {
        const nombre = getHorarioActual();
        const horario = horarios[nombre];
        for (const dia of DIAS_SEMANA) {
            for (const h in horario[dia]) {
                if (horario[dia][h] && horario[dia][h].id === id) {
                    return horario[dia][h];
                }
            }
        }
        return null;
    }

    function encontrarPosicionBloque(id) {
        const nombre = getHorarioActual();
        const horario = horarios[nombre];
        for (const dia of DIAS_SEMANA) {
            for (const h in horario[dia]) {
                if (horario[dia][h] && horario[dia][h].id === id) {
                    return { dia, hora: parseFloat(h) };
                }
            }
        }
        return null;
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - BLOQUEO =====
    // ================================================

    function cargarEstadoBloqueo() {
        const stored = localStorage.getItem(BLOQUEO_KEY);
        horarioBloqueado = stored !== null ? JSON.parse(stored) : false;
        console.log('🟡 Estado de bloqueo cargado:', horarioBloqueado);
        actualizarUIBloqueo();
    }

    function guardarEstadoBloqueo() {
        localStorage.setItem(BLOQUEO_KEY, JSON.stringify(horarioBloqueado));
        console.log('🟡 Estado de bloqueo guardado:', horarioBloqueado);
        actualizarUIBloqueo();
    }

    function toggleBloqueoHorario() {
        console.log('🟡 toggleBloqueoHorario llamado, estado actual:', horarioBloqueado);
        horarioBloqueado = !horarioBloqueado;
        console.log('🟡 Nuevo estado:', horarioBloqueado);
        guardarEstadoBloqueo();
        renderizarTodo();
        mostrarNotificacion(horarioBloqueado ? '🔒 Horario bloqueado' : '🔓 Horario desbloqueado');
    }

    function actualizarUIBloqueo() {
        console.log('🟡 Actualizando UI bloqueo:', horarioBloqueado);

        // Constructor
        const iconoConstructor = document.getElementById('icono-bloqueo-constructor');
        const textoConstructor = document.getElementById('texto-bloqueo-constructor');
        if (iconoConstructor) {
            iconoConstructor.className = horarioBloqueado ? 'fas fa-lock' : 'fas fa-unlock';
        }
        if (textoConstructor) {
            textoConstructor.textContent = horarioBloqueado ? 'Bloqueado' : 'Desbloqueado';
        }
        const btnConstructor = document.getElementById('btn-toggle-bloqueo-constructor');
        if (btnConstructor) {
            btnConstructor.className = horarioBloqueado ? 'btn btn-secondary btn-sm' : 'btn btn-success btn-sm';
        }

        // Mis Clases
        const iconoClases = document.getElementById('icono-candado-clases');
        const textoClases = document.getElementById('texto-candado-clases');
        const textoBtnClases = document.getElementById('texto-bloqueo-clases');
        if (iconoClases) {
            iconoClases.className = horarioBloqueado ? 'fas fa-lock' : 'fas fa-unlock';
        }
        if (textoClases) {
            textoClases.textContent = horarioBloqueado ? 'Solo lectura' : 'Edición permitida';
        }
        if (textoBtnClases) {
            textoBtnClases.textContent = horarioBloqueado ? 'Bloqueado' : 'Desbloqueado';
        }
        const badgeClases = document.getElementById('candado-badge-clases');
        if (badgeClases) {
            badgeClases.style.borderColor = horarioBloqueado ? '#e2e8f0' : '#48bb78';
            badgeClases.style.background = horarioBloqueado ? 'rgba(255,255,255,0.95)' : 'rgba(72,187,120,0.1)';
        }
        const btnClases = document.getElementById('btn-toggle-bloqueo-clases');
        if (btnClases) {
            btnClases.className = horarioBloqueado ? 'btn btn-secondary btn-sm' : 'btn btn-success btn-sm';
        }
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - GESTIÓN DE HORARIOS =====
    // ================================================

    function crearNuevoHorario() {
        const nombre = prompt('Ingresa el nombre del nuevo horario (ej: Universidad, Trabajo, Casa):');
        if (!nombre || nombre.trim() === '') return;
        
        if (horarios[nombre]) {
            mostrarNotificacion('⚠️ Ya existe un horario con ese nombre', 'error');
            return;
        }
        
        const nuevoHorario = {};
        DIAS_SEMANA.forEach(dia => {
            nuevoHorario[dia] = {};
            for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
                nuevoHorario[dia][h] = null;
            }
        });
        
        horarios[nombre] = nuevoHorario;
        guardarHorarios();
        horarioActual = nombre;
        renderizarTabsHorarios();
        renderizarHorarioConstructor();
        renderizarVistaPreviaClases();
        mostrarNotificacion(`✅ Horario "${nombre}" creado`);
    }

    function eliminarHorario(nombre) {
        if (Object.keys(horarios).length <= 1) {
            mostrarNotificacion('⚠️ Debes tener al menos un horario', 'error');
            return;
        }
        if (!confirm(`¿Eliminar el horario "${nombre}"?`)) return;
        
        delete horarios[nombre];
        guardarHorarios();
        
        const keys = Object.keys(horarios);
        horarioActual = keys.length > 0 ? keys[0] : null;
        renderizarTabsHorarios();
        renderizarHorarioConstructor();
        renderizarVistaPreviaClases();
        mostrarNotificacion(`🗑️ Horario "${nombre}" eliminado`);
    }

    function cambiarHorario(nombre) {
        if (!horarios[nombre]) return;
        horarioActual = nombre;
        renderizarTabsHorarios();
        renderizarHorarioConstructor();
        renderizarVistaPreviaClases();
        actualizarUIBloqueo();
    }

    function guardarHorarioActual() {
        guardarHorarios();
        renderizarVistaPreviaClases();
        mostrarNotificacion('✅ Horario guardado correctamente');
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - RENDERIZAR TABS =====
    // ================================================

    function renderizarTabsHorarios() {
        const containerConstructor = document.getElementById('horario-tabs-constructor');
        if (containerConstructor) {
            renderizarTabsEn(containerConstructor);
        }
        
        const containerClases = document.getElementById('horario-tabs-clases');
        if (containerClases) {
            renderizarTabsEn(containerClases);
        }
    }

    function renderizarTabsEn(container) {
        const keys = Object.keys(horarios);
        container.innerHTML = keys.map(nombre => `
            <button class="horario-tab-btn ${nombre === horarioActual ? 'active' : ''}" 
                    onclick="Clases.cambiarHorario('${nombre}')">
                📅 ${nombre}
                <span class="badge-horario">${contarBloques(horarios[nombre])}</span>
                ${keys.length > 1 ? `<span class="btn-eliminar-horario" onclick="event.stopPropagation(); Clases.eliminarHorario('${nombre}')">✕</span>` : ''}
            </button>
        `).join('');
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - VISTA PREVIA EN CLASES =====
    // ================================================

    function renderizarVistaPreviaClases() {
        const container = document.getElementById('horario-vista-previa-contenido');
        if (!container) return;

        renderizarTablaHorario(container, false);
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - RENDERIZAR TABLA =====
    // ================================================

    function renderizarHorarioConstructor() {
        const container = document.getElementById('horario-tabla-body');
        if (!container) {
            console.warn('No se encontró horario-tabla-body');
            return;
        }

        const nombre = getHorarioActual();
        const horario = horarios[nombre];
        if (!horario) return;

        container.innerHTML = '';

        for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
            const fila = document.createElement('tr');
            fila.dataset.hora = h;

            const celdaHora = document.createElement('td');
            celdaHora.className = 'hora-columna';
            celdaHora.textContent = formatearHora(h);
            fila.appendChild(celdaHora);

            DIAS_SEMANA.forEach(dia => {
                const celda = document.createElement('td');
                celda.dataset.dia = dia;
                celda.dataset.hora = h;
                celda.className = 'celda-horario';
                
                const contenido = document.createElement('div');
                contenido.className = 'celda-content';

                const bloque = horario[dia]?.[h];
                if (bloque && typeof bloque === 'object' && bloque.id) {
                    const bloqueDiv = crearElementoBloque(bloque, dia, h);
                    contenido.appendChild(bloqueDiv);
                }

                if (!horarioBloqueado) {
                    celda.addEventListener('dragover', function(e) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        this.classList.add('drag-over');
                    });
                    
                    celda.addEventListener('dragenter', function(e) {
                        e.preventDefault();
                        this.classList.add('drag-over');
                    });
                    
                    celda.addEventListener('dragleave', function(e) {
                        this.classList.remove('drag-over');
                    });
                    
                    celda.addEventListener('drop', function(e) {
                        this.classList.remove('drag-over');
                        manejarDrop(e, this);
                        // Marcar que hay cambios pendientes
                        cambiosPendientes = true;
                    });
                }

                celda.addEventListener('click', onCeldaClick);
                celda.addEventListener('dblclick', onCeldaDblClick);

                celda.appendChild(contenido);
                fila.appendChild(celda);
            });

            container.appendChild(fila);
        }
        
        setTimeout(configurarDragBloques, 200);
        renderizarTabsHorarios();
        actualizarUIBloqueo();
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - RENDERIZAR TABLA EN CONTAINER (VISTA PREVIA) =====
    // ================================================

    function renderizarTablaHorario(container, esConstructor = false) {
        const nombre = getHorarioActual();
        const horario = horarios[nombre];
        if (!horario) {
            container.innerHTML = '<p style="text-align: center; color: #718096; padding: 2rem 0; margin: 0;">Selecciona un horario para verlo</p>';
            return;
        }

        let tieneBloques = false;
        DIAS_SEMANA.forEach(dia => {
            for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
                if (horario[dia] && horario[dia][h] && horario[dia][h]?.id) {
                    tieneBloques = true;
                    break;
                }
            }
        });

        if (!tieneBloques) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem 0;">
                    <i class="fas fa-calendar-plus" style="font-size: 2rem; color: #dce4ec; display: block; margin-bottom: 0.5rem;"></i>
                    <p style="color: #718096; margin: 0;">📅 "${nombre}" - No hay bloques aún</p>
                    <p style="font-size: 0.7rem; color: #a0aec0; margin: 0.2rem 0 0;">Ve al constructor de horario para crear tu horario</p>
                </div>
            `;
            return;
        }

        let html = `
            <div style="font-weight: 700; color: #1a202c; margin-bottom: 0.5rem; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
                📅 ${nombre}
                <span style="font-size: 0.6rem; color: #a0aec0; font-weight: 400;">${new Date().toLocaleString()}</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="min-width: 45px;">Hora</th>
        `;

        DIAS_SEMANA.forEach(dia => {
            html += `<th>${dia.substring(0, 3)}</th>`;
        });

        html += `</tr></thead><tbody>`;

        for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
            html += `<tr>`;
            html += `<td class="hora-columna-vista">${formatearHora(h)}</td>`;
            
            DIAS_SEMANA.forEach(dia => {
                const bloque = horario[dia]?.[h];
                let contenido = '';
                if (bloque && bloque.id) {
                    const duracion = bloque.duracion || 1;
                    const icono = bloque.esClase ? '📚' : '📌';
                    const alturaExtra = duracion > 1 ? `min-height: ${duracion * 20 + 10}px;` : '';
                    const isBloqueado = horarioBloqueado ? 'cursor: default;' : 'cursor: pointer;';
                    const onclick = !horarioBloqueado ? `onclick="Clases.editarBloque('${bloque.id}')"` : '';
                    
                    contenido = `
                        <div class="bloque-vista" style="background:${bloque.color || '#667eea'}; ${alturaExtra} ${isBloqueado}" ${onclick}>
                            <span class="bloque-titulo-vista">${icono} ${bloque.nombre || 'Clase'}</span>
                            ${duracion > 1 ? `<span class="bloque-sub-vista">${duracion}h</span>` : ''}
                            ${bloque.aula ? `<span class="bloque-sub-vista">📍 ${bloque.aula}</span>` : ''}
                            ${bloque.profesor ? `<span class="bloque-sub-vista">👨‍🏫 ${bloque.profesor}</span>` : ''}
                        </div>
                    `;
                }
                html += `<td style="vertical-align: middle; height: 32px;">${contenido}</td>`;
            });
            
            html += `</tr>`;
        }

        html += `</tbody></table>`;
        container.innerHTML = html;
        actualizarUIBloqueo();
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - CREAR ELEMENTO BLOQUE =====
    // ================================================

    function crearElementoBloque(bloque, dia, hora) {
        const div = document.createElement('div');
        div.className = 'bloque-horario-item-tabla';
        div.draggable = !horarioBloqueado;
        div.dataset.id = bloque.id;
        div.dataset.dia = dia;
        div.dataset.hora = hora;
        div.style.backgroundColor = bloque.color || '#667eea';
        
        const duracion = bloque.duracion || 1;
        const alturaPorCelda = 38;
        const gapEntreCeldas = 1;
        const alturaTotal = (duracion * alturaPorCelda) + ((duracion - 1) * gapEntreCeldas);
        div.style.height = Math.max(alturaTotal, 30) + 'px';
        div.style.minHeight = '30px';

        const horaFin = hora + duracion;
        const icono = bloque.esClase ? '📚' : '📌';
        
        div.innerHTML = `
            <span class="bloque-titulo">${icono} ${bloque.nombre || 'Clase'}</span>
            ${bloque.aula ? `<span class="bloque-aula">📍 ${bloque.aula}</span>` : ''}
            ${bloque.profesor ? `<span class="bloque-aula" style="opacity:0.6;">👨‍🏫 ${bloque.profesor}</span>` : ''}
            <span class="bloque-hora">${formatearHora(hora)} - ${formatearHora(horaFin)}</span>
            <div class="bloque-acciones">
                <button class="btn-editar-bloque" onclick="event.stopPropagation(); Clases.editarBloque('${bloque.id}')" title="Editar">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="btn-eliminar-bloque" onclick="event.stopPropagation(); Clases.eliminarBloque('${bloque.id}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        if (!horarioBloqueado) {
            div.addEventListener('dragstart', function(e) {
                const id = this.dataset.id;
                e.dataTransfer.setData('text/plain', id);
                e.dataTransfer.effectAllowed = 'move';
                this.style.opacity = '0.6';
            });

            div.addEventListener('dragend', function(e) {
                this.style.opacity = '1';
                document.querySelectorAll('.celda-horario.drag-over').forEach(el => {
                    el.classList.remove('drag-over');
                });
            });
        }

        div.addEventListener('dblclick', function(e) {
            if (horarioBloqueado) {
                mostrarNotificacion('🔒 El horario está bloqueado', 'error');
                return;
            }
            e.stopPropagation();
            Clases.editarBloque(bloque.id);
        });

        return div;
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - MANEJAR DROP =====
    // ================================================

    function manejarDrop(e, celda) {
        if (horarioBloqueado) {
            mostrarNotificacion('🔒 El horario está bloqueado', 'error');
            return;
        }

        const dia = celda.dataset.dia;
        const hora = parseFloat(celda.dataset.hora);
        const nombre = getHorarioActual();
        const horario = horarios[nombre];
        
        let data = null;
        try {
            data = JSON.parse(e.dataTransfer.getData('text/plain'));
        } catch (err) {}
        
        const bloqueId = e.dataTransfer.getData('text/plain');
        
        if (bloqueId && !data) {
            const bloque = encontrarBloque(bloqueId);
            if (bloque) {
                moverBloque(bloque, bloqueId, dia, hora);
                return;
            }
        }
        
        if (data && data.nombre) {
            crearBloqueDesdeDatos(data, dia, hora);
            return;
        }
        
        mostrarNotificacion('⚠️ No se pudo colocar el bloque', 'error');
    }

    function moverBloque(bloque, bloqueId, dia, hora) {
        const nombre = getHorarioActual();
        const horario = horarios[nombre];
        const duracion = bloque.duracion || 1;

        if (hora + duracion > HORAS_FIN) {
            mostrarNotificacion('⚠️ El bloque no cabe en este horario', 'error');
            return;
        }

        let hayConflicto = false;
        for (let i = 0; i < duracion; i++) {
            const horaCheck = hora + i;
            if (horario[dia] && horario[dia][horaCheck] && horario[dia][horaCheck]?.id !== bloqueId) {
                hayConflicto = true;
                break;
            }
        }

        if (hayConflicto) {
            if (!confirm('Hay bloques en este rango. ¿Deseas reemplazarlos?')) {
                return;
            }
            for (let i = 0; i < duracion; i++) {
                const horaCheck = hora + i;
                if (horario[dia]) {
                    horario[dia][horaCheck] = null;
                }
            }
        }

        let posAnterior = encontrarPosicionBloque(bloqueId);
        if (posAnterior) {
            const duracionAnt = horario[posAnterior.dia]?.[posAnterior.hora]?.duracion || 1;
            for (let i = 0; i < duracionAnt; i++) {
                const horaCheck = posAnterior.hora + i;
                if (horario[posAnterior.dia]) {
                    horario[posAnterior.dia][horaCheck] = null;
                }
            }
        }

        if (!horario[dia]) horario[dia] = {};
        horario[dia][hora] = {
            ...bloque,
            id: bloqueId
        };

        for (let i = 1; i < duracion; i++) {
            if (horario[dia]) {
                horario[dia][hora + i] = null;
            }
        }

        guardarHorarios();
        renderizarHorarioConstructor();
        renderizarVistaPreviaClases();
        mostrarNotificacion('✅ Bloque movido correctamente');
    }

    function crearBloqueDesdeDatos(data, dia, hora) {
        const nombre = getHorarioActual();
        const horario = horarios[nombre];
        const duracion = data.duracion || 1;
        
        if (hora + duracion > HORAS_FIN) {
            mostrarNotificacion('⚠️ El bloque no cabe en este horario', 'error');
            return;
        }

        let hayConflicto = false;
        for (let i = 0; i < duracion; i++) {
            const horaCheck = hora + i;
            if (horario[dia] && horario[dia][horaCheck]) {
                hayConflicto = true;
                break;
            }
        }

        if (hayConflicto) {
            if (!confirm('Hay bloques en este rango. ¿Deseas reemplazarlos?')) {
                return;
            }
            for (let i = 0; i < duracion; i++) {
                const horaCheck = hora + i;
                if (horario[dia]) {
                    horario[dia][horaCheck] = null;
                }
            }
        }

        const id = generarId();
        if (!horario[dia]) horario[dia] = {};
        horario[dia][hora] = {
            id: id,
            nombre: data.nombre || 'Bloque',
            color: data.color || '#667eea',
            duracion: duracion,
            aula: data.aula || '',
            profesor: data.profesor || '',
            textoAdicional: data.textoAdicional || '',
            esClase: false
        };

        for (let i = 1; i < duracion; i++) {
            if (horario[dia]) {
                horario[dia][hora + i] = null;
            }
        }

        guardarHorarios();
        renderizarHorarioConstructor();
        renderizarVistaPreviaClases();
        mostrarNotificacion('✅ Bloque agregado al horario');
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - CLICK EN CELDA =====
    // ================================================

    function onCeldaClick(e) {
        if (horarioBloqueado) {
            mostrarNotificacion('🔒 El horario está bloqueado. Desbloquéalo para editar.', 'error');
            return;
        }

        const celda = e.currentTarget;
        const dia = celda.dataset.dia;
        const hora = parseFloat(celda.dataset.hora);
        const nombre = getHorarioActual();
        const horario = horarios[nombre];

        if (horario[dia] && horario[dia][hora] && horario[dia][hora]?.id) {
            return;
        }

        if (modoSeleccion) {
            if (!seleccionInicio) {
                seleccionInicio = { dia, hora };
                celda.style.background = 'rgba(102, 126, 234, 0.15)';
                celda.style.border = '2px solid #667eea';
            } else {
                const inicio = seleccionInicio;
                const fin = { dia, hora };
                
                if (inicio.dia !== fin.dia) {
                    mostrarNotificacion('⚠️ La selección debe ser en el mismo día', 'error');
                    resetearSeleccion();
                    return;
                }

                const inicioHora = Math.min(inicio.hora, fin.hora);
                const finHora = Math.max(inicio.hora, fin.hora);
                const duracion = finHora - inicioHora;

                if (duracion <= 0) {
                    mostrarNotificacion('⚠️ Selecciona un rango válido', 'error');
                    resetearSeleccion();
                    return;
                }

                let hayConflicto = false;
                for (let h = inicioHora; h < finHora; h += INTERVALO_HORAS) {
                    if (horario[inicio.dia] && horario[inicio.dia][h] && horario[inicio.dia][h]?.id) {
                        hayConflicto = true;
                        break;
                    }
                }

                if (hayConflicto) {
                    mostrarNotificacion('⚠️ Hay bloques en este rango', 'error');
                    resetearSeleccion();
                    return;
                }

                abrirModalCrearBloque(inicio.dia, inicioHora, duracion);
                resetearSeleccion();
            }
        }
    }

    function onCeldaDblClick(e) {
        if (horarioBloqueado) {
            mostrarNotificacion('🔒 El horario está bloqueado. Desbloquéalo para editar.', 'error');
            return;
        }

        const celda = e.currentTarget;
        const dia = celda.dataset.dia;
        const hora = parseFloat(celda.dataset.hora);
        const nombre = getHorarioActual();
        const horario = horarios[nombre];

        if (horario[dia] && horario[dia][hora] && horario[dia][hora]?.id) {
            const bloque = horario[dia][hora];
            Clases.editarBloque(bloque.id);
        } else {
            abrirModalCrearBloque(dia, hora, 1);
        }
    }

    function resetearSeleccion() {
        modoSeleccion = false;
        seleccionInicio = null;
        document.querySelectorAll('.celda-horario').forEach(el => {
            el.style.background = '';
            el.style.border = '';
        });
        const btn = document.getElementById('btn-seleccionar');
        if (btn) btn.classList.remove('active');
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - CONFIGURAR DRAG BLOQUES =====
    // ================================================

    function configurarDragBloques() {
        const items = document.querySelectorAll('.horario-bloque-item');
        
        items.forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            if (!horarioBloqueado) {
                newItem.addEventListener('dragstart', function(e) {
                    const duracion = parseFloat(this.dataset.duracion) || 1;
                    const nombre = this.querySelector('.bloque-nombre')?.textContent?.trim() || 'Bloque';
                    const color = this.dataset.color || '#667eea';
                    
                    const data = {
                        nombre: nombre,
                        color: color,
                        duracion: duracion,
                        aula: '',
                        profesor: '',
                        textoAdicional: ''
                    };
                    
                    e.dataTransfer.setData('text/plain', JSON.stringify(data));
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setDragImage(this, 30, 30);
                });

                newItem.addEventListener('dragend', function() {
                    document.querySelectorAll('.celda-horario.drag-over').forEach(el => {
                        el.classList.remove('drag-over');
                    });
                });
            }

            newItem.onclick = function() {
                if (horarioBloqueado) {
                    mostrarNotificacion('🔒 El horario está bloqueado. Desbloquéalo para editar.', 'error');
                    return;
                }

                const nombre = this.querySelector('.bloque-nombre')?.textContent?.trim() || 'Bloque';
                const color = this.dataset.color || '#667eea';
                const duracion = parseFloat(this.dataset.duracion) || 1;
                
                const hoy = new Date();
                const diaSemana = DIAS_SEMANA[hoy.getDay() === 0 ? 6 : hoy.getDay() - 1];
                const horaActual = hoy.getHours();
                const horario = horarios[getHorarioActual()];

                let horaEncontrada = null;
                for (let h = horaActual; h < HORAS_FIN; h += INTERVALO_HORAS) {
                    let espacioLibre = true;
                    for (let i = 0; i < duracion; i++) {
                        if (horario[diaSemana] && horario[diaSemana][h + i]) {
                            espacioLibre = false;
                            break;
                        }
                    }
                    if (espacioLibre && h + duracion <= HORAS_FIN) {
                        horaEncontrada = h;
                        break;
                    }
                }

                if (horaEncontrada === null) {
                    mostrarNotificacion(`⚠️ No hay espacio para ${duracion}h en ${diaSemana}`, 'error');
                    return;
                }

                abrirModalCrearBloque(diaSemana, horaEncontrada, duracion, nombre, color);
            };
        });
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - MODAL DE BLOQUE =====
    // ================================================

    function abrirModalCrearBloque(dia, hora, duracion, nombrePrecargado = '', colorPrecargado = '') {
        const modal = document.getElementById('modal-crear-bloque');
        if (!modal) {
            console.warn('No se encontró modal-crear-bloque');
            return;
        }

        document.getElementById('bloque-dia').value = dia;
        document.getElementById('bloque-hora-inicio').value = formatearHoraMinutos(hora);
        document.getElementById('bloque-duracion').value = duracion;
        document.getElementById('bloque-nombre').value = nombrePrecargado || '';
        document.getElementById('bloque-aula').value = '';
        document.getElementById('bloque-profesor').value = '';
        document.getElementById('bloque-color').value = colorPrecargado || '#667eea';
        document.getElementById('bloque-texto-adicional').value = '';
        document.getElementById('bloque-id').value = '';
        document.getElementById('modal-titulo-bloque').textContent = nombrePrecargado ? '✏️ Editar Bloque' : '➕ Crear Bloque';

        bloqueEditando = null;
        modal.classList.add('active');
        setTimeout(() => document.getElementById('bloque-nombre').focus(), 100);
    }

    window.Clases = window.Clases || {};
    window.Clases.editarBloque = function(id) {
        if (horarioBloqueado) {
            mostrarNotificacion('🔒 El horario está bloqueado. Desbloquéalo para editar.', 'error');
            return;
        }

        const pos = encontrarPosicionBloque(id);
        if (!pos) {
            mostrarNotificacion('⚠️ No se encontró el bloque', 'error');
            return;
        }

        const nombre = getHorarioActual();
        const horario = horarios[nombre];
        const bloque = horario[pos.dia][pos.hora];
        if (!bloque) return;

        const modal = document.getElementById('modal-crear-bloque');
        if (!modal) return;

        document.getElementById('bloque-id').value = id;
        document.getElementById('bloque-dia').value = pos.dia;
        document.getElementById('bloque-hora-inicio').value = formatearHoraMinutos(pos.hora);
        document.getElementById('bloque-duracion').value = bloque.duracion || 1;
        document.getElementById('bloque-nombre').value = bloque.nombre || '';
        document.getElementById('bloque-aula').value = bloque.aula || '';
        document.getElementById('bloque-profesor').value = bloque.profesor || '';
        document.getElementById('bloque-color').value = bloque.color || '#667eea';
        document.getElementById('bloque-texto-adicional').value = bloque.textoAdicional || '';
        document.getElementById('modal-titulo-bloque').textContent = '✏️ Editar Bloque';

        bloqueEditando = id;
        modal.classList.add('active');
        setTimeout(() => document.getElementById('bloque-nombre').focus(), 100);
    };

    window.Clases.eliminarBloque = function(id) {
        if (horarioBloqueado) {
            mostrarNotificacion('🔒 El horario está bloqueado. Desbloquéalo para editar.', 'error');
            return;
        }

        if (!confirm('¿Eliminar este bloque?')) return;

        const pos = encontrarPosicionBloque(id);
        if (!pos) return;

        const nombre = getHorarioActual();
        const horario = horarios[nombre];
        const bloque = horario[pos.dia][pos.hora];
        const duracion = bloque?.duracion || 1;

        for (let i = 0; i < duracion; i++) {
            const horaCheck = pos.hora + i;
            if (horario[pos.dia]) {
                horario[pos.dia][horaCheck] = null;
            }
        }

        guardarHorarios();
        renderizarHorarioConstructor();
        renderizarVistaPreviaClases();
        mostrarNotificacion('🗑️ Bloque eliminado');
    };

    function guardarBloque() {
        const id = document.getElementById('bloque-id').value || generarId();
        const dia = document.getElementById('bloque-dia').value;
        const horaStr = document.getElementById('bloque-hora-inicio').value;
        const duracion = parseFloat(document.getElementById('bloque-duracion').value) || 1;
        const nombre = document.getElementById('bloque-nombre').value.trim();
        const aula = document.getElementById('bloque-aula').value.trim();
        const profesor = document.getElementById('bloque-profesor').value.trim();
        const color = document.getElementById('bloque-color').value;
        const textoAdicional = document.getElementById('bloque-texto-adicional').value.trim();

        if (!nombre) {
            mostrarNotificacion('⚠️ Ingresa el nombre de la clase', 'error');
            return;
        }

        const [horas, minutos] = horaStr.split(':').map(Number);
        const hora = horas + (minutos / 60);

        if (hora + duracion > HORAS_FIN) {
            mostrarNotificacion(`⚠️ El bloque no cabe (termina después de las ${HORAS_FIN}:00)`, 'error');
            return;
        }

        const nombreHorario = getHorarioActual();
        const horario = horarios[nombreHorario];

        if (!bloqueEditando) {
            let hayConflicto = false;
            for (let i = 0; i < duracion; i++) {
                const horaCheck = hora + i;
                if (horario[dia] && horario[dia][horaCheck] && horario[dia][horaCheck]?.id) {
                    hayConflicto = true;
                    break;
                }
            }
            if (hayConflicto) {
                if (!confirm('Hay bloques en este rango. ¿Deseas reemplazarlos?')) {
                    return;
                }
                for (let i = 0; i < duracion; i++) {
                    const horaCheck = hora + i;
                    if (horario[dia]) {
                        horario[dia][horaCheck] = null;
                    }
                }
            }
        } else {
            const pos = encontrarPosicionBloque(bloqueEditando);
            if (pos) {
                const bloqueAnt = horario[pos.dia][pos.hora];
                const duracionAnt = bloqueAnt?.duracion || 1;
                for (let i = 0; i < duracionAnt; i++) {
                    const horaCheck = pos.hora + i;
                    if (horario[pos.dia]) {
                        horario[pos.dia][horaCheck] = null;
                    }
                }
            }
        }

        if (!horario[dia]) horario[dia] = {};
        horario[dia][hora] = {
            id: id,
            nombre: nombre,
            aula: aula,
            profesor: profesor,
            color: color,
            textoAdicional: textoAdicional,
            duracion: duracion,
            esClase: false
        };

        for (let i = 1; i < duracion; i++) {
            const horaCheck = hora + i;
            if (horario[dia]) {
                horario[dia][horaCheck] = null;
            }
        }

        cerrarModalBloque();
        guardarHorarios();
        renderizarHorarioConstructor();
        renderizarVistaPreviaClases();
        mostrarNotificacion('✅ Bloque agregado al horario');
    }

    function cerrarModalBloque() {
        const modal = document.getElementById('modal-crear-bloque');
        if (modal) modal.classList.remove('active');
        bloqueEditando = null;
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - BLOQUE PERSONALIZADO =====
    // ================================================

    function agregarBloquePersonalizado() {
        const nombre = document.getElementById('bloque-personalizado-nombre').value.trim();
        const color = document.getElementById('bloque-personalizado-color').value;
        const duracion = parseFloat(document.getElementById('bloque-personalizado-duracion').value) || 1;

        if (!nombre) {
            mostrarNotificacion('⚠️ Ingresa un nombre para el bloque', 'error');
            return;
        }

        if (duracion < 0.5 || duracion > 12) {
            mostrarNotificacion('⚠️ La duración debe ser entre 0.5 y 12 horas', 'error');
            return;
        }

        const grid = document.getElementById('bloques-grid');
        const div = document.createElement('div');
        div.className = 'horario-bloque-item';
        div.dataset.color = color;
        div.dataset.duracion = duracion;
        div.innerHTML = `
            <div class="bloque-color" style="background: ${color};"></div>
            <span class="bloque-nombre">${nombre}</span>
            <span class="bloque-duracion">${duracion}h</span>
        `;
        
        if (!horarioBloqueado) {
            div.addEventListener('dragstart', function(e) {
                const data = {
                    nombre: nombre,
                    color: color,
                    duracion: duracion,
                    aula: '',
                    profesor: '',
                    textoAdicional: ''
                };
                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setDragImage(this, 30, 30);
            });
            
            div.addEventListener('dragend', function() {
                document.querySelectorAll('.celda-horario.drag-over').forEach(el => {
                    el.classList.remove('drag-over');
                });
            });
        }
        
        div.onclick = function() {
            if (horarioBloqueado) {
                mostrarNotificacion('🔒 El horario está bloqueado. Desbloquéalo para editar.', 'error');
                return;
            }

            const hoy = new Date();
            const diaSemana = DIAS_SEMANA[hoy.getDay() === 0 ? 6 : hoy.getDay() - 1];
            const horaActual = hoy.getHours();
            const horario = horarios[getHorarioActual()];

            let horaEncontrada = null;
            for (let h = horaActual; h < HORAS_FIN; h += INTERVALO_HORAS) {
                let espacioLibre = true;
                for (let i = 0; i < duracion; i++) {
                    if (horario[diaSemana] && horario[diaSemana][h + i]) {
                        espacioLibre = false;
                        break;
                    }
                }
                if (espacioLibre && h + duracion <= HORAS_FIN) {
                    horaEncontrada = h;
                    break;
                }
            }

            if (horaEncontrada === null) {
                mostrarNotificacion(`⚠️ No hay espacio para ${duracion}h en ${diaSemana}`, 'error');
                return;
            }

            abrirModalCrearBloque(diaSemana, horaEncontrada, duracion, nombre, color);
        };
        
        grid.appendChild(div);

        document.getElementById('bloque-personalizado-nombre').value = '';
        document.getElementById('bloque-personalizado-duracion').value = '1';
        mostrarNotificacion('✅ Bloque personalizado creado');
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - LIMPIAR =====
    // ================================================

    function limpiarHorario() {
        if (!confirm('¿Limpiar todo el horario actual?')) return;

        const nombre = getHorarioActual();
        const horario = horarios[nombre];
        DIAS_SEMANA.forEach(dia => {
            for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
                if (horario[dia]) {
                    horario[dia][h] = null;
                }
            }
        });

        guardarHorarios();
        renderizarHorarioConstructor();
        renderizarVistaPreviaClases();
        mostrarNotificacion('🗑️ Horario limpiado');
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO - EXPORTAR =====
    // ================================================

    function exportarPNG() {
        const wrapper = document.querySelector('.horario-tabla-wrapper');
        if (!wrapper) {
            mostrarNotificacion('⚠️ No se encontró el horario', 'error');
            return;
        }

        mostrarNotificacion('📸 Generando imagen...');
        
        if (typeof html2canvas !== 'undefined') {
            html2canvas(wrapper, {
                scale: 2,
                backgroundColor: '#ffffff',
                allowTaint: true,
                useCORS: true,
                logging: false
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'horario.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                mostrarNotificacion('✅ Imagen exportada');
            }).catch(err => {
                console.error('Error exportando PNG:', err);
                mostrarNotificacion('❌ Error al exportar imagen', 'error');
            });
        } else {
            mostrarNotificacion('⚠️ html2canvas no está cargado', 'error');
        }
    }

    function exportarPDF() {
        mostrarNotificacion('📄 Generando PDF...');
        
        const wrapper = document.querySelector('.horario-tabla-wrapper');
        if (!wrapper) {
            mostrarNotificacion('⚠️ No se encontró el horario', 'error');
            return;
        }

        if (typeof html2pdf !== 'undefined') {
            const opt = {
                margin: 0.5,
                filename: 'horario.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' }
            };
            html2pdf().set(opt).from(wrapper).save().then(() => {
                mostrarNotificacion('✅ PDF exportado');
            }).catch(err => {
                console.error('Error exportando PDF:', err);
                mostrarNotificacion('❌ Error al exportar PDF', 'error');
            });
        } else {
            mostrarNotificacion('⚠️ html2pdf no está cargado', 'error');
        }
    }

    // ================================================
    // ===== RENDERIZAR TODO =====
    // ================================================

    function renderizarTodo() {
        actualizarEstados();
        renderizarCalendario();
        renderizarListaClases();
        verificarClasesProximas();
        actualizarContador();
        renderizarHorarioConstructor();
        renderizarVistaPreviaClases();
        renderizarTabsHorarios();
        actualizarUIBloqueo();
    }

    // ================================================
    // ===== INICIAR =====
    // ================================================

    function iniciarVerificador() {
        if (intervalVerificador) clearInterval(intervalVerificador);

        intervalVerificador = setInterval(() => {
            actualizarEstados();
            verificarClasesProximas();
            renderizarListaClases();
            actualizarContador();
        }, 30000);
    }

    function pedirPermisoNotificaciones() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    function init() {
        console.log('🟡 Clases.init()');
        cargarClases();
        cargarHorarios();
        cargarEstadoBloqueo();
        horarioActual = getHorarioActual();
        renderizarTodo();
        setTimeout(() => {
            configurarDragBloques();
        }, 300);
        iniciarVerificador();
        pedirPermisoNotificaciones();

        const btnGuardarBloque = document.getElementById('btn-guardar-bloque');
        if (btnGuardarBloque) btnGuardarBloque.addEventListener('click', guardarBloque);

        const btnCerrarModal = document.getElementById('btn-cerrar-modal-bloque');
        if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModalBloque);
        
        const btnCancelarModal = document.getElementById('btn-cancelar-modal-bloque');
        if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModalBloque);
        
        const modal = document.getElementById('modal-crear-bloque');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) cerrarModalBloque();
            });
        }

        const btnGuardarClase = document.getElementById('btn-guardar-clase');
        if (btnGuardarClase) btnGuardarClase.addEventListener('click', guardarClaseForm);

        const btnSeleccionar = document.getElementById('btn-seleccionar');
        if (btnSeleccionar) {
            btnSeleccionar.addEventListener('click', function() {
                if (horarioBloqueado) {
                    mostrarNotificacion('🔒 El horario está bloqueado. Desbloquéalo para editar.', 'error');
                    return;
                }
                modoSeleccion = !modoSeleccion;
                this.classList.toggle('active');
                if (!modoSeleccion) resetearSeleccion();
            });
        }

        const btnGuardar = document.getElementById('btn-guardar-horario');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', function() {
                guardarHorarioActual();
                // Resetear flag de cambios pendientes
                cambiosPendientes = false;
            });
        }

        const btnPNG = document.getElementById('btn-exportar-png');
        if (btnPNG) btnPNG.addEventListener('click', exportarPNG);

        const btnPDF = document.getElementById('btn-exportar-pdf');
        if (btnPDF) btnPDF.addEventListener('click', exportarPDF);

        const btnLimpiar = document.getElementById('btn-limpiar-horario');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', limpiarHorario);
        }

        // Los botones de bloqueo usan onclick en el HTML
    }

    // ================================================
    // ===== EXPOSICIÓN DE FUNCIONES GLOBALES =====
    // ================================================

    window.cambiarTab = cambiarTab;
    window.abrirAgregarClase = abrirAgregarClase;
    window.abrirEditarClase = abrirEditarClase;
    window.cerrarModalAgregarClase = cerrarModalAgregarClase;
    window.cerrarModalVerClase = cerrarModalVerClase;
    window.agregarClase = guardarClaseForm;
    window.eliminarClase = eliminarClase;
    window.unirseAClase = unirseAClase;
    window.cambiarMes = cambiarMes;
    window.cambiarVista = cambiarVista;
    window.aplicarFiltros = aplicarFiltros;
    window.actualizarCamposModalidad = actualizarCamposModalidad;
    window.mostrarOpcionesRepeticion = mostrarOpcionesRepeticion;
    window.agregarHorarioAdicional = agregarHorarioAdicional;
    window.eliminarHorarioAdicional = eliminarHorarioAdicional;
    window.irAHoy = irAHoy;
    window.limpiarHorario = limpiarHorario;
    window.guardarHorario = guardarHorarioActual;
    window.agregarBloquePersonalizado = agregarBloquePersonalizado;
    window.crearNuevoHorario = crearNuevoHorario;
    window.toggleBloqueoHorario = toggleBloqueoHorario;
    window.Clases.cambiarHorario = cambiarHorario;
    window.Clases.eliminarHorario = eliminarHorario;

    return {
        init,
        renderizarTodo,
        verClase: window.Clases.verClase,
        seleccionarDia: window.Clases.seleccionarDia,
        unirseAClase: unirseAClase,
        eliminarClase: eliminarClase,
        abrirAgregarClase: abrirAgregarClase,
        abrirEditarClase: abrirEditarClase,
        agregarClase: guardarClaseForm,
        cambiarMes: cambiarMes,
        cambiarVista: cambiarVista,
        aplicarFiltros: aplicarFiltros,
        actualizarCamposModalidad: actualizarCamposModalidad,
        mostrarOpcionesRepeticion: mostrarOpcionesRepeticion,
        agregarHorarioAdicional: agregarHorarioAdicional,
        eliminarHorarioAdicional: eliminarHorarioAdicional,
        irAHoy: irAHoy,
        limpiarHorario: limpiarHorario,
        guardarHorario: guardarHorarioActual,
        agregarBloquePersonalizado: agregarBloquePersonalizado,
        cambiarTab: cambiarTab,
        cerrarModalAgregarClase: cerrarModalAgregarClase,
        cerrarModalVerClase: cerrarModalVerClase,
        crearNuevoHorario: crearNuevoHorario,
        toggleBloqueoHorario: toggleBloqueoHorario,
        cambiarHorario: cambiarHorario,
        eliminarHorario: eliminarHorario,
        editarBloque: window.Clases.editarBloque,
        eliminarBloque: window.Clases.eliminarBloque,
        exportarPNG: exportarPNG,
        exportarPDF: exportarPDF
    };
})();

window.Clases = Clases;
console.log('✅ clases.js cargado');