import { firebaseConfig, OWNER_EMAIL, OWNER_EMAIL_SHA256 } from './firebase-config.js';
import { LocalStore, FirebaseStore } from './store.js';
import { EXERCISES, PLANTILLAS, SEMANA, DIAS, GROUPS, GROUP_COLOR, EQUIP, MUSCLES, VOLUMEN_OBJETIVO, byId, GRUPO_MUSCULO, NOMBRES_ANTIGUOS } from './db.js';
import { hayCuenta, haySesion, nombreCuenta, registrar, entrar, salir, cambiarPassword, quitarCuenta, renovarSesion, cifradoDisponible } from './auth.js';
import { exerciseSVG } from './anim.js';
import { icon, injectDefs, lineChart, weekBars, goalRing, bodyMap, calendarHeat, plateView, celebrate } from './ui.js';

// ═══════════ Utilidades ═══════════
const $ = s => document.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const daysAgoISO = n => { const d = new Date(Date.now() - n * 864e5); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const mondayISO = () => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
const fmt = (n, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toLocaleString('es-ES');
const kfmt = n => (n >= 1000 ? fmt(n / 1000, 1) + 'k' : fmt(n, 0));
const fdate = iso => new Date(iso + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const fshort = iso => new Date(iso + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const e1rm = (kg, reps) => (reps <= 1 ? kg : kg * (1 + reps / 30));
const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.createdAt || 0) - (b.createdAt || 0));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const sinAcentos = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function toast(msg, win = false) {
  const t = $('#toast');
  t.innerHTML = msg;
  t.classList.toggle('win', win);
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), win ? 3200 : 2300);
}

// ═══════════ Estado ═══════════
let store;
const S = {
  data: null,
  route: { v: 'inicio' },
  active: null,
  progEx: null, progMetric: 'max',
  filtro: { q: '', grupo: '', equipo: '', fav: false },
  pick: [], pickTarget: null,
  rest: { end: 0, iv: null, total: 90 },
  celebrated: new Set(),
};
const ACTIVE_KEY = 'iron-active-v2', REST_KEY = 'iron-rest-v1';
const saveActive = () => { try { S.active ? localStorage.setItem(ACTIVE_KEY, JSON.stringify(S.active)) : localStorage.removeItem(ACTIVE_KEY); } catch {} };
const loadActive = () => { try { return JSON.parse(localStorage.getItem(ACTIVE_KEY)); } catch { return null; } };

function upsert(col, item) {
  const arr = S.data[col], i = arr.findIndex(x => x.id === item.id);
  i >= 0 ? (arr[i] = item) : arr.push(item);
  store.put(S.data, col, item);
}
function remove(col, id) {
  S.data[col] = S.data[col].filter(x => x.id !== id);
  store.del(S.data, col, id);
}
const saveProfile = () => store.setProfile(S.data);
const profile = () => S.data.profile;
const restSec = () => num(profile().restSec) || 90;
const weeklyGoal = () => num(profile().weeklyGoal) || 4;
const favoritos = () => profile().favs || [];

// Catálogo = ejercicios de la app + los que crees tú
const allEx = () => [...EXERCISES, ...(S.data.exercises || [])];
const exById = id => byId[id] || (S.data.exercises || []).find(e => e.id === id);
const exName = id => exById(id)?.n || 'Ejercicio no encontrado';
const exGroup = id => exById(id)?.g || 'Otro';
const exMuscles = id => exById(id)?.m || [];

// ═══════════ Cálculos ═══════════
function exHistory(exId, excludeId) {
  const rows = [];
  for (const w of [...S.data.workouts].sort(byDate)) {
    if (w.id === excludeId) continue;
    const sets = w.entries.filter(e => e.exerciseId === exId).flatMap(e => e.sets);
    if (!sets.length) continue;
    rows.push({
      date: w.date, sets,
      max: Math.max(...sets.map(s => s.kg)),
      rm: Math.max(...sets.map(s => e1rm(s.kg, s.reps))),
      vol: sets.reduce((a, s) => a + s.kg * s.reps, 0),
      reps: Math.max(...sets.map(s => s.reps)),
    });
  }
  return rows;
}
const setsText = sets => sets.map(s => `${fmt(s.kg)}×${s.reps}`).join(' · ');
const wVolume = w => w.entries.reduce((a, e) => a + e.sets.reduce((b, s) => b + s.kg * s.reps, 0), 0);
const wSets = w => w.entries.reduce((a, e) => a + e.sets.length, 0);
const workoutsSince = iso => S.data.workouts.filter(w => w.date >= iso && w.date <= todayISO());
const thisWeek = () => workoutsSince(mondayISO());

function muscleLoad(days = 7, desde) {
  const from = desde || daysAgoISO(days - 1), load = {};
  for (const w of workoutsSince(from))
    for (const en of w.entries)
      for (const m of exMuscles(en.exerciseId)) load[m] = (load[m] || 0) + en.sets.length;
  return load;
}
function weekStreak() {
  if (!S.data.workouts.length) return 0;
  const lunes = d => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); x.setHours(0, 0, 0, 0); return x.getTime(); };
  const semanas = new Set(S.data.workouts.map(w => lunes(new Date(w.date + 'T12:00'))));
  let cur = lunes(new Date()), n = 0;
  if (!semanas.has(cur)) cur -= 7 * 864e5;
  while (semanas.has(cur)) { n++; cur -= 7 * 864e5; }
  return n;
}
const beats = (a, b) => !b || a.kg > b.kg || (a.kg === b.kg && a.reps > b.reps);
function allPRs() {
  const best = {};
  for (const w of [...S.data.workouts].sort(byDate))
    for (const en of w.entries)
      for (const s of en.sets)
        if (beats(s, best[en.exerciseId])) best[en.exerciseId] = { ...s, date: w.date, exerciseId: en.exerciseId };
  return Object.values(best).filter(p => exById(p.exerciseId)).sort((a, b) => (a.date < b.date ? 1 : -1));
}
function bestSet(exId, excludeId) {
  let b = null;
  for (const w of [...S.data.workouts].sort(byDate)) {
    if (w.id === excludeId) continue;
    for (const en of w.entries.filter(e => e.exerciseId === exId))
      for (const s of en.sets) if (beats(s, b)) b = { ...s, date: w.date };
  }
  return b;
}
const prText = p => (p.kg > 0 ? `${fmt(p.kg)} kg × ${p.reps}` : `${p.reps} reps`);

// Qué toca hoy en este ejercicio, mirando la última vez
function sugerencia(exId, excludeId) {
  const h = exHistory(exId, excludeId);
  if (!h.length) return null;
  const last = h.at(-1);
  const top = last.sets.reduce((b, s) => (beats(s, b) ? s : b), last.sets[0]);
  if (!top.kg) return { kg: 0, reps: top.reps + 1, motivo: 'Una repetición más que la última vez' };
  const salto = top.kg >= 60 ? 2.5 : 1.25;
  if (top.reps >= 10) return { kg: top.kg + salto, reps: 8, motivo: 'Pasaste de 10 repeticiones: toca subir peso' };
  return { kg: top.kg, reps: top.reps + 1, motivo: 'Intenta una repetición más que la última vez' };
}
// ¿Llevas varias sesiones sin mejorar?
function estancado(exId) {
  const h = exHistory(exId);
  if (h.length < 3) return 0;
  const ult = h.slice(-4);
  const tope = Math.max(...ult.map(r => r.max));
  const desde = ult.findIndex(r => r.max >= tope);
  return desde <= ult.length - 3 ? ult.length - 1 - desde : 0;
}

function latestWeight() { const a = [...S.data.bodyweights].sort(byDate); return a.at(-1) || null; }
function bmi() {
  const h = num(profile().heightCm) / 100, w = latestWeight();
  if (!h || !w) return null;
  const v = w.kg / (h * h);
  const c = v < 18.5 ? ['Bajo peso', 'var(--info)'] : v < 25 ? ['Normal', 'var(--ok)'] : v < 30 ? ['Sobrepeso', 'var(--accent-2)'] : ['Obesidad', 'var(--danger)'];
  return { v, cat: c };
}
// Discos por lado para llegar a un peso
function discos(objetivo, barra = 20) {
  if (!(objetivo > 0) || objetivo > 1000) return null;
  const disponibles = [25, 20, 15, 10, 5, 2.5, 1.25];
  let porLado = (objetivo - barra) / 2, out = [];
  if (porLado < 0) return null;
  for (const d of disponibles) while (porLado >= d - 0.001) { out.push(d); porLado = Math.round((porLado - d) * 100) / 100; }
  return { discos: out, sobra: porLado };
}

// ═══════════ Navegación ═══════════
const TABS = [
  ['inicio', 'Inicio', 'inicio'],
  ['entrenar', 'Entrenar', 'pesa'],
  ['ejercicios', 'Ejercicios', 'libro'],
  ['progreso', 'Progreso', 'grafica'],
  ['perfil', 'Perfil', 'usuario'],
];
function go(v, id) { S.route = { v, id }; render(); scrollTo({ top: 0 }); }
const VOLVER = { ejercicio: 'ejercicios', historial: 'inicio', calendario: 'progreso', plantillas: 'entrenar' };
const aDondeVuelvo = () => (S.route.v === 'ejercicio' && S.active ? 'entrenar' : VOLVER[S.route.v] || 'inicio');

function renderTabs() {
  $('#tabbar').innerHTML = TABS.map(([id, label, ic]) => `
    <button data-tab="${id}" class="${S.route.v === id ? 'active' : ''}">
      ${icon(ic)}<span>${label}</span>${id === 'entrenar' && S.active ? '<i class="live-dot"></i>' : ''}
    </button>`).join('');
}

// ═══════════ Vistas ═══════════
const views = {
  inicio: viewInicio,
  entrenar: () => (S.active ? viewLive() : viewEntrenar()),
  ejercicios: viewEjercicios,
  ejercicio: viewFichaEjercicio,
  progreso: viewProgreso,
  perfil: viewPerfil,
  historial: viewHistorial,
  calendario: viewCalendario,
  plantillas: viewPlantillas,
};

// ── Portada ──
function viewInicio() {
  const p = profile();
  const nombre = p.name ? esc(p.name.split(' ')[0]) : '';
  const h = new Date().getHours();
  const saludo = h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
  const racha = weekStreak();
  const wk = thisWeek();
  const vol = wk.reduce((a, w) => a + wVolume(w), 0);
  const sets = wk.reduce((a, w) => a + wSets(w), 0);
  const prs = allPRs();
  const last = [...S.data.workouts].sort(byDate).at(-1);
  const labels = [], values = [];
  for (let i = 6; i >= 0; i--) {
    const d = daysAgoISO(i);
    labels.push(new Date(d + 'T12:00').toLocaleDateString('es-ES', { weekday: 'narrow' }).toUpperCase());
    values.push(S.data.workouts.filter(w => w.date === d).reduce((a, w) => a + wVolume(w), 0));
  }
  const load = muscleLoad(7);
  const next = sugerirRutina();

  return `<div class="stagger">
    <section class="portada">
      <div class="portada-bg"><i></i><i></i><i></i></div>
      <div class="portada-in">
        <span class="hero-date">${cap(new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }))}</span>
        <h1 class="hero-title">${saludo}${nombre ? `,<br>${nombre}` : ''}</h1>
        ${!nombre ? '<p class="muted" style="margin:6px 0 0">Listo para entrenar</p>' : ''}
        <div class="row" style="margin-top:14px">
          ${racha ? `<span class="streak">${icon('fuego', 15)} ${racha} semana${racha === 1 ? '' : 's'} seguida${racha === 1 ? '' : 's'}</span>` : ''}
          <span class="streak alt">${icon('pesa', 15)} ${S.data.workouts.length} entreno${S.data.workouts.length === 1 ? '' : 's'}</span>
        </div>
        ${S.active
          ? `<button class="primary block big" data-act="go" data-v="entrenar" style="margin-top:18px">
              ${icon('play', 20)} Continuar entreno</button>`
          : `<button class="primary block big" data-act="go" data-v="entrenar" style="margin-top:18px">
              ${icon('play', 20)} Empezar a entrenar</button>`}
      </div>
    </section>

    <div class="card">${goalRing(wk.length, weeklyGoal())}</div>

    <div class="tiles">
      <div class="tile"><span class="tiny">Volumen</span><b class="count">${kfmt(vol)}</b><u>kg esta semana</u></div>
      <div class="tile"><span class="tiny">Series</span><b class="count">${sets}</b><u>esta semana</u></div>
      <div class="tile"><span class="tiny">Récords</span><b class="count">${prs.length}</b><u>ejercicios</u></div>
      <div class="tile"><span class="tiny">Ejercicios</span><b class="count">${allEx().length}</b><u>en el catálogo</u></div>
    </div>

    <div class="section-head"><h2>Tu semana</h2><span class="tiny">kg por día</span></div>
    <div class="card">${weekBars(values, labels)}</div>

    <div class="section-head"><h2>Músculos trabajados</h2><span class="tiny">últimos 7 días</span></div>
    <div class="card">${bodyMap(load)}</div>

    ${next ? `<div class="section-head"><h2>Te toca</h2><span class="tiny">${esc(next.motivo)}</span></div>
      ${rutinaCard(next.rutina, true)}` : ''}

    ${prs.length ? `<div class="section-head"><h2>Últimos récords</h2>
        <button class="sm ghost" data-act="go" data-v="progreso">Ver todos</button></div>
      <div class="card">${prs.slice(0, 3).map((p, i) => prItem(p, i)).join('')}</div>` : ''}

    ${last ? `<div class="section-head"><h2>Último entreno</h2>
        <button class="sm ghost" data-act="go" data-v="historial">Historial</button></div>
      ${workoutCard(last, true)}` : `<div class="card center">
        <p class="muted">Aún no has guardado ningún entreno.</p>
        <button class="primary" data-act="go" data-v="entrenar">${icon('play', 18)} Empezar el primero</button></div>`}
  </div>`;
}

const prItem = (p, i) => `
  <div class="pr-item" data-act="go" data-v="ejercicio" data-id="${p.exerciseId}" role="button">
    <div class="pr-rank">${i + 1}</div>
    <div class="grow"><b>${esc(exName(p.exerciseId))}</b><div class="muted small">${fshort(p.date)}</div></div>
    <div style="text-align:right"><b class="num">${p.kg > 0 ? fmt(p.kg) + ' kg' : p.reps + ' reps'}</b>
      <div class="muted small">${p.kg > 0 ? '× ' + p.reps : 'peso corporal'}</div></div>
    ${icon('derecha', 18, 'chev')}
  </div>`;

function sugerirRutina() {
  const rs = S.data.routines;
  if (!rs.length) return null;
  const hoy = ((new Date().getDay() + 6) % 7) + 1;   // 1 = lunes … 7 = domingo
  const deHoy = rs.find(r => r.dia === hoy);
  if (deHoy) return { rutina: deHoy, motivo: `hoy es ${DIAS[hoy].toLowerCase()}` };
  const uso = {};
  for (const w of [...S.data.workouts].sort(byDate)) if (w.routineId) uso[w.routineId] = w.date;
  const orden = [...rs].sort((a, b) => ((uso[a.id] || '0') < (uso[b.id] || '0') ? -1 : 1));
  const r = orden[0];
  return { rutina: r, motivo: uso[r.id] ? `sin hacerla desde el ${fshort(uso[r.id])}` : 'aún no la has hecho' };
}

function rutinaCard(r, destacada = false) {
  const grupos = [...new Set(r.exerciseIds.map(exGroup))];
  return `<div class="routine ${destacada ? 'destacada' : ''}">
    <div class="routine-top">
      <div class="grow"><h3>${esc(r.name)}</h3>
        <span class="muted small">${r.exerciseIds.length} ejercicios${r.dia ? ` · ${DIAS[r.dia]}` : ''}</span></div>
      <div class="mini-figs">${r.exerciseIds.slice(0, 3).map(id =>
        `<div class="mini-fig">${exerciseSVG(exById(id)?.pose || 'curl', { anim: false })}</div>`).join('')}</div>
    </div>
    <div class="chips" style="margin:10px 0 12px">
      ${grupos.map(g => `<span class="tag m" style="--mc:${GROUP_COLOR[g] || '#8d96a7'}">${esc(g)}</span>`).join('')}</div>
    <div class="row nowrap">
      <button class="primary grow" data-act="start" data-id="${r.id}">${icon('play', 18)} Empezar</button>
      <button class="icon-btn" data-act="edit-routine" data-id="${r.id}" aria-label="Editar rutina">${icon('editar', 18)}</button>
      <button class="icon-btn danger" data-act="del-routine" data-id="${r.id}" aria-label="Borrar rutina">${icon('papelera', 18)}</button>
    </div></div>`;
}

// ── Entrenar ──
function viewEntrenar() {
  return `<div class="stagger">
    <div class="section-head"><h2>Mis rutinas</h2>
      <div class="row nowrap">
        <button class="sm" data-act="go" data-v="plantillas">${icon('estrella', 15)} Plantillas</button>
        <button class="sm primary" data-act="edit-routine">${icon('mas', 15)} Nueva</button>
      </div></div>
    ${S.data.routines.length
      ? S.data.routines.map(r => rutinaCard(r)).join('')
      : `<div class="card center">
          <p class="muted">Todavía no tienes rutinas guardadas.</p>
          <div class="row" style="justify-content:center">
            <button class="primary" data-act="go" data-v="plantillas">${icon('estrella', 18)} Usar una plantilla</button>
            <button data-act="edit-routine">${icon('mas', 18)} Crear la mía</button>
          </div></div>`}
    <button class="block" data-act="start" style="margin-top:6px">${icon('rayo', 18)} Entreno libre</button>
    ${S.data.routines.some(r => r.dia) ? '' : `
      <div class="card" style="margin-top:16px">
        <div class="row nowrap">${icon('calendario', 20)}<div class="grow">
          <b>Semana completa de ejemplo</b>
          <div class="muted small">Siete rutinas listas, una para cada día: pecho, espalda, pierna, hombro, empuje y tirón, glúteo y cardio, y descanso activo.</div>
        </div></div>
        <button class="primary block" style="margin-top:10px" data-act="cargar-semana">Añadir las 7 rutinas</button>
      </div>`}
  </div>`;
}

function viewPlantillas() {
  return `<div class="stagger">
    <div class="section-head"><h2>Plantillas de rutina</h2></div>
    <p class="muted small">Rutinas ya montadas. Al añadirlas se copian a las tuyas y puedes cambiarlas a tu gusto.</p>
    <div class="card">
      <div class="row nowrap">${icon('calendario', 20)}<div class="grow"><b>Semana completa (7 días)</b>
        <div class="muted small">Una rutina para cada día, ya asignada a su día de la semana.</div></div></div>
      <button class="primary block" style="margin-top:10px" data-act="cargar-semana">Añadir las 7 rutinas</button>
    </div>
    ${PLANTILLAS.map(p => `
      <div class="card">
        <div class="row between"><h3>${esc(p.n)}</h3>
          <button class="sm primary" data-act="add-plantilla" data-id="${p.id}">${icon('mas', 15)} Añadir</button></div>
        <p class="muted small" style="margin:6px 0 10px">${esc(p.desc)}</p>
        ${p.dias.map(d => `<div class="ex-line"><span><b>${esc(d.n)}</b></span>
          <span class="muted small">${d.ex.map(id => esc(exName(id))).join(' · ')}</span></div>`).join('')}
      </div>`).join('')}
  </div>`;
}

// ── Entreno en curso ──
function viewLive() {
  const a = S.active;
  const vol = a.entries.reduce((t, e) => t + e.sets.reduce((b, s) => b + num(s.kg) * num(s.reps), 0), 0);
  const hechas = a.entries.reduce((t, e) => t + e.sets.filter(s => s.done).length, 0);
  const totales = a.entries.reduce((t, e) => t + e.sets.length, 0);
  return `
    <div class="live-head">
      <div class="row between nowrap">
        <div class="grow"><span class="tiny"><i class="rec-dot"></i> Entrenando</span>
          <input data-bind="name" value="${esc(a.name)}" maxlength="60" aria-label="Nombre del entreno" class="live-name"></div>
        <input type="date" data-bind="date" value="${a.date}" min="${daysAgoISO(3650)}" max="${todayISO()}" class="live-date" aria-label="Fecha">
      </div>
      <div class="live-metrics">
        <div><b id="elapsed">${elapsed()}</b><span class="tiny">tiempo</span></div>
        <div><b class="num">${kfmt(vol)}</b><span class="tiny">kg</span></div>
        <div><b class="num">${hechas}/${totales}</b><span class="tiny">series</span></div>
      </div>
      <div class="progress-line"><i style="width:${totales ? (hechas / totales) * 100 : 0}%"></i></div>
    </div>
    ${a.entries.map((en, i) => exCard(en, i)).join('') ||
      '<div class="card center"><p class="muted">Añade el primer ejercicio.</p></div>'}
    <button class="block" data-act="pick-exercise">${icon('mas', 18)} Añadir ejercicio</button>
    <div class="row" style="margin-top:12px">
      <span class="tiny grow">Descanso rápido</span>
      ${[60, 90, 120, 180].map(s => `<button class="sm" data-act="rest" data-s="${s}">${s < 120 ? s + 's' : s / 60 + ' min'}</button>`).join('')}
    </div>
    <div class="fab-row">
      <button class="primary grow" data-act="finish">${icon('check', 18)} Terminar y guardar</button>
      <button class="danger" data-act="discard" aria-label="Descartar entreno">${icon('papelera', 18)}</button>
    </div>
    <div class="fab-space"></div>`;
}

function exCard(en, ei) {
  const ex = exById(en.exerciseId);
  const hist = exHistory(en.exerciseId, S.active.editingId);
  const last = hist.at(-1);
  const best = bestSet(en.exerciseId, S.active.editingId);
  const sug = sugerencia(en.exerciseId, S.active.editingId);
  const g = ex?.g || 'Otro';
  const enSerie = en.ss && S.active.entries.filter(x => x.ss === en.ss).length > 1;
  const primeroSerie = enSerie && S.active.entries.findIndex(x => x.ss === en.ss) === ei;
  return `
    <div class="ex-card ${enSerie ? 'en-superserie' : ''}">
      ${primeroSerie ? '<div class="ss-label">Superserie</div>' : ''}
      <div class="ex-head">
        <div class="mini-fig sm" data-act="go" data-v="ejercicio" data-id="${en.exerciseId}" role="button" aria-label="Ver ficha">
          ${exerciseSVG(ex?.pose || 'curl', { anim: false })}</div>
        <div class="grow">
          <h3>${esc(ex?.n || 'Ejercicio')}</h3>
          <span class="tag m" style="--mc:${GROUP_COLOR[g] || '#8d96a7'}">${esc(g)}</span>
        </div>
        <button class="icon-btn ghost" data-act="ex-menu" data-ei="${ei}" aria-label="Opciones">${icon('mas-opciones', 18)}</button>
      </div>
      <div class="ex-body">
        <div class="last-time">
          ${last ? `Última vez (${fshort(last.date)}): ${setsText(last.sets)}` : 'Primera vez con este ejercicio'}
          ${best ? ` · <span class="accent">Récord ${prText(best)}</span>` : ''}
        </div>
        ${sug ? `<div class="sugerencia" data-act="aplicar-sug" data-ei="${ei}" role="button">
          ${icon('rayo', 16)}<div class="grow"><b>Hoy: ${sug.kg ? fmt(sug.kg) + ' kg × ' + sug.reps : sug.reps + ' reps'}</b>
          <div class="muted small">${esc(sug.motivo)}</div></div>
          <span class="tiny">Usar</span></div>` : ''}
        <table class="sets">
          <tr><th></th><th>KG</th><th>REPS</th><th></th></tr>
          ${en.sets.map((s, si) => {
            const isPR = best && num(s.reps) > 0 && beats({ kg: num(s.kg), reps: num(s.reps) }, best);
            return `<tr class="${s.done ? 'done' : ''} ${isPR ? 'pr' : ''}" data-ei="${ei}" data-si="${si}">
              <td><div class="snum">${isPR ? icon('trofeo', 14) : si + 1}</div></td>
              <td><input inputmode="decimal" maxlength="6" data-set="kg" value="${esc(s.kg ?? '')}" placeholder="${esc(last?.sets[si]?.kg ?? '—')}" aria-label="Kilos serie ${si + 1}"></td>
              <td><input inputmode="numeric" maxlength="4" data-set="reps" value="${esc(s.reps ?? '')}" placeholder="${esc(last?.sets[si]?.reps ?? '—')}" aria-label="Repeticiones serie ${si + 1}"></td>
              <td><button class="ok-btn" data-act="done-set" aria-label="Serie hecha">${icon('check', 18)}</button></td>
            </tr>`;
          }).join('')}
        </table>
        <div class="row" style="margin-top:8px">
          <button class="sm grow" data-act="add-set" data-ei="${ei}">${icon('mas', 15)} Serie</button>
          ${en.sets.length ? `<button class="sm ghost" data-act="del-set" data-ei="${ei}" aria-label="Quitar serie">${icon('menos', 15)}</button>` : ''}
          ${num(en.sets[0]?.kg) > 0 ? `<button class="sm ghost" data-act="discos" data-kg="${num(en.sets[0].kg)}">${icon('peso', 15)} Discos</button>` : ''}
        </div>
      </div>
    </div>`;
}
// Refresca volumen y series de la cabecera sin repintar toda la pantalla
function actualizarCabecera() {
  const a = S.active, cab = document.querySelector('.live-metrics');
  if (!a || !cab) return;
  const vol = a.entries.reduce((t, e) => t + e.sets.reduce((b, x) => b + num(x.kg) * num(x.reps), 0), 0);
  const hechas = a.entries.reduce((t, e) => t + e.sets.filter(x => x.done).length, 0);
  const total = a.entries.reduce((t, e) => t + e.sets.length, 0);
  const b = cab.querySelectorAll('b');
  if (b[1]) b[1].textContent = kfmt(vol);
  if (b[2]) b[2].textContent = `${hechas}/${total}`;
  const barra = document.querySelector('.progress-line i');
  if (barra) barra.style.width = `${total ? (hechas / total) * 100 : 0}%`;
}
const elapsed = () => {
  const m = Math.floor((Date.now() - (S.active?.startedAt || Date.now())) / 60000);
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60}'` : `${m}'`;
};

// ── Biblioteca de ejercicios ──
function viewEjercicios() {
  const f = S.filtro;
  const q = sinAcentos(f.q);
  const lista = allEx().filter(e =>
    (!q || sinAcentos(e.n).includes(q) || sinAcentos(e.g).includes(q) || e.m.some(m => sinAcentos(MUSCLES[m] || '').includes(q))) &&
    (!f.grupo || e.g === f.grupo) &&
    (!f.equipo || e.eq === f.equipo) &&
    (!f.fav || favoritos().includes(e.id)));
  return `
    <div class="section-head"><h2>Ejercicios</h2><span class="tiny">${lista.length} de ${allEx().length}</span></div>
    <div class="buscador">
      ${icon('buscar', 18)}
      <input id="q" class="grow" placeholder="Buscar ejercicio o músculo…" value="${esc(f.q)}" autocomplete="off">
      ${f.q ? `<button class="icon-btn ghost" data-act="limpiar-q" aria-label="Limpiar">${icon('cerrar', 16)}</button>` : ''}
    </div>
    <div class="chips scroll-x">
      <button class="chip ${f.fav ? 'on' : ''}" data-act="filtro" data-k="fav">${icon('estrella', 14)} Favoritos</button>
      ${GROUPS.map(g => `<button class="chip ${f.grupo === g ? 'on' : ''}" data-act="filtro" data-k="grupo" data-v="${g}">${g}</button>`).join('')}
    </div>
    <div class="chips scroll-x" style="margin-top:6px">
      ${Object.entries(EQUIP).map(([k, v]) => `<button class="chip sm ${f.equipo === k ? 'on' : ''}" data-act="filtro" data-k="equipo" data-v="${k}">${v}</button>`).join('')}
    </div>
    <div class="ex-grid">
      ${lista.map(e => `
        <button class="ex-tile" data-act="go" data-v="ejercicio" data-id="${e.id}">
          <div class="ex-demo sm">${exerciseSVG(e.pose, { anim: false })}</div>
          <div class="ex-tile-txt">
            <b>${esc(e.n)}</b>
            <span class="tag m" style="--mc:${GROUP_COLOR[e.g] || '#8d96a7'}">${esc(e.g)}</span>
            <span class="tiny">${EQUIP[e.eq] || ''}</span>
          </div>
          ${favoritos().includes(e.id) ? `<span class="fav-mark">${icon('estrella', 14)}</span>` : ''}
        </button>`).join('') || '<p class="muted">No hay ejercicios con esos filtros.</p>'}
    </div>
    <button class="block" style="margin-top:14px" data-act="new-exercise">${icon('mas', 18)} Crear un ejercicio mío</button>`;
}

// ── Ficha de un ejercicio ──
function viewFichaEjercicio() {
  const e = exById(S.route.id);
  if (!e) return `<div class="card"><p class="muted">Ese ejercicio ya no existe.</p></div>`;
  const h = exHistory(e.id);
  const best = bestSet(e.id);
  const fav = favoritos().includes(e.id);
  const est = estancado(e.id);
  const sug = sugerencia(e.id);
  const dif = ['', 'Fácil', 'Media', 'Difícil'][e.dif] || '';
  return `<div class="stagger">
    <div class="ficha-hero">
      <div class="ex-demo grande">${exerciseSVG(e.pose)}</div>
    </div>
    <div class="row between" style="margin-top:14px">
      <h2 class="grow">${esc(e.n)}</h2>
      <button class="icon-btn ${fav ? 'on' : ''}" data-act="fav" data-id="${e.id}" aria-label="Favorito">${icon('estrella', 18)}</button>
    </div>
    <div class="chips" style="margin:8px 0 4px">
      <span class="tag m" style="--mc:${GROUP_COLOR[e.g] || '#8d96a7'}">${esc(e.g)}</span>
      <span class="tag">${EQUIP[e.eq] || 'Otro'}</span>
      ${dif ? `<span class="tag">${dif}</span>` : ''}
    </div>
    <div class="chips" style="margin-bottom:12px">
      ${e.m.map(m => `<span class="chip sm">${esc(MUSCLES[m] || m)}</span>`).join('')}
    </div>

    <div class="row">
      <button class="primary grow" data-act="add-to-workout" data-id="${e.id}">${icon('play', 18)} ${S.active ? 'Añadir al entreno' : 'Entrenar esto ahora'}</button>
      <button data-act="add-to-routine" data-id="${e.id}">${icon('lista', 18)} A una rutina</button>
    </div>

    ${sug ? `<div class="card accent-edge" style="margin-top:14px">
      <span class="tiny">Objetivo de hoy</span>
      <h3>${sug.kg ? fmt(sug.kg) + ' kg × ' + sug.reps : sug.reps + ' repeticiones'}</h3>
      <p class="muted small" style="margin:4px 0 0">${esc(sug.motivo)}</p>
      ${sug.kg ? `<button class="sm" style="margin-top:8px" data-act="discos" data-kg="${sug.kg}">${icon('peso', 15)} Ver discos</button>` : ''}
    </div>` : ''}

    ${est >= 2 ? `<div class="card aviso">${icon('alerta', 20)}
      <div><b>Llevas ${est} sesiones sin mejorar</b>
      <div class="muted small">Prueba a bajar el peso un 10% y subir repeticiones, o cambia a un ejercicio parecido durante unas semanas.</div></div></div>` : ''}

    <div class="section-head"><h3>Cómo se hace</h3></div>
    <div class="card"><ol class="pasos">${e.pasos.map(p => `<li>${esc(p)}</li>`).join('')}</ol></div>

    ${e.tips?.length ? `<div class="section-head"><h3>Consejos</h3></div>
      <div class="card">${e.tips.map(t => `<div class="tip">${icon('idea', 16)}<span>${esc(t)}</span></div>`).join('')}</div>` : ''}

    ${e.fallos?.length ? `<div class="section-head"><h3>Errores típicos</h3></div>
      <div class="card">${e.fallos.map(t => `<div class="tip malo">${icon('cerrar', 16)}<span>${esc(t)}</span></div>`).join('')}</div>` : ''}

    <div class="section-head"><h3>Tu historial</h3></div>
    ${h.length ? `<div class="card">
        <div class="tiles" style="margin-bottom:12px">
          <div class="tile"><span class="tiny">Récord</span><b>${best.kg > 0 ? fmt(best.kg) : best.reps}</b><u>${best.kg > 0 ? 'kg × ' + best.reps : 'reps'}</u></div>
          <div class="tile"><span class="tiny">Sesiones</span><b>${h.length}</b><u>registradas</u></div>
          <div class="tile"><span class="tiny">Última vez</span><b style="font-size:1.1rem">${fshort(h.at(-1).date)}</b><u>${setsText(h.at(-1).sets)}</u></div>
        </div>
        ${lineChart(h.map(r => ({ d: r.date, y: r.max })), 'kg')}
        ${h.slice(-6).reverse().map(r => `<div class="ex-line"><span>${fshort(r.date)}</span><span class="muted num">${setsText(r.sets)}</span></div>`).join('')}
      </div>`
      : `<div class="card center"><p class="muted">Aún no has hecho este ejercicio. Cuando lo entrenes, aquí verás tu progreso.</p></div>`}
  </div>`;
}

// ── Historial ──
function viewHistorial() {
  const ws = [...S.data.workouts].sort(byDate).reverse();
  if (!ws.length) return `<div class="section-head"><h2>Historial</h2></div>
    <div class="card center"><p class="muted">Aquí se guardará cada entreno que termines.</p></div>`;
  const total = ws.reduce((a, w) => a + wVolume(w), 0);
  let out = `<div class="section-head"><h2>Historial</h2><span class="tiny">${ws.length} entrenos</span></div>
    <div class="tiles" style="margin-bottom:14px">
      <div class="tile"><span class="tiny">Volumen total</span><b>${kfmt(total)}</b><u>kg levantados</u></div>
      <div class="tile"><span class="tiny">Series</span><b>${ws.reduce((a, w) => a + wSets(w), 0)}</b><u>en total</u></div>
      <div class="tile"><span class="tiny">Tiempo</span><b>${kfmt(ws.reduce((a, w) => a + (w.minutes || 0), 0) / 60)}</b><u>horas de gym</u></div>
    </div>`;
  let mes = '';
  for (const w of ws) {
    const m = cap(new Date(w.date + 'T12:00').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
    if (m !== mes) { mes = m; out += `<div class="section-head"><h3>${m}</h3></div>`; }
    out += `<div class="wk">${workoutCard(w)}</div>`;
  }
  return out;
}

function workoutCard(w, compacta = false) {
  return `<div class="card">
    <div class="row between">
      <div><h3>${esc(w.name)}</h3><span class="muted small">${cap(fdate(w.date))}${w.minutes ? ` · ${w.minutes} min` : ''}</span></div>
      <div style="text-align:right"><b class="num big-num">${kfmt(wVolume(w))}</b><div class="tiny">kg</div></div>
    </div>
    <div style="margin:10px 0 6px">${w.entries.map(e => `
      <div class="ex-line"><span>${esc(exName(e.exerciseId))}</span>
        <span class="muted num">${setsText(e.sets)}</span></div>`).join('')}</div>
    ${compacta ? '' : `<div class="row" style="margin-top:10px">
      <button class="sm grow" data-act="repeat" data-id="${w.id}">${icon('repetir', 15)} Repetir</button>
      <button class="sm" data-act="edit-workout" data-id="${w.id}" aria-label="Editar">${icon('editar', 15)}</button>
      <button class="sm danger" data-act="del-workout" data-id="${w.id}" aria-label="Borrar">${icon('papelera', 15)}</button>
    </div>`}
  </div>`;
}

// ── Progreso ──
function viewProgreso() {
  const usados = allEx().filter(e => S.data.workouts.some(w => w.entries.some(en => en.exerciseId === e.id && en.sets.length)));
  if (!S.progEx || !usados.some(e => e.id === S.progEx)) S.progEx = usados[0]?.id;
  const metricas = { max: 'Peso máximo', rm: '1RM estimado', vol: 'Volumen' };
  let bloque = `<div class="card center"><p class="muted">Guarda algún entreno y aquí verás tu evolución.</p></div>`;
  if (S.progEx) {
    const h = exHistory(S.progEx);
    const best = h.reduce((b, r) => (r.max > b.max || (r.max === b.max && r.reps > b.reps) ? r : b), h[0]);
    const bestRm = Math.max(...h.map(r => r.rm));
    const dif = h.at(-1).max - h[0].max;
    bloque = `<div class="card">
      <select data-change="prog-ex" aria-label="Ejercicio" style="margin-bottom:10px">
        ${usados.map(e => `<option value="${e.id}" ${e.id === S.progEx ? 'selected' : ''}>${esc(e.n)}</option>`).join('')}</select>
      <div class="chips" style="margin-bottom:10px">
        ${Object.entries(metricas).map(([k, l]) => `<button class="chip ${S.progMetric === k ? 'on' : ''}" data-act="prog-metric" data-m="${k}">${l}</button>`).join('')}</div>
      ${lineChart(h.map(r => ({ d: r.date, y: r[S.progMetric] })), 'kg')}
      <div class="tiles" style="margin-top:12px">
        <div class="tile"><span class="tiny">Récord</span><b>${best.max > 0 ? fmt(best.max) : best.reps}</b><u>${best.max > 0 ? 'kg' : 'reps'} · ${fshort(best.date)}</u></div>
        ${best.max > 0 ? `<div class="tile"><span class="tiny">1RM estimado</span><b>${fmt(bestRm)}</b><u>kg teóricos</u></div>` : ''}
        <div class="tile"><span class="tiny">Progreso</span><b style="color:${dif >= 0 ? 'var(--ok)' : 'var(--danger)'}">${dif >= 0 ? '+' : ''}${fmt(dif)}</b><u>kg · ${h.length} sesiones</u></div>
      </div>
      <button class="sm block" style="margin-top:10px" data-act="go" data-v="ejercicio" data-id="${S.progEx}">Ver ficha del ejercicio</button>
    </div>`;
  }

  const prs = allPRs();
  const bw = [...S.data.bodyweights].sort(byDate);
  const b = bmi();
  const semana = muscleLoad(0, mondayISO());
  const gruposMusc = Object.entries(semana).sort((a, c) => c[1] - a[1]);

  return `<div class="stagger">
    <div class="section-head"><h2>Por ejercicio</h2></div>${bloque}

    <div class="section-head"><h2>Volumen semanal</h2><span class="tiny">series por músculo</span></div>
    <div class="card">
      ${gruposMusc.length ? gruposMusc.map(([m, v]) => {
        const pct = Math.min(100, (v / VOLUMEN_OBJETIVO.max) * 100);
        const estado = v < VOLUMEN_OBJETIVO.min ? 'bajo' : v <= VOLUMEN_OBJETIVO.max ? 'ok' : 'alto';
        return `<div class="vol-row">
          <div class="row between small"><span>${MUSCLES[m] || m}</span>
            <span class="num ${estado}">${v} series</span></div>
          <div class="vol-bar"><i style="width:${pct}%" class="${estado}"></i>
            <u style="left:${(VOLUMEN_OBJETIVO.min / VOLUMEN_OBJETIVO.max) * 100}%"></u></div>
        </div>`;
      }).join('') + `<p class="tiny" style="margin-top:10px">La marca indica ${VOLUMEN_OBJETIVO.min} series; el final de la barra, ${VOLUMEN_OBJETIVO.max}. Es el rango que se suele recomendar por músculo y semana.</p>`
        : '<p class="muted small">Esta semana aún no has entrenado.</p>'}
    </div>

    <div class="section-head"><h2>Calendario</h2>
      <button class="sm ghost" data-act="go" data-v="calendario">Ver año</button></div>
    <div class="card">${calendarHeat(S.data.workouts.map(w => ({ d: w.date, v: wVolume(w) })), 18)}</div>

    ${prs.length ? `<div class="section-head"><h2>Récords personales</h2></div>
      <div class="card">${prs.map((p, i) => prItem(p, i)).join('')}</div>` : ''}

    <div class="section-head"><h2>Peso corporal</h2>
      <button class="sm ghost" data-act="go" data-v="perfil">Añadir</button></div>
    <div class="card">
      ${b ? `<div class="tiles" style="margin-bottom:12px">
        <div class="tile"><span class="tiny">Peso actual</span><b>${fmt(latestWeight().kg)}</b><u>kg</u></div>
        <div class="tile"><span class="tiny">IMC</span><b style="color:${b.cat[1]}">${fmt(b.v)}</b><u>${b.cat[0]}</u></div>
        ${bw.length >= 2 ? `<div class="tile"><span class="tiny">Cambio</span><b>${bw.at(-1).kg - bw[0].kg >= 0 ? '+' : ''}${fmt(bw.at(-1).kg - bw[0].kg)}</b><u>kg desde el inicio</u></div>` : ''}
      </div>` : '<p class="muted small">Añade tu altura y tu peso en Perfil para ver el IMC.</p>'}
      ${lineChart(bw.map(x => ({ d: x.date, y: x.kg })), 'kg')}
    </div>
  </div>`;
}

function viewCalendario() {
  const año = S.data.workouts.map(w => ({ d: w.date, v: wVolume(w) }));
  const porMes = {};
  for (const w of S.data.workouts) {
    const k = w.date.slice(0, 7);
    porMes[k] = (porMes[k] || 0) + 1;
  }
  const meses = Object.entries(porMes).sort().reverse().slice(0, 12);
  return `<div class="stagger">
    <div class="section-head"><h2>Tu año</h2><span class="tiny">${S.data.workouts.length} entrenos</span></div>
    <div class="card">${calendarHeat(año, 53)}</div>
    <div class="section-head"><h2>Por mes</h2></div>
    <div class="card">${meses.map(([k, v]) => {
      const [y, m] = k.split('-');
      const nombre = cap(new Date(+y, +m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
      return `<div class="vol-row"><div class="row between small"><span>${nombre}</span><span class="num">${v} entrenos</span></div>
        <div class="vol-bar"><i style="width:${Math.min(100, (v / 20) * 100)}%"></i></div></div>`;
    }).join('') || '<p class="muted small">Todavía no hay entrenos.</p>'}</div>
  </div>`;
}

// ── Perfil ──
function viewPerfil() {
  const p = profile();
  const bw = [...S.data.bodyweights].sort(byDate).reverse();
  const b = bmi();
  const nube = store.mode === 'firebase';
  return `<div class="stagger">
    <div class="section-head"><h2>Mi perfil</h2></div>
    <div class="card">
      <div class="field-row">
        <label><span>Nombre</span><input data-prof="name" value="${esc(p.name)}" placeholder="Tu nombre"></label>
        <label><span>Altura (cm)</span><input data-prof="heightCm" inputmode="decimal" value="${esc(p.heightCm)}" placeholder="178"></label>
        <label><span>Objetivo semanal</span><input data-prof="weeklyGoal" inputmode="numeric" value="${weeklyGoal()}"></label>
        <label><span>Descanso (seg)</span><input data-prof="restSec" inputmode="numeric" value="${restSec()}"></label>
      </div>
      ${b ? `<div class="tile"><span class="tiny">Índice de masa corporal</span>
        <b style="color:${b.cat[1]}">${fmt(b.v)} · ${b.cat[0]}</b>
        <u>El IMC no distingue músculo de grasa: tómalo solo como referencia.</u></div>` : ''}
    </div>

    <div class="section-head"><h2>Peso corporal</h2></div>
    <div class="card">
      <div class="row nowrap" style="margin-bottom:10px">
        <input type="date" id="bw-date" value="${todayISO()}" min="${daysAgoISO(3650)}" max="${todayISO()}" style="width:auto" aria-label="Fecha">
        <input id="bw-kg" class="grow" inputmode="decimal" placeholder="kg" aria-label="Peso">
        <button class="primary" data-act="add-bw" aria-label="Añadir peso">${icon('mas', 18)}</button>
      </div>
      ${bw.slice(0, 8).map(x => `<div class="ex-line"><span>${cap(fshort(x.date))}</span>
        <span><b class="num">${fmt(x.kg)} kg</b>
        <button class="icon-btn ghost sm" data-act="del-bw" data-id="${x.id}" aria-label="Borrar">${icon('papelera', 15)}</button></span></div>`).join('')
        || '<p class="muted small">Todavía no has apuntado ningún peso.</p>'}
    </div>

    <div class="section-head"><h2>Herramientas</h2></div>
    <div class="card">
      <button class="block" data-act="discos" data-kg="60">${icon('peso', 18)} Calculadora de discos</button>
    </div>

    <div class="section-head"><h2>Cuenta y privacidad</h2></div>
    <div class="card">
      ${nube ? `
        <div class="row nowrap" style="margin-bottom:10px">${icon('nube', 20)}
          <div class="grow"><b>Sincronizado</b><div class="muted small">${esc(store.user?.email || '')}</div></div></div>
        <div class="row nowrap" style="margin-bottom:12px">${icon('candado', 20)}
          <div class="grow"><b>App privada</b><div class="muted small">Solo tu cuenta puede entrar.</div></div></div>
        <button class="block" data-act="logout">${icon('salir', 18)} Cerrar sesión</button>`
      : `<div class="row nowrap" style="margin-bottom:12px">${icon('usuario', 20)}<div class="grow">
            <b>Cuenta de este dispositivo${nombreCuenta() ? `: ${esc(nombreCuenta())}` : ''}</b>
            <div class="muted small">Te pide la contraseña al abrir la app y cada 7 días.
              Es un candado sencillo: evita que alguien curiosee, pero no cifra los entrenos.
              Protección de verdad = modo nube con Firebase.</div></div></div>
          <div class="row">
            <button class="grow" data-act="cambiar-pass">${icon('candado', 18)} Cambiar contraseña</button>
            <button class="grow" data-act="logout-local">${icon('salir', 18)} Cerrar sesión</button>
          </div>
          <p class="tiny" style="margin:12px 0 0">Para sincronizar con el móvil y proteger los datos de verdad, configura Firebase.</p>`}
    </div>

    <div class="section-head"><h2>Copia de seguridad</h2></div>
    <div class="card">
      <div class="row">
        <button class="grow" data-act="export">${icon('bajar', 18)} Exportar</button>
        <label class="btn grow" style="margin:0;justify-content:center">${icon('subir', 18)} Importar
          <input type="file" id="import-file" accept="application/json" hidden></label>
      </div>
    </div>

    <div class="card" id="install-card">
      <div class="row nowrap">${icon('movil', 20)}<div class="grow"><b>Instalar en el dispositivo</b>
        <div class="muted small" id="install-hint"></div></div></div>
      <div id="install-slot"></div>
    </div>
    <p class="tiny center" style="margin:18px 0 0">IRON · tu gimnasio, tus datos</p>
  </div>`;
}

// ═══════════ Render ═══════════
function render() {
  const v = views[S.route.v] || viewInicio;
  try {
    $('#view').innerHTML = v();
  } catch (e) {
    console.error('Error dibujando la pantalla', e);
    $('#view').innerHTML = `<div class="card" style="margin-top:20px"><h2>Algo ha fallado</h2>
      <p class="muted">${esc(e.message)}</p>
      <p class="muted small">Tus datos siguen guardados.</p>
      <button class="primary block" data-act="go" data-v="inicio">Volver al inicio</button></div>`;
  }
  renderTabs();
  const atras = VOLVER[S.route.v];
  $('#back').classList.toggle('hidden', !atras);
  $('#brand').classList.toggle('hidden', !!atras);
  const p = profile();
  $('#avatar').textContent = (p.name || store.user?.displayName || '·').trim().charAt(0).toUpperCase();
  $('#sync').textContent = store.mode === 'local' ? 'Local' : navigator.onLine ? 'Sincronizado' : 'Sin conexión';
  $('#sync').classList.toggle('off', store.mode === 'firebase' && !navigator.onLine);
  const hint = $('#install-hint');
  if (hint) {
    const puesta = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    hint.textContent = puesta ? 'Ya la tienes instalada como app.'
      : deferredInstall ? 'Pulsa el botón para instalarla.'
      : 'En Android, menú del navegador y "Instalar app". En iPhone, Compartir y "Añadir a pantalla de inicio". En PC, el icono de instalar de la barra de direcciones.';
    $('#install-slot').innerHTML = (!puesta && deferredInstall)
      ? `<button class="primary block" style="margin-top:10px" data-act="install">Instalar ahora</button>` : '';
  }
}
setInterval(() => { const e = $('#elapsed'); if (e && S.active) e.textContent = elapsed(); }, 30000);

// ═══════════ Diálogos ═══════════
const dlg = $('#dlg');
const openDialog = html => { $('#dlg-body').innerHTML = `<div class="sheet-grip"></div>${html}`; dlg.showModal(); };
const closeDialog = () => dlg.close();
dlg.addEventListener('click', e => { if (e.target === dlg) closeDialog(); });

function selectorEjercicios(titulo, act, marcados = []) {
  return `<h2>${titulo}</h2>
    <div class="buscador" style="margin:12px 0">
      ${icon('buscar', 18)}<input id="ex-search" class="grow" placeholder="Buscar…" autocomplete="off"></div>
    <div id="ex-list" class="lista-sel">${GROUPS.map(g => {
      const list = allEx().filter(e => e.g === g);
      if (!list.length) return '';
      return `<div class="ex-group">
        <span class="tag m" style="--mc:${GROUP_COLOR[g]}">${g}</span>
        <div class="chips" style="margin-top:7px">${list.map(e => `
          <button class="chip ${marcados.includes(e.id) ? 'on' : ''}" data-act="${act}" data-id="${e.id}"
            data-name="${esc(sinAcentos(e.n))}">${esc(e.n)}</button>`).join('')}</div></div>`;
    }).join('')}</div>`;
}

function editorRutina(r) {
  S.pick = [...(r?.exerciseIds || [])];
  openDialog(`
    <label><span>Nombre de la rutina</span>
      <input id="rt-name" value="${esc(r?.name || '')}" maxlength="60" placeholder="Ej: Día de pecho"></label>
    <label><span>Día de la semana (opcional)</span>
      <select id="rt-dia">
        <option value="">Sin día fijo</option>
        ${DIAS.slice(1).map((d, i) => `<option value="${i + 1}" ${r?.dia === i + 1 ? 'selected' : ''}>${d}</option>`).join('')}
      </select></label>
    <span class="tiny">Ejercicios elegidos</span>
    <ol id="rt-order" class="small lista-orden"></ol>
    ${selectorEjercicios('Toca para añadir o quitar', 'toggle-pick', S.pick)}
    <div class="row" style="margin-top:16px">
      <button class="primary grow" data-act="save-routine" data-id="${r?.id || ''}">Guardar rutina</button>
      <button class="ghost" data-act="close">Cancelar</button></div>`);
  pintarOrden();
}
function pintarOrden() {
  const ol = $('#rt-order');
  if (ol) ol.innerHTML = S.pick.map(id => `<li>${esc(exName(id))}</li>`).join('') || '<li class="muted">Ninguno todavía</li>';
}

function dialogoDiscos(kg) {
  const barra = num(profile().barra) || 20;
  const r = discos(kg, barra);
  openDialog(`<h2>Calculadora de discos</h2>
    <div class="field-row" style="margin-top:12px">
      <label><span>Peso total (kg)</span><input id="dk" inputmode="decimal" maxlength="6" value="${fmt(kg)}"></label>
      <label><span>Barra (kg)</span><input id="db" inputmode="decimal" value="${barra}"></label>
    </div>
    <button class="primary block" data-act="calc-discos">Calcular</button>
    <div id="res-discos" style="margin-top:14px">${r ? plateView(r.discos, r.sobra, kg, barra) : '<p class="muted">Ese peso es menor que la barra.</p>'}</div>
    <button class="block ghost" style="margin-top:12px" data-act="close">Cerrar</button>`);
}

// ═══════════ Descanso ═══════════
let audioCtx;
function beep() {
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    [0, .22, .44].forEach((t, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = i === 2 ? 1180 : 860; o.type = 'sine';
      o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(.0001, audioCtx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(.3, audioCtx.currentTime + t + .02);
      g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + t + .18);
      o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + .2);
    });
  } catch {}
  navigator.vibrate?.([300, 120, 300]);
}
function startRest(sec, endAt) {
  try { audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); } catch {}
  S.rest.total = sec;
  S.rest.end = endAt || Date.now() + sec * 1000;
  try { localStorage.setItem(REST_KEY, JSON.stringify({ end: S.rest.end, total: sec })); } catch {}
  $('#rest').classList.remove('hidden', 'ended');
  document.body.classList.add('resting');
  clearInterval(S.rest.iv);
  S.rest.iv = setInterval(tickRest, 250);
  tickRest();
}
function tickRest() {
  const leftMs = S.rest.end - Date.now();
  const left = Math.max(0, Math.ceil(leftMs / 1000));
  $('#rest-time').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  $('#rest-bar').style.width = `${(Math.max(0, Math.min(1, leftMs / (S.rest.total * 1000))) * 100).toFixed(1)}%`;
  if (left <= 0) {
    clearInterval(S.rest.iv);
    $('#rest').classList.add('ended');
    beep();
    setTimeout(() => { if (Date.now() >= S.rest.end) stopRest(); }, 6000);
  }
}
function stopRest() {
  clearInterval(S.rest.iv);
  $('#rest').classList.add('hidden');
  document.body.classList.remove('resting');
  try { localStorage.removeItem(REST_KEY); } catch {}
}
function restoreRest() {
  try {
    const r = JSON.parse(localStorage.getItem(REST_KEY) || 'null');
    if (r && r.end > Date.now() + 500) startRest(r.total, r.end);
    else localStorage.removeItem(REST_KEY);
  } catch {}
}

// ═══════════ Acciones ═══════════
function startWorkout({ name, exerciseIds = [], from, routineId } = {}) {
  S.active = {
    name: name || 'Entreno libre', date: todayISO(), startedAt: Date.now(), routineId: routineId || null,
    entries: exerciseIds.map(id => ({ exerciseId: id, sets: prefillSets(id, from) })),
  };
  S.celebrated = new Set();
  saveActive(); go('entrenar');
}
function prefillSets(exId, from) {
  const src = from?.entries.find(e => e.exerciseId === exId)?.sets || exHistory(exId).at(-1)?.sets;
  return Array.from({ length: src?.length || 3 }, () => ({ kg: '', reps: '', done: false }));
}

const actions = {
  go: el => go(el.dataset.v, el.dataset.id),
  back: () => go(aDondeVuelvo()),

  start: el => {
    const r = S.data.routines.find(x => x.id === el.dataset.id);
    if (S.active && !confirm('Ya tienes un entreno en curso. ¿Empezar otro y descartarlo?')) return;
    startWorkout(r ? { name: r.name, exerciseIds: r.exerciseIds, routineId: r.id } : {});
  },
  repeat: el => {
    const w = S.data.workouts.find(x => x.id === el.dataset.id);
    if (S.active && !confirm('Ya tienes un entreno en curso. ¿Reemplazarlo?')) return;
    startWorkout({ name: w.name, exerciseIds: w.entries.map(e => e.exerciseId), from: w, routineId: w.routineId });
  },
  'edit-workout': el => {
    const w = S.data.workouts.find(x => x.id === el.dataset.id);
    if (S.active && !confirm('Ya tienes un entreno en curso. ¿Reemplazarlo?')) return;
    S.active = { ...structuredClone(w), editingId: w.id, startedAt: Date.now() - (w.minutes || 0) * 60000,
      entries: w.entries.map(e => ({ ...e, sets: e.sets.map(s => ({ ...s, done: true })) })) };
    S.celebrated = new Set();
    saveActive(); go('entrenar');
  },
  'del-workout': el => { if (confirm('¿Borrar este entreno?')) { remove('workouts', el.dataset.id); render(); toast('Entreno borrado'); } },

  'pick-exercise': () => openDialog(selectorEjercicios('Añadir ejercicio', 'add-entry') +
    `<button class="block ghost" style="margin-top:14px" data-act="close">Cerrar</button>`),
  'add-entry': el => {
    S.active.entries.push({ exerciseId: el.dataset.id, sets: prefillSets(el.dataset.id) });
    saveActive(); closeDialog(); render();
    scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  },
  'add-to-workout': el => {
    const id = el.dataset.id;
    if (!S.active) return startWorkout({ name: exName(id), exerciseIds: [id] });
    S.active.entries.push({ exerciseId: id, sets: prefillSets(id) });
    saveActive(); go('entrenar'); toast('Añadido al entreno');
  },
  'add-to-routine': el => {
    const id = el.dataset.id;
    if (!S.data.routines.length) { S.pick = [id]; return editorRutina(null); }
    openDialog(`<h2>Añadir a una rutina</h2>
      <p class="muted small">${esc(exName(id))}</p>
      <div class="stack" style="margin-top:12px">
        ${S.data.routines.map(r => `<button class="block" data-act="push-to-routine" data-r="${r.id}" data-id="${id}">
          ${esc(r.name)} <span class="tiny">(${r.exerciseIds.length})</span></button>`).join('')}
        <button class="ghost" data-act="close">Cancelar</button></div>`);
  },
  'push-to-routine': el => {
    const r = S.data.routines.find(x => x.id === el.dataset.r);
    if (r.exerciseIds.includes(el.dataset.id)) { closeDialog(); return toast('Ya estaba en esa rutina'); }
    upsert('routines', { ...r, exerciseIds: [...r.exerciseIds, el.dataset.id] });
    closeDialog(); toast(`Añadido a ${esc(r.name)}`);
  },
  'ex-menu': el => {
    const ei = +el.dataset.ei, en = S.active.entries[ei];
    const n = S.active.entries.length;
    openDialog(`<h2>${esc(exName(en.exerciseId))}</h2>
      <div class="stack" style="margin-top:12px">
        <button data-act="go" data-v="ejercicio" data-id="${en.exerciseId}">${icon('libro', 18)} Ver ficha y técnica</button>
        ${ei > 0 ? `<button data-act="move-entry" data-ei="${ei}" data-dir="-1">${icon('subir', 18)} Subir</button>` : ''}
        ${ei < n - 1 ? `<button data-act="move-entry" data-ei="${ei}" data-dir="1">${icon('bajar', 18)} Bajar</button>` : ''}
        ${ei < n - 1 ? `<button data-act="superserie" data-ei="${ei}">${icon('enlace', 18)} ${en.ss && S.active.entries[ei + 1]?.ss === en.ss ? 'Separar del siguiente' : 'Enlazar con el siguiente'}</button>` : ''}
        ${en.ss ? `<button data-act="quitar-ss" data-ei="${ei}">${icon('cerrar', 18)} Deshacer la superserie</button>` : ''}
        <button class="danger" data-act="del-entry" data-ei="${ei}">${icon('papelera', 18)} Quitar del entreno</button>
        <button class="ghost" data-act="close">Cerrar</button></div>`);
  },
  superserie: el => {
    const i = +el.dataset.ei, e = S.active.entries;
    if (e[i].ss && e[i + 1]?.ss === e[i].ss) {       // separar
      const g = e[i].ss;
      e.slice(i + 1).forEach(x => { if (x.ss === g) delete x.ss; });
      if (e.filter(x => x.ss === g).length < 2) e.forEach(x => { if (x.ss === g) delete x.ss; });
    } else {                                          // enlazar (y encadenar más de dos)
      const g = e[i].ss || uid();
      e[i].ss = g; e[i + 1].ss = g;
    }
    saveActive(); closeDialog(); render();
  },
  'quitar-ss': el => {
    const g = S.active.entries[+el.dataset.ei].ss;
    S.active.entries.forEach(x => { if (x.ss === g) delete x.ss; });
    saveActive(); closeDialog(); render();
  },
  'del-entry': el => {
    S.active.entries.splice(+el.dataset.ei, 1);
    saveActive(); closeDialog(); render();
  },
  'move-entry': el => {
    const i = +el.dataset.ei, j = i + (+el.dataset.dir), e = S.active.entries;
    if (j < 0 || j >= e.length) return;
    [e[j], e[i]] = [e[i], e[j]];
    saveActive(); closeDialog(); render();
  },
  'add-set': el => {
    const sets = S.active.entries[+el.dataset.ei].sets, prev = sets.at(-1);
    sets.push({ kg: prev?.kg ?? '', reps: prev?.reps ?? '', done: false });
    saveActive(); render();
  },
  'del-set': el => {
    const sets = S.active.entries[+el.dataset.ei].sets, ult = sets.at(-1);
    if (!ult) return;
    const conDatos = ult.done || num(ult.kg) > 0 || num(ult.reps) > 0;
    if (conDatos && !confirm('Esa serie tiene datos. ¿Borrarla igualmente?')) return;
    sets.pop(); saveActive(); render();
  },
  'aplicar-sug': el => {
    const ei = +el.dataset.ei, en = S.active.entries[ei];
    const s = sugerencia(en.exerciseId, S.active.editingId);
    if (!s) return;
    en.sets.forEach(x => { if (!x.done) { x.kg = s.kg ? String(s.kg).replace('.', ',') : ''; x.reps = String(s.reps); } });
    saveActive(); render(); toast('Objetivo aplicado a las series');
  },
  'done-set': el => {
    const tr = el.closest('tr'), ei = +tr.dataset.ei, si = +tr.dataset.si;
    const en = S.active.entries[ei], s = en.sets[si];
    tr.querySelectorAll('input').forEach(inp => {
      if (inp.value === '' && /\d/.test(inp.placeholder)) { inp.value = inp.placeholder; s[inp.dataset.set] = inp.placeholder; }
    });
    s.done = !s.done;
    saveActive();
    if (s.done) {
      const best = bestSet(en.exerciseId, S.active.editingId);
      const ahora = { kg: num(s.kg), reps: num(s.reps) };
      if (best && ahora.reps > 0 && beats(ahora, best) && !S.celebrated.has(en.exerciseId)) {
        S.celebrated.add(en.exerciseId);
        celebrate();
        toast(`<b>NUEVO RÉCORD</b><br>${esc(exName(en.exerciseId))} · ${prText(ahora)}`, true);
      }
      // En superserie no se descansa hasta terminar el bloque
      const bloque = en.ss ? S.active.entries.filter(x => x.ss === en.ss) : [en];
      const ultimo = bloque[bloque.length - 1] === en;
      if (ultimo) startRest(restSec());
    }
    render();
  },
  rest: el => startRest(+el.dataset.s),
  'rest-add': el => {
    S.rest.end = Math.max(Date.now() + 1000, S.rest.end + (+el.dataset.s) * 1000);
    S.rest.total = Math.max(5, S.rest.total + (+el.dataset.s));
    $('#rest').classList.remove('ended');
    clearInterval(S.rest.iv); S.rest.iv = setInterval(tickRest, 250); tickRest();
  },
  'rest-stop': stopRest,

  finish: () => {
    const a = S.active;
    const entries = a.entries
      .map(e => ({ exerciseId: e.exerciseId, ss: e.ss || null, sets: e.sets.filter(s => num(s.reps) > 0).map(s => ({ kg: num(s.kg), reps: Math.round(num(s.reps)) })) }))
      .filter(e => e.sets.length);
    const raro = a.entries.some(e => e.sets.some(x => num(x.kg) < 0 || num(x.kg) > 1000 || num(x.reps) > 1000));
    if (raro) return toast('Revisa las series: hay pesos o repeticiones imposibles (máximo 1000)');
    if (!entries.length) return toast('Apunta al menos una serie con repeticiones');
    const sinReps = a.entries.reduce((t, e) => t + e.sets.filter(s => !(num(s.reps) > 0)).length, 0);
    if (sinReps && !confirm(`Hay ${sinReps} serie${sinReps === 1 ? '' : 's'} sin repeticiones y no se guardará${sinReps === 1 ? '' : 'n'}. ¿Guardar igualmente?`)) return;
    const w = {
      id: a.editingId || uid(), name: (a.name || '').trim() || 'Entreno', date: a.date || todayISO(),
      entries, routineId: a.routineId || null,
      minutes: Math.min(300, Math.max(1, Math.round((Date.now() - a.startedAt) / 60000))),
      createdAt: S.data.workouts.find(x => x.id === a.editingId)?.createdAt || Date.now(),
    };
    upsert('workouts', w);
    S.active = null; saveActive(); stopRest();
    go('inicio');
    toast(`Entreno guardado · ${kfmt(wVolume(w))} kg`, true);
  },
  discard: () => { if (confirm('¿Descartar el entreno en curso?')) { S.active = null; saveActive(); stopRest(); render(); } },

  discos: el => dialogoDiscos(num(el.dataset.kg)),
  'calc-discos': () => {
    const kg = Math.min(1000, Math.max(0, num($('#dk').value))), barra = Math.min(50, Math.max(0, num($('#db').value) || 20));
    profile().barra = barra; saveProfile();
    const r = discos(kg, barra);
    $('#res-discos').innerHTML = r ? plateView(r.discos, r.sobra, kg, barra) : '<p class="muted">Ese peso es menor que la barra.</p>';
  },

  'prog-metric': el => { S.progMetric = el.dataset.m; render(); },
  filtro: el => {
    const k = el.dataset.k;
    if (k === 'fav') S.filtro.fav = !S.filtro.fav;
    else S.filtro[k] = S.filtro[k] === el.dataset.v ? '' : el.dataset.v;
    render();
  },
  'limpiar-q': () => { S.filtro.q = ''; render(); },
  fav: el => {
    const favs = [...favoritos()], i = favs.indexOf(el.dataset.id);
    i >= 0 ? favs.splice(i, 1) : favs.push(el.dataset.id);
    profile().favs = favs; saveProfile(); render();
    toast(i >= 0 ? 'Quitado de favoritos' : 'Añadido a favoritos');
  },

  'edit-routine': el => editorRutina(S.data.routines.find(r => r.id === el.dataset.id)),
  'toggle-pick': el => {
    const id = el.dataset.id, i = S.pick.indexOf(id);
    i >= 0 ? S.pick.splice(i, 1) : S.pick.push(id);
    el.classList.toggle('on', i < 0);
    pintarOrden();
  },
  'save-routine': el => {
    const name = $('#rt-name').value.trim();
    if (!name) return toast('Ponle nombre a la rutina');
    if (!S.pick.length) return toast('Elige al menos un ejercicio');
    upsert('routines', { id: el.dataset.id || uid(), name, dia: num($('#rt-dia').value) || null, exerciseIds: [...S.pick] });
    closeDialog(); render(); toast('Rutina guardada');
  },
  'del-routine': el => { if (confirm('¿Borrar esta rutina? Tus entrenos no se borran.')) { remove('routines', el.dataset.id); render(); } },
  'cargar-semana': () => {
    let nuevas = 0;
    SEMANA.forEach(d => {
      if (S.data.routines.some(r => r.dia === d.dia)) return;
      upsert('routines', { id: uid(), name: d.n, dia: d.dia, exerciseIds: [...d.ex] });
      nuevas++;
    });
    go('entrenar');
    toast(nuevas ? `${nuevas} rutinas añadidas, una por día` : 'Ya tenías rutinas para todos los días');
  },
  'add-plantilla': el => {
    const p = PLANTILLAS.find(x => x.id === el.dataset.id);
    p.dias.forEach(d => upsert('routines', { id: uid(), name: d.n, exerciseIds: [...d.ex] }));
    go('entrenar'); toast(`${p.dias.length} rutinas añadidas`);
  },

  'new-exercise': () => openDialog(`<h2>Crear ejercicio</h2>
    <label><span>Nombre</span><input id="nx-name" maxlength="50" placeholder="Ej: Press Arnold en multipower"></label>
    <label><span>Grupo</span><select id="nx-group">${GROUPS.map(g => `<option>${g}</option>`).join('')}</select></label>
    <label><span>Material</span><select id="nx-eq">${Object.entries(EQUIP).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
    <button class="primary block" data-act="create-exercise">Crear</button>
    <button class="block ghost" style="margin-top:8px" data-act="close">Cancelar</button>`),
  'create-exercise': () => {
    const n = $('#nx-name').value.trim();
    if (!n) return toast('Escribe el nombre');
    if (allEx().some(e => sinAcentos(e.n) === sinAcentos(n))) return toast('Ya existe un ejercicio con ese nombre');
    const g = $('#nx-group').value, eq = $('#nx-eq').value;
    const ex = { id: 'mio-' + uid(), n, g, m: [GRUPO_MUSCULO[g]], eq, pose: 'curl', dif: 1, pasos: ['Ejercicio creado por ti.'], tips: [], fallos: [], custom: true };
    upsert('exercises', ex);
    closeDialog(); render(); toast(`"${esc(n)}" creado`);
  },
  'del-exercise': el => {
    if (!confirm('¿Borrar este ejercicio tuyo? Los entrenos guardados no se borran.')) return;
    remove('exercises', el.dataset.id);
    go('ejercicios');
  },

  'add-bw': () => {
    const kg = num($('#bw-kg').value);
    if (kg < 20 || kg > 400) return toast('Pon un peso válido en kg');
    const date = $('#bw-date').value || todayISO();
    if (date > todayISO()) return toast('Esa fecha es del futuro');
    if (date < daysAgoISO(3650)) return toast('Esa fecha es demasiado antigua');
    const ex = S.data.bodyweights.find(x => x.date === date);
    upsert('bodyweights', { id: ex?.id || uid(), date, kg });
    render(); toast(ex ? 'Peso actualizado' : 'Peso guardado');
  },
  'del-bw': el => { remove('bodyweights', el.dataset.id); render(); },

  'reg-local': async () => {
    const nombre = $('#rg-nombre').value.trim();
    const p1 = $('#rg-pass').value, p2 = $('#rg-pass2').value;
    if (!nombre) return pantallaRegistroLocal('Escribe tu nombre', nombre);
    if (p1.length < 6) return pantallaRegistroLocal('La contraseña necesita al menos 6 caracteres', nombre);
    if (p1 !== p2) return pantallaRegistroLocal('Las dos contraseñas no coinciden', nombre);
    try {
      await registrar(nombre, p1);
      await bootData();
      profile().name = nombre; saveProfile(); render();   // el nombre manda sobre el anterior
      toast(`Cuenta creada. ¡A entrenar, ${esc(nombre)}!`, true);
    } catch (e) { pantallaRegistroLocal(e.message, nombre); }
  },
  'login-local': async () => {
    const pass = $('#lg-pass').value;
    try { await entrar(pass); await bootData(); }
    catch (e) { pantallaLoginLocal(e.message); }
  },
  'logout-local': () => {
    if (!confirm('¿Cerrar sesión? Tus entrenos siguen guardados en este dispositivo.')) return;
    salir(); location.reload();
  },
  olvide: () => {
    if (!confirm('Se quitará la contraseña y podrás crear una cuenta nueva.\n\nTus entrenos NO se borran.\n\n¿Continuar?')) return;
    quitarCuenta(); pantallaRegistroLocal();
  },
  'cambiar-pass': () => openDialog(`<h2>Cambiar contraseña</h2>
    <label><span>Contraseña actual</span><input id="cp-act" type="password" autocomplete="current-password"></label>
    <label><span>Nueva contraseña</span><input id="cp-new" type="password" autocomplete="new-password"></label>
    <button class="primary block" data-act="guardar-pass">Guardar</button>
    <button class="ghost block" style="margin-top:8px" data-act="close">Cancelar</button>`),
  'guardar-pass': async () => {
    try { await cambiarPassword($('#cp-act').value, $('#cp-new').value); closeDialog(); toast('Contraseña cambiada'); }
    catch (e) { toast(e.message); }
  },
  'auth-modo': el => pantallaNube(el.dataset.m),
  'nube-reg': async () => {
    const mail = $('#fb-mail').value.trim(), pass = $('#fb-pass').value;
    if (!mail || pass.length < 6) return pantallaNube('registro', 'Pon un correo válido y una contraseña de 6 caracteres o más');
    try { await store.registrarCorreo(mail, pass); await bootData(); }
    catch (e) { pantallaNube('registro', mensajeFirebase(e)); }
  },
  'nube-login': async () => {
    const mail = $('#fb-mail').value.trim(), pass = $('#fb-pass').value;
    try { await store.entrarCorreo(mail, pass); await bootData(); }
    catch (e) { pantallaNube('login', mensajeFirebase(e)); }
  },
  'nube-reset': async () => {
    const mail = ($('#fb-mail')?.value || '').trim();
    if (!mail) return pantallaNube('login', 'Escribe tu correo y vuelve a pulsar para recibir el enlace');
    try { await store.recuperarCorreo(mail); toast('Te hemos enviado un correo para cambiar la contraseña'); }
    catch (e) { pantallaNube('login', mensajeFirebase(e)); }
  },
  login: async () => {
    const btn = document.querySelector('[data-act="login"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Abriendo Google…'; }
    try { await store.login(); await bootData(); }
    catch (e) {
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar con Google'; }
      toast(e.code === 'app/not-owner' ? 'Esta app es privada' : 'No se pudo entrar: ' + (e.code || e.message));
    }
  },
  logout: async () => { if (confirm('¿Cerrar sesión en este dispositivo?')) { await store.logout(); location.reload(); } },

  export: () => {
    const blob = new Blob([JSON.stringify({ app: 'migym', version: 5, exportedAt: new Date().toISOString(), ...S.data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `iron-copia-${todayISO()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Copia descargada');
  },
  install: async () => { if (deferredInstall) { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; render(); } },
  close: closeDialog,
};

function mensajeFirebase(e) {
  const c = e?.code || '';
  if (c.includes('email-already-in-use')) return 'Ese correo ya tiene cuenta. Entra en vez de registrarte.';
  if (c.includes('invalid-email')) return 'Ese correo no parece válido.';
  if (c.includes('weak-password')) return 'La contraseña es demasiado corta.';
  if (c.includes('wrong-password') || c.includes('invalid-credential')) return 'Correo o contraseña incorrectos.';
  if (c.includes('user-not-found')) return 'No hay ninguna cuenta con ese correo.';
  if (c.includes('too-many-requests')) return 'Demasiados intentos. Espera un momento.';
  if (c.includes('network')) return 'Sin conexión: inténtalo otra vez.';
  if (c === 'app/not-owner') return 'Esta app es privada: solo puede entrar su dueño.';
  return e?.message || 'No se ha podido completar.';
}

// ═══════════ Eventos ═══════════
document.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');
  if (tab) return go(tab.dataset.tab);
  const el = e.target.closest('[data-act]');
  if (el && actions[el.dataset.act]) { e.preventDefault(); actions[el.dataset.act](el); }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.set) {
    const tr = t.closest('tr');
    S.active.entries[+tr.dataset.ei].sets[+tr.dataset.si][t.dataset.set] = t.value;
    saveActive();
    actualizarCabecera();
  } else if (t.dataset.bind) {
    S.active[t.dataset.bind] = t.value; saveActive();
  } else if (t.id === 'q') {
    S.filtro.q = t.value;
    clearTimeout(t._t);
    t._t = setTimeout(() => { const pos = t.selectionStart; render(); const n = $('#q'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 220);
  } else if (t.id === 'ex-search') {
    const q = sinAcentos(t.value.trim());
    document.querySelectorAll('#ex-list [data-name]').forEach(b => b.classList.toggle('hidden', !b.dataset.name.includes(q)));
    document.querySelectorAll('#ex-list .ex-group').forEach(g => g.classList.toggle('hidden', !g.querySelector('[data-name]:not(.hidden)')));
  }
});

document.addEventListener('change', async e => {
  const t = e.target;
  if (t.dataset.prof) {
    const k = t.dataset.prof;
    if (k === 'name') profile().name = t.value.trim().slice(0, 40);
    else {
      const LIM = { heightCm: [100, 250, 'la altura en cm'], weeklyGoal: [1, 14, 'el objetivo semanal'], restSec: [10, 600, 'el descanso en segundos'] }[k];
      if (t.value.trim() === '') profile()[k] = '';
      else {
        const v = num(t.value);
        if (!(v >= LIM[0] && v <= LIM[1])) { toast(`Pon ${LIM[2]} entre ${LIM[0]} y ${LIM[1]}`); render(); return; }
        profile()[k] = v;
      }
    }
    saveProfile(); toast('Guardado'); render();
  } else if (t.dataset.change === 'prog-ex') { S.progEx = t.value; render(); }
  else if (t.id === 'import-file' && t.files[0]) {
    try {
      const d = JSON.parse(await t.files[0].text());
      if (d.app !== 'migym') throw new Error('No parece una copia de esta app');
      if (!confirm('Se añadirán los datos de la copia a los actuales. ¿Continuar?')) return;
      const OK = VALIDO;
      let saltados = 0;
      for (const c of ['bodyweights', 'exercises', 'routines', 'workouts']) {
        const items = (d[c] || []).filter(it => {
          const ok = it && typeof it.id === 'string' && OK[c](it);
          if (!ok) saltados++;
          return ok;
        });
        for (const it of items) {
          const sano = c === 'exercises'
            ? { ...it, n: it.n || it.name, g: GROUPS.includes(it.g) ? it.g : 'Otro', m: Array.isArray(it.m) ? it.m : ['core'],
                eq: EQUIP[it.eq] ? it.eq : 'corporal', pose: it.pose || 'curl', dif: it.dif || 1,
                pasos: Array.isArray(it.pasos) ? it.pasos : ['Ejercicio importado.'], tips: it.tips || [], fallos: it.fallos || [] }
            : it;
          const arr = S.data[c], i = arr.findIndex(x => x.id === sano.id);
          i >= 0 ? (arr[i] = sano) : arr.push(sano);
        }
        if (store.bulkPut) store.bulkPut(c, items);
      }
      const perf = { ...S.data.profile, ...(d.profile || {}) };
      // Los ajustes importados también tienen que estar dentro de sus límites
      const tope = (v, min, max) => (isFinite(v) && v >= min && v <= max ? v : '');
      perf.heightCm = tope(num(perf.heightCm), 100, 250);
      perf.weeklyGoal = tope(num(perf.weeklyGoal), 1, 14) || 4;
      perf.restSec = tope(num(perf.restSec), 10, 600) || 90;
      S.data.profile = perf;
      saveProfile();
      if (!store.bulkPut) store.put(S.data);
      migrarIds();
      render();
      toast(saltados ? `Copia importada (${saltados} registros dañados omitidos)` : 'Copia importada');
    } catch (err) {
      const msg = /JSON/i.test(err.message) ? 'Ese archivo no es una copia válida (no se puede leer)' : err.message;
      toast('Error al importar: ' + esc(msg));
    }
    finally { t.value = ''; }
  }
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const gate = document.querySelector('.gate');
  if (!gate || !e.target.matches('input')) return;
  const btn = gate.querySelector('button.primary');
  if (btn) { e.preventDefault(); btn.click(); }
});

const repintarSiListo = () => { if (S.data) render(); };
addEventListener('online', repintarSiListo);
addEventListener('offline', repintarSiListo);

// ═══════════ Instalación ═══════════
let deferredInstall = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (S.data) render(); });
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW', e));
}

// ═══════════ Migraciones ═══════════
// Un registro solo entra si está completo: así una copia dañada no rompe la app
export const VALIDO = {
  workouts: w => typeof w.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(w.date) && Array.isArray(w.entries)
    && w.entries.every(e => e && typeof e.exerciseId === 'string' && Array.isArray(e.sets)
      && e.sets.every(x => isFinite(x?.kg) && isFinite(x?.reps))),
  routines: r => typeof r.name === 'string' && Array.isArray(r.exerciseIds),
  exercises: e => typeof (e.n || e.name) === 'string',
  bodyweights: b => typeof b.date === 'string' && isFinite(b.kg) && b.kg > 0,
};
// La primera versión guardaba en otra clave y con otros identificadores.
function rescatarVersionAntigua() {
  if (store.mode !== 'local') return;
  try {
    if (localStorage.getItem('iron-migrado-v1')) return;
    const viejo = JSON.parse(localStorage.getItem('migym-data-v1') || 'null');
    if (!viejo) { localStorage.setItem('iron-migrado-v1', '1'); return; }
    let n = 0;
    for (const c of ['bodyweights', 'exercises', 'routines', 'workouts']) {
      for (const it of viejo[c] || []) {
        if (!it?.id || !VALIDO[c](it)) continue;
        const arr = S.data[c];
        if (!arr.some(x => x.id === it.id)) { arr.push(it); n++; }
      }
    }
    S.data.profile = { ...(viejo.profile || {}), ...S.data.profile };
    if (n) {
      store.put(S.data);
      setTimeout(() => toast(`Recuperados ${n} registros de la versión anterior`), 900);
    }
    localStorage.setItem('iron-migrado-v1', '1');   // solo cuando ha salido bien
  } catch (e) { console.warn('migración', e); }
}

// Los ejercicios antiguos se llamaban ex0, ex1… Ahora tienen nombre propio.
function migrarIds() {
  const mapa = {};
  for (const ex of [...(S.data.exercises || [])]) {
    const nombre = sinAcentos(ex.n || ex.name || '');
    const nuevo = Object.entries(NOMBRES_ANTIGUOS).find(([k]) => sinAcentos(k) === nombre)?.[1];
    if (nuevo && byId[nuevo]) { mapa[ex.id] = nuevo; }
  }
  if (!Object.keys(mapa).length) {
    // Aun así, limpiamos los del catálogo que se guardaron por duplicado
    const dup = (S.data.exercises || []).filter(e => byId[e.id]);
    dup.forEach(e => remove('exercises', e.id));
    return;
  }
  for (const w of S.data.workouts) {
    let tocado = false;
    for (const en of w.entries) if (mapa[en.exerciseId]) { en.exerciseId = mapa[en.exerciseId]; tocado = true; }
    if (tocado) upsert('workouts', w);
  }
  for (const r of S.data.routines) {
    if (r.exerciseIds.some(id => mapa[id])) upsert('routines', { ...r, exerciseIds: r.exerciseIds.map(id => mapa[id] || id) });
  }
  if (S.active) {
    let tocado = false;
    S.active.entries.forEach(en => { if (mapa[en.exerciseId]) { en.exerciseId = mapa[en.exerciseId]; tocado = true; } });
    if (tocado) saveActive();
  }
  const favs = favoritos();
  if (favs.some(id => mapa[id])) { profile().favs = favs.map(id => mapa[id] || id); saveProfile(); }
  (S.data.exercises || []).filter(e => mapa[e.id] || byId[e.id]).forEach(e => remove('exercises', e.id));
}

// ═══════════ Arranque ═══════════
function bootDone() { const b = $('#boot'); if (!b) return; b.classList.add('done'); setTimeout(() => b.remove(), 450); }

async function boot() {
  injectDefs();
  if (firebaseConfig) {
    store = new FirebaseStore(firebaseConfig, OWNER_EMAIL, OWNER_EMAIL_SHA256);
    try {
      if (!await store.init()) return pantallaNube('login');
    } catch (e) {
      console.error(e);
      bootDone();
      $('#tabbar').classList.add('hidden');
      $('#view').innerHTML = `<div class="card" style="margin-top:30px"><h2>No se pudo conectar</h2>
        <p class="muted">${esc(e.message)}</p>
        <button class="primary block" onclick="location.reload()">Reintentar</button></div>`;
      return;
    }
  } else {
    store = new LocalStore();
    await store.init();
    if (!cifradoDisponible()) {
      // Sin https no se puede cifrar la contraseña: mejor entrar sin candado que dejarte fuera
      setTimeout(() => toast('Sin conexión segura (https) no se puede usar contraseña: entras sin candado'), 800);
    } else {
      if (!hayCuenta()) return pantallaRegistroLocal();
      if (!haySesion()) return pantallaLoginLocal();
    }
  }
  await bootData();
}

async function bootData() {
  $('#tabbar').classList.remove('hidden');
  $('#sync').classList.remove('hidden');
  $('#avatar').classList.remove('hidden');
  S.data = await store.loadAll();
  S.data.exercises ||= [];
  S.active = loadActive();
  // Si algo va mal migrando datos antiguos, la app tiene que abrir igualmente
  try { rescatarVersionAntigua(); migrarIds(); } catch (e) { console.error('Migración', e); }
  const quiere = new URLSearchParams(location.search).get('tab');
  if (quiere && views[quiere]) S.route = { v: quiere };
  if (S.active) { S.route = { v: 'entrenar' }; restoreRest(); }
  store.onError = (e, q) => toast(store.mode === 'local' ? 'No se han podido guardar los datos' : `No se pudo ${q || 'guardar'} en la nube`);
  renovarSesion();
  try { render(); } finally { bootDone(); }
}

function pantallaAcceso(html) {
  $('#tabbar').classList.add('hidden');
  $('#sync').classList.add('hidden');
  $('#avatar').classList.add('hidden');
  $('#view').innerHTML = `<div class="gate"><div class="gate-card">${html}</div></div>`;
  bootDone();
  setTimeout(() => $('#view').querySelector('input')?.focus(), 120);
}
const cabecera = sub => `<div class="brand-mark big"></div><h1>IRON</h1>
  <p class="muted" style="margin-bottom:20px">${sub}</p>`;
const errorBox = e => (e ? `<p class="error-box">${esc(e)}</p>` : '');

// ── Cuenta en este dispositivo (sin Firebase) ──
function pantallaRegistroLocal(err, nombre = '') {
  pantallaAcceso(`${cabecera('Crea tu cuenta para empezar')}
    <label><span>Tu nombre</span><input id="rg-nombre" maxlength="40" value="${esc(nombre)}" placeholder="Miguel" autocomplete="name"></label>
    <label><span>Contraseña</span><input id="rg-pass" type="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres"></label>
    <label><span>Repite la contraseña</span><input id="rg-pass2" type="password" autocomplete="new-password"></label>
    ${errorBox(err)}
    <button class="primary block big" data-act="reg-local">Crear cuenta y entrar</button>
    <p class="tiny" style="margin-top:16px">La contraseña se guarda cifrada en este dispositivo y hace falta para abrir la app.
      No cifra los entrenos: para eso y para sincronizar entre móvil y PC, configura Firebase.</p>`);
}
function pantallaLoginLocal(err) {
  const n = nombreCuenta();
  pantallaAcceso(`${cabecera(n ? `Hola, ${esc(n)}` : 'Introduce tu contraseña')}
    <label><span>Contraseña</span><input id="lg-pass" type="password" autocomplete="current-password"></label>
    ${errorBox(err)}
    <button class="primary block big" data-act="login-local">Entrar</button>
    <button class="ghost block" style="margin-top:10px" data-act="olvide">He olvidado la contraseña</button>`);
}

// ── Cuenta en la nube (con Firebase) ──
function pantallaNube(modo = 'login', err) {
  const reg = modo === 'registro';
  pantallaAcceso(`${cabecera(reg ? 'Crea tu cuenta' : 'Entra en tu cuenta')}
    <label><span>Correo</span><input id="fb-mail" type="email" autocomplete="email" placeholder="tu@correo.com"></label>
    <label><span>Contraseña</span><input id="fb-pass" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}"></label>
    ${errorBox(err)}
    <button class="primary block big" data-act="${reg ? 'nube-reg' : 'nube-login'}">${reg ? 'Crear cuenta' : 'Entrar'}</button>
    <div class="sep"><span>o</span></div>
    <button class="btn-google block" data-act="login">Continuar con Google</button>
    <div class="row" style="justify-content:center;margin-top:16px">
      <button class="ghost sm" data-act="auth-modo" data-m="${reg ? 'login' : 'registro'}">
        ${reg ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}</button>
      ${reg ? '' : `<button class="ghost sm" data-act="nube-reset">Olvidé la contraseña</button>`}
    </div>
    <p class="tiny" style="margin-top:16px">${OWNER_EMAIL || OWNER_EMAIL_SHA256
      ? 'App privada: solo la cuenta del dueño puede entrar.' : 'Tus datos quedan guardados en tu cuenta.'}</p>`);
}

boot();

