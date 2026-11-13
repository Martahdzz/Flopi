// Construye la web estática en dist/: copia public/, librerías de node_modules,
// genera ilustraciones SVG de cada producto y escribe todas las páginas HTML.
import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { pagina, tarjeta, euros, esc } from "../src/plantilla.mjs";
import { flopiSVG, huevoSVG } from "../src/flopi-svg.mjs";

const raiz = new URL("../", import.meta.url);
const dist = new URL("dist/", raiz);
const datos = JSON.parse(await readFile(new URL("src/datos/productos.json", raiz), "utf8"));
const { productos, colores, accesorios } = datos;
const SITIO = process.env.SITIO_URL || "https://martahdzz.github.io/Flopi/";

await rm(dist, { recursive: true, force: true });
await cp(new URL("public/", raiz), dist, { recursive: true });
await mkdir(new URL("assets/vendor/", dist), { recursive: true });
await mkdir(new URL("assets/img/", dist), { recursive: true });
await mkdir(new URL("assets/fonts/", dist), { recursive: true });
await cp(new URL("node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff2", raiz), new URL("assets/fonts/fredoka-700.woff2", dist));
for (const [desde, a] of [
  ["node_modules/gsap/dist/gsap.min.js", "gsap.min.js"],
  ["node_modules/gsap/dist/ScrollTrigger.min.js", "ScrollTrigger.min.js"],
  ["node_modules/lenis/dist/lenis.min.js", "lenis.min.js"],
  ["node_modules/@google/model-viewer/dist/model-viewer.min.js", "model-viewer.min.js"],
]) await cp(new URL(desde, raiz), new URL("assets/vendor/" + a, dist));

// ---- Imágenes de producto y favicon ----
const hex = (k) => colores[k].hex;
for (const p of productos) {
  await writeFile(new URL(`assets/img/flopi-${p.slug}.svg`, dist),
    flopiSVG({ cuerpo: hex(p.cuerpo), pelo: hex(p.pelo), accesorio: p.accesorio, colorAccesorio: hex(p.colorAccesorio), id: p.slug }));
}
await writeFile(new URL("assets/img/flopi-huevo.svg", dist), huevoSVG({ color: hex("chicle"), id: "huevo-carrito" }).replace('style="fill:var(--huevo-color, ', 'style="fill:var(--x, '));
await writeFile(new URL("assets/img/flopi-perdido.svg", dist),
  flopiSVG({ cuerpo: hex("cielo"), pelo: hex("tinta"), accesorio: "gorro", colorAccesorio: hex("chicle"), id: "perdido" }));
await writeFile(new URL("assets/img/favicon.svg", dist),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#43C8E8"/><text x="32" y="49" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial Black, sans-serif" font-weight="900" font-size="46" fill="#FFFFFF" stroke="#0E3A6B" stroke-width="5" paint-order="stroke" stroke-linejoin="round">F</text></svg>`);

const escribir = (archivo, html) => writeFile(new URL(archivo, dist), html);
const paginas = [];
const registrar = (archivo, html) => { paginas.push(archivo); return escribir(archivo, html); };

// ---- Inicio ----
// Sección y página de huevos sorpresa: las genera otro módulo; si no existe, se omiten.
let seccionHuevos = () => "";
let paginaHuevos = null;
try { ({ seccionHuevos = () => "", paginaHuevos = null } = await import("../src/paginas/huevos.mjs")); } catch {}

const porSlug = Object.fromEntries(productos.map((p) => [p.slug, p]));
const { pack, descuentos = [], faq = [], destacados = [] } = datos;
const sumaSuelta = productos.reduce((t, p) => t + p.precio, 0);
const ahorro = sumaSuelta - pack.precio;
const precioPack = `<s>${euros(sumaSuelta)}</s> <strong>${euros(pack.precio)}</strong> <span class="oferta__ahorro">Ahorras ${euros(ahorro)}</span>`;

const OFERTA = `<div class="oferta hero__cta">
          <p class="oferta__titulo">${esc(pack.nombre)}</p>
          <p class="oferta__precio">${precioPack}</p>
          <div class="oferta__acciones"><a class="boton" href="#pack">Ver el pack</a><a class="enlace" href="munecos.html">Elegir por separado</a></div>
          <p class="oferta__nota">Cada Flopi con los colores que elijas. Precios de ejemplo.</p>
        </div>`;

const DESTACADOS = `<section class="destacados" data-fondo="papel" aria-labelledby="titulo-destacados">
    <div class="envoltorio">
      <div class="destacados__cabeza"><h2 id="titulo-destacados">Tres para empezar</h2><p>Los que más ganas tenemos de ver en casa. Todos cambian de color y de accesorio.</p></div>
      <div class="destacados__fila">
${destacados.map((slug) => porSlug[slug]).filter(Boolean).map((p) => `        <a class="destacado" href="flopi-${p.slug}.html">
          <div class="destacado__marco" style="--fondo-tarjeta:var(--${p.fondo})"><img src="assets/img/flopi-${p.slug}.svg" alt="${esc(p.nombre)}, muñeco Flopi con ${esc(accesorios[p.accesorio].nombre.toLowerCase())}" width="560" height="660" loading="lazy" decoding="async"></div>
          <div class="destacado__texto"><h3>${esc(p.nombre)}</h3><p>${esc(p.frase)}</p><span class="destacado__precio">${euros(p.precio)}</span></div>
        </a>`).join("\n")}
      </div>
    </div>
  </section>`;

const PACK = `<section class="pack" id="pack" data-fondo="limon" aria-labelledby="titulo-pack">
    <div class="envoltorio">
      <div class="pack__composicion" aria-hidden="true">
${productos.slice(0, 5).map((p, i) => `        <img class="pack__flopi" style="--i:${i}" src="assets/img/flopi-${p.slug}.svg" alt="" width="560" height="660" loading="lazy" decoding="async">`).join("\n")}
      </div>
      <div class="pack__texto">
        <h2 id="titulo-pack">La pandilla completa</h2>
        <p>${esc(pack.descripcion)}</p>
        <p class="pack__precio">${precioPack}</p>
        <a class="boton" href="munecos.html">Elegir sus colores</a>
      </div>
      <div class="pack__escenario">
        <h3>${esc(pack.escenario.nombre)}</h3>
        <p>${esc(pack.escenario.descripcion)}</p>
        <span class="pack__escenario-precio">${euros(pack.escenario.precio)}</span>
      </div>
    </div>
  </section>`;

const DESCUENTOS = `<section class="descuentos" data-fondo="menta" aria-labelledby="titulo-descuentos">
    <div class="envoltorio">
      <div class="descuentos__texto"><h2 id="titulo-descuentos">Cuantos más, mejor</h2><p>Para hermanos, primos o toda la clase: el descuento se aplica solo en el carrito.</p></div>
      <ol class="descuentos__lista">
${descuentos.map((d) => `        <li class="descuento"><span class="descuento__unidades">Desde ${d.unidades} Flopis</span><span class="descuento__valor">${d.descuento} %</span></li>`).join("\n")}
      </ol>
      <p class="descuentos__nota">Descuentos de ejemplo. El pack pandilla tiene su propio precio.</p>
    </div>
  </section>`;

const FAQ = `<section class="faq" id="faq" data-fondo="papel" aria-labelledby="titulo-faq">
    <div class="envoltorio">
      <h2 id="titulo-faq">Antes de elegir</h2>
      <div class="faq__lista">
${faq.map(([q, r]) => `        <details class="faq__item"><summary>${esc(q)}</summary><div class="faq__respuesta"><p>${esc(r)}</p></div></details>`).join("\n")}
      </div>
    </div>
  </section>`;

const faqLD = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faq.map(([q, r]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: r } })),
};

const huevosHTML = (() => { try { return seccionHuevos(datos) || ""; } catch (e) { console.warn("huevos.mjs: seccionHuevos falló:", e.message); return ""; } })();
const piezas = {
  "{{OFERTA}}": OFERTA, "{{DESTACADOS}}": DESTACADOS, "{{PANDILLA}}": productos.map((p, i) => tarjeta(p, datos, i)).join("\n"),
  "{{HUEVOS}}": huevosHTML, "{{PACK}}": PACK, "{{DESCUENTOS}}": DESCUENTOS, "{{FAQ}}": FAQ,
};
let inicio = await readFile(new URL("src/paginas/inicio.html", raiz), "utf8");
for (const [k, v] of Object.entries(piezas)) inicio = inicio.replace(k, () => v);
await registrar("index.html", pagina({
  titulo: "Flopi, muñecos impresos en 3D a tu gusto",
  descripcion: "Diseñamos e imprimimos en 3D un muñeco con los colores y el accesorio que elijas.",
  cabezaExtra: `<script type="application/ld+json">${JSON.stringify(faqLD).replace(/</g, "\\u003c")}</script>`,
  cuerpo: inicio,
}));

if (typeof paginaHuevos === "function") {
  await registrar("huevos.html", pagina({
    titulo: "Huevos sorpresa Flopi",
    descripcion: "Abre un huevo sorpresa y descubre qué Flopi sale de dentro. Tú eliges el color del huevo.",
    activo: "huevos",
    cuerpo: paginaHuevos(datos),
  }));
}

// ---- Catálogo ----
await registrar("munecos.html", pagina({
  titulo: "Muñecos Flopi",
  descripcion: "Conoce a la pandilla Flopi: cinco personajes que puedes personalizar con colores y accesorios.",
  activo: "munecos",
  cuerpo: `<section class="portada" data-fondo="papel">
  <div class="envoltorio">
    <ol class="miga"><li><a href="index.html">Inicio</a></li><li>Muñecos</li></ol>
    <h1>La pandilla al completo</h1>
    <p>Elige un personaje y hazlo suyo: color del cuerpo, pelo y accesorio.</p>
  </div>
</section>
<section class="pandilla pandilla--catalogo" data-fondo="papel" aria-label="Personajes">
  <div class="envoltorio"><div class="rejilla">
${productos.map((p, i) => tarjeta(p, datos, i)).join("\n")}
  </div></div>
</section>`,
}));

// ---- Fichas ----
const muestras = (grupo, opciones) => Object.entries(opciones).map(([k, v]) =>
  `<button type="button" class="muestra" style="--muestra:${v.hex || "var(--papel)"}" data-valor="${k}" aria-pressed="false">${esc(v.nombre)}</button>`).join("\n");
const coloresCuerpo = Object.fromEntries(Object.entries(colores).filter(([k]) => k !== "tinta"));
const ICON = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>`,
};

for (const p of productos) {
  const otros = productos.filter((x) => x.slug !== p.slug).slice(0, 4);
  const jsonld = {
    "@context": "https://schema.org", "@type": "Product",
    name: `Flopi ${p.nombre} personalizado`, brand: { "@type": "Brand", name: "Flopi" },
    image: [`${SITIO}assets/img/flopi-${p.slug}.svg`], description: p.descripcion,
    offers: { "@type": "Offer", price: p.precio.toFixed(2), priceCurrency: "EUR",
      availability: "https://schema.org/MadeToOrder", url: `${SITIO}flopi-${p.slug}.html` },
  };
  await registrar(`flopi-${p.slug}.html`, pagina({
    titulo: `Flopi ${p.nombre} personalizado`,
    descripcion: `${p.frase} Muñeco impreso en 3D a tu gusto. ${euros(p.precio)} con IVA.`,
    activo: "munecos",
    fondo: "papel",
    cabezaExtra: `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<script type="module" src="assets/vendor/model-viewer.min.js"></script>`,
    scripts: ["assets/js/ficha.js"],
    cuerpo: `<section class="ficha" data-fondo="papel" style="--fondo-ficha:var(--${p.fondo})">
  <div class="envoltorio">
    <div class="ficha__visor" style="view-transition-name:flopi-${p.slug}">
      <model-viewer id="visor" src="modelos/flopi.glb" poster="assets/img/flopi-${p.slug}.svg"
        alt="Modelo 3D de Flopi ${esc(p.nombre)}. Arrastra para girarlo." loading="eager" reveal="auto"
        camera-controls touch-action="pan-y" auto-rotate auto-rotate-delay="2500" rotation-per-second="16deg"
        interaction-prompt="none" shadow-intensity="1" shadow-softness=".8" exposure="1.05" environment-image="neutral"
        camera-orbit="20deg 78deg auto" min-camera-orbit="auto auto auto" field-of-view="28deg">
        <span slot="progress-bar"></span>
      </model-viewer>
      <span class="visor__ayuda">Arrastra para girarlo</span>
    </div>
    <div class="ficha__panel">
      <div>
        <ol class="miga"><li><a href="index.html">Inicio</a></li><li><a href="munecos.html">Muñecos</a></li><li>${esc(p.nombre)}</li></ol>
        <h1>${esc(p.nombre)}</h1>
      </div>
      <p class="ficha__precio">${euros(p.precio)}<small>IVA incluido</small></p>
      <p class="ficha__frase">${esc(p.descripcion)}</p>
      <form id="form-ficha" class="ficha__form" novalidate>
        <fieldset class="campo"><legend>Color del cuerpo</legend><div class="muestras" data-grupo="color">${muestras("color", coloresCuerpo)}</div></fieldset>
        <fieldset class="campo"><legend>Color del pelo</legend><div class="muestras" data-grupo="pelo">${muestras("pelo", colores)}</div></fieldset>
        <fieldset class="campo"><legend>Accesorio</legend><div class="muestras" data-grupo="accesorio">${muestras("accesorio", accesorios)}</div></fieldset>
        <p><b>Tu elección:</b> <span id="resumen-eleccion"></span></p>
        <div class="hero__acciones"><button type="submit" class="boton">Añadir al carrito</button></div>
        <p class="aviso-maqueta" id="aviso" role="status" aria-live="polite"></p>
      </form>
      <p class="aviso-edad"><b>3+</b> No apto para menores de 3 años: contiene piezas pequeñas. <span class="por-confirmar">por confirmar</span></p>
      <ul class="garantias">
        <li>${ICON.check}<span>Envío gratis desde 35 €.</span></li>
        <li>${ICON.check}<span>Devoluciones: pendiente de confirmar. Si llega con un defecto, lo reponemos. <a href="envios.html">Ver condiciones</a></span></li>
      </ul>
    </div>
  </div>
</section>
<section class="detalles" data-fondo="${p.fondo}" aria-labelledby="titulo-detalles">
  <div class="envoltorio">
    <h2 id="titulo-detalles">Cómo es ${esc(p.nombre)}</h2>
    <dl>
      <dt>Tamaño</dt><dd>18 cm de alto, 11 cm de ancho.</dd>
      <dt>Peso</dt><dd>Unos 120 g.</dd>
      <dt>Material</dt><dd>PLA de origen vegetal, pintado a mano con pintura al agua. <span class="por-confirmar">por confirmar</span></dd>
      <dt>Capas</dt><dd>Unas 900, de 0,2 mm cada una.</dd>
      <dt>Cuidados</dt><dd>Limpiar con un paño húmedo. No meter en el lavavajillas ni dejar al sol.</dd>
    </dl>
  </div>
  <div class="envoltorio">
    <div class="fotos">
      <figure class="foto" style="margin:0"><img src="assets/img/flopi-${p.slug}.svg" alt="" width="560" height="660" loading="lazy"><figcaption>Foto real: de frente</figcaption></figure>
      <figure class="foto" style="margin:0"><img src="assets/img/flopi-${p.slug}.svg" alt="" width="560" height="660" loading="lazy"><figcaption>Foto real: detalle</figcaption></figure>
      <figure class="foto" style="margin:0"><img src="assets/img/flopi-${p.slug}.svg" alt="" width="560" height="660" loading="lazy"><figcaption>Foto real: en una mano</figcaption></figure>
    </div>
  </div>
</section>
<section class="mas" data-fondo="papel" aria-labelledby="titulo-mas">
  <div class="envoltorio">
    <h2 id="titulo-mas">También en la pandilla</h2>
    <div class="mas__fila">${otros.map((x, i) => tarjeta(x, datos, i)).join("\n")}</div>
  </div>
</section>
<script type="application/json" id="datos-ficha">${JSON.stringify({ producto: p, colores, accesorios })}</script>`,
  }));
}

// ---- Carrito ----
await registrar("carrito.html", pagina({
  titulo: "Tu carrito Flopi",
  descripcion: "Revisa los muñecos que has personalizado antes de pagar.",
  activo: "carrito",
  scripts: ["assets/js/pagina-carrito.js"],
  cuerpo: `<section class="portada" data-fondo="papel">
  <div class="envoltorio">
    <ol class="miga"><li><a href="index.html">Inicio</a></li><li>Carrito</li></ol>
    <h1>Tu carrito</h1>
  </div>
</section>
<section class="carrito" data-fondo="papel" aria-label="Muñecos en el carrito">
  <div class="envoltorio">
    <div class="vacio" id="vacio">
      <img src="assets/img/flopi-perdido.svg" alt="" width="560" height="660">
      <p>Todavía no hay ningún Flopi aquí.</p>
      <a class="boton" href="munecos.html">Elegir personaje</a>
    </div>
    <ul class="lineas" id="lineas" hidden></ul>
    <aside class="resumen" id="resumen" hidden aria-label="Resumen del pedido">
      <dl>
        <dt>Subtotal</dt><dd id="subtotal">0,00 €</dd>
        <dt>Envío</dt><dd id="envio">Gratis</dd>
        <dt class="total">Total</dt><dd class="total" id="total">0,00 €</dd>
      </dl>
      <small id="falta"></small>
      <button type="button" class="boton" id="pagar">Ir a pagar</button>
      <small>IVA incluido. Los productos personalizados no admiten desistimiento.</small>
      <p id="aviso-pago" role="status" aria-live="polite"></p>
    </aside>
  </div>
</section>
<script type="application/json" id="datos-carrito">${JSON.stringify({ productos: Object.fromEntries(productos.map((p) => [p.slug, { fondo: p.fondo }])), colores, accesorios })}</script>`,
}));

// ---- Páginas de texto ----
const texto = (archivo, activo, titulo, h1, intro, cuerpo) => registrar(archivo, pagina({
  titulo, descripcion: intro, activo,
  cuerpo: `<section class="portada" data-fondo="papel"><div class="envoltorio">
    <ol class="miga"><li><a href="index.html">Inicio</a></li><li>${esc(h1)}</li></ol>
    <h1>${esc(h1)}</h1><p>${esc(intro)}</p></div></section>
<section class="texto" data-fondo="papel"><div class="envoltorio"><div class="texto__cuerpo">
<p class="borrador">Borrador. Este texto debe revisarlo un profesional antes de publicar la tienda: no es asesoría legal.</p>
${cuerpo}
</div></div></section>`,
}));

await texto("seguridad.html", "seguridad", "Seguridad y materiales de Flopi", "Seguridad y materiales",
  "Qué lleva cada muñeco, para qué edad es y cómo cuidarlo.", `
<h2>Edad recomendada</h2>
<p>Flopi no es apto para menores de 3 años porque contiene piezas pequeñas que podrían desprenderse. Pendiente de decidir si se comercializa como juguete (con marcado CE y ensayos EN 71) o como figura decorativa.</p>
<h2>Materiales</h2>
<ul><li>Cuerpo impreso en PLA, un plástico de origen vegetal.</li><li>Pintura al agua y barniz mate.</li><li>Peana a juego.</li></ul>
<p>Pendiente: fichas de seguridad de cada material y comprobación de migración de elementos (EN 71-3) y REACH.</p>
<h2>Cuidados</h2>
<ul><li>Limpiar con un paño húmedo.</li><li>No dejar al sol ni cerca de fuentes de calor: el PLA se deforma a partir de unos 55 °C.</li><li>Si una pieza se rompe, retirarla del alcance de los niños pequeños.</li></ul>
<h2>Diseños</h2>
<p>Los personajes parten de diseños con licencia comercial. Pendiente: guardar por escrito la licencia de cada diseño de 3dgob y confirmar que permite vender impresiones personalizadas.</p>`);

await texto("envios.html", "envios", "Envíos y devoluciones de Flopi", "Envíos y devoluciones",
  "Cuánto tarda tu Flopi en llegar y qué pasa si algo sale mal.", `
<h2>Plazos</h2>
<p>Fabricamos cada muñeco bajo pedido en 5 días laborables. El envío a península tarda 48 h; a Baleares, Canarias, Ceuta y Melilla, de 4 a 7 días.</p>
<h2>Precio del envío</h2>
<p>4,90 € por pedido. Gratis a partir de 35 €.</p>
<h2>Devoluciones</h2>
<p>Pendiente de confirmar con un profesional: al no llevar nombre grabado y elegirse los colores de un catálogo, lo normal es que se aplique el derecho de desistimiento de 14 días (la excepción del art. 103 c del TRLGDCU es para productos claramente personalizados).</p>
<p>Si llega roto o con un defecto de fabricación, escríbenos con una foto en los 30 días siguientes y lo reponemos sin coste. Se mantiene la garantía legal de conformidad.</p>`);

await texto("aviso-legal.html", "", "Aviso legal de Flopi", "Aviso legal",
  "Datos del titular de la web y condiciones de uso.", `
<h2>Titular</h2>
<p>Pendiente: nombre o razón social, NIF, domicilio, correo de contacto y datos registrales, según la LSSI.</p>
<h2>Condiciones de venta</h2>
<p>Pendiente: condiciones generales de contratación, precios con IVA, formas de pago, plazos y garantías.</p>
<h2>Propiedad intelectual</h2>
<p>Pendiente: titularidad de la marca Flopi y licencias de los diseños de terceros.</p>`);

await texto("privacidad.html", "", "Privacidad en Flopi", "Privacidad",
  "Qué datos pedimos, para qué y cuánto tiempo los guardamos.", `
<h2>Qué datos tratamos</h2>
<ul><li>Datos de envío y contacto de quien compra.</li></ul>
<h2>Cuánto tiempo</h2>
<p>Pendiente: plazos de conservación (por ejemplo, la facturación, el plazo que exija la ley).</p>
<h2>Cookies</h2>
<p>Esta versión de prueba no usa cookies. Guarda en tu navegador el carrito y la paleta elegida (localStorage), que no salen de tu dispositivo.</p>
<h2>Tus derechos</h2>
<p>Pendiente: cómo ejercer acceso, rectificación, supresión y demás derechos del RGPD, y datos del responsable.</p>`);

// ---- 404 ----
await escribir("404.html", pagina({
  titulo: "Página no encontrada en Flopi",
  descripcion: "Esta página no existe.",
  cuerpo: `<section class="perdido" data-fondo="papel"><div class="envoltorio">
  <div class="perdido__texto"><h1>Uy.</h1><p>Esta página se ha perdido. Seguro que está jugando con otro Flopi.</p><a class="boton" href="index.html">Volver al inicio</a></div>
  <img src="assets/img/flopi-perdido.svg" alt="" width="560" height="660">
</div></section>`,
}));

// ---- SEO ----
await writeFile(new URL("sitemap.xml", dist), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paginas.map((p) => `  <url><loc>${SITIO}${p === "index.html" ? "" : p}</loc></url>`).join("\n")}
</urlset>
`);
await writeFile(new URL("robots.txt", dist), `User-agent: *\nAllow: /\nSitemap: ${SITIO}sitemap.xml\n`);
await writeFile(new URL(".nojekyll", dist), "");

console.log(`dist/ listo: ${paginas.length} páginas + 404`);
