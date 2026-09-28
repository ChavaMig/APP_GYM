// ═══════════════════════════════════════════
// IRON · fotos de gimnasio
//
// Se cargan de internet la primera vez y luego quedan guardadas
// para verlas sin conexión. Si alguna no carga, en su sitio queda
// el degradado del fondo: la app nunca se ve rota por una foto.
//
// ¿Quieres cambiarlas? Pega aquí el enlace de cualquier imagen.
// (Unsplash y Pexels son gratis y permiten este uso.)
// ═══════════════════════════════════════════

const U = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const FOTOS = {
  // Cabecera de la portada
  portada: [
    U('1534438327276-14e5300c3a48'),   // sala de pesas
    U('1571902943202-507ec2618e8f'),   // gimnasio con máquinas
    U('1517836357463-d25dfeac3438'),   // barra y discos
  ],
  // Cabecera de cada sección
  entrenar: U('1581009146145-b5ef050c2e1e', 800),
  ejercicios: U('1534258936925-c58bed479fcb', 800),
  progreso: U('1526506118085-60ce8714f8c5', 800),
  perfil: U('1550345332-09e3ac987658', 800),
  dieta: U('1490645935967-10de6ba17061', 800),
};

// Comprueba una imagen antes de usarla: si falla, no se pinta nada
export function cargarFondo(el, url) {
  if (!el || !url) return;
  const img = new Image();
  img.onload = () => { el.style.backgroundImage = `url("${url}")`; el.classList.add('con-foto'); };
  img.onerror = () => { el.classList.add('sin-foto'); };
  img.src = url;
}

// Aplica las fotos a todos los elementos [data-foto] que haya en pantalla
export function pintarFotos(activas = true) {
  document.querySelectorAll('[data-foto]').forEach(el => {
    if (!activas) { el.style.backgroundImage = ''; el.classList.remove('con-foto'); return; }
    const clave = el.dataset.foto;
    const url = clave === 'portada'
      ? FOTOS.portada[new Date().getDate() % FOTOS.portada.length]   // va cambiando cada día
      : FOTOS[clave];
    cargarFondo(el, url);
  });
}
