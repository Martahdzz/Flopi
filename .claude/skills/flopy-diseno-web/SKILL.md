---
name: flopy-diseno-web
description: Úsala siempre que diseñes, maquetes, reestiles o revises cualquier página o componente visual de la web de Flopi, para que tenga una dirección visual propia, composición con ritmo y no parezca hecha con IA.
---

# Flopi · Dirección visual y composición

Flopi vende muñecos personalizados impresos en 3D. Los miran niños pequeños y los compran sus padres.
La web tiene que **dar ganas de tocarla** (juguetona, táctil, con sorpresa) y a la vez **inspirar confianza** a un adulto que va a pagar.
Esta skill trata del **oficio visual**: composición, ritmo, imagen, color, tipografía y acabado. El movimiento está en `flopy-animaciones`; el producto 3D y la tienda, en `flopy-tienda-3d`.

---

## 1. Proceso obligatorio (4 pasos)

1. **Plan de tokens antes de código.** Escribe en 6–10 líneas:
   - Paleta: 4–5 colores con nombre propio (no "primary/secondary") y su hex.
   - Tipos: 1 display + 1 de texto, con su papel.
   - Layout: una frase + un wireframe ASCII por sección.
   - El *momento firma* de la página (lo único que alguien recordaría).
2. **Test del espejo.** Pregúntate: «¿Si pido una tienda de juguetes cualquiera, saldría esto mismo?». Si sí, cambia al menos una decisión (composición, tipo o color) y di cuál y por qué.
3. **Construir** siguiendo el plan revisado.
4. **Autocrítica con capturas** a 390, 768 y 1440 px. Arregla lo que veas en un solo lote y vuelve a mirar una vez. Antes de dar por terminado: «quítate un accesorio» (Chanel): elimina un adorno que no aporte.

---

## 2. Composición: cómo se construye una página que se recuerda

**Escala dramática.** Un titular enorme (≥ 9vw en escritorio) junto a texto pequeño y corto crea tensión. Evita que todo tenga tamaños parecidos.

**Asimetría con intención.** Rompe la columna central: el muñeco desborda su caja, el texto se alinea a un lado, una imagen invade el margen. Usa una rejilla de 12 columnas y coloca piezas en tramos impares (2–7, 6–12…).

```css
.fila { display:grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap: var(--gap); }
.fila__texto  { grid-column: 2 / 7; align-self: end; }
.fila__imagen { grid-column: 6 / 13; margin-top: -12vh; } /* solape con la sección anterior */
```

**Ritmo vertical.** Alterna secciones *densas* (galería, opciones) con secciones de *aire* (una frase, un muñeco solo). Nunca dos secciones seguidas con la misma estructura. Cambia también la altura: unas de 100svh, otras de 60svh, una pinned de 250svh.

**Solapes y profundidad.** Las piezas se pisan entre secciones (márgenes negativos, `z-index` con criterio). Planos de profundidad: fondo (formas grandes y suaves), medio (producto) y frente (detalles pequeños que se mueven más en parallax).

**Formas orgánicas, no cajas.** Recortes con blobs SVG o `border-radius` asimétrico; trazo irregular "dibujado a mano".

```css
.blob { border-radius: 62% 38% 46% 54% / 55% 44% 56% 45%; }
.recorte { mask-image: url("blob.svg"); mask-size: contain; mask-repeat: no-repeat; }
```

```html
<!-- Trazo irregular a mano: una línea con feTurbulence + feDisplacementMap -->
<svg viewBox="0 0 400 40" aria-hidden="true">
  <filter id="mano"><feTurbulence baseFrequency=".04" numOctaves="2" seed="3"/>
    <feDisplacementMap in="SourceGraphic" scale="4"/></filter>
  <path d="M5 20 Q100 5 200 20 T395 20" fill="none" stroke="currentColor"
        stroke-width="4" stroke-linecap="round" filter="url(#mano)"/>
</svg>
```

**Textura con presupuesto** (adaptado de hallmark `texture.md`, MIT): una sola familia de textura por página; grano ≤ 0,08 de opacidad en toda la página y ≤ 0,05 bajo texto; nunca animado; `pointer-events:none`.

```css
.grano::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:var(--grano,.07);
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 9 -4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");}
```

**Motivo propio de Flopi: las capas de impresión.** Líneas horizontales finas y regulares (como las capas de una impresora 3D) usadas como textura de fondos, divisores y sombreado de ilustraciones. Es nuestro "grano" de marca.

```css
.capas { background: repeating-linear-gradient(0deg, transparent 0 5px, color-mix(in oklab, currentColor 10%, transparent) 5px 6px); }
```

---

## 3. Imagen: el producto manda

- El muñeco se muestra **grande**, ocupando la mayor parte de su marco, nunca pequeño dentro de una caja gris.
- **Una vista distinta en cada sección** (frente, detalle de la cara, en la mano de un niño, en la estantería). Nunca la misma foto dos veces.
- Tratamiento coherente: mismo fondo, misma luz y mismo recorte en todas las fotos de producto.
- Reserva siempre el espacio para evitar saltos de maquetación (CLS 0):

```html
<img src="flopi-800.avif" srcset="flopi-400.avif 400w, flopi-800.avif 800w, flopi-1600.avif 1600w"
     sizes="(min-width: 64rem) 50vw, 100vw" width="800" height="1000" alt="Flopi astronauta con el nombre Lucía"
     loading="lazy" decoding="async" style="aspect-ratio: 4/5; object-fit: cover">
```
- La imagen del hero (LCP) lleva `fetchpriority="high"` y **no** `loading="lazy"`.
- Ilustraciones: SVG propio con trazo irregular, nunca iconos de stock ni emojis.

---

## 4. Color como sistema intercambiable

Todos los colores se declaran como tokens en `:root`. **Ningún color literal fuera del bloque de tokens.** Así se cambia la paleta entera con un atributo:

```css
:root, :root[data-paleta="pastel"] {
  --papel:#FBF6EE; --tinta:#2B2A33; --chicle:#F4B8C5; --menta:#B9E4D2; --limon:#F6E3A1;
}
:root[data-paleta="juguete"] {
  --papel:#FFF8EC; --tinta:#1F1D2B; --chicle:#FF6B6B; --menta:#2EC4B6; --limon:#FFC43D;
}
body { background: var(--papel); color: var(--tinta); }
```

- Usa `oklch()` / `color-mix(in oklab, …)` para derivar tonos (hover, fondos suaves) en lugar de inventar más hex.
- **Contraste WCAG AA**: texto normal ≥ 4,5:1 y texto grande ≥ 3:1. Los pasteles casi nunca sirven para texto: úsalos de fondo y el texto en `--tinta`.
- Cambiar el color de fondo entre secciones es una herramienta de ritmo muy potente (ver `flopy-animaciones`, receta 10).

---

## 5. Tipografía con personalidad

- **1 display + 1 de texto.** Display redondeada o con carácter para titulares; de texto muy legible para todo lo demás.
  - Display (elige una por proyecto): *Bricolage Grotesque*, *Fredoka*, *Baloo 2*, *Gluten*, *Chillax* (Fontshare), *Clash Display* (Fontshare).
  - Texto: *Nunito Sans*, *Figtree*, *Atkinson Hyperlegible*, *Satoshi* (Fontshare).
  - **Nunca** Inter, Roboto ni Arial como única fuente.
- Escala fluida con `clamp()` y pasos claros:

```css
:root{
  --t-mega: clamp(3.2rem, 11vw, 10rem);  /* un titular por página */
  --t-1: clamp(2.2rem, 5vw, 4rem);
  --t-2: clamp(1.4rem, 2.6vw, 2rem);
  --t-texto: clamp(1rem, .95rem + .3vw, 1.15rem);
}
h1 { font: 700 var(--t-mega)/.9 var(--f-display); letter-spacing: -.02em; text-wrap: balance; }
p  { max-width: 60ch; text-wrap: pretty; }
```
- Cuerpo ≥ 16 px, interlineado 1,5–1,6 y líneas de menos de 70 caracteres.
- La tipografía es parte del dibujo: un titular puede recortarse, solaparse con el muñeco o seguir una curva (`<textPath>`), pero **solo uno por página**.

---

## 6. Usable para padres (sin perder la gracia)

- Botones y zonas táctiles de **mínimo 48×48 px**, separados ≥ 8 px.
- `:focus-visible` muy visible en todos los elementos interactivos (anillo grueso con color de la paleta).
- Textos cortos: titular ≤ 7 palabras y frase de apoyo ≤ 15 palabras.
- Un solo estilo de botón principal en toda la web.
- **Bloque de confianza** visible antes del carrito: precio final con IVA, plazo de fabricación y envío, edad recomendada y advertencias, materiales, devoluciones y contacto real.
- Tematiza también lo que "no se dibuja": `::selection`, `caret-color`, `accent-color`, scrollbar y subrayados (`text-underline-offset`).

```css
:focus-visible { outline: 3px solid var(--tinta); outline-offset: 3px; border-radius: 12px; }
::selection { background: var(--limon); color: var(--tinta); }
```

---

## 7. Prohibido (delata "hecho con IA")

- Degradados morado→azul, texto con degradado y glassmorphism decorativo.
- Emojis como iconos, iconos genéricos de stock y "puntos de estado" decorativos.
- Grid de 3 tarjetas idénticas (icono + título + texto) y tarjetas dentro de tarjetas.
- "Hero centrado + subtítulo + 2 botones + 3 features".
- Etiquetas en MAYÚSCULAS espaciadas encima de cada titular (*eyebrows*), numeraciones 01/02/03 que no son una secuencia real, separadores "A · B · C" y flechas "→" pegadas a cada enlace.
- Una sola palabra en cursiva o de otro color dentro del titular.
- La misma sombra gris suave y el mismo `border-radius` en todo.
- Fondo crema #F4F1EA + serif + acento terracota (el "look Claude"), o negro + verde ácido.
- Testimonios, cifras, logos o urgencias inventados ("¡solo quedan 2!").

---

## 8. Checklist «¿parece IA?» (pásalo en cada página)

- [ ] ¿Hay un *momento firma* claro y solo uno?
- [ ] ¿El test del espejo da una página distinta a la de "cualquier juguetería"?
- [ ] ¿Hay al menos una pieza que rompe la rejilla (desborde, solape, recorte)?
- [ ] ¿Las secciones tienen estructuras y alturas distintas entre sí?
- [ ] ¿El muñeco se ve grande y con una vista distinta en cada sección?
- [ ] ¿Todos los colores salen de tokens? ¿Cambiar `data-paleta` repinta toda la página?
- [ ] ¿Contraste AA comprobado en todos los textos?
- [ ] ¿Dos familias tipográficas como máximo, sin Inter?
- [ ] ¿Cero emojis como icono, cero degradados morados, cero glass decorativo?
- [ ] ¿Cero eyebrows en mayúsculas, cero "01/02/03" decorativos?
- [ ] ¿Las tarjetas no son todas iguales (tamaño, proporción, posición)?
- [ ] ¿Hay textura o trazo hecho a mano (grano, capas, línea irregular) con presupuesto?
- [ ] ¿Botones ≥ 48 px y `:focus-visible` visible?
- [ ] ¿Precio, envío, edad y devoluciones están a la vista sin buscar?
- [ ] ¿Sin datos inventados (cifras, reseñas, urgencias)?
- [ ] ¿Funciona a 390 px sin scroll horizontal (`overflow-x: clip` en html y body)?
- [ ] ¿Imágenes con `width/height` o `aspect-ratio` (sin saltos)?
- [ ] ¿Selección, scrollbar y focus tematizados?
- [ ] ¿Has quitado "un accesorio" al final?

---

## Fuentes y licencias

Ideas y fragmentos adaptados (reescritos en español) de:
- **anthropics/skills · frontend-design** — Apache-2.0 — proceso plan → revisión anti-genérico → construir → autocrítica, rasgos visuales típicos de IA. https://github.com/anthropics/skills/tree/main/skills/frontend-design
- **pbakaus/impeccable** — Apache-2.0 — lista de bans de `craft-floor.md`, tematizar las superficies del navegador. https://github.com/pbakaus/impeccable
- **Nutlope/hallmark** — MIT, © 2026 Hallmark contributors — presupuesto de textura y snippet de grano (`references/texture.md`), reglas de "The Floor". https://github.com/Nutlope/hallmark
- **Leonxlnx/taste-skill** — MIT, © 2026 Leonxlnx — "el producto grande, una vista distinta por sección". https://github.com/Leonxlnx/taste-skill
- **Ferousco-dev/anti-slop-design** — MIT — lista de descartes automáticos y prohibición de la urgencia falsa. https://github.com/Ferousco-dev/anti-slop-design

Los fragmentos copiados son cortos y están modificados; las licencias MIT y Apache-2.0 lo permiten citando la fuente, como se hace aquí.
