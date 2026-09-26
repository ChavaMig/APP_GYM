// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN (sincronización PC ↔ móvil y control de acceso)
//
// Mientras firebaseConfig esté en null, la app funciona en MODO
// LOCAL: los datos se guardan solo en el navegador donde la uses.
//
// Para sincronizar y bloquear el acceso, sigue el README (paso 2)
// y pega aquí lo que te da Firebase:
//
// export const firebaseConfig = {
//   apiKey: "AIza...",
//   authDomain: "mi-gym-12345.firebaseapp.com",
//   projectId: "mi-gym-12345",
//   storageBucket: "mi-gym-12345.firebasestorage.app",
//   messagingSenderId: "1234567890",
//   appId: "1:1234567890:web:abc123"
// };
// ─────────────────────────────────────────────────────────────

export const firebaseConfig = null;

// Solo una cuenta de Google puede entrar en la app. Para no dejar el correo
// a la vista en el código, aquí va su huella (SHA-256), no el correo.
// Si otra persona inicia sesión, se le cierra la sesión al instante.
export const OWNER_EMAIL_SHA256 = "375d6a092661f430cc438b7f7cfb25a521dd4264b3d8d2ba878ad6d2a01c3e52";

// Alternativa: escribe el correo tal cual aquí y deja la huella vacía ("").
// Si ambos están vacíos, entra cualquier cuenta de Google.
export const OWNER_EMAIL = "";
