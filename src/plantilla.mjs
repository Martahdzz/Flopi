// Plantilla común de todas las páginas: <head>, cabecera, pie, selector de paletas y scripts.
export const euros = (n) => n.toFixed(2).replace(".", ",") + " €";
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const ICONO_CARRITO = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2l2.3 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg>`;

const MENU = [
  ["munecos.html", "Flopis", "munecos"],
  ["huevos.html", "Huevos sorpresa", "huevos"],
  ["eventos.html", "Comuniones y bodas", "eventos"],
  ["seguridad.html", "Seguridad", "seguridad"],
  ["envios.html", "Envíos", "envios"],
];

// Logotipo FLOPi (recreación en SVG del logo de la marca): letras gordas redondeadas de colores,
// contorno azul marino, borde exterior amarillo y trazos amarillos a los lados.
// Fuente Fredoka 700 servida desde la propia web (assets/fonts), sin depender de Google Fonts.
export function logoSVG({ clase = "logo", id = "logo" } = {}) {
  // [letra, color, x, rotación, desplazamiento vertical]
  const letras = [
    ["F", "#FFFFFF", 22, -9, 2],
    ["L", "#FFD400", 82, 5, 8],
    ["O", "#2BB8F0", 132, -3, 0],
    ["P", "#7CCB2B", 210, 4, -2],
    ["i", "#FF4FA3", 268, 9, -6],
  ];
  const capa = (atributos, color) => letras.map(([l, c, x, r, dy]) =>
    `<text x="${x}" y="${112 + dy}" transform="rotate(${r} ${x + 26} ${70 + dy})"${color ? ` fill="${c}"` : ""} ${atributos}>${l}</text>`).join("");
  const fuente = 'font-family="Fredoka Flopi, Fredoka, Arial Rounded MT Bold, sans-serif" font-weight="700" font-size="112" stroke-linejoin="round" paint-order="stroke"';
  const trazo = (d) => `<path d="${d}" fill="none" stroke="#0E2F6B" stroke-width="13" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#FFD400" stroke-width="7" stroke-linecap="round"/>`;
  return `<svg class="${clase}" viewBox="-30 0 378 150" role="img" aria-labelledby="${id}-t"><title id="${id}-t">Flopi</title>
  ${trazo("M-8 40 L-20 30")}${trazo("M-12 66 L-24 66")}${trazo("M-6 92 L-18 102")}
  ${trazo("M326 40 L338 30")}${trazo("M330 66 L342 66")}${trazo("M324 92 L336 102")}
  <g ${fuente}>
    <g fill="#FFD400" stroke="#FFD400" stroke-width="34">${capa("")}</g>
    <g fill="#0E2F6B" stroke="#0E2F6B" stroke-width="18">${capa("")}</g>
    <g>${capa("", true)}</g>
  </g>
  <g fill="#FFFFFF" fill-opacity=".55">
    <ellipse cx="44" cy="40" rx="9" ry="5" transform="rotate(-25 44 40)"/>
    <ellipse cx="160" cy="44" rx="10" ry="5" transform="rotate(-25 160 44)"/>
    <ellipse cx="234" cy="40" rx="9" ry="5" transform="rotate(-20 234 40)"/>
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
<link rel="stylesheet" href="assets/css/eventos.css">
<script>try{var p=localStorage.getItem("flopi-paleta");if(p)document.documentElement.dataset.paleta=p}catch(e){}</script>
${cabezaExtra}
</head>
<body data-fondo="${fondo}">
<a class="saltar" href="#contenido">Saltar al contenido</a>
<div class="anuncio"><div class="envoltorio"><p>Nuevos huevos sorpresa: ¿quién saldrá del tuyo? <a href="huevos.html">Descubrirlos</a></p></div></div>
${sinCabecera ? "" : `<header class="cabecera">
  <div class="envoltorio">
    <a class="marca" href="index.html" aria-label="Flopi, inicio">${logoSVG({ id: "logo-cab" })}</a>
    <button type="button" class="menu-boton" aria-expanded="false" aria-controls="menu-principal"><span class="menu-boton__icono" aria-hidden="true"></span>Menú</button>
    <nav aria-label="Principal" id="menu-principal"><ul class="menu">${menu}</ul></nav>
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
        <li><a href="munecos.html">Flopis</a></li>
        <li><a href="huevos.html">Huevos sorpresa</a></li>
        <li><a href="eventos.html">Comuniones y bodas</a></li>
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
<script src="assets/js/eventos.js" defer></script>
${scripts.map((s) => `<script src="${s}" defer></script>`).join("\n")}
</body>
</html>
`;
}

export function tarjeta(p, datos, i = 0) {
  return `<a class="tarjeta" href="flopi-${p.slug}.html">
  <div class="tarjeta__marco" style="--fondo-tarjeta:var(--${p.fondo})">
    <img src="assets/img/flopi-${p.slug}.svg" alt="${esc(p.nombre)}, figura Flopi ${datos.colores[p.cuerpo].nombre.toLowerCase()} con ${datos.accesorios[p.accesorio].nombre.toLowerCase()}" width="560" height="660" loading="lazy" decoding="async" style="view-transition-name:flopi-${p.slug}">
  </div>
  <div class="tarjeta__info">
    <span class="tarjeta__nombre">${esc(p.nombre)}</span>
    <span class="tarjeta__subtitulo">${esc(p.subtitulo)}</span>
    <div class="tarjeta__compra"><span class="tarjeta__precio">${euros(p.precio)}</span><span class="tarjeta__cta" aria-hidden="true">Ver</span></div>
  </div>
</a>`;
}
