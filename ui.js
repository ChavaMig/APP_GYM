// ═══════════════════════════════════════════
// IRON · piezas visuales: iconos, gráficas, mapa
// muscular, calendario, discos y celebración.
// Todo dibujado a mano: sin librerías ni emojis.
// ═══════════════════════════════════════════
import { MUSCLES } from './db.js';

// ── Iconos ──────────────────────────────────
const P = {
  inicio: '<path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  pesa: '<path d="M2.5 9v6M5.5 7v10M18.5 7v10M21.5 9v6M5.5 12h13"/>',
  libro: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v16H5.5A1.5 1.5 0 0 0 4 20.5z"/><path d="M4 17.5A1.5 1.5 0 0 1 5.5 16H19"/>',
  calendario: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 9h16M8 2v4M16 2v4"/>',
  grafica: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 15l3.5-4 3 2.5L20 7"/>',
  lista: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  menos: '<path d="M5 12h14"/>',
  check: '<path d="M4 12.5 9.5 18 20 6.5"/>',
  papelera: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  fuego: '<path d="M12 22c4 0 7-2.8 7-6.8 0-4.5-3.5-6.4-4.7-11.2-1.6 1.4-2.6 3.1-2.6 5.1 0 1.2-1 1.7-1.7 1-.7-.7-1-1.6-1-2.6C7 9 5 11.3 5 15.2 5 19.2 8 22 12 22z"/>',
  trofeo: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M9 21h6M12 14v7"/>',
  estrella: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8z"/>',
  reloj: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  editar: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/>',
  repetir: '<path d="M3 11a8 8 0 0 1 13.7-5.6L20 8"/><path d="M20 4v4h-4"/><path d="M21 13a8 8 0 0 1-13.7 5.6L4 16"/><path d="M4 20v-4h4"/>',
  subir: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  bajar: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  izquierda: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  derecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  rayo: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  peso: '<path d="M6 8h12l2 12H4z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  salir: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 16l4-4-4-4M20 12H10"/>',
  candado: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  nube: '<path d="M7 18a4 4 0 0 1 .6-8A5.5 5.5 0 0 1 18 10.5a3.75 3.75 0 0 1-.4 7.5z"/>',
  movil: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18.5h2"/>',
  cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  enlace: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
  idea: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 1 4 10.5V15H8v-1.5A6 6 0 0 1 12 3z"/>',
  alerta: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17.5h.01"/>',
  'mas-opciones': '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  regla: '<path d="M2.5 9.5h19v5h-19z"/><path d="M7 9.5v3M12 9.5v3M17 9.5v3"/>',
  dieta: '<path d="M6 3v7a3 3 0 0 0 6 0V3M9 10v11"/><path d="M17.5 3c-1.4 1.6-2 3.4-2 5.5 0 1.6.7 2.8 2 3.2V21"/>',
  cesta: '<path d="M3 8h18l-1.6 11.2a2 2 0 0 1-2 1.8H6.6a2 2 0 0 1-2-1.8z"/><path d="M8.5 8 12 2.8 15.5 8"/>',
  fuego2: '<path d="M12 22a6 6 0 0 0 6-6c0-4-3.5-6-4.5-10-1.5 1.2-2.5 3-2.5 5 0 1-1 1.4-1.6.8C8 10.6 8 9 8 9c-1.5 2-2 4-2 7a6 6 0 0 0 6 6z"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
};
export function icon(name, size = 22, cls = '') {
  return `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}

// ── Degradados compartidos ──────────────────
export function injectDefs() {
  if (document.getElementById('svg-defs')) return;
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.id = 'svg-defs';
  s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  s.innerHTML = `<defs>
    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff6a1f"/><stop offset="100%" stop-color="#ffb01f"/></linearGradient>
    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff6a1f"/><stop offset="100%" stop-color="#ffb01f"/></linearGradient>
    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff6a1f" stop-opacity=".35"/>
      <stop offset="100%" stop-color="#ff6a1f" stop-opacity="0"/></linearGradient>
  </defs>`;
  document.body.appendChild(s);
}

const fmtN = n => (Math.round(n * 10) / 10).toLocaleString('es-ES');
const corta = iso => { const [, m, d] = iso.split('-'); return `${+d}/${+m}`; };

// ── Gráfica de líneas ───────────────────────
export function lineChart(points, unit = 'kg') {
  if (!points.length) return `<p class="muted small">Sin datos todavía.</p>`;
  if (points.length === 1) {
    return `<div class="tile center"><span class="tiny">Primer registro</span>
      <b>${fmtN(points[0].y)} ${unit}</b><u>${corta(points[0].d)} · haz otro para ver la curva</u></div>`;
  }
  const W = 620, H = 230, L = 46, R = 14, T = 18, B = 30;
  const xs = points.map(p => new Date(p.d + 'T12:00').getTime());
  const ys = points.map(p => p.y);
  let x0 = Math.min(...xs), x1 = Math.max(...xs); if (x0 === x1) x1 = x0 + 1;
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pad = (y1 - y0) * 0.2 || Math.max(1, y1 * 0.06);
  y0 = Math.max(0, y0 - pad); y1 += pad;
  const X = v => L + ((v - x0) / (x1 - x0)) * (W - L - R);
  const Y = v => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
  let grid = '';
  for (let i = 0; i <= 3; i++) {
    const v = y0 + ((y1 - y0) * i) / 3, y = Y(v);
    grid += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/>
      <text class="axis" x="${L - 8}" y="${(y + 6).toFixed(1)}" text-anchor="end">${fmtN(v)}</text>`;
  }
  const marcas = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
  const xlab = marcas.map(i => `<text class="axis" x="${X(xs[i]).toFixed(1)}" y="${H - 6}"
    text-anchor="${i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}">${corta(points[i].d)}</text>`).join('');
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area = `${d}L${X(xs.at(-1)).toFixed(1)},${H - B}L${X(xs[0]).toFixed(1)},${H - B}Z`;
  const dots = points.map((p, i) => `<circle class="dot${i === points.length - 1 ? ' dot-last' : ''}"
    cx="${X(xs[i]).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="${i === points.length - 1 ? 5 : 4}">
    <title>${corta(p.d)}: ${fmtN(p.y)} ${unit}</title></circle>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución">
    ${grid}<path class="area" d="${area}"/><path class="line" d="${d}"/>${dots}${xlab}</svg>`;
}

// ── Barras de la semana ─────────────────────
export function weekBars(values, labels) {
  const max = Math.max(1, ...values);
  const W = 320, H = 92, n = values.length, bw = W / n - 10;
  return `<svg class="chart bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="Actividad semanal">
    ${values.map((v, i) => {
      const h = Math.max(4, (v / max) * 58), x = i * (W / n) + 5, y = 64 - h;
      return `<rect class="${v ? 'on' : ''}" x="${x}" y="${y}" width="${bw}" height="${h}" rx="4"><title>${labels[i]}: ${fmtN(v)} kg</title></rect>
        <text class="axis" x="${x + bw / 2}" y="82" text-anchor="middle">${labels[i]}</text>`;
    }).join('')}</svg>`;
}

// ── Anillo del objetivo ─────────────────────
export function goalRing(hechos, objetivo) {
  const pct = Math.min(1, objetivo ? hechos / objetivo : 0), C = 2 * Math.PI * 44;
  return `<div class="ring-wrap">
    <div style="position:relative;flex:none">
      <svg class="ring" viewBox="0 0 104 104" role="img" aria-label="Objetivo semanal">
        <circle class="bg" cx="52" cy="52" r="44"/>
        <circle class="fg" cx="52" cy="52" r="44" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}"/>
      </svg>
      <div class="ring-num"><span>${hechos}</span><em>/${objetivo}</em></div>
    </div>
    <div class="grow">
      <span class="tiny">Objetivo semanal</span>
      <div style="font-weight:600">${hechos >= objetivo ? '¡Objetivo cumplido!' : `Te faltan ${objetivo - hechos} entreno${objetivo - hechos === 1 ? '' : 's'}`}</div>
      <div class="muted small">De lunes a domingo</div>
    </div></div>`;
}

// ── Mapa muscular ───────────────────────────
const BASE_RGB = [38, 43, 53], ACC_RGB = [255, 106, 31];
function heat(v, max) {
  if (!v) return `rgb(${BASE_RGB.join(',')})`;
  const t = 0.25 + 0.75 * Math.min(1, v / (max || 1));
  return `rgb(${BASE_RGB.map((b, i) => Math.round(b + (ACC_RGB[i] - b) * t)).join(',')})`;
}
function figura(cx, lado, load, max) {
  const f = m => `style="fill:${heat(load[m] || 0, max)}"`;
  const t = m => `<title>${MUSCLES[m]}: ${load[m] || 0} series</title>`;
  const part = (m, shape) => `<g class="part" ${f(m)} data-m="${m}">${shape}${t(m)}</g>`;
  const skel = s => `<g class="skel">${s}</g>`;
  const body = skel(`<rect x="${cx - 23}" y="44" width="46" height="82" rx="19"/>
    <rect x="${cx - 37}" y="50" width="15" height="72" rx="7.5"/>
    <rect x="${cx + 22}" y="50" width="15" height="72" rx="7.5"/>
    <rect x="${cx - 16}" y="112" width="14" height="106" rx="7"/>
    <rect x="${cx + 2}" y="112" width="14" height="106" rx="7"/>`);
  const head = `<ellipse class="skel" cx="${cx}" cy="24" rx="11" ry="13"/><rect class="skel" x="${cx - 6}" y="34" width="12" height="9" rx="4"/>`;
  const manos = skel(`<circle cx="${cx - 35}" cy="120" r="5"/><circle cx="${cx + 35}" cy="120" r="5"/>`);
  const pies = skel(`<rect x="${cx - 15}" y="216" width="12" height="7" rx="3"/><rect x="${cx + 3}" y="216" width="12" height="7" rx="3"/>`);
  const rodillas = skel(`<circle cx="${cx - 7}" cy="172" r="6"/><circle cx="${cx + 7}" cy="172" r="6"/>`);
  const antebrazo = part('antebrazo', `<ellipse cx="${cx - 33}" cy="101" rx="6.5" ry="15"/><ellipse cx="${cx + 33}" cy="101" rx="6.5" ry="15"/>`);
  const hombro = part('hombro', `<ellipse cx="${cx - 24}" cy="53" rx="11" ry="9.5"/><ellipse cx="${cx + 24}" cy="53" rx="11" ry="9.5"/>`);

  if (lado === 'frente') {
    return `${body}${head}${hombro}
      ${part('pecho', `<path d="M${cx - 20} 49q10-5 18-1v17q-9 5-18 0z"/><path d="M${cx + 20} 49q-10-5-18-1v17q9 5 18 0z"/>`)}
      ${part('core', `<rect x="${cx - 12}" y="69" width="24" height="36" rx="8"/>`)}
      ${part('biceps', `<ellipse cx="${cx - 30}" cy="73" rx="7.5" ry="14"/><ellipse cx="${cx + 30}" cy="73" rx="7.5" ry="14"/>`)}
      ${antebrazo}${manos}
      ${skel(`<rect x="${cx - 14}" y="104" width="28" height="18" rx="7"/>`)}
      ${part('cuadriceps', `<path d="M${cx - 14} 120q7-3 12 0l-1 48q-6 3-12 0z"/><path d="M${cx + 14} 120q-7-3-12 0l1 48q6 3 12 0z"/>`)}
      ${rodillas}
      ${part('gemelo', `<ellipse cx="${cx - 8}" cy="194" rx="7" ry="18"/><ellipse cx="${cx + 8}" cy="194" rx="7" ry="18"/>`)}
      ${pies}<text class="lbl" x="${cx}" y="240" text-anchor="middle">Frente</text>`;
  }
  return `${body}${head}
    ${part('trapecio', `<path d="M${cx - 20} 50q20-12 40 0l-6 14h-28z"/>`)}
    ${hombro}
    ${part('espalda', `<path d="M${cx - 20} 64h40l-5 26q-15 8-30 0z"/>`)}
    ${part('core', `<rect x="${cx - 11}" y="90" width="22" height="16" rx="6"/>`)}
    ${part('triceps', `<ellipse cx="${cx - 30}" cy="73" rx="7.5" ry="14"/><ellipse cx="${cx + 30}" cy="73" rx="7.5" ry="14"/>`)}
    ${antebrazo}${manos}
    ${part('gluteo', `<ellipse cx="${cx - 8}" cy="114" rx="11.5" ry="10.5"/><ellipse cx="${cx + 8}" cy="114" rx="11.5" ry="10.5"/>`)}
    ${part('femoral', `<path d="M${cx - 14} 124q7-3 12 0l-1 44q-6 3-12 0z"/><path d="M${cx + 14} 124q-7-3-12 0l1 44q6 3 12 0z"/>`)}
    ${rodillas}
    ${part('gemelo', `<ellipse cx="${cx - 8}" cy="194" rx="8" ry="19"/><ellipse cx="${cx + 8}" cy="194" rx="8" ry="19"/>`)}
    ${pies}<text class="lbl" x="${cx}" y="240" text-anchor="middle">Espalda</text>`;
}
export function bodyMap(load) {
  const max = Math.max(1, ...Object.values(load));
  const top = Object.entries(load).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return `<svg class="bodymap" viewBox="0 0 260 248" role="img" aria-label="Músculos entrenados">
      ${figura(64, 'frente', load, max)}${figura(196, 'espalda', load, max)}</svg>
    <div class="legend"><span>Poco</span><i></i><span>Mucho</span></div>
    ${top.length ? `<div class="chips center-chips">${top.map(([m, v]) => `<span class="chip sm">${MUSCLES[m]} · ${v} series</span>`).join('')}</div>`
      : `<p class="muted small center">Entrena esta semana y verás aquí qué músculos has trabajado.</p>`}`;
}

// ── Calendario de asistencia ────────────────
export function calendarHeat(dias, semanas = 26) {
  const mapa = {};
  for (const d of dias) mapa[d.d] = (mapa[d.d] || 0) + d.v;
  const max = Math.max(1, ...Object.values(mapa));
  const hoy = new Date();
  const finSemana = new Date(hoy); finSemana.setDate(hoy.getDate() + (7 - ((hoy.getDay() + 6) % 7) - 1));
  const cell = 11, gap = 2.4, W = semanas * (cell + gap), H = 7 * (cell + gap) + 14;
  let out = '', mesActual = -1, etiquetas = '';
  for (let s = semanas - 1; s >= 0; s--) {
    for (let d = 0; d < 7; d++) {
      const f = new Date(finSemana);
      f.setDate(finSemana.getDate() - (s * 7) - (6 - d));
      if (f > hoy) continue;
      const iso = new Date(f.getTime() - f.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      const v = mapa[iso] || 0;
      const x = (semanas - 1 - s) * (cell + gap), y = d * (cell + gap) + 14;
      const t = v ? 0.3 + 0.7 * Math.min(1, v / max) : 0;
      out += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3"
        fill="${v ? `rgba(255,106,31,${t.toFixed(2)})` : 'rgba(255,255,255,.05)'}">
        <title>${iso}${v ? ` · ${Math.round(v)} kg` : ' · descanso'}</title></rect>`;
      if (d === 0 && f.getMonth() !== mesActual) {
        mesActual = f.getMonth();
        etiquetas += `<text class="axis" x="${x}" y="9" font-size="9">${f.toLocaleDateString('es-ES', { month: 'short' })}</text>`;
      }
    }
  }
  return `<svg class="cal" viewBox="0 0 ${W} ${H}" role="img" aria-label="Calendario de entrenos">${etiquetas}${out}</svg>`;
}

// ── Discos de la barra ──────────────────────
const COLOR_DISCO = { 25: '#ff4d5e', 20: '#4da3ff', 15: '#ffb01f', 10: '#35d07f', 5: '#f3f5f8', 2.5: '#c77dff', 1.25: '#8d96a7' };
export function plateView(discos, sobra, total, barra) {
  const alto = d => 26 + d * 2.4;
  return `<div class="plates">
    <div class="bar-line"></div>
    <div class="plate-row">
      ${discos.map(d => `<div class="plate" style="height:${alto(d)}px;background:${COLOR_DISCO[d] || '#8d96a7'}"><span>${d}</span></div>`).join('')
        || '<span class="muted small">Solo la barra</span>'}
    </div>
    <p class="small" style="margin:12px 0 0"><b>${fmtN(total)} kg</b> = barra de ${fmtN(barra)} kg
      + ${discos.length ? discos.map(fmtN).join(' + ') + ' por lado' : 'nada'}.</p>
    ${sobra > 0.01 ? `<p class="tiny" style="color:var(--accent-2)">Sobran ${fmtN(sobra * 2)} kg: no se puede montar exacto con discos normales.</p>` : ''}</div>`;
}

// ── Celebración de récord ───────────────────
export function celebrate() {
  const cv = document.getElementById('confetti');
  if (!cv) return;
  const dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
  cv.classList.remove('hidden');
  const colores = ['#ff6a1f', '#ffb01f', '#ffd76a', '#ffffff'];
  const parts = Array.from({ length: 110 }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 120,
    y: innerHeight * .42 + (Math.random() - .5) * 60,
    vx: (Math.random() - .5) * 11, vy: Math.random() * -13 - 3,
    w: 5 + Math.random() * 7, h: 8 + Math.random() * 9,
    rot: Math.random() * 6.3, vr: (Math.random() - .5) * .35,
    c: colores[(Math.random() * colores.length) | 0], vida: 0,
  }));
  let raf;
  const tick = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let vivos = 0;
    for (const p of parts) {
      p.vida++; p.vy += 0.42; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.rot += p.vr;
      if (p.y < innerHeight + 40) vivos++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - p.vida / 130);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    if (vivos) raf = requestAnimationFrame(tick);
    else { cv.classList.add('hidden'); cancelAnimationFrame(raf); }
  };
  tick();
  navigator.vibrate?.([60, 40, 120]);
}
