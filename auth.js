// ═══════════════════════════════════════════
// IRON · cuentas y sesión
//
// Dos modos, según si has configurado Firebase:
//
//  • MODO LOCAL (sin Firebase): la cuenta vive en este dispositivo.
//    La contraseña no se guarda: se guarda su huella (PBKDF2-SHA256 con
//    sal aleatoria y 210.000 vueltas), que no se puede deshacer.
//    Sirve para que nadie abra la app en tu móvil, pero no cifra los
//    datos: quien tenga el móvil desbloqueado y sepa buscar podría
//    leerlos. Para protección de verdad, configura Firebase.
//
//  • MODO NUBE (con Firebase): registro e inicio de sesión con correo y
//    contraseña o con Google, y los datos viajan cifrados a Firestore.
//    Ahí la contraseña la gestiona Google, no la app.
// ═══════════════════════════════════════════

const CUENTA = 'iron-cuenta-v1';
const SESION = 'iron-sesion-v1';
const VUELTAS = 210000;
const DIAS_SESION = 7;   // a los 7 días sin abrir la app, vuelve a pedir contraseña

// Sin https (salvo localhost) el navegador no deja cifrar nada
export function cifradoDisponible() { return !!(globalThis.crypto && crypto.subtle); }
function exigirCifrado() {
  if (!cifradoDisponible())
    throw new Error('Abre la app por https o desde localhost: este navegador no permite cifrar la contraseña en una dirección no segura.');
}

const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const bytes = h => new Uint8Array(h.match(/.{2}/g).map(x => parseInt(x, 16)));

async function derivar(password, salHex) {
  exigirCifrado();
  const clave = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: bytes(salHex), iterations: VUELTAS, hash: 'SHA-256' }, clave, 256);
  return hex(bits);
}

const leer = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
// Si el navegador no deja guardar (memoria llena o modo privado), hay que enterarse
const escribir = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); }
  catch { throw new Error('El navegador no ha dejado guardar los datos. Libera espacio o desactiva el modo privado.'); }
};

export const hayCuenta = () => !!leer(CUENTA);
export function haySesion() {
  const s = leer(SESION);
  if (!s || !hayCuenta()) return false;
  if (Date.now() - (s.desde || 0) > DIAS_SESION * 864e5) { salir(); return false; }
  return true;
}
// Cada vez que entras, la sesión se renueva otros 7 días
export function renovarSesion() { if (leer(SESION)) escribir(SESION, { desde: Date.now() }); }
export const nombreCuenta = () => leer(CUENTA)?.nombre || '';

export async function registrar(nombre, password) {
  if (hayCuenta()) throw new Error('Ya hay una cuenta en este dispositivo');
  if ((password || '').length < 6) throw new Error('La contraseña necesita al menos 6 caracteres');
  const sal = hex(crypto.getRandomValues(new Uint8Array(16)));
  escribir(CUENTA, { nombre: (nombre || '').trim().slice(0, 40), sal, hash: await derivar(password, sal), creada: Date.now() });
  escribir(SESION, { desde: Date.now() });
  return true;
}

export async function entrar(password) {
  const c = leer(CUENTA);
  if (!c) throw new Error('No hay ninguna cuenta en este dispositivo');
  const h = await derivar(password || '', c.sal);
  // Comparación en tiempo constante, por costumbre sana
  let igual = h.length === c.hash.length;
  for (let i = 0; i < h.length; i++) igual = igual && h[i] === c.hash[i];
  if (!igual) throw new Error('Contraseña incorrecta');
  escribir(SESION, { desde: Date.now() });
  return true;
}

export function salir() { try { localStorage.removeItem(SESION); } catch {} }

export async function cambiarPassword(actual, nueva) {
  await entrar(actual);
  if ((nueva || '').length < 6) throw new Error('La nueva contraseña necesita al menos 6 caracteres');
  const c = leer(CUENTA);
  const sal = hex(crypto.getRandomValues(new Uint8Array(16)));
  escribir(CUENTA, { ...c, sal, hash: await derivar(nueva, sal) });
  return true;
}

// Quitar la contraseña sin borrar los entrenos (por si se te olvida).
// Se avisa claramente en la interfaz de que esto no es un candado infalible.
export function quitarCuenta() {
  try { localStorage.removeItem(CUENTA); localStorage.removeItem(SESION); } catch {}
}
