// Genera public/modelos/flopi.glb: un muñeco Flopi provisional hecho con primitivas.
// Cada pieza tiene su propio material con nombre para que el personalizador
// pueda cambiar colores (setBaseColorFactor) y mostrar/ocultar accesorios (alpha).
// Sustituir por el GLB real (convertido desde los STL de 3dgob) cuando esté.
import { Document, NodeIO } from "@gltf-transform/core";
import { mkdir, writeFile } from "node:fs/promises";

const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene("Flopi");

const hex = (h, a = 1) => {
  const n = parseInt(h.slice(1), 16);
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return [lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255), a];
};

const materiales = {};
function material(nombre, color, { rugosidad = 0.62, alpha = 1 } = {}) {
  const m = doc.createMaterial(nombre).setBaseColorFactor(hex(color, alpha))
    .setRoughnessFactor(rugosidad).setMetallicFactor(0);
  if (alpha < 1) m.setAlphaMode("BLEND");
  materiales[nombre] = m;
  return m;
}

// ---- Geometrías ----
function esfera(r, seg = 40, anillos = 28, phiMax = Math.PI) {
  const pos = [], nor = [], idx = [];
  for (let y = 0; y <= anillos; y++) {
    const v = y / anillos, phi = v * phiMax;
    for (let x = 0; x <= seg; x++) {
      const u = x / seg, th = u * Math.PI * 2;
      const nx = Math.sin(phi) * Math.cos(th), ny = Math.cos(phi), nz = Math.sin(phi) * Math.sin(th);
      pos.push(nx * r, ny * r, nz * r); nor.push(nx, ny, nz);
    }
  }
  for (let y = 0; y < anillos; y++) for (let x = 0; x < seg; x++) {
    const a = y * (seg + 1) + x, b = a + seg + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  return { pos, nor, idx };
}
function cilindro(rArriba, rAbajo, h, seg = 40, tapas = true) {
  const pos = [], nor = [], idx = [];
  const pend = (rAbajo - rArriba) / h;
  for (let i = 0; i <= 1; i++) {
    const y = i === 0 ? -h / 2 : h / 2, r = i === 0 ? rAbajo : rArriba;
    for (let x = 0; x <= seg; x++) {
      const th = (x / seg) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
      const l = Math.hypot(1, pend);
      pos.push(c * r, y, s * r); nor.push(c / l, pend / l, s / l);
    }
  }
  for (let x = 0; x < seg; x++) { const a = x, b = x + seg + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  if (tapas) for (const [y, r, ny] of [[h / 2, rArriba, 1], [-h / 2, rAbajo, -1]]) {
    if (r === 0) continue;
    const centro = pos.length / 3; pos.push(0, y, 0); nor.push(0, ny, 0);
    for (let x = 0; x <= seg; x++) { const th = (x / seg) * Math.PI * 2; pos.push(Math.cos(th) * r, y, Math.sin(th) * r); nor.push(0, ny, 0); }
    for (let x = 0; x < seg; x++) ny > 0 ? idx.push(centro, centro + x + 2, centro + x + 1) : idx.push(centro, centro + x + 1, centro + x + 2);
  }
  return { pos, nor, idx };
}
function toro(R, r, seg = 48, lados = 16, arco = Math.PI * 2) {
  const pos = [], nor = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const u = (i / seg) * arco;
    for (let j = 0; j <= lados; j++) {
      const v = (j / lados) * Math.PI * 2;
      const cx = Math.cos(u), cz = Math.sin(u);
      pos.push((R + r * Math.cos(v)) * cx, r * Math.sin(v), (R + r * Math.cos(v)) * cz);
      nor.push(Math.cos(v) * cx, Math.sin(v), Math.cos(v) * cz);
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < lados; j++) {
    const a = i * (lados + 1) + j, b = a + lados + 1;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  return { pos, nor, idx };
}

function malla(nombre, geo, mat) {
  const acc = (tipo, arr, Arr) => doc.createAccessor().setType(tipo).setArray(new Arr(arr)).setBuffer(buffer);
  const prim = doc.createPrimitive()
    .setAttribute("POSITION", acc("VEC3", geo.pos, Float32Array))
    .setAttribute("NORMAL", acc("VEC3", geo.nor, Float32Array))
    .setIndices(acc("SCALAR", geo.idx, Uint16Array))
    .setMaterial(mat);
  return doc.createMesh(nombre).addPrimitive(prim);
}
function pieza(nombre, geo, mat, { t = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0, 1] } = {}, padre = scene) {
  const n = doc.createNode(nombre).setMesh(malla(nombre, geo, mat)).setTranslation(t).setScale(s).setRotation(r);
  padre.addChild(n);
  return n;
}
const rotZ = (g) => [0, 0, Math.sin(g / 2), Math.cos(g / 2)];
const rotX = (g) => [Math.sin(g / 2), 0, 0, Math.cos(g / 2)];

// ---- Materiales (colores por defecto; la web los cambia) ----
const cuerpo = material("Cuerpo", "#9EC5F0");
const piel = material("Piel", "#FFE3CF", { rugosidad: 0.7 });
const pelo = material("Pelo", "#2E2A3A");
const peana = material("Peana", "#2E2A3A", { rugosidad: 0.45 });
const blanco = material("OjoBlanco", "#FFFFFF", { rugosidad: 0.3 });
const pupila = material("Pupila", "#1C1B29", { rugosidad: 0.2 });
const mejilla = material("Mejilla", "#F7A9BE", { rugosidad: 0.8 });
const gorro = material("Gorro", "#F4A6BC");
const corona = material("Corona", "#F7DC7A", { rugosidad: 0.35 });
const casco = material("Casco", "#FFFFFF", { rugosidad: 0.1, alpha: 0.28 });
const crestas = material("Crestas", "#F4A6BC");
const orejas = material("Orejas", "#F7DC7A");

// ---- Montaje (unidades en metros; el muñeco mide unos 18 cm) ----
pieza("Peana", cilindro(0.052, 0.054, 0.016), peana, { t: [0, 0.008, 0] });
pieza("Cuerpo", esfera(0.045), cuerpo, { t: [0, 0.052, 0], s: [1, 0.95, 0.85] });
pieza("BrazoIzq", esfera(0.014), cuerpo, { t: [-0.044, 0.05, 0.004], s: [1, 1.8, 1], r: rotZ(-0.35) });
pieza("BrazoDer", esfera(0.014), cuerpo, { t: [0.044, 0.05, 0.004], s: [1, 1.8, 1], r: rotZ(0.35) });
const cabeza = doc.createNode("Cabeza").setTranslation([0, 0.118, 0]);
scene.addChild(cabeza);
pieza("Cara", esfera(0.05), piel, {}, cabeza);
pieza("Pelo", esfera(0.052, 40, 20, Math.PI * 0.42), pelo, { t: [0, 0.004, -0.004], r: rotX(-0.25) }, cabeza);
for (const [lado, x] of [["Izq", -0.018], ["Der", 0.018]]) {
  pieza("Ojo" + lado, esfera(0.0095), blanco, { t: [x, 0.002, 0.043], s: [1, 1.15, 0.6] }, cabeza);
  pieza("Pupila" + lado, esfera(0.0055), pupila, { t: [x, 0.001, 0.0485], s: [1, 1.1, 0.6] }, cabeza);
  pieza("Mejilla" + lado, esfera(0.007), mejilla, { t: [x * 1.75, -0.018, 0.04], s: [1, 0.7, 0.4] }, cabeza);
}
pieza("Boca", toro(0.009, 0.0018, 24, 8, Math.PI), pupila, { t: [0, -0.012, 0.047], r: rotX(Math.PI / 2 - 0.35) }, cabeza);

// Accesorios: todos presentes; la web oculta los no elegidos poniendo alpha 0.
const acc = doc.createNode("Accesorios").setTranslation([0, 0.118, 0]);
scene.addChild(acc);
pieza("GorroCopa", esfera(0.046, 40, 16, Math.PI / 2), gorro, { t: [0, 0.03, 0], s: [1, 0.75, 1] }, acc);
pieza("GorroVisera", cilindro(0.058, 0.058, 0.007), gorro, { t: [0, 0.03, 0] }, acc);
pieza("GorroPompon", esfera(0.009), gorro, { t: [0, 0.067, 0] }, acc);
pieza("CoronaAro", cilindro(0.032, 0.03, 0.014, 40, false), corona, { t: [0, 0.052, 0] }, acc);
for (let i = 0; i < 5; i++) {
  const a = (i / 5) * Math.PI * 2;
  pieza("CoronaPico" + i, cilindro(0, 0.007, 0.016, 12), corona, { t: [Math.cos(a) * 0.031, 0.066, Math.sin(a) * 0.031] }, acc);
}
pieza("Casco", esfera(0.064), casco, {}, acc);
pieza("CascoAro", toro(0.05, 0.004), casco, { t: [0, -0.04, 0] }, acc);
for (let i = 0; i < 5; i++) {
  const z = 0.03 - i * 0.017, y = 0.048 - Math.abs(i - 1.5) * 0.004;
  pieza("Cresta" + i, cilindro(0, 0.011, 0.024, 12), crestas, { t: [0, y, z], s: [0.5, 1, 1] }, acc);
}
for (const [lado, x] of [["Izq", -0.03], ["Der", 0.03]]) {
  pieza("Oreja" + lado, cilindro(0, 0.016, 0.03, 4), orejas, { t: [x, 0.045, 0], r: rotZ(x > 0 ? -0.35 : 0.35) }, acc);
}

await mkdir(new URL("../public/modelos/", import.meta.url), { recursive: true });
const glb = await new NodeIO().writeBinary(doc);
await writeFile(new URL("../public/modelos/flopi.glb", import.meta.url), glb);
console.log(`flopi.glb: ${(glb.byteLength / 1024).toFixed(0)} KB, ${Object.keys(materiales).length} materiales`);
