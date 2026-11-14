// Huevos sorpresa: un huevo impreso en 3D (dos mitades que encajan) con un mini Flopi dentro.
// El comprador elige el color del huevo; el personaje que sale es sorpresa.
// Exporta seccionHuevos(datos) para la portada y paginaHuevos(datos) para huevos.html.
import { flopiSVG, huevoSVG } from "../flopi-svg.mjs";
import { euros, esc } from "../plantilla.mjs";

// Datos del producto. PRECIO DE EJEMPLO: pendiente de confirmar antes de vender.
const HUEVO = {
  slug: "huevo",
  nombre: "Huevo sorpresa",
  precio: 14.9,
  precioDeEjemplo: true,
  colores: ["chicle", "menta", "limon", "cielo"],
  colorInicial: "chicle",
  maxNombre: 12,
};

const hex = (datos, clave) => datos.colores[clave]?.hex || "#F4A6BC";
const PRECIO_EJEMPLO = `<span class="por-confirmar">Precio de ejemplo</span>`;

function miniFlopi(p, datos, id) {
  return flopiSVG({
    cuerpo: hex(datos, p.cuerpo),
    pelo: hex(datos, p.pelo),
    accesorio: p.accesorio,
    colorAccesorio: hex(datos, p.colorAccesorio),
    id,
  });
}

/* ---------------- Portada ---------------- */
export function seccionHuevos(datos) {
  // Tres huevos de colores distintos, a distinto tamaño y altura (composición asimétrica).
  const huevos = [
    { color: "chicle", talla: "grande" },
    { color: "menta", talla: "chico" },
    { color: "cielo", talla: "medio" },
  ];
  const botones = huevos.map((h, i) => `
      <button type="button" class="huevo huevo--${h.talla}" aria-label="Abrir huevo sorpresa" data-huevo style="--i:${i}">
        <span class="huevo__caja">
          <span class="huevo__flopi" data-huevo-flopi></span>
          ${huevoSVG({ color: hex(datos, h.color), id: `hv-portada-${i + 1}` })}
        </span>
      </button>`).join("");

  // La pandilla que puede salir, lista para clonar desde JS (los ids se renombran al clonar).
  const pandilla = datos.productos.map((p) =>
    `<div data-slug="${esc(p.slug)}" data-nombre="${esc(p.nombre)}">${miniFlopi(p, datos, `hv-mini-${p.slug}`)}</div>`).join("");

  return `<section class="huevos" id="huevos" data-fondo="limon" aria-labelledby="titulo-huevos">
  <div class="envoltorio">
    <div class="huevos__texto">
      <h2 id="titulo-huevos">¿Quién saldrá del huevo?</h2>
      <p class="huevos__frase">Eliges el color. El Flopi de dentro es sorpresa.</p>
      <p class="huevos__precio">${euros(HUEVO.precio)} ${PRECIO_EJEMPLO}</p>
      <a class="boton" href="huevos.html">Ver los huevos</a>
    </div>
    <div class="huevos__escena">
      <div class="huevos__fila">${botones}
      </div>
      <div class="huevos__estado">
        <p class="huevos__salido" aria-live="polite" data-huevos-salido></p>
        <button type="button" class="huevos__cerrar" data-huevos-cerrar hidden>Cerrar otra vez</button>
      </div>
    </div>
  </div>
  <template id="huevos-pandilla">${pandilla}</template>
</section>`;
}

/* ---------------- Página huevos.html ---------------- */
export function paginaHuevos(datos) {
  const inicial = HUEVO.colorInicial;
  const muestras = HUEVO.colores.map((c) => {
    const col = datos.colores[c];
    return `<button type="button" class="muestra" data-valor="${c}" data-hex="${col.hex}" aria-pressed="${c === inicial}" style="--muestra:${col.hex}">${esc(col.nombre)}</button>`;
  }).join("");

  const quien = datos.productos.map((p, i) => `
      <li class="quien__flopi" style="--i:${i}">
        <span class="huevo__caja huevo__caja--abierta" style="--huevo-color:${hex(datos, HUEVO.colores[i % HUEVO.colores.length])}">
          <span class="huevo__flopi">${miniFlopi(p, datos, `hv-quien-${p.slug}`)}</span>
          ${huevoSVG({ color: hex(datos, HUEVO.colores[i % HUEVO.colores.length]), id: `hv-quien-huevo-${p.slug}` })}
        </span>
        <span class="quien__nombre">${esc(p.nombre)}</span>
      </li>`).join("");

  return `<section class="portada huevos-portada" data-fondo="papel">
  <div class="envoltorio">
    <ol class="miga" aria-label="Estás aquí">
      <li><a href="index.html">Inicio</a></li>
      <li aria-current="page">Huevos sorpresa</li>
    </ol>
    <h1>Un huevo, un Flopi sorpresa</h1>
    <p>Un huevo impreso en 3D, en dos mitades que encajan. Dentro hay un mini Flopi de la pandilla. Tú eliges el color del huevo; quién sale, lo descubrís al abrirlo.</p>
  </div>
</section>

<section class="huevo-taller" data-fondo="papel" aria-labelledby="titulo-huevo-taller">
  <div class="envoltorio">
    <div class="huevo-taller__vista" id="huevo-vista" style="--huevo-color:${hex(datos, inicial)}">
      <span class="huevo__caja">${huevoSVG({ color: hex(datos, inicial), id: "hv-vista" })}</span>
    </div>
    <form class="huevo-taller__panel" id="huevo-form" data-precio="${HUEVO.precio}" novalidate>
      <h2 id="titulo-huevo-taller">Prepara tu huevo</h2>
      <fieldset class="campo">
        <legend>Color del huevo</legend>
        <div class="muestras" data-grupo="color">${muestras}</div>
      </fieldset>
      <p class="huevo-taller__precio">${euros(HUEVO.precio)} <small>IVA incluido</small> ${PRECIO_EJEMPLO}</p>
      <button type="submit" class="boton">Añadir al carrito (${euros(HUEVO.precio)})</button>
      <p class="aviso-maqueta" id="huevo-aviso" aria-live="polite"></p>
      <ul class="huevo-taller__datos">
        <li>Devoluciones: pendiente de confirmar. Si llega con un defecto, lo reponemos. <a href="envios.html">Envíos y devoluciones</a></li>
      </ul>
      <p class="aviso-edad huevos-aviso"><b>+3</b><span>No apto para menores de 3 años: el huevo y la figura tienen piezas pequeñas. <span class="por-confirmar">Por confirmar</span></span></p>
    </form>
  </div>
</section>

<section class="huevo-pasos" data-fondo="papel" aria-labelledby="titulo-huevo-pasos">
  <div class="envoltorio">
    <h2 id="titulo-huevo-pasos">Cómo funciona</h2>
    <ol class="huevo-pasos__lista">
      <li class="huevo-paso"><h3>Eliges el color</h3><p>El color de las dos mitades del huevo.</p></li>
      <li class="huevo-paso"><h3>Lo imprimimos</h3><p>Imprimimos el huevo y la figura capa a capa en nuestro taller y metemos el Flopi dentro.</p></li>
      <li class="huevo-paso"><h3>Al abrirlo, descubrís quién es</h3><p>Se separan las dos mitades y aparece uno de los cinco personajes de la pandilla.</p></li>
    </ol>
  </div>
</section>

<section class="quien" data-fondo="papel" aria-labelledby="titulo-quien">
  <div class="envoltorio">
    <h2 id="titulo-quien">Puede salir cualquiera</h2>
    <p>El personaje se elige al azar entre los cinco de la pandilla. No se puede escoger: esa es la gracia.</p>
    <ul class="quien__lista">${quien}
    </ul>
  </div>
</section>`;
}
