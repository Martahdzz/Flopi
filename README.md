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
npm run modelo       # regenera public/modelos/flopi.glb
```

Cada push a `main` publica la web automáticamente (`.github/workflows/pages.yml`).

## Pendiente

- Sustituir el GLB y las ilustraciones por los modelos de 3dgob (convertidos a GLB) y fotos reales.
- Conectar el checkout (recomendado: Shopify con line item properties).
- Revisar con un profesional los textos marcados como «por confirmar» y las páginas legales.
- Elegir paleta definitiva (botón flotante: Pastel, Juguete, Bosque).

Librerías: GSAP 3.15 (licencia estándar gratuita de GSAP), Lenis (MIT), model-viewer (Apache-2.0), glTF Transform (MIT).
