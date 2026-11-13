---
name: flopy-tienda-3d
description: Úsala cuando construyas o revises la parte de tienda de Flopi (visor 3D del muñeco, personalizador, ficha de producto, carrito, checkout, SEO de producto o avisos legales y de seguridad del juguete).
---

# Flopi · Tienda de muñecos impresos en 3D

Cómo se presenta y se vende el producto: que el muñeco se vea espectacular, que personalizarlo sea un juego y que el padre o la madre pague con confianza.
El aspecto visual sigue `flopy-diseno-web` y el movimiento sigue `flopy-animaciones`.

---

## 1. Visor 3D con `<model-viewer>`

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.4.0/dist/model-viewer.min.js"></script>

<model-viewer id="visor" src="/modelos/flopi-astro.glb" poster="/img/flopi-astro-poster.webp"
  alt="Muñeco Flopi astronauta, personalizable" loading="lazy" reveal="auto"
  camera-controls touch-action="pan-y" auto-rotate auto-rotate-delay="1500" rotation-per-second="18deg"
  interaction-prompt="auto" shadow-intensity="1" exposure="1.05" environment-image="neutral"
  camera-orbit="25deg 75deg 105%" min-camera-orbit="auto auto 70%" max-camera-orbit="auto auto 140%"
  ar ar-modes="webxr scene-viewer quick-look" style="width:100%;aspect-ratio:1">
  <button slot="ar-button" class="boton">Verlo en tu casa</button>
</model-viewer>
```

- **`poster`** es obligatorio: es lo primero que se ve (y la imagen LCP). Debe ser una captura del mismo ángulo de cámara que el modelo para que el cambio no salte. Formato WebP/AVIF, menos de 80 KB.
- **`touch-action="pan-y"`** permite seguir haciendo scroll vertical en el móvil por encima del visor.
- Con **`reveal="manual"`** el modelo no aparece hasta que llamas a `visor.dismissPoster()`. Úsalo si quieres lanzarlo con una animación (por ejemplo, R2 de `flopy-animaciones`).
- En iOS, la AR necesita además `ios-src="flopi.usdz"`.
- **Rendimiento:** pausa `auto-rotate` cuando el visor no está en pantalla (con `IntersectionObserver`). Un solo visor activo por página.
- **Sin WebGL o con reduced-motion:** se queda el póster y una galería de fotos reales.

### Optimizar el GLB (objetivo ≤ 2 MB, ideal ≤ 1 MB)
```bash
npx @gltf-transform/cli optimize flopi.glb flopi-opt.glb --compress meshopt --texture-compress webp --texture-size 1024
```
- Texturas de 1024 px (2048 solo en el héroe); `--compress draco` es la alternativa a meshopt.
- **RGPD:** los decodificadores Draco, Meshopt y KTX2 se descargan por defecto desde CDNs de Google. Para servirlos desde tu dominio, configura `ModelViewerElement.dracoDecoderLocation`, `meshoptDecoderLocation` y `ktx2TranscoderLocation`.
- Los modelos de 3dgob suelen ser STL para imprimir. Para la web hay que convertirlos a GLB con materiales (Blender), reducir polígonos y comprobar que la licencia permite mostrarlos así (ver §6).

---

## 2. Personalizador: color, nombre y accesorios

**Color** (cambiar el material en vivo):
```js
const visor = document.querySelector("#visor");
visor.addEventListener("load", () => {
  const pelo = visor.model.materials.find(m => m.name === "Pelo");
  document.querySelectorAll("[data-color-pelo]").forEach(b => b.addEventListener("click", () =>
    pelo.pbrMetallicRoughness.setBaseColorFactor(b.dataset.colorPelo)));   // "#F4B8C5"
});
```
- **Accesorios:** dos opciones.
  - Variantes `KHR_materials_variants` horneadas en el GLB: `visor.availableVariants`, y `visor.variantName = "gorro"`.
  - Nodos que se muestran u ocultan, cada uno como un GLB pequeño aparte.
- **Nombre:** vista previa en 2D (una etiqueta SVG sobre el póster o un *hotspot* de model-viewer). No hace falta grabar el nombre en 3D en tiempo real.
- **El estado vive en la URL** (`?color=menta&nombre=Lucía&extra=gorro`), así se puede compartir y volver atrás.
- Antes de añadir al carrito, un **resumen visual**: cómo queda, el precio final, el plazo de fabricación y el aviso de que un producto personalizado no admite desistimiento (ver §6).
- Valida el nombre: máximo 12 caracteres, solo letras y espacios, y filtro de palabras inapropiadas.
- **Accesibilidad:** las muestras de color son `<button>` con `aria-pressed` y nombre del color en texto ("Menta"); no basta con el color.

---

## 3. Ficha de producto y carrito

- Arriba: visor o foto grande + nombre + precio final con IVA + botón principal. Debajo: personalizador, galería de fotos **reales** del muñeco impreso (también en la mano de un niño, para que se vea el tamaño), materiales, medidas y edad.
- Fotos reales siempre junto al 3D: el render puede quedar más bonito que la impresión, y eso genera devoluciones.
- **Carrito:** cada línea muestra una miniatura con la personalización aplicada y los campos elegidos, editables.
- Sin urgencias falsas, contadores ni "X personas están viendo esto".

---

## 4. Checkout: Shopify o Stripe

| | **Shopify** | **Stripe (Checkout / Payment Links)** |
|---|---|---|
| Personalización por muñeco | **Line item properties**: `properties: { "Nombre": "Lucía", "Color pelo": "Menta" }` en cada línea. Aparecen en el pedido, en los emails y en el panel. Las claves que empiezan por `_` quedan ocultas. | `custom_fields` admite como máximo 3 campos **por sesión**, no por artículo. Por artículo hay que usar `metadata` y guardar la personalización en tu propia base de datos. |
| Qué te da hecho | Catálogo, inventario, envíos, impuestos (IVA/OSS UE), devoluciones, emails, páginas legales, multi-idioma | Solo el pago. La web, el catálogo y la gestión de pedidos son cosa tuya |
| Coste | Cuota mensual + comisión | Solo comisión por venta |
| Diseño a medida | Tema propio (Liquid), o *headless* (Storefront API / Hydrogen) para tener control total del diseño y las animaciones | Control total, porque la web es tuya |
| Encaja si… | Quieres vender ya, con muchos productos y personalización | Tienes 1–3 productos, un desarrollador y quieres evitar la cuota |

**Recomendación para Flopi:** Shopify. La personalización por línea resuelve el "muñeco con nombre" sin backend. Para el diseño a medida, dos caminos: un tema propio o un front estático propio (esta web) con el **Buy Button / Storefront API** de Shopify para el carrito. Con Stripe: Checkout Sessions (nunca la Charges API), claves restringidas `rk_`, entorno de pruebas, y `automatic_tax` solo si tienes el registro fiscal dado de alta.
**No instales** los plugins de IA de Shopify ni de Stripe sin revisarlos: traen telemetría, hooks y servidores MCP remotos.

---

## 5. SEO de producto y rendimiento de imágenes

```html
<script type="application/ld+json">
{ "@context":"https://schema.org", "@type":"Product",
  "name":"Flopi Astronauta personalizado", "brand":{"@type":"Brand","name":"Flopi"},
  "image":["https://flopi.es/img/astro-1600.avif"], "description":"Muñeco impreso en 3D con el nombre de tu peque.",
  "offers":{ "@type":"Offer", "price":"34.90", "priceCurrency":"EUR",
    "availability":"https://schema.org/MadeToOrder", "url":"https://flopi.es/flopi/astronauta" } }
</script>
```
- No añadas `aggregateRating` ni `review` hasta que haya reseñas reales.
- Un `<title>` y una `meta description` únicos por producto, URL limpia (`/flopi/astronauta`) y `alt` descriptivo.
- Imágenes en AVIF/WebP con `srcset`, `width/height` y `loading="lazy"`, salvo la imagen LCP (que va con `fetchpriority="high"`).
- Objetivo: LCP < 2,5 s en móvil (ideal 1,5 s), CLS < 0,05 e INP < 200 ms. El GLB solo se carga cuando el visor está cerca de la pantalla.

---

## 6. Avisos legales y de seguridad que la web debe reflejar

> ⚠️ **Esto NO es asesoría legal.** Es una lista de temas a **confirmar con un profesional** (abogado o gestoría, y un laboratorio o consultor de seguridad de juguetes) antes de vender. La normativa cambia; verifica la versión vigente.

- [ ] **¿Es un juguete?** Si está pensado para que juegue un menor de 14 años, entra en la normativa de seguridad de juguetes de la UE (Directiva 2009/48/CE y el nuevo Reglamento de seguridad de juguetes que la sustituye). Hay que confirmar qué obligaciones aplican y en qué plazos.
- [ ] **Menores de 3 años y piezas pequeñas.** Las piezas impresas pueden romperse y generar fragmentos que se tragan. Si el producto no es apto, hay que poner la advertencia «No apto para menores de 36 meses. Contiene piezas pequeñas. Peligro de asfixia», en la ficha **y** en el producto. Valorar si conviene venderlo como **figura decorativa / objeto de colección** (y comunicarlo como tal), en lugar de como juguete.
- [ ] **Marcado CE y normas EN 71** (EN 71-1 mecánica y física, EN 71-2 inflamabilidad, EN 71-3 migración de elementos químicos). Hacen falta evaluación de conformidad, documentación técnica y declaración UE de conformidad, y probablemente ensayos de laboratorio.
- [ ] **Materiales.** Indicar filamento (PLA, PETG…), resina y pinturas o barnices.
  - La resina sin curar del todo es irritante: el curado y el lavado tienen que estar garantizados.
  - Hay que verificar las fichas de seguridad de cada material y que cumplen EN 71-3 y REACH.
  - Instrucciones de limpieza y de uso.
- [ ] **Licencia comercial de los diseños de 3dgob.** Comprobar por escrito que la licencia permite:
  - vender impresiones físicas;
  - modificarlas o personalizarlas;
  - mostrar el modelo en 3D o en render en la web;
  - el volumen de ventas previsto.
  Guardar copia de la licencia de cada diseño.
- [ ] **Devoluciones.** Los productos personalizados pueden quedar fuera del derecho de desistimiento de 14 días (art. 103 c del TRLGDCU). Hay que avisarlo **antes** de pagar. Se mantiene la garantía legal por defectos. Redactar una política de devoluciones clara.
- [ ] **RGPD / LOPDGDD.**
  - El nombre del niño es un dato personal: hay que informar de para qué se usa y cuánto tiempo se guarda, y pedir solo lo necesario.
  - Política de privacidad, banner de cookies con consentimiento real (si hay analítica o marketing), contrato de encargado con la plataforma de pago y alojamiento.
  - Servir fuentes y decodificadores desde tu dominio cuando sea posible.
- [ ] **Información obligatoria de la tienda.** Aviso legal con los datos del titular (LSSI), condiciones de venta, precios finales con IVA, gastos de envío antes de pagar y plataforma de resolución de litigios si aplica.
- [ ] **Publicidad dirigida a menores.** Los mensajes van dirigidos a los padres; evitar presionar a los niños para que pidan la compra.

En la web: una página de **Seguridad y materiales** y otra de **Envíos y devoluciones**, enlazadas desde la ficha y el pie. La edad recomendada y las advertencias van junto al botón de compra.

---

## Fuentes y licencias

- **google/model-viewer** — Apache-2.0 — atributos, `setBaseColorFactor`, variantes, ubicación de los decodificadores. https://github.com/google/model-viewer
- **CloudAI-X/threejs-skills** — MIT — pipeline de optimización de GLB (gltf-transform, meshopt/draco, texturas). https://github.com/CloudAI-X/threejs-skills
- **stripe/ai · stripe-best-practices** — MIT — Checkout Sessions, claves `rk_`, `automatic_tax`. https://github.com/stripe/ai
- **Shopify/Shopify-AI-Toolkit** — MIT — solo ideas (Storefront API vs Hydrogen); no se usa su código. https://github.com/Shopify/Shopify-AI-Toolkit
- **coreyhaines31/marketingskills · schema** — MIT — estructura JSON-LD de Product/Offer. https://github.com/coreyhaines31/marketingskills
- **Ferousco-dev/anti-slop-design** — MIT — sin urgencias falsas; revisar requisitos legales de producto infantil. https://github.com/Ferousco-dev/anti-slop-design
