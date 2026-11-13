/* Flopi · página del carrito. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const datos = JSON.parse($("#datos-carrito").textContent);
  const euros = (n) => n.toFixed(2).replace(".", ",") + " €";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ENVIO = 4.90, ENVIO_GRATIS = 60;
  const lista = $("#lineas"), resumen = $("#resumen"), vacio = $("#vacio"), aviso = $("#aviso-pago");

  function pintar() {
    const l = window.FlopiCarrito.leer();
    vacio.hidden = l.length > 0;
    lista.hidden = resumen.hidden = l.length === 0;
    lista.innerHTML = l.map((x) => {
      const p = datos.productos[x.slug] || {};
      return `<li class="linea">
        <div class="linea__img" style="--fondo-linea:var(--${p.fondo || "cielo"})"><img src="assets/img/flopi-${esc(x.slug)}.svg" alt="" width="560" height="660"></div>
        <div>
          <h2>${esc(x.producto)}${x.nombre ? ` de ${esc(x.nombre)}` : ""}</h2>
          <p>${esc(datos.colores[x.color]?.nombre || x.color)}, pelo ${esc((datos.colores[x.pelo]?.nombre || x.pelo).toLowerCase())}, ${esc((datos.accesorios[x.accesorio]?.nombre || x.accesorio).toLowerCase())}</p>
          <p>${x.nombre ? `Nombre en la peana: «${esc(x.nombre)}»` : "Sin nombre en la peana"}</p>
        </div>
        <div class="linea__lado">
          <span class="linea__precio">${euros(x.precio)}</span>
          <button type="button" class="quitar" data-quitar="${esc(x.id)}">Quitar</button>
        </div>
      </li>`;
    }).join("");
    const sub = l.reduce((s, x) => s + x.precio, 0);
    const envio = sub >= ENVIO_GRATIS || sub === 0 ? 0 : ENVIO;
    $("#subtotal").textContent = euros(sub);
    $("#envio").textContent = envio ? euros(envio) : "Gratis";
    $("#total").textContent = euros(sub + envio);
    $("#falta").textContent = sub > 0 && sub < ENVIO_GRATIS ? `Te faltan ${euros(ENVIO_GRATIS - sub)} para el envío gratis.` : "";
  }

  lista.addEventListener("click", (e) => {
    const b = e.target.closest("[data-quitar]"); if (!b) return;
    window.FlopiCarrito.quitar(b.dataset.quitar);
    pintar();
  });
  $("#pagar").addEventListener("click", () => {
    aviso.textContent = "El pago aún no está conectado. Aquí irá el checkout de Shopify con la personalización de cada muñeco.";
  });
  pintar();
})();
