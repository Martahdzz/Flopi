// Convierte un modelo para imprimir (STL o 3MF) en un GLB ligero para el visor web.
//
//   node scripts/convertir-3dgob.mjs modelos-3dgob/dino.3mf dino [--ratio 0.5] [--color #9ED9C0]
//
// - Los originales viven en modelos-3dgob/ (fuera de git: son de pago y el repo es público).
// - Salida: public/modelos/<slug>.glb
// - Cada pieza del 3MF es una malla con su propio material; la más grande se llama "Cuerpo"
//   (el personalizador de ficha.js cambia el color de ese material), el resto "Detalle1", "Detalle2"…
// - Unidades: los STL/3MF vienen en mm y con Z hacia arriba; se pasan a metros y Y hacia arriba,
//   se centran y se apoyan en el suelo.
// - Optimización: weld + simplify (meshoptimizer) + normales suaves + cuantización
//   (KHR_mesh_quantization, no necesita decodificador externo). Objetivo ≤ 2 MB.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, extname } from "node:path";
import { Document, NodeIO, PropertyType } from "@gltf-transform/core";
import { KHRMeshQuantization } from "@gltf-transform/extensions";
import { weld, simplify, quantize, dedup, prune } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import { unzipSync, strFromU8 } from "fflate";

const args = process.argv.slice(2);
const opcion = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const [entrada, slugArg] = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!entrada) {
  console.error("Uso: node scripts/convertir-3dgob.mjs <archivo.stl|archivo.3mf> [slug] [--ratio 0.5] [--color #hex]");
  process.exit(1);
}
const slug = slugArg || basename(entrada, extname(entrada)).toLowerCase().replace(/[^a-z0-9]+/g, "-");
const ratio = parseFloat(opcion("--ratio", "0.5"));
const colorCuerpo = opcion("--color", "#9EC5F0");

// ---------- Lectores ----------
// Devuelven una lista de piezas: { nombre, posiciones: Float32Array (x,y,z por vértice, sin indexar) }
function leerSTL(buf) {
  const esBinario = (() => {
    if (buf.length < 84) return false;
    const n = buf.readUInt32LE(80);
    return 84 + n * 50 === buf.length;
  })();
  if (esBinario) {
    const n = buf.readUInt32LE(80), pos = new Float32Array(n * 9);
    for (let t = 0; t < n; t++) {
      const o = 84 + t * 50 + 12;
      for (let k = 0; k < 9; k++) pos[t * 9 + k] = buf.readFloatLE(o + k * 4);
    }
    return [{ nombre: "Pieza", posiciones: pos }];
  }
  const txt = buf.toString("utf8"), nums = [];
  for (const m of txt.matchAll(/vertex\s+(\S+)\s+(\S+)\s+(\S+)/g)) nums.push(+m[1], +m[2], +m[3]);
  return [{ nombre: "Pieza", posiciones: new Float32Array(nums) }];
}

function leer3MF(buf) {
  const zip = unzipSync(new Uint8Array(buf));
  const piezas = [];
  for (const [ruta, datos] of Object.entries(zip)) {
    if (!/\.model$/i.test(ruta)) continue;
    const xml = strFromU8(datos);
    const unidad = { micron: 0.001, millimeter: 1, centimeter: 10, inch: 25.4, foot: 304.8, meter: 1000 }[(xml.match(/unit="(\w+)"/) || [])[1] || "millimeter"] ?? 1;
    for (const obj of xml.matchAll(/<object\b([^>]*)>([\s\S]*?)<\/object>/g)) {
      const malla = obj[2].match(/<mesh>([\s\S]*?)<\/mesh>/);
      if (!malla) continue;
      const nombre = (obj[1].match(/name="([^"]*)"/) || [])[1] || `Objeto ${(obj[1].match(/id="(\d+)"/) || [])[1]}`;
      const v = [];
      for (const m of malla[1].matchAll(/<vertex\b[^>]*x="([^"]+)"[^>]*y="([^"]+)"[^>]*z="([^"]+)"/g)) v.push(+m[1] * unidad, +m[2] * unidad, +m[3] * unidad);
      const pos = [];
      for (const m of malla[1].matchAll(/<triangle\b[^>]*v1="(\d+)"[^>]*v2="(\d+)"[^>]*v3="(\d+)"/g))
        for (const i of [m[1], m[2], m[3]]) pos.push(v[i * 3], v[i * 3 + 1], v[i * 3 + 2]);
      if (pos.length) piezas.push({ nombre, posiciones: new Float32Array(pos) });
    }
  }
  if (!piezas.length) throw new Error("El 3MF no contiene mallas legibles.");
  return piezas;
}

// ---------- Conversión ----------
const buf = await readFile(entrada);
const ext = extname(entrada).toLowerCase();
const piezas = ext === ".3mf" ? leer3MF(buf) : ext === ".stl" ? leerSTL(buf) : (() => { throw new Error("Formato no soportado: " + ext); })();

// mm, Z arriba  →  m, Y arriba ; centrar en X/Z y apoyar en el suelo
let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
for (const p of piezas) {
  const a = p.posiciones;
  for (let i = 0; i < a.length; i += 3) {
    const x = a[i] * 0.001, y = a[i + 2] * 0.001, z = -a[i + 1] * 0.001;
    a[i] = x; a[i + 1] = y; a[i + 2] = z;
    min = [Math.min(min[0], x), Math.min(min[1], y), Math.min(min[2], z)];
    max = [Math.max(max[0], x), Math.max(max[1], y), Math.max(max[2], z)];
  }
}
const cx = (min[0] + max[0]) / 2, cz = (min[2] + max[2]) / 2;
for (const p of piezas) for (let i = 0; i < p.posiciones.length; i += 3) {
  p.posiciones[i] -= cx; p.posiciones[i + 1] -= min[1]; p.posiciones[i + 2] -= cz;
}
piezas.sort((a, b) => b.posiciones.length - a.posiciones.length);

const doc = new Document();
doc.createExtension(KHRMeshQuantization).setRequired(true);
const buffer = doc.createBuffer();
const escena = doc.createScene(slug);
const hexALineal = (h) => { const n = parseInt(h.slice(1), 16); const l = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return [l((n >> 16) & 255), l((n >> 8) & 255), l(n & 255), 1]; };

piezas.forEach((p, i) => {
  const nombreMat = i === 0 ? "Cuerpo" : `Detalle${i}`;
  const mat = doc.createMaterial(nombreMat).setBaseColorFactor(hexALineal(i === 0 ? colorCuerpo : "#F1EEE8"))
    .setRoughnessFactor(0.6).setMetallicFactor(0);
  const acc = doc.createAccessor().setType("VEC3").setArray(p.posiciones).setBuffer(buffer);
  const prim = doc.createPrimitive().setAttribute("POSITION", acc).setMaterial(mat);
  const malla = doc.createMesh(p.nombre).addPrimitive(prim);
  escena.addChild(doc.createNode(p.nombre).setMesh(malla));
});

// Normales suaves calculadas sobre la malla indexada (sin desoldar).
function normalesSuaves() {
  return (document) => {
    for (const malla of document.getRoot().listMeshes()) for (const prim of malla.listPrimitives()) {
      const pos = prim.getAttribute("POSITION").getArray(), idx = prim.getIndices()?.getArray();
      if (!idx) continue;
      const n = new Float32Array(pos.length);
      for (let t = 0; t < idx.length; t += 3) {
        const [a, b, c] = [idx[t] * 3, idx[t + 1] * 3, idx[t + 2] * 3];
        const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
        const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        for (const k of [a, b, c]) { n[k] += nx; n[k + 1] += ny; n[k + 2] += nz; }
      }
      for (let i = 0; i < n.length; i += 3) {
        const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
        n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
      }
      prim.getAttribute("NORMAL")?.dispose();
      prim.setAttribute("NORMAL", document.createAccessor().setType("VEC3").setArray(n).setBuffer(document.getRoot().listBuffers()[0]));
    }
  };
}

await MeshoptSimplifier.ready;
const trisAntes = piezas.reduce((s, p) => s + p.posiciones.length / 9, 0);
await doc.transform(
  dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.MESH] }), // no fusionar materiales: cada pieza conserva el suyo
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.0005 }),
  normalesSuaves(), // (normals() de gltf-transform desuelda la malla y triplica el peso)
  quantize(),
  prune(),
);
let trisDespues = 0;
for (const m of doc.getRoot().listMeshes()) for (const pr of m.listPrimitives()) trisDespues += (pr.getIndices()?.getCount() ?? pr.getAttribute("POSITION").getCount()) / 3;

await mkdir(new URL("../public/modelos/", import.meta.url), { recursive: true });
const glb = await new NodeIO().registerExtensions([KHRMeshQuantization]).writeBinary(doc);
const salida = new URL(`../public/modelos/${slug}.glb`, import.meta.url);
await writeFile(salida, glb);

const kb = glb.byteLength / 1024;
const alto = ((max[1] - min[1]) * 100).toFixed(1);
console.log(`${slug}.glb: ${kb.toFixed(0)} KB · ${piezas.length} pieza(s) · ${Math.round(trisAntes)} → ${Math.round(trisDespues)} triángulos · alto ${alto} cm`);
console.log("Materiales: " + doc.getRoot().listMaterials().map((m) => m.getName()).join(", "));
if (kb > 2048) console.warn("⚠ Supera 2 MB: prueba con --ratio más bajo (p. ej. 0.25).");
