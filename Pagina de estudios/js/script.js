// ===== script.js =====
document.addEventListener('DOMContentLoaded', () => {
  // ---------- DATOS SIMULADOS ----------
  const studentData = {
    name: 'María Fernández',
    career: 'Ingeniería de Software · 4º Semestre',
    email: 'maria.fernandez@edu.com',
    entry: '2024-03-15',
    status: 'Activo',
    subjects: [
      { name: 'Matemáticas', grade: 85 },
      { name: 'Lenguaje', grade: 92 },
      { name: 'Ciencias', grade: 78 },
      { name: 'Historia', grade: 88 },
      { name: 'Inglés', grade: 95 }
    ],
    attendance: { total: 42, faltas: 3, retrasos: 5 },
    monthlyGrades: [72, 80, 85, 88, 84, 91], // Ene–Jun
    badges: [
      { icon: 'fa-trophy', label: 'Excelencia Académica' },
      { icon: 'fa-book', label: '100 Horas de Estudio' },
      { icon: 'fa-check-circle', label: 'Meta Cumplida' },
      { icon: 'fa-star', label: 'Asistencia Destacada' }
    ]
  };

  // Calcular promedios
  const grades = studentData.subjects.map(s => s.grade);
  const avg = grades.reduce((a,b) => a+b, 0) / grades.length;
  const best = studentData.subjects.reduce((a,b) => a.grade > b.grade ? a : b);
  const worst = studentData.subjects.reduce((a,b) => a.grade < b.grade ? a : b);
  const lastGrade = grades[grades.length-1];
  const attendancePercent = Math.round((studentData.attendance.total / (studentData.attendance.total + studentData.attendance.faltas)) * 100);

  // ---------- 1. RESUMEN GENERAL (tarjetas) ----------
  const summaryData = [
    { icon: 'fa-calculator', value: avg.toFixed(1), desc: 'Promedio General' },
    { icon: 'fa-user-check', value: `${attendancePercent}%`, desc: 'Asistencia' },
    { icon: 'fa-check-circle', value: '4', desc: 'Materias Aprobadas' },
    { icon: 'fa-clock', value: '1', desc: 'Materias Pendientes' },
    { icon: 'fa-tasks', value: '24', desc: 'Tareas Completadas' },
    { icon: 'fa-clock', value: '32h', desc: 'Horas de Estudio' }
  ];

  const summaryGrid = document.getElementById('summaryGrid');
  summaryData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'summary-card';
    card.innerHTML = `
      <div class="icon"><i class="fas ${item.icon}"></i></div>
      <div class="info"><div class="value">${item.value}</div><div class="desc">${item.desc}</div></div>
    `;
    summaryGrid.appendChild(card);
  });

  // ---------- 2. RENDIMIENTO + BARRAS ----------
  document.getElementById('bestSubject').textContent = best.name;
  document.getElementById('worstSubject').textContent = worst.name;
  document.getElementById('lastGrade').textContent = lastGrade;
  document.getElementById('globalAvg').textContent = avg.toFixed(1);

  const progressContainer = document.getElementById('progressBars');
  studentData.subjects.forEach((sub, idx) => {
    const pct = sub.grade;
    const item = document.createElement('div');
    item.className = 'progress-item';
    item.innerHTML = `
      <span class="subject">${sub.name}</span>
      <div class="progress-track"><div class="progress-fill" data-width="${pct}"></div></div>
      <span class="percent">${pct}%</span>
    `;
    progressContainer.appendChild(item);
    // Animación al cargar (se dispara con timeout)
    setTimeout(() => {
      const fill = item.querySelector('.progress-fill');
      fill.style.width = pct + '%';
    }, 200 + idx * 120);
  });

  // ---------- 3. EVOLUCIÓN (gráfico) ----------
  const chart = document.getElementById('chartContainer');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const maxGrade = 100;
  studentData.monthlyGrades.forEach((val, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'bar-wrapper';
    const bar = document.createElement('div');
    bar.className = 'bar';
    const heightPct = (val / maxGrade) * 100;
    bar.style.height = '0px';
    const label = document.createElement('span');
    label.className = 'bar-label';
    label.textContent = months[i];
    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    chart.appendChild(wrapper);
    // animación escalonada
    setTimeout(() => {
      bar.style.height = Math.max(8, heightPct * 1.2) + 'px';
      bar.style.background = `hsl(235, 70%, ${60 + (val/100)*25}%)`;
    }, 300 + i * 100);
  });

  // ---------- 4. ASISTENCIA (anillo) ----------
  const { total, faltas, retrasos } = studentData.attendance;
  document.getElementById('attTotal').textContent = total;
  document.getElementById('attFaltas').textContent = faltas;
  document.getElementById('attRetrasos').textContent = retrasos;
  const ringFill = document.getElementById('ringFill');
  const attPercent = document.getElementById('attPercent');
  const p = Math.min(100, Math.round((total / (total + faltas)) * 100));
  ringFill.style.setProperty('--p', p + '%');
  attPercent.textContent = p + '%';

  // ---------- 5. METAS (LocalStorage) ----------
  let goals = JSON.parse(localStorage.getItem('studentGoals')) || [
    { id: Date.now()+1, text: 'Obtener promedio de 4.5', completed: false },
    { id: Date.now()+2, text: 'Estudiar 15 horas por semana', completed: false }
  ];

  function renderGoals() {
    const list = document.getElementById('goalsList');
    list.innerHTML = '';
    goals.forEach(goal => {
      const li = document.createElement('li');
      li.className = 'goal-item';
      li.innerHTML = `
        <div class="goal-text ${goal.completed ? 'completed' : ''}">
          <i class="fas ${goal.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
          <span>${goal.text}</span>
        </div>
        <div>
          <button class="complete-btn" data-id="${goal.id}"><i class="fas ${goal.completed ? 'fa-undo' : 'fa-check'}"></i></button>
          <button class="delete-btn" data-id="${goal.id}"><i class="fas fa-trash"></i></button>
        </div>
      `;
      list.appendChild(li);
    });
    // eventos
    document.querySelectorAll('.complete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(btn.dataset.id);
        const goal = goals.find(g => g.id === id);
        if (goal) { goal.completed = !goal.completed; saveAndRender(); }
      });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(btn.dataset.id);
        goals = goals.filter(g => g.id !== id);
        saveAndRender();
      });
    });
  }

  function saveAndRender() {
    localStorage.setItem('studentGoals', JSON.stringify(goals));
    renderGoals();
    updateRecommendations(); // actualiza recomendaciones al cambiar metas
  }

  document.getElementById('addGoalBtn').addEventListener('click', () => {
    const input = document.getElementById('goalInput');
    const text = input.value.trim();
    if (text) {
      goals.push({ id: Date.now(), text, completed: false });
      input.value = '';
      saveAndRender();
    }
  });
  document.getElementById('goalInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('addGoalBtn').click();
  });

  renderGoals();

  // ---------- 6. LOGROS ----------
  const badgesContainer = document.getElementById('badgesContainer');
  studentData.badges.forEach(b => {
    const div = document.createElement('div');
    div.className = 'badge';
    div.innerHTML = `<i class="fas ${b.icon}"></i> ${b.label}`;
    badgesContainer.appendChild(div);
  });

  // ---------- 7. RECOMENDACIONES (dinámicas) ----------
  function updateRecommendations() {
    const list = document.getElementById('recommendationsList');
    const msgs = [];
    // basado en notas
    if (best.grade >= 90) msgs.push(`✅ Excelente trabajo en ${best.name}.`);
    if (worst.grade < 75) msgs.push(`⚠️ Tu promedio en ${worst.name} está por debajo del promedio general.`);
    if (avg >= 85) msgs.push(`🌟 Promedio general sobresaliente (${avg.toFixed(1)}).`);
    // asistencia
    if (attendancePercent >= 90) msgs.push(`🎯 Tu asistencia supera el 90%.`);
    else if (attendancePercent < 80) msgs.push(`📉 Tu asistencia es baja, intenta mejorar.`);
    // metas
    const pendingGoals = goals.filter(g => !g.completed);
    if (pendingGoals.length === 0 && goals.length > 0) msgs.push(`🏁 ¡Has completado todas tus metas!`);
    else if (pendingGoals.length > 0) msgs.push(`📌 Tienes ${pendingGoals.length} meta(s) pendiente(s).`);
    // si no hay mensajes, uno genérico
    if (msgs.length === 0) msgs.push('💡 Sigue esforzándote, vas por buen camino.');

    list.innerHTML = msgs.map(m => `<li><i class="fas fa-chevron-right"></i> ${m}</li>`).join('');
  }
  updateRecommendations();

  // ---------- ANIMACIONES ADICIONALES (contadores) ----------
  // ya se aplicaron en barras y gráfico
  console.log('Dashboard cargado con éxito');
});