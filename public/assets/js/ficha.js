/* Flopi · ficha de producto: visor 3D (<model-viewer>) + personalizador + añadir al carrito.
   El estado vive en la URL (?color=&pelo=&accesorio=&nombre=) para poder compartirlo. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const datos = JSON.parse($("#datos-ficha").textContent);
  const { producto, colores, accesorios } = datos;
  const reducir = matchMedia("(prefers-reduced-motion: reduce)");

  // Materiales del GLB que forman cada accesorio (ver scripts/generar-modelo.mjs)
  const MATERIAL_ACCESORIO = { gorro: "Gorro", corona: "Corona", casco: "Casco", crestas: "Crestas", orejas: "Orejas" };

  const q = new URLSearchParams(location.search);
  const valido = (v, lista, defecto) => (v && v in lista ? v : defecto);
  const estado = {
    color: valido(q.get("color"), colores, producto.cuerpo),
    pelo: valido(q.get("pelo"), colores, producto.pelo),
    accesorio: valido(q.get("accesorio"), accesorios, producto.accesorio),
    nombre: (q.get("nombre") || "").replace(/[^\p{L} ]/gu, "").slice(0, 12),
  };

  const visor = $("#visor");
  const etiqueta = $("#etiqueta-nombre");
  const campoNombre = $("#nombre");
  const aviso = $("#aviso");

  function aplicarModelo() {
    if (!visor || !visor.model) return;
    const mats = Object.fromEntries(visor.model.materials.map((m) => [m.name, m]));
    mats.Cuerpo?.pbrMetallicRoughness.setBaseColorFactor(colores[estado.color].hex);
    mats.Pelo?.pbrMetallicRoughness.setBaseColorFactor(colores[estado.pelo].hex);
    for (const [acc, nombreMat] of Object.entries(MATERIAL_ACCESORIO)) {
      const m = mats[nombreMat]; if (!m) continue;
      const visible = acc === estado.accesorio;
      m.setAlphaMode(visible && acc !== "casco" ? "OPAQUE" : "BLEND");
      if (!visible) m.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
      else if (acc === "casco") m.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0.28]);
      else m.pbrMetallicRoughness.setBaseColorFactor(colores[producto.colorAccesorio]?.hex || "#F4A6BC");
    }
  }

  function pintar() {
    etiqueta.textContent = (estado.nombre || "Tu nombre").toUpperCase();
    campoNombre.value = estado.nombre;
    $$(".muestras").forEach((g) => $$(".muestra", g).forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.valor === estado[g.dataset.grupo]))));
    $("#resumen-eleccion").textContent =
      `${colores[estado.color].nombre}, pelo ${colores[estado.pelo].nombre.toLowerCase()}, ${accesorios[estado.accesorio].nombre.toLowerCase()}`;
    aplicarModelo();
    try {
      const u = new URL(location.href);
      for (const k of ["color", "pelo", "accesorio", "nombre"]) estado[k] ? u.searchParams.set(k, estado[k]) : u.searchParams.delete(k);
      history.replaceState(null, "", u);
    } catch (e) {}
  }

  const rebote = (el) => {
    if (!window.gsap || reducir.matches || !el) return;
    gsap.fromTo(el, { scaleX: 1.04, scaleY: 0.95 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1,.4)", transformOrigin: "50% 90%", overwrite: true });
  };

  visor?.addEventListener("load", () => { aplicarModelo(); visor.classList.add("cargado"); });
  campoNombre.addEventListener("input", (e) => {
    const limpio = e.target.value.replace(/[^\p{L} ]/gu, "").slice(0, 12);
    if (limpio !== e.target.value) e.target.value = limpio;
    estado.nombre = limpio.trim();
    etiqueta.textContent = (estado.nombre || "Tu nombre").toUpperCase();
  });
  campoNombre.addEventListener("change", pintar);
  $$(".muestras").forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest(".muestra"); if (!b) return;
    estado[g.dataset.grupo] = b.dataset.valor;
    pintar();
    rebote($(".ficha__visor"));
  }));

  $("#form-ficha").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!estado.nombre) {
      aviso.textContent = "Escribe el nombre que irá en la peana (o elige «Sin nombre»).";
      campoNombre.focus();
      return;
    }
    const total = window.FlopiCarrito.anadir({
      slug: producto.slug, producto: producto.nombre, precio: producto.precio,
      nombre: estado.nombre === "Sin nombre" ? "" : estado.nombre,
      color: estado.color, pelo: estado.pelo, accesorio: estado.accesorio,
    });
    aviso.innerHTML = `Añadido. Llevas ${total} ${total === 1 ? "muñeco" : "muñecos"}. <a href="carrito.html">Ver carrito</a>`;
    rebote($(".carrito-enlace"));
  });
  $("#sin-nombre").addEventListener("click", () => { estado.nombre = "Sin nombre"; pintar(); });

  pintar();
})();
