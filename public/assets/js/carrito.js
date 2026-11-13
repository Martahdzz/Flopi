/* Flopi · carrito local (localStorage). Se sustituirá por el carrito de Shopify
   (line item properties) cuando se conecte la tienda. Ver skill flopy-tienda-3d. */
(() => {
  const CLAVE = "flopi-carrito";
  const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { return []; } };
  const guardar = (l) => { try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch (e) {} pintarCuenta(); };

  function pintarCuenta() {
    const n = leer().length;
    document.querySelectorAll("[data-carrito-cuenta]").forEach((el) => {
      el.textContent = n;
      el.dataset.vacio = String(n === 0);
      el.setAttribute("aria-label", n === 1 ? "1 muñeco" : n + " muñecos");
    });
  }

  window.FlopiCarrito = {
    leer,
    anadir(linea) { const l = leer(); l.push({ ...linea, id: Date.now().toString(36) }); guardar(l); return l.length; },
    quitar(id) { guardar(leer().filter((x) => x.id !== id)); },
    vaciar() { guardar([]); },
    pintarCuenta,
  };
  pintarCuenta();
  addEventListener("storage", (e) => { if (e.key === CLAVE) pintarCuenta(); });
})();
