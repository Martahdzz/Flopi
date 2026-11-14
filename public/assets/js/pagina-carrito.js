/* Flopi · página del carrito.
   Las unidades iguales (mismo producto y mismo color) se agrupan en una sola línea con «×N»
   y un contador [ − N + ] para sumar o quitar unidades. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const datos = JSON.parse($("#datos-carrito").textContent);
  const euros = (n) => n.toFixed(2).replace(".", ",") + " €";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ENVIO = 4.90, ENVIO_GRATIS = 35;
  const TRAMOS = [[15, 5], [25, 10], [30, 15]]; // [figuras sueltas, % de descuento] — de ejemplo
  const lista = $("#lineas"), resumen = $("#resumen"), vacio = $("#vacio"), aviso = $("#aviso-pago");

  // Imagen de cada línea: catálogo (si existe el mapa) o ilustración propia.
  const imagenDe = (x) => x.imagen || (window.FlopiImagenes || {})[x.slug] || `assets/img/flopi-${x.slug}.svg`;

  // Detalle bajo el nombre: lo que incluye un pack, color de catálogo o, en los Flopis propios, color/pelo/accesorio.
  function detalle(x) {
    if (Array.isArray(x.incluye)) {
      return `<details class="linea__incluye"><summary>${x.incluye.length} Flopis, ver cuáles</summary><ul>${x.incluye.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></details>`;
    }
    if ((window.FlopiImagenes || {})[x.slug] || !datos.productos[x.slug]) return x.color ? `Color: ${esc(x.color)}` : "";
    const c = datos.colores[x.color]?.nombre || x.color || "";
    const pe = x.pelo ? `, pelo ${(datos.colores[x.pelo]?.nombre || x.pelo).toLowerCase()}` : "";
    const ac = x.accesorio ? `, ${(datos.accesorios[x.accesorio]?.nombre || x.accesorio).toLowerCase()}` : "";
    return esc(c + pe + ac);
  }

  // Agrupa por producto + color + pelo + accesorio, en el orden en que se añadieron.
  function agrupar(l) {
    const grupos = new Map();
    for (const x of l) {
      const clave = [x.slug, x.color || "", x.pelo || "", x.accesorio || "", (x.incluye || []).join(",")].join("|");
      if (!grupos.has(clave)) grupos.set(clave, { clave, muestra: x, ids: [] });
      grupos.get(clave).ids.push(x.id);
    }
    return [...grupos.values()];
  }

  function pintar() {
    const l = window.FlopiCarrito.leer();
    vacio.hidden = l.length > 0;
    lista.hidden = resumen.hidden = l.length === 0;
    lista.innerHTML = agrupar(l).map((g) => {
      const x = g.muestra, n = g.ids.length;
      const p = datos.productos[x.slug] || {};
      return `<li class="linea">
        <div class="linea__img" style="--fondo-linea:var(--${p.fondo || "cielo"})"><img src="${esc(imagenDe(x))}" alt="" width="560" height="660"></div>
        <div>
          <h2>${esc(x.producto)} <span class="linea__x">×${n}</span></h2>
          ${detalle(x) ? (x.incluye ? detalle(x) : `<p>${detalle(x)}</p>`) : ""}
          <p>${x.precioAntes ? `<s>${euros(x.precioAntes)}</s> ` : ""}${euros(x.precio)} ${x.incluye ? "el pack" : "la unidad"}</p>
        </div>
        <div class="linea__lado">
          <div class="linea__controles">
            <div class="contador" role="group" aria-label="Unidades de ${esc(x.producto)}">
              <button type="button" class="contador__btn" data-menos="${esc(g.ids[g.ids.length - 1])}" aria-label="Quitar una">−</button>
              <span class="contador__n" aria-live="polite">${n}</span>
              <button type="button" class="contador__btn" data-mas="${esc(g.clave)}" aria-label="Añadir otra">+</button>
            </div>
            <button type="button" class="papelera" data-quitar-todo="${esc(g.clave)}" aria-label="Quitar ${esc(x.producto)} del carrito" title="Quitar">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9.5 7V4.8c0-.5.4-.8.8-.8h3.4c.5 0 .8.3.8.8V7"/><path d="M6.2 7l.9 12.1c.1 1 .9 1.9 2 1.9h5.8c1.1 0 1.9-.9 2-1.9L17.8 7"/><path d="M10.2 11v6M13.8 11v6"/></svg>
            </button>
          </div>
          <span class="linea__precio">${euros(x.precio * n)}</span>
        </div>
      </li>`;
    }).join("");
    const sub = l.reduce((s, x) => s + x.precio, 0);
    // Descuento por cantidad en figuras sueltas (las pandillas ya llevan el suyo)
    const sueltas = l.filter((x) => !Array.isArray(x.incluye));
    const nSueltas = sueltas.length;
    const tramo = [...TRAMOS].reverse().find(([n]) => nSueltas >= n);
    const pct = tramo ? tramo[1] : 0;
    const desc = Math.round(sueltas.reduce((s, x) => s + x.precio, 0) * pct) / 100;
    const conDesc = sub - desc;
    const envio = conDesc >= ENVIO_GRATIS || conDesc === 0 ? 0 : ENVIO;
    $("#subtotal").textContent = euros(sub);
    $("#desc-t").hidden = $("#desc").hidden = !desc;
    $("#desc-t").textContent = `Descuento por ${nSueltas} figuras (−${pct} %)`;
    $("#desc").textContent = "−" + euros(desc);
    $("#envio").textContent = envio ? euros(envio) : "Gratis";
    $("#total").textContent = euros(conDesc + envio);
    const siguiente = TRAMOS.find(([n]) => nSueltas < n);
    $("#tramo").textContent = nSueltas && siguiente ? `Añade ${siguiente[0] - nSueltas} ${siguiente[0] - nSueltas === 1 ? "figura" : "figuras"} más y te descontamos un ${siguiente[1]} %.` : "";
    $("#falta").textContent = conDesc > 0 && conDesc < ENVIO_GRATIS ? `Te faltan ${euros(ENVIO_GRATIS - conDesc)} para el envío gratis.` : "";
  }

  lista.addEventListener("click", (e) => {
    const l = window.FlopiCarrito.leer();
    const grupos = agrupar(l);
    const menos = e.target.closest("[data-menos]");
    const mas = e.target.closest("[data-mas]");
    const todo = e.target.closest("[data-quitar-todo]");
    if (menos) window.FlopiCarrito.quitar(menos.dataset.menos);
    else if (mas) {
      const g = grupos.find((x) => x.clave === mas.dataset.mas);
      if (g) { const { id, ...resto } = g.muestra; window.FlopiCarrito.anadir(resto); }
    } else if (todo) {
      const g = grupos.find((x) => x.clave === todo.dataset.quitarTodo);
      if (g) g.ids.forEach((id) => window.FlopiCarrito.quitar(id));
    } else return;
    pintar();
  });
  $("#pagar").addEventListener("click", () => {
    aviso.textContent = "El pago aún no está conectado. Aquí irá el checkout de Shopify con el color de cada figura.";
  });
  pintar();
})();
