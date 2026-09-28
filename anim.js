// ═══════════════════════════════════════════
// IRON · figuras animadas de los ejercicios.
// Un muñeco lateral articulado (cadera → tronco → brazo →
// antebrazo, y cadera → muslo → pierna). Cada ejercicio define
// dos posturas y la animación va de una a otra en bucle.
// Ángulos en grados. 0 = segmento colgando hacia abajo;
// negativo = hacia delante (derecha); positivo = hacia atrás.
// Orden: [tronco, brazo, codo, muslo, rodilla]
// ═══════════════════════════════════════════

const P = (eq, sup, a, b, rot = 0, dur = 2.6, off = [0, 0, 0, 0]) => ({ eq, sup, a, b, rot, dur, off });

export const POSES = {
  // ── Empujes tumbado ──
  'press-banco':      P('barra', 'banco', [0, -45, -110, -75, 80], [0, -88, -4, -75, 80], -90, 2.4),
  'press-inclinado':  P('barra', 'banco-inclinado', [0, -62, -80, -70, 75], [0, -88, -4, -70, 75], -55, 2.4),
  'aperturas':        P('mancuerna', 'banco', [0, -40, -18, -75, 80], [0, -92, -12, -75, 80], -90, 2.8),
  'pullover':         P('mancuerna', 'banco', [0, -160, -10, -75, 80], [0, -88, -6, -75, 80], -90, 2.8),
  'press-frances':    P('barra', 'banco', [0, -95, -110, -75, 80], [0, -95, -4, -75, 80], -90, 2.4),
  'crunch':           P('', 'suelo', [8, -60, -100, -70, 95], [38, -60, -100, -70, 95], -90, 2.4),
  'elevacion-piernas-suelo': P('', 'suelo', [0, 40, 0, 0, 0], [0, 40, 0, -85, 0], -90, 2.6),
  'dead-bug':         P('', 'suelo', [0, -150, -6, -90, 10], [0, -95, -6, -30, 40], -90, 2.6),
  'hollow':           P('', 'suelo', [10, -150, -8, -60, 8], [16, -150, -8, -70, 6], -90, 3.2),
  'curl-femoral':     P('maquina', 'camilla', [0, -150, -8, 0, 0], [0, -150, -8, 0, -110], 90, 2.4),

  // ── Empujes de pie o sentado ──
  'press-militar':          P('barra', '', [0, -150, -60, 0, 0], [0, -172, -4, 0, 0], 0, 2.4),
  'press-militar-sentado':  P('mancuerna', 'banco-respaldo', [0, -148, -62, -88, 78], [0, -172, -4, -88, 78], 0, 2.4),
  'press-sentado':          P('maquina', 'banco-respaldo', [0, -85, -80, -88, 78], [0, -92, -6, -88, 78], 0, 2.4),
  'elevacion-lateral':      P('mancuerna', '', [0, -4, -8, 0, 0], [0, -88, -10, 0, 0], 0, 2.6),
  'elevacion-frontal':      P('mancuerna', '', [0, -4, -4, 0, 0], [0, -92, -4, 0, 0], 0, 2.6),
  'remo-menton':            P('barra', '', [0, -8, -10, 0, 0], [0, -30, -115, 0, 0], 0, 2.4),
  'rotacion':               P('banda', '', [0, -10, -88, 0, 0], [0, -10, -20, 0, 0], 0, 2.4),
  'encogimientos':          P('mancuerna', '', [0, -2, -2, 0, 0], [0, -2, -2, 0, 0], 0, 1.8, [0, 0, 0, -7]),

  // ── Tirones ──
  'dominadas':     P('', 'barra-alta', [0, -176, -3, 10, -22], [0, -168, -120, 10, -22], 0, 2.8, [0, 0, 0, 26]),
  'jalon':         P('polea', 'polea-alta-sentado', [0, -170, -6, -88, 70], [0, -148, -108, -88, 70], 0, 2.6),
  'remo':          P('barra', '', [68, -4, -4, 0, -14], [68, -22, -120, 0, -14], 0, 2.6),
  'remo-banco':    P('mancuerna', 'banco-apoyo', [80, -4, -6, 0, -10], [80, -24, -118, 0, -10], 0, 2.6),
  'remo-sentado':  P('polea', 'suelo-sentado', [6, -88, -8, -84, 20], [16, -70, -120, -84, 20], 0, 2.6),
  'remo-invertido': P('', 'barra-media', [0, -92, -6, 2, -2], [0, -86, -104, 2, -2], -64, 2.6, [0, 10, 0, 2]),
  'face-pull':     P('polea', '', [0, -92, -20, 0, 0], [0, -110, -105, 0, 0], 0, 2.4),
  'pullover-pie':  P('polea', '', [14, -150, -8, 0, -8], [14, -30, -8, 0, -8], 0, 2.6),
  'hiperextension': P('', 'banco-hiper', [60, -140, -20, 0, 0], [0, -140, -20, 0, 0], 0, 2.8),

  // ── Peso muerto y cadera ──
  'peso-muerto':         P('barra', 'suelo-linea', [62, -6, -4, -18, -40], [4, -4, -2, 0, -6], 0, 2.8),
  'peso-muerto-rumano':  P('barra', '', [58, -6, -4, -6, -18], [4, -4, -2, 0, -6], 0, 2.8),
  'hip-thrust':          P('barra', 'banco-espalda', [24, -40, -70, -58, 82], [-2, -40, -70, -78, 96], 0, 2.6),

  // ── Pierna ──
  'sentadilla':        P('barra-espalda', 'suelo-linea', [10, -146, -34, 0, -4], [38, -146, -34, -54, -86], 0, 2.8),
  'sentadilla-goblet': P('mancuerna', 'suelo-linea', [8, -70, -120, 0, -4], [34, -70, -120, -50, -82], 0, 2.8),
  'prensa':            P('maquina', 'prensa', [0, -116, -34, -100, -66], [0, -116, -34, -88, -8], -14, 2.6, [16, 14, 16, 14]),
  'extension-pierna':  P('maquina', 'banco-sentado', [0, -60, -70, -88, 88], [0, -60, -70, -88, 4], 0, 2.4),
  'curl-femoral-sentado': P('maquina', 'banco-sentado', [0, -60, -70, -88, 10], [0, -60, -70, -88, 78], 0, 2.4),
  'zancada':           P('mancuerna', 'suelo-linea', [6, -4, -6, -6, -10], [10, -4, -6, -46, -76], 0, 2.8),
  'gemelos':           P('', 'escalon', [0, -6, -6, 0, 0], [0, -6, -6, 0, 0], 0, 1.6, [0, 0, 0, -12]),
  'gemelos-sentado':   P('maquina', 'banco-sentado', [0, -60, -80, -88, 84], [0, -60, -80, -88, 78], 0, 1.6),
  'abductor':          P('maquina', 'banco-sentado', [0, -60, -70, -88, 80], [0, -60, -70, -76, 80], 0, 2.2),

  // ── Brazo ──
  'curl':                   P('barra', '', [0, -4, -6, 0, 0], [0, -6, -142, 0, 0], 0, 2.4),
  'curl-predicador':        P('barra', 'predicador', [0, -52, -20, -88, 76], [0, -52, -130, -88, 76], 0, 2.4),
  'curl-sentado':           P('mancuerna', 'banco-sentado', [24, -34, -18, -88, 76], [24, -34, -136, -88, 76], 0, 2.4),
  'curl-inclinado':         P('mancuerna', 'banco-inclinado-sentado', [0, 16, -6, -80, 74], [0, 14, -140, -80, 74], -30, 2.6),
  'curl-muneca':            P('barra', 'banco-apoyo-brazos', [30, -60, -95, -88, 78], [30, -60, -108, -88, 78], 0, 1.8),
  'extension-triceps':      P('polea', '', [6, -14, -110, 0, 0], [6, -14, -14, 0, 0], 0, 2.2),
  'extension-triceps-cabeza': P('mancuerna', '', [0, -168, -120, 0, 0], [0, -168, -6, 0, 0], 0, 2.4),
  'patada-triceps':         P('mancuerna', '', [66, 24, -110, 0, -12], [66, 24, -10, 0, -12], 0, 2.2),
  'fondos':                 P('', 'paralelas', [8, 8, -8, 16, -52], [8, 8, -92, 16, -52], 0, 2.6, [0, -14, 0, 2]),
  'fondos-banco':           P('', 'banco-detras', [0, 30, -8, -80, 20], [0, 30, -80, -80, 20], 0, 2.4),

  // ── Pecho de pie / máquina ──
  'aperturas-pie':     P('polea', '', [8, -70, -16, 0, -8], [8, -100, -70, 0, -8], 0, 2.6),
  'aperturas-sentado': P('maquina', 'banco-respaldo', [0, -92, -14, -88, 78], [0, -92, -74, -88, 78], 0, 2.6),
  'flexiones':         P('', 'suelo-plancha', [0, -88, -6, 6, -6], [0, -88, -78, 6, -6], -72, 2.4),

  // ── Core ──
  'plancha':          P('', 'suelo-plancha', [0, -88, -86, 6, -4], [0, -88, -84, 6, -4], -74, 3.2),
  'plancha-lateral':  P('', 'suelo-plancha', [0, -88, -86, 4, -4], [0, -88, -84, 4, -4], -74, 3.2),
  'crunch-polea':     P('polea', 'rodillas', [6, -158, -104, -94, 148], [46, -158, -104, -94, 148], 0, 2.4, [0, 14, 0, 14]),
  'elevacion-piernas': P('', 'barra-alta', [0, -178, -2, 0, -4], [0, -178, -2, -92, -8], 0, 2.8, [0, 4, 0, 4]),
  'rueda':            P('rueda', 'rodillas', [34, -66, -10, -94, 148], [76, -104, -6, -94, 148], 0, 3, [0, 14, 0, 14]),
  'escalador':        P('', 'suelo-plancha', [0, -88, -6, 6, -4], [0, -88, -6, -50, -70], -74, 1.8),
  'giro-ruso':        P('disco', 'suelo-sentado', [30, -50, -70, -62, -72], [30, -96, -50, -62, -72], 0, 2.2),
  'pallof':           P('polea', '', [0, -86, -80, 0, -6], [0, -86, -6, 0, -6], 0, 2.6),
  'pajaro':           P('mancuerna', '', [70, -6, -10, 0, -14], [70, 60, -10, 0, -14], 0, 2.6),
  'pajaro-sentado':   P('maquina', 'banco-pecho', [30, -60, -10, -88, 76], [30, 20, -10, -88, 76], 0, 2.6),

  // ── Cardio ──
  'correr':   P('', 'cinta', [8, -40, -70, -34, -40], [8, 40, -70, 24, -70], 0, 0.9),
  'bici':     P('', 'bici', [16, -64, -62, -78, -44], [16, -64, -62, -28, -92], 0, 1.2, [24, 4, 24, 4]),
  'eliptica': P('', 'eliptica', [6, -46, -20, -40, -30], [6, 40, -20, 10, -60], 0, 1.4),
  'comba':    P('comba', 'suelo-linea', [0, 24, -46, 0, -6], [0, 24, -46, 0, -24], 0, 0.8, [0, 0, 0, -12]),
  'burpee':   P('', 'suelo-linea', [0, -4, -6, 0, -4], [64, -120, -10, -20, -100], 0, 1.8),
};

// Medidas del muñeco
const HIP = { x: 100, y: 104 };
const TORSO = 44, HEAD = 10, UPPER = 27, FORE = 25, THIGH = 36, SHIN = 34;

// Un hueso con músculo: cápsula que empieza ancha y se estrecha
const hueso = (L, a, b, cls = 'lm') => {
  const ra = a / 2, rb = b / 2;
  return `<path class="${cls}" d="M${-ra} 0
    C${-ra} ${-ra * 1.1} ${ra} ${-ra * 1.1} ${ra} 0
    C${ra * 1.06} ${L * 0.45} ${rb * 1.12} ${L * 0.62} ${rb} ${L}
    C${rb} ${L + rb * 1.1} ${-rb} ${L + rb * 1.1} ${-rb} ${L}
    C${-rb * 1.12} ${L * 0.62} ${-ra * 1.06} ${L * 0.45} ${-ra} 0 Z"/>`;
};
const seg = (len, w, cls = '') => hueso(len, w, w * 0.78, 'lm ' + cls);

// El peso lo tira la gravedad: la barra y las mancuernas se quedan
// siempre horizontales aunque el brazo gire. Sin esto, una barra de
// press de banca aparecía inclinada y quedaba raro.
const NIVELA = new Set(['barra', 'mancuerna', 'disco', 'kettlebell']);

function equipo(tipo) {
  switch (tipo) {
    case 'barra':
      return `<g class="eq"><rect x="-48" y="-2.6" width="96" height="5.2" rx="2.6"/>
        <rect x="-45" y="-13" width="8" height="26" rx="3"/><rect x="-36" y="-9" width="6" height="18" rx="2.5"/>
        <rect x="37" y="-13" width="8" height="26" rx="3"/><rect x="30" y="-9" width="6" height="18" rx="2.5"/></g>`;
    case 'mancuerna':
      return `<g class="eq"><rect x="-18" y="-2.2" width="36" height="4.4" rx="2.2"/>
        <rect x="-18" y="-9" width="7" height="18" rx="3"/><rect x="-10" y="-6.5" width="4.5" height="13" rx="2"/>
        <rect x="11" y="-9" width="7" height="18" rx="3"/><rect x="5.5" y="-6.5" width="4.5" height="13" rx="2"/></g>`;
    case 'kettlebell':
      return `<g class="eq"><circle cx="0" cy="8" r="9"/><path d="M-6 2a6 6 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="3"/></g>`;
    case 'disco':
      return `<g class="eq"><circle cx="0" cy="0" r="11"/></g>`;
    case 'polea':
      return `<g class="eq"><rect x="-13" y="-2.6" width="26" height="5.2" rx="2.6"/></g>`;
    case 'maquina':
      return `<g class="eq"><rect x="-10" y="-3" width="20" height="6" rx="3"/></g>`;
    case 'banda':
      return `<g class="eq"><rect x="-9" y="-2" width="18" height="4" rx="2"/></g>`;
    case 'rueda':
      return `<g class="eq"><circle cx="0" cy="6" r="10"/><rect x="-14" y="3" width="28" height="4" rx="2"/></g>`;
    case 'comba':
      return `<g class="eq"><rect x="-6" y="-2" width="12" height="4" rx="2"/></g>`;
    default: return '';
  }
}

// Decorado: bancos, suelo, máquinas… todo lo que no es el cuerpo
function soporte(tipo) {
  const S = s => `<g class="sup">${s}</g>`;
  switch (tipo) {
    case 'banco': return S(`<rect x="34" y="112" width="132" height="12" rx="5"/><rect x="52" y="124" width="9" height="34" rx="4"/><rect x="139" y="124" width="9" height="34" rx="4"/>`);
    case 'banco-inclinado': return S(`<rect x="40" y="104" width="126" height="12" rx="5" transform="rotate(-22 103 110)"/><rect x="140" y="124" width="9" height="34" rx="4"/>`);
    case 'banco-respaldo': return S(`<rect x="72" y="110" width="74" height="11" rx="5"/><rect x="132" y="56" width="12" height="58" rx="5"/><rect x="92" y="121" width="9" height="30" rx="4"/>`);
    case 'polea-alta-sentado': return S(`<rect x='30' y='16' width='96' height='8' rx='4'/><rect x='72' y='24' width='6' height='34' rx='3'/><rect x='72' y='110' width='76' height='11' rx='5'/><rect x='92' y='121' width='9' height='32' rx='4'/>`);
    case 'banco-sentado': return S(`<rect x="72" y="110" width="76" height="11" rx="5"/><rect x="92" y="121" width="9" height="32" rx="4"/>`);
    case 'banco-pecho': return S(`<rect x="72" y="110" width="74" height="11" rx="5"/><rect x="60" y="56" width="11" height="58" rx="5"/>`);
    case 'banco-apoyo': return S(`<rect x="90" y="108" width="86" height="12" rx="5"/><rect x="150" y="120" width="9" height="34" rx="4"/>`);
    case 'banco-apoyo-brazos': return S(`<rect x="52" y="96" width="76" height="10" rx="5"/><rect x="78" y="110" width="70" height="11" rx="5"/>`);
    case 'banco-espalda': return S(`<rect x="120" y="58" width="60" height="11" rx="5"/><rect x="168" y="69" width="10" height="42" rx="4"/><rect x="20" y="150" width="170" height="8" rx="4"/>`);
    case 'banco-detras': return S(`<rect x="110" y="96" width="70" height="11" rx="5"/><rect x="160" y="107" width="9" height="46" rx="4"/><rect x="20" y="150" width="170" height="8" rx="4"/>`);
    case 'banco-hiper': return S(`<rect x="78" y="96" width="60" height="11" rx="5" transform="rotate(-12 108 101)"/><rect x="100" y="106" width="10" height="46" rx="4"/>`);
    case 'banco-inclinado-sentado': return S(`<rect x="60" y="100" width="100" height="12" rx="5" transform="rotate(30 110 106)"/>`);
    case 'camilla': return S(`<rect x="30" y="104" width="140" height="12" rx="5"/><rect x="48" y="116" width="9" height="36" rx="4"/><rect x="143" y="116" width="9" height="36" rx="4"/>`);
    case 'predicador': return S(`<rect x="86" y="70" width="70" height="12" rx="5" transform="rotate(26 121 76)"/><rect x="74" y="110" width="66" height="11" rx="5"/>`);
    case 'prensa': return S(`<rect x="26" y="40" width="14" height="80" rx="5" transform="rotate(18 33 80)"/><rect x="118" y="104" width="76" height="12" rx="5"/>`);
    case 'paralelas': return S(`<rect x="52" y="96" width="10" height="62" rx="4"/><rect x="146" y="96" width="10" height="62" rx="4"/><rect x="52" y="92" width="104" height="8" rx="4"/>`);
    case 'barra-alta': return S(`<rect x="34" y="14" width="132" height="8" rx="4"/><rect x="36" y="14" width="8" height="26" rx="4"/><rect x="156" y="14" width="8" height="26" rx="4"/>`);
    case 'barra-media': return S(`<rect x="34" y="60" width="132" height="8" rx="4"/><rect x="20" y="150" width="170" height="8" rx="4"/>`);
    case 'suelo-linea': return S(`<rect x="18" y="150" width="174" height="8" rx="4"/>`);
    case 'suelo': return S(`<rect x="18" y="146" width="174" height="8" rx="4"/>`);
    case 'suelo-plancha': return S(`<rect x="18" y="146" width="174" height="8" rx="4"/>`);
    case 'suelo-sentado': return S(`<rect x="18" y="148" width="174" height="8" rx="4"/>`);
    case 'rodillas': return S(`<rect x="18" y="150" width="174" height="8" rx="4"/><rect x="150" y="10" width="10" height="44" rx="4"/>`);
    case 'escalon': return S(`<rect x="60" y="140" width="80" height="18" rx="5"/>`);
    case 'cinta': return S(`<rect x="24" y="142" width="160" height="14" rx="6"/><rect x="168" y="70" width="10" height="74" rx="4"/>`);
    case 'bici': return S(`<circle cx="60" cy="130" r="26" fill="none" stroke="currentColor" stroke-width="6"/><rect x="86" y="120" width="60" height="8" rx="4"/><rect x="128" y="60" width="9" height="62" rx="4"/>`);
    case 'eliptica': return S(`<rect x="34" y="140" width="130" height="10" rx="5"/><rect x="150" y="56" width="10" height="88" rx="4"/>`);
    default: return '';
  }
}

let uid = 0;

/**
 * Devuelve el SVG de un ejercicio.
 * @param {string} key  clave de POSES
 * @param {object} opt  { anim: true|false, alto }
 */
export function exerciseSVG(key, opt = {}) {
  const p = POSES[key] || POSES['curl'];
  const anim = opt.anim !== false;
  const id = 'fx' + (++uid);
  const [t0, a0, e0, m0, r0] = p.a;
  const [t1, a1, e1, m1, r1] = p.b;

  // Cada articulación gira alrededor de su punto en reposo
  const joint = (cls, ox, oy, from, to, body) => `
    <g class="j ${cls}" style="transform-origin:${ox}px ${oy}px; --a:${from}deg; --b:${to}deg">${body}</g>`;

  const manoY = HIP.y - TORSO + UPPER + FORE;

  const piernas = joint('thigh', HIP.x, HIP.y, m0, m1, `
      <g transform="translate(${HIP.x},${HIP.y})">${seg(THIGH, 16)}</g>
      ${joint('shin', HIP.x, HIP.y + THIGH, r0, r1, `
        <g transform="translate(${HIP.x},${HIP.y + THIGH})">${seg(SHIN, 13)}</g>
        <g transform="translate(${HIP.x},${HIP.y + THIGH + SHIN})">
          <path class="lm" d="M-5 -5 C-5 -1 -4 3 2 4 L15 4.5 C18 4.5 18 -1 15 -1.5 L5 -3 C3 -3.4 2 -4.6 2 -5 Z"/></g>`)}`);

  // Silueta del tronco: hombros anchos, cintura marcada y cadera
  const torsoFix = `<g transform="translate(${HIP.x},${HIP.y})">
    <path class="lm" d="M-14 2
      C-17 -8 -15 -15 -13.5 -22
      C-12.5 -29 -16 -34 -15.5 -${TORSO - 6}
      C-15.2 -${TORSO + 1} -9 -${TORSO + 3} 0 -${TORSO + 3}
      C9 -${TORSO + 3} 15.2 -${TORSO + 1} 15.5 -${TORSO - 6}
      C16 -34 12.5 -29 13.5 -22
      C15 -15 17 -8 14 2
      C7 5 -7 5 -14 2 Z"/>
    <path class="lm2" d="M-11 -${TORSO - 4} C-4 -${TORSO - 9} 4 -${TORSO - 9} 11 -${TORSO - 4}
      C10 -${TORSO - 14} -10 -${TORSO - 14} -11 -${TORSO - 4} Z"/>
    <rect class="lm2" x="-5" y="-${TORSO + 8}" width="10" height="9" rx="4"/>
  </g>`;

  return `<svg class="exfig ${anim ? 'anim' : ''}" id="${id}" viewBox="0 0 200 168" role="img"
      aria-label="Ilustración del ejercicio" style="--dur:${p.dur}s">
    ${soporte(p.sup)}
    <g class="fig" style="transform-origin:${HIP.x}px ${HIP.y}px;
        --t0:translate(${p.off[0]}px,${p.off[1]}px) rotate(${p.rot}deg) scale(.88);
        --t1:translate(${p.off[2]}px,${p.off[3]}px) rotate(${p.rot}deg) scale(.88)">
      ${joint('torso', HIP.x, HIP.y, t0, t1, `
        ${torsoFix}
        <g transform="translate(${HIP.x},${HIP.y})">
          <ellipse class="lm" cx="1" cy="${-TORSO - HEAD - 3}" rx="${HEAD - 0.5}" ry="${HEAD + 1.5}"/>
          <path class="lm2" d="M${HEAD - 3} ${-TORSO - HEAD - 7} a4 4 0 0 1 0 8 z"/></g>
        ${p.eq === 'barra-espalda'
          ? joint('nivel', HIP.x, HIP.y - TORSO + 4, -(p.rot + t0), -(p.rot + t1),
              `<g transform="translate(${HIP.x},${HIP.y - TORSO + 4})" class="eqs">
                <rect x="-46" y="-3.5" width="92" height="7" rx="3.5"/>
                <rect x="-44" y="-11" width="9" height="22" rx="3"/><rect x="35" y="-11" width="9" height="22" rx="3"/></g>`)
          : ''}
        ${joint('arm', HIP.x, HIP.y - TORSO, a0, a1, `
          <g transform="translate(${HIP.x},${HIP.y - TORSO})">${seg(UPPER, 13)}</g>
          ${joint('fore', HIP.x, HIP.y - TORSO + UPPER, e0, e1, `
            <g transform="translate(${HIP.x},${HIP.y - TORSO + UPPER})">${seg(FORE, 11)}</g>
            <g transform="translate(${HIP.x},${manoY})" class="hand">
              <ellipse class="lm" cx="0" cy="1" rx="5.4" ry="6.6"/></g>
            ${NIVELA.has(p.eq)
              ? joint('nivel', HIP.x, manoY,
                  -(p.rot + t0 + a0 + e0), -(p.rot + t1 + a1 + e1),
                  `<g transform="translate(${HIP.x},${manoY})">${equipo(p.eq)}</g>`)
              : `<g transform="translate(${HIP.x},${manoY})">${equipo(p.eq)}</g>`}`)}`)}`)}
      ${piernas}
    </g>
  </svg>`;
}

export const tienePose = key => !!POSES[key];
