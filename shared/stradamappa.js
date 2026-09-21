/* «La strada del vino» come carta artistica in piano.
   Lo sfondo è il rilievo reale (DEM) ridotto a fasce di colore, come una stampa a due passaggi: prima solo le curve di livello,
   poi il colore. Un punto corre lungo la strada tra gli otto comuni e la strada, passando, colora la terra.
   Il motore costruisce la scena e le sue funzioni; le timeline stanno in chi lo usa (intro e viaggio). */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;
  // dal fondovalle alla cima: crema, verdi della vigna, poi l'uva
  const RAMPA = [[0, "#F3E9C6"], [0.1, "#E6E4A4"], [0.24, "#CBD86C"], [0.4, "#A1B93B"], [0.55, "#71902F"], [0.7, "#4B5D23"], [0.83, "#7C2F4B"], [1, "#4A1830"]];
  const mixc = (a, b, t) => { const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); const c = (s) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t); return "#" + [16, 8, 0].map((s) => c(s).toString(16).padStart(2, "0")).join(""); };
  const rampa = (t) => { t = Math.max(0, Math.min(1, t)); for (let i = 1; i < RAMPA.length; i++) if (t <= RAMPA[i][0]) return mixc(RAMPA[i - 1][1], RAMPA[i][1], (t - RAMPA[i - 1][0]) / (RAMPA[i][0] - RAMPA[i - 1][0])); return RAMPA[RAMPA.length - 1][1]; };
  const f1 = (n) => (Math.round(n * 10) / 10).toString();
  const el = (t, a = {}, h = "") => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (h) e.innerHTML = h; return e; };

  function crea(root, opt = {}) {
    const I = window.LSDV_ISO, id = "st" + ++uid;
    const [X0, Y0, X1, Y1] = I.ritaglio;
    const svg = el("svg", { class: "iso", role: "img", "aria-label": "Carta del territorio della DOC con la Strada del Vino che collega gli otto comuni", preserveAspectRatio: "xMidYMid slice" });
    root.classList.add("iso-root"); root.appendChild(svg);

    const B = { x0: X0 - 50, y0: Y0 - 50, x1: X1 + 50, y1: Y1 + 50 }; B.w = B.x1 - B.x0; B.h = B.y1 - B.y0;
    const strati = I.strati, zmin = strati[0].q, zmax = strati[strati.length - 1].q;

    svg.appendChild(el("defs", {}, `
      <linearGradient id="${id}-fh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".1" stop-color="#fff"/><stop offset=".9" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
      <linearGradient id="${id}-fv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".2" stop-color="#fff"/><stop offset=".8" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
      <mask id="${id}-fade" maskUnits="userSpaceOnUse" x="${B.x0}" y="${B.y0}" width="${B.w}" height="${B.h}"><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="url(#${id}-fv)"/></mask>
      <mask id="${id}-fade2" maskUnits="userSpaceOnUse" x="${B.x0}" y="${B.y0}" width="${B.w}" height="${B.h}"><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="url(#${id}-fh)"/></mask>
      <filter id="${id}-bl" filterUnits="userSpaceOnUse" x="${B.x0 - 200}" y="${B.y0 - 200}" width="${B.w + 400}" height="${B.h + 400}"><feGaussianBlur stdDeviation="34"/></filter>
      <filter id="${id}-b2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>
      <mask id="${id}-lav" maskUnits="userSpaceOnUse" x="${B.x0}" y="${B.y0}" width="${B.w}" height="${B.h}"><g filter="url(#${id}-bl)" class="st-lav-g"></g></mask>`));
    const lavG = svg.querySelector(".st-lav-g");

    const gOut = el("g", { mask: `url(#${id}-fade2)` }); svg.appendChild(gOut);
    const gM = el("g", { mask: `url(#${id}-fade)` }); gOut.appendChild(gM);

    // ---- colore: fasce ogni 50 m, mascherate dalla strada percorsa ----
    const gCol = el("g", { class: "st-colore", mask: `url(#${id}-lav)`, opacity: 0.24 }); gM.appendChild(gCol);
    strati.forEach((s) => {
      if (s.q % 50) return;
      gCol.appendChild(el("path", { d: s.d, fill: rampa((s.q - zmin) / (zmax - zmin)), "fill-rule": "evenodd" }));
    });
    // un secondo velo di colore, più tenue, su tutta la carta: la terra non è mai del tutto spenta
    const gVelo = el("g", { class: "st-velo" }); gM.insertBefore(gVelo, gCol);
    strati.forEach((s) => { if (s.q % 100) return; gVelo.appendChild(el("path", { d: s.d, fill: rampa((s.q - zmin) / (zmax - zmin)), "fill-rule": "evenodd", opacity: 0.05 })); });

    // ---- curve di livello (le si disegna una a una) ----
    const gL = el("g", { class: "st-linee" }); gM.appendChild(gL);
    const righe = strati.map((s) => { const p = el("path", { d: s.d, class: "st-linea" + (s.q % 100 === 0 ? " st-indice" : "") }); gL.appendChild(p); return p; });

    // ---- fiumi ----
    const gF = el("g", { class: "st-fiumi" }); gM.appendChild(gF);
    const fiumi = I.fiumi.map((r) => {
      const d = r.map((p, i) => (i ? "L" : "M") + f1(p[0]) + " " + f1(p[1])).join("");
      const g = el("g", { class: "st-fiume" }); g.appendChild(el("path", { d, class: "st-acqua" })); g.appendChild(el("path", { d, class: "st-brilla" }));
      gF.appendChild(g); return g;
    });

    // ---- strada ----
    const gS = el("g", { class: "st-strada" }); gM.appendChild(gS);
    const strade = I.strade.map((s, i) => {
      const pts = s.pts.map((q) => [q[0], q[1]]);
      let d = "M" + f1(pts[0][0]) + " " + f1(pts[0][1]);
      for (let k = 0; k < pts.length - 1; k++) { const p0 = pts[k - 1] || pts[k], p1 = pts[k], p2 = pts[k + 1], p3 = pts[k + 2] || p2; d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`; }
      const mid = `${id}-m${i}`;
      const defs = el("defs", {}, `<mask id="${mid}" maskUnits="userSpaceOnUse" x="${B.x0}" y="${B.y0}" width="${B.w}" height="${B.h}"><path class="st-mk" d="${d}" fill="none" stroke="#fff" stroke-width="14"/></mask>`);
      const g = el("g", { class: "st-tratto" }); g.appendChild(defs);
      const bordo = el("path", { class: "st-r-bordo", d }), asf = el("path", { class: "st-r-asf", d }), mez = el("path", { class: "st-r-mez", d, mask: `url(#${mid})` });
      g.appendChild(bordo); g.appendChild(asf); g.appendChild(mez); gS.appendChild(g);
      // pennellata di colore lungo il tratto
      const lav = el("path", { class: "st-lav-mk", d, fill: "none", stroke: "#fff", "stroke-width": 300, "stroke-linecap": "round", "stroke-linejoin": "round" }); lavG.appendChild(lav);
      return { da: s.da, a: s.a, bordo, asf, mez, mk: defs.querySelector(".st-mk"), lav, len: asf.getTotalLength() };
    });

    // ---- paesi ----
    const paesi = {}, gP = el("g", { class: "st-paesi" }); gM.appendChild(gP);
    const testi = window.LSDV ? window.LSDV.comuni : [];
    I.paesi.forEach((p, k) => {
      const c = testi.find((x) => x.id === p.id), nome = c ? c.nome : p.nome, su = k % 2 === 0 ? -1 : 1;
      const g = el("g", { class: "st-paese", "data-id": p.id });
      g.innerHTML = `<circle class="st-onda" cx="${p.x}" cy="${p.y}" r="8"/><circle class="st-punto" cx="${p.x}" cy="${p.y}" r="7.5"/><circle class="st-nocc" cx="${p.x}" cy="${p.y}" r="2.6"/>
        <text class="st-l-n" x="${p.x + (p.x > 1250 ? -15 : 15)}" y="${p.y + 4.5}"${p.x > 1250 ? " text-anchor=\"end\"" : ""}>${nome}</text>
        <g class="st-l-g" transform="translate(${p.x + (p.x > 1150 ? 22 : p.x < 400 ? -22 : 0)} ${p.y + su * 46})" style="--a:${p.x > 1150 ? "end" : p.x < 400 ? "start" : "middle"}"><text class="st-l-big">${nome}</text><text class="st-l-q" y="${su < 0 ? -50 : 22}">${Math.round(p.q)} m s.l.m.</text></g>`;
      // il titolo grande sta sopra o sotto il punto; la quota dalla parte opposta al titolo
      g.querySelector(".st-l-q").setAttribute("y", su < 0 ? 24 : -50);
      gP.appendChild(g); paesi[p.id] = { ...p, g, lab: g, nome, sx: p.x, sy: p.y };
    });

    // ---- punto che percorre la strada ----
    const gFx = el("g", { class: "st-fx" }); gM.appendChild(gFx);
    const gScia = el("g", { class: "st-scia" }); gFx.appendChild(gScia);
    const auto = el("g", { class: "iso-auto", opacity: 0 });
    auto.innerHTML = `<circle class="st-auto-onda" r="9"/><g class="iso-auto-c"><circle class="st-punto-mobile" r="6"/></g>`;
    gFx.appendChild(auto);

    // ---- vista ----
    let vista = { cx: B.x0 + B.w / 2, cy: B.y0 + B.h / 2, w: B.w };
    const rapporto = () => { const r = root.getBoundingClientRect(); return r.width && r.height ? r.height / r.width : 0.56; };
    function vai(cx, cy, w) { vista = { cx, cy, w }; const h = w * rapporto(); svg.setAttribute("viewBox", `${f1(cx - w / 2)} ${f1(cy - h / 2)} ${f1(w)} ${f1(h)}`); }
    const intera = () => { const r = rapporto(), w = r > 0.9 ? B.w : B.w * 0.97; return { cx: B.x0 + B.w / 2, cy: B.y0 + B.h / 2 + 10, w }; };
    { const v = intera(); vai(v.cx, v.cy, v.w); }

    function posiziona(i, t, rev) {
      const s = strade[i], u = rev ? 1 - t : t, p = s.asf.getPointAtLength(s.len * u), q = s.asf.getPointAtLength(Math.max(0, Math.min(s.len, s.len * u + (rev ? -3 : 3))));
      auto.setAttribute("transform", `translate(${f1(p.x)} ${f1(p.y)})`);
      return { x: p.x, y: p.y, dir: q.x - p.x >= 0 ? 1 : -1 };
    }
    let ultima = null;
    function polvere(x, y) {
      if (ultima && Math.hypot(x - ultima[0], y - ultima[1]) < 16) return; ultima = [x, y];
      const c = el("circle", { cx: f1(x + (Math.random() - 0.5) * 8), cy: f1(y + (Math.random() - 0.5) * 8), r: 3.4, fill: Math.random() > 0.5 ? "#7C2F4B" : "#ADC136" }); gScia.appendChild(c);
      if (window.gsap) gsap.to(c, { attr: { r: 0.4, cy: y - 26 - Math.random() * 20 }, opacity: 0, duration: 1.3, ease: "power1.out", onComplete: () => c.remove() }); else c.remove();
    }
    function mostraEtichetta(idp, on) { const p = paesi[idp]; if (p) p.g.classList.toggle("on", !!on); }
    function disegnaTratto(i, p) { const s = strade[i]; if (!window.gsap) return; [s.bordo, s.asf, s.mk, s.lav].forEach((e) => gsap.set(e, { drawSVG: `0% ${p * 100}%` })); }

    return { svg, root, B, paesi, strade, righe, fiumi, auto, gFx, posiziona, polvere, mostraEtichetta, disegnaTratto, vai, vista: () => vista, intera, rapporto };
  }
  window.LSDVIso = { crea };
})();
