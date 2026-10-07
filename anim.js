// ═══════════════════════════════════════════
// IRON · figuras animadas de los ejercicios
//
// Cada ejercicio se dibuja desde el punto de vista que mejor enseña
// el movimiento, igual que en las láminas de anatomía:
//
//   · vista 'lado'  → movimientos que van hacia delante y hacia atrás
//                     (press de banca, sentadilla, peso muerto, remo,
//                     abdominales…). La barra se ve de punta, así que
//                     es un disco con los extremos asomando.
//   · vista 'frente'→ movimientos que van hacia los lados o por encima
//                     de la cabeza (elevaciones laterales, press militar,
//                     dominadas, curl…). Ahí la barra sí se ve cruzada.
//
// Cada postura son dos fotogramas y la animación va de uno a otro en
// bucle. Los ángulos están en grados; 0 = el segmento cuelga hacia abajo.
//
// Vista de lado:   negativo = hacia delante (a la derecha).
// Vista de frente: positivo = hacia fuera (separando del cuerpo).
// Orden: [tronco, brazo, codo, muslo, rodilla]
// ═══════════════════════════════════════════

const P = (eq, sup, a, b, rot = 0, dur = 2.6, off = [0, 0, 0, 0], vista = 'lado') =>
  ({ eq, sup, a, b, rot, dur, off, vista });
const F = (eq, sup, a, b, dur = 2.6, off = [0, 0, 0, 0]) => ({ eq, sup, a, b, rot: 0, dur, off, vista: 'frente' });

// Tumbado en un banco: la figura baja hasta apoyarse en él.
const TUMB = [0, 14, 0, 14];
const SUELO_T = [0, 51, 0, 51];

export const POSES = {
  // ── Empujes tumbado (vista de lado) ──
  // Cinco puntos de apoyo: cabeza, espalda alta y glúteos en el banco,
  // y los dos pies firmes en el suelo. Nada de piernas en el aire.
  'press-banco':      P('barra', 'banco', [0, -27, -91, 35, 55], [0, -88, -6, 35, 55], -90, 2.4, TUMB),
  'press-inclinado':  P('barra', 'banco-inclinado', [0, -30, -88, -10, 20], [0, -84, -8, -10, 20], -45, 2.4, [0, 18, 0, 18]),
  'press-declinado':  P('barra', 'banco-declinado', [0, -27, -91, 44, 48], [0, -88, -6, 44, 48], -104, 2.4, [0, 10, 0, 10]),
  'aperturas':        P('mancuerna', 'banco', [0, -34, -26, 35, 55], [0, -88, -14, 35, 55], -90, 2.8, TUMB),
  'pullover':         P('mancuerna', 'banco', [0, -150, -12, 35, 55], [0, -86, -8, 35, 55], -90, 2.8, TUMB),
  'press-frances':    P('barra', 'banco', [0, -92, -112, 35, 55], [0, -92, -6, 35, 55], -90, 2.4, TUMB),
  'crunch':           P('', 'suelo', [6, -58, -102, -25, 90], [36, -58, -102, -25, 90], -90, 2.4, SUELO_T),
  'elevacion-piernas-suelo': P('', 'suelo', [0, 42, 0, 15, 0], [0, 42, 0, -75, 0], -90, 2.6, SUELO_T),
  'dead-bug':         P('', 'suelo', [0, -148, -8, -88, 12], [0, -96, -8, -28, 42], -90, 2.6, SUELO_T),
  'hollow':           P('', 'suelo', [10, -150, -8, -58, 8], [16, -150, -8, -68, 6], -90, 3.2, SUELO_T),
  'curl-femoral':     P('maquina', 'camilla', [0, -150, -8, 0, 0], [0, -150, -8, 0, -110], 90, 2.4, [0, 23, 0, 23]),

  // ── Hombro y empujes por encima de la cabeza (vista de frente) ──
  'press-militar':          F('barra', 'suelo-ancho', [0, 48, 140, 7, 0], [0, 172, 2, 7, 0], 2.4),
  'press-militar-sentado':  F('mancuerna', 'banco-frente', [0, 48, 140, 9, 0], [0, 172, 2, 9, 0], 2.4),
  'press-sentado':          F('maquina', 'banco-frente', [0, 52, 132, 9, 0], [0, 170, 4, 9, 0], 2.4),
  'elevacion-lateral':      F('mancuerna', 'suelo-ancho', [0, 6, 4, 7, 0], [0, 92, 6, 7, 0], 2.6),
  'elevacion-frontal':      P('mancuerna', '', [0, -4, -4, 0, 0], [0, -92, -4, 0, 0], 0, 2.6),
  'remo-menton':            F('barra', 'suelo-ancho', [0, 8, 6, 7, 0], [0, 58, 86, 7, 0], 2.4),
  'encogimientos':          F('mancuerna', 'suelo-ancho', [0, 10, 2, 7, 0], [0, 10, 2, 7, 0], 1.8),
  'rotacion':               P('banda', '', [0, -10, -88, 0, 0], [0, -10, -20, 0, 0], 0, 2.4),
  'pajaro':                 P('mancuerna', '', [70, -6, -10, 0, -14], [70, 60, -10, 0, -14], 0, 2.6),
  'pajaro-sentado':         P('maquina', 'banco-pecho', [30, -60, -10, -88, 76], [30, 20, -10, -88, 76], 0, 2.6),
  'face-pull':              F('polea', 'polea-alta-pie', [0, 86, 10, 7, 0], [0, 92, 86, 7, 0], 2.4),

  // ── Tirones (vista de frente los verticales, de lado los horizontales) ──
  'dominadas':     F('', 'barra-dominadas', [0, 168, 4, 6, 12], [0, 140, 96, 6, 12], 2.8, [0, 0, 0, -16]),
  'jalon':         F('barra-polea', 'polea-alta-frente', [0, 164, 6, 9, 0], [0, 47, 138, 9, 0], 2.6),
  'remo':          P('barra', 'suelo-linea', [66, -4, -4, 0, -14], [66, -22, -118, 0, -14], 0, 2.6),
  'remo-banco':    P('mancuerna', 'banco-apoyo', [78, -4, -6, 0, -10], [78, -24, -116, 0, -10], 0, 2.6),
  'remo-sentado':  P('polea', 'suelo-sentado', [6, -88, -8, -84, 20], [16, -70, -118, -84, 20], 0, 2.6),
  'remo-invertido': P('', 'barra-media', [0, -92, -6, 2, -2], [0, -86, -102, 2, -2], -64, 2.6, [0, 10, 0, 2]),
  'pullover-pie':  P('polea', 'suelo-linea', [14, -148, -8, 0, -8], [14, -30, -8, 0, -8], 0, 2.6),
  'hiperextension': P('', 'banco-hiper', [58, -152, -124, 0, 0], [2, -152, -124, 0, 0], 0, 2.8, [0, 6, 0, 6]),

  // ── Peso muerto y cadera (vista de lado: lo que importa es la bisagra) ──
  'peso-muerto':         P('barra', 'suelo-linea', [62, -6, -4, -70, 85], [4, -4, -2, 0, -6], 0, 2.8, [0, 22, 0, 0]),
  'peso-muerto-rumano':  P('barra', 'suelo-linea', [56, -6, -4, -14, -16], [4, -4, -2, 0, -6], 0, 2.8, [0, 6, 0, 0]),
  'hip-thrust':          P('barra', 'banco-espalda', [24, -40, -70, -56, 80], [-2, -40, -70, -76, 94], 0, 2.6),

  // ── Pierna ──
  'sentadilla':        P('barra-espalda', 'suelo-linea', [6, -22, 158, 0, -4], [24, -22, 158, -70, 120], 0, 2.8, [0, 0, -16, 30]),
  'sentadilla-goblet': P('mancuerna', 'suelo-linea', [6, -68, -118, 0, -4], [22, -68, -118, -66, 116], 0, 2.8, [0, 0, -14, 28]),
  'prensa':            P('maquina', 'prensa', [0, -114, -34, -98, -64], [0, -114, -34, -86, -8], -14, 2.6, [16, 14, 16, 14]),
  'extension-pierna':  P('maquina', 'banco-sentado', [0, -58, -70, -86, 86], [0, -58, -70, -86, 4], 0, 2.4),
  'curl-femoral-sentado': P('maquina', 'banco-sentado', [0, -58, -70, -86, 10], [0, -58, -70, -86, 76], 0, 2.4),
  'zancada':           P('mancuerna', 'suelo-linea', [6, -4, -6, -6, -10], [8, -4, -6, -46, 96], 0, 2.8, [0, 0, 0, 22]),
  'gemelos':           P('', 'escalon', [0, -6, -6, 0, 0], [0, -6, -6, 0, 0], 0, 1.6, [0, 0, 0, -12]),
  'gemelos-sentado':   P('maquina', 'banco-sentado', [0, -58, -80, -86, 82], [0, -58, -80, -86, 76], 0, 1.6),
  'abductor':          F('maquina', 'banco-frente', [0, 14, 8, 8, 0], [0, 14, 8, 34, 0], 2.2),

  // ── Brazo ──
  'curl':                   F('barra', 'suelo-ancho', [0, 4, 6, 7, 0], [0, 10, 134, 7, 0], 2.4),
  'curl-predicador':        P('barra', 'predicador', [0, -52, -20, -86, 74], [0, -52, -128, -86, 74], 0, 2.4),
  'curl-sentado':           P('mancuerna', 'banco-sentado', [24, -34, -18, -86, 74], [24, -34, -134, -86, 74], 0, 2.4),
  'curl-inclinado':         P('mancuerna', 'banco-inclinado-sentado', [0, 16, -6, -78, 72], [0, 14, -138, -78, 72], -30, 2.6),
  'curl-muneca':            P('barra', 'banco-apoyo-brazos', [30, -60, -95, -86, 76], [30, -60, -108, -86, 76], 0, 1.8),
  'extension-triceps':      F('polea', 'polea-alta-frente', [0, 14, 88, 7, 0], [0, 14, 10, 7, 0], 2.2),
  'extension-triceps-cabeza': F('mancuerna', 'suelo-ancho', [0, 152, 116, 7, 0], [0, 158, 8, 7, 0], 2.4),
  'patada-triceps':         P('mancuerna', '', [66, 24, -108, 0, -12], [66, 24, -10, 0, -12], 0, 2.2),
  'fondos':                 P('', 'paralelas', [8, 8, -8, 16, -52], [8, 8, -90, 16, -52], 0, 2.6, [0, -14, 0, 2]),
  'fondos-banco':           P('', 'banco-detras', [0, 30, -8, -78, 20], [0, 30, -78, -78, 20], 0, 2.4),

  // ── Pecho de pie / máquina ──
  'aperturas-pie':     F('polea', 'suelo-ancho', [0, 88, 14, 7, 0], [0, 26, 22, 7, 0], 2.6),
  'aperturas-sentado': F('maquina', 'banco-frente', [0, 90, 12, 9, 0], [0, 30, 20, 9, 0], 2.6),
  'flexiones':         P('', 'suelo-plancha', [0, 72, 0, 18, -4], [0, 96, -56, 18, -4], -72, 2.4, [0, 29, 0, 35]),

  // ── Core ──
  'plancha':          P('', 'suelo-plancha', [0, 74, 2, 18, -4], [0, 74, 4, 18, -4], -72, 3.2, [0, 29, 0, 30]),
  'plancha-lateral':  P('', 'suelo-plancha', [0, 74, 2, 16, -2], [0, 74, 4, 16, -2], -72, 3.2, [0, 29, 0, 30]),
  'crunch-polea':     P('polea', 'rodillas', [6, -156, -102, -92, 146], [46, -156, -102, -92, 146], 0, 2.4, [0, 47, 0, 47]),
  'elevacion-piernas': F('', 'barra-dominadas', [0, 170, 6, 6, 4], [0, 170, 6, 80, 6], 2.8),
  'rueda':            P('rueda', 'rodillas', [34, -66, -10, -92, 146], [76, -102, -6, -92, 146], 0, 3, [0, 47, 0, 47]),
  'escalador':        P('', 'suelo-plancha', [0, 72, 0, 18, -4], [0, 72, 0, -34, -70], -72, 1.8, [0, 29, 0, 29]),
  'giro-ruso':        P('disco', 'suelo-sentado', [30, -50, -70, -60, -70], [30, -96, -50, -60, -70], 0, 2.2),
  'pallof':           P('polea', '', [0, -86, -78, 0, -6], [0, -86, -6, 0, -6], 0, 2.6),

  // ── Cardio ──
  'correr':   P('', 'cinta', [10, -46, -56, -10, -12], [10, 42, -56, -46, -72], 0, 0.9, [0, -10, 0, -10]),
  'bici':     P('', 'bici', [18, -58, -58, -74, -46], [18, -58, -58, -26, -92], 0, 1.2, [18, 4, 18, 4]),
  'eliptica': P('', 'eliptica', [6, -46, -20, -22, -30], [6, 34, -20, 4, -54], 0, 1.4),
  'comba':    P('comba', 'suelo-linea', [0, 24, -46, 0, -6], [0, 24, -46, 0, -24], 0, 0.8, [0, 0, 0, -12]),
  'burpee':   P('', 'suelo-linea', [0, -4, -6, 0, -4], [62, -118, -10, -18, -98], 0, 1.8),
};

// ═══════════ Medidas ═══════════
// Pensadas para que de pie los pies caigan justo en el suelo (y = 158).
const SUELO = 158;
const L = {                       // vista de lado
  hip: { x: 100, y: 92 }, torso: 42, head: 10, upper: 26, fore: 24, thigh: 32, shin: 34,
};
const Fm = {                      // vista de frente
  hip: { x: 100, y: 92 }, hombroY: 50, hombroX: 19, caderaX: 11,
  upper: 26, fore: 24, thigh: 32, shin: 34, head: 10,
};

const sin = g => Math.sin(g * Math.PI / 180);
const cos = g => Math.cos(g * Math.PI / 180);

// Un hueso con músculo: cápsula que empieza ancha y se estrecha
const hueso = (len, a, b, cls = 'lm') => {
  const ra = a / 2, rb = b / 2;
  return `<path class="${cls}" d="M${-ra} 0
    C${-ra} ${-ra * 1.1} ${ra} ${-ra * 1.1} ${ra} 0
    C${ra * 1.06} ${len * 0.45} ${rb * 1.12} ${len * 0.62} ${rb} ${len}
    C${rb} ${len + rb * 1.1} ${-rb} ${len + rb * 1.1} ${-rb} ${len}
    C${-rb * 1.12} ${len * 0.62} ${-ra * 1.06} ${len * 0.45} ${-ra} 0 Z"/>`;
};
const seg = (len, w) => hueso(len, w, w * 0.78, 'lm');
const segBrazo = (len, w) => hueso(len, w, w * 0.78, 'lm3');

// ═══════════ Material ═══════════
// De lado, una barra se ve de punta: lo que se ve es el disco con los
// extremos de la barra asomando, no una barra cruzada.
function equipoLado(tipo) {
  switch (tipo) {
    case 'barra':
    case 'barra-espalda':
      return `<g class="eq"><rect x="-19" y="-2.4" width="38" height="4.8" rx="2.4"/>
        <circle cx="0" cy="0" r="13"/><circle class="hueco" cx="0" cy="0" r="5"/></g>`;
    case 'mancuerna':
      return `<g class="eq"><rect x="-13" y="-2.2" width="26" height="4.4" rx="2.2"/>
        <circle cx="0" cy="0" r="8"/><circle class="hueco" cx="0" cy="0" r="3"/></g>`;
    case 'kettlebell':
      return `<g class="eq"><circle cx="0" cy="9" r="9"/><path d="M-6 3a6 6 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="3"/></g>`;
    case 'disco':
      return `<g class="eq"><circle cx="0" cy="0" r="11"/><circle class="hueco" cx="0" cy="0" r="4"/></g>`;
    case 'polea':
      return `<g class="eq"><rect x="-11" y="-2.6" width="22" height="5.2" rx="2.6"/></g>`;
    case 'maquina':
      return `<g class="eq"><rect x="-9" y="-3" width="18" height="6" rx="3"/></g>`;
    case 'banda':
      return `<g class="eq"><rect x="-8" y="-2" width="16" height="4" rx="2"/></g>`;
    case 'rueda':
      return `<g class="eq"><circle cx="0" cy="6" r="10"/><rect x="-14" y="3" width="28" height="4" rx="2"/></g>`;
    case 'comba':
      return `<g class="eq"><rect x="-6" y="-2" width="12" height="4" rx="2"/></g>`;
    default: return '';
  }
}

// De frente sí se ve la barra cruzada, con sus discos.
function barraFrente(medio) {
  return `<g class="eq"><rect x="${-medio}" y="-2.8" width="${medio * 2}" height="5.6" rx="2.8"/>
    <rect x="${-medio + 2}" y="-13" width="8" height="26" rx="3"/>
    <rect x="${-medio + 11}" y="-9" width="6" height="18" rx="2.5"/>
    <rect x="${medio - 10}" y="-13" width="8" height="26" rx="3"/>
    <rect x="${medio - 17}" y="-9" width="6" height="18" rx="2.5"/></g>`;
}
function manoFrente(tipo) {
  switch (tipo) {
    case 'mancuerna':
      return `<g class="eq"><rect x="-4" y="-11" width="8" height="22" rx="3"/>
        <rect x="-8" y="-9" width="5" height="18" rx="2.5"/><rect x="3" y="-9" width="5" height="18" rx="2.5"/></g>`;
    case 'kettlebell':
      return `<g class="eq"><circle cx="0" cy="9" r="9"/><path d="M-6 3a6 6 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="3"/></g>`;
    case 'maquina':
      return `<g class="eq"><rect x="-4" y="-9" width="8" height="18" rx="3"/></g>`;
    case 'polea':
      return `<g class="eq"><rect x="-4" y="-8" width="8" height="16" rx="3"/></g>`;
    default: return '';
  }
}

// ═══════════ Decorado ═══════════
function soporte(tipo) {
  const S = s => `<g class="sup">${s}</g>`;
  const suelo = `<rect x="14" y="${SUELO}" width="172" height="7" rx="3.5"/>`;
  switch (tipo) {
    case 'banco': return S(`${suelo}<rect x="26" y="120" width="134" height="12" rx="5"/><rect x="42" y="132" width="10" height="26" rx="4"/><rect x="136" y="132" width="10" height="26" rx="4"/>`);
    case 'banco-inclinado': return S(`${suelo}<rect x="34" y="115" width="110" height="11" rx="5" transform="rotate(45 89 121)"/><rect x="118" y="146" width="10" height="12" rx="4"/>`);
    case 'banco-declinado': return S(`${suelo}<rect x="36" y="114" width="126" height="12" rx="5" transform="rotate(14 99 120)"/><rect x="136" y="130" width="10" height="28" rx="4"/>`);
    case 'banco-respaldo': return S(`${suelo}<rect x="70" y="98" width="76" height="11" rx="5"/><rect x="132" y="46" width="12" height="58" rx="5"/><rect x="90" y="109" width="9" height="49" rx="4"/>`);
    case 'banco-sentado': return S(`${suelo}<rect x="70" y="98" width="78" height="11" rx="5"/><rect x="90" y="109" width="9" height="49" rx="4"/>`);
    case 'banco-pecho': return S(`${suelo}<rect x="70" y="98" width="76" height="11" rx="5"/><rect x="58" y="46" width="11" height="58" rx="5"/>`);
    case 'banco-apoyo': return S(`${suelo}<rect x="88" y="96" width="88" height="12" rx="5"/><rect x="152" y="108" width="9" height="50" rx="4"/>`);
    case 'banco-apoyo-brazos': return S(`${suelo}<rect x="50" y="84" width="76" height="10" rx="5"/><rect x="76" y="98" width="72" height="11" rx="5"/>`);
    case 'banco-espalda': return S(`${suelo}<rect x="118" y="46" width="62" height="11" rx="5"/><rect x="168" y="57" width="10" height="46" rx="4"/>`);
    case 'banco-detras': return S(`${suelo}<rect x="108" y="84" width="72" height="11" rx="5"/><rect x="160" y="95" width="9" height="63" rx="4"/>`);
    case 'banco-hiper': return S(`${suelo}<rect x="76" y="84" width="62" height="11" rx="5" transform="rotate(-12 107 89)"/><rect x="98" y="94" width="10" height="64" rx="4"/>`);
    case 'banco-inclinado-sentado': return S(`${suelo}<rect x="58" y="88" width="100" height="12" rx="5" transform="rotate(30 108 94)"/>`);
    case 'camilla': return S(`${suelo}<rect x="26" y="130" width="144" height="12" rx="5"/><rect x="44" y="142" width="10" height="16" rx="4"/><rect x="146" y="142" width="10" height="16" rx="4"/>`);
    case 'predicador': return S(`${suelo}<rect x="84" y="58" width="70" height="12" rx="5" transform="rotate(26 119 64)"/><rect x="72" y="98" width="68" height="11" rx="5"/>`);
    case 'prensa': return S(`<rect x="24" y="30" width="14" height="80" rx="5" transform="rotate(18 31 70)"/><rect x="116" y="92" width="78" height="12" rx="5"/>`);
    case 'paralelas': return S(`${suelo}<rect x="50" y="84" width="10" height="74" rx="4"/><rect x="146" y="84" width="10" height="74" rx="4"/><rect x="50" y="80" width="106" height="8" rx="4"/>`);
    case 'barra-media': return S(`${suelo}<rect x="32" y="52" width="136" height="8" rx="4"/>`);
    case 'suelo-linea': case 'suelo-ancho': return S(suelo);
    case 'suelo': case 'suelo-plancha': case 'suelo-sentado': case 'rodillas': return S(suelo);
    case 'escalon': return S(`${suelo}<rect x="58" y="138" width="84" height="20" rx="5"/>`);
    case 'cinta': return S(`<rect x="20" y="146" width="164" height="12" rx="5"/><rect x="164" y="58" width="10" height="90" rx="4"/><rect x="134" y="58" width="40" height="9" rx="4"/>`);
    case 'bici': return S(`${suelo}<circle cx="56" cy="124" r="23" fill="none" stroke="currentColor" stroke-width="6"/><rect x="96" y="98" width="48" height="9" rx="4"/><rect x="142" y="54" width="9" height="54" rx="4"/><rect x="128" y="54" width="36" height="8" rx="4"/><rect x="114" y="106" width="9" height="46" rx="4"/>`);
    case 'eliptica': return S(`${suelo}<rect x="30" y="140" width="134" height="10" rx="5"/><rect x="150" y="48" width="10" height="96" rx="4"/><rect x="126" y="48" width="38" height="8" rx="4"/>`);
    // decorados de la vista de frente
    case 'banco-frente': return S(`${suelo}<rect x="74" y="34" width="52" height="74" rx="10"/><rect x="70" y="106" width="60" height="11" rx="5"/><rect x="94" y="117" width="12" height="41" rx="4"/>`);
    case 'barra-dominadas': return S(`<rect x="34" y="12" width="132" height="8" rx="4"/><rect x="36" y="12" width="8" height="26" rx="4"/><rect x="156" y="12" width="8" height="26" rx="4"/>`);
    case 'polea-alta-frente': return S(`${suelo}<rect x="60" y="10" width="80" height="8" rx="4"/><rect x="96" y="18" width="8" height="24" rx="4"/>`);
    case 'polea-alta-pie': return S(`${suelo}<rect x="60" y="14" width="80" height="8" rx="4"/>`);
    default: return S(suelo);
  }
}

let uid = 0;
const joint = (cls, ox, oy, from, to, body) =>
  `<g class="j ${cls}" style="transform-origin:${ox}px ${oy}px; --a:${from}deg; --b:${to}deg">${body}</g>`;

// El peso lo tira la gravedad: lo que se agarra se queda horizontal
// aunque el brazo gire.
const NIVELA = new Set(['barra', 'mancuerna', 'disco', 'kettlebell']);

// ═══════════ Figura de lado ═══════════
function figuraLado(p, t0, a0, e0, m0, r0, t1, a1, e1, m1, r1) {
  const { hip, torso, head, upper, fore, thigh, shin } = L;
  const manoY = hip.y - torso + upper + fore;
  const eq = equipoLado(p.eq === 'barra-espalda' ? '' : p.eq);

  const piernas = joint('thigh', hip.x, hip.y, m0, m1, `
    <g transform="translate(${hip.x},${hip.y})">${seg(thigh, 16)}</g>
    ${joint('shin', hip.x, hip.y + thigh, r0, r1, `
      <g transform="translate(${hip.x},${hip.y + thigh})">${seg(shin, 13)}</g>
      <g transform="translate(${hip.x},${hip.y + thigh + shin})">
        <path class="lm" d="M-5 -5 C-5 -1 -4 3 2 4 L15 4.5 C18 4.5 18 -1 15 -1.5 L5 -3 C3 -3.4 2 -4.6 2 -5 Z"/></g>`)}`);

  const troncoFijo = `<g transform="translate(${hip.x},${hip.y})">
    <path class="lm" d="M-14 2
      C-17 -8 -15 -15 -13.5 -22
      C-12.5 -29 -16 -34 -15.5 -${torso - 6}
      C-15.2 -${torso + 1} -9 -${torso + 3} 0 -${torso + 3}
      C9 -${torso + 3} 15.2 -${torso + 1} 15.5 -${torso - 6}
      C16 -34 12.5 -29 13.5 -22
      C15 -15 17 -8 14 2
      C7 5 -7 5 -14 2 Z"/>
    <path class="lm2" d="M-11 -${torso - 4} C-4 -${torso - 9} 4 -${torso - 9} 11 -${torso - 4}
      C10 -${torso - 14} -10 -${torso - 14} -11 -${torso - 4} Z"/>
    <rect class="lm2" x="-5" y="-${torso + 8}" width="10" height="9" rx="4"/>
  </g>`;

  const enMano = NIVELA.has(p.eq)
    ? joint('nivel', hip.x, manoY, -(p.rot + t0 + a0 + e0), -(p.rot + t1 + a1 + e1),
        `<g transform="translate(${hip.x},${manoY})">${eq}</g>`)
    : `<g transform="translate(${hip.x},${manoY})">${eq}</g>`;

  // La barra de la sentadilla va sobre los hombros, también de punta
  const alHombro = p.eq === 'barra-espalda'
    ? joint('nivel', hip.x - 11, hip.y - torso + 11, -(p.rot + t0), -(p.rot + t1),
        `<g transform="translate(${hip.x - 11},${hip.y - torso + 11})">${equipoLado('barra')}</g>`)
    : '';

  return `<g class="fig" style="transform-origin:${hip.x}px ${hip.y}px;
      --t0:translate(${p.off[0]}px,${p.off[1]}px) rotate(${p.rot}deg);
      --t1:translate(${p.off[2]}px,${p.off[3]}px) rotate(${p.rot}deg)">
    ${joint('torso', hip.x, hip.y, t0, t1, `
      ${troncoFijo}
      ${alHombro}
      <g transform="translate(${hip.x},${hip.y})">
        <ellipse class="lm" cx="1" cy="${-torso - head - 3}" rx="${head - 0.5}" ry="${head + 1.5}"/>
        <path class="lm2" d="M${head - 3} ${-torso - head - 7} a4 4 0 0 1 0 8 z"/></g>
      ${joint('arm', hip.x, hip.y - torso, a0, a1, `
        <g transform="translate(${hip.x},${hip.y - torso})">${segBrazo(upper, 13)}</g>
        ${joint('fore', hip.x, hip.y - torso + upper, e0, e1, `
          <g transform="translate(${hip.x},${hip.y - torso + upper})">${segBrazo(fore, 11)}</g>
          <g transform="translate(${hip.x},${manoY})" class="hand">
            <ellipse class="lm3" cx="0" cy="1" rx="5.2" ry="6.4"/></g>
          ${enMano}`)}`)}`)}
    ${piernas}
  </g>`;
}

// ═══════════ Figura de frente ═══════════
// Posición de la mano derecha, para colocar la barra a la altura justa
function manoFrentePos(a, e) {
  const x = Fm.hombroX + Fm.upper * sin(a) + Fm.fore * sin(a + e);
  const y = Fm.hombroY + 4 + Fm.upper * cos(a) + Fm.fore * cos(a + e);
  return { x, y };
}

function figuraFrente(p, a0, e0, m0, r0, a1, e1, m1, r1) {
  const { hip, hombroY, hombroX, caderaX, upper, fore, thigh, shin, head } = Fm;
  const hombro = { x: hip.x + hombroX, y: hombroY + 4 };
  const manoY = hombro.y + upper + fore;

  // Un brazo (el derecho). El izquierdo es este mismo espejado.
  const enMano = ['mancuerna', 'kettlebell', 'maquina', 'polea'].includes(p.eq)
    ? joint('nivel', hombro.x, manoY, -(a0 + e0), -(a1 + e1),
        `<g transform="translate(${hombro.x},${manoY})">${manoFrente(p.eq)}</g>`)
    : '';
  const brazo = joint('arm', hombro.x, hombro.y, -a0, -a1, `
    <g transform="translate(${hombro.x},${hombro.y})">${segBrazo(upper, 12)}</g>
    ${joint('fore', hombro.x, hombro.y + upper, -e0, -e1, `
      <g transform="translate(${hombro.x},${hombro.y + upper})">${segBrazo(fore, 10)}</g>
      <g transform="translate(${hombro.x},${manoY})"><ellipse class="lm3" cx="0" cy="1" rx="5" ry="6"/></g>
      ${enMano}`)}`);

  const pierna = joint('thigh', hip.x + caderaX, hip.y, -m0, -m1, `
    <g transform="translate(${hip.x + caderaX},${hip.y})">${seg(thigh, 16)}</g>
    ${joint('shin', hip.x + caderaX, hip.y + thigh, -r0, -r1, `
      <g transform="translate(${hip.x + caderaX},${hip.y + thigh})">${seg(shin, 13)}</g>
      <g transform="translate(${hip.x + caderaX},${hip.y + thigh + shin})">
        <ellipse class="lm" cx="0" cy="2" rx="7" ry="4.5"/></g>`)}`);

  const espejo = s => `<g transform="translate(${hip.x * 2},0) scale(-1,1)">${s}</g>`;

  const tronco = `<g>
    <path class="lm" d="M-20 -42 C-12 -46 12 -46 20 -42
      C21 -34 19 -28 17 -22
      C15 -14 14 -6 15 2
      C8 5 -8 5 -15 2
      C-14 -6 -15 -14 -17 -22
      C-19 -28 -21 -34 -20 -42 Z" transform="translate(${hip.x},${hip.y})"/>
    <rect class="lm2" x="${hip.x - 5}" y="${hombroY - 10}" width="10" height="10" rx="4"/>
    <circle class="lm" cx="${hip.x}" cy="${hombroY - 20}" r="${head}"/>
    <path class="lm2" d="M${hip.x - 11} ${hip.y - 36} C${hip.x - 5} ${hip.y - 40} ${hip.x + 5} ${hip.y - 40} ${hip.x + 11} ${hip.y - 36}
      C${hip.x + 9} ${hip.y - 44} ${hip.x - 9} ${hip.y - 44} ${hip.x - 11} ${hip.y - 36} Z"/>
  </g>`;

  // Barra o polea cruzada: no cuelga de la mano, se mueve con ella
  let cruzado = '';
  if (p.eq === 'barra' || p.eq === 'barra-polea') {
    const h0 = manoFrentePos(a0, e0), h1 = manoFrentePos(a1, e1);
    const medio = p.eq === 'barra' ? 46 : 40;
    const base = p.eq === 'barra' ? barraFrente(medio)
      : `<g class="eq"><rect x="${-medio}" y="-3" width="${medio * 2}" height="6" rx="3"/>
         <rect x="${-medio}" y="-3" width="6" height="16" rx="3"/><rect x="${medio - 6}" y="-3" width="6" height="16" rx="3"/></g>`;
    cruzado = `<g class="fig" style="transform-origin:${hip.x}px ${hip.y}px;
        --t0:translate(${p.off[0]}px,${(h0.y - manoY + p.off[1]).toFixed(1)}px);
        --t1:translate(${p.off[2]}px,${(h1.y - manoY + p.off[3]).toFixed(1)}px)">
      <g transform="translate(${hip.x},${manoY})">${base}</g></g>`;
  }

  const cuerpo = `${tronco}${pierna}${espejo(pierna)}${brazo}${espejo(brazo)}`;
  const mueve = p.off.some(v => v !== 0)
    ? `<g class="fig" style="transform-origin:${hip.x}px ${hip.y}px;
        --t0:translate(${p.off[0]}px,${p.off[1]}px); --t1:translate(${p.off[2]}px,${p.off[3]}px)">${cuerpo}</g>`
    : cuerpo;
  return `${mueve}${cruzado}`;
}

/**
 * Devuelve el SVG de un ejercicio.
 * @param {string} key  clave de POSES
 * @param {object} opt  { anim: true|false }
 */
export function exerciseSVG(key, opt = {}) {
  const p = POSES[key] || POSES['curl'];
  const anim = opt.anim !== false;
  const id = 'fx' + (++uid);
  const [t0, a0, e0, m0, r0] = p.a;
  const [t1, a1, e1, m1, r1] = p.b;
  const cuerpo = p.vista === 'frente'
    ? figuraFrente(p, a0, e0, m0, r0, a1, e1, m1, r1)
    : figuraLado(p, t0, a0, e0, m0, r0, t1, a1, e1, m1, r1);

  return `<svg class="exfig ${anim ? 'anim' : ''}" id="${id}" viewBox="0 0 200 168" role="img"
      aria-label="Ilustración del ejercicio" style="--dur:${p.dur}s">
    ${soporte(p.sup)}
    ${cuerpo}
  </svg>`;
}

export const tienePose = key => !!POSES[key];
