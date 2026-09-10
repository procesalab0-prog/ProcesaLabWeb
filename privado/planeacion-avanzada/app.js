const customerNeeds = [
  { name: 'Calidad funcional y confiable', importance: 10, type: 'Básico' },
  { name: 'Uso sencillo e intuitivo', importance: 10, type: 'Desempeño' },
  { name: 'Carga y respuesta rápidas', importance: 8, type: 'Desempeño' },
  { name: 'Información clara y suficiente', importance: 7, type: 'Desempeño' },
  { name: 'Atención y asesoría oportuna', importance: 6, type: 'Desempeño' },
  { name: 'Integración de canales y procesos', importance: 9, type: 'Desempeño' },
  { name: 'Diseño dinámico y atractivo', importance: 6, type: 'Emocional' },
  { name: 'Precio claro y accesible', importance: 5, type: 'Desempeño' },
  { name: 'Seguridad y confianza digital', importance: 6, type: 'Básico' }
];

const technicalRequirements = [
  { short: 'Pruebas QA', name: 'Flujos críticos aprobados', target: '≥ 95%' },
  { short: 'Usabilidad', name: 'Éxito en tareas clave', target: '≥ 85%' },
  { short: 'Rendimiento', name: 'Core Web Vitals', target: 'LCP ≤ 2.5 s' },
  { short: 'Contenido', name: 'Cobertura de información y CTA', target: '100%' },
  { short: 'Atención', name: 'Primera respuesta hábil', target: '≤ 30 min' },
  { short: 'Integraciones', name: 'Disponibilidad de conexiones', target: '≥ 99%' },
  { short: 'Diseño UI', name: 'Consistencia y accesibilidad', target: 'WCAG AA' },
  { short: 'Diagnóstico', name: 'Requisitos trazables', target: '100%' },
  { short: 'Propuesta', name: 'Alcance y precio definidos', target: '≤ 48 h' }
];

const relationships = [
  [9,3,3,1,1,9,3,9,1],
  [3,9,3,3,1,3,9,3,1],
  [3,1,9,1,3,3,1,1,0],
  [1,3,1,9,3,3,3,3,3],
  [1,1,1,3,9,3,1,3,1],
  [3,3,3,3,3,9,3,9,1],
  [1,3,1,3,1,1,9,3,1],
  [1,1,1,1,1,1,1,3,9],
  [9,1,1,1,3,9,1,3,3]
];

const currentAssessment = [6, 6, 5, 7, 7, 5, 7, 6, 6];
const futureTarget = [9, 9, 9, 9, 9, 9, 9, 8, 9];
const competitorScores = {
  'ConlineWeb': [8, 8, 8, 8, 8, 8, 8, 7, 8],
  'Nexxu MX': [8, 8, 8, 6, 6, 8, 8, 6, 8],
  'Integra': [8, 8, 7, 7, 7, 9, 6, 7, 7]
};
const improvementRatios = currentAssessment.map((value, i) => futureTarget[i] / value);
const enterpriseWeights = customerNeeds.map((need, i) => need.importance * improvementRatios[i]);
const technicalScores = technicalRequirements.map((_, col) =>
  relationships.reduce((sum, row, i) => sum + row[col] * enterpriseWeights[i], 0)
);
const scoreTotal = technicalScores.reduce((a, b) => a + b, 0);
const technicalPercentages = technicalScores.map(score => score / scoreTotal * 100);

function renderCustomerRank() {
  const root = document.querySelector('#customerRank');
  if (!root) return;
  root.innerHTML = '<div class="panel-head"><div><span class="panel-kicker">Prioridad de los ¿qué?</span><h3>Requerimientos del cliente</h3></div><span class="sample">escala 1–10</span></div>' +
    customerNeeds.map((item, index) => `
      <div class="rank-row">
        <span>${index + 1}. ${item.name}</span>
        <div class="rank-track"><i data-width="${item.importance * 10}%"></i></div>
        <b>${item.importance}</b>
      </div>`).join('');
}

function renderQfd() {
  const table = document.querySelector('#qfdTable');
  if (!table) return;
  const competitorNames = Object.keys(competitorScores);
  const head = `<thead><tr><th class="corner">¿QUÉ necesita el cliente?<br><small>Importancia →</small></th>${technicalRequirements.map((item, i) => `<th title="${item.name}"><span>${String(i + 1).padStart(2, '0')}</span><br>${item.short}<br><small>${item.target}</small></th>`).join('')}<th class="benchmark-col procesa">ProcesaLab<br><small>actual*</small></th>${competitorNames.map(name => `<th class="benchmark-col">${name}<br><small>web pública*</small></th>`).join('')}<th class="benchmark-col target">Meta<br><small>futura</small></th><th class="benchmark-col calc">Índice<br><small>mejora</small></th><th class="benchmark-col calc">Peso<br><small>empresa</small></th></tr></thead>`;
  const body = `<tbody>${customerNeeds.map((need, row) => `<tr><th>${need.name}<small>${need.importance}</small></th>${relationships[row].map((value, col) => `<td class="rel" data-row="${row}" data-col="${col}" data-v="${value}" title="${need.name} × ${technicalRequirements[col].name}: ${value || 'sin relación'}">${value || ''}</td>`).join('')}<td class="benchmark-score procesa">${currentAssessment[row]}</td>${competitorNames.map(name => `<td class="benchmark-score">${competitorScores[name][row]}</td>`).join('')}<td class="benchmark-score target">${futureTarget[row]}</td><td class="benchmark-score calc">${improvementRatios[row].toFixed(2)}</td><td class="benchmark-score calc">${enterpriseWeights[row].toFixed(1)}</td></tr>`).join('')}</tbody>`;
  const foot = `<tfoot><tr><th>Prioridad técnica</th>${technicalScores.map((score, i) => `<td title="${technicalPercentages[i].toFixed(1)}%">${Math.round(score)}</td>`).join('')}<td colspan="7">* Benchmark documental preliminar · índice = meta ÷ actual</td></tr></tfoot>`;
  table.innerHTML = head + body + foot;
  table.querySelectorAll('.rel').forEach(cell => {
    const toggle = on => {
      const row = cell.dataset.row;
      const col = cell.dataset.col;
      table.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
      if (!on) return;
      table.querySelector(`tbody tr:nth-child(${Number(row) + 1}) th`)?.classList.add('highlight');
      table.querySelector(`thead th:nth-child(${Number(col) + 2})`)?.classList.add('highlight');
      cell.classList.add('highlight');
    };
    cell.addEventListener('mouseenter', () => toggle(true));
    cell.addEventListener('mouseleave', () => toggle(false));
    cell.addEventListener('click', () => toggle(true));
  });
}

function renderTechnicalPriorities() {
  const root = document.querySelector('#techPriorities');
  if (!root) return;
  const ranked = technicalRequirements.map((item, i) => ({ ...item, score: technicalScores[i], pct: technicalPercentages[i] })).sort((a, b) => b.score - a.score);
  root.innerHTML = `<div class="panel-head"><div><span class="panel-kicker">Suma ponderada</span><h3>Prioridades de los ¿cómo?</h3></div><span class="sample">100%</span></div>` + ranked.map((item, index) => `
    <div class="tech-row"><i>${String(index + 1).padStart(2, '0')}</i><span>${item.name}</span><div class="tech-track"><b data-width="${item.pct / ranked[0].pct * 100}%"></b></div><strong>${item.pct.toFixed(1)}%</strong></div>`).join('');
}

function renderBenchmark() {
  const root = document.querySelector('#benchmarkChart');
  if (!root) return;
  const data = [
    ['Calidad', 6, 8, 8, 8], ['Facilidad', 6, 8, 8, 8], ['Rapidez', 5, 8, 8, 7],
    ['Atención', 7, 8, 6, 7], ['Integración', 5, 8, 8, 9], ['Confianza', 6, 8, 8, 7]
  ];
  const series = [
    ['ProcesaLab', 'var(--red)'], ['ConlineWeb', 'var(--pink)'], ['Nexxu MX', '#806491'], ['Integra', '#ffe45e']
  ];
  root.innerHTML = `<div class="bench-legend">${series.map(s => `<span><i style="--c:${s[1]}"></i>${s[0]}</span>`).join('')}</div><div class="bench-grid">${data.map(item => `<div class="bench-item"><div class="bench-bars">${item.slice(1).map((value, i) => `<div class="bench-bar" style="--v:${value};--c:${series[i][1]}"><b>${value}</b></div>`).join('')}</div><span>${item[0]}</span></div>`).join('')}</div>`;
}

function renderRoof() {
  const svg = document.querySelector('#correlationRoof');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  const cols = 9;
  const size = 62;
  const startX = 320;
  const baseY = 212;
  const correlations = new Map([
    ['0-5', '++'], ['0-7', '+'], ['1-6', '++'], ['1-7', '+'], ['2-6', '−'], ['2-5', '−'],
    ['3-4', '+'], ['3-6', '+'], ['4-8', '−'], ['5-7', '+'], ['6-7', '+'], ['7-8', '−']
  ]);
  const outline = document.createElementNS(ns, 'path');
  outline.setAttribute('d', `M 40 ${baseY} L ${startX} 8 L 600 ${baseY} Z`);
  outline.setAttribute('fill', 'rgba(255,251,246,.72)'); outline.setAttribute('stroke', '#111'); outline.setAttribute('stroke-width', '2');
  svg.appendChild(outline);
  let rowIndex = 0;
  for (let gap = 1; gap < cols; gap++) {
    for (let left = 0; left < cols - gap; left++) {
      const x = 72 + left * size + gap * size / 2;
      const y = baseY - gap * 24;
      const diamond = document.createElementNS(ns, 'rect');
      diamond.setAttribute('x', x - 19); diamond.setAttribute('y', y - 19); diamond.setAttribute('width', 38); diamond.setAttribute('height', 38);
      diamond.setAttribute('transform', `rotate(45 ${x} ${y})`); diamond.setAttribute('fill', rowIndex % 2 ? '#F7B6C9' : '#FFFBF6'); diamond.setAttribute('stroke', '#111'); diamond.setAttribute('stroke-width', '.8');
      svg.appendChild(diamond);
      const value = correlations.get(`${left}-${left + gap}`);
      if (value) {
        const text = document.createElementNS(ns, 'text'); text.setAttribute('x', x); text.setAttribute('y', y + 4); text.setAttribute('text-anchor', 'middle'); text.setAttribute('font-family', 'Space Grotesk'); text.setAttribute('font-size', value === '++' ? '12' : '15'); text.setAttribute('font-weight', '700'); text.textContent = value; svg.appendChild(text);
      }
      rowIndex++;
    }
  }
}

function observeMotion() {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in', 'animated');
    entry.target.querySelectorAll('[data-width]').forEach(el => el.style.width = el.dataset.width);
    observer.unobserve(entry.target);
  }), { threshold: .14 });
  document.querySelectorAll('.reveal,.reveal-stagger,.stacked,.tech-bars,.benchmark,.rank-chart').forEach(el => observer.observe(el));

  const counters = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target; const target = Number(el.dataset.count); const suffix = el.dataset.suffix || ''; const start = performance.now();
    const tick = now => { const p = Math.min((now - start) / 850, 1); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix; if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); counters.unobserve(el);
  }), { threshold: .5 });
  document.querySelectorAll('[data-count]').forEach(el => counters.observe(el));
}

function initNavigation() {
  const progress = document.querySelector('#progressBar');
  const topbar = document.querySelector('#topbar');
  const dots = [...document.querySelectorAll('.chapter-dots a')];
  const chapters = [...document.querySelectorAll('.chapter')];
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
    topbar.classList.toggle('solid', scrollY > 40);
    let active = chapters[0]?.id;
    chapters.forEach(section => { if (section.getBoundingClientRect().top < innerHeight * .45) active = section.id; });
    dots.forEach(dot => dot.classList.toggle('active', dot.getAttribute('href') === `#${active}`));
  };
  addEventListener('scroll', update, { passive: true });
  update();
  document.querySelectorAll('.question button').forEach(button => button.addEventListener('click', () => button.closest('.question').classList.toggle('open')));
  document.querySelector('#presentBtn')?.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  document.querySelector('#printBtn')?.addEventListener('click', () => print());
}

renderCustomerRank();
renderQfd();
renderTechnicalPriorities();
renderBenchmark();
renderRoof();
observeMotion();
initNavigation();
