// js/data.js - Gestión de datos
console.log('🟢 data.js cargado');

const ESTUDIANTE_KEY = 'estudiante_data';

const datosIniciales = {
    perfil: {
        nombre: 'María García',
        email: 'maria.garcia@email.com',
        carrera: 'Ingeniería de Sistemas',
        semestre: '6to Semestre',
        universidad: 'Universidad Tecnológica'
    },
    materias: [
        {
            id: 1,
            nombre: 'Matemáticas',
            profesor: 'Dr. Rodríguez',
            nota: 8.5,
            notaMinima: 6.0,
            escalaId: '0-10',
            escalaLabel: '0 a 10',
            escalaMin: 0,
            escalaMax: 10,
            notas: [
                { id: 101, nombre: 'Examen Parcial 1', valor: 7.5, porcentaje: 30 },
                { id: 102, nombre: 'Examen Parcial 2', valor: 8.0, porcentaje: 30 },
                { id: 103, nombre: 'Examen Final', valor: 6.5, porcentaje: 40 }
            ],
            materiales: [
                { id: 201, titulo: 'Álgebra Lineal', descripcion: 'Fundamentos de álgebra lineal', fecha: '2026-06-20' },
                { id: 202, titulo: 'Cálculo Diferencial', descripcion: 'Derivadas e integrales', fecha: '2026-06-18' }
            ]
        },
        {
            id: 2,
            nombre: 'Física',
            profesor: 'Dr. Martínez',
            nota: 7.8,
            notaMinima: 6.0,
            escalaId: '0-10',
            escalaLabel: '0 a 10',
            escalaMin: 0,
            escalaMax: 10,
            notas: [
                { id: 104, nombre: 'Examen Parcial 1', valor: 6.0, porcentaje: 30 },
                { id: 105, nombre: 'Laboratorio', valor: 8.5, porcentaje: 20 }
            ],
            materiales: [
                { id: 203, titulo: 'Mecánica Clásica', descripcion: 'Leyes de Newton', fecha: '2026-06-19' }
            ]
        },
        {
            id: 3,
            nombre: 'Química',
            profesor: 'Dra. López',
            nota: 9.2,
            notaMinima: 7.0,
            escalaId: '0-10',
            escalaLabel: '0 a 10',
            escalaMin: 0,
            escalaMax: 10,
            notas: [],
            materiales: []
        },
        {
            id: 4,
            nombre: 'Historia',
            profesor: 'Dr. Pérez',
            nota: 6.5,
            notaMinima: 6.0,
            escalaId: '0-10',
            escalaLabel: '0 a 10',
            escalaMin: 0,
            escalaMax: 10,
            notas: [],
            materiales: []
        },
        {
            id: 5,
            nombre: 'Inglés',
            profesor: 'Ms. Smith',
            nota: 7.0,
            notaMinima: 6.0,
            escalaId: '0-10',
            escalaLabel: '0 a 10',
            escalaMin: 0,
            escalaMax: 10,
            notas: [],
            materiales: []
        },
        {
            id: 6,
            nombre: 'Programación',
            profesor: 'Ing. Gómez',
            nota: 4.5,
            notaMinima: 6.0,
            escalaId: '0-10',
            escalaLabel: '0 a 10',
            escalaMin: 0,
            escalaMax: 10,
            notas: [],
            materiales: []
        }
    ]
};

function loadEstudianteData() {
    const stored = localStorage.getItem(ESTUDIANTE_KEY);
    if (stored) {
        try {
            const data = JSON.parse(stored);
            data.materias = data.materias.map(m => ({
                ...m,
                notas: m.notas || [],
                materiales: m.materiales || [],
                notaMinima: m.notaMinima || 6.0,
                escalaId: m.escalaId || '0-10',
                escalaLabel: m.escalaLabel || '0 a 10',
                escalaMin: m.escalaMin || 0,
                escalaMax: m.escalaMax || 10
            }));
            return data;
        } catch (e) {
            console.error('Error cargando datos:', e);
            return JSON.parse(JSON.stringify(datosIniciales));
        }
    }
    return JSON.parse(JSON.stringify(datosIniciales));
}

function saveEstudianteData(data) {
    localStorage.setItem(ESTUDIANTE_KEY, JSON.stringify(data));
    console.log('✅ Datos guardados');
}

function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function updateEstadisticas(data) {
    const totalMaterias = data.materias.length;
    const materiasConNota = data.materias.filter(m => m.notas && m.notas.length > 0);
    
    let sumaPromedios = 0;
    materiasConNota.forEach(m => {
        const notas = m.notas || [];
        let sumaPonderada = 0;
        let totalPorcentaje = 0;
        notas.forEach(n => {
            sumaPonderada += (n.valor || 0) * (n.porcentaje || 0);
            totalPorcentaje += (n.porcentaje || 0);
        });
        if (totalPorcentaje > 0) {
            sumaPromedios += sumaPonderada / totalPorcentaje;
        }
    });
    
    const promedio = materiasConNota.length > 0 
        ? (sumaPromedios / materiasConNota.length).toFixed(1)
        : '0';
    
    const totalMateriales = data.materias.reduce((sum, m) => sum + (m.materiales?.length || 0), 0);
    
    const aprobadas = data.materias.filter(m => {
        const notas = m.notas || [];
        if (notas.length === 0) return false;
        let sumaPonderada = 0;
        let totalPorcentaje = 0;
        notas.forEach(n => {
            sumaPonderada += (n.valor || 0) * (n.porcentaje || 0);
            totalPorcentaje += (n.porcentaje || 0);
        });
        if (totalPorcentaje === 0) return false;
        const promedioNota = sumaPonderada / totalPorcentaje;
        return promedioNota >= (m.notaMinima || 6.0) && totalPorcentaje >= 100;
    }).length;
    
    return {
        totalMaterias,
        promedio,
        totalMateriales,
        aprobadas
    };
}

window.EstudianteData = {
    load: loadEstudianteData,
    save: saveEstudianteData,
    generateId: generateId,
    updateEstadisticas: updateEstadisticas
};

console.log('✅ data.js inicializado');