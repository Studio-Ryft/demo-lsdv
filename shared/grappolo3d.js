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
function striscia(curva, raggio, alto) {
  const N = 220, righe = [-1, 0, 1], pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, p = curva.getPointAt(u), t = curva.getTangentAt(u);
    const n = new THREE.Vector3(-t.y, t.x, 0).normalize();
    righe.forEach((k) => {
      const off = k * alto / 2, z = Math.sqrt(Math.max(raggio * raggio - off * off, 0)) + 0.012;
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
  for (const ch of TESTO) { g.fillText(ch, x, H / 2 + 4); x += g.measureText(ch).width + spazio(size); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function foglia() {
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.bezierCurveTo(-18, 10, -40, 8, -52, 26); s.bezierCurveTo(-40, 30, -44, 46, -30, 58); s.bezierCurveTo(-22, 48, -10, 56, -6, 72);
  s.bezierCurveTo(4, 58, 16, 60, 22, 70); s.bezierCurveTo(26, 52, 44, 52, 50, 40); s.bezierCurveTo(36, 30, 46, 16, 36, 6); s.bezierCurveTo(22, 12, 12, 2, 0, 0);
  const geo = new THREE.ShapeGeometry(s, 12); geo.scale(0.03, 0.03, 0.03);
  return geo;
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
      <aside class="g3-card" hidden aria-live="polite"><span class="g3-card-l"></span><b></b><small>azienda socia della Strada</small></aside>
      <div class="g3-bar"><p class="g3-conta"><b>0</b> / ${n} aziende</p><button type="button" class="g3-b g3-rivedi" data-g3="rivedi">Rivedi la crescita</button></div>
    </div>
    <ul class="g3-lista">${aziende.map((a, i) => `<li><button type="button" data-g3i="${i}">${esc(a)}</button></li>`).join("")}</ul>`;

  const canvas = host.querySelector(".g3-canvas"), card = host.querySelector(".g3-card"), conta = host.querySelector(".g3-conta b"), hint = host.querySelector(".g3-hint");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.HemisphereLight(0xfff2dc, 0x3a2414, 0.55));
  const key = new THREE.DirectionalLight(0xffe7c4, 1.7); key.position.set(5, 8, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc8d8ff, 0.7); rim.position.set(-6, 2, -7); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const CENTRO = new THREE.Vector3(0, -1.9, 0);
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(CENTRO); controls.enablePan = false; controls.enableZoom = false; controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.75; controls.minPolarAngle = 1.0; controls.maxPolarAngle = 2.05;
  controls.autoRotate = !RM; controls.autoRotateSpeed = 0.8;
  if (touch) { controls.enabled = false; canvas.style.touchAction = "pan-y"; }

  const mondo = new THREE.Group(); scene.add(mondo);

  // --- tralcio con il nome ---
  const cane = new THREE.CatmullRomCurve3([new THREE.Vector3(-4.7, 1.45, 0), new THREE.Vector3(-2.4, 2.05, 0.08), new THREE.Vector3(0, 1.72, 0), new THREE.Vector3(2.35, 1.98, -0.08), new THREE.Vector3(4.7, 1.42, 0)]);
  const R_CANE = 0.27;
  const caneGeo = new THREE.TubeGeometry(cane, 220, R_CANE, 24, false);
  const matLegno = new THREE.MeshStandardMaterial({ color: COL.corteccia, roughness: 0.82, metalness: 0 });
  mondo.add(new THREE.Mesh(caneGeo, matLegno));
  const strisciaGeo = striscia(cane, R_CANE, 0.36);
  const matTesto = new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  mondo.add(new THREE.Mesh(strisciaGeo, matTesto));
  testoTralcio(cane.getLength(), 0.36).then((t) => { matTesto.map = t; matTesto.needsUpdate = true; });
  // capi del tralcio arrotondati
  [0, 1].forEach((u) => { const m = new THREE.Mesh(new THREE.SphereGeometry(R_CANE, 20, 14), matLegno); m.position.copy(cane.getPointAt(u)); m.userData.capo = u; mondo.add(m); });

  // foglie e viticcio
  const matFoglia = new THREE.MeshStandardMaterial({ color: COL.foglia, roughness: 0.7, side: THREE.DoubleSide });
  const foglie = [
    { p: [-3.3, 1.95, 0.25], r: [0.2, 0.5, 2.6] }, { p: [3.2, 1.9, -0.2], r: [-0.3, -0.6, -0.4] }, { p: [1.1, 1.95, 0.3], r: [0.5, 0.2, 0.3] }
  ].map((f) => { const m = new THREE.Mesh(foglia(), matFoglia); m.position.set(...f.p); m.rotation.set(...f.r); mondo.add(m); return m; });
  const elica = new THREE.CatmullRomCurve3(Array.from({ length: 40 }, (_, k) => { const a = k * 0.42, rr = 0.34 - k * 0.006; return new THREE.Vector3(-1.5 + Math.cos(a) * rr + k * 0.012, 1.95 + k * 0.03, Math.sin(a) * rr); }));
  const viticcioGeo = new THREE.TubeGeometry(elica, 120, 0.028, 8, false);
  const matRaspo = new THREE.MeshStandardMaterial({ color: COL.raspo, roughness: 0.75 });
  mondo.add(new THREE.Mesh(viticcioGeo, matRaspo));

  // --- peduncolo e raspo ---
  const pedCurva = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.62, 0), new THREE.Vector3(0.18, 1.0, 0.05), new THREE.Vector3(0, 0.35, 0)]);
  const pedGeo = new THREE.TubeGeometry(pedCurva, 40, 0.1, 12, false);
  mondo.add(new THREE.Mesh(pedGeo, matLegno));
  const rachide = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0.08, -1.4, 0.04), new THREE.Vector3(-0.06, -3.4, 0), new THREE.Vector3(0.04, -5.4, 0)]);
  const rachGeo = new THREE.TubeGeometry(rachide, 80, 0.07, 10, false);
  mondo.add(new THREE.Mesh(rachGeo, matRaspo));

  // --- chicchi: prima i 17 col logotipo, sul guscio esterno; poi i chicchi pieni ---
  const Y0 = 0.1, ALT = 5.7, Rb = (t) => 2.3 * Math.pow(Math.max(1 - t, 0), 0.72) + 0.32;
  const R_LOGO = 0.47, chicchi = [];
  for (let k = 0; k < n; k++) {
    const t = 0.07 + (k / (n - 1)) * 0.82, y = Y0 - t * ALT, a = k * 2.39996 + 0.6, rad = Rb(t) * 0.93;
    chicchi.push({ p: new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad), r: R_LOGO, i: k });
  }
  for (let it = 0; it < 60; it++) { // piccole spinte finché nessun chicco col logotipo ne tocca un altro
    let mosso = false;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const A = chicchi[a].p, B = chicchi[b].p, d = A.distanceTo(B), min = R_LOGO * 2 + 0.05;
      if (d < min) { const v = B.clone().sub(A).setY(0).normalize().multiplyScalar((min - d) / 2 + 0.01); A.sub(v); B.add(v); A.y += 0.02; B.y -= 0.02; mosso = true; }
    }
    if (!mosso) break;
  }
  const casuale = rnd(20260917), pieni = [];
  for (let tent = 0; tent < 2600 && pieni.length < 70; tent++) {
    const t = 0.02 + casuale() * 0.95, y = Y0 - t * ALT, a = casuale() * Math.PI * 2, rad = Rb(t) * (0.2 + casuale() * 0.72), r = 0.29 + casuale() * 0.1;
    const p = new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad);
    if ([...chicchi, ...pieni].every((o) => o.p.distanceTo(p) > o.r + r + 0.015)) pieni.push({ p, r });
  }

  const sfera = new THREE.SphereGeometry(1, 40, 28);
  const matBuccia = new THREE.MeshPhysicalMaterial({ color: COL.buccia, roughness: 0.36, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.32, sheen: 1, sheenRoughness: 0.65, sheenColor: new THREE.Color(0xb99ac8) });
  const matBucciaAccesa = matBuccia.clone(); matBucciaAccesa.emissive = new THREE.Color(0x3d4a10); matBucciaAccesa.emissiveIntensity = 0.9;

  // piccioli: dal raspo a ogni chicco
  const piccioli = [];
  const picciolo = (c) => {
    const ys = Math.min(c.p.y + 0.55, 0.3), u = THREE.MathUtils.clamp((0.35 - ys) / 5.75, 0, 1);
    const s = rachide.getPointAt(u), dir = c.p.clone().sub(s), fine = c.p.clone().sub(dir.clone().normalize().multiplyScalar(c.r * 0.85));
    const mid = s.clone().lerp(fine, 0.5).add(new THREE.Vector3(0, 0.22, 0));
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([s, mid, fine]), 14, c.r > 0.4 ? 0.035 : 0.026, 6, false);
    const m = new THREE.Mesh(geo, matRaspo); mondo.add(m); piccioli.push({ geo, c });
  };
  pieni.forEach(picciolo); chicchi.forEach(picciolo);

  const inst = new THREE.InstancedMesh(sfera, matBuccia, pieni.length);
  // ogni chicco ha una sfumatura sua, come nell'uva vera
  const tinta = new THREE.Color();
  pieni.forEach((c, k) => { const v = casuale(); inst.setColorAt(k, tinta.setHSL(0.93 + v * 0.04, 0.35 + v * 0.2, 0.62 + casuale() * 0.22)); });
  mondo.add(inst);
  const tmp = new THREE.Object3D();
  const setPieno = (k, s) => { const c = pieni[k]; tmp.position.copy(c.p); tmp.scale.setScalar(Math.max(c.r * s, 0.0001)); tmp.updateMatrix(); inst.setMatrixAt(k, tmp.matrix); };

  const imgs = await Promise.all(aziende.map((a) => loghi[a] ? caricaImg(`../shared/img/loghi/${loghi[a]}.png`) : Promise.resolve(null)));
  const meshLogo = [], sprite = [];
  chicchi.forEach((c, k) => {
    const m = new THREE.Mesh(sfera, matBuccia); m.position.copy(c.p); m.scale.setScalar(c.r); m.userData.i = k; mondo.add(m); meshLogo.push(m);
    const tex = [etichetta(imgs[k], iniziali(aziende[k]), false), etichetta(imgs[k], iniziali(aziende[k]), true)];
    const sm = new THREE.SpriteMaterial({ map: tex[0], transparent: true, depthWrite: false });
    const sp = new THREE.Sprite(sm); sp.userData = { i: k, tex }; sp.scale.setScalar(c.r * 1.42); mondo.add(sp); sprite.push(sp);
  });

  const terra = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: ombraTerra(), transparent: true, depthWrite: false }));
  terra.rotation.x = -Math.PI / 2; terra.position.set(0, -6.25, 0); mondo.add(terra);

  // --- crescita ---
  const S = { cane: 0, ped: 0, fo: 0, ramo: [], acino: [], pieno: [], lab: [] };
  const ordine = piccioli.map((q, k) => k).sort((a, b) => piccioli[b].c.p.y - piccioli[a].c.p.y);
  const applica = () => {
    caneGeo.setDrawRange(0, Math.floor(caneGeo.index.count * S.cane / 6) * 6);
    strisciaGeo.setDrawRange(0, Math.floor(strisciaGeo.index.count * S.cane / 12) * 12);
    mondo.children.forEach((o) => { if (o.userData.capo !== undefined) o.visible = (o.userData.capo === 0 ? S.cane > 0.01 : S.cane > 0.99); });
    viticcioGeo.setDrawRange(0, Math.floor(viticcioGeo.index.count * S.fo / 6) * 6);
    foglie.forEach((f) => f.scale.setScalar(Math.max(S.fo, 0.0001)));
    pedGeo.setDrawRange(0, Math.floor(pedGeo.index.count * Math.min(S.ped * 2, 1) / 6) * 6);
    rachGeo.setDrawRange(0, Math.floor(rachGeo.index.count * Math.max(S.ped * 2 - 1, 0) / 6) * 6);
    piccioli.forEach((q, k) => q.geo.setDrawRange(0, Math.floor(q.geo.index.count * S.ramo[k].v / 6) * 6));
    meshLogo.forEach((m, k) => m.scale.setScalar(Math.max(chicchi[k].r * S.acino[k].v, 0.0001)));
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
    const f = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), hh = 10.6, ww = camera.aspect < 0.8 ? 6.6 : 11.2; // sul telefono conta il grappolo, i capi del tralcio possono uscire
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
    meshLogo.forEach((m, k) => { m.material = k === i ? matBucciaAccesa : matBuccia; });
    sprite.forEach((sp, k) => { sp.material.map = sp.userData.tex[k === i ? 1 : 0]; sp.material.needsUpdate = true; });
  };
  const scheda = (i) => {
    if (i < 0) { if (scelto < 0) card.hidden = true; return; }
    const a = aziende[i], l = loghi[a];
    card.querySelector("b").textContent = a.split(" (")[0];
    card.querySelector(".g3-card-l").innerHTML = l ? `<img src="../shared/img/loghi/${l}.png" alt="">` : `<i>${esc(iniziali(a))}</i>`;
    card.hidden = false; card.dataset.i = i;
    window.LSDVSound && window.LSDVSound.play("hover");
  };
  const fermaGiro = () => { controls.autoRotate = false; clearTimeout(riprendi); };
  const giroAttivo = () => host.querySelector('[data-g3="giro"]').getAttribute("aria-pressed") === "true";
  const riprendiGiro = (ms = 5000) => { clearTimeout(riprendi); riprendi = setTimeout(() => { if (scelto < 0 && giroAttivo() && !RM) controls.autoRotate = true; }, ms); };
  const esplora = (i) => {
    scelto = i; fermaGiro(); accendi(i); scheda(i);
    const p = chicchi[i].p.clone(), fuori = new THREE.Vector3(p.x, 0, p.z).normalize();
    if (fuori.lengthSq() < 0.01) fuori.set(0, 0, 1);
    const pos = p.clone().add(fuori.multiplyScalar(6.2)).add(new THREE.Vector3(0, 0.7, 0));
    if (gsap && !RM) { gsap.to(controls.target, { x: p.x, y: p.y, z: p.z, duration: 1.1, ease: "power3.inOut" }); gsap.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: 1.1, ease: "power3.inOut" }); }
    else { controls.target.copy(p); camera.position.copy(pos); }
    host.classList.add("esplora-uno");
  };
  const chiudi = () => { scelto = -1; accendi(-1); card.hidden = true; host.classList.remove("esplora-uno"); vistaIntera(); riprendiGiro(1400); };

  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const i = colpo(e); canvas.style.cursor = i >= 0 ? "pointer" : (controls.enabled ? "grab" : "default");
    if (i !== sopra) { sopra = i; if (scelto < 0) { accendi(i); scheda(i); } }
  });
  canvas.addEventListener("pointerleave", () => { sopra = -1; if (scelto < 0) { accendi(-1); card.hidden = true; } });
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
  host.querySelector('[data-g3="rivedi"]').addEventListener("click", () => { chiudi(); cresci(); });
  host.querySelector(".g3-lista").addEventListener("click", (e) => { const b = e.target.closest("[data-g3i]"); if (b) esplora(+b.dataset.g3i); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && scelto >= 0) chiudi(); });
  const mostraHint = () => { if (RM) return; hint.hidden = false; setTimeout(() => { hint.hidden = true; }, 7000); };

  // --- ciclo di disegno solo quando il grappolo è visibile ---
  let visibile = false, avviato = false, raf = 0;
  const proiezione = new THREE.Vector3();
  const giro = () => {
    raf = requestAnimationFrame(giro);
    controls.update();
    // le etichette stanno sulla faccia del chicco rivolta verso chi guarda
    chicchi.forEach((c, k) => {
      const m = meshLogo[k], s = m.scale.x;
      sprite[k].position.copy(c.p).add(camera.position.clone().sub(c.p).setLength(s * 1.03));
      sprite[k].scale.setScalar(s * 1.42);
    });
    if (!card.hidden) {
      const i = +card.dataset.i, b = canvas.getBoundingClientRect(), hb = host.getBoundingClientRect();
      proiezione.copy(chicchi[i].p).add(new THREE.Vector3(0, chicchi[i].r, 0)).project(camera);
      card.style.left = Math.min(Math.max((proiezione.x + 1) / 2 * b.width + (b.left - hb.left), 130), hb.width - 130) + "px";
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
  host.__g3 = { cresci, esplora, chiudi };
}

const host = document.querySelector("[data-grappolo3d]");
if (host) {
  if (!webglOk()) riserva(host);
  else crea(host).catch((err) => { console.error("grappolo 3D non disponibile:", err); riserva(host); });
}
