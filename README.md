# Flopi

Muñecos personalizados impresos en 3D. Los miran los peques; los compran sus padres.

## Qué hay aquí

```
.claude/skills/
  flopy-diseno-web/   Dirección visual: composición, ritmo, imagen, color, tipografía y checklist «¿parece IA?»
  flopy-animaciones/  Coreografía de scroll: revelados con clip-path, parallax, sección fijada, rebotes, View Transitions
  flopy-tienda-3d/    Visor 3D (model-viewer), personalizador, checkout (Shopify vs Stripe), SEO y avisos legales a confirmar
maqueta/
  index.html          Maqueta navegable de la home (HTML + CSS + JS, sin build)
  vendor/             GSAP 3.15.0 + ScrollTrigger (licencia estándar gratuita de GSAP) y Lenis 1.3.27 (MIT)
```

Las skills se cargan solas en Claude Code al trabajar dentro de este repo.

## Ver la maqueta

```bash
cd maqueta && python3 -m http.server 8000
```

Abre http://localhost:8000. El botón flotante de abajo a la izquierda cambia entre tres paletas (Pastel, Juguete y Bosque) para decidir el color.

Todos los precios, plazos y textos de la maqueta son **de ejemplo**. Los avisos marcados «por confirmar» deben revisarse con un profesional.
