/* «Il grappolo della rete» in 3D: il nome della Strada è inciso sul tralcio, da cui pende un grappolo.
   Diciassette chicchi portano il logotipo di un'azienda socia; gli altri danno forma al grappolo.
   Si ruota trascinando, si esplora toccando un chicco. Three.js + OrbitControls; GSAP per la crescita.
   Se WebGL non è disponibile resta il tralcio 2D (shared/tralcio.js). */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const TESTO = "STRADA DEL VINO · CASAVECCHIA DI PONTELATONE";
const COL = { corteccia: 0x5b3a24, raspo: 0x6b5a2e, buccia: 0x5e2141, foglia: 0x4b5d23, crema: "#FCF6E1", uva: "#7C2F4B", chart: "#ADC136", noce: "#442413" };

const iniziali = (n) => n.split(" (")[0].replace(/[^A-Za-zÀ-ÿ ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !/^(del|dei|della)$/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

function webglOk() {
  try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; }
}

function riserva(host) {
  const due = document.querySelector("[data-tralcio]");
  host.remove();
  if (due && window.LSDVTralcio) { due.hidden = false; window.LSDVTralcio.crea(due, { loghi: "loghi-chiari" }); }
}

// generatore pseudo-casuale fisso: il grappolo ha sempre la stessa forma
function rnd(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

function caricaImg(src) {
  return new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
}

// etichetta del chicco: disco crema con il logotipo, versione normale e accesa
function etichetta(img, testo, accesa) {
  const S = 256, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d"), r = S / 2;
  const grad = g.createRadialGradient(r * 0.8, r * 0.7, 10, r, r, r);
  grad.addColorStop(0, "#FFFBEF"); grad.addColorStop(0.72, "#F5EAD2"); grad.addColorStop(1, "#E2D0AE");
  g.beginPath(); g.arc(r, r, r - 8, 0, Math.PI * 2); g.fillStyle = grad; g.fill();
  g.lineWidth = accesa ? 12 : 4; g.strokeStyle = accesa ? COL.chart : "rgba(92,33,65,.45)"; g.stroke();
  if (img) {
    const box = S * 0.6, k = Math.min(box / img.width, box / img.height), w = img.width * k, h = img.height * k;
    g.drawImage(img, r - w / 2, r - h / 2, w, h);
  } else {
    g.fillStyle = COL.uva; g.font = `500 ${S * 0.36}px Fraunces, Georgia, serif`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(testo, r, r + 6);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// il nome inciso sul tralcio: striscia curva appoggiata sulla faccia anteriore del ramo
function striscia(curva, raggioFn, alto) {
  const N = 220, righe = [-1, 0, 1], pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, p = curva.getPointAt(u), t = curva.getTangentAt(u);
    const n = new THREE.Vector3(-t.y, t.x, 0).normalize();
    righe.forEach((k) => {
      const raggio = raggioFn(u), off = k * alto / 2, z = Math.sqrt(Math.max(raggio * raggio - off * off, 0)) + 0.012;
      pos.push(p.x + n.x * off, p.y + n.y * off, p.z + z);
      uv.push(u, (k + 1) / 2);
    });
    if (i < N) {
      const a = i * 3;
      for (let k = 0; k < 2; k++) idx.push(a + k, a + k + 3, a + k + 1, a + k + 1, a + k + 3, a + k + 4);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}

async function testoTralcio(lung, alto) {
  try { await document.fonts.load("600 80px Fraunces"); } catch (e) {}
  const H = 160, W = Math.min(8192, Math.round(H * lung / alto));
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  let size = 96;
  const spazio = (s) => s * 0.22;
  const larghezza = (s) => { g.font = `600 ${s}px Fraunces, Georgia, serif`; return [...TESTO].reduce((m, ch) => m + g.measureText(ch).width + spazio(s), 0); };
  while (larghezza(size) > W * 0.62 && size > 30) size -= 2;
  g.font = `600 ${size}px Fraunces, Georgia, serif`; g.textBaseline = "middle"; g.fillStyle = COL.crema;
  g.shadowColor = "rgba(30,14,6,.55)"; g.shadowBlur = 6; g.shadowOffsetY = 3;
  let x = (W - larghezza(size)) / 2;
  g.lineJoin = "round"; g.lineWidth = Math.max(5, size * 0.11); g.strokeStyle = "rgba(34,17,8,.78)";
  for (const ch of TESTO) { g.shadowBlur = 8; g.strokeText(ch, x, H / 2 + 4); g.shadowBlur = 0; g.fillText(ch, x, H / 2 + 4); x += g.measureText(ch).width + spazio(size); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

// tubo vivo: il raggio cambia lungo la curva (rami che si assottigliano, nodi), con UV per la corteccia
function tuboVivo(curva, seg, rad, raggio, ripeti = 1) {
  const fr = curva.computeFrenetFrames(seg, false), P = new THREE.Vector3(), N = new THREE.Vector3();
  const pos = [], nor = [], uv = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg; curva.getPointAt(u, P);
    for (let j = 0; j <= rad; j++) {
      const v = (j / rad) * Math.PI * 2, s = Math.sin(v), c = -Math.cos(v), r = raggio(u, j === rad ? 0 : v);
      N.set(c * fr.normals[i].x + s * fr.binormals[i].x, c * fr.normals[i].y + s * fr.binormals[i].y, c * fr.normals[i].z + s * fr.binormals[i].z).normalize();
      pos.push(P.x + r * N.x, P.y + r * N.y, P.z + r * N.z); nor.push(N.x, N.y, N.z); uv.push(u * ripeti, j / rad);
    }
  }
  for (let i = 1; i <= seg; i++) for (let j = 1; j <= rad; j++) {
    const a = (rad + 1) * (i - 1) + (j - 1), b = (rad + 1) * i + (j - 1), c = (rad + 1) * i + j, d = (rad + 1) * (i - 1) + j;
    idx.push(a, b, d, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  return geo;
}

// corteccia procedurale: fibre lungo il ramo, crepe scure, strisce che si sfaldano; colore e rilievo dallo stesso disegno
function corteccia(tinte, seme, W = 1024, H = 256, puntini = 0) {
  const cc = document.createElement("canvas"), cb = document.createElement("canvas");
  cc.width = cb.width = W; cc.height = cb.height = H;
  const gc = cc.getContext("2d"), gb = cb.getContext("2d"), r = rnd(seme);
  gc.fillStyle = tinte.base; gc.fillRect(0, 0, W, H);
  gb.fillStyle = "#808080"; gb.fillRect(0, 0, W, H);
  const linea = (g, x, y, l, w, col, curva) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y + curva, x + l, y + curva * 0.3); g.stroke(); };
  for (let k = 0; k < 1400; k++) {
    const x = r() * W - 80, y = r() * H, l = 40 + r() * 320, w = 0.6 + r() * 3.2, cur = (r() - 0.5) * 10, t = r();
    const col = t < 0.45 ? tinte.scuro : t < 0.85 ? tinte.medio : tinte.chiaro;
    gc.globalAlpha = 0.18 + r() * 0.4; linea(gc, x, y, l, w, col, cur);
    gb.globalAlpha = gc.globalAlpha; linea(gb, x, y, l, w, t < 0.45 ? "#3a3a3a" : t < 0.85 ? "#8a8a8a" : "#c8c8c8", cur);
  }
  for (let k = 0; k < 150; k++) { // crepe
    const x = r() * W, y = r() * H, l = 60 + r() * 260, cur = (r() - 0.5) * 6;
    gc.globalAlpha = 0.55; linea(gc, x, y, l, 1.2 + r() * 1.6, tinte.crepa, cur);
    gb.globalAlpha = 0.9; linea(gb, x, y, l, 1.6 + r() * 2, "#101010", cur);
  }
  for (let k = 0; k < 70; k++) { // lembi che si staccano
    const x = r() * W, y = r() * H, lw = 50 + r() * 180, lh = 3 + r() * 9;
    gc.globalAlpha = 0.28; gc.fillStyle = tinte.chiaro; gc.beginPath(); gc.ellipse(x, y, lw / 2, lh / 2, 0, 0, Math.PI * 2); gc.fill();
    gb.globalAlpha = 0.6; gb.fillStyle = "#e0e0e0"; gb.beginPath(); gb.ellipse(x, y, lw / 2, lh / 2, 0, 0, Math.PI * 2); gb.fill();
  }
  for (let k = 0; k < puntini; k++) { // lenticelle
    const x = r() * W, y = r() * H, lw = 2 + r() * 6, lh = 1 + r() * 2.2;
    gc.globalAlpha = 0.55; gc.fillStyle = r() < 0.6 ? tinte.chiaro : tinte.crepa; gc.beginPath(); gc.ellipse(x, y, lw, lh, 0, 0, Math.PI * 2); gc.fill();
    gb.globalAlpha = 0.8; gb.fillStyle = "#d0d0d0"; gb.beginPath(); gb.ellipse(x, y, lw, lh, 0, 0, Math.PI * 2); gb.fill();
  }
  gc.globalAlpha = gb.globalAlpha = 1;
  const map = new THREE.CanvasTexture(cc), bump = new THREE.CanvasTexture(cb);
  map.colorSpace = THREE.SRGBColorSpace;
  [map, bump].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; });
  return { map, bump };
}

// foglia di vite: cinque lobi dentellati, nervature palmate, macchie e bordo; trasparente fuori dalla sagoma
function fogliaVite(seme) {
  const S = 1024, cc = document.createElement("canvas"), cb = document.createElement("canvas");
  cc.width = cc.height = cb.width = cb.height = S;
  const gc = cc.getContext("2d"), gb = cb.getContext("2d"), r = rnd(seme);
  const C = { x: S / 2, y: S * 0.52 }, R = S * 0.4;
  // raggio del contorno per angolo (0 = in alto, positivo in senso orario)
  const punti = [[-180, 0.22], [-152, 0.68], [-120, 0.9], [-95, 0.55], [-64, 1.02], [-33, 0.66], [0, 1.0], [33, 0.66], [64, 1.02], [95, 0.55], [120, 0.9], [152, 0.68], [180, 0.22]]
    .map(([a, v]) => [a, v * (0.92 + r() * 0.14)]);
  const raggio = (deg) => {
    for (let k = 0; k < punti.length - 1; k++) {
      const [a0, v0] = punti[k], [a1, v1] = punti[k + 1];
      if (deg >= a0 && deg <= a1) { const t = (deg - a0) / (a1 - a0), s = (1 - Math.cos(t * Math.PI)) / 2; return v0 + (v1 - v0) * s; }
    }
    return 0.26;
  };
  const sagoma = new Path2D();
  for (let d = -179; d <= 179; d += 0.5) {
    const dente = 1 + 0.075 * Math.abs(((d * 0.19) % 2 + 2) % 2 - 1) - 0.036 + 0.012 * Math.sin(d * 1.7);
    const rr = R * raggio(d) * dente, a = (d * Math.PI) / 180;
    const x = C.x + Math.sin(a) * rr * 1.12, y = C.y - Math.cos(a) * rr;
    d === -179 ? sagoma.moveTo(x, y) : sagoma.lineTo(x, y);
  }
  sagoma.closePath();
  const base = { x: C.x, y: C.y + R * 0.2 };
  gc.save(); gc.clip(sagoma);
  const grad = gc.createLinearGradient(0, C.y - R, 0, C.y + R);
  grad.addColorStop(0, "#6E8A34"); grad.addColorStop(0.5, "#557128"); grad.addColorStop(1, "#46601F");
  gc.fillStyle = grad; gc.fillRect(0, 0, S, S);
  for (let k = 0; k < 1100; k++) { // macchie e variazioni della lamina
    gc.globalAlpha = 0.05 + r() * 0.09; gc.fillStyle = r() < 0.5 ? "#2A3C11" : "#A7BB63";
    gc.beginPath(); gc.arc(r() * S, r() * S, 4 + r() * 30, 0, Math.PI * 2); gc.fill();
  }
  for (let k = 0; k < 26; k++) { // qualche imperfezione bruna, come sulle foglie vere
    gc.globalAlpha = 0.16 + r() * 0.2; gc.fillStyle = r() < 0.6 ? "#6B5A22" : "#84541F";
    gc.beginPath(); gc.arc(r() * S, r() * S, 2 + r() * 7, 0, Math.PI * 2); gc.fill();
  }
  gc.globalAlpha = 1;
  gb.fillStyle = "#000"; gb.fillRect(0, 0, S, S); gb.save(); gb.clip(sagoma); gb.fillStyle = "#6c6c6c"; gb.fillRect(0, 0, S, S);
  for (let k = 0; k < 700; k++) { // lamina bollosa fra le nervature
    gb.globalAlpha = 0.25 + r() * 0.3; gb.fillStyle = r() < 0.5 ? "#4a4a4a" : "#a6a6a6";
    gb.beginPath(); gb.arc(r() * S, r() * S, 6 + r() * 20, 0, Math.PI * 2); gb.fill();
  }
  gb.globalAlpha = 1;
  const nervatura = (x0, y0, x1, y1, w, curva) => {
    const mx = (x0 + x1) / 2 + curva, my = (y0 + y1) / 2;
    [[gc, "rgba(222,232,158,.72)"], [gb, "#f2f2f2"]].forEach(([g, col]) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke(); });
  };
  [-118, -62, 0, 62, 118].forEach((d) => { // nervature principali verso le punte dei lobi e secondarie verso il bordo
    const a = (d * Math.PI) / 180, L = R * raggio(d) * 0.97;
    const tx = C.x + Math.sin(a) * L, ty = C.y - Math.cos(a) * L;
    nervatura(base.x, base.y, tx, ty, 9, (r() - 0.5) * 30);
    for (let s = 1; s <= 6; s++) {
      const t = s / 7.2, px = base.x + (tx - base.x) * t, py = base.y + (ty - base.y) * t;
      [-1, 1].forEach((lato) => {
        const b = a + lato * (0.75 + r() * 0.2), l = R * (0.34 - t * 0.2);
        nervatura(px, py, px + Math.sin(b) * l, py - Math.cos(b) * l, 3.6 - t * 1.8, (r() - 0.5) * 16);
      });
    }
  });
  gc.restore(); gb.restore();
  gc.lineWidth = 6; gc.strokeStyle = "rgba(134,120,44,.6)"; gc.stroke(sagoma); // bordo ingiallito
  gc.lineWidth = 2; gc.strokeStyle = "rgba(60,72,24,.5)"; gc.stroke(sagoma);
  const map = new THREE.CanvasTexture(cc), bump = new THREE.CanvasTexture(cb);
  map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = bump.anisotropy = 8;
  // punto d'attacco del picciolo nelle coordinate del piano (lato 1)
  return { map, bump, attacco: { u: base.x / S, v: 1 - base.y / S } };
}

function geometriaFoglia(att, lato, curva) {
  const geo = new THREE.PlaneGeometry(lato, lato, 44, 44);
  geo.translate(-(att.u - 0.5) * lato, -(att.v - 0.5) * lato, 0);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { // la lamina si incurva a coppa e si piega verso il basso in punta
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, curva * (0.14 * x * x + 0.06 * y * y - 0.05 * y) + 0.05 * Math.sin(x * 2.6) * (y + 0.6) + 0.02 * Math.cos(y * 3.4));
  }
  geo.computeVertexNormals();
  return geo;
}

function pelleAcino() {
  const W = 512, H = 256, c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
  const cima = g.createLinearGradient(0, 0, 0, 22); cima.addColorStop(0, "rgba(96,86,40,.95)"); cima.addColorStop(1, "rgba(160,140,120,0)");
  g.fillStyle = cima; g.fillRect(0, 0, W, 22);
  const fondo = g.createLinearGradient(0, H - 16, 0, H); fondo.addColorStop(0, "rgba(120,80,70,0)"); fondo.addColorStop(0.55, "rgba(70,40,30,.55)"); fondo.addColorStop(1, "rgba(40,22,16,.95)");
  g.fillStyle = fondo; g.fillRect(0, H - 16, W, 16);
  for (let k = 0; k < 40; k++) { g.globalAlpha = 0.05; g.fillStyle = k % 2 ? "#e8d8ec" : "#3a1a2a"; g.fillRect((k / 40) * W, 20, 3, H - 40); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function pruina(seme) {
  const S = 256, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d"), r = rnd(seme);
  g.fillStyle = "#5c5c5c"; g.fillRect(0, 0, S, S);
  for (let k = 0; k < 2200; k++) { g.globalAlpha = 0.15 + r() * 0.35; g.fillStyle = r() < 0.7 ? "#d8d8d8" : "#2a2a2a"; g.beginPath(); g.arc(r() * S, r() * S, 0.6 + r() * 2.2, 0, Math.PI * 2); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function ombraTerra() {
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 4, 128, 128, 128);
  grad.addColorStop(0, "rgba(40,20,10,.32)"); grad.addColorStop(1, "rgba(40,20,10,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

async function crea(host) {
  const { D, esc, RM } = window.LSDVCore;
  const gsap = window.gsap;
  const aziende = D.aziende, loghi = D.loghi || {}, n = aziende.length;
  const touch = matchMedia("(pointer:coarse)").matches;

  host.classList.add("g3");
  host.innerHTML = `<div class="g3-scena">
      <canvas class="g3-canvas" aria-hidden="true"></canvas>
      <p class="g3-hint" hidden><i aria-hidden="true"></i><span>${touch ? "Tocca «Esplora in 3D» per ruotare il grappolo" : "Trascina per ruotare il grappolo · clic su un chicco"}</span></p>
      <div class="g3-ctrl" role="group" aria-label="Comandi del grappolo">
        ${touch ? '<button type="button" class="g3-b g3-esplora" data-g3="esplora" aria-pressed="false">Esplora in 3D</button>' : ""}
        <button type="button" class="g3-b g3-tondo" data-g3="piu" aria-label="Avvicina">+</button>
        <button type="button" class="g3-b g3-tondo" data-g3="meno" aria-label="Allontana">−</button>
        <button type="button" class="g3-b" data-g3="giro" aria-pressed="${!RM}">Rotazione</button>
        <button type="button" class="g3-b" data-g3="intera">Vista intera</button>
      </div>
      <aside class="g3-card" hidden aria-live="polite"><button type="button" class="g3-card-x" data-g3="chiudi" aria-label="Chiudi">×</button><span class="g3-card-l"></span><b></b><small>azienda socia della Strada</small><div class="g3-card-m"></div></aside>
      <div class="g3-bar"><p class="g3-conta"><b>0</b> / ${n} aziende</p><button type="button" class="g3-b g3-rivedi" data-g3="rivedi">Rivedi la crescita</button></div>
    </div>
    <ul class="g3-lista">${aziende.map((a, i) => `<li><button type="button" data-g3i="${i}">${esc(a)}</button></li>`).join("")}</ul>`;

  const scena = host.querySelector(".g3-scena");
  if (window.LSDVCore.mapSVG) scena.insertAdjacentHTML("afterbegin", `<div class="g3-carta" aria-hidden="true">${window.LSDVCore.mapSVG({ cls: "g3-terra", luoghi: false })}</div>`);
  const canvas = host.querySelector(".g3-canvas"), card = host.querySelector(".g3-card"), conta = host.querySelector(".g3-conta b"), hint = host.querySelector(".g3-hint");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.add(new THREE.HemisphereLight(0xfff2dc, 0x3a2414, 0.5));
  const key = new THREE.DirectionalLight(0xffe4bd, 2.4); key.position.set(2.2, 15, 6);
  key.target.position.set(0, -2, 0); scene.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(touch ? 1024 : 2048, touch ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -7.5, right: 7.5, top: 6, bottom: -9, near: 1, far: 40 });
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.025; key.shadow.radius = 4;
  const rim = new THREE.DirectionalLight(0xc8d8ff, 0.9); rim.position.set(-7, 3, -8); scene.add(rim);
  const riempi = new THREE.DirectionalLight(0xffd9b0, 0.35); riempi.position.set(-5, -3, 6); scene.add(riempi);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const CENTRO = new THREE.Vector3(0, -1.75, 0);
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(CENTRO); controls.enablePan = false; controls.enableZoom = false; controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.75; controls.minPolarAngle = 1.0; controls.maxPolarAngle = 2.05;
  controls.autoRotate = !RM; controls.autoRotateSpeed = 0.5;
  if (touch) { controls.enabled = false; canvas.style.touchAction = "pan-y"; }

  const mondo = new THREE.Group(); scene.add(mondo);
  const ombre = (m, riceve = true) => { m.castShadow = true; m.receiveShadow = riceve; return m; };

  // --- materiali: corteccia del tralcio, raspo legnoso-verde, buccia con pruina ---
  const legno = corteccia({ base: "#5A3B26", scuro: "#2E1D12", medio: "#6E4B32", chiaro: "#9C7B5C", crepa: "#1A0F09" }, 71);
  const raspo = corteccia({ base: "#6F6536", scuro: "#433B1C", medio: "#857A45", chiaro: "#B9AD74", crepa: "#29230F" }, 113, 1024, 256, 420);
  const verde = corteccia({ base: "#7C7A3A", scuro: "#4E4C20", medio: "#949146", chiaro: "#C2BE78", crepa: "#35331A" }, 277, 512, 128, 160);
  const ped = corteccia({ base: "#5E452C", scuro: "#33231A", medio: "#735638", chiaro: "#A08462", crepa: "#1C130C" }, 191, 1024, 256, 260);
  const matLegno = new THREE.MeshStandardMaterial({ map: legno.map, bumpMap: legno.bump, bumpScale: 4, roughness: 0.92, metalness: 0 });
  const matRaspo = new THREE.MeshStandardMaterial({ map: raspo.map, bumpMap: raspo.bump, bumpScale: 2.2, roughness: 0.74, metalness: 0 });
  const matPicciolo = new THREE.MeshStandardMaterial({ map: verde.map, bumpMap: verde.bump, bumpScale: 1.6, roughness: 0.62, metalness: 0 });
  const matPeduncolo = new THREE.MeshStandardMaterial({ map: ped.map, bumpMap: ped.bump, bumpScale: 3, roughness: 0.88, metalness: 0 });
  const matViticcio = new THREE.MeshStandardMaterial({ color: 0x8a9a3a, roughness: 0.6 });

  // --- tralcio con il nome: si assottiglia verso la punta, con due nodi fuori dalla scritta ---
  const cane = new THREE.CatmullRomCurve3([new THREE.Vector3(-4.8, 1.4, 0), new THREE.Vector3(-2.4, 2.05, 0.08), new THREE.Vector3(0, 1.72, 0), new THREE.Vector3(2.35, 1.98, -0.08), new THREE.Vector3(4.8, 1.38, 0)]);
  const nodo = (u, c, w, h) => h * Math.exp(-(((u - c) / w) ** 2));
  const rCane = (u) => 0.31 - 0.09 * u + nodo(u, 0.08, 0.018, 0.06) + nodo(u, 0.93, 0.016, 0.05) + 0.004 * Math.sin(u * 90);
  const caneGeo = tuboVivo(cane, 260, 28, rCane, 7);
  mondo.add(ombre(new THREE.Mesh(caneGeo, matLegno)));
  const strisciaGeo = striscia(cane, rCane, 0.4);
  const matTesto = new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.7, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, emissive: 0xfff3dc, emissiveIntensity: 0.75 });
  mondo.add(new THREE.Mesh(strisciaGeo, matTesto));
  testoTralcio(cane.getLength(), 0.4).then((t) => { matTesto.map = t; matTesto.emissiveMap = t; matTesto.needsUpdate = true; });
  [0, 1].forEach((u) => { const m = ombre(new THREE.Mesh(new THREE.SphereGeometry(rCane(u), 24, 16), matLegno)); m.position.copy(cane.getPointAt(u)); m.userData.capo = u; mondo.add(m); });

  // --- foglie di vite con picciolo, ognuna con il suo movimento ---
  const fogliaTex = [fogliaVite(9173), fogliaVite(4421)];
  const foglie = [
    { u: 0.13, lato: 3.0, tex: 0, rot: [0.3, 0.35, Math.PI - 0.3], stelo: [-0.2, -0.32, 0.36], curva: 1 },
    { u: 0.38, lato: 2.3, tex: 1, rot: [-0.75, 0.2, 0.25], stelo: [0.1, 0.42, -0.42], curva: 1.2 },
    { u: 0.8, lato: 2.8, tex: 1, rot: [0.4, -0.4, Math.PI + 0.4], stelo: [0.22, -0.3, 0.38], curva: 0.9 },
    { u: 0.95, lato: 2.2, tex: 0, rot: [-0.5, 0.45, -0.75], stelo: [0.3, 0.28, -0.3], curva: 1.1 }
  ].map((f, k) => {
    const T = fogliaTex[f.tex], p0 = cane.getPointAt(f.u);
    const fine = p0.clone().add(new THREE.Vector3(...f.stelo));
    const steloGeo = tuboVivo(new THREE.CatmullRomCurve3([p0, p0.clone().lerp(fine, 0.5).add(new THREE.Vector3(0, 0.12, 0.05)), fine]), 16, 8, (u) => 0.05 - 0.025 * u, 1);
    const stelo = ombre(new THREE.Mesh(steloGeo, matRaspo)); mondo.add(stelo);
    const mat = new THREE.MeshPhysicalMaterial({ map: T.map, bumpMap: T.bump, bumpScale: 3.4, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.54, metalness: 0,
      clearcoat: 0.14, clearcoatRoughness: 0.6, sheen: 0.55, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xd8e6a8) });
    const lamina = new THREE.Mesh(geometriaFoglia(T.attacco, f.lato, f.curva), mat);
    lamina.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: T.map, alphaTest: 0.5 });
    ombre(lamina);
    const g = new THREE.Group(); g.position.copy(fine); g.rotation.set(...f.rot); g.add(lamina); mondo.add(g);
    g.userData = { base: g.rotation.clone(), stelo, fase: k * 1.7 };
    return g;
  });
  const elica = new THREE.CatmullRomCurve3(Array.from({ length: 44 }, (_, k) => { const a = k * 0.45, rr = 0.36 - k * 0.0065; return new THREE.Vector3(-1.45 + Math.cos(a) * rr + k * 0.012, 1.95 + k * 0.03, Math.sin(a) * rr); }));
  const viticcioGeo = tuboVivo(elica, 140, 8, (u) => 0.034 - 0.024 * u, 1);
  mondo.add(ombre(new THREE.Mesh(viticcioGeo, matViticcio)));

  // --- il grappolo pende da un perno sul tralcio: il vento lo fa oscillare attorno a questo punto ---
  const PERNO = new THREE.Vector3(0, 1.62, 0);
  const grappolo = new THREE.Group(); grappolo.position.copy(PERNO); mondo.add(grappolo);
  const interno = new THREE.Group(); interno.position.copy(PERNO).negate(); grappolo.add(interno);

  // peduncolo legnoso: sezione irregolare, un nodo all'attacco sul tralcio
  const pedCurva = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.62, 0), new THREE.Vector3(0.16, 1.05, 0.06), new THREE.Vector3(0.02, 0.62, -0.02), new THREE.Vector3(0, 0.35, 0)]);
  const pedGeo = tuboVivo(pedCurva, 48, 16, (u, a) => (0.135 - 0.05 * u + nodo(u, 0.03, 0.05, 0.035)) * (1 + 0.08 * Math.sin(a * 3 + u * 14) + 0.04 * Math.sin(a * 7 - u * 30)), 1.4);
  interno.add(ombre(new THREE.Mesh(pedGeo, matPeduncolo)));
  // raspo: asse centrale verde-bruno, un po' a zig-zag, si assottiglia verso la punta
  const rachide = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0.1, -0.9, 0.05), new THREE.Vector3(-0.08, -2.2, -0.04), new THREE.Vector3(0.07, -3.6, 0.03), new THREE.Vector3(-0.03, -5.2, 0)]);
  const rRach = (u, a) => (0.095 - 0.062 * u) * (1 + 0.1 * Math.sin(a * 3 + u * 37) + 0.05 * Math.sin(a * 5 - u * 19));
  const rachGeo = tuboVivo(rachide, 110, 14, rRach, 4);
  interno.add(ombre(new THREE.Mesh(rachGeo, matRaspo)));

  // --- chicchi: prima i 17 col logotipo, sul guscio esterno; poi i chicchi pieni ---
  const Y0 = 0.1, ALT = 5.7, Rb = (t) => 2.3 * Math.pow(Math.max(1 - t, 0), 0.72) + 0.32;
  const R_LOGO = 0.44, ALL = 1.15, chicchi = [];
  for (let k = 0; k < n; k++) {
    const t = 0.07 + (k / (n - 1)) * 0.82, y = Y0 - t * ALT, a = k * 2.39996 + 0.6, rad = Rb(t) * 0.93;
    chicchi.push({ p: new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad), r: R_LOGO, i: k, logo: true });
  }
  for (let it = 0; it < 60; it++) {
    let mosso = false;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const A = chicchi[a].p, B = chicchi[b].p, d = A.distanceTo(B), min = R_LOGO * 2 * ALL + 0.06;
      if (d < min) { const v = B.clone().sub(A).setY(0).normalize().multiplyScalar((min - d) / 2 + 0.01); A.sub(v); B.add(v); A.y += 0.02; B.y -= 0.02; mosso = true; }
    }
    if (!mosso) break;
  }
  const casuale = rnd(20260917), pieni = [];
  for (let tent = 0; tent < 3200 && pieni.length < 78; tent++) {
    const t = 0.02 + casuale() * 0.95, y = Y0 - t * ALT, a = casuale() * Math.PI * 2, rad = Rb(t) * (0.2 + casuale() * 0.72), r = 0.29 + casuale() * 0.13;
    const p = new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad);
    if ([...chicchi, ...pieni].every((o) => o.p.distanceTo(p) > (o.r + r) * 1.05 + 0.01)) pieni.push({ p, r });
  }
  // nessun acino identico a un altro: forma, inclinazione e colore cambiano da chicco a chicco
  const TINTE = [
    { col: 0x350f22, ruvido: 0.3, pruina: 0.4 }, { col: 0x4a1a32, ruvido: 0.46, pruina: 0.8 },
    { col: 0x5a2440, ruvido: 0.58, pruina: 1 }, { col: 0x2e1c34, ruvido: 0.38, pruina: 0.65 },
    { col: 0x260c1a, ruvido: 0.26, pruina: 0.3 }, { col: 0x63293f, ruvido: 0.62, pruina: 1 }
  ];
  [...pieni, ...chicchi].forEach((c) => {
    const v = casuale();
    c.forma = new THREE.Vector3(0.94 + casuale() * 0.1, 1.04 + v * 0.26, 0.94 + casuale() * 0.1);
    c.storto = new THREE.Euler((casuale() - 0.5) * 0.3, casuale() * 6.28, (casuale() - 0.5) * 0.3);
    c.tinta = Math.floor(casuale() * TINTE.length);
  });

  // forma dell'acino: ovale, un poco più largo verso il fondo; l'asse lungo punta al picciolo
  const sfera = new THREE.SphereGeometry(1, 48, 32);
  {
    const pp = sfera.attributes.position;
    for (let i = 0; i < pp.count; i++) {
      const y = pp.getY(i), largo = 1 + 0.05 * Math.max(0, -y) - 0.03 * Math.max(0, y);
      pp.setXYZ(i, pp.getX(i) * largo, y * ALL, pp.getZ(i) * largo);
    }
    sfera.computeVertexNormals();
  }
  const bloom = pruina(3307);
  const pelle = pelleAcino();
  const matAcino = TINTE.map((v) => new THREE.MeshPhysicalMaterial({
    color: v.col, map: pelle, roughness: v.ruvido, roughnessMap: bloom, bumpMap: bloom, bumpScale: 0.35, metalness: 0,
    clearcoat: 0.42 - v.pruina * 0.3, clearcoatRoughness: 0.35 + v.pruina * 0.3,
    sheen: v.pruina, sheenRoughness: 0.45, sheenColor: new THREE.Color(0xd3c2de)
  }));
  const matAcinoAcceso = matAcino.map((m) => { const c = m.clone(); c.emissive = new THREE.Color(0x3d4a10); c.emissiveIntensity = 0.9; return c; });
  const matPieni = matAcino[1].clone(); matPieni.color.set(0xffffff); // il colore dei chicchi pieni arriva da instanceColor

  // grappoletti: ogni gruppo di acini vicini pende da una ramificazione laterale del raspo
  const gruppi = new Map(), laterali = [];
  [...chicchi, ...pieni].forEach((c) => {
    const banda = Math.round((Y0 - c.p.y) / 0.8), ang = Math.atan2(c.p.z, c.p.x), settore = Math.round(((ang + Math.PI) / (Math.PI * 2)) * 6) % 6;
    const k = banda + ":" + settore; if (!gruppi.has(k)) gruppi.set(k, []); gruppi.get(k).push(c);
  });
  gruppi.forEach((lista) => {
    const cen = lista.reduce((s, c) => s.add(c.p), new THREE.Vector3()).multiplyScalar(1 / lista.length);
    const yAtt = Math.min(cen.y + 0.5, 0.28), u = THREE.MathUtils.clamp((0.35 - yAtt) / 5.55, 0, 1);
    const s = rachide.getPointAt(u), fine = new THREE.Vector3(cen.x * 0.52, cen.y + 0.28, cen.z * 0.52);
    const mid = s.clone().lerp(fine, 0.5).add(new THREE.Vector3(0, 0.1, 0));
    const curva = new THREE.CatmullRomCurve3([s, mid, fine]);
    const geo = tuboVivo(curva, 18, 9, (q, a) => (0.052 - 0.024 * q) * (1 + 0.1 * Math.sin(a * 2 + q * 17)), 1);
    interno.add(ombre(new THREE.Mesh(geo, matRaspo), false));
    const campioni = curva.getSpacedPoints(30);
    laterali.push(geo);
    lista.forEach((c) => (c.lat = campioni));
  });

  // picciolo corto dal laterale all'acino, con il cercine ingrossato dove entra nel chicco
  const piccioli = [], perni = [], SU = new THREE.Vector3(0, 1, 0);
  const picciolo = (c) => {
    let att = c.lat[0], bd = 1e9;
    c.lat.forEach((q) => { const d = q.distanceTo(c.p); if (d < bd) { bd = d; att = q; } });
    const asse = att.clone().sub(c.p).normalize();
    c.q = new THREE.Quaternion().setFromUnitVectors(SU, asse);
    const cima = c.p.clone().add(asse.clone().multiplyScalar(c.r * ALL * 0.92));
    const piega = att.clone().lerp(cima, 0.5).add(new THREE.Vector3(0, 0.06, 0));
    const r0 = c.logo ? 0.03 : 0.024;
    const raggio = (q, a) => (r0 * (1 - 0.3 * q) + 0.035 * Math.max(0, (q - 0.78) / 0.22) ** 2.2) * (1 + 0.06 * Math.sin(a * 3 + q * 9));
    let geo;
    if (c.logo) { // il chicco col logo oscilla sul suo picciolo: picciolo e chicco stanno in un perno
      const perno = new THREE.Group(); perno.position.copy(att); interno.add(perno);
      geo = tuboVivo(new THREE.CatmullRomCurve3([new THREE.Vector3(), piega.clone().sub(att), cima.clone().sub(att)]), 12, 8, raggio, 1);
      perno.add(ombre(new THREE.Mesh(geo, matPicciolo), false));
      c.perno = perno; perni.push(perno);
    } else {
      geo = tuboVivo(new THREE.CatmullRomCurve3([att, piega, cima]), 12, 8, raggio, 1);
      interno.add(ombre(new THREE.Mesh(geo, matPicciolo), false));
    }
    piccioli.push({ geo, c });
  };
  pieni.forEach(picciolo); chicchi.forEach(picciolo);

  const inst = ombre(new THREE.InstancedMesh(sfera, matPieni, pieni.length));
  const tinta = new THREE.Color();
  pieni.forEach((c, k) => inst.setColorAt(k, tinta.setHex(TINTE[c.tinta].col).offsetHSL(0, (casuale() - 0.5) * 0.05, (casuale() - 0.5) * 0.05)));
  interno.add(inst);
  const tmp = new THREE.Object3D();
  const giraStorto = new THREE.Quaternion();
  const setPieno = (k, s) => {
    const c = pieni[k]; tmp.position.copy(c.p);
    tmp.quaternion.copy(c.q).multiply(giraStorto.setFromEuler(c.storto));
    tmp.scale.set(c.forma.x, c.forma.y, c.forma.z).multiplyScalar(Math.max(c.r * s, 0.0001));
    tmp.updateMatrix(); inst.setMatrixAt(k, tmp.matrix);
  };

  const imgs = await Promise.all(aziende.map((a) => loghi[a] ? caricaImg(`../shared/img/loghi/${loghi[a]}.png`) : Promise.resolve(null)));
  const meshLogo = [], sprite = [];
  chicchi.forEach((c, k) => {
    const m = ombre(new THREE.Mesh(sfera, matAcino[c.tinta])); m.position.copy(c.p).sub(c.perno.position);
    m.quaternion.copy(c.q).multiply(new THREE.Quaternion().setFromEuler(c.storto)); m.userData.i = k;
    c.perno.add(m); meshLogo.push(m);
    const tex = [etichetta(imgs[k], iniziali(aziende[k]), false), etichetta(imgs[k], iniziali(aziende[k]), true)];
    const sm = new THREE.SpriteMaterial({ map: tex[0], transparent: true, depthWrite: false });
    const sp = new THREE.Sprite(sm); sp.userData = { i: k, tex }; sp.scale.setScalar(c.r * 1.42); mondo.add(sp); sprite.push(sp);
  });

  // terreno: ombra vera proiettata dalla luce, più un alone morbido
  const suolo = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.ShadowMaterial({ opacity: 0.11 }));
  suolo.rotation.x = -Math.PI / 2; suolo.position.set(0, -6.45, 0); suolo.receiveShadow = true; mondo.add(suolo);
  const terra = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: ombraTerra(), transparent: true, depthWrite: false, opacity: 0.6 }));
  terra.rotation.x = -Math.PI / 2; terra.position.set(0, -6.44, 0); mondo.add(terra);

  // --- vento: il grappolo si muove appena; i chicchi col logo dondolano sul picciolo; le foglie fremono ---
  const vento = { ax: 0, az: 0, vx: 0, vz: 0, energia: 0 };
  const pendoli = chicchi.map((c, k) => ({ ax: 0, az: 0, vx: 0, vz: 0, f: 0.75 + ((k * 37) % 10) / 20 }));
  const destra = new THREE.Vector3(), avanti = new THREE.Vector3();
  let ultimo = null;
  const spinta = (px, pz) => {
    vento.vz += px * 0.000006; vento.vx -= pz * 0.000006;
    pendoli.forEach((q) => { q.vz += px * 0.00026 * q.f; q.vx -= pz * 0.00026 * q.f; });
  };
  const soffia = (e) => {
    if (RM) return;
    if (ultimo) {
      const dx = THREE.MathUtils.clamp(e.clientX - ultimo.x, -60, 60), dy = THREE.MathUtils.clamp(e.clientY - ultimo.y, -60, 60);
      destra.setFromMatrixColumn(camera.matrixWorld, 0); avanti.setFromMatrixColumn(camera.matrixWorld, 2);
      spinta(destra.x * dx + avanti.x * dy * 0.4, destra.z * dx + avanti.z * dy * 0.4);
      vento.energia = Math.min(1, vento.energia + (Math.abs(dx) + Math.abs(dy)) * 0.005);
    }
    ultimo = { x: e.clientX, y: e.clientY };
  };
  const urta = (i) => { if (RM || i < 0) return; const q = pendoli[i]; q.vz += 0.005 * (i % 2 ? 1 : -1); q.vx += 0.003; };
  const molla = (o, k, smorza, lim) => {
    for (const asse of ["x", "z"]) {
      const a = "a" + asse, v = "v" + asse;
      o[v] += -k * o[a]; o[v] *= smorza; o[a] = THREE.MathUtils.clamp(o[a] + o[v], -lim, lim);
    }
  };
  const passoVento = (t) => {
    molla(vento, 0.02, 0.94, 0.014);
    const brezza = RM ? 0 : Math.sin(t * 0.0005) * 0.002 + Math.sin(t * 0.0013 + 1) * 0.001;
    grappolo.rotation.z = vento.az + brezza;
    grappolo.rotation.x = vento.ax + brezza * 0.6;
    pendoli.forEach((q, k) => {
      molla(q, 0.028, 0.95, 0.13);
      perni[k].rotation.z = q.az + (RM ? 0 : Math.sin(t * 0.0016 + k * 1.3) * 0.008);
      perni[k].rotation.x = q.ax + (RM ? 0 : Math.cos(t * 0.0014 + k) * 0.006);
    });
    foglie.forEach((f, k) => {
      const b = f.userData.base, ph = f.userData.fase, e = vento.energia;
      f.rotation.x = b.x + vento.ax * 0.8 + brezza * 3 + Math.sin(t * 0.008 + ph) * 0.028 * e;
      f.rotation.z = b.z + vento.az * 0.7 + Math.cos(t * 0.01 + ph) * 0.022 * e;
      f.rotation.y = b.y + Math.sin(t * 0.007 + ph * 2) * 0.016 * e;
    });
    vento.energia *= 0.982;
  };

  // --- crescita ---
  const S = { cane: 0, ped: 0, fo: 0, ramo: [], acino: [], pieno: [], lab: [] };
  const ordine = piccioli.map((q, k) => k).sort((a, b) => piccioli[b].c.p.y - piccioli[a].c.p.y);
  const applica = () => {
    caneGeo.setDrawRange(0, Math.floor(caneGeo.index.count * S.cane / 6) * 6);
    strisciaGeo.setDrawRange(0, Math.floor(strisciaGeo.index.count * S.cane / 12) * 12);
    mondo.children.forEach((o) => { if (o.userData.capo !== undefined) o.visible = (o.userData.capo === 0 ? S.cane > 0.01 : S.cane > 0.99); });
    viticcioGeo.setDrawRange(0, Math.floor(viticcioGeo.index.count * S.fo / 6) * 6);
    foglie.forEach((f) => { f.scale.setScalar(Math.max(S.fo, 0.0001)); f.userData.stelo.visible = S.fo > 0.02; });
    pedGeo.setDrawRange(0, Math.floor(pedGeo.index.count * Math.min(S.ped * 2, 1) / 6) * 6);
    rachGeo.setDrawRange(0, Math.floor(rachGeo.index.count * Math.max(S.ped * 2 - 1, 0) / 6) * 6);
    laterali.forEach((g) => g.setDrawRange(0, Math.floor(g.index.count * THREE.MathUtils.clamp(S.ped * 2.4 - 1.4, 0, 1) / 6) * 6));
    piccioli.forEach((q, k) => q.geo.setDrawRange(0, Math.floor(q.geo.index.count * S.ramo[k].v / 6) * 6));
    meshLogo.forEach((m, k) => { const c = chicchi[k]; m.scale.set(c.forma.x, c.forma.y, c.forma.z).multiplyScalar(Math.max(c.r * S.acino[k].v, 0.0001)); });
    sprite.forEach((sp, k) => { sp.material.opacity = S.lab[k].v; sp.visible = S.lab[k].v > 0.01; });
    pieni.forEach((c, k) => setPieno(k, S.pieno[k].v)); inst.instanceMatrix.needsUpdate = true;
  };
  let tl = null;
  const cresci = () => {
    card.hidden = true; host.classList.remove("cresciuto");
    if (RM || !gsap) {
      S.cane = S.ped = S.fo = 1; [S.ramo, S.acino, S.lab, S.pieno].forEach((l) => l.forEach((o) => (o.v = 1)));
      applica(); conta.textContent = n; host.classList.add("cresciuto"); return;
    }
    tl && tl.kill();
    S.cane = S.ped = S.fo = 0; [S.ramo, S.acino, S.lab, S.pieno].forEach((l) => l.forEach((o) => (o.v = 0)));
    const cnt = { v: 0 };
    tl = gsap.timeline({ onUpdate: applica })
      .to(S, { cane: 1, duration: 2.2, ease: "power2.inOut" }, 0)
      .to(S, { fo: 1, duration: 1.4, ease: "back.out(1.4)" }, 1.1)
      .to(S, { ped: 1, duration: 1.4, ease: "power1.inOut" }, 1.9);
    ordine.forEach((k, pos) => {
      const at = 3.1 + (pos / (ordine.length - 1)) * 5.9, q = piccioli[k];
      tl.to(S.ramo[k], { v: 1, duration: 0.45, ease: "power1.out" }, at);
      const ic = chicchi.indexOf(q.c);
      if (ic >= 0) {
        tl.to(S.acino[ic], { v: 1, duration: 0.7, ease: "back.out(2.6)" }, at + 0.35).to(S.lab[ic], { v: 1, duration: 0.5 }, at + 0.7)
          .add(() => { cnt.v++; conta.textContent = cnt.v; }, at + 0.7);
      } else {
        tl.to(S.pieno[pieni.indexOf(q.c)], { v: 1, duration: 0.55, ease: "back.out(2)" }, at + 0.3);
      }
    });
    tl.add(() => { host.classList.add("cresciuto"); conta.textContent = n; mostraHint(); }, 9.8);
  };
  S.ramo = piccioli.map(() => ({ v: 0 })); S.acino = chicchi.map(() => ({ v: 0 })); S.lab = chicchi.map(() => ({ v: 0 })); S.pieno = pieni.map(() => ({ v: 0 })); applica();

  // --- dimensioni e inquadratura ---
  let distanzaIntera = 17;
  const adatta = () => {
    const w = host.querySelector(".g3-scena").clientWidth, h = canvas.clientHeight || w * 0.8;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const f = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), hh = 11.2, ww = camera.aspect < 0.8 ? 7 : 11.6; // sul telefono conta il grappolo, i capi del tralcio possono uscire
    distanzaIntera = Math.max(hh / 2 / f, ww / 2 / (f * camera.aspect)) * 1.02;
    camera.updateProjectionMatrix();
  };
  const vistaIntera = (anim = true) => {
    const dir = camera.position.clone().sub(controls.target); if (dir.lengthSq() < 0.01) dir.set(0, 0.05, 1);
    dir.normalize(); dir.y = THREE.MathUtils.clamp(dir.y, -0.05, 0.18); dir.normalize();
    const pos = CENTRO.clone().add(dir.multiplyScalar(distanzaIntera));
    if (anim && gsap && !RM) { gsap.to(controls.target, { x: CENTRO.x, y: CENTRO.y, z: CENTRO.z, duration: 1.2, ease: "power3.inOut" }); gsap.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: 1.2, ease: "power3.inOut" }); }
    else { controls.target.copy(CENTRO); camera.position.copy(pos); }
  };
  adatta(); camera.position.set(0, CENTRO.y + 0.9, distanzaIntera); vistaIntera(false);
  new ResizeObserver(() => { adatta(); }).observe(host);

  // --- interazione ---
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let sopra = -1, scelto = -1, riprendi = null;
  const colpo = (e) => {
    const b = canvas.getBoundingClientRect(); ptr.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const h = ray.intersectObjects([...meshLogo, ...sprite], false).find((x) => x.object.visible);
    return h ? h.object.userData.i : -1;
  };
  const accendi = (i) => {
    meshLogo.forEach((m, k) => { m.material = k === i ? matAcinoAcceso[chicchi[k].tinta] : matAcino[chicchi[k].tinta]; });
    sprite.forEach((sp, k) => { sp.material.map = sp.userData.tex[k === i ? 1 : 0]; sp.material.needsUpdate = true; });
  };
  const scheda = (i) => {
    if (i < 0) { if (scelto < 0) card.hidden = true; return; }
    const a = aziende[i], l = loghi[a];
    card.querySelector("b").textContent = a.split(" (")[0];
    card.querySelector(".g3-card-l").innerHTML = l ? `<img src="../shared/img/loghi/${l}.png" alt="">` : `<i>${esc(iniziali(a))}</i>`;
    card.querySelector(".g3-card-m").innerHTML = window.LSDVCore.schedaAzienda(a);
    card.hidden = false; card.dataset.i = i;
    window.LSDVSound && window.LSDVSound.play("hover");
  };
  const fermaGiro = () => { controls.autoRotate = false; clearTimeout(riprendi); };
  const giroAttivo = () => host.querySelector('[data-g3="giro"]').getAttribute("aria-pressed") === "true";
  const riprendiGiro = (ms = 5000) => { clearTimeout(riprendi); riprendi = setTimeout(() => { if (scelto < 0 && giroAttivo() && !RM) controls.autoRotate = true; }, ms); };
  const esplora = (i) => {
    scelto = i; fermaGiro(); accendi(i); scheda(i);
    const p = meshLogo[i].getWorldPosition(new THREE.Vector3()), fuori = new THREE.Vector3(p.x, 0, p.z).normalize();
    if (fuori.lengthSq() < 0.01) fuori.set(0, 0, 1);
    const pos = p.clone().add(fuori.multiplyScalar(7.6)).add(new THREE.Vector3(0, 0.8, 0));
    if (gsap && !RM) { gsap.to(controls.target, { x: p.x, y: p.y, z: p.z, duration: 1.1, ease: "power3.inOut" }); gsap.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: 1.1, ease: "power3.inOut" }); }
    else { controls.target.copy(p); camera.position.copy(pos); }
    host.classList.add("esplora-uno"); card.classList.add("aperta");
  };
  const chiudi = () => { scelto = -1; accendi(-1); card.hidden = true; card.classList.remove("aperta"); host.classList.remove("esplora-uno"); vistaIntera(); riprendiGiro(1400); };

  canvas.addEventListener("pointermove", (e) => {
    soffia(e);
    if (e.pointerType === "touch") return;
    const i = colpo(e); canvas.style.cursor = i >= 0 ? "pointer" : (controls.enabled ? "grab" : "default");
    if (i !== sopra) { sopra = i; urta(i); if (scelto < 0) { accendi(i); scheda(i); } }
  });
  canvas.addEventListener("pointerleave", () => { ultimo = null; sopra = -1; if (scelto < 0) { accendi(-1); card.hidden = true; } });
  let giu = null;
  canvas.addEventListener("pointerdown", (e) => { giu = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener("pointerup", (e) => {
    if (!giu || Math.hypot(e.clientX - giu.x, e.clientY - giu.y) > 6) return;
    const i = colpo(e); if (i >= 0) esplora(i); else if (scelto >= 0) chiudi();
  });
  controls.addEventListener("start", () => { fermaGiro(); hint.hidden = true; });
  controls.addEventListener("end", () => riprendiGiro());

  host.querySelector(".g3-ctrl").addEventListener("click", (e) => {
    const b = e.target.closest("[data-g3]"); if (!b) return;
    const cmd = b.dataset.g3;
    if (cmd === "chiudi") return chiudi();
    if (cmd === "piu" || cmd === "meno") {
      const dir = camera.position.clone().sub(controls.target), d = THREE.MathUtils.clamp(dir.length() * (cmd === "piu" ? 0.78 : 1.28), 3.2, distanzaIntera * 1.3);
      const pos = controls.target.clone().add(dir.setLength(d));
      gsap && !RM ? gsap.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: 0.6, ease: "power2.out" }) : camera.position.copy(pos);
    } else if (cmd === "giro") {
      const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); controls.autoRotate = on && scelto < 0;
    } else if (cmd === "intera") {
      chiudi();
    } else if (cmd === "esplora") {
      const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on);
      controls.enabled = on; canvas.style.touchAction = on ? "none" : "pan-y"; b.textContent = on ? "Fine esplorazione" : "Esplora in 3D";
      host.classList.toggle("esplorando", on); hint.hidden = true;
    }
  });
  card.addEventListener("click", (e) => { if (e.target.closest('[data-g3="chiudi"]')) chiudi(); });
  host.querySelector('[data-g3="rivedi"]').addEventListener("click", () => { chiudi(); cresci(); });
  host.querySelector(".g3-lista").addEventListener("click", (e) => { const b = e.target.closest("[data-g3i]"); if (b) esplora(+b.dataset.g3i); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && scelto >= 0) chiudi(); });
  const mostraHint = () => { if (RM) return; hint.hidden = false; setTimeout(() => { hint.hidden = true; }, 7000); };

  // --- ciclo di disegno solo quando il grappolo è visibile ---
  let visibile = false, avviato = false, raf = 0;
  const proiezione = new THREE.Vector3(), mondoP = new THREE.Vector3();
  const giro = () => {
    raf = requestAnimationFrame(giro);
    controls.update();
    passoVento(performance.now());
    mondo.updateMatrixWorld();
    // le etichette stanno sulla faccia del chicco rivolta verso chi guarda
    chicchi.forEach((c, k) => {
      const m = meshLogo[k], s = m.scale.x / chicchi[k].forma.x;
      m.getWorldPosition(mondoP);
      sprite[k].position.copy(mondoP).add(camera.position.clone().sub(mondoP).setLength(s * chicchi[k].forma.y * ALL * 1.04));
      sprite[k].scale.setScalar(s * 1.42);
    });
    if (!card.hidden) {
      const i = +card.dataset.i, b = canvas.getBoundingClientRect(), hb = host.getBoundingClientRect();
      proiezione.copy(meshLogo[i].getWorldPosition(mondoP)).add(new THREE.Vector3(0, chicchi[i].r, 0)).project(camera);
      const mezza = (card.offsetWidth || 240) / 2 + 10;
      card.style.left = Math.min(Math.max((proiezione.x + 1) / 2 * b.width + (b.left - hb.left), mezza), Math.max(hb.width - mezza, mezza)) + "px";
      card.style.top = ((1 - proiezione.y) / 2 * b.height + (b.top - hb.top)) + "px";
    }
    renderer.render(scene, camera);
  };
  new IntersectionObserver(([en]) => {
    visibile = en.isIntersecting;
    if (visibile && !raf) giro();
    if (!visibile && raf) { cancelAnimationFrame(raf); raf = 0; }
    if (visibile && !avviato && en.intersectionRatio > 0.25) { avviato = true; cresci(); }
  }, { threshold: [0, 0.25, 0.5] }).observe(host);
  host.__g3 = { cresci, esplora, chiudi, soffia: (dx, dy = 0) => { soffia({ clientX: 0, clientY: 0 }); soffia({ clientX: dx, clientY: dy }); ultimo = null; } };
}

const host = document.querySelector("[data-grappolo3d]");
if (host) {
  if (!webglOk()) riserva(host);
  else crea(host).catch((err) => { console.error("grappolo 3D non disponibile:", err); riserva(host); });
}
