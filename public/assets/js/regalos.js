/* Flopi · regalos: ocasión → caja → lazo → tarjeta → carrito. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const euros = (n) => n.toFixed(2).replace(".", ",") + " €";

  // Si hay fotos recortadas (sin fondo), un Flopi real asoma de cada caja.
  const fotos = window.FlopiRecortes || {};
  document.querySelectorAll("[data-asoma]").forEach((el) => {
    const pedidos = el.dataset.asoma.split(",").filter(Boolean);
    const hay = pedidos.filter((s) => fotos[s]);
    // Tantos como quepan (máx. 3) y, si faltan fotos, se repiten las que hay
    const n = Math.min(3, pedidos.length);
    if (!hay.length || !n) return;
    const orden = ["tortuga", "caballo", "flamenco"].filter((s) => hay.includes(s));
    const elegidos = n === 1 ? [hay[0]] : (orden.length >= n ? orden : hay).slice(0, n);
    el.innerHTML = elegidos.map((s) => `<img class="asoma--${s}" src="${fotos[s]}" alt="" loading="lazy">`).join("");
    el.dataset.n = elegidos.length;
    el.closest(".regalo__dibujo")?.classList.add("con-foto");
  });

  const form = $("#form-regalo");
  if (!form) return;
  const vista = $("#vista-regalo");
  const sel = (n) => form.querySelector(`input[name="${n}"]:checked`);

  function pintar() {
    const ocasion = sel("ocasion").value;
    form.querySelectorAll(".regalo").forEach((li) => { li.hidden = li.dataset.ocasion !== ocasion; });
    let caja = sel("caja");
    if (!caja || caja.closest(".regalo").hidden) {
      const visibles = [...form.querySelectorAll(".regalo:not([hidden]) input[name=caja]")];
      caja = visibles[1] || visibles[0];
      caja.checked = true;
    }
    const lazo = sel("lazo");
    const n = +caja.dataset.flopis, bolsita = caja.dataset.bolsita === "1";
    $("#lazo-nombre").textContent = lazo.dataset.nombre;
    $("#resumen-nombre").textContent = caja.dataset.nombre;
    $("#resumen-precio").textContent = euros(+caja.dataset.precio);
    $("#resumen-detalle").textContent = (bolsita ? `${n} bolsitas` : n === 1 ? "1 Flopi" : `${n} Flopis`) + ` · lazo ${lazo.dataset.nombre.toLowerCase()}`;
    form.style.setProperty("--lazo", `var(--${lazo.value})`);
    // La vista previa copia el dibujo de la caja elegida.
    vista.innerHTML = caja.closest(".regalo__opcion").querySelector(".regalo__dibujo").outerHTML;
    $("#regalo-ok").hidden = true;
  }

  const area = form.tarjeta;
  area.addEventListener("input", () => { $("#tarjeta-n").textContent = area.value.length; });
  form.addEventListener("change", pintar);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const caja = sel("caja"), lazo = sel("lazo");
    const n = +caja.dataset.flopis, bolsita = caja.dataset.bolsita === "1";
    const msg = area.value.trim();
    window.FlopiCarrito?.anadir({
      slug: "regalo-" + caja.value,
      producto: caja.dataset.nombre + (bolsita ? " para invitados" : " de regalo"),
      precio: +caja.dataset.precio,
      incluye: Array.from({ length: n }, () => "Flopi sorpresa"),
      color: "Lazo " + lazo.dataset.nombre.toLowerCase(),
      tarjeta: bolsita ? "" : msg,
      imagen: "assets/img/regalo-caja.svg",
      nombre: "", pelo: "", accesorio: "",
    });
    $("#regalo-ok").hidden = false;
    vista.classList.remove("salta"); void vista.offsetWidth; vista.classList.add("salta");
  });

  // Entrar con #caja-trio, #bolsitas-10… selecciona esa caja.
  const h = location.hash.slice(1);
  const pedida = h && form.querySelector(`input[name=caja][value="${CSS.escape(h)}"]`);
  if (pedida) {
    form.querySelector(`input[name=ocasion][value="${pedida.closest(".regalo").dataset.ocasion}"]`).checked = true;
    pedida.checked = true;
  }
  pintar();
})();
