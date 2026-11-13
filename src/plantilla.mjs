// Plantilla común de todas las páginas: <head>, cabecera, pie, selector de paletas y scripts.
export const euros = (n) => n.toFixed(2).replace(".", ",") + " €";
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const ICONO_CARRITO = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2l2.3 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg>`;

const MENU = [
  ["munecos.html", "Muñecos", "munecos"],
  ["index.html#huevos", "Huevos sorpresa", "huevos"],
  ["seguridad.html", "Seguridad", "seguridad"],
  ["envios.html", "Envíos", "envios"],
];

// Logotipo FLOPi: letras gordas de colores con contorno marino y borde amarillo (recreación en SVG del logo de la marca).
export function logoSVG({ clase = "logo", id = "logo" } = {}) {
  const letras = [["F", "#FFFFFF", -6, 0], ["L", "#FFD60A", 4, 3], ["O", "#4FC3F7", -3, 0], ["P", "#8CD63A", 5, 2], ["i", "#FF5CA8", -4, -1]];
  const x = [12, 66, 112, 172, 222];
  const capa = (estilo, conColor) => letras.map(([l, c, r, dy], i) =>
    `<text x="${x[i]}" y="${82 + dy}" transform="rotate(${r} ${x[i] + 24} ${60 + dy})" ${conColor ? `fill="${c}"` : ""} ${estilo}>${l}</text>`).join("");
  const base = 'font-family="Lilita One, Arial Rounded MT Bold, Trebuchet MS, sans-serif" font-size="86" stroke-linejoin="round"';
  return `<svg class="${clase}" viewBox="0 0 270 110" role="img" aria-labelledby="${id}-t"><title id="${id}-t">Flopi</title>
  <g ${base}>
    <g fill="#FFD60A" stroke="#FFD60A" stroke-width="26">${capa("", false)}</g>
    <g fill="#0E3A6B" stroke="#0E3A6B" stroke-width="13">${capa("", false)}</g>
    <g stroke="#0E3A6B" stroke-width="2">${capa("", true)}</g>
    <g fill="#FFFFFF" fill-opacity=".45">${letras.map(([l, , r, dy], i) => `<ellipse cx="${x[i] + 16}" cy="${36 + dy}" rx="7" ry="4" transform="rotate(${r - 20} ${x[i] + 16} ${36 + dy})"/>`).join("")}</g>
  </g>
</svg>`;
}

export function pagina({ titulo, descripcion, activo = "", fondo = "papel", cuerpo, scripts = [], cabezaExtra = "", sinCabecera = false }) {
  const menu = MENU.map(([href, txt, id]) =>
    `<li><a href="${href}"${id === activo ? ' aria-current="page"' : ""}>${txt}</a></li>`).join("");
  return `<!doctype html>
<html lang="es" data-paleta="pastel">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="${esc(descripcion)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta name="theme-color" content="#FFF8F1">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Lilita+One&family=Nunito:wght@400;600;800&display=swap">
<link rel="stylesheet" href="assets/css/flopi.css">
<link rel="stylesheet" href="assets/css/huevos.css">
<script>try{var p=localStorage.getItem("flopi-paleta");if(p)document.documentElement.dataset.paleta=p}catch(e){}</script>
${cabezaExtra}
</head>
<body data-fondo="${fondo}">
<a class="saltar" href="#contenido">Saltar al contenido</a>
<div class="anuncio"><div class="envoltorio"><p>Nuevos huevos sorpresa: ¿quién saldrá del tuyo? <a href="index.html#huevos">Descubrirlos</a></p></div></div>
${sinCabecera ? "" : `<header class="cabecera">
  <div class="envoltorio">
    <a class="marca" href="index.html" aria-label="Flopi, inicio">${logoSVG({ id: "logo-cab" })}</a>
    <nav aria-label="Principal"><ul class="menu">${menu}</ul></nav>
    <a class="carrito-enlace" href="carrito.html"${activo === "carrito" ? ' aria-current="page"' : ""}>${ICONO_CARRITO}<span class="txt">Carrito</span><span class="carrito-cuenta" data-carrito-cuenta data-vacio="true">0</span></a>
    <a class="boton" href="munecos.html">Crea tu Flopi</a>
  </div>
</header>`}
<main id="contenido">
${cuerpo}
</main>
<footer class="pie" data-fondo="cielo">
  <div class="envoltorio">
    <div class="pie__marca" aria-hidden="true">${logoSVG({ clase: "logo logo--grande", id: "logo-pie" })}</div>
    <p class="pie__redes">Síguenos en Instagram y TikTok: <strong>@flopi.toys</strong></p>
    <div class="pie__fila">
      <ul>
        <li><a href="munecos.html">Muñecos</a></li>
        <li><a href="index.html#huevos">Huevos sorpresa</a></li>
        <li><a href="seguridad.html">Seguridad y materiales</a></li>
        <li><a href="envios.html">Envíos y devoluciones</a></li>
        <li><a href="aviso-legal.html">Aviso legal</a></li>
        <li><a href="privacidad.html">Privacidad</a></li>
      </ul>
      <span>Web en construcción. Precios, plazos y textos son de ejemplo.</span>
    </div>
  </div>
</footer>
<p class="etiqueta-maqueta">Versión de prueba</p>
<div class="paletas" role="group" aria-label="Probar paleta de colores">
  <button type="button" data-paleta="marca" aria-pressed="false" style="--c1:#2EC4E6;--c2:#FFD60A;--c3:#FF5CA8"><i></i><span>Marca</span></button>
  <button type="button" data-paleta="pastel" aria-pressed="true" style="--c1:#F7B9CB;--c2:#BDE7D7;--c3:#FBE7A3"><i></i><span>Pastel</span></button>
  <button type="button" data-paleta="juguete" aria-pressed="false" style="--c1:#FF7A8A;--c2:#2CC9A9;--c3:#FFC83D"><i></i><span>Juguete</span></button>
  <button type="button" data-paleta="bosque" aria-pressed="false" style="--c1:#EFA8A0;--c2:#7DB394;--c3:#EFD06F"><i></i><span>Bosque</span></button>
</div>
<script src="assets/vendor/gsap.min.js" defer></script>
<script src="assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="assets/vendor/lenis.min.js" defer></script>
<script src="assets/js/carrito.js" defer></script>
<script src="assets/js/flopi.js" defer></script>
<script src="assets/js/huevos.js" defer></script>
${scripts.map((s) => `<script src="${s}" defer></script>`).join("\n")}
</body>
</html>
`;
}

export function tarjeta(p, datos, i = 0) {
  return `<a class="tarjeta" href="flopi-${p.slug}.html" data-profundidad="${[0.06, -0.08, 0.12, -0.04, 0.1][i % 5]}">
  <div class="tarjeta__marco" style="--fondo-tarjeta:var(--${p.fondo})">
    <img src="assets/img/flopi-${p.slug}.svg" alt="${esc(p.nombre)}, muñeco Flopi ${datos.colores[p.cuerpo].nombre.toLowerCase()} con ${datos.accesorios[p.accesorio].nombre.toLowerCase()}" width="560" height="660" loading="lazy" decoding="async" style="view-transition-name:flopi-${p.slug}">
  </div>
  <div class="tarjeta__pie"><span class="tarjeta__nombre">${esc(p.nombre)}</span><span class="tarjeta__precio">${euros(p.precio)}</span></div>
  <span class="tarjeta__subtitulo">${esc(p.subtitulo)}</span>
</a>`;
}
