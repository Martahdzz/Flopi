/* Flopi · comuniones y bodas.
   Escenas (portada y eventos.html): al tocar, los mini Flopis dan un saltito (en escritorio lo hace el hover en CSS).
   Página eventos.html (#ev-form): calculador de presupuesto en vivo (mini Flopis y papelería) y resumen para copiar.
   No envía nada: el resumen se copia y se manda a mano. Sin JS, la página muestra el precio de partida. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const euros = (n) => n.toFixed(2).replace(".", ",") + " €";

  /* ---------- Saltito al tocar ---------- */
  function saltar(escena) {
    escena.removeAttribute("data-salta");
    void escena.getBoundingClientRect(); // reinicia la animación si ya estaba puesta
    escena.setAttribute("data-salta", "");
    clearTimeout(escena._evSalto);
    escena._evSalto = setTimeout(() => escena.removeAttribute("data-salta"), 1100);
  }
  $$("[data-ev-escena]").forEach((escena) => {
    escena.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") saltar(escena); });
  });

  /* ---------- Calculador ---------- */
  const form = $("#ev-form");
  if (!form) return;

  let tramos = [];
  try { tramos = JSON.parse(form.dataset.tramos || "[]"); } catch { tramos = []; }
  const minimo = Number(form.dataset.min) || 10;
  const maximo = Number(form.dataset.max) || 300;
  const semanas = Number(form.dataset.semanas) || 4;

  const grupoTipo = $(".muestras[data-grupo='tipo']", form);
  const grupoColores = $(".muestras[data-grupo='colores']", form);
  const invitados = $("#ev-invitados");
  const ayudaInvitados = $("#ev-invitados-ayuda");
  const ayudaColores = $("#ev-colores-ayuda");
  const total = $("#ev-total");
  const detalle = $("#ev-detalle");
  const vista = $("#ev-vista");
  const vistaPie = $("#ev-vista-pie");
  const tabla = $("#ev-tabla");
  const resumen = $("#ev-resumen");
  const resumenTexto = $("#ev-resumen-texto");
  const copiar = $("#ev-copiar");
  const copiarEstado = $("#ev-copiar-estado");
  const ayudaBase = ayudaInvitados.textContent;
  const casillasPapel = $$("input[name='papeleria']", form);
  const ayudaPapel = $("#ev-papel-ayuda");
  const porMesa = Number($(".ev-papel-campo", form)?.dataset.porMesa) || 10;

  const tipoBoton = () => $(".muestra[aria-pressed='true']", grupoTipo);
  const muestraColor = (clave) => $(`.muestra[data-valor="${clave}"]`, grupoColores);
  const estado = {
    tipo: tipoBoton()?.dataset.valor || "comunion",
    colores: $$(".muestra[aria-pressed='true']", grupoColores).map((b) => b.dataset.valor).slice(0, 2),
  };

  const tramoDe = (n) => tramos.find((t) => n >= t.desde && n <= t.hasta) || null;
  const nombreColor = (clave) => muestraColor(clave)?.dataset.nombre || clave;
  const listaColores = () => estado.colores.map((c) => nombreColor(c).toLowerCase()).join(" y ");

  function leerInvitados() {
    const n = Math.round(Number(invitados.value));
    return Number.isFinite(n) && invitados.value !== "" ? n : NaN;
  }

  // Papelería marcada: unidades × precio. Los meseros van por mesas (1 cada porMesa invitados, hacia arriba).
  function papeleria(n) {
    const mesas = Math.ceil(n / porMesa);
    return casillasPapel.filter((c) => c.checked).map((c) => {
      const precio = Number(c.dataset.precio) || 0;
      const porMesas = c.dataset.por === "mesa";
      const uds = porMesas ? mesas : n;
      return { nombre: c.dataset.nombre, uds, precio, porMesas, subtotal: uds * precio };
    });
  }

  function pintar() {
    // Tipo y colores en la vista previa.
    const tipoNombre = tipoBoton()?.textContent.trim() || "";
    vista.dataset.tipo = estado.tipo;
    const [c1, c2] = estado.colores;
    if (c1) vista.style.setProperty("--ev-c1", muestraColor(c1).dataset.hex);
    if (c2) vista.style.setProperty("--ev-c2", muestraColor(c2).dataset.hex);
    vistaPie.textContent = estado.colores.length ? `${tipoNombre}, en ${listaColores()}` : tipoNombre;
    ayudaColores.textContent = estado.colores.length === 2
      ? `Elegidos: ${nombreColor(c1)} y ${nombreColor(c2)}`
      : `Elige ${2 - estado.colores.length} más`;

    // Precio estimado.
    const n = leerInvitados();
    const valido = Number.isFinite(n) && n >= minimo && n <= maximo;
    invitados.setAttribute("aria-invalid", String(!valido));
    const tramo = valido ? tramoDe(n) : null;
    $$("tbody tr", tabla).forEach((tr) => {
      const activo = tramo && Number(tr.dataset.desde) === tramo.desde;
      tr.toggleAttribute("data-activo", Boolean(activo));
    });
    if (ayudaPapel) {
      const mesas = Number.isFinite(n) && n > 0 ? Math.ceil(n / porMesa) : 0;
      ayudaPapel.textContent = `Los meseros se cuentan por mesas: uno cada ${porMesa} invitados (${mesas} ${mesas === 1 ? "mesa" : "mesas"}).`;
    }
    if (!valido || !tramo) {
      total.textContent = "—";
      detalle.textContent = "";
      ayudaInvitados.textContent = Number.isFinite(n) && n > maximo
        ? `Para más de ${maximo} invitados, escríbenos y lo vemos.`
        : `Pon un número entre ${minimo} y ${maximo}.`;
      return null;
    }
    ayudaInvitados.textContent = ayudaBase;
    const papel = papeleria(n);
    const totalPapel = papel.reduce((s, p) => s + p.subtotal, 0);
    const totalMinis = n * tramo.precio;
    total.textContent = euros(totalMinis + totalPapel);
    detalle.textContent = `${n} unidades × ${euros(tramo.precio)}` + (papel.length ? ` + papelería ${euros(totalPapel)}` : "");
    return { n, tramo, tipoNombre, papel, totalPapel, totalMinis };
  }

  grupoTipo.addEventListener("click", (e) => {
    const b = e.target.closest(".muestra"); if (!b) return;
    estado.tipo = b.dataset.valor;
    $$(".muestra", grupoTipo).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    pintar();
    saltar(vista);
  });

  // Dos colores como máximo: al elegir un tercero, sale el más antiguo.
  grupoColores.addEventListener("click", (e) => {
    const b = e.target.closest(".muestra"); if (!b) return;
    const clave = b.dataset.valor;
    if (estado.colores.includes(clave)) estado.colores = estado.colores.filter((c) => c !== clave);
    else { estado.colores.push(clave); if (estado.colores.length > 2) estado.colores.shift(); }
    $$(".muestra", grupoColores).forEach((x) => x.setAttribute("aria-pressed", String(estado.colores.includes(x.dataset.valor))));
    pintar();
  });

  invitados.addEventListener("input", pintar);
  casillasPapel.forEach((c) => c.addEventListener("change", pintar));

  // "Añadir al presupuesto" en cada carta: marca su casilla y lleva hasta ella.
  $$("[data-ev-papel]").forEach((enlace) => {
    enlace.addEventListener("click", (e) => {
      const casilla = $(`#ev-pap-${enlace.dataset.evPapel}`);
      if (!casilla) return;
      e.preventDefault();
      casilla.checked = true;
      pintar();
      const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
      casilla.closest("label")?.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "center" });
      casilla.focus({ preventScroll: true });
    });
  });
  invitados.addEventListener("change", () => {
    const n = leerInvitados();
    if (Number.isFinite(n)) invitados.value = String(Math.min(maximo, Math.max(minimo, n)));
    pintar();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = pintar();
    if (!datos) { invitados.focus(); return; }
    if (estado.colores.length !== 2) { muestraColor(estado.colores[0] || "nube")?.focus(); return; }
    const { n, tramo, tipoNombre, papel, totalPapel, totalMinis } = datos;
    const lineasPapel = papel.length
      ? ["- Papelería a juego:", ...papel.map((p) =>
        `  - ${p.nombre}: ${p.uds} ${p.porMesas ? (p.uds === 1 ? "mesa" : "mesas") : "uds"} × ${euros(p.precio)} = ${euros(p.subtotal)}`)]
      : ["- Papelería a juego: no"];
    resumenTexto.value = [
      "Hola, Flopi. Quiero pedir presupuesto para detalles de invitados:",
      `- Evento: ${tipoNombre}`,
      `- Unidades: ${n} mini Flopis (unos 6 cm)`,
      `- Colores: ${nombreColor(estado.colores[0])} y ${nombreColor(estado.colores[1])}`,
      `- Mini Flopis: ${n} × ${euros(tramo.precio)} = ${euros(totalMinis)}`,
      ...lineasPapel,
      `- Total estimado: ${euros(totalMinis + totalPapel)} (precios de ejemplo)`,
      "- Incluye: bolsita o cajita y tarjeta para el invitado, sin texto personalizado",
      "- Fecha del evento: ",
      "- Ciudad de entrega: ",
      `Sé que hay que pedirlo con al menos ${semanas} semanas de antelación.`,
    ].join("\n");
    copiarEstado.textContent = "";
    resumen.hidden = false;
    resumen.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
    resumenTexto.focus();
  });

  copiar.addEventListener("click", async () => {
    const texto = resumenTexto.value;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("sin portapapeles");
      await navigator.clipboard.writeText(texto);
      copiarEstado.textContent = "Copiado. Pégalo en tu mensaje.";
    } catch {
      // Alternativa: deja el texto seleccionado para que se copie a mano.
      resumenTexto.focus();
      resumenTexto.select();
      resumenTexto.setSelectionRange(0, texto.length);
      let hecho = false;
      try { hecho = document.execCommand("copy"); } catch { hecho = false; }
      copiarEstado.textContent = hecho
        ? "Copiado. Pégalo en tu mensaje."
        : "Texto seleccionado: cópialo con Ctrl+C o mantén pulsado para copiar.";
    }
  });

  pintar();
})();
