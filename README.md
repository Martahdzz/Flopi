# Flopi

Muñecos personalizados impresos en 3D. Los miran los peques; los compran sus padres.

**Web publicada:** https://martahdzz.github.io/Flopi/ (requiere activar Pages: *Settings → Pages → Source: GitHub Actions*).

## Estructura

```
.claude/skills/        Skills de Claude Code del proyecto
  flopy-diseno-web/    Dirección visual, composición y checklist «¿parece IA?»
  flopy-animaciones/   Coreografía de scroll, revelados, parallax, rebotes, View Transitions
  flopy-tienda-3d/     Visor 3D, personalizador, checkout, SEO y avisos legales a confirmar
src/
  datos/productos.json Personajes, precios, colores y accesorios (editar aquí)
  plantilla.mjs        Cabecera, pie y estructura común de las páginas
  flopi-svg.mjs        Ilustración SVG del muñeco (provisional hasta tener fotos)
  paginas/inicio.html  Secciones de la portada
public/                CSS, JS y el modelo 3D (se copian tal cual)
scripts/
  build.mjs            Genera la web estática en dist/
  generar-modelo.mjs   Genera el GLB provisional del muñeco
maqueta/               Primera maqueta (referencia)
```

## Comandos

```bash
npm install          # una vez
npm run dev          # construye y sirve en http://localhost:4321
npm run build        # solo construye dist/
npm run modelo       # regenera public/modelos/flopi.glb (muñeco provisional)
npm run convertir -- modelos-3dgob/dino.3mf dino --color "#9ED9C0"   # STL/3MF → public/modelos/dino.glb
```

Cada push a `main` publica la web automáticamente (`.github/workflows/pages.yml`).

## Modelos de 3DGOB

Los diseños se consiguen con el Patreon de 3DGOB (https://www.patreon.com/3DGOB), que incluye licencia comercial, o en su tienda de MyMiniFactory.

- Guarda los originales (STL/3MF) en `modelos-3dgob/`: esa carpeta y cualquier `.stl`/`.3mf` están en `.gitignore` porque son de pago y este repo es público.
- `npm run convertir -- <archivo> <slug>` genera `public/modelos/<slug>.glb` optimizado (≤ 2 MB), centrado, en metros y con un material por pieza: la mayor se llama `Cuerpo` (la que cambia de color en la ficha).
- Antes de publicar un GLB, confirma que la licencia permite mostrar el modelo 3D en la web; si no, usa solo fotos o renders.
- Son figuras flexi articuladas con piezas pequeñas: no aptas para menores de 3 años.

## Pendiente

- Sustituir el GLB y las ilustraciones por los modelos de 3dgob (convertidos a GLB) y fotos reales.
- Conectar el checkout (recomendado: Shopify con line item properties).
- Revisar con un profesional los textos marcados como «por confirmar» y las páginas legales.
- Elegir paleta definitiva (botón flotante: Pastel, Juguete, Bosque).

Librerías: GSAP 3.15 (licencia estándar gratuita de GSAP), Lenis (MIT), model-viewer (Apache-2.0), glTF Transform (MIT).
