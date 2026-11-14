// Comuniones y bodas: mini Flopis (unos 6 cm) como detalle para los invitados, por lotes.
// Sin nombres ni textos grabados: el detalle se adapta solo con los colores del evento.
// Exporta seccionEventos(datos) para la portada y paginaEventos(datos) para eventos.html.
import { euros, esc } from "../plantilla.mjs";

// PRECIOS DE EJEMPLO por tramo de cantidad: pendientes de confirmar antes de vender.
// El precio unitario es el del tramo en el que cae el número de invitados.
const EVENTO = {
  minimo: 10,
  maximo: 300,
  inicial: 50,
  tramos: [
    { desde: 10, hasta: 49, precio: 5.9, ejemplo: 25 },
    { desde: 50, hasta: 99, precio: 4.9, ejemplo: 50 },
    { desde: 100, hasta: 149, precio: 4.4, ejemplo: 100 },
    { desde: 150, hasta: 300, precio: 3.9, ejemplo: 150 },
  ],
  tipos: [
    { valor: "comunion", nombre: "Comunión", colores: ["nube", "cielo"] },
    { valor: "boda", nombre: "Boda", colores: ["nube", "chicle"] },
  ],
  semanas: 4,
};

// Papelería a juego. PRECIOS DE EJEMPLO por unidad, pendientes de confirmar.
// "por": invitado (una unidad por invitado) o mesa (una cada 10 invitados, redondeando arriba).
const PAPELERIA = [
  { valor: "invitacion", nombre: "Invitación", uso: "Sobre y tarjeta para avisar del día, con el mini Flopi en la portada.", precio: 1.6, por: "invitado", giro: -10, y: 30 },
  { valor: "recordatorio", nombre: "Recordatorio de comunión", uso: "La estampa para guardar entre las páginas de un libro.", precio: 0.9, por: "invitado", giro: -4, y: 6 },
  { valor: "agradecimiento", nombre: "Tarjeta de agradecimiento", uso: "Para dar las gracias después, a juego con el detalle.", precio: 0.7, por: "invitado", giro: 2, y: 0 },
  { valor: "minuta", nombre: "Minuta", uso: "El menú del banquete, una en cada sitio de la mesa.", precio: 1.2, por: "invitado", giro: 7, y: 12 },
  { valor: "mesero", nombre: "Mesero", uso: "El número de cada mesa, de pie sobre su soporte.", precio: 2.5, por: "mesa", giro: 12, y: 36 },
];
const POR_MESA = 10;
const unidadPapel = (p) => (p.por === "mesa" ? "por mesa" : "por invitado");

const tramoDe = (n) => EVENTO.tramos.find((t) => n >= t.desde && n <= t.hasta) || EVENTO.tramos[EVENTO.tramos.length - 1];
const precioMinimo = Math.min(...EVENTO.tramos.map((t) => t.precio));
const POR_CONFIRMAR = (txt = "Por confirmar") => `<span class="por-confirmar">${txt}</span>`;
const hex = (datos, clave, otro = "#F1EEE8") => datos.colores[clave]?.hex || otro;

/* ---------------- Dibujo: mini Flopi simplificado ----------------
   Coordenadas locales: (0,0) es el centro de la peana; mide unas 118 unidades de alto.
   El grupo exterior coloca y escala; el interior (.ev-mini__salto) es el que salta.
   Los rellenos van en style para poder usar variables CSS (vista previa del calculador). */
function miniFlopi({ x, y, s = 1, giro = 0, cuerpo, pelo, tinta, extra = [], colorExtra, colorFlores, i = 0, clase = "" }) {
  const f = (c) => `style="fill:${c}"`;
  const trazo = `stroke="${tinta}" stroke-width="3" stroke-linejoin="round"`;
  const piezas = {
    velo: `<path class="ev-velo" d="M-22 -106 C-44 -78 -50 -34 -42 0 L14 0 C-2 -36 0 -86 18 -110 Z" ${f(colorExtra)} fill-opacity=".9" ${trazo}/>`,
    flores: `<g ${trazo}><circle cx="-16" cy="-112" r="5.5" ${f(colorFlores || colorExtra)}/><circle cx="-3" cy="-117" r="5.5" ${f(colorFlores || colorExtra)}/><circle cx="11" cy="-115" r="5.5" ${f(colorFlores || colorExtra)}/></g>`,
    lazo: `<g class="ev-acc ev-acc--comunion" ${trazo}><path d="M14 -110 L0 -122 L1 -100 Z M14 -110 L28 -122 L27 -100 Z" ${f(colorExtra)}/><circle cx="14" cy="-110" r="4.5" ${f(colorExtra)}/></g>`,
    pajarita: `<g class="ev-acc ev-acc--boda" ${trazo}><path d="M0 -52 L-15 -61 L-15 -43 Z M0 -52 L15 -61 L15 -43 Z" ${f(colorExtra)}/><circle cx="0" cy="-52" r="4.5" ${f(colorExtra)}/></g>`,
  };
  const detras = extra.includes("velo") ? piezas.velo : "";
  const delante = extra.filter((e) => e !== "velo").map((e) => piezas[e] || "").join("");
  return `<g class="ev-mini ${clase}" transform="translate(${x} ${y}) rotate(${giro}) scale(${s})" style="--i:${i}">
    <g class="ev-mini__salto">
      <ellipse cx="0" cy="4" rx="34" ry="4" fill="${tinta}" fill-opacity=".14"/>
      <rect x="-30" y="-8" width="60" height="12" rx="6" fill="${tinta}"/>
      ${detras}
      <path d="M-28 -6 C-33 -38 -20 -60 0 -60 C20 -60 33 -38 28 -6 Z" ${f(cuerpo)} ${trazo}/>
      <circle cx="0" cy="-84" r="30" fill="#FFE3CF" ${trazo}/>
      <path d="M-28 -90 C-24 -118 20 -122 29 -94 C18 -102 6 -103 -2 -97 C-10 -105 -20 -102 -28 -90 Z" ${f(pelo)} ${trazo}/>
      <circle cx="-10" cy="-80" r="4" fill="${tinta}"/><circle cx="11" cy="-80" r="4" fill="${tinta}"/>
      <circle cx="-19" cy="-70" r="4.5" fill="#F4A6BC" fill-opacity=".8"/><circle cx="20" cy="-70" r="4.5" fill="#F4A6BC" fill-opacity=".8"/>
      <path d="M-5 -68 Q0 -63 5 -68" fill="none" stroke="${tinta}" stroke-width="2.5" stroke-linecap="round"/>
      ${delante}
    </g>
  </g>`;
}

// Escena 1 · Comunión: fila de mini Flopis bajo un arco de flores con un lazo en lo alto.
function escenaComunion(datos, etiqueta) {
  const tinta = hex(datos, "tinta", "#2E2A3A");
  const fila = [
    { x: 112, s: .64, cuerpo: "cielo", pelo: "tinta", extra: "limon", giro: -5 },
    { x: 176, s: .74, cuerpo: "nube", pelo: "limon", extra: "chicle", giro: 2 },
    { x: 240, s: .82, cuerpo: "menta", pelo: "tinta", extra: "cielo", giro: 0 },
    { x: 304, s: .7, cuerpo: "chicle", pelo: "tinta", extra: "nube", giro: -2 },
    { x: 368, s: .62, cuerpo: "limon", pelo: "tinta", extra: "menta", giro: 6 },
  ];
  const minis = fila.map((m, i) => miniFlopi({
    x: m.x, y: 268, s: m.s, giro: m.giro, i, tinta,
    cuerpo: hex(datos, m.cuerpo), pelo: hex(datos, m.pelo), colorExtra: hex(datos, m.extra), extra: ["lazo"],
  })).join("");
  return `<svg class="ev-escena__svg" viewBox="0 0 480 300" role="img" aria-label="${esc(etiqueta)}">
  <path class="ev-suelo" d="M18 272 Q120 264 240 271 T462 268" fill="none" stroke-width="4" stroke-linecap="round"/>
  <path class="ev-arco" d="M62 272 C58 64 422 64 418 272" fill="none" stroke-width="14" stroke-linecap="round"/>
  <path class="ev-arco-flores" d="M62 272 C58 64 422 64 418 272" fill="none" stroke-width="13" stroke-linecap="round" stroke-dasharray="0 22"/>
  <g class="ev-lazo-grande" stroke="${tinta}" stroke-width="3.5" stroke-linejoin="round">
    <path d="M240 112 L212 94 L214 130 Z M240 112 L268 94 L266 130 Z"/>
    <path d="M236 116 L224 150 M244 116 L256 150" fill="none" stroke-linecap="round" stroke-width="5"/>
    <circle cx="240" cy="112" r="8"/>
  </g>
  ${minis}
</svg>`;
}

// Escena 2 · Boda: dos Flopis juntos, uno con velo y flores, otro con pajarita, y un banderín encima.
function escenaBoda(datos, etiqueta) {
  const tinta = hex(datos, "tinta", "#2E2A3A");
  const banderines = [52, 92, 132, 172, 212, 252].map((x, i) => {
    const y = 46 + Math.sin((x - 20) / 280 * Math.PI) * 30;
    return `<path class="ev-banderin ev-banderin--${i % 3}" d="M${x - 11} ${y.toFixed(1)} L${x + 11} ${(y + 1).toFixed(1)} L${x} ${(y + 22).toFixed(1)} Z" stroke="${tinta}" stroke-width="2.5" stroke-linejoin="round"/>`;
  }).join("");
  return `<svg class="ev-escena__svg" viewBox="0 0 320 320" role="img" aria-label="${esc(etiqueta)}">
  <path class="ev-cordel" d="M20 44 Q160 104 300 44" fill="none" stroke-width="2.5"/>
  ${banderines}
  <path class="ev-corazon" d="M160 150 C150 138 134 146 140 160 C144 168 160 176 160 176 C160 176 176 168 180 160 C186 146 170 138 160 150 Z" stroke="${tinta}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="160" cy="294" rx="128" ry="7" fill="${tinta}" fill-opacity=".1"/>
  ${miniFlopi({ x: 112, y: 290, s: 1.12, giro: -5, i: 0, tinta, cuerpo: hex(datos, "nube"), pelo: hex(datos, "limon"), colorExtra: hex(datos, "nube"), colorFlores: hex(datos, "chicle"), extra: ["velo", "flores"] })}
  ${miniFlopi({ x: 210, y: 290, s: 1.18, giro: 5, i: 1, tinta, cuerpo: hex(datos, "cielo"), pelo: hex(datos, "tinta"), colorExtra: tinta, extra: ["pajarita"] })}
</svg>`;
}

/* ---------------- Papelería: maquetas SVG ----------------
   Cada pieza es un dibujo propio. El texto es solo relleno (barras), porque la web no graba nombres.
   Los colores salen de tokens (clases en eventos.css y var() en los rellenos del mini Flopi). */
const barra = (x, y, w, h = 6) => `<rect class="ev-p-barra" x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/>`;
const barras = (cx, y0, anchos, paso = 13, h = 6) => anchos.map((w, i) => barra(cx - w / 2, y0 + i * paso, w, i === 0 ? h + 2 : h)).join("");

function papelInvitacion(tinta) {
  return `<svg class="ev-carta__svg" viewBox="0 0 220 220" aria-hidden="true" focusable="false">
    <g transform="rotate(-9 110 150)">
      <rect class="ev-p-sobre" x="16" y="96" width="176" height="112" rx="8"/>
      <path class="ev-p-solapa" d="M16 100 L104 158 L192 100" stroke-linejoin="round"/>
    </g>
    <g transform="rotate(4 118 104)">
      <rect class="ev-p-papel" x="58" y="14" width="120" height="176" rx="10"/>
      <rect class="ev-p-filete" x="66" y="22" width="104" height="160" rx="6"/>
      <circle class="ev-p-mancha ev-p-mancha--cielo" cx="118" cy="72" r="36"/>
      ${miniFlopi({ x: 118, y: 106, s: .62, tinta, cuerpo: "var(--cielo)", pelo: "var(--tinta)", colorExtra: "var(--chicle)", extra: ["lazo"] })}
      ${barras(118, 124, [70, 52, 62, 40])}
    </g>
  </svg>`;
}

function papelRecordatorio(tinta) {
  const ramita = [[64, 196], [72, 190], [80, 196], [88, 190], [96, 196]].map(([x, y], i) =>
    `<circle class="ev-p-flor ev-p-flor--${i % 2}" cx="${x}" cy="${y}" r="4.5"/>`).join("");
  return `<svg class="ev-carta__svg" viewBox="0 0 160 230" aria-hidden="true" focusable="false">
    <path class="ev-p-papel" d="M20 66 Q20 12 80 12 Q140 12 140 66 L140 216 L20 216 Z" stroke-linejoin="round"/>
    <path class="ev-p-filete" d="M29 68 Q29 22 80 22 Q131 22 131 68 L131 207 L29 207 Z"/>
    <path class="ev-p-mancha ev-p-mancha--limon" d="M80 34 Q118 34 118 74 Q118 118 80 120 Q42 118 42 74 Q42 34 80 34 Z"/>
    ${miniFlopi({ x: 80, y: 124, s: .66, tinta, cuerpo: "var(--chicle)", pelo: "var(--limon)", colorExtra: "var(--cielo)", extra: ["lazo"] })}
    ${barras(80, 144, [72, 56, 64])}
    <path class="ev-p-rama" d="M58 196 Q80 182 102 196" fill="none"/>
    ${ramita}
  </svg>`;
}

function papelAgradecimiento(tinta) {
  return `<svg class="ev-carta__svg" viewBox="0 0 220 190" aria-hidden="true" focusable="false">
    <path class="ev-p-pliegue" d="M24 46 L38 20 L182 20 L196 46 Z" stroke-linejoin="round"/>
    <rect class="ev-p-papel" x="24" y="46" width="172" height="128" rx="8"/>
    <path class="ev-p-mancha ev-p-mancha--menta" d="M34 168 Q30 100 68 92 Q108 88 110 168 Z"/>
    ${miniFlopi({ x: 70, y: 160, s: .7, tinta, cuerpo: "var(--menta)", pelo: "var(--tinta)", colorExtra: tinta, extra: ["pajarita"] })}
    <path class="ev-p-corazon" d="M150 80 C144 72 132 76 135 86 C137 92 150 100 150 100 C150 100 163 92 165 86 C168 76 156 72 150 80 Z" stroke-linejoin="round"/>
    ${barras(150, 112, [56, 44, 50, 30], 12)}
  </svg>`;
}

function papelMinuta(tinta) {
  const grupo = (y) => barras(75, y, [44, 70, 58], 11, 5);
  return `<svg class="ev-carta__svg" viewBox="0 0 150 250" aria-hidden="true" focusable="false">
    <rect class="ev-p-papel" x="16" y="8" width="118" height="232" rx="8"/>
    <rect class="ev-p-filete" x="24" y="16" width="102" height="216" rx="5"/>
    <circle class="ev-p-mancha ev-p-mancha--chicle" cx="75" cy="56" r="28"/>
    ${miniFlopi({ x: 75, y: 80, s: .5, tinta, cuerpo: "var(--limon)", pelo: "var(--tinta)", colorExtra: "var(--chicle)", extra: ["lazo"] })}
    <path class="ev-p-rama" d="M40 96 Q58 90 75 96 T110 96" fill="none"/>
    ${grupo(110)}
    <circle class="ev-p-punto" cx="75" cy="152" r="2.5"/>
    ${grupo(162)}
    <circle class="ev-p-punto" cx="75" cy="204" r="2.5"/>
    ${barra(55, 212, 40, 5)}
  </svg>`;
}

function papelMesero(tinta) {
  return `<svg class="ev-carta__svg" viewBox="0 0 210 230" aria-hidden="true" focusable="false">
    <path class="ev-p-soporte" d="M44 204 Q100 192 156 204 L150 216 Q100 208 50 216 Z" stroke-linejoin="round"/>
    <path class="ev-p-varilla" d="M100 200 L100 140" fill="none"/>
    <circle class="ev-p-papel" cx="100" cy="88" r="62"/>
    <circle class="ev-p-filete" cx="100" cy="88" r="53"/>
    <path class="ev-p-numero" d="M80 62 Q98 44 116 58 Q126 76 102 86 Q128 92 120 112 Q104 132 78 116" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="ev-p-pinza" d="M92 142 L108 142 L106 152 L94 152 Z" stroke-linejoin="round"/>
    ${miniFlopi({ x: 172, y: 206, s: .52, tinta, cuerpo: "var(--cielo)", pelo: "var(--limon)", colorExtra: "var(--chicle)", extra: ["lazo"] })}
  </svg>`;
}

const DIBUJO_PAPEL = { invitacion: papelInvitacion, recordatorio: papelRecordatorio, agradecimiento: papelAgradecimiento, minuta: papelMinuta, mesero: papelMesero };

// Mini composición para la portada: tres cartas pequeñas en abanico.
function papelitosPortada(tinta) {
  const carta = (x, giro, clase, i) => `<g transform="translate(${x} 62) rotate(${giro})">
      <rect class="ev-p-papel" x="-22" y="-52" width="44" height="62" rx="5"/>
      <circle class="ev-p-mancha ev-p-mancha--${clase}" cx="0" cy="-32" r="12"/>
      <circle cx="0" cy="-32" r="8" fill="#FFE3CF" stroke="${tinta}" stroke-width="1.6"/>
      <path d="M-8 -34 C-7 -43 7 -44 8 -35 C3 -38 -3 -38 -8 -34 Z" style="fill:var(--tinta)"/>
      ${barra(-14, -14, 28, 4)}${barra(-10, -6 + (i % 2), 20, 3)}
    </g>`;
  return `<svg class="eventos__papelitos" viewBox="0 0 132 76" aria-hidden="true" focusable="false">
    ${carta(30, -12, "cielo", 0)}${carta(66, -2, "chicle", 1)}${carta(102, 10, "menta", 2)}
  </svg>`;
}

/* ---------------- Portada ---------------- */
export function seccionEventos(datos) {
  return `<section class="eventos" id="eventos" data-fondo="cielo" aria-labelledby="titulo-eventos">
  <div class="envoltorio">
    <div class="eventos__texto">
      <h2 id="titulo-eventos">Comuniones y bodas</h2>
      <p class="eventos__frase">Un mini Flopi para cada invitado, en los colores de vuestro día.</p>
      <p class="eventos__precio"><span>desde <strong>${euros(precioMinimo)}</strong> por invitado</span> ${POR_CONFIRMAR("Precio de ejemplo")}</p>
      <a class="boton" href="eventos.html">Pedir presupuesto</a>
      <a class="eventos__papeleria" href="eventos.html#titulo-papeleria">
        ${papelitosPortada(hex(datos, "tinta", "#2E2A3A"))}
        <span>Y papelería a juego: invitaciones, minutas y meseros con el mini Flopi.</span>
      </a>
    </div>
    <figure class="ev-escena ev-escena--comunion ev-revela" data-ev-escena>
      ${escenaComunion(datos, "Cinco mini Flopis de colores en fila, con lazos, bajo un arco de flores")}
      <figcaption>Comunión</figcaption>
    </figure>
    <figure class="ev-escena ev-escena--boda ev-revela" data-ev-escena>
      ${escenaBoda(datos, "Dos Flopis juntos: uno con velo y flores, otro con pajarita, bajo un banderín")}
      <figcaption>Boda</figcaption>
    </figure>
  </div>
</section>`;
}

/* ---------------- Página eventos.html ---------------- */
export function paginaEventos(datos) {
  const tinta = hex(datos, "tinta", "#2E2A3A");
  const tipoInicial = EVENTO.tipos[0];
  const [c1, c2] = tipoInicial.colores;
  const tramoInicial = tramoDe(EVENTO.inicial);
  const totalInicial = EVENTO.inicial * tramoInicial.precio;

  const muestrasTipo = EVENTO.tipos.map((t) =>
    `<button type="button" class="muestra muestra--texto" data-valor="${t.valor}" data-colores="${t.colores.join(" ")}" aria-pressed="${t === tipoInicial}">${esc(t.nombre)}</button>`).join("");

  const muestrasColor = Object.entries(datos.colores).map(([clave, col]) =>
    `<button type="button" class="muestra" data-valor="${esc(clave)}" data-hex="${esc(col.hex)}" data-nombre="${esc(col.nombre)}" aria-pressed="${clave === c1 || clave === c2}" style="--muestra:${esc(col.hex)}">${esc(col.nombre)}</button>`).join("");

  const filas = EVENTO.tramos.map((t) => `
        <tr data-desde="${t.desde}" data-hasta="${t.hasta}"${t === tramoInicial ? " data-activo" : ""}>
          <th scope="row"><span class="ev-tabla__num">${t.ejemplo}</span> uds <small>de ${t.desde} a ${t.hasta}</small></th>
          <td>${euros(t.precio)}</td>
          <td>${euros(t.ejemplo * t.precio)}</td>
        </tr>`).join("");

  const cartas = PAPELERIA.map((p, n) => `
      <li class="ev-carta ev-carta--${p.valor}" style="--n:${n};--giro:${p.giro}deg;--y:${p.y}px;--z:${3 - Math.abs(2 - n)}">
        <figure class="ev-carta__dibujo">
          ${DIBUJO_PAPEL[p.valor](tinta)}
        </figure>
        <div class="ev-carta__ficha">
          <h3>${esc(p.nombre)}</h3>
          <p>${esc(p.uso)}</p>
          <p class="ev-carta__precio">desde <strong>${euros(p.precio)}</strong> la unidad${p.por === "mesa" ? " (una por mesa)" : ""} ${POR_CONFIRMAR("Precio de ejemplo")}</p>
          <a class="ev-carta__enlace" href="#ev-pap-${p.valor}" data-ev-papel="${p.valor}">Añadir al presupuesto<span class="ev-sr"> de ${esc(p.nombre).toLowerCase()}</span></a>
        </div>
      </li>`).join("");

  const opcionesPapel = PAPELERIA.map((p) => `
          <label class="ev-papel-op" for="ev-pap-${p.valor}">
            <input type="checkbox" id="ev-pap-${p.valor}" name="papeleria" value="${p.valor}" data-precio="${p.precio}" data-por="${p.por}" data-nombre="${esc(p.nombre)}">
            <span class="ev-papel-op__nombre">${esc(p.nombre)}</span>
            <span class="ev-papel-op__precio">${euros(p.precio)} ${unidadPapel(p)}</span>
          </label>`).join("");

  const tramosJSON =esc(JSON.stringify(EVENTO.tramos.map(({ desde, hasta, precio }) => ({ desde, hasta, precio }))));

  const vistaPrevia = `<svg class="ev-vista__svg" viewBox="-70 -140 140 152" aria-hidden="true" focusable="false">
      ${miniFlopi({ x: 0, y: 0, s: 1, tinta, cuerpo: `var(--ev-c1, ${hex(datos, c1)})`, pelo: hex(datos, "tinta", "#2E2A3A"), colorExtra: `var(--ev-c2, ${hex(datos, c2)})`, extra: ["lazo", "pajarita"] })}
    </svg>`;

  const incluye = (extra) => `
        <li><span>Un mini Flopi de unos 6 cm ${POR_CONFIRMAR()}</span></li>
        <li>Impreso en los colores del evento: elegís dos de la paleta</li>
        ${extra}
        <li>Tarjeta para el invitado, sin texto personalizado</li>`;

  return `<section class="portada eventos-portada">
  <div class="envoltorio">
    <ol class="miga" aria-label="Estás aquí">
      <li><a href="index.html">Inicio</a></li>
      <li aria-current="page">Comuniones y bodas</li>
    </ol>
    <h1>Un mini Flopi para cada invitado</h1>
    <p>Detalles impresos en 3D para comuniones y bodas, por lotes. Todos iguales, en los dos colores que elijáis. Sin nombres ni fechas grabadas: el detalle habla por sí solo.</p>
  </div>
</section>

<section class="ev-bloques" data-fondo="limon" aria-label="Qué incluye cada detalle">
  <div class="envoltorio">
    <article class="ev-bloque ev-bloque--comunion" aria-labelledby="titulo-ev-comunion">
      <figure class="ev-escena ev-escena--comunion ev-revela" data-ev-escena>
        ${escenaComunion(datos, "Mini Flopis en fila con lazo, bajo un arco de flores")}
      </figure>
      <div class="ev-bloque__texto">
        <h2 id="titulo-ev-comunion">Comuniones</h2>
        <p>Una fila de mini Flopis en la mesa de los regalos, uno por invitado.</p>
        <ul class="ev-incluye">${incluye("<li>Bolsita de tela con cordón</li>")}
        </ul>
      </div>
    </article>
    <article class="ev-bloque ev-bloque--boda" aria-labelledby="titulo-ev-boda">
      <div class="ev-bloque__texto">
        <h2 id="titulo-ev-boda">Bodas</h2>
        <p>Una pareja de Flopis para recordar el día, o uno solo por invitado.</p>
        <ul class="ev-incluye">${incluye("<li>Cajita de cartón con ventana</li>")}
        </ul>
      </div>
      <figure class="ev-escena ev-escena--boda ev-revela" data-ev-escena>
        ${escenaBoda(datos, "Dos Flopis juntos, con velo y con pajarita")}
      </figure>
    </article>
  </div>
</section>

<section class="ev-papeleria" data-fondo="menta" aria-labelledby="titulo-papeleria">
  <div class="envoltorio">
    <div class="ev-papeleria__cabeza">
      <h2 id="titulo-papeleria">Papelería a juego</h2>
      <p>Las mismas caras y los mismos colores que los mini Flopis, del sobre al número de la mesa.</p>
    </div>
    <p class="ev-papeleria__nota">Aquí solo ves el diseño: los textos de cada pieza los acordamos contigo al pedir. ${POR_CONFIRMAR()}</p>
    <ul class="ev-mesa" aria-label="Piezas de papelería">${cartas}
    </ul>
  </div>
</section>

<section class="ev-precios" data-fondo="cielo" aria-labelledby="titulo-ev-precios">
  <div class="envoltorio">
    <div class="ev-precios__cabeza">
      <h2 id="titulo-ev-precios">Cuantos más, mejor precio</h2>
      <p>El precio por unidad baja según el número de invitados. IVA incluido. ${POR_CONFIRMAR("Precios de ejemplo")}</p>
    </div>
    <table class="ev-tabla" id="ev-tabla">
      <caption>Precio por unidad según la cantidad (precios de ejemplo)</caption>
      <thead>
        <tr><th scope="col">Cantidad</th><th scope="col">Por unidad</th><th scope="col">Total</th></tr>
      </thead>
      <tbody>${filas}
      </tbody>
    </table>
  </div>
</section>

<section class="ev-calc" data-fondo="chicle" aria-labelledby="titulo-ev-calc">
  <div class="envoltorio">
    <div class="ev-vista" id="ev-vista" data-tipo="${tipoInicial.valor}" style="--ev-c1:${hex(datos, c1)};--ev-c2:${hex(datos, c2)}" data-ev-escena>
      ${vistaPrevia}
      <p class="ev-vista__pie" id="ev-vista-pie">${esc(tipoInicial.nombre)}, en ${esc(datos.colores[c1].nombre).toLowerCase()} y ${esc(datos.colores[c2].nombre).toLowerCase()}</p>
    </div>
    <form class="ev-calc__panel" id="ev-form" data-tramos="${tramosJSON}" data-min="${EVENTO.minimo}" data-max="${EVENTO.maximo}" data-semanas="${EVENTO.semanas}" novalidate>
      <h2 id="titulo-ev-calc">Calcula tu presupuesto</h2>
      <fieldset class="campo">
        <legend>Tipo de evento</legend>
        <div class="muestras" data-grupo="tipo">${muestrasTipo}</div>
      </fieldset>
      <div class="campo">
        <label for="ev-invitados">Número de invitados <small>(de ${EVENTO.minimo} a ${EVENTO.maximo})</small></label>
        <input class="ev-numero" type="number" id="ev-invitados" name="invitados" min="${EVENTO.minimo}" max="${EVENTO.maximo}" step="1" value="${EVENTO.inicial}" inputmode="numeric" aria-describedby="ev-invitados-ayuda">
        <small class="ev-ayuda" id="ev-invitados-ayuda" aria-live="polite">Para más de ${EVENTO.maximo}, escríbenos.</small>
      </div>
      <fieldset class="campo">
        <legend>Colores del evento <small>(elige 2)</small></legend>
        <div class="muestras" data-grupo="colores">${muestrasColor}</div>
        <small class="ev-ayuda" id="ev-colores-ayuda" aria-live="polite">Elegidos: ${esc(datos.colores[c1].nombre)} y ${esc(datos.colores[c2].nombre)}</small>
      </fieldset>
      <fieldset class="campo ev-papel-campo" data-por-mesa="${POR_MESA}">
        <legend>Papelería <small>(opcional, a juego)</small></legend>
        <div class="ev-papel-opciones">${opcionesPapel}
        </div>
        <small class="ev-ayuda" id="ev-papel-ayuda" aria-live="polite">Los meseros se cuentan por mesas: uno cada ${POR_MESA} invitados (${Math.ceil(EVENTO.inicial / POR_MESA)} mesas).</small>
      </fieldset>
      <div class="ev-estimado">
        <span class="ev-estimado__etiqueta">Precio estimado</span>
        <output class="ev-estimado__total" id="ev-total" for="ev-invitados" aria-live="polite">${euros(totalInicial)}</output>
        <span class="ev-estimado__detalle" id="ev-detalle">${EVENTO.inicial} unidades × ${euros(tramoInicial.precio)}</span>
        ${POR_CONFIRMAR("Precio de ejemplo")}
      </div>
      <button type="submit" class="boton">Solicitar presupuesto</button>
      <div class="ev-resumen" id="ev-resumen" hidden>
        <p class="ev-resumen__aviso"><strong>Aún no está conectado; escríbenos con este resumen.</strong> Por Instagram, a <strong>@flopi.toys</strong>.</p>
        <label class="ev-resumen__etiqueta" for="ev-resumen-texto">Resumen del pedido</label>
        <textarea class="ev-resumen__texto" id="ev-resumen-texto" rows="8" readonly></textarea>
        <button type="button" class="ev-copiar" id="ev-copiar">Copiar resumen</button>
        <p class="aviso-maqueta" id="ev-copiar-estado" aria-live="polite"></p>
      </div>
      <ul class="ev-datos">
        <li>Plazo: pídelo con al menos ${EVENTO.semanas} semanas de antelación. ${POR_CONFIRMAR()}</li>
        <li>Envíos: <a href="envios.html">Envíos y devoluciones</a></li>
      </ul>
      <p class="aviso-edad"><b>+3</b><span>No apto para menores de 3 años: piezas pequeñas. ${POR_CONFIRMAR()}</span></p>
    </form>
  </div>
</section>`;
}
