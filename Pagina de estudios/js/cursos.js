// js/cursos.js - Módulo de Cursos completo
console.log('🟡 cursos.js cargado');

const Cursos = (function() {
    console.log('🟡 Inicializando módulo Cursos');
    
    let materiaSeleccionada = null;
    let editingMateriaId = null;
    let editingNotaId = null;

    // ===== OPCIONES DE ESCALAS =====
    const ESCALAS = [
        { id: '0-10', label: '0 a 10', min: 0, max: 10, step: 0.1 },
        { id: '0-20', label: '0 a 20', min: 0, max: 20, step: 0.1 },
        { id: '0-100', label: '0 a 100', min: 0, max: 100, step: 0.5 },
        { id: '0-5', label: '0 a 5', min: 0, max: 5, step: 0.1 },
        { id: '1-10', label: '1 a 10', min: 1, max: 10, step: 0.1 },
        { id: '1-7', label: '1 a 7', min: 1, max: 7, step: 0.1 },
        { id: '0-7', label: '0 a 7', min: 0, max: 7, step: 0.1 }
    ];

    // ===== MENSAJES POR ETAPA DE PROGRESO =====
    const MENSAJES_PROGRESO = [
        { min: 0, max: 0, mensaje: 'Comienza tu camino', emoji: '🌱' },
        { min: 1, max: 10, mensaje: 'Has dado el primer paso', emoji: '🌱' },
        { min: 11, max: 25, mensaje: 'Vas construyendo tu conocimiento', emoji: '📚' },
        { min: 26, max: 40, mensaje: 'Sigue así, vas progresando', emoji: '💪' },
        { min: 41, max: 55, mensaje: 'Vas por buen camino', emoji: '🌟' },
        { min: 56, max: 70, mensaje: 'Estás en la recta final', emoji: '🔥' },
        { min: 71, max: 85, mensaje: 'Casi llegas, no te rindas', emoji: '🎯' },
        { min: 86, max: 99, mensaje: '¡Estás a punto de completarlo!', emoji: '✨' },
        { min: 100, max: 100, mensaje: '¡Completaste todas las evaluaciones!', emoji: '🎉' }
    ];

    function obtenerMensajeProgreso(porcentaje) {
        for (const msg of MENSAJES_PROGRESO) {
            if (porcentaje >= msg.min && porcentaje <= msg.max) {
                return msg;
            }
        }
        return MENSAJES_PROGRESO[0];
    }

    // ===== CALIFICACIONES EN TEXTO =====
    const CALIFICACIONES = [
        { min: 9.0, max: 10.0, texto: 'Excelente', emoji: '🌟', color: '#38a169' },
        { min: 8.0, max: 8.9, texto: 'Muy Bueno', emoji: '⭐', color: '#48bb78' },
        { min: 7.0, max: 7.9, texto: 'Bueno', emoji: '👍', color: '#667eea' },
        { min: 6.0, max: 6.9, texto: 'Aprobado', emoji: '✅', color: '#4299e1' },
        { min: 5.0, max: 5.9, texto: 'Regular', emoji: '📊', color: '#ed8936' },
        { min: 4.0, max: 4.9, texto: 'Deficiente', emoji: '⚠️', color: '#e53e3e' },
        { min: 0.0, max: 3.9, texto: 'Malo', emoji: '❌', color: '#c53030' }
    ];

    function obtenerCalificacion(notaNormalizada) {
        for (const cal of CALIFICACIONES) {
            if (notaNormalizada >= cal.min && notaNormalizada <= cal.max) {
                return cal;
            }
        }
        return CALIFICACIONES[CALIFICACIONES.length - 1];
    }

    // ===== FUNCIONES DE CÁLCULO =====
    
    function calcularPromedioPonderado(notas) {
        if (!notas || notas.length === 0) return 0;
        let sumaPonderada = 0;
        let totalPorcentaje = 0;
        notas.forEach(n => {
            sumaPonderada += (n.valor || 0) * (n.porcentaje || 0);
            totalPorcentaje += (n.porcentaje || 0);
        });
        if (totalPorcentaje === 0) return 0;
        return sumaPonderada / totalPorcentaje;
    }

    function normalizarNotaParaCalificacion(valor, min, max) {
        if (valor === undefined || valor === null) return 0;
        const rango = max - min;
        if (rango === 0) return 0;
        return ((valor - min) / rango) * 10;
    }

    // ===== FUNCIONES DE RENDERIZADO =====
    
    function renderMateriaView(materiaId) {
        console.log(`🟡 renderMateriaView: ${materiaId}`);
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const materia = data.materias.find(m => m.id === materiaId);
        if (!materia) return;
        
        materiaSeleccionada = materia;
        const content = document.getElementById('cursos-content');
        if (!content) return;
        
        document.querySelectorAll('.materia-item').forEach(el => el.classList.remove('active'));
        const items = document.querySelectorAll('.materia-item');
        const index = data.materias.findIndex(m => m.id === materiaId);
        if (items[index]) items[index].classList.add('active');
        
        const notas = materia.notas || [];
        const totalPorcentaje = notas.reduce((sum, n) => sum + (n.porcentaje || 0), 0);
        const promedioPonderado = calcularPromedioPonderado(notas);
        const notaActual = promedioPonderado;
        const notaMinima = materia.notaMinima || 6.0;
        const escalaMin = materia.escalaMin || 0;
        const escalaMax = materia.escalaMax || 10;
        const falta = Math.max(0, notaMinima - notaActual);
        const estaCompleto = totalPorcentaje >= 100;
        const progreso = Math.min(100, totalPorcentaje);
        
        const mensajeProgreso = obtenerMensajeProgreso(progreso);
        
        let estadoAprobacion = {
            texto: 'En curso',
            emoji: '📝',
            color: '#718096',
            bgColor: '#f0f4fa',
            mensaje: 'Sin evaluaciones'
        };
        
        if (notas.length === 0) {
            estadoAprobacion = {
                texto: 'Sin evaluaciones',
                emoji: '📝',
                color: '#718096',
                bgColor: '#f0f4fa',
                mensaje: 'Agrega evaluaciones para ver tu estado'
            };
        } else if (!estaCompleto) {
            estadoAprobacion = {
                texto: 'En curso',
                emoji: '📈',
                color: '#667eea',
                bgColor: '#e1eaf3',
                mensaje: `${Math.round(progreso)}% completado · ${notas.length} evaluaciones`
            };
        } else if (estaCompleto && notaActual >= notaMinima) {
            estadoAprobacion = {
                texto: '✅ APROBADO',
                emoji: '🎉',
                color: '#38a169',
                bgColor: '#e6f7e6',
                mensaje: `¡Felicidades! Has aprobado con ${notaActual.toFixed(1)}/${escalaMax}`
            };
        } else if (estaCompleto && notaActual < notaMinima) {
            estadoAprobacion = {
                texto: '❌ DESAPROBADO',
                emoji: '😞',
                color: '#e53e3e',
                bgColor: '#fde8e8',
                mensaje: `No has alcanzado la nota mínima. Necesitas ${notaMinima.toFixed(1)}/${escalaMax} y tienes ${notaActual.toFixed(1)}`
            };
        }
        
        let calificacionFinal = null;
        if (estaCompleto && notas.length > 0) {
            const notaNormalizada = normalizarNotaParaCalificacion(notaActual, escalaMin, escalaMax);
            calificacionFinal = obtenerCalificacion(notaNormalizada);
        }
        
        let resultadoCalificacionHTML = '';
        if (estaCompleto && calificacionFinal && notas.length > 0) {
            resultadoCalificacionHTML = `
                <span class="resultado-calificacion" style="color: ${calificacionFinal.color};">
                    ${calificacionFinal.emoji} ${calificacionFinal.texto}
                </span>
            `;
        }
        
        let barColor = 'linear-gradient(90deg, #667eea, #764ba2)';
        if (progreso >= 100) {
            barColor = 'linear-gradient(90deg, #48bb78, #38a169)';
        } else if (progreso >= 70) {
            barColor = 'linear-gradient(90deg, #f6d365, #fda085)';
        } else if (progreso >= 40) {
            barColor = 'linear-gradient(90deg, #667eea, #764ba2)';
        }
        
        content.innerHTML = `
            <div class="materia-view active">
                <div class="materia-header">
                    <div>
                        <div class="materia-title">
                            <i class="fas fa-book" style="color: #667eea;"></i>
                            ${materia.nombre}
                        </div>
                        <div class="materia-meta">
                            👨‍🏫 ${materia.profesor || 'Sin profesor'} · 
                            🎯 Mínimo: ${notaMinima.toFixed(1)}/${escalaMax} · 
                            📊 Escala: ${materia.escalaLabel || '0-10'}
                        </div>
                    </div>
                    <div class="materia-actions">
                        <button class="btn btn-secondary btn-sm" onclick="Cursos.editarMateria(${materia.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="Cursos.eliminarMateria(${materia.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="Cursos.abrirAgregarNota()">
                            <i class="fas fa-plus"></i> Nota
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="Cursos.abrirAgregarMaterial()">
                            <i class="fas fa-plus"></i> Material
                        </button>
                    </div>
                </div>
                
                <div class="aprobacion-banner" style="background: ${estadoAprobacion.bgColor}; border-left: 6px solid ${estadoAprobacion.color};">
                    <div class="aprobacion-icono">${estadoAprobacion.emoji}</div>
                    <div class="aprobacion-info">
                        <div class="aprobacion-titulo" style="color: ${estadoAprobacion.color};">${estadoAprobacion.texto}</div>
                        <div class="aprobacion-mensaje">${estadoAprobacion.mensaje}</div>
                    </div>
                    ${estaCompleto ? `
                        <div class="aprobacion-nota-final" style="color: ${estadoAprobacion.color};">
                            ${notaActual.toFixed(1)}/${escalaMax}
                        </div>
                    ` : `
                        <div class="aprobacion-progreso">
                            ${Math.round(progreso)}%
                        </div>
                    `}
                </div>
                
                <div class="materia-resultado">
                    <div class="resultado-principal">
                        <div class="resultado-nota">
                            <span class="resultado-valor">${notaActual.toFixed(1)}</span>
                            <span class="resultado-label">Nota Actual</span>
                            <span class="resultado-calificacion" style="color: #718096; font-size: 0.75rem;">
                                ${escalaMin} - ${escalaMax}
                            </span>
                            ${resultadoCalificacionHTML}
                        </div>
                        <div class="resultado-meta">
                            <span class="resultado-valor">${notaMinima.toFixed(1)}</span>
                            <span class="resultado-label">Nota Mínima</span>
                            <span class="resultado-calificacion" style="color: #718096; font-size: 0.75rem;">
                                Para aprobar
                            </span>
                        </div>
                        <div class="resultado-falta">
                            <span class="resultado-valor" style="color: ${falta > 0 && !estaCompleto ? '#e53e3e' : falta > 0 && estaCompleto ? '#e53e3e' : '#38a169'};">
                                ${falta > 0 ? `-${falta.toFixed(1)}` : '✅'}
                            </span>
                            <span class="resultado-label">Te falta</span>
                            <span class="resultado-calificacion" style="color: ${falta > 0 ? '#e53e3e' : '#38a169'}; font-size: 0.75rem;">
                                ${falta > 0 ? `${Math.round((notaActual / notaMinima) * 100)}% de la meta` : '🎉 Meta alcanzada'}
                            </span>
                        </div>
                        <div class="resultado-estado">
                            <span class="resultado-valor">${estadoAprobacion.emoji}</span>
                            <span class="resultado-label" style="color: ${estadoAprobacion.color};">${estadoAprobacion.texto}</span>
                        </div>
                    </div>
                    
                    <div class="progreso-completo">
                        <div class="progreso-header">
                            <span class="progreso-titulo">📊 Progreso de evaluaciones</span>
                            <span class="progreso-porcentaje">${Math.round(progreso)}%</span>
                        </div>
                        <div class="progreso-bar-container">
                            <div class="progreso-bar" style="width: ${progreso}%; background: ${barColor};"></div>
                        </div>
                        <div class="progreso-mensaje" style="color: ${progreso >= 100 ? '#38a169' : '#667eea'};">
                            <span class="mensaje-emoji">${mensajeProgreso.emoji}</span>
                            <span class="mensaje-texto">${mensajeProgreso.mensaje}</span>
                        </div>
                        <div class="progreso-detalles">
                            <span class="progreso-detalle">
                                📝 Evaluaciones: <span class="detalle-valor">${notas.length}</span>
                            </span>
                            <span class="progreso-detalle">
                                📊 Completado: <span class="detalle-valor">${Math.round(progreso)}%</span>
                            </span>
                            <span class="progreso-detalle">
                                📈 Nota actual: <span class="detalle-valor">${notaActual.toFixed(1)}</span>
                            </span>
                        </div>
                    </div>
                    
                    <div class="meta-progress" style="margin-top: 1rem;">
                        <div class="meta-progress-bar">
                            <div class="meta-progress-fill" style="width: ${Math.min(100, (notaActual / notaMinima) * 100)}%; 
                                background: ${notaActual >= notaMinima ? 'linear-gradient(90deg, #48bb78, #38a169)' : 'linear-gradient(90deg, #667eea, #764ba2)'};">
                            </div>
                        </div>
                        <div class="meta-progress-text">
                            <span>${notaActual.toFixed(1)} / ${notaMinima.toFixed(1)}</span>
                            <span>${notaActual >= notaMinima ? '🎉 Meta alcanzada' : `${Math.round((notaActual / notaMinima) * 100)}% de la meta`}</span>
                        </div>
                    </div>
                </div>
                
                <div class="notas-stats">
                    <div class="nota-stat">
                        <span class="nota-stat-number">${notas.length}</span>
                        <span class="nota-stat-label">Evaluaciones</span>
                    </div>
                    <div class="nota-stat">
                        <span class="nota-stat-number">${Math.round(progreso)}%</span>
                        <span class="nota-stat-label">Porcentaje completado</span>
                    </div>
                    <div class="nota-stat">
                        <span class="nota-stat-number">${notaActual.toFixed(1)}</span>
                        <span class="nota-stat-label">Promedio ponderado</span>
                    </div>
                    <div class="nota-stat">
                        <span class="nota-stat-number" style="color: ${falta > 0 ? '#e53e3e' : '#38a169'};">
                            ${falta > 0 ? `${falta.toFixed(1)} pts` : '🎯'}
                        </span>
                        <span class="nota-stat-label">${falta > 0 ? 'Para la meta' : '¡Logrado!'}</span>
                    </div>
                </div>
                
                <div class="notas-list">
                    <div class="notas-list-header">
                        <h4>📊 Evaluaciones</h4>
                        <span class="notas-count">${notas.length} notas · ${Math.round(progreso)}% completado</span>
                    </div>
                    ${renderNotas(materia)}
                </div>
                
                <div class="materiales-list">
                    <div class="materiales-list-header">
                        <h4>📄 Materiales de Estudio</h4>
                        <span class="materiales-count">${materia.materiales?.length || 0} materiales</span>
                    </div>
                    ${renderMateriales(materia)}
                </div>
            </div>
        `;
        console.log(`✅ Materia renderizada: ${materia.nombre}`);
    }

    function renderNotas(materia) {
        const notas = materia.notas || [];
        if (notas.length === 0) {
            return `
                <div class="empty-state" style="padding: 1.5rem 0;">
                    <i class="fas fa-plus-circle"></i>
                    <p style="font-size: 0.9rem;">No hay evaluaciones registradas</p>
                    <button class="btn btn-primary btn-sm" onclick="Cursos.abrirAgregarNota()" style="margin-top: 0.5rem;">
                        <i class="fas fa-plus"></i> Agregar Nota
                    </button>
                </div>
            `;
        }
        
        const escalaMin = materia.escalaMin || 0;
        const escalaMax = materia.escalaMax || 10;
        
        return notas.map((nota, index) => {
            const contribucion = ((nota.valor || 0) * (nota.porcentaje || 0)) / 100;
            const notaNormalizada = normalizarNotaParaCalificacion(nota.valor, escalaMin, escalaMax);
            const calificacion = obtenerCalificacion(notaNormalizada);
            
            return `
                <div class="nota-item" style="animation: fadeIn 0.3s ease ${index * 0.05}s both;">
                    <div class="nota-info">
                        <div class="nota-nombre">${nota.nombre || 'Evaluación'}</div>
                        <div class="nota-detalles">
                            <span class="nota-badge" style="background: ${nota.valor !== undefined && nota.valor !== null ? '#e6f7e6' : '#fde8e8'}; 
                                color: ${nota.valor !== undefined && nota.valor !== null ? '#1a7a3a' : '#b33636'};">
                                ${nota.valor !== undefined && nota.valor !== null ? `📊 ${nota.valor.toFixed(1)}/${escalaMax}` : '⏳ Sin nota'}
                            </span>
                            <span class="nota-badge" style="background: #e1eaf3; color: #2a5c8a;">
                                ${nota.porcentaje || 0}%
                            </span>
                            <span class="nota-badge" style="background: #fef3c7; color: #92400e;">
                                Normalizada: ${notaNormalizada.toFixed(1)}/10
                            </span>
                            <span class="nota-badge" style="background: ${calificacion.color}20; color: ${calificacion.color}; font-weight: 600;">
                                ${calificacion.emoji} ${calificacion.texto}
                            </span>
                            <span class="nota-badge" style="background: #f0f4fa; color: #4a5568;">
                                Contribuye: ${contribucion.toFixed(2)} pts
                            </span>
                        </div>
                    </div>
                    <div class="nota-actions">
                        <button class="btn btn-secondary btn-sm" onclick="Cursos.editarNota(${materia.id}, ${nota.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="Cursos.eliminarNota(${materia.id}, ${nota.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderMateriales(materia) {
        if (!materia.materiales || materia.materiales.length === 0) {
            return `
                <div class="empty-state" style="padding: 1.5rem 0;">
                    <i class="fas fa-file-alt"></i>
                    <p style="font-size: 0.9rem;">No hay materiales aún</p>
                    <button class="btn btn-primary btn-sm" onclick="Cursos.abrirAgregarMaterial()" style="margin-top: 0.5rem;">
                        <i class="fas fa-plus"></i> Agregar Material
                    </button>
                </div>
            `;
        }
        
        const iconMap = {
            'pdf': 'fa-file-pdf',
            'video': 'fa-video',
            'enlace': 'fa-link',
            'nota': 'fa-sticky-note',
            'documento': 'fa-file-word',
            'imagen': 'fa-image'
        };
        
        const colorMap = {
            'pdf': 'material-icon-pdf',
            'video': 'material-icon-video',
            'enlace': 'material-icon-enlace',
            'nota': 'material-icon-nota',
            'documento': 'material-icon-documento',
            'imagen': 'material-icon-imagen'
        };
        
        const tipoBadgeMap = {
            'pdf': 'material-tipo-pdf',
            'video': 'material-tipo-video',
            'enlace': 'material-tipo-enlace',
            'nota': 'material-tipo-nota',
            'documento': 'material-tipo-documento',
            'imagen': 'material-tipo-imagen'
        };
        
        return materia.materiales.map(mat => {
            const icon = iconMap[mat.tipo] || 'fa-file';
            const colorClass = colorMap[mat.tipo] || 'material-icon-pdf';
            const badgeClass = tipoBadgeMap[mat.tipo] || 'material-tipo-pdf';
            
            return `
                <div class="material-item" onclick="Cursos.verMaterial(${materia.id}, ${mat.id})" style="cursor: pointer;">
                    <div class="material-info-wrapper">
                        <div class="material-icon ${colorClass}">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="material-info">
                            <div class="material-title">${mat.titulo}</div>
                            <div class="material-desc">${mat.descripcion || 'Sin descripción'}</div>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.2rem;">
                                <span class="material-tipo-badge ${badgeClass}">
                                    ${mat.tipo ? mat.tipo.toUpperCase() : 'OTRO'}
                                </span>
                                ${mat.nombreArchivo ? `<span style="font-size: 0.7rem; color: #718096;">📎 ${mat.nombreArchivo}</span>` : ''}
                                <span style="font-size: 0.7rem; color: #a0aec0;">📅 ${mat.fecha || 'Sin fecha'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="material-actions" onclick="event.stopPropagation();">
                        <button class="btn btn-secondary btn-sm" onclick="Cursos.verMaterial(${materia.id}, ${mat.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="Cursos.eliminarMaterial(${materia.id}, ${mat.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderSidebar() {
        console.log('🟡 renderSidebar()');
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const list = document.getElementById('materias-list');
        const count = document.getElementById('materias-count');
        
        if (count) count.textContent = data.materias.length;
        if (!list) return;
        
        list.innerHTML = '';
        
        if (data.materias.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="padding: 1rem 0.5rem;">
                    <p style="font-size: 0.85rem;">No hay materias</p>
                    <button class="btn btn-primary btn-sm" onclick="Cursos.abrirAgregarMateria()">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            `;
            return;
        }
        
        data.materias.forEach(materia => {
            const item = document.createElement('div');
            item.className = 'materia-item';
            if (materiaSeleccionada && materiaSeleccionada.id === materia.id) {
                item.classList.add('active');
            }
            
            const notas = materia.notas || [];
            const promedio = calcularPromedioPonderado(notas);
            const notaMinima = materia.notaMinima || 6.0;
            const totalPorcentaje = notas.reduce((sum, n) => sum + (n.porcentaje || 0), 0);
            const estaCompleto = totalPorcentaje >= 100;
            const progreso = Math.min(100, totalPorcentaje);
            const mensaje = obtenerMensajeProgreso(progreso);
            
            let badgeClass = 'en-curso';
            let badgeText = '📝 Sin notas';
            let estadoCorto = '';
            
            if (notas.length === 0) {
                badgeClass = 'en-curso';
                badgeText = '📝 Sin notas';
                estadoCorto = '';
            } else if (!estaCompleto) {
                badgeClass = 'en-curso';
                badgeText = `📈 ${Math.round(progreso)}%`;
                estadoCorto = ` · ${Math.round(progreso)}%`;
            } else if (estaCompleto && promedio >= notaMinima) {
                badgeClass = 'aprobada';
                badgeText = `✅ ${promedio.toFixed(1)}`;
                estadoCorto = ' ✅ Aprobado';
            } else if (estaCompleto && promedio < notaMinima) {
                badgeClass = 'reprobada';
                badgeText = `❌ ${promedio.toFixed(1)}`;
                estadoCorto = ' ❌ Desaprobado';
            }
            
            item.innerHTML = `
                <div class="materia-nombre">${materia.nombre}</div>
                <div class="materia-info">
                    ${materia.profesor || 'Sin profesor'} · 
                    ${notas.length} eval · ${Math.round(progreso)}%
                    ${estadoCorto}
                    ${notas.length > 0 ? ` · ${mensaje.emoji}` : ''}
                </div>
                <span class="materia-badge ${badgeClass}">${badgeText}</span>
            `;
            item.addEventListener('click', () => seleccionarMateria(materia.id));
            list.appendChild(item);
        });
    }

    // ===== FUNCIÓN PÚBLICA PARA SELECCIONAR MATERIA =====
    function seleccionarMateria(id) {
        console.log(`🟡 seleccionarMateria: ${id}`);
        renderMateriaView(id);
        renderSidebar();
    }

    // ===== FUNCIONES PÚBLICAS =====
    
    function init() {
        console.log('🟡 Cursos.init()');
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        if (data.materias.length > 0) {
            const firstMateria = data.materias[0];
            materiaSeleccionada = firstMateria;
            renderMateriaView(firstMateria.id);
        } else {
            const content = document.getElementById('cursos-content');
            if (content) {
                content.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-book-open"></i>
                        <h3>No hay materias</h3>
                        <p>Agrega tu primera materia</p>
                        <button class="btn btn-primary" onclick="Cursos.abrirAgregarMateria()">
                            <i class="fas fa-plus"></i> Agregar Materia
                        </button>
                    </div>
                `;
            }
        }
        renderSidebar();
        console.log('✅ Cursos inicializado');
    }

    // ===== MATERIAS =====
    
    function abrirAgregarMateria() {
        console.log('🟡 abrirAgregarMateria()');
        const modal = document.getElementById('modal-agregar-materia');
        if (modal) {
            cargarOpcionesEscala('nueva-materia-escala');
            modal.classList.add('active');
            setTimeout(() => {
                document.getElementById('nueva-materia-nombre').focus();
            }, 100);
        }
    }

    function cargarOpcionesEscala(selectId, valorSeleccionado) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '';
        
        ESCALAS.forEach(escala => {
            const option = document.createElement('option');
            option.value = escala.id;
            option.textContent = escala.label;
            if (valorSeleccionado && valorSeleccionado === escala.id) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    function agregarMateria() {
        console.log('🟡 agregarMateria()');
        
        const nombre = document.getElementById('nueva-materia-nombre').value.trim();
        const profesor = document.getElementById('nueva-materia-profesor').value.trim();
        const escalaId = document.getElementById('nueva-materia-escala').value;
        const notaMinima = parseFloat(document.getElementById('nueva-materia-nota-minima').value);
        
        if (!nombre) {
            alert('Ingresa el nombre de la materia');
            return;
        }
        
        const escala = ESCALAS.find(e => e.id === escalaId);
        if (!escala) {
            alert('Selecciona una escala válida');
            return;
        }
        
        if (isNaN(notaMinima) || notaMinima < escala.min || notaMinima > escala.max) {
            alert(`La nota mínima debe estar entre ${escala.min} y ${escala.max}`);
            return;
        }
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const nuevaMateria = {
            id: window.EstudianteData.generateId(),
            nombre: nombre,
            profesor: profesor || 'Sin profesor',
            notaMinima: notaMinima,
            escalaId: escalaId,
            escalaLabel: escala.label,
            escalaMin: escala.min,
            escalaMax: escala.max,
            notas: [],
            materiales: []
        };
        
        data.materias.push(nuevaMateria);
        window.EstudianteData.save(data);
        
        cerrarModal('modal-agregar-materia');
        document.getElementById('nueva-materia-nombre').value = '';
        document.getElementById('nueva-materia-profesor').value = '';
        document.getElementById('nueva-materia-nota-minima').value = '';
        document.getElementById('nueva-materia-escala').value = '0-10';
        
        materiaSeleccionada = nuevaMateria;
        renderMateriaView(nuevaMateria.id);
        renderSidebar();
        
        if (window.renderInicio) window.renderInicio();
        if (window.actualizarHeader) window.actualizarHeader();
    }

    function editarMateria(id) {
        console.log(`🟡 editarMateria: ${id}`);
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const materia = data.materias.find(m => m.id === id);
        if (!materia) return;
        
        editingMateriaId = id;
        document.getElementById('editar-materia-nombre').value = materia.nombre;
        document.getElementById('editar-materia-profesor').value = materia.profesor || '';
        document.getElementById('editar-materia-nota-minima').value = materia.notaMinima || 6.0;
        
        cargarOpcionesEscala('editar-materia-escala', materia.escalaId || '0-10');
        
        document.getElementById('modal-editar-materia').classList.add('active');
    }

    function guardarEditarMateria() {
        console.log('🟡 guardarEditarMateria()');
        
        const nombre = document.getElementById('editar-materia-nombre').value.trim();
        const profesor = document.getElementById('editar-materia-profesor').value.trim();
        const escalaId = document.getElementById('editar-materia-escala').value;
        const notaMinima = parseFloat(document.getElementById('editar-materia-nota-minima').value);
        
        if (!nombre) {
            alert('Ingresa el nombre de la materia');
            return;
        }
        
        const escala = ESCALAS.find(e => e.id === escalaId);
        if (!escala) {
            alert('Selecciona una escala válida');
            return;
        }
        
        if (isNaN(notaMinima) || notaMinima < escala.min || notaMinima > escala.max) {
            alert(`La nota mínima debe estar entre ${escala.min} y ${escala.max}`);
            return;
        }
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const materia = data.materias.find(m => m.id === editingMateriaId);
        if (materia) {
            materia.nombre = nombre;
            materia.profesor = profesor || 'Sin profesor';
            materia.notaMinima = notaMinima;
            materia.escalaId = escalaId;
            materia.escalaLabel = escala.label;
            materia.escalaMin = escala.min;
            materia.escalaMax = escala.max;
            window.EstudianteData.save(data);
            
            cerrarModal('modal-editar-materia');
            renderMateriaView(materia.id);
            renderSidebar();
            
            if (window.renderInicio) window.renderInicio();
            if (window.actualizarHeader) window.actualizarHeader();
        }
    }

    function eliminarMateria(id) {
        console.log(`🟡 eliminarMateria: ${id}`);
        
        if (!confirm('¿Eliminar esta materia y todos sus datos?')) return;
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        data.materias = data.materias.filter(m => m.id !== id);
        window.EstudianteData.save(data);
        
        if (materiaSeleccionada && materiaSeleccionada.id === id) {
            materiaSeleccionada = data.materias.length > 0 ? data.materias[0] : null;
        }
        
        if (data.materias.length > 0) {
            renderMateriaView(data.materias[0].id);
        } else {
            const content = document.getElementById('cursos-content');
            if (content) {
                content.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-book-open"></i>
                        <h3>No hay materias</h3>
                        <button class="btn btn-primary" onclick="Cursos.abrirAgregarMateria()">
                            <i class="fas fa-plus"></i> Agregar Materia
                        </button>
                    </div>
                `;
            }
        }
        renderSidebar();
        
        if (window.renderInicio) window.renderInicio();
        if (window.actualizarHeader) window.actualizarHeader();
    }

    // ===== NOTAS =====
    
    function abrirAgregarNota() {
        console.log('🟡 abrirAgregarNota()');
        if (!materiaSeleccionada) {
            alert('Selecciona una materia primero');
            return;
        }
        document.getElementById('modal-agregar-nota').classList.add('active');
        setTimeout(() => {
            document.getElementById('nueva-nota-nombre').focus();
        }, 100);
    }

    function agregarNota() {
        console.log('🟡 agregarNota()');
        
        if (!materiaSeleccionada) {
            alert('Selecciona una materia primero');
            return;
        }
        
        const nombre = document.getElementById('nueva-nota-nombre').value.trim();
        const valor = parseFloat(document.getElementById('nueva-nota-valor').value);
        const porcentaje = parseFloat(document.getElementById('nueva-nota-porcentaje').value);
        
        const materia = materiaSeleccionada;
        const escalaMin = materia.escalaMin || 0;
        const escalaMax = materia.escalaMax || 10;
        
        if (isNaN(valor) || valor < escalaMin || valor > escalaMax) {
            alert(`Ingresa una nota válida para la escala ${materia.escalaLabel} (${escalaMin} - ${escalaMax})`);
            return;
        }
        
        if (isNaN(porcentaje) || porcentaje <= 0 || porcentaje > 100) {
            alert('Ingresa un porcentaje válido (1-100)');
            return;
        }
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const materiaData = data.materias.find(m => m.id === materia.id);
        if (materiaData) {
            if (!materiaData.notas) materiaData.notas = [];
            
            const totalActual = materiaData.notas.reduce((sum, n) => sum + (n.porcentaje || 0), 0);
            if (totalActual + porcentaje > 100) {
                alert(`⚠️ La suma de porcentajes no puede superar 100%. Actualmente tienes ${totalActual}% y estás agregando ${porcentaje}%.`);
                return;
            }
            
            materiaData.notas.push({
                id: window.EstudianteData.generateId(),
                nombre: nombre || `Evaluación ${materiaData.notas.length + 1}`,
                valor: valor,
                porcentaje: porcentaje
            });
            window.EstudianteData.save(data);
            
            cerrarModal('modal-agregar-nota');
            document.getElementById('nueva-nota-nombre').value = '';
            document.getElementById('nueva-nota-valor').value = '';
            document.getElementById('nueva-nota-porcentaje').value = '';
            
            renderMateriaView(materiaData.id);
            renderSidebar();
            
            if (window.renderInicio) window.renderInicio();
            if (window.actualizarHeader) window.actualizarHeader();
        }
    }

    function editarNota(materiaId, notaId) {
        console.log(`🟡 editarNota: ${materiaId}, ${notaId}`);
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const materia = data.materias.find(m => m.id === materiaId);
        if (!materia) return;
        
        const nota = materia.notas.find(n => n.id === notaId);
        if (!nota) return;
        
        editingNotaId = notaId;
        
        document.getElementById('editar-nota-nombre').value = nota.nombre || '';
        document.getElementById('editar-nota-valor').value = nota.valor || '';
        document.getElementById('editar-nota-porcentaje').value = nota.porcentaje || '';
        document.getElementById('modal-editar-nota').classList.add('active');
    }

    function guardarEditarNota() {
        console.log('🟡 guardarEditarNota()');
        
        const nombre = document.getElementById('editar-nota-nombre').value.trim();
        const valor = parseFloat(document.getElementById('editar-nota-valor').value);
        const porcentaje = parseFloat(document.getElementById('editar-nota-porcentaje').value);
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const materia = data.materias.find(m => m.id === materiaSeleccionada.id);
        if (!materia) {
            alert('No se encontró la materia');
            return;
        }
        
        const escalaMin = materia.escalaMin || 0;
        const escalaMax = materia.escalaMax || 10;
        
        if (isNaN(valor) || valor < escalaMin || valor > escalaMax) {
            alert(`Ingresa una nota válida para la escala ${materia.escalaLabel} (${escalaMin} - ${escalaMax})`);
            return;
        }
        
        if (isNaN(porcentaje) || porcentaje <= 0 || porcentaje > 100) {
            alert('Ingresa un porcentaje válido (1-100)');
            return;
        }
        
        const notaIndex = materia.notas.findIndex(n => n.id === editingNotaId);
        if (notaIndex === -1) {
            alert('No se encontró la nota a editar');
            return;
        }
        
        let totalSinEsta = 0;
        materia.notas.forEach((n, idx) => {
            if (idx !== notaIndex) {
                totalSinEsta += (n.porcentaje || 0);
            }
        });
        
        if (totalSinEsta + porcentaje > 100) {
            alert(`⚠️ La suma de porcentajes no puede superar 100%.`);
            return;
        }
        
        materia.notas[notaIndex].nombre = nombre || materia.notas[notaIndex].nombre;
        materia.notas[notaIndex].valor = valor;
        materia.notas[notaIndex].porcentaje = porcentaje;
        
        window.EstudianteData.save(data);
        
        cerrarModal('modal-editar-nota');
        renderMateriaView(materia.id);
        renderSidebar();
        
        if (window.renderInicio) window.renderInicio();
        if (window.actualizarHeader) window.actualizarHeader();
        
        console.log('✅ Nota editada correctamente');
    }

    function eliminarNota(materiaId, notaId) {
        console.log(`🟡 eliminarNota: ${materiaId}, ${notaId}`);
        
        if (!confirm('¿Eliminar esta evaluación?')) return;
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const materia = data.materias.find(m => m.id === materiaId);
        if (materia) {
            materia.notas = materia.notas.filter(n => n.id !== notaId);
            window.EstudianteData.save(data);
            
            renderMateriaView(materiaId);
            renderSidebar();
            
            if (window.renderInicio) window.renderInicio();
            if (window.actualizarHeader) window.actualizarHeader();
        }
    }

    // ===== MATERIALES =====
    
    function cambiarTipoMaterial() {
        const tipo = document.getElementById('nuevo-material-tipo').value;
        
        document.getElementById('campo-archivo').style.display = 'none';
        document.getElementById('campo-video').style.display = 'none';
        document.getElementById('campo-enlace').style.display = 'none';
        document.getElementById('campo-nota').style.display = 'none';
        
        if (tipo === 'pdf' || tipo === 'documento' || tipo === 'imagen') {
            document.getElementById('campo-archivo').style.display = 'block';
        } else if (tipo === 'video') {
            document.getElementById('campo-video').style.display = 'block';
        } else if (tipo === 'enlace') {
            document.getElementById('campo-enlace').style.display = 'block';
        } else if (tipo === 'nota') {
            document.getElementById('campo-nota').style.display = 'block';
        }
    }

    function abrirAgregarMaterial() {
        console.log('🟡 abrirAgregarMaterial()');
        if (!materiaSeleccionada) {
            alert('Selecciona una materia primero');
            return;
        }
        
        document.getElementById('nuevo-material-tipo').value = 'pdf';
        document.getElementById('nuevo-material-titulo').value = '';
        document.getElementById('nuevo-material-descripcion').value = '';
        document.getElementById('nuevo-material-video-url').value = '';
        document.getElementById('nuevo-material-enlace-url').value = '';
        document.getElementById('nuevo-material-nota-contenido').value = '';
        document.getElementById('file-input').value = '';
        document.getElementById('file-name-display').style.display = 'none';
        
        cambiarTipoMaterial();
        document.getElementById('modal-agregar-material').classList.add('active');
        setTimeout(() => {
            document.getElementById('nuevo-material-titulo').focus();
        }, 100);
    }

    function agregarMaterial() {
        console.log('🟡 agregarMaterial()');
        
        if (!materiaSeleccionada) {
            alert('Selecciona una materia primero');
            return;
        }
        
        const tipo = document.getElementById('nuevo-material-tipo').value;
        const titulo = document.getElementById('nuevo-material-titulo').value.trim();
        const descripcion = document.getElementById('nuevo-material-descripcion').value.trim();
        
        if (!titulo) {
            alert('Ingresa un título para el material');
            return;
        }
        
        // Obtener el archivo de la variable global
        const archivo = window.materialArchivoSeleccionado;
        console.log('📎 Archivo en variable global:', archivo ? archivo.name : 'null');
        
        let material = {
            id: window.EstudianteData.generateId(),
            tipo: tipo,
            titulo: titulo,
            descripcion: descripcion || 'Sin descripción',
            fecha: new Date().toISOString().split('T')[0],
            nombreArchivo: null,
            url: null,
            contenido: null
        };
        
        if (tipo === 'pdf' || tipo === 'documento' || tipo === 'imagen') {
            if (!archivo) {
                alert('❌ No has seleccionado ningún archivo. Haz clic en el área de subida para seleccionar un archivo.');
                return;
            }
            
            // Mostrar loading
            const btn = document.querySelector('#modal-agregar-material .btn-success');
            const originalText = btn ? btn.innerHTML : 'Agregar Material';
            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
                btn.disabled = true;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                material.url = e.target.result;
                material.nombreArchivo = archivo.name;
                guardarMaterial(material);
                
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
                // Limpiar
                window.materialArchivoSeleccionado = null;
                document.getElementById('file-input').value = '';
                document.getElementById('file-name-display').style.display = 'none';
            };
            reader.onerror = function() {
                alert('❌ Error al leer el archivo. Intenta nuevamente.');
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            };
            reader.readAsDataURL(archivo);
            return;
        } else if (tipo === 'video') {
            const url = document.getElementById('nuevo-material-video-url').value.trim();
            if (!url) {
                alert('Ingresa la URL del video');
                return;
            }
            material.url = url;
            guardarMaterial(material);
        } else if (tipo === 'enlace') {
            const url = document.getElementById('nuevo-material-enlace-url').value.trim();
            if (!url) {
                alert('Ingresa la URL del enlace');
                return;
            }
            material.url = url;
            guardarMaterial(material);
        } else if (tipo === 'nota') {
            const contenido = document.getElementById('nuevo-material-nota-contenido').value.trim();
            if (!contenido) {
                alert('Ingresa el contenido de la nota');
                return;
            }
            material.contenido = contenido;
            guardarMaterial(material);
        } else {
            guardarMaterial(material);
        }
    }

    function guardarMaterial(material) {
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const materia = data.materias.find(m => m.id === materiaSeleccionada.id);
        if (materia) {
            if (!materia.materiales) materia.materiales = [];
            
            const existe = materia.materiales.some(m => m.titulo === material.titulo && m.tipo === material.tipo);
            if (existe) {
                alert(`⚠️ Ya existe un material con el título "${material.titulo}"`);
                return;
            }
            
            materia.materiales.push(material);
            window.EstudianteData.save(data);
            
            cerrarModal('modal-agregar-material');
            
            document.getElementById('nuevo-material-titulo').value = '';
            document.getElementById('nuevo-material-descripcion').value = '';
            document.getElementById('nuevo-material-video-url').value = '';
            document.getElementById('nuevo-material-enlace-url').value = '';
            document.getElementById('nuevo-material-nota-contenido').value = '';
            document.getElementById('file-input').value = '';
            document.getElementById('file-name-display').style.display = 'none';
            window.materialArchivoSeleccionado = null;
            
            renderMateriaView(materia.id);
            renderSidebar();
            
            if (window.renderInicio) window.renderInicio();
            if (window.actualizarHeader) window.actualizarHeader();
            
            alert('✅ Material agregado correctamente');
        }
    }

    function verMaterial(materiaId, materialId) {
        console.log(`🟡 verMaterial: ${materiaId}, ${materialId}`);
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const materia = data.materias.find(m => m.id === materiaId);
        if (!materia) return;
        
        const material = materia.materiales.find(m => m.id === materialId);
        if (!material) return;
        
        document.getElementById('visor-titulo').textContent = material.titulo;
        const contenido = document.getElementById('visor-contenido');
        
        let html = '';
        
        switch (material.tipo) {
            case 'pdf':
                if (material.url && material.url.startsWith('data:application/pdf')) {
                    html = `<embed src="${material.url}" type="application/pdf" class="visor-pdf">`;
                } else if (material.url) {
                    html = `<iframe src="${material.url}" class="visor-pdf"></iframe>`;
                } else {
                    html = `<div class="visor-nota">📄 Archivo PDF: ${material.nombreArchivo || 'Sin archivo'}</div>`;
                }
                break;
                
            case 'video':
                html = `
                    <div class="visor-video-container">
                        <iframe src="${material.url}" allowfullscreen></iframe>
                    </div>
                `;
                break;
                
            case 'enlace':
                html = `
                    <div class="visor-enlace">
                        <p style="margin-bottom: 1rem; color: #4a5568;">🔗 ${material.descripcion || 'Enlace'}</p>
                        <a href="${material.url}" target="_blank" rel="noopener noreferrer">
                            <i class="fas fa-external-link-alt"></i> Abrir enlace
                        </a>
                        <p style="margin-top: 1rem; color: #718096; font-size: 0.85rem;">${material.url}</p>
                    </div>
                `;
                break;
                
            case 'nota':
                html = `
                    <div class="visor-nota">
                        <p style="font-weight: 600; color: #667eea; margin-bottom: 0.5rem;">📝 Nota de estudio</p>
                        ${material.contenido || 'Sin contenido'}
                    </div>
                `;
                break;
                
            case 'documento':
                if (material.url && material.url.startsWith('data:')) {
                    html = `
                        <div class="visor-enlace">
                            <i class="fas fa-file-alt" style="font-size: 3rem; color: #4f46e5; display: block; margin-bottom: 1rem;"></i>
                            <p style="font-weight: 600; font-size: 1.1rem;">${material.nombreArchivo || 'Documento'}</p>
                            <p style="color: #718096; margin-bottom: 1rem;">${material.descripcion || 'Sin descripción'}</p>
                            <button class="btn btn-primary" onclick="window.open('${material.url}')">
                                <i class="fas fa-download"></i> Descargar archivo
                            </button>
                        </div>
                    `;
                } else {
                    html = `<div class="visor-nota">📊 Documento: ${material.nombreArchivo || 'Sin archivo'}</div>`;
                }
                break;
                
            case 'imagen':
                if (material.url && material.url.startsWith('data:image')) {
                    html = `<img src="${material.url}" alt="${material.titulo}" class="visor-imagen">`;
                } else if (material.url) {
                    html = `<img src="${material.url}" alt="${material.titulo}" class="visor-imagen">`;
                } else {
                    html = `<div class="visor-nota">🖼️ Imagen: ${material.nombreArchivo || 'Sin archivo'}</div>`;
                }
                break;
                
            default:
                html = `
                    <div class="visor-nota">
                        <p>📌 ${material.titulo}</p>
                        <p style="color: #718096;">${material.descripcion || 'Sin descripción'}</p>
                        ${material.nombreArchivo ? `<p>📎 Archivo: ${material.nombreArchivo}</p>` : ''}
                    </div>
                `;
        }
        
        contenido.innerHTML = html;
        document.getElementById('modal-ver-material').classList.add('active');
    }

    function eliminarMaterial(materiaId, materialId) {
        console.log(`🟡 eliminarMaterial: ${materiaId}, ${materialId}`);
        
        if (!confirm('¿Eliminar este material?')) return;
        
        const data = window.EstudianteData ? window.EstudianteData.load() : null;
        if (!data) return;
        
        const materia = data.materias.find(m => m.id === materiaId);
        if (materia) {
            materia.materiales = materia.materiales.filter(m => m.id !== materialId);
            window.EstudianteData.save(data);
            
            renderMateriaView(materiaId);
            renderSidebar();
            
            if (window.renderInicio) window.renderInicio();
            if (window.actualizarHeader) window.actualizarHeader();
        }
    }

    function cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    // ===== API PÚBLICA =====
    return {
        init,
        seleccionarMateria,
        abrirAgregarMateria,
        agregarMateria,
        editarMateria,
        guardarEditarMateria,
        eliminarMateria,
        abrirAgregarNota,
        agregarNota,
        editarNota,
        guardarEditarNota,
        eliminarNota,
        cambiarTipoMaterial,
        abrirAgregarMaterial,
        agregarMaterial,
        verMaterial,
        eliminarMaterial,
        cerrarModal
    };
})();

window.Cursos = Cursos;
console.log('✅ cursos.js cargado y Cursos disponible globalmente');

// ================================================
// ===== FUNCIONES GLOBALES PARA SELECCIÓN DE ARCHIVOS =====
// ================================================

// Variable global para almacenar el archivo seleccionado
window.materialArchivoSeleccionado = null;

// Función global que maneja la selección del archivo (se llama desde onchange)
window.handleFileSelect = function(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    
    console.log('📎 Archivo seleccionado:', file ? file.name : 'ninguno');
    
    if (!file) {
        console.log('❌ No se seleccionó ningún archivo');
        document.getElementById('file-name-display').style.display = 'none';
        window.materialArchivoSeleccionado = null;
        return;
    }
    
    // Validar tamaño (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        alert(`⚠️ El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)} MB). El límite es 2 MB.`);
        fileInput.value = '';
        document.getElementById('file-name-display').style.display = 'none';
        window.materialArchivoSeleccionado = null;
        return;
    }
    
    // Validar tipo según el tipo seleccionado
    const tipoSelect = document.getElementById('nuevo-material-tipo');
    const tipo = tipoSelect ? tipoSelect.value : 'pdf';
    
    const tiposPermitidos = {
        'pdf': ['application/pdf'],
        'documento': ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        'imagen': ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
    };
    
    const permitidos = tiposPermitidos[tipo] || [];
    if (permitidos.length > 0 && !permitidos.includes(file.type)) {
        alert(`⚠️ Formato de archivo no permitido para ${tipo}. Solo se aceptan: ${permitidos.join(', ')}`);
        fileInput.value = '';
        document.getElementById('file-name-display').style.display = 'none';
        window.materialArchivoSeleccionado = null;
        return;
    }
    
    // GUARDAR EL ARCHIVO EN LA VARIABLE GLOBAL
    window.materialArchivoSeleccionado = file;
    document.getElementById('file-name-display').style.display = 'block';
    document.getElementById('file-name-text').textContent = file.name + ' (' + (file.size / 1024 / 1024).toFixed(2) + ' MB)';
    console.log('✅ Archivo guardado correctamente:', file.name);
};