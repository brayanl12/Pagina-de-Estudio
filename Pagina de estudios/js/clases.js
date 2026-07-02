// js/clases.js - Módulo de Clases completo
console.log('🟡 clases.js cargado');

const Clases = (function() {
    console.log('🟡 Inicializando módulo Clases');

    // ================================================
    // ===== CONFIGURACIÓN =====
    // ================================================

    const CLASES_KEY = 'estudio_clases';
    const HORARIO_KEY = 'horario_semanal';

    const HORAS_INICIO = 6;
    const HORAS_FIN = 23;
    const INTERVALO_HORAS = 1;
    const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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

    let clases = [];
    let claseSeleccionada = null;
    let mesActual = new Date().getMonth();
    let añoActual = new Date().getFullYear();
    let intervalVerificador = null;
    let vistaActual = 'grid';
    let modalidadFiltro = 'todas';
    let estadoFiltro = 'todas';
    let horarioSemanal = {};
    let bloqueArrastrado = null;

    // ================================================
    // ===== FUNCIONES DE TABS =====
    // ================================================

    function cambiarTab(tab) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

        const tabContent = document.getElementById(`tab-${tab}`);
        if (tabContent) tabContent.classList.add('active');

        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
        if (tabBtn) tabBtn.classList.add('active');

        if (tab === 'horario') {
            setTimeout(() => {
                renderizarHorario();
                configurarDragBloques();
            }, 200);
        }
    }

    window.cambiarTab = cambiarTab;

    // ================================================
    // ===== FUNCIONES DE CLASES (EXISTENTES) =====
    // ================================================

    function generarId() {
        return Date.now() + Math.random() * 1000;
    }

    function formatearFecha(fechaStr) {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }

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

    window.unirseAClase = function() {
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
    };

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
                <div class="clase-item" onclick="Clases.verClase(${clase.id})">
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
                            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); Clases.verClase(${clase.id})">
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
        document.getElementById('ver-clase-duracion').textContent = `${clase.duracion || 60} min`;
        document.getElementById('ver-clase-plataforma').textContent = clase.plataforma || 'Sin plataforma';
        document.getElementById('ver-clase-enlace').textContent = clase.enlace || 'Sin enlace';
        document.getElementById('ver-clase-enlace').href = clase.enlace || '#';
        document.getElementById('ver-clase-ubicacion').textContent = clase.ubicacion || 'No especificada';

        const repeticionTextos = {
            'ninguna': 'No repetir',
            'diaria': '📅 Diaria',
            'semanal': '📅 Semanal',
            'quincenal': '📅 Quincenal',
            'mensual': '📅 Mensual'
        };
        document.getElementById('ver-clase-repeticion').textContent = repeticionTextos[clase.repeticion] || 'Ninguna';

        const modalidadInfo = clase.modalidad || 'virtual';
        const modalidadIconos = {
            'virtual': '💻 Virtual',
            'presencial': '🏫 Presencial',
            'hibrida': '🔄 Híbrida'
        };
        const modalidadClases = {
            'virtual': 'virtual',
            'presencial': 'presencial',
            'hibrida': 'hibrida'
        };
        const modalidadEl = document.getElementById('ver-clase-modalidad');
        if (modalidadEl) {
            modalidadEl.textContent = modalidadIconos[modalidadInfo] || '💻 Virtual';
            modalidadEl.className = `clase-modalidad ${modalidadClases[modalidadInfo] || 'virtual'}`;
        }

        const enlaceRow = document.getElementById('ver-clase-enlace-row');
        const ubicacionRow = document.getElementById('ver-clase-ubicacion-row');
        if (modalidadInfo === 'virtual') {
            enlaceRow.style.display = 'block';
            ubicacionRow.style.display = 'none';
        } else if (modalidadInfo === 'presencial') {
            enlaceRow.style.display = 'none';
            ubicacionRow.style.display = 'block';
        } else {
            enlaceRow.style.display = 'block';
            ubicacionRow.style.display = 'block';
        }

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

    function agregarClase() {
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

        alert(`✅ ${repeticion !== 'ninguna' ? 'Clases recurrentes' : 'Clase'} agregada correctamente`);
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
                    id: generarId() + contador,
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
                        id: generarId() + contador,
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

    window.eliminarClase = function() {
        if (!claseSeleccionada) return;

        if (!confirm(`¿Eliminar la clase "${claseSeleccionada.nombre}"?`)) return;

        clases = clases.filter(c => c.id !== claseSeleccionada.id);
        guardarClases();
        renderizarTodo();
        cerrarModalVerClase();

        alert('✅ Clase eliminada');
    };

    function cerrarModalAgregarClase() {
        document.getElementById('modal-agregar-clase').classList.remove('active');
    }

    function cerrarModalVerClase() {
        document.getElementById('modal-ver-clase').classList.remove('active');
    }

    // ================================================
    // ===== CONSTRUCTOR DE HORARIO =====
    // ================================================

    function cargarHorario() {
        const stored = localStorage.getItem(HORARIO_KEY);
        if (stored) {
            try {
                horarioSemanal = JSON.parse(stored);
                DIAS_SEMANA.forEach(dia => {
                    if (horarioSemanal[dia]) {
                        Object.keys(horarioSemanal[dia]).forEach(hora => {
                            const bloque = horarioSemanal[dia][hora];
                            if (bloque && !bloque.duracion) {
                                bloque.duracion = 1;
                            }
                        });
                    }
                });
                return;
            } catch (e) {}
        }
        horarioSemanal = {};
        DIAS_SEMANA.forEach(dia => {
            horarioSemanal[dia] = {};
            for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
                horarioSemanal[dia][h] = null;
            }
        });
    }

    function guardarHorario() {
        localStorage.setItem(HORARIO_KEY, JSON.stringify(horarioSemanal));
        alert('✅ Horario guardado correctamente');
    }

    // ===== FUNCIÓN PARA ALARGAR BLOQUES =====
    function alargarBloques() {
        DIAS_SEMANA.forEach(dia => {
            if (!horarioSemanal[dia]) return;

            let bloqueActual = null;
            let horaInicio = null;
            let duracionTotal = 0;

            for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
                const bloque = horarioSemanal[dia][h];

                if (bloque) {
                    if (!bloqueActual) {
                        bloqueActual = { ...bloque };
                        horaInicio = h;
                        duracionTotal = 1;
                    } else if (bloque.tipo === bloqueActual.tipo &&
                               bloque.nombre === bloqueActual.nombre &&
                               bloque.color === bloqueActual.color) {
                        duracionTotal++;
                        horarioSemanal[dia][h] = null;
                    } else {
                        if (horaInicio !== null) {
                            horarioSemanal[dia][horaInicio] = {
                                ...bloqueActual,
                                duracion: duracionTotal
                            };
                        }
                        bloqueActual = { ...bloque };
                        horaInicio = h;
                        duracionTotal = 1;
                    }
                } else {
                    if (bloqueActual && horaInicio !== null) {
                        if (duracionTotal > 1) {
                            horarioSemanal[dia][horaInicio] = {
                                ...bloqueActual,
                                duracion: duracionTotal
                            };
                        } else {
                            horarioSemanal[dia][horaInicio] = bloqueActual;
                        }
                    }
                    bloqueActual = null;
                    horaInicio = null;
                    duracionTotal = 0;
                }
            }

            if (bloqueActual && horaInicio !== null) {
                if (duracionTotal > 1) {
                    horarioSemanal[dia][horaInicio] = {
                        ...bloqueActual,
                        duracion: duracionTotal
                    };
                } else {
                    horarioSemanal[dia][horaInicio] = bloqueActual;
                }
            }
        });
    }

    function renderizarHorario() {
        const grid = document.getElementById('horario-grid');
        if (!grid) return;

        // ALARGAR BLOQUES ANTES DE RENDERIZAR
        alargarBloques();

        grid.innerHTML = '';

        for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
            const fila = document.createElement('div');
            fila.className = 'horario-fila';
            fila.dataset.hora = h;

            const horaLabel = document.createElement('div');
            horaLabel.className = 'horario-hora';
            const horaFormateada = h < 10 ? `0${h}:00` : `${h}:00`;
            horaLabel.textContent = horaFormateada;
            fila.appendChild(horaLabel);

            DIAS_SEMANA.forEach(dia => {
                const celda = document.createElement('div');
                celda.className = 'horario-celda';
                celda.dataset.dia = dia;
                celda.dataset.hora = h;

                celda.addEventListener('dragover', handleDragOver);
                celda.addEventListener('dragenter', handleDragEnter);
                celda.addEventListener('dragleave', handleDragLeave);
                celda.addEventListener('drop', handleDrop);

                celda.addEventListener('click', function(e) {
                    if (e.target === this) {
                        abrirSelectorBloque(this);
                    }
                });

                const bloque = horarioSemanal[dia]?.[h];
                if (bloque) {
                    const duracion = bloque.duracion || 1;
                    const bloqueDiv = document.createElement('div');
                    bloqueDiv.className = 'bloque-horario';
                    if (duracion > 1) {
                        bloqueDiv.classList.add('combinado');
                        // Ocupar toda la celda
                        bloqueDiv.style.height = '100%';
                        bloqueDiv.style.minHeight = (duracion * 42) + 'px';
                    }
                    bloqueDiv.style.backgroundColor = bloque.color || COLORES_BLOQUES[bloque.tipo] || '#667eea';

                    const horaFin = h + duracion;
                    const horaFinStr = horaFin < 10 ? `0${horaFin}:00` : `${horaFin}:00`;
                    
                    bloqueDiv.innerHTML = `
                        <strong>${bloque.icono || '📌'} ${bloque.nombre}</strong>
                        <span class="bloque-tiempo">${horaFormateada} - ${horaFinStr}</span>
                        ${duracion > 1 ? `<span style="font-size:0.5rem; opacity:0.7;">(${duracion}h)</span>` : ''}
                    `;
                    bloqueDiv.title = `${bloque.nombre} - ${horaFormateada} a ${horaFinStr}`;
                    bloqueDiv.dataset.dia = dia;
                    bloqueDiv.dataset.hora = h;
                    bloqueDiv.dataset.duracion = duracion;

                    // Botón eliminar
                    const btnEliminar = document.createElement('button');
                    btnEliminar.className = 'btn-eliminar-bloque';
                    btnEliminar.textContent = '✕';
                    btnEliminar.onclick = function(e) {
                        e.stopPropagation();
                        eliminarBloque(dia, h);
                    };
                    bloqueDiv.appendChild(btnEliminar);

                    bloqueDiv.onclick = function(e) {
                        e.stopPropagation();
                        verDetalleBloque(dia, h);
                    };

                    celda.appendChild(bloqueDiv);
                }

                fila.appendChild(celda);
            });

            grid.appendChild(fila);
        }
    }

    // ================================================
    // ===== DRAG & DROP =====
    // ================================================

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    function handleDragEnter(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (!bloqueArrastrado) return;

        const dia = this.dataset.dia;
        const hora = parseInt(this.dataset.hora);
        const duracion = parseFloat(bloqueArrastrado.duracion) || 1;

        if (hora + duracion > HORAS_FIN) {
            alert(`El bloque de ${duracion}h no cabe en el horario (termina a las ${hora + duracion}:00)`);
            return;
        }

        let celdasOcupadas = false;
        for (let i = 0; i < duracion; i++) {
            if (horarioSemanal[dia] && horarioSemanal[dia][hora + i]) {
                celdasOcupadas = true;
                break;
            }
        }

        if (celdasOcupadas) {
            if (!confirm(`Hay bloques en el rango de ${duracion}h. ¿Reemplazar?`)) {
                return;
            }
            for (let i = 0; i < duracion; i++) {
                if (horarioSemanal[dia]) {
                    horarioSemanal[dia][hora + i] = null;
                }
            }
        }

        if (bloqueArrastrado.tipo === 'clase') {
            const repetir = confirm(`¿Quieres que esta clase se repita en otros días de la semana?`);
            if (repetir) {
                const dias = prompt('Ingresa los días de la semana (1=Lun,2=Mar,3=Mié,4=Jue,5=Vie,6=Sáb,0=Dom) separados por comas:\nEj: 1,3,5 para Lun, Mié, Vie');
                if (dias) {
                    const diasArray = dias.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d >= 0 && d <= 6);
                    if (diasArray.length > 0) {
                        diasArray.forEach(d => {
                            const diaNombre = DIAS_SEMANA[d === 0 ? 6 : d - 1];
                            if (!horarioSemanal[diaNombre]) horarioSemanal[diaNombre] = {};
                            let espacioLibre = true;
                            for (let i = 0; i < duracion; i++) {
                                if (horarioSemanal[diaNombre][hora + i]) {
                                    espacioLibre = false;
                                    break;
                                }
                            }
                            if (espacioLibre) {
                                horarioSemanal[diaNombre][hora] = {
                                    tipo: bloqueArrastrado.tipo,
                                    nombre: bloqueArrastrado.nombre,
                                    color: bloqueArrastrado.color,
                                    icono: bloqueArrastrado.icono,
                                    descripcion: `${bloqueArrastrado.descripcion || ''} (recurrente)`,
                                    duracion: duracion
                                };
                                for (let i = 1; i < duracion; i++) {
                                    horarioSemanal[diaNombre][hora + i] = null;
                                }
                            }
                        });
                        alargarBloques();
                        renderizarHorario();
                        guardarHorario();
                        return;
                    }
                }
            }
        }

        if (!horarioSemanal[dia]) horarioSemanal[dia] = {};
        horarioSemanal[dia][hora] = {
            tipo: bloqueArrastrado.tipo,
            nombre: bloqueArrastrado.nombre,
            color: bloqueArrastrado.color,
            icono: bloqueArrastrado.icono,
            descripcion: bloqueArrastrado.descripcion || '',
            duracion: duracion
        };

        for (let i = 1; i < duracion; i++) {
            if (horarioSemanal[dia]) {
                horarioSemanal[dia][hora + i] = null;
            }
        }

        alargarBloques();
        renderizarHorario();
        guardarHorario();
    }

    function configurarDragBloques() {
        document.querySelectorAll('.bloque-item').forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            newItem.addEventListener('dragstart', function(e) {
                const duracion = parseFloat(this.dataset.duracion) || 1;
                bloqueArrastrado = {
                    tipo: this.dataset.tipo || 'personalizado',
                    nombre: this.querySelector('span')?.textContent || 'Bloque',
                    color: this.dataset.color || '#667eea',
                    icono: this.textContent.match(/^.{1,2}/)?.[0] || '📌',
                    descripcion: this.querySelector('span')?.textContent || '',
                    duracion: duracion
                };
                e.dataTransfer.effectAllowed = 'copy';
            });

            newItem.addEventListener('dragend', function() {
                bloqueArrastrado = null;
                document.querySelectorAll('.horario-celda.drag-over').forEach(el => {
                    el.classList.remove('drag-over');
                });
            });

            newItem.onclick = function() {
                const tipo = this.dataset.tipo;
                if (tipo) crearBloqueRapido(tipo);
            };
        });
    }

    // ================================================
    // ===== OTRAS FUNCIONES DEL HORARIO =====
    // ================================================

    function abrirSelectorBloque(celda) {
        const dia = celda.dataset.dia;
        const hora = parseInt(celda.dataset.hora);

        const tipos = ['clase', 'estudio', 'almuerzo', 'descanso', 'dormir', 'ejercicio', 'ocio', 'trabajo'];
        const opciones = tipos.map((t, i) => `${i+1}. ${ICONOS_BLOQUES[t]} ${NOMBRES_BLOQUES[t]}`).join('\n');

        const seleccion = prompt(
            `Selecciona un bloque para ${dia} a las ${hora}:00:\n\n${opciones}\n\nIngresa el número (1-8):`
        );

        if (!seleccion) return;

        const index = parseInt(seleccion) - 1;
        if (index < 0 || index >= tipos.length) {
            alert('Opción no válida');
            return;
        }

        const tipo = tipos[index];
        const duracion = prompt(`¿Cuántas horas durará el bloque? (0.5 - 8)`, '1');
        const duracionNum = parseFloat(duracion);
        if (isNaN(duracionNum) || duracionNum <= 0 || duracionNum > 8) {
            alert('Duración no válida');
            return;
        }

        if (tipo === 'clase') {
            const repetir = confirm(`¿Quieres que esta clase se repita en otros días de la semana?`);
            if (repetir) {
                const dias = prompt('Ingresa los días de la semana (1=Lun,2=Mar,3=Mié,4=Jue,5=Vie,6=Sáb,0=Dom) separados por comas:\nEj: 1,3,5 para Lun, Mié, Vie');
                if (dias) {
                    const diasArray = dias.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d >= 0 && d <= 6);
                    if (diasArray.length > 0) {
                        diasArray.forEach(d => {
                            const diaNombre = DIAS_SEMANA[d === 0 ? 6 : d - 1];
                            if (!horarioSemanal[diaNombre]) horarioSemanal[diaNombre] = {};
                            let espacioLibre = true;
                            for (let i = 0; i < duracionNum; i++) {
                                if (horarioSemanal[diaNombre][hora + i]) {
                                    espacioLibre = false;
                                    break;
                                }
                            }
                            if (espacioLibre) {
                                horarioSemanal[diaNombre][hora] = {
                                    tipo: tipo,
                                    nombre: NOMBRES_BLOQUES[tipo] || tipo,
                                    color: COLORES_BLOQUES[tipo] || '#667eea',
                                    icono: ICONOS_BLOQUES[tipo] || '📌',
                                    descripcion: `Bloque de ${NOMBRES_BLOQUES[tipo] || tipo} (recurrente)`,
                                    duracion: duracionNum
                                };
                                for (let i = 1; i < duracionNum; i++) {
                                    horarioSemanal[diaNombre][hora + i] = null;
                                }
                            }
                        });
                        alargarBloques();
                        renderizarHorario();
                        guardarHorario();
                        return;
                    }
                }
            }
        }

        agregarBloqueCelda(dia, hora, tipo, duracionNum);
    }

    function agregarBloqueCelda(dia, hora, tipo, duracion = 1) {
        if (hora + duracion > HORAS_FIN) {
            alert(`El bloque de ${duracion}h no cabe en el horario (termina a las ${hora + duracion}:00)`);
            return;
        }

        let espacioLibre = true;
        for (let i = 0; i < duracion; i++) {
            if (horarioSemanal[dia] && horarioSemanal[dia][hora + i]) {
                espacioLibre = false;
                break;
            }
        }

        if (!espacioLibre) {
            if (!confirm(`Hay bloques en el rango de ${duracion}h. ¿Reemplazar?`)) {
                return;
            }
            for (let i = 0; i < duracion; i++) {
                if (horarioSemanal[dia]) {
                    horarioSemanal[dia][hora + i] = null;
                }
            }
        }

        if (!horarioSemanal[dia]) horarioSemanal[dia] = {};
        horarioSemanal[dia][hora] = {
            tipo: tipo,
            nombre: NOMBRES_BLOQUES[tipo] || tipo,
            color: COLORES_BLOQUES[tipo] || '#667eea',
            icono: ICONOS_BLOQUES[tipo] || '📌',
            descripcion: `Bloque de ${NOMBRES_BLOQUES[tipo] || tipo}`,
            duracion: duracion
        };

        for (let i = 1; i < duracion; i++) {
            if (horarioSemanal[dia]) {
                horarioSemanal[dia][hora + i] = null;
            }
        }

        alargarBloques();
        renderizarHorario();
        guardarHorario();
    }

    function crearBloqueRapido(tipo) {
        const hoy = new Date();
        const diaSemana = DIAS_SEMANA[hoy.getDay() === 0 ? 6 : hoy.getDay() - 1];
        const horaActual = hoy.getHours();

        const duracion = prompt(`¿Cuántas horas durará el bloque? (0.5 - 8)`, '1');
        const duracionNum = parseFloat(duracion);
        if (isNaN(duracionNum) || duracionNum <= 0 || duracionNum > 8) {
            alert('Duración no válida');
            return;
        }

        let horaEncontrada = null;
        for (let h = horaActual + 1; h < HORAS_FIN; h += INTERVALO_HORAS) {
            let espacioLibre = true;
            for (let i = 0; i < duracionNum; i++) {
                if (horarioSemanal[diaSemana] && horarioSemanal[diaSemana][h + i]) {
                    espacioLibre = false;
                    break;
                }
            }
            if (espacioLibre && h + duracionNum <= HORAS_FIN) {
                horaEncontrada = h;
                break;
            }
        }

        if (horaEncontrada === null) {
            alert(`No hay espacio para ${duracionNum}h en ${diaSemana} después de las ${horaActual}:00`);
            return;
        }

        if (confirm(`¿Agregar "${NOMBRES_BLOQUES[tipo]}" en ${diaSemana} a las ${horaEncontrada}:00 por ${duracionNum}h?`)) {
            agregarBloqueCelda(diaSemana, horaEncontrada, tipo, duracionNum);
        }
    }

    function eliminarBloque(dia, hora) {
        if (!confirm(`¿Eliminar el bloque en ${dia} a las ${hora}:00?`)) return;

        if (horarioSemanal[dia]) {
            const bloque = horarioSemanal[dia][hora];
            const duracion = bloque?.duracion || 1;
            for (let i = 0; i < duracion; i++) {
                if (horarioSemanal[dia]) {
                    horarioSemanal[dia][hora + i] = null;
                }
            }
            alargarBloques();
            renderizarHorario();
            guardarHorario();
        }
    }

    function verDetalleBloque(dia, hora) {
        const bloque = horarioSemanal[dia]?.[hora];
        if (!bloque) return;

        const horaFin = hora + (bloque.duracion || 1);
        const horaFinStr = horaFin < 10 ? `0${horaFin}:00` : `${horaFin}:00`;
        const horaInicioStr = hora < 10 ? `0${hora}:00` : `${hora}:00`;

        alert(
            `📌 ${bloque.nombre}\n` +
            `📅 ${dia} - ${horaInicioStr} a ${horaFinStr}\n` +
            `⏱️ Duración: ${bloque.duracion || 1}h\n` +
            `🎨 Color: ${bloque.color}\n` +
            `📝 ${bloque.descripcion || 'Sin descripción'}`
        );
    }

    function agregarBloquePersonalizado() {
        const nombre = document.getElementById('bloque-personalizado-nombre').value.trim();
        const color = document.getElementById('bloque-personalizado-color').value;
        const duracion = parseFloat(document.getElementById('bloque-personalizado-duracion').value) || 1;

        if (!nombre) {
            alert('Ingresa un nombre para el bloque');
            return;
        }

        if (duracion <= 0 || duracion > 12) {
            alert('La duración debe ser entre 0.5 y 12 horas');
            return;
        }

        const grid = document.getElementById('bloques-grid');
        const div = document.createElement('div');
        div.className = 'bloque-item';
        div.draggable = true;
        div.dataset.tipo = 'personalizado';
        div.dataset.color = color;
        div.dataset.duracion = duracion;
        div.innerHTML = `
            <div class="bloque-color" style="background: ${color};"></div>
            <span>${nombre}</span>
            <span class="bloque-duracion">${duracion}h</span>
        `;
        div.addEventListener('dragstart', function(e) {
            bloqueArrastrado = {
                tipo: 'personalizado',
                nombre: nombre,
                color: color,
                icono: '📌',
                descripcion: `Bloque personalizado: ${nombre}`,
                duracion: duracion
            };
            e.dataTransfer.effectAllowed = 'copy';
        });
        div.addEventListener('click', function() {
            crearBloqueRapidoPersonalizado(nombre, color, duracion);
        });
        grid.appendChild(div);

        document.getElementById('bloque-personalizado-nombre').value = '';
        document.getElementById('bloque-personalizado-duracion').value = '1';
    }

    function crearBloqueRapidoPersonalizado(nombre, color, duracion) {
        const hoy = new Date();
        const diaSemana = DIAS_SEMANA[hoy.getDay() === 0 ? 6 : hoy.getDay() - 1];
        const horaActual = hoy.getHours();

        let horaEncontrada = null;
        for (let h = horaActual + 1; h < HORAS_FIN; h += INTERVALO_HORAS) {
            let espacioLibre = true;
            for (let i = 0; i < duracion; i++) {
                if (horarioSemanal[diaSemana] && horarioSemanal[diaSemana][h + i]) {
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
            alert(`No hay espacio para ${duracion}h en ${diaSemana}`);
            return;
        }

        if (confirm(`¿Agregar "${nombre}" en ${diaSemana} a las ${horaEncontrada}:00 por ${duracion}h?`)) {
            if (!horarioSemanal[diaSemana]) horarioSemanal[diaSemana] = {};

            let espacioLibre = true;
            for (let i = 0; i < duracion; i++) {
                if (horarioSemanal[diaSemana][horaEncontrada + i]) {
                    espacioLibre = false;
                    break;
                }
            }

            if (!espacioLibre) {
                if (!confirm(`Hay bloques en el rango de ${duracion}h. ¿Reemplazar?`)) {
                    return;
                }
                for (let i = 0; i < duracion; i++) {
                    horarioSemanal[diaSemana][horaEncontrada + i] = null;
                }
            }

            horarioSemanal[diaSemana][horaEncontrada] = {
                tipo: 'personalizado',
                nombre: nombre,
                color: color,
                icono: '📌',
                descripcion: `Bloque personalizado: ${nombre}`,
                duracion: duracion
            };

            for (let i = 1; i < duracion; i++) {
                horarioSemanal[diaSemana][horaEncontrada + i] = null;
            }

            alargarBloques();
            renderizarHorario();
            guardarHorario();
        }
    }

    function limpiarHorario() {
        if (!confirm('¿Limpiar todo el horario?')) return;

        DIAS_SEMANA.forEach(dia => {
            for (let h = HORAS_INICIO; h < HORAS_FIN; h += INTERVALO_HORAS) {
                if (horarioSemanal[dia]) {
                    horarioSemanal[dia][h] = null;
                }
            }
        });

        renderizarHorario();
        guardarHorario();
    }

    function expandirHorario() {
        alert('Función en desarrollo. Próximamente podrás personalizar el rango de horas.');
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
        renderizarHorario();
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
        cargarHorario();
        renderizarTodo();
        setTimeout(() => {
            configurarDragBloques();
        }, 300);
        iniciarVerificador();
        pedirPermisoNotificaciones();

        window.abrirAgregarClase = abrirAgregarClase;
        window.agregarClase = agregarClase;
        window.cerrarModalAgregarClase = cerrarModalAgregarClase;
        window.cerrarModalVerClase = cerrarModalVerClase;
        window.cambiarMes = cambiarMes;
        window.cambiarVista = cambiarVista;
        window.aplicarFiltros = aplicarFiltros;
        window.actualizarCamposModalidad = actualizarCamposModalidad;
        window.mostrarOpcionesRepeticion = mostrarOpcionesRepeticion;
        window.agregarHorarioAdicional = agregarHorarioAdicional;
        window.eliminarHorarioAdicional = eliminarHorarioAdicional;
        window.irAHoy = irAHoy;
        window.limpiarHorario = limpiarHorario;
        window.guardarHorario = guardarHorario;
        window.expandirHorario = expandirHorario;
        window.agregarBloquePersonalizado = agregarBloquePersonalizado;
        window.crearBloqueRapido = crearBloqueRapido;
        window.eliminarBloque = eliminarBloque;
        window.verDetalleBloque = verDetalleBloque;
        window.cambiarTab = cambiarTab;
        window.Clases.renderizarTodo = renderizarTodo;

        document.getElementById('clase-modalidad')?.addEventListener('change', actualizarCamposModalidad);

        console.log('✅ Clases inicializado');
    }

    return {
        init,
        renderizarTodo,
        verClase: window.Clases.verClase,
        seleccionarDia: window.Clases.seleccionarDia
    };
})();

window.Clases = Clases;
console.log('✅ clases.js cargado');