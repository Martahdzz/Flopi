// Regalos: un Flopi (o varios) en caja con lazo, listo para regalar en un cumpleaños,
// y bolsitas con un Flopi para los invitados de la fiesta.
// Recorrido de la página: ¿para qué es? → caja → color del lazo → tarjeta → al carrito.
// Exporta seccionRegalos(datos) para la portada y paginaRegalos(datos) para regalos.html.
import { euros, esc } from "../plantilla.mjs";

// PRECIOS DE EJEMPLO: pendientes de confirmar antes de vender.
// "ocasion": regalo (para el cumpleañero) o invitados (detalles para la fiesta).
const CAJAS = [
  { slug: "caja-uno", ocasion: "regalo", nombre: "Caja Uno", flopis: 1, precio: 12.9, texto: "Un Flopi en su caja con lazo y una tarjeta escrita a mano.", asoma: ["caballo"] },
  { slug: "caja-trio", ocasion: "regalo", nombre: "Caja Trío", flopis: 3, precio: 29.9, texto: "Tres Flopis distintos para empezar su pandilla.", asoma: ["tortuga", "caballo", "flamenco"], destacada: true },
  { slug: "caja-pandilla", ocasion: "regalo", nombre: "Caja Pandilla", flopis: 5, precio: 44.9, texto: "Cinco Flopis en una caja grande. El regalo que se juega toda la tarde.", asoma: ["tortuga", "caballo", "flamenco"] },
  { slug: "bolsitas-10", ocasion: "invitados", nombre: "10 bolsitas", flopis: 10, precio: 39.9, texto: "Una bolsita con un Flopi sorpresa para cada invitado. Ninguno repetido en la misma bolsa de 10.", asoma: [], bolsita: true },
  { slug: "bolsitas-20", ocasion: "invitados", nombre: "20 bolsitas", flopis: 20, precio: 74.9, texto: "Para clases enteras: veinte bolsitas con su Flopi sorpresa.", asoma: [], bolsita: true, destacada: true },
];
const LAZOS = [
  { valor: "chicle", nombre: "Rosa" },
  { valor: "menta", nombre: "Verde" },
  { valor: "limon", nombre: "Amarillo" },
  { valor: "cielo", nombre: "Azul" },
];
const MAX_TARJETA = 120;
const PRECIO_EJEMPLO = `<span class="por-confirmar">Precios de ejemplo</span>`;

/* Caja de regalo dibujada. Los colores van por variables CSS para que el lazo cambie al elegirlo. */
export function cajaSVG({ id = "c", bolsita = false } = {}) {
  const t = `stroke="var(--tinta)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  if (bolsita) {
    return `<svg class="caja-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
  <ellipse cx="100" cy="186" rx="62" ry="8" fill="var(--tinta)" opacity=".12"/>
  <path d="M52 84 C46 120 44 156 50 180 L150 180 C156 156 154 120 148 84 Z" fill="var(--papel)" ${t}/>
  <path d="M60 84 C66 70 80 62 100 62 C120 62 134 70 140 84" fill="none" ${t}/>
  <path d="M72 84 L128 84" fill="none" stroke="var(--lazo, var(--chicle))" stroke-width="12" stroke-linecap="round"/>
  <path d="M100 84 C84 64 72 70 80 86 C86 96 98 90 100 84 C102 90 114 96 120 86 C128 70 116 64 100 84 Z" fill="var(--lazo, var(--chicle))" ${t}/>
  <circle cx="100" cy="128" r="16" fill="var(--lazo, var(--chicle))" opacity=".5"/>
  <text x="100" y="135" text-anchor="middle" font-family="var(--f-display)" font-weight="800" font-size="22" fill="var(--tinta)">?</text>
</svg>`;
  }
  return `<svg class="caja-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
  <ellipse cx="100" cy="188" rx="76" ry="8" fill="var(--tinta)" opacity=".12"/>
  <rect x="34" y="96" width="132" height="86" rx="10" fill="var(--papel)" ${t}/>
  <rect x="88" y="96" width="24" height="86" fill="var(--lazo, var(--chicle))" ${t}/>
  <g class="caja-svg__tapa">
    <rect x="26" y="72" width="148" height="30" rx="9" fill="var(--papel)" ${t}/>
    <rect x="88" y="72" width="24" height="30" fill="var(--lazo, var(--chicle))" ${t}/>
    <path d="M100 72 C76 40 52 52 66 70 C74 80 92 76 100 72 C108 76 126 80 134 70 C148 52 124 40 100 72 Z" fill="var(--lazo, var(--chicle))" ${t}/>
  </g>
</svg>`;
}

// Ranura donde asoma un Flopi real cuando hay fotos del catálogo (la rellena regalos.js).
const asoma = (c) => `<span class="regalo__asoma" data-asoma="${esc(c.asoma.join(","))}" aria-hidden="true"></span>`;

/* ---------------- Portada ---------------- */
export function seccionRegalos() {
  const tres = CAJAS.filter((c) => c.ocasion === "regalo");
  const lazos = ["chicle", "menta", "cielo"];
  return `<section class="regalos-portada" id="regalos" data-fondo="menta" aria-labelledby="titulo-regalos">
  <div class="envoltorio">
    <div class="regalos-portada__texto">
      <h2 id="titulo-regalos">¿Tiene un cumpleaños?</h2>
      <p>Te lo mandamos en su caja con lazo y una tarjeta escrita a mano, listo para abrir.</p>
      <p class="regalos-portada__desde">Desde <strong>${euros(Math.min(...tres.map((c) => c.precio)))}</strong> ${PRECIO_EJEMPLO}</p>
      <a class="boton" href="regalos.html">Ver regalos</a>
    </div>
    <ul class="regalos-portada__cajas" role="list">
      ${tres.map((c, i) => `<li class="regalos-portada__caja" style="--lazo:var(--${lazos[i]});--i:${i}">
        <a href="regalos.html#${c.slug}" aria-label="${esc(c.nombre)}, ${euros(c.precio)}">
          <span class="regalo__dibujo">${asoma(c)}${cajaSVG({ id: `rp-${i}` })}</span>
          <span class="regalos-portada__nombre">${esc(c.nombre)}</span>
          <span class="regalos-portada__precio">${euros(c.precio)}</span>
        </a>
      </li>`).join("")}
    </ul>
  </div>
</section>`;
}

/* ---------------- Página ---------------- */
function tarjetaCaja(c, i) {
  const n = c.bolsita ? `${c.flopis} Flopis, uno por bolsita` : c.flopis === 1 ? "1 Flopi" : `${c.flopis} Flopis`;
  return `<li class="regalo" data-ocasion="${c.ocasion}"${c.ocasion !== "regalo" ? " hidden" : ""}>
    <label class="regalo__opcion" id="${c.slug}">
      <input type="radio" name="caja" value="${c.slug}" data-nombre="${esc(c.nombre)}" data-precio="${c.precio}" data-flopis="${c.flopis}" data-bolsita="${c.bolsita ? 1 : 0}"${i === 1 ? " checked" : ""}>
      ${c.destacada ? `<span class="regalo__sello">La más pedida</span>` : ""}
      <span class="regalo__dibujo">${asoma(c)}${cajaSVG({ id: `rg-${i}`, bolsita: c.bolsita })}</span>
      <span class="regalo__nombre">${esc(c.nombre)}</span>
      <span class="regalo__incluye">${n}</span>
      <span class="regalo__texto">${esc(c.texto)}</span>
      <span class="regalo__precio">${euros(c.precio)}${c.bolsita ? ` <small>${euros(c.precio / c.flopis)} cada una</small>` : ""}</span>
    </label>
  </li>`;
}

export function paginaRegalos() {
  return `<section class="portada regalos-cabeza" data-fondo="papel">
  <div class="envoltorio">
    <ol class="miga"><li><a href="index.html">Inicio</a></li><li>Regalos</li></ol>
    <h1>Regalos</h1>
    <p>Para el cumpleañero, una caja con lazo. Para los invitados de la fiesta, bolsitas con un Flopi sorpresa. Lo preparamos todo en el taller y llega listo para regalar.</p>
  </div>
</section>

<section class="regalos" data-fondo="papel" aria-label="Preparar un regalo">
  <div class="envoltorio">
    <form class="regalos__form" id="form-regalo" novalidate>
      <fieldset class="rpaso">
        <legend><span class="rpaso__n">1</span>¿Para qué es?</legend>
        <div class="rpaso__chips" role="radiogroup">
          <label class="chip"><input type="radio" name="ocasion" value="regalo" checked><span>Regalo de cumpleaños</span></label>
          <label class="chip"><input type="radio" name="ocasion" value="invitados"><span>Detalles para los invitados</span></label>
        </div>
      </fieldset>

      <fieldset class="rpaso">
        <legend><span class="rpaso__n">2</span>Elige la caja ${PRECIO_EJEMPLO}</legend>
        <ul class="regalos__lista" role="list">
          ${CAJAS.map(tarjetaCaja).join("\n")}
        </ul>
        <p class="rpaso__nota">Los Flopis los elige el taller: es parte de la sorpresa. Si prefieres escogerlos tú, <a href="munecos.html#pandilla">crea una pandilla</a>.</p>
      </fieldset>

      <fieldset class="rpaso">
        <legend><span class="rpaso__n">3</span>Color del lazo</legend>
        <div class="puntos puntos--lazo">
          ${LAZOS.map((l, i) => `<label class="punto" style="--c:var(--${l.valor})" title="${l.nombre}"><input type="radio" name="lazo" value="${l.valor}" data-nombre="${l.nombre}"${i === 0 ? " checked" : ""}><span class="sr">${l.nombre}</span></label>`).join("")}
          <span class="puntos__nombre" id="lazo-nombre">${LAZOS[0].nombre}</span>
        </div>
      </fieldset>

      <fieldset class="rpaso">
        <legend><span class="rpaso__n">4</span>Tarjeta <span class="rpaso__opcional">opcional</span></legend>
        <label class="tarjeta-msg">
          <span class="sr">Mensaje de la tarjeta</span>
          <textarea name="tarjeta" rows="3" maxlength="${MAX_TARJETA}" placeholder="¡Feliz cumpleaños! Que te diviertas mucho con tu pandilla."></textarea>
          <span class="tarjeta-msg__cuenta"><span id="tarjeta-n">0</span>/${MAX_TARJETA}</span>
        </label>
        <p class="rpaso__nota">La escribimos a mano. Si la dejas en blanco, va sin tarjeta.</p>
      </fieldset>

      <div class="regalos__resumen" aria-live="polite">
        <div class="regalos__vista" id="vista-regalo" style="--lazo:var(--chicle)">
          <span class="regalo__dibujo">${asoma(CAJAS[1])}${cajaSVG({ id: "rg-vista" })}</span>
        </div>
        <div>
          <p class="regalos__total"><span id="resumen-nombre">Caja Trío</span> <strong id="resumen-precio">${euros(CAJAS[1].precio)}</strong></p>
          <p class="regalos__detalle" id="resumen-detalle">3 Flopis · lazo rosa</p>
          <button type="submit" class="boton">Añadir al carrito</button>
          <p class="regalos__ok" id="regalo-ok" hidden>Añadido. <a href="carrito.html">Ver carrito</a></p>
        </div>
      </div>

      <p class="regalos__edad"><strong>No apto para menores de 3 años.</strong> Contiene piezas pequeñas que pueden provocar asfixia. <a href="seguridad.html">Seguridad y materiales</a></p>
    </form>
  </div>
</section>`;
}
