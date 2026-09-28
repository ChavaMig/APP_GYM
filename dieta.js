// ═══════════════════════════════════════════
// IRON · dietas
//
// Calcula las calorías a partir del perfil (fórmula de Mifflin-St Jeor,
// la que usan los profesionales) y reparte dos planes de comidas.
// Son orientativos: no sustituyen a un dietista-nutricionista.
// ═══════════════════════════════════════════

export const OBJETIVOS = {
  perder: { n: 'Perder grasa', ajuste: -0.18, desc: 'Déficit moderado, para bajar grasa sin perder músculo' },
  mantener: { n: 'Mantenerme', ajuste: 0, desc: 'Mismo peso, mejorando composición corporal' },
  ganar: { n: 'Ganar músculo', ajuste: 0.12, desc: 'Superávit controlado, para ganar poco a poco' },
};
export const ACTIVIDADES = {
  bajo: { n: 'Poco activo', factor: 1.375, desc: 'Trabajo sentado, 2-3 días de gym' },
  medio: { n: 'Activo', factor: 1.55, desc: 'Algo de movimiento y 3-5 días de gym' },
  alto: { n: 'Muy activo', factor: 1.725, desc: 'Trabajo de pie o 6 días de gym' },
};

export function calcularNutricion(p) {
  const kg = Number(p.pesoKg), cm = Number(p.heightCm), edad = Number(p.edad);
  if (!(kg > 0 && cm > 0 && edad > 0)) return null;
  const hombre = (p.sexo || 'h') === 'h';
  const tmb = 10 * kg + 6.25 * cm - 5 * edad + (hombre ? 5 : -161);
  const gasto = tmb * (ACTIVIDADES[p.actividad]?.factor || 1.55);
  const obj = OBJETIVOS[p.objetivo] || OBJETIVOS.mantener;
  let kcal = Math.round((gasto * (1 + obj.ajuste)) / 10) * 10;
  // Suelo de seguridad: por debajo de esto no se debe comer sin supervisión
  const minimo = hombre ? 1600 : 1300;
  const recortado = kcal < minimo;
  if (recortado) kcal = minimo;
  const prot = Math.round(kg * 1.9);
  const grasa = Math.round(kg * 0.9);
  const carbs = Math.max(50, Math.round((kcal - prot * 4 - grasa * 9) / 4));
  return { tmb: Math.round(tmb), gasto: Math.round(gasto), kcal, prot, grasa, carbs, objetivo: obj, recortado };
}

// Los gramos están pensados para 2000 kcal y se ajustan a las tuyas
const esc = (g, kcal) => Math.round((g * kcal) / 2000 / 5) * 5 || Math.max(1, Math.round((g * kcal) / 2000));

export const PLANES = {
  sencilla: {
    id: 'sencilla',
    n: 'Básica y barata',
    lema: 'Cinco alimentos de siempre, poco tiempo de cocina',
    precio: '45-55 € por semana',
    color: 'simple',
    puntos: ['Todo se compra en cualquier supermercado', 'Cuatro comidas al día', 'Se cocina en tandas: arroz y pollo para varios días'],
    comidas: kcal => [
      { n: 'Desayuno', pct: 25, items: [
        [`${esc(80, kcal)} g de avena`, 'con leche'],
        [`${esc(250, kcal)} ml de leche`, ''],
        ['1 plátano', ''],
        ['2 huevos', 'revueltos o cocidos'],
      ] },
      { n: 'Comida', pct: 35, items: [
        [`${esc(120, kcal)} g de arroz`, 'en crudo'],
        [`${esc(180, kcal)} g de pollo`, 'pechuga o contramuslo'],
        [`${esc(200, kcal)} g de verdura`, 'congelada vale igual'],
        ['1 cucharada de aceite de oliva', ''],
      ] },
      { n: 'Merienda', pct: 15, items: [
        [`${esc(200, kcal)} g de yogur natural`, ''],
        [`${esc(60, kcal)} g de pan`, ''],
        ['1 lata de atún', 'o 2 huevos'],
      ] },
      { n: 'Cena', pct: 25, items: [
        ['3 huevos', 'tortilla o revuelto'],
        [`${esc(250, kcal)} g de patata`, 'cocida o al horno'],
        ['Ensalada', 'lo que tengas'],
        ['1 cucharada de aceite de oliva', ''],
      ] },
    ],
    compra: [
      ['Avena (1 kg)', '1,60 €'], ['Leche (6 L)', '5,40 €'], ['Huevos (30 uds)', '5,20 €'],
      ['Arroz (2 kg)', '2,60 €'], ['Pollo (2 kg)', '11,00 €'], ['Verdura congelada (2 kg)', '4,00 €'],
      ['Patatas (3 kg)', '3,00 €'], ['Plátanos (1,5 kg)', '2,40 €'], ['Yogur natural (12 uds)', '3,20 €'],
      ['Atún (8 latas)', '5,00 €'], ['Pan (3 barras)', '2,70 €'], ['Ensalada y tomate', '3,50 €'],
      ['Aceite de oliva (1 L)', '8,00 €'],
    ],
    consejos: [
      'Cocina arroz y pollo para tres días: ahorras una hora larga a la semana.',
      'La verdura congelada cuesta la mitad y nutre igual que la fresca.',
      'Si un día entrenas fuerte, añade otro plátano o un puñado más de arroz.',
    ],
  },
  completa: {
    id: 'completa',
    n: 'Completa',
    lema: 'Más variedad, mejores grasas y cinco comidas',
    precio: '75-90 € por semana',
    color: 'completa',
    puntos: ['Más pescado, frutos secos y fruta variada', 'Cinco comidas, una de ellas después de entrenar', 'Mejor para ganar músculo o si te cansa comer siempre lo mismo'],
    comidas: kcal => [
      { n: 'Desayuno', pct: 22, items: [
        ['Tortilla de 3 huevos', ''],
        [`${esc(60, kcal)} g de pan integral`, ''],
        ['½ aguacate', ''],
        ['Café o té', ''],
      ] },
      { n: 'Media mañana', pct: 13, items: [
        [`${esc(200, kcal)} g de yogur griego`, ''],
        [`${esc(30, kcal)} g de nueces`, 'o almendras'],
        ['1 pieza de fruta', ''],
      ] },
      { n: 'Comida', pct: 30, items: [
        [`${esc(120, kcal)} g de quinoa o arroz integral`, 'en crudo'],
        [`${esc(180, kcal)} g de ternera magra`, 'o salmón'],
        ['Verduras al horno', 'pimiento, calabacín, cebolla'],
        ['1 cucharada de aceite de oliva virgen extra', ''],
      ] },
      { n: 'Después de entrenar', pct: 12, items: [
        ['1 batido de proteína', 'o 250 g de queso fresco batido'],
        ['1 plátano', ''],
      ] },
      { n: 'Cena', pct: 23, items: [
        [`${esc(200, kcal)} g de pescado blanco o salmón`, ''],
        [`${esc(220, kcal)} g de boniato`, 'o patata'],
        ['Ensalada grande', 'con aceite de oliva'],
      ] },
    ],
    compra: [
      ['Huevos (30 uds)', '5,20 €'], ['Salmón (800 g)', '14,00 €'], ['Pescado blanco (1 kg)', '9,00 €'],
      ['Ternera magra (1 kg)', '12,50 €'], ['Quinoa (500 g)', '4,00 €'], ['Arroz integral (1 kg)', '2,20 €'],
      ['Boniato (2 kg)', '4,40 €'], ['Aguacate (4 uds)', '4,80 €'], ['Nueces y almendras (500 g)', '6,50 €'],
      ['Yogur griego (8 uds)', '4,80 €'], ['Fruta variada (3 kg)', '6,00 €'], ['Verduras frescas', '7,00 €'],
      ['Pan integral', '3,20 €'], ['Aceite de oliva virgen extra (1 L)', '9,50 €'],
    ],
    consejos: [
      'Asa verduras para toda la semana en una bandeja: una sola vez de horno.',
      'El pescado congelado es igual de bueno y bastante más barato.',
      'Si un día no llegas a las comidas, júntalas: importa más el total del día.',
    ],
  },
};

export const AVISO_DIETA =
  'Estos planes son orientativos y están calculados con una fórmula estándar. No soy dietista-nutricionista: ' +
  'si tienes alguna condición médica, tomas medicación, estás embarazada o quieres afinar de verdad, consúltalo con un profesional. ' +
  'Si algún día tienes hambre real, come más: pasar hambre no acelera nada.';
