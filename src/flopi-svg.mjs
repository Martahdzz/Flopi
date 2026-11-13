// Ilustración SVG del muñeco Flopi. Se usa como imagen de catálogo y como póster del visor 3D
// mientras no haya fotos reales. Colores en hex (son colores de filamento, no de la web).

const PARTES = {
  gorro: (c) => `<path d="M56 58 Q120 -10 184 58 Z" fill="${c}" stroke="#2E2A3A" stroke-width="4" stroke-linejoin="round"/>
    <rect x="40" y="52" width="160" height="16" rx="8" fill="${c}" stroke="#2E2A3A" stroke-width="4"/>
    <circle cx="120" cy="34" r="9" fill="#F7DC7A" stroke="#2E2A3A" stroke-width="3"/>`,
  corona: (c) => `<path d="M86 40 L90 6 L106 26 L120 0 L134 26 L150 6 L154 40 Z" fill="${c}" stroke="#2E2A3A" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="120" cy="30" r="5" fill="#F4A6BC"/>`,
  casco: () => `<circle cx="120" cy="98" r="86" fill="#fff" fill-opacity=".28" stroke="#2E2A3A" stroke-width="5"/>
    <path d="M74 44 Q96 28 118 30" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
    <circle cx="120" cy="8" r="9" fill="#F4A6BC" stroke="#2E2A3A" stroke-width="4"/>`,
  crestas: (c) => `<path d="M78 40 L92 8 L104 34 L120 2 L134 32 L150 8 L160 40 Z" fill="${c}" stroke="#2E2A3A" stroke-width="4" stroke-linejoin="round"/>`,
  orejas: (c) => `<path d="M60 64 L58 8 L104 36 Z M180 64 L182 8 L136 36 Z" fill="${c}" stroke="#2E2A3A" stroke-width="4" stroke-linejoin="round"/>
    <path d="M68 46 L67 22 L88 36 Z M172 46 L173 22 L152 36 Z" fill="#F4A6BC"/>`,
};

export function flopiSVG({ cuerpo, pelo, accesorio, colorAccesorio, nombre = "", fondo = null, id = "f" }) {
  const extra = PARTES[accesorio] ? PARTES[accesorio](colorAccesorio) : "";
  const textoNombre = nombre
    ? `<text x="120" y="277" text-anchor="middle" font-family="Bricolage Grotesque, Trebuchet MS, sans-serif" font-weight="800" font-size="17" fill="#FFF8F1">${nombre.toUpperCase()}</text>`
    : "";
  const fondoRect = fondo ? `<rect x="-40" y="-50" width="320" height="380" fill="${fondo}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -30 280 330" width="560" height="660">
  <defs>
    <pattern id="${id}-capas" width="8" height="6" patternUnits="userSpaceOnUse"><rect width="8" height="1.2" y="4.8" fill="#000" fill-opacity=".08"/></pattern>
    <clipPath id="${id}-sil"><circle cx="120" cy="98" r="72"/><path d="M58 260 C50 196 72 150 120 150 C168 150 190 196 182 260 Z"/><ellipse cx="58" cy="208" rx="15" ry="27" transform="rotate(18 58 208)"/><ellipse cx="182" cy="208" rx="15" ry="27" transform="rotate(-18 182 208)"/></clipPath>
  </defs>
  ${fondoRect}
  <ellipse cx="120" cy="290" rx="78" ry="8" fill="#2E2A3A" fill-opacity=".14"/>
  <rect x="44" y="256" width="152" height="30" rx="15" fill="#2E2A3A"/>
  ${textoNombre}
  <ellipse cx="58" cy="208" rx="15" ry="27" transform="rotate(18 58 208)" fill="${cuerpo}"/>
  <ellipse cx="182" cy="208" rx="15" ry="27" transform="rotate(-18 182 208)" fill="${cuerpo}"/>
  <path d="M58 260 C50 196 72 150 120 150 C168 150 190 196 182 260 Z" fill="${cuerpo}"/>
  <ellipse cx="120" cy="214" rx="30" ry="26" fill="#fff" fill-opacity=".35"/>
  <circle cx="120" cy="98" r="72" fill="#FFE3CF"/>
  <path d="M62 78 C70 30 120 14 160 34 C176 42 186 58 186 74 C168 58 150 54 132 62 C120 44 92 46 62 78 Z" fill="${pelo}"/>
  <ellipse cx="94" cy="104" rx="13" ry="15" fill="#fff"/><ellipse cx="146" cy="104" rx="13" ry="15" fill="#fff"/>
  <circle cx="95" cy="106" r="7.5" fill="#2E2A3A"/><circle cx="147" cy="106" r="7.5" fill="#2E2A3A"/>
  <circle cx="98" cy="102" r="2.4" fill="#fff"/><circle cx="150" cy="102" r="2.4" fill="#fff"/>
  <circle cx="76" cy="128" r="10" fill="#F4A6BC" fill-opacity=".8"/><circle cx="164" cy="128" r="10" fill="#F4A6BC" fill-opacity=".8"/>
  <path d="M108 132 Q120 144 132 132" fill="none" stroke="#2E2A3A" stroke-width="4" stroke-linecap="round"/>
  <rect x="20" y="20" width="200" height="245" fill="url(#${id}-capas)" clip-path="url(#${id}-sil)"/>
  ${extra}
</svg>`;
}

// Huevo sorpresa: dos mitades impresas que encajan, con la línea de rotura en zigzag a media altura.
// Las mitades son grupos (<g class="huevo__arriba"> y <g class="huevo__abajo">) para poder animarlas por separado.
// El relleno usa la variable CSS --huevo-color (si existe) y, si no, el hex recibido.
const HUEVO_FORMA = "M100 10 C152 10 188 92 188 152 C188 208 150 242 100 242 C50 242 12 208 12 152 C12 92 48 10 100 10 Z";
const HUEVO_ZIGZAG = Array.from({ length: 13 }, (_, i) => `${-20 + i * 20},${i % 2 ? 128 : 144}`).join(" ");

export function huevoSVG({ color = "#F4A6BC", id = "h" }) {
  const relleno = `style="fill:var(--huevo-color, ${color})"`;
  const zig = HUEVO_ZIGZAG;
  const borde = `<path d="${HUEVO_FORMA}" fill="none" stroke="#2E2A3A" stroke-width="5"/><polyline points="${zig}" fill="none" stroke="#2E2A3A" stroke-width="7" stroke-linejoin="round" clip-path="url(#${id}-forma)"/>`;
  const capas = `<rect x="0" y="0" width="200" height="250" fill="url(#${id}-capas)" clip-path="url(#${id}-forma)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 252" width="200" height="252" class="huevo__svg" aria-hidden="true" focusable="false">
  <defs>
    <pattern id="${id}-capas" width="8" height="5" patternUnits="userSpaceOnUse"><rect width="8" height="1.1" y="3.9" fill="#000" fill-opacity=".09"/></pattern>
    <clipPath id="${id}-forma"><path d="${HUEVO_FORMA}"/></clipPath>
    <clipPath id="${id}-cortearriba"><polygon points="-30,-60 230,-60 230,144 ${zig.split(" ").reverse().join(" ")}"/></clipPath>
    <clipPath id="${id}-corteabajo"><polygon points="${zig} 230,144 230,300 -30,300 -30,144"/></clipPath>
  </defs>
  <ellipse class="huevo__sombra" cx="100" cy="245" rx="70" ry="6" fill="#2E2A3A" fill-opacity=".16"/>
  <g class="huevo__abajo">
    <g clip-path="url(#${id}-corteabajo)">
      <path d="${HUEVO_FORMA}" ${relleno}/>
      ${capas}
      <path d="M150 168 C152 204 132 228 100 232 C140 236 176 210 178 166 Z" fill="#2E2A3A" fill-opacity=".1"/>
      <polyline points="${zig}" fill="none" stroke="#2E2A3A" stroke-opacity=".14" stroke-width="14" stroke-linejoin="round" transform="translate(0 5)" clip-path="url(#${id}-forma)"/>
      <circle cx="52" cy="186" r="7" fill="#fff" fill-opacity=".5"/><circle cx="128" cy="206" r="9" fill="#fff" fill-opacity=".5"/><circle cx="160" cy="176" r="5" fill="#fff" fill-opacity=".5"/>
      ${borde}
    </g>
  </g>
  <g class="huevo__arriba">
    <g clip-path="url(#${id}-cortearriba)">
      <path d="${HUEVO_FORMA}" ${relleno}/>
      ${capas}
      <path d="M150 52 C172 82 184 114 186 140 L160 140 C160 108 156 80 150 52 Z" fill="#2E2A3A" fill-opacity=".08"/>
      <path d="M56 92 Q62 56 88 36" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="9" stroke-linecap="round"/>
      <circle cx="120" cy="64" r="8" fill="#fff" fill-opacity=".5"/><circle cx="80" cy="112" r="6" fill="#fff" fill-opacity=".5"/><circle cx="146" cy="104" r="5" fill="#fff" fill-opacity=".5"/>
      ${borde}
    </g>
  </g>
</svg>`;
}
