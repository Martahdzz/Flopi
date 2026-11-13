/* Flopi · huevos sorpresa.
   Portada (#huevos): al pulsar un huevo salta la mitad de arriba y aparece un mini Flopi al azar.
   Página huevos.html (#huevo-form): color del huevo + añadir al carrito.
   El CSS base ya muestra los huevos y el CTA; esto solo añade la interacción. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reducir = matchMedia("(prefers-reduced-motion: reduce)");
  const limpiarNombre = (v) => v.replace(/[^\p{L} ]/gu, "").slice(0, 12);

  /* ---------- Portada: abrir huevos ---------- */
  const seccion = $("#huevos");
  const plantilla = $("#huevos-pandilla");
  if (seccion && plantilla) {
    const pandilla = $$("[data-slug]", plantilla.content);
    const salido = $("[data-huevos-salido]", seccion);
    const cerrar = $("[data-huevos-cerrar]", seccion);
    const huevos = $$("[data-huevo]", seccion);
    let ultimo = null, ultimoSlug = "", contador = 0, temporizador = 0;

    // Mini Flopi al azar (sin repetir el anterior), con ids renombrados para que sean únicos.
    function sacarFlopi() {
      const opciones = pandilla.length > 1 ? pandilla.filter((p) => p.dataset.slug !== ultimoSlug) : pandilla;
      const elegido = opciones[Math.floor(Math.random() * opciones.length)];
      ultimoSlug = elegido.dataset.slug;
      contador += 1;
      const base = `hv-mini-${elegido.dataset.slug}-`;
      return { nombre: elegido.dataset.nombre, html: elegido.innerHTML.split(base).join(`hv-mini-${elegido.dataset.slug}-${contador}-`) };
    }

    function abrir(huevo) {
      if (huevo.hasAttribute("data-abierto")) return;
      clearTimeout(temporizador);
      const { nombre, html } = sacarFlopi();
      $("[data-huevo-flopi]", huevo).innerHTML = html;
      void huevo.offsetWidth; // fija el estado inicial antes de animar
      huevo.setAttribute("data-abierto", "");
      huevo.setAttribute("aria-label", `Huevo abierto: ha salido ${nombre}`);
      salido.textContent = `¡Ha salido ${nombre}!`;
      cerrar.hidden = false;
      ultimo = huevo;
    }

    function cerrarTodos() {
      huevos.forEach((h) => {
        h.removeAttribute("data-abierto");
        h.setAttribute("aria-label", "Abrir huevo sorpresa");
      });
      salido.textContent = "";
      cerrar.hidden = true;
      clearTimeout(temporizador);
      temporizador = setTimeout(() => huevos.forEach((h) => {
        if (!h.hasAttribute("data-abierto")) $("[data-huevo-flopi]", h).innerHTML = "";
      }), 500);
      (ultimo || huevos[0])?.focus();
    }

    huevos.forEach((h) => h.addEventListener("click", () => abrir(h)));
    cerrar.addEventListener("click", cerrarTodos);

    // Pausa el balanceo cuando la sección no está en pantalla.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) seccion.removeAttribute("data-fuera");
        else seccion.setAttribute("data-fuera", "");
      }).observe(seccion);
    }
  }

  /* ---------- Página huevos.html: configurador ---------- */
  const form = $("#huevo-form");
  if (form) {
    const vista = $("#huevo-vista");
    const aviso = $("#huevo-aviso");
    const grupo = $(".muestras[data-grupo='color']", form);
    const precio = Number(form.dataset.precio) || 14.9;
    const estado = {
      color: $(".muestra[aria-pressed='true']", grupo)?.dataset.valor || "chicle",
    };

    grupo.addEventListener("click", (e) => {
      const b = e.target.closest(".muestra"); if (!b) return;
      estado.color = b.dataset.valor;
      $$(".muestra", grupo).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      vista.style.setProperty("--huevo-color", b.dataset.hex);
      if (!reducir.matches && vista.animate) {
        $(".huevo__caja", vista).animate(
          [{ transform: "scale(1.05, .95)" }, { transform: "none" }],
          { duration: 300, easing: "cubic-bezier(.16,1,.3,1)" });
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!window.FlopiCarrito) {
        aviso.textContent = "No se ha podido abrir el carrito. Recarga la página e inténtalo otra vez.";
        return;
      }
      const total = window.FlopiCarrito.anadir({
        slug: "huevo", producto: "Huevo sorpresa", precio,
        nombre: "", color: estado.color, pelo: "tinta", accesorio: "sorpresa",
      });
      aviso.textContent = `Añadido. Llevas ${total} ${total === 1 ? "artículo" : "artículos"} en el carrito. `;
      const enlace = document.createElement("a");
      enlace.href = "carrito.html";
      enlace.textContent = "Ver carrito";
      aviso.append(enlace);
    });

  }
})();
