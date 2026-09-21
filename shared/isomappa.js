/* «La strada del vino» in isometria, in stile «terra incisa»: il territorio della DOC come lastra di terra
   tagliata, con curve di livello ogni 25 m sul rilievo reale (DEM), spilli sui comuni, fiume e strada in linea sottile,
   coordinate sui bordi e una bussola. Un punto luminoso percorre la strada e si ferma in ogni paese.
   Il motore costruisce la scena e le sue funzioni; le timeline stanno in chi lo usa (intro e viaggio). */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const KX = 0.866, KY = 0.5, KZ = 0.2;             // proiezione isometrica; KZ = pixel di rilievo per metro (esagerato)
  const SPESSORE = 34;                              // fianco della lastra
  const RAMPA = [[0, "#A8B983"], [0.25, "#7E9760"], [0.5, "#55744A"], [0.75, "#375338"], [1, "#213622"]];
  const mixc = (a, b, t) => { const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); const c = (s) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t); return "#" + [16, 8, 0].map((s) => c(s).toString(16).padStart(2, "0")).join(""); };
  const rampa = (t) => { t = Math.max(0, Math.min(1, t)); for (let i = 1; i < RAMPA.length; i++) if (t <= RAMPA[i][0]) return mixc(RAMPA[i - 1][1], RAMPA[i][1], (t - RAMPA[i - 1][0]) / (RAMPA[i][0] - RAMPA[i - 1][0])); return RAMPA[RAMPA.length - 1][1]; };
  const P = (x, y, z = 0) => [(x - y) * KX, (x + y) * KY - z * KZ];
  const f1 = (n) => (Math.round(n * 10) / 10).toString();
  const el = (t, a = {}, h = "") => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (h) e.innerHTML = h; return e; };
  const LON0 = 14.175, LON1 = 14.5, LAT0 = 41.08, LAT1 = 41.275, VWm = 1600, VHm = 1267;
  const gm = (v, ns) => { const a = Math.abs(v), d = Math.floor(a), m = Math.round((a - d) * 60); return `${d}°${String(m).padStart(2, "0")}′ ${ns}`; };

  function crea(root, opt = {}) {
    const I = window.LSDV_ISO;
    const [X0, Y0, X1, Y1] = I.ritaglio;
    const svg = el("svg", { class: "iso", role: "img", "aria-label": "Mappa isometrica del territorio della DOC con gli otto comuni collegati dalla Strada del Vino", preserveAspectRatio: "xMidYMid meet" });
    root.classList.add("iso-root"); root.appendChild(svg);

    const B = { x0: P(X0, Y1)[0] - 70, x1: P(X1, Y0)[0] + 90, y0: P(X0, Y0)[1] - 930 * KZ - 90, y1: P(X1, Y1)[1] + SPESSORE + 90 };
    B.w = B.x1 - B.x0; B.h = B.y1 - B.y0;

    const strati = I.strati, zmin = strati[0].q, zmax = strati[strati.length - 1].q;
    const livelloDi = (z) => { let n = 0; strati.forEach((s) => { if (z >= s.q) n++; }); return n; };
    const liftDi = (i) => (i === 0 ? 0 : strati[i - 1].q * KZ);
    const proietta = (d) => d.replace(/M([^MZ]*)Z/g, (_, s) => {
      const n = s.trim().split(/\s+/).map(Number), o = [];
      for (let i = 0; i < n.length; i += 2) { const p = P(n[i], n[i + 1]); o.push((i ? "L" : "M") + f1(p[0]) + " " + f1(p[1])); }
      return o.join("") + "Z";
    });
    const rett = () => { const a = P(X0, Y0), b = P(X1, Y0), c = P(X1, Y1), d = P(X0, Y1); return `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}L${f1(c[0])} ${f1(c[1])}L${f1(d[0])} ${f1(d[1])}Z`; };

    svg.appendChild(el("defs", {}, `
      <filter id="isoBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
      <filter id="isoBlur2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
      <linearGradient id="isoLato1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2C4430"/><stop offset="1" stop-color="#101C12"/></linearGradient>
      <linearGradient id="isoLato2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#20352A"/><stop offset="1" stop-color="#0B140D"/></linearGradient>
      <linearGradient id="isoLuce" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="isoClip"><path d="${rett()}"/></clipPath>`));

    // ombra sotto la lastra
    { const c = P((X0 + X1) / 2, (Y0 + Y1) / 2); svg.appendChild(el("ellipse", { class: "iso-ombra", cx: f1(c[0] + 30), cy: f1(c[1] + SPESSORE + 70), rx: f1(B.w * 0.34), ry: f1(B.h * 0.07), fill: "rgba(40,30,15,.22)", filter: "url(#isoBlur)" })); }

    // ---- lastra: fianchi con le stratificazioni ----
    const gT = el("g", { class: "iso-terra" }); svg.appendChild(gT);
    const gruppi = [];
    for (let i = 0; i <= strati.length; i++) {
      const g = el("g", { class: "iso-l", "data-i": i }), q = i === 0 ? zmin - 25 : strati[i - 1].q;
      const t = (q - zmin) / (zmax - zmin), col = rampa(t), lift = liftDi(i), indice = i > 0 && q % 100 === 0;
      const d = i === 0 ? rett() : proietta(strati[i - 1].d);
      if (i === 0) {
        const A = P(X0, Y1), C = P(X1, Y1), Bp = P(X1, Y0);
        const f = (a, b, h) => `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}L${f1(b[0])} ${f1(b[1] + h)}L${f1(a[0])} ${f1(a[1] + h)}Z`;
        g.appendChild(el("path", { d: f(A, C, SPESSORE), fill: "url(#isoLato1)" }));
        g.appendChild(el("path", { d: f(C, Bp, SPESSORE), fill: "url(#isoLato2)" }));
        // strati sottili sui fianchi
        let ln = "";
        for (let k = 1; k <= 7; k++) { const h = (SPESSORE * k) / 8; ln += `M${f1(A[0])} ${f1(A[1] + h)}L${f1(C[0])} ${f1(C[1] + h)}L${f1(Bp[0])} ${f1(Bp[1] + h)}`; }
        g.appendChild(el("path", { d: ln, class: "iso-strati" }));
      } else {
        g.appendChild(el("path", { d, fill: mixc(col, "#0B140D", 0.42), transform: `translate(0,${f1(-liftDi(i - 1))})` }));
      }
      g.appendChild(el("path", { class: "iso-top" + (indice ? " iso-indice" : ""), d, fill: col, transform: `translate(0,${f1(-lift)})` }));
      gT.appendChild(g); gruppi.push(g);
    }
    // striscia di luce che attraversa il rilievo
    const luce = el("g", { "clip-path": "url(#isoClip)", class: "iso-luce-g", style: "pointer-events:none" });
    luce.appendChild(el("rect", { class: "iso-luce-r", x: f1(B.x0 - 260), y: f1(B.y0 - 100), width: 260, height: f1(B.h + 400), fill: "url(#isoLuce)", transform: "skewX(-24)" }));
    svg.appendChild(luce);

    // ---- coordinate sui bordi e bussola ----
    const gC = el("g", { class: "iso-coord" }); svg.appendChild(gC);
    {
      const A = P(X0, Y1), C = P(X1, Y1), Bp = P(X1, Y0);
      let ticks = "", txt = "";
      const mappaLon = (x) => LON0 + (x / VWm) * (LON1 - LON0), mappaLat = (y) => LAT1 - (y / VHm) * (LAT1 - LAT0);
      for (let k = 0; k <= 6; k++) {
        const x = X0 + ((X1 - X0) * k) / 6, p = P(x, Y1);
        ticks += `M${f1(p[0])} ${f1(p[1] + SPESSORE)}l0 6`;
        if (k % 2 === 0) txt += `<text transform="translate(${f1(p[0])} ${f1(p[1] + SPESSORE + 22)}) rotate(30)">${gm(mappaLon(x), "E")}</text>`;
      }
      for (let k = 0; k <= 4; k++) {
        const y = Y1 - ((Y1 - Y0) * k) / 4, p = P(X1, y);
        ticks += `M${f1(p[0])} ${f1(p[1] + SPESSORE)}l0 6`;
        if (k % 2 === 0) txt += `<text transform="translate(${f1(p[0] + 8)} ${f1(p[1] + SPESSORE + 20)}) rotate(-30)">${gm(mappaLat(y), "N")}</text>`;
      }
      gC.innerHTML = `<path d="${ticks}" class="iso-tacche"/>${txt}`;
      // bussola
      const cx = B.x1 - 86, cy = B.y0 + 250;
      gC.insertAdjacentHTML("beforeend", `<g class="iso-nord" transform="translate(${f1(cx)} ${f1(cy)}) scale(1.7)"><circle r="30" fill="none"/><circle r="2" class="pt"/><path d="M0 0 L-6 4 L${f1(24 * KX)} ${f1(-24 * KY)}Z" class="ago"/><path d="M0 0 L6 -4 L${f1(-14 * KX)} ${f1(14 * KY)}Z" class="ago2"/><text x="${f1(38 * KX)}" y="${f1(-38 * KY + 4)}">N</text></g>`);
    }

    // ---- fiumi ----
    const gF = el("g", { class: "iso-fiumi" }); svg.appendChild(gF);
    const fiumi = I.fiumi.map((r) => {
      const d = r.map((p, i) => { const q = P(p[0], p[1], p[2]); return (i ? "L" : "M") + f1(q[0]) + " " + f1(q[1]); }).join("");
      const g = el("g", { class: "iso-fiume" }); g.appendChild(el("path", { d, class: "iso-acqua" })); g.appendChild(el("path", { d, class: "iso-luce" }));
      gF.appendChild(g); return g;
    });

    // ---- strada ----
    const gS = el("g", { class: "iso-strada" }); svg.appendChild(gS);
    const strade = I.strade.map((s, i) => {
      const pts = s.pts.map((q) => P(q[0], q[1], q[2] + 3));
      let d = "M" + f1(pts[0][0]) + " " + f1(pts[0][1]);
      for (let k = 0; k < pts.length - 1; k++) { const p0 = pts[k - 1] || pts[k], p1 = pts[k], p2 = pts[k + 1], p3 = pts[k + 2] || p2; d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`; }
      const mid = `isoM${i}`, defs = el("defs", {}, `<mask id="${mid}" maskUnits="userSpaceOnUse" x="${f1(B.x0)}" y="${f1(B.y0)}" width="${f1(B.w)}" height="${f1(B.h)}"><path class="iso-mk" d="${d}" fill="none" stroke="#fff" stroke-width="12"/></mask>`);
      const g = el("g", { class: "iso-tratto" }); g.appendChild(defs);
      const bordo = el("path", { class: "iso-r-bordo", d }), asf = el("path", { class: "iso-r-asf", d }), mez = el("path", { class: "iso-r-mez", d, mask: `url(#${mid})` });
      g.appendChild(bordo); g.appendChild(asf); g.appendChild(mez); gS.appendChild(g);
      return { da: s.da, a: s.a, bordo, asf, mez, mk: defs.querySelector(".iso-mk"), len: asf.getTotalLength() };
    });

    // ---- paesi: spilli con etichetta ----
    const paesi = {}, gP = el("g", { class: "iso-paesi" }); svg.appendChild(gP);
    const testi = window.LSDV ? window.LSDV.comuni : [];
    I.paesi.forEach((p) => {
      const base = P(p.x, p.y, p.z + 2), alt = 74, cima = [base[0], base[1] - alt];
      const c = testi.find((x) => x.id === p.id), nome = c ? c.nome : p.nome;
      const g = el("g", { class: "iso-paese", "data-id": p.id });
      g.innerHTML = `<ellipse class="iso-piede" cx="${f1(base[0])}" cy="${f1(base[1])}" rx="13" ry="6.5"/><path class="iso-asta" d="M${f1(base[0])} ${f1(base[1])}L${f1(cima[0])} ${f1(cima[1])}"/>
        <circle class="iso-onda" cx="${f1(base[0])}" cy="${f1(base[1])}" r="5"/><circle class="iso-punto" cx="${f1(base[0])}" cy="${f1(base[1])}" r="5"/><circle class="iso-testa" cx="${f1(cima[0])}" cy="${f1(cima[1])}" r="4.4"/>
        <text class="iso-l-n" x="${f1(cima[0] + 12)}" y="${f1(cima[1] + 5)}">${nome}</text>
        <g class="iso-l-g" transform="translate(${f1(cima[0])} ${f1(cima[1] - 26)})"><text class="iso-l-big" y="0">${nome}</text><text class="iso-l-q" y="22">${Math.round(p.q)} m s.l.m.</text></g>`;
      gP.appendChild(g);
      paesi[p.id] = { ...p, g, lab: g, nome, sx: base[0], sy: base[1] };
    });

    // ---- punto luminoso che percorre la strada ----
    const gFx = el("g", { class: "iso-fx" }); svg.appendChild(gFx);
    const gScia = el("g", { class: "iso-polvere" }); gFx.appendChild(gScia);
    const auto = el("g", { class: "iso-auto", opacity: 0 });
    auto.innerHTML = `<circle class="iso-alone" r="22"/><g class="iso-auto-c"><circle class="iso-auto-onda" r="8"/><circle class="iso-auto-p" r="7"/></g>`;
    gFx.appendChild(auto);
    const gCielo = el("g", { class: "iso-cielo" }); svg.appendChild(gCielo);

    // ---- vista ----
    let vista = { cx: B.x0 + B.w / 2, cy: B.y0 + B.h / 2, w: B.w };
    const rapporto = () => { const r = root.getBoundingClientRect(); return r.width && r.height ? r.height / r.width : 0.6; };
    function vai(cx, cy, w) { vista = { cx, cy, w }; const h = w * rapporto(); svg.setAttribute("viewBox", `${f1(cx - w / 2)} ${f1(cy - h / 2)} ${f1(w)} ${f1(h)}`); }
    const intera = () => { const r = rapporto(), w = Math.max(B.w, (B.h * 1.02) / r); return { cx: B.x0 + B.w / 2, cy: B.y0 + B.h / 2, w }; };
    { const v = intera(); vai(v.cx, v.cy, v.w); }

    function posiziona(i, t, rev) {
      const s = strade[i], u = rev ? 1 - t : t, p = s.asf.getPointAtLength(s.len * u), q = s.asf.getPointAtLength(Math.max(0, Math.min(s.len, s.len * u + (rev ? -3 : 3))));
      auto.setAttribute("transform", `translate(${f1(p.x)} ${f1(p.y)})`);
      return { x: p.x, y: p.y, dir: q.x - p.x >= 0 ? 1 : -1 };
    }
    let ultima = null;
    function polvere(x, y) {
      if (ultima && Math.hypot(x - ultima[0], y - ultima[1]) < 11) return; ultima = [x, y];
      const c = el("circle", { cx: f1(x), cy: f1(y), r: 2.2, fill: "#FCF6E1" }); gScia.appendChild(c);
      if (window.gsap) gsap.to(c, { attr: { r: 0.4 }, opacity: 0, duration: 1.1, ease: "power1.out", onComplete: () => c.remove() }); else c.remove();
    }
    function mostraEtichetta(id, on) { const p = paesi[id]; if (p) p.g.classList.toggle("on", !!on); }
    function disegnaTratto(i, p) { const s = strade[i]; if (!window.gsap) return; [s.bordo, s.asf, s.mk].forEach((e) => gsap.set(e, { drawSVG: `0% ${p * 100}%` })); }

    return { svg, root, B, P, paesi, strade, gruppi, fiumi, alberi: [], auto, gCielo, gFx, posiziona, polvere, mostraEtichetta, disegnaTratto, vai, vista: () => vista, intera, rapporto };
  }
  window.LSDVIso = { crea, P };
})();
