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
