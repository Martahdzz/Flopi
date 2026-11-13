---
name: flopy-animaciones
description: Úsala siempre que añadas o revises movimiento en la web de Flopi (animaciones al hacer scroll, revelado de imágenes, parallax, transiciones entre páginas, rebotes y microinteracciones) para que se sienta armónico, juguetón y fluido a 60 fps.
---

# Flopi · Coreografía de scroll y movimiento

El objetivo: que al bajar por la web **las cosas aparezcan con armonía**, como si la página se fuera montando ante ti, y que los elementos interactivos **respondan como juguetes** (se aprietan, rebotan, te siguen). Sin marear, sin tapar el texto y sin tirones.

---

## 1. Principios (lo que distingue una web "Awwwards" de una plantilla)

1. **Un momento firma por página.** Una secuencia trabajada (p. ej. el muñeco que se imprime capa a capa) vale más que veinte efectos sueltos. Especifícalo siempre así:
   `disparador · duración/rango de scroll · qué se mueve · versión móvil · versión reduced-motion`.
2. **Armonía = misma familia de movimiento.** Toda la página usa 2–3 easings y 3 duraciones. Los *staggers* suman ≤ 500 ms en total. Lo que entra junto se mueve en la misma dirección.
3. **Frequency gate** (de design-motion-principles): cuanto más se repite una acción, menos se anima.
   | Frecuencia | Movimiento |
   |---|---|
   | Rara (primera visita, pedido confirmado) | Expresivo, con rebote y sorpresa |
   | Ocasional (abrir galería, cambiar color) | Suave y rápido (200–400 ms) |
   | Constante (hover, escribir el nombre) | Mínimo o instantáneo |
4. **Movimiento para niños = pulido + juego** (lentes Jakub Krehel + Jhey Tompkins). En vitrina y personalizador hay juego; en carrito y checkout, sobriedad (compran los padres).
5. **El contenido existe sin animación.** El CSS base muestra el estado final; la animación es una capa encima. Si falla el JS o hay reduced-motion, la página está completa.

---

## 2. Reglas técnicas (no negociables)

- Anima solo **`transform`, `opacity` y `clip-path`** (y `filter: blur()` acotado y puntual). Nunca `width`, `height`, `top`, `left` ni `margin`.
- `will-change` solo durante la animación, nunca en una clase global.
- **60 fps en un móvil medio.** Si baja de 50, simplifica. Pausa lo que esté fuera de pantalla.
- **Nunca** muevas texto de lectura con parallax ni con scrub. Lo que se mueve con el scroll son imágenes, formas y titulares de exposición.
- **Sin scroll-jacking**: el usuario controla la velocidad. Las secciones *pinned* duran como máximo ~2,5 pantallas.
- **Presupuesto JS** (gzip): CSS nativo primero (0 KB) · GSAP core ~24 KB + ScrollTrigger ~18 KB · Lenis ~4 KB. Nada de librerías extra para algo que el CSS ya hace.
- **`prefers-reduced-motion`** siempre. Reducir no es apagar: el movimiento espacial pasa a un fundido de 150 ms y el feedback de estado se mantiene.

```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{ animation-duration:.01ms!important; animation-iteration-count:1!important;
    transition-duration:.15s!important; scroll-behavior:auto!important; }
}
```

### Duraciones y easings de Flopi

| Uso | Duración | Easing |
|---|---|---|
| Feedback (pulsar, hover) | 100–150 ms | `--ease-salida` |
| Cambio de estado (color, pestaña) | 200–300 ms | `--ease-salida` |
| Revelado de imagen / sección | 600–900 ms | `--ease-cine` |
| Entrada del hero (total) | ≤ 1,4 s | timeline mezclando ambos |
| Rebote juguete (CTA, mascota) | 500–700 ms | `--ease-muelle` |

```css
:root{
  --ease-salida: cubic-bezier(.16,1,.3,1);          /* llegada segura */
  --ease-cine:   cubic-bezier(.77,0,.175,1);         /* revelados con clip-path */
  --ease-muelle: linear(0, .5 7%, 1.1 18%, .95 30%, 1.02 45%, 1);  /* rebote en CSS puro */
}
```
Las salidas duran ~70 % de lo que dura la entrada. El rebote (`--ease-muelle`, `back.out`, `elastic.out`) solo se usa en **el botón principal y el muñeco mascota**: en ningún sitio más.

---

## 3. Base técnica: qué herramienta usar

| Necesitas | Usa |
|---|---|
| Algo aparece al entrar en pantalla | CSS `animation-timeline: view()` (+ fallback) |
| Efecto ligado al scroll sin pin | CSS `view()` / `scroll()` |
| Sección fijada (pin) con pasos, timelines complejos | GSAP + ScrollTrigger |
| Scroll suave tipo "mantequilla" | Lenis (solo con puntero fino) |
| Transición entre páginas | View Transitions API |
| Seguir al cursor, físicas | `gsap.quickTo` |

**Carga recomendada** (versiones fijas):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.27/dist/lenis.min.js" defer></script>
```

**Arranque estándar** (todo el JS de movimiento dentro de `gsap.matchMedia`, que lo revierte solo):
```js
gsap.registerPlugin(ScrollTrigger);
const mm = gsap.matchMedia();
mm.add({ movimiento: "(prefers-reduced-motion: no-preference)",
         escritorio: "(min-width: 48rem)", fino: "(pointer: fine)" }, (ctx) => {
  const { movimiento, escritorio, fino } = ctx.conditions;
  if (!movimiento) return;          // la página ya está completa en CSS
  heroEntrada(); galeria(); if (escritorio) capaACapa(); if (fino) seguirCursor();
});
```

---

## 4. Recetas listas para usar

### R1 · Entrada del hero por capas
El muñeco se monta pieza a pieza y el titular sube por líneas recortadas.
```js
function heroEntrada(){
  gsap.timeline({ defaults:{ duration:.8, ease:"power3.out" } })
    .from(".hero__linea > span", { yPercent:110, stagger:.08 })          // cada línea en su máscara overflow:clip
    .from(".flopi__cuerpo",  { y:60, scaleY:.6, transformOrigin:"50% 100%", ease:"back.out(1.6)" }, "-=.5")
    .from(".flopi__cabeza",  { y:-80, autoAlpha:0, ease:"back.out(2)" }, "-=.45")
    .from(".flopi__extra",   { scale:0.4, rotate:-20, autoAlpha:0, ease:"elastic.out(1,.5)" }, "-=.3")
    .from(".hero__cta",      { y:16, autoAlpha:0 }, "-=.6");
}
```
```css
.hero__linea { display:block; overflow:clip; } .hero__linea > span { display:inline-block; }
```

### R2 · Revelado de imágenes con clip-path (la "cortina")
La imagen se descubre de abajo arriba mientras la foto interior se asienta (escala 1,15 → 1). Es el efecto más "editorial" y armónico.
```css
.revela { overflow:clip; }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .revela      { animation: cortina linear both; animation-timeline: view(); animation-range: entry 0% cover 35%; }
    .revela > img{ animation: asentar linear both; animation-timeline: view(); animation-range: entry 0% cover 50%; }
  }
}
@keyframes cortina { from { clip-path: inset(100% 0 0 0 round 24px); } to { clip-path: inset(0 0 0 0 round 24px); } }
@keyframes asentar { from { transform: scale(1.15); } to { transform: scale(1); } }
```
`linear` es correcto aquí: con scroll, el easing lo pone el dedo. Declara `animation-timeline` **después** del shorthand `animation`.
Variantes: `circle(0% at 50% 100%) → circle(75%)` (burbuja), `inset(0 50% 0 50%)` (se abre desde el centro).

### R3 · Stagger armónico de la galería (fallback universal con GSAP)
```js
function galeria(){
  gsap.set(".tarjeta", { y:60, autoAlpha:0 });
  ScrollTrigger.batch(".tarjeta", {
    start: "top 85%",
    onEnter: (lote) => gsap.to(lote, { y:0, autoAlpha:1, duration:.8, ease:"power3.out",
                                       stagger:{ each:.09, from:"start" }, overwrite:true }),
  });
}
```
Para que se sienta armónico y no "lista que cae": tarjetas de **tamaños distintos**, cada columna con una velocidad de parallax ligeramente distinta (R4) y el stagger siguiendo el orden de lectura.

### R4 · Parallax por capas de profundidad
Tres planos: fondo lento, producto medio y detalles rápidos. Solo en formas e imágenes, nunca en texto.
```js
gsap.utils.toArray("[data-profundidad]").forEach((el) => {
  const p = parseFloat(el.dataset.profundidad);          // -0.3 fondo · 0.15 medio · 0.4 frente
  gsap.to(el, { yPercent: p * -100, ease:"none",
    scrollTrigger:{ trigger: el.closest("section"), start:"top bottom", end:"bottom top", scrub: true } });
});
```
Versión CSS pura: `animation: flotar linear both; animation-timeline: view();` con `@keyframes flotar { from{translate:0 40px} to{translate:0 -40px} }`.

### R5 · Sección pinned "capa a capa" (momento firma de Flopi)
La sección se fija y, al bajar, el muñeco se "imprime" de abajo arriba con una línea de boquilla que sube; los pasos de texto se iluminan uno a uno.
```js
function capaACapa(){
  const tl = gsap.timeline({ scrollTrigger:{ trigger:".capas", start:"top top", end:"+=200%",
                                             pin:".capas__pin", scrub:.6 } });
  tl.fromTo(".capas__flopi", { clipPath:"inset(100% 0 0 0)" }, { clipPath:"inset(0% 0 0 0)", ease:"none" })
    .fromTo(".capas__boquilla", { yPercent:0 }, { yPercent:-100, ease:"none" }, 0)
    .to(".capas__paso", { opacity:1, stagger:.33, ease:"none" }, 0);
}
```
Versión sin JS (hallmark): pista alta con `view-timeline: --capas block` y cada paso con su `animation-range: contain X% contain Y%`. En móvil: sin pin; los pasos se apilan y la imagen usa R2.

### R6 · Titular que se dibuja al hacer scroll
Un solo titular de exposición a media página (nunca el h1 del hero):
```css
@supports (animation-timeline: view()) { @media (prefers-reduced-motion: no-preference) {
  .titular-scroll { animation: barrido linear both; animation-timeline: view(); animation-range: entry 20% cover 45%; }
}}
@keyframes barrido { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
```

### R7 · Muñeco que sigue al cursor
Solo con puntero fino; los ojos o el muñeco entero siguen al ratón con retardo suave.
```js
function seguirCursor(){
  const ojos = document.querySelectorAll(".flopi__pupila");
  const xTo = [...ojos].map(o => gsap.quickTo(o, "x", { duration:.4, ease:"power3" }));
  const yTo = [...ojos].map(o => gsap.quickTo(o, "y", { duration:.4, ease:"power3" }));
  addEventListener("pointermove", (e) => {
    const dx = (e.clientX / innerWidth - .5) * 8, dy = (e.clientY / innerHeight - .5) * 8;
    xTo.forEach(f => f(dx)); yTo.forEach(f => f(dy));
  });
}
```

### R8 · Botón que rebota (squash & stretch)
CSS puro, con el easing de muelle:
```css
.boton { transition: transform .5s var(--ease-muelle); }
.boton:hover  { transform: translateY(-2px) scale(1.03); }
.boton:active { transform: scale(1.06, .9); transition-duration: .09s; }   /* se aplasta */
```
Nunca animes desde `scale(0)`: empieza en 0,4–0,9 para que se sienta físico.

### R9 · Transición de la lista a la ficha (View Transitions)
Entre documentos (MPA), el muñeco "vuela" de la tarjeta a la ficha:
```css
@view-transition { navigation: auto; }
.tarjeta__img[data-id="astro"], .ficha__img { view-transition-name: flopi-astro; }  /* nombre único por producto */
::view-transition-group(*) { animation-duration: .5s; animation-timing-function: var(--ease-salida); }
@media (prefers-reduced-motion: reduce){ ::view-transition-group(*){ animation: none; } }
```
En SPA: `document.startViewTransition?.(() => pintarFicha(id)) ?? pintarFicha(id);`

### R10 · El fondo cambia de color entre secciones
Da ritmo sin mover nada. Cada sección declara su color y el body lo toma al entrar:
```js
gsap.utils.toArray("[data-fondo]").forEach((s) => ScrollTrigger.create({
  trigger: s, start: "top 55%", end: "bottom 55%",
  onToggle: (self) => self.isActive && gsap.to("body", { backgroundColor: getComputedStyle(s).getPropertyValue("--fondo"), duration:.6, overwrite:"auto" }),
}));
```

### Scroll suave con Lenis + ScrollTrigger
```js
if (matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
  const lenis = new Lenis({ lerp: .1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
```
En móvil, el scroll nativo es mejor: no lo sustituyas.

---

## 5. Anti-patrones (delatan plantilla o IA)

- Fade-up idéntico en todas las secciones y hover en todas las tarjetas.
- Stagger en cada bloque de la página. El stagger es para listas reales.
- Varias secciones pinned seguidas, scroll-jacking y snap obligatorio.
- Parallax sobre párrafos y textos que se mueven mientras lees.
- Rebote o elastic en todo; marquees infinitos sin pausa; cursores personalizados que ocultan el nativo.
- Preloader de más de 2 s; sonido en autoplay.
- Animaciones que esconden contenido hasta que el JS carga (`opacity:0` en el CSS base).

## 6. Verificación antes de dar por bueno

- [ ] Grabación de rendimiento en DevTools con CPU ×4: sin frames rojos largos.
- [ ] Con `prefers-reduced-motion: reduce` la página está completa y se entiende.
- [ ] Con JS desactivado se ve todo el contenido.
- [ ] Móvil a 390 px: sin pin roto, sin scroll horizontal, nada se mueve bajo el dedo de forma rara.
- [ ] Hay un único momento firma y está especificado.
- [ ] Todos los easings salen de los 3 tokens.

---

## Fuentes y licencias

Adaptado y reescrito en español a partir de:
- **greensock/gsap-skills** — MIT, © 2026 GreenSock — `ScrollTrigger.batch`, `quickTo`, `gsap.matchMedia`, reglas de rendimiento. https://github.com/greensock/gsap-skills
- **Nutlope/hallmark** — MIT, © 2026 Hallmark contributors — `references/scroll-choreography.md` (pin con `view-timeline`, titular con barrido de clip-path, orden de `animation-timeline`, `linear` en scrub), duraciones de `craft.md`. https://github.com/Nutlope/hallmark
- **kylezantos/design-motion-principles** — MIT, © 2026 Kyle Zantos — frequency gate, lentes Emil/Jakub/Jhey, revelado con clip-path, `linear()` para rebote, "no animar desde scale(0)". https://github.com/kylezantos/design-motion-principles
- **pbakaus/impeccable** — Apache-2.0 — tabla de duraciones, tesis de movimiento y reduced-motion "reducir, no apagar" (`reference/animate.md`). https://github.com/pbakaus/impeccable
- **SandroHub013/awwwards-skill** — MIT, © Alessandro Boni — "un momento firma" especificado, preloader ≤ 2 s, sin sonido en autoplay. https://github.com/SandroHub013/awwwards-skill
- Integración Lenis + ScrollTrigger según la documentación oficial de Lenis (MIT): https://github.com/darkroomengineering/lenis
