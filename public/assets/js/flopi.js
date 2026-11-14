/* Flopi · movimiento y utilidades comunes a todas las páginas.
   Reglas (skill flopy-animaciones): el CSS base ya muestra el estado final;
   todo el movimiento va dentro de gsap.matchMedia y respeta prefers-reduced-motion. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const raiz = document.documentElement;
  const reducir = matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Cada página empieza arriba (salvo enlaces a una sección: #ancla) ---------- */
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  const alInicio = () => { if (!location.hash) scrollTo({ top: 0, left: 0, behavior: "instant" }); };
  alInicio();
  addEventListener("pageshow", alInicio);

  /* ---------- Paletas (View Transitions: círculo que crece desde el botón) ---------- */
  const botonesPaleta = $$(".paletas button");
  function aplicarPaleta(nombre) {
    raiz.dataset.paleta = nombre;
    botonesPaleta.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.paleta === nombre)));
    try { localStorage.setItem("flopi-paleta", nombre); } catch (e) {}
  }
  aplicarPaleta(raiz.dataset.paleta || "pastel");
  botonesPaleta.forEach((b) => b.addEventListener("click", () => {
    const nombre = b.dataset.paleta;
    if (!document.startViewTransition || reducir.matches) return aplicarPaleta(nombre);
    const r = b.getBoundingClientRect();
    raiz.style.setProperty("--vt-x", r.left + r.width / 2 + "px");
    raiz.style.setProperty("--vt-y", r.top + r.height / 2 + "px");
    document.startViewTransition(() => aplicarPaleta(nombre));
  }));

  /* ---------- Pestaña activa: también para enlaces a secciones (index.html#huevos) ---------- */
  const enlacesMenu = $$(".cabecera .menu a");
  const paginaActual = location.pathname.split("/").pop() || "index.html";
  enlacesMenu.forEach((a) => {
    if (a.getAttribute("aria-current") === "page" && !a.getAttribute("href").includes("#")) a.dataset.paginaActiva = "1";
  });
  const marcarPestana = (hash) => {
    let alguna = false;
    enlacesMenu.forEach((a) => {
      const partes = a.getAttribute("href").split("#");
      if (!partes[1] || partes[0] !== paginaActual) return;
      if (hash === "#" + partes[1]) { a.setAttribute("aria-current", "page"); alguna = true; }
      else a.removeAttribute("aria-current");
    });
    enlacesMenu.forEach((a) => {
      if (a.dataset.paginaActiva !== "1") return;
      if (alguna) a.removeAttribute("aria-current"); else a.setAttribute("aria-current", "page");
    });
    const activa = $(".cabecera .menu a[aria-current]");
    if (activa && activa.parentElement.parentElement.scrollWidth > activa.parentElement.parentElement.clientWidth) {
      activa.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };
  const seccionesMenu = enlacesMenu
    .map((a) => a.getAttribute("href").split("#"))
    .filter((x) => x[1] && x[0] === paginaActual)
    .map((x) => document.getElementById(x[1]))
    .filter(Boolean);
  if (seccionesMenu.length) {
    const comprobar = () => {
      const linea = innerHeight * 0.6;
      const dentro = seccionesMenu.find((sec) => { const r = sec.getBoundingClientRect(); return r.top < linea && r.bottom > 120; });
      marcarPestana(dentro ? "#" + dentro.id : "");
    };
    let pendiente = false;
    let pausaHasta = performance.now() + 1500;
    enlacesMenu.forEach((a) => a.addEventListener("click", () => { pausaHasta = performance.now() + 1600; }));
    addEventListener("hashchange", () => { pausaHasta = performance.now() + 1600; });
    addEventListener("scroll", () => { if (pendiente || performance.now() < pausaHasta) return; pendiente = true; requestAnimationFrame(() => { pendiente = false; comprobar(); }); }, { passive: true });
  }
  marcarPestana(location.hash);
  addEventListener("hashchange", () => marcarPestana(location.hash));

  /* ---------- Menú desplegable en pantallas medianas y pequeñas ---------- */
  const menuBoton = $(".menu-boton"), menuNav = $("#menu-principal");
  if (menuBoton && menuNav) {
    const cerrar = () => { menuNav.classList.remove("abierto"); menuBoton.setAttribute("aria-expanded", "false"); };
    menuBoton.addEventListener("click", () => {
      const abrir = !menuNav.classList.contains("abierto");
      menuNav.classList.toggle("abierto", abrir); menuBoton.setAttribute("aria-expanded", String(abrir));
      if (abrir) menuNav.querySelector("a")?.focus();
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menuNav.classList.contains("abierto")) { cerrar(); menuBoton.focus(); } });
    menuNav.addEventListener("click", (e) => { if (e.target.closest("a")) cerrar(); });
    document.addEventListener("click", (e) => { if (!e.target.closest(".cabecera")) cerrar(); });
  }

  /* ---------- El fondo cambia de color por sección (R10) ---------- */
  const secciones = $$("[data-fondo]").filter((el) => el !== document.body);
  if (secciones.length) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { if (e.isIntersecting) document.body.dataset.fondo = e.target.dataset.fondo; });
    }, { rootMargin: "-50% 0px -50% 0px" });
    secciones.forEach((s) => io.observe(s));
  }

  /* ---------- Taller de la portada: vista previa en vivo ---------- */
  const vista = $("#vista");
  if (vista) {
    const cuerpo = $("#vista-cuerpo"), extra = $("#vista-extra");
    const estado = { color: "cielo", accesorio: "gorro" };
    const rebote = () => {
      if (!window.gsap || reducir.matches) return;
      gsap.fromTo(cuerpo, { scaleX: 1.08, scaleY: 0.9 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1,.4)", transformOrigin: "50% 95%", overwrite: true });
    };
    $$(".muestras").forEach((grupo) => grupo.addEventListener("click", (e) => {
      const b = e.target.closest(".muestra"); if (!b) return;
      $$(".muestra", grupo).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      if (grupo.dataset.grupo === "cuerpo") {
        vista.style.setProperty("--c-cuerpo", b.dataset.valor);
        estado.color = b.dataset.color;
      } else {
        extra.setAttribute("href", b.dataset.valor);
        const a = b.dataset.valor.replace("#extra-", "");
        estado.accesorio = a === "dino" ? "crestas" : a;
      }
      rebote();
    }));
    $("#taller-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = new URLSearchParams({ color: estado.color, accesorio: estado.accesorio });
      location.href = "flopi-pompon.html?" + q;
    });
  }

  /* ---------- Club Flopi: formulario de maqueta (no envía nada) ---------- */
  const clubForm = $("#club-form");
  if (clubForm) {
    const aviso = $("#club-aviso");
    const correo = $("input[type=email]", clubForm) || $("input", clubForm);
    clubForm.noValidate = true;
    clubForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const valor = correo ? correo.value.trim() : "";
      const valido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor) && (!correo || correo.checkValidity());
      if (correo) correo.setAttribute("aria-invalid", String(!valido));
      if (aviso) aviso.textContent = valido
        ? "Gracias. Aún no está conectado: aquí te apuntaremos al Club Flopi."
        : "Escribe un correo válido.";
      if (!valido && correo) correo.focus();
    });
  }

  /* ---------- Movimiento ---------- */
  function iniciarMovimiento() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add({
      movimiento: "(prefers-reduced-motion: no-preference)",
      escritorio: "(min-width: 48.01rem)",
      fino: "(pointer: fine)",
    }, (ctx) => {
      const { movimiento, escritorio, fino } = ctx.conditions;
      if (!movimiento) return;

      // R1 · Entrada del hero por capas
      if ($(".hero__flopi")) {
        gsap.timeline({ defaults: { duration: 0.8, ease: "power3.out" } })
          .from(".hero__linea > span", { yPercent: 115, stagger: 0.09 })
          .from(".forma", { scale: 0.6, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "back.out(1.4)" }, 0)
          .from(".hero__flopi .flopi__cuerpo", { y: 70, scaleY: 0.55, transformOrigin: "50% 100%", ease: "back.out(1.7)" }, 0.25)
          .from(".hero__flopi .flopi__cabeza", { y: -120, autoAlpha: 0, ease: "back.out(2)" }, 0.45)
          .from(".hero__flopi .flopi__extra", { y: -60, rotate: -25, scale: 0.5, autoAlpha: 0, transformOrigin: "50% 100%", ease: "elastic.out(1,.5)", duration: 1.1 }, 0.7)
          .from(".hero__cta", { y: 16, autoAlpha: 0, stagger: 0.06 }, 0.55);
      }

      // Entrada de las portadas interiores
      if ($(".portada h1")) {
        gsap.from(".portada > .envoltorio > *", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" });
      }

      // R4 · Parallax por capas de profundidad
      $$("[data-profundidad]").forEach((el) => {
        const p = parseFloat(el.dataset.profundidad);
        gsap.to(el, { yPercent: p * -100, ease: "none",
          scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
      });

      // R5 · Momento firma: Flopi se imprime capa a capa
      const escenario = $(".capas__escenario");
      if (escenario) {
        if (escritorio) {
          const tl = gsap.timeline({ scrollTrigger: { trigger: ".capas", start: "top top", end: "+=180%", pin: ".capas__pin", scrub: 0.6, invalidateOnRefresh: true } });
          tl.set(".capas__boquilla", { autoAlpha: 1 }, 0)
            .fromTo(".capas__flopi", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 1 }, 0)
            .fromTo(".capas__boquilla", { y: 0 }, { y: () => -escenario.offsetHeight, ease: "none", duration: 1 }, 0)
            .fromTo(".paso", { opacity: 0.28 }, { opacity: 1, stagger: 0.25, duration: 0.2, ease: "none" }, 0)
            .to(".capas__boquilla", { autoAlpha: 0, duration: 0.05 }, 1);
        } else {
          gsap.from(".capas__flopi", { clipPath: "inset(100% 0% 0% 0%)", duration: 1.4, ease: "power2.inOut",
            scrollTrigger: { trigger: escenario, start: "top 75%" } });
        }
      }

      // Destacados: stagger de entrada solo si no hay revelado nativo con view()
      // Pack: los cinco Flopis salen juntos del centro y se abren en abanico
      const composicion = $(".pack__composicion");
      const flopisPack = composicion ? $$(".pack__flopi", composicion) : [];
      if (flopisPack.length) {
        const caja = composicion.getBoundingClientRect();
        const centro = caja.left + caja.width / 2;
        gsap.from(flopisPack, {
          x: (i, el) => { const r = el.getBoundingClientRect(); return centro - (r.left + r.width / 2); },
          rotation: (i, el) => -(parseFloat(getComputedStyle(el).rotate) || 0),
          y: 24, scale: 0.9, autoAlpha: 0.4,
          duration: 0.9, ease: "back.out(1.5)", stagger: { each: 0.06, from: "center" },
          transformOrigin: "50% 100%",
          scrollTrigger: { trigger: composicion, start: "top 75%", once: true },
        });
      }

      // Descuentos: pop escalonado de las cifras
      const valores = $$(".descuento__valor");
      if (valores.length) {
        gsap.from(valores, { scale: 0.7, yPercent: 18, autoAlpha: 0, duration: 0.6, ease: "back.out(1.7)", stagger: 0.12,
          transformOrigin: "50% 100%",
          scrollTrigger: { trigger: valores[0].closest(".descuentos__lista") || valores[0], start: "top 80%", once: true } });
      }

      // R7 · Los ojos de Flopi siguen al cursor
      const pupilas = $$(".hero__flopi .flopi__pupila");
      if (fino && pupilas.length) {
        const xTo = pupilas.map((p) => gsap.quickTo(p, "x", { duration: 0.45, ease: "power3" }));
        const yTo = pupilas.map((p) => gsap.quickTo(p, "y", { duration: 0.45, ease: "power3" }));
        const mover = (e) => {
          const dx = (e.clientX / innerWidth - 0.5) * 9, dy = (e.clientY / innerHeight - 0.5) * 9;
          xTo.forEach((f) => f(dx)); yTo.forEach((f) => f(dy));
        };
        addEventListener("pointermove", mover);
        return () => removeEventListener("pointermove", mover);
      }
    });

    // Scroll suave: solo con ratón/trackpad y sin reducir movimiento
    if (matchMedia("(pointer: fine)").matches && !reducir.matches && window.Lenis) {
      const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -100 } });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      window.flopiLenis = lenis;
      if (!location.hash) lenis.scrollTo(0, { immediate: true });
    }
  }
  iniciarMovimiento();
})();
