/* «La strada del vino» in isometria: il territorio della DOC come modello a strati (dal DEM reale),
   otto paesi con case e campanile, una strada immaginaria che li collega e un'auto che la percorre.
   Micro-animazioni: alberi al vento, fumo dai camini, fiume, nuvole, uccelli, polvere dietro l'auto.
   Il motore costruisce solo la scena e le sue funzioni; le timeline stanno in chi lo usa (intro e viaggio). */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const KX = 0.866, KY = 0.5, KZ = 0.24;            // proiezione isometrica; KZ = pixel di rilievo per metro (esagerato)
  const SPESSORE = 70;                              // fianco del blocco di terra
  const COL = ["#E9E0B6", "#DAD88F", "#C6D06F", "#AFC456", "#93AE45", "#789A38", "#5F822E", "#4B6A26", "#3E5820", "#344B1B"];
  const mix = (hex, con, t) => { const a = parseInt(hex.slice(1), 16), b = parseInt(con.slice(1), 16); const c = (s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t); return "#" + [16, 8, 0].map((s) => c(s).toString(16).padStart(2, "0")).join(""); };
  const P = (x, y, z = 0) => [(x - y) * KX, (x + y) * KY - z * KZ];
  const f1 = (n) => (Math.round(n * 10) / 10).toString();
  const seme = (s) => { let v = s; return () => ((v = (v * 16807) % 2147483647) / 2147483647); };
  const el = (t, a = {}, h = "") => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (h) e.innerHTML = h; return e; };

  function crea(root, opt = {}) {
    const I = window.LSDV_ISO, D = window.LSDVCore.D;
    const [X0, Y0, X1, Y1] = I.ritaglio, rnd = seme(7);
    const svg = el("svg", { class: "iso", role: "img", "aria-label": "Mappa isometrica del territorio della DOC con gli otto comuni collegati dalla Strada del Vino", preserveAspectRatio: "xMidYMid meet" });
    root.classList.add("iso-root"); root.appendChild(svg);

    // ---- limiti della scena ----
    const zmax = 900;
    const B = { x0: P(X0, Y1)[0] - 30, x1: P(X1, Y0)[0] + 30, y0: P(X0, Y0)[1] - 930 * KZ - 34, y1: P(X1, Y1)[1] + SPESSORE + 60 };
    B.w = B.x1 - B.x0; B.h = B.y1 - B.y0;

    const strati = I.strati;
    const livelloDi = (z) => { let n = 0; strati.forEach((s) => { if (z >= s.q) n++; }); return n; };
    const liftDi = (i) => (i === 0 ? 0 : strati[i - 1].q * KZ);

    // proietta un tracciato «M x y x y ... Z» con quota 0 (poi il gruppo scorre in verticale)
    const proietta = (d) => d.replace(/M([^MZ]*)Z/g, (_, s) => {
      const n = s.trim().split(/\s+/).map(Number), o = [];
      for (let i = 0; i < n.length; i += 2) { const p = P(n[i], n[i + 1]); o.push((i ? "L" : "M") + f1(p[0]) + " " + f1(p[1])); }
      return o.join("") + "Z";
    });
    const rett = (dy = 0) => { const a = P(X0, Y0), b = P(X1, Y0), c = P(X1, Y1), d = P(X0, Y1); return `M${f1(a[0])} ${f1(a[1] + dy)}L${f1(b[0])} ${f1(b[1] + dy)}L${f1(c[0])} ${f1(c[1] + dy)}L${f1(d[0])} ${f1(d[1] + dy)}Z`; };

    // ---- defs ----
    svg.appendChild(el("defs", {}, `
      <filter id="isoBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
      <filter id="isoBlur2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
      <linearGradient id="isoLato1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A4A2E"/><stop offset="1" stop-color="#2E1A0E"/></linearGradient>
      <linearGradient id="isoLato2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#553820"/><stop offset="1" stop-color="#1F1108"/></linearGradient>`));

    const gOmbra = el("g", { class: "iso-ombra" }); svg.appendChild(gOmbra);
    { const c = P((X0 + X1) / 2, (Y0 + Y1) / 2); gOmbra.appendChild(el("ellipse", { cx: f1(c[0] + 40), cy: f1(c[1] + SPESSORE + 130), rx: f1(B.w * 0.36), ry: f1(B.h * 0.1), fill: "rgba(40,20,10,.2)", filter: "url(#isoBlur)" })); }
    const gT = el("g", { class: "iso-terra" }); svg.appendChild(gT);

    // ---- strati ----
    const gruppi = [];
    for (let i = 0; i <= strati.length; i++) {
      const g = el("g", { class: "iso-l", "data-i": i }), col = COL[Math.min(i, COL.length - 1)], lift = liftDi(i);
      const d = i === 0 ? rett() : proietta(strati[i - 1].d);
      if (i === 0) {
        // fianchi del blocco: parete sud-ovest e parete sud-est
        const A = P(X0, Y1), C = P(X1, Y1), Bp = P(X1, Y0);
        g.appendChild(el("path", { class: "iso-lato", d: `M${f1(A[0])} ${f1(A[1])}L${f1(C[0])} ${f1(C[1])}L${f1(C[0])} ${f1(C[1] + SPESSORE)}L${f1(A[0])} ${f1(A[1] + SPESSORE)}Z`, fill: "url(#isoLato1)" }));
        g.appendChild(el("path", { class: "iso-lato", d: `M${f1(C[0])} ${f1(C[1])}L${f1(Bp[0])} ${f1(Bp[1])}L${f1(Bp[0])} ${f1(Bp[1] + SPESSORE)}L${f1(C[0])} ${f1(C[1] + SPESSORE)}Z`, fill: "url(#isoLato2)" }));
      } else {
        // parete: la stessa regione, più in basso, più scura; la faccia superiore la lascia intravedere sul bordo
        g.appendChild(el("path", { d, fill: mix(col, "#442413", 0.42), transform: `translate(0,${f1(-liftDi(i - 1))})` }));
      }
      g.appendChild(el("path", { class: "iso-top", d, fill: col, transform: `translate(0,${f1(-lift)})` }));
      const oggetti = el("g", { class: "iso-og" }); g.appendChild(oggetti); g._og = oggetti;
      gT.appendChild(g); gruppi.push(g);
    }
    const gLivello = (z) => gruppi[livelloDi(z)]._og;

    // ---- fiumi ----
    const fiumi = [];
    I.fiumi.forEach((r) => {
      const d = r.map((p, i) => { const q = P(p[0], p[1], p[2]); return (i ? "L" : "M") + f1(q[0]) + " " + f1(q[1]); }).join("");
      const g = el("g", { class: "iso-fiume" }); g.appendChild(el("path", { d, class: "iso-acqua" })); g.appendChild(el("path", { d, class: "iso-luce" }));
      gruppi[0]._og.appendChild(g); fiumi.push(g);
    });

    // ---- vigneti: appezzamenti con i filari ----
    I.vigneti.forEach(([x, y, z, ang, w, h]) => {
      const a = (ang * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux, k = 7, c = [], righe = [];
      const pt = (s, t) => P(x + ux * s + vx * t, y + uy * s + vy * t, z);
      [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].forEach((q) => c.push(pt(q[0], q[1])));
      for (let i = 0; i < k; i++) { const s = -w / 2 + ((i + 0.5) * w) / k, p = pt(s, -h / 2), q = pt(s, h / 2); righe.push(`M${f1(p[0])} ${f1(p[1])}L${f1(q[0])} ${f1(q[1])}`); }
      const g = el("g", { class: "iso-vigna" });
      g.appendChild(el("path", { d: "M" + c.map((p) => f1(p[0]) + " " + f1(p[1])).join("L") + "Z", class: "iso-vigna-f" }));
      g.appendChild(el("path", { d: righe.join(""), class: "iso-vigna-r" }));
      gLivello(z).appendChild(g);
    });

    // ---- alberi ----
    const alberiEl = [];
    I.alberi.slice().sort((a, b) => a[0] + a[1] - (b[0] + b[1])).forEach(([x, y, z, tipo, s]) => {
      const [px, py] = P(x, y, z), g = el("g", { class: "iso-albero", transform: `translate(${f1(px)} ${f1(py)}) scale(${s})` });
      const tinte = ["#3F5F25", "#2E4A1E", "#5C7D2F"], t = tinte[(x + y) % 3];
      g.appendChild(el("ellipse", { cx: 3, cy: 1, rx: 6, ry: 2.4, fill: "rgba(30,15,5,.28)" }));
      const alb = el("g", { class: "iso-sw", style: `animation-delay:${-(((x * 7 + y * 3) % 40) / 10).toFixed(1)}s;animation-duration:${(3.2 + ((x + y) % 30) / 10).toFixed(1)}s` });
      if (tipo === 1) { alb.innerHTML = `<rect x="-.7" y="-4" width="1.4" height="4" fill="#5A3A22"/><ellipse cx="0" cy="-11" rx="3.3" ry="9" fill="${t}"/><ellipse cx="-1" cy="-13" rx="1.2" ry="5" fill="rgba(255,255,255,.14)"/>`; }
      else if (tipo === 2) { alb.innerHTML = `<rect x="-.8" y="-3" width="1.6" height="3" fill="#5A3A22"/><path d="M0 -17 L6 -4 L-6 -4Z" fill="${t}"/><path d="M0 -17 L-6 -4 L-1 -4Z" fill="rgba(255,255,255,.12)"/>`; }
      else { alb.innerHTML = `<rect x="-.8" y="-5" width="1.6" height="5" fill="#5A3A22"/><circle cx="0" cy="-9" r="5.4" fill="${t}"/><circle cx="-1.6" cy="-10.6" r="2.2" fill="rgba(255,255,255,.16)"/>`; }
      g.appendChild(alb); gLivello(z).appendChild(g); alberiEl.push(g);
    });

    // ---- paesi: casette, campanile, fumo ----
    const paesi = {};
    const cubo = (x, y, z, s, h, tetto, pareteL, pareteR) => {
      const a = P(x - s / 2, y - s / 2, z), b = P(x + s / 2, y - s / 2, z), c = P(x + s / 2, y + s / 2, z), d = P(x - s / 2, y + s / 2, z), u = h;
      const q = (p) => f1(p[0]) + " " + f1(p[1]), qu = (p) => f1(p[0]) + " " + f1(p[1] - u);
      const cm = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 - u - Math.min(6, u * 0.45)];
      return `<path d="M${q(d)}L${q(c)}L${qu(c)}L${qu(d)}Z" fill="${pareteL}"/><path d="M${q(c)}L${q(b)}L${qu(b)}L${qu(c)}Z" fill="${pareteR}"/>` +
        `<path d="M${qu(d)}L${qu(c)}L${qu(b)}L${f1(cm[0])} ${f1(cm[1])}Z" fill="${tetto}"/><path d="M${qu(d)}L${f1(cm[0])} ${f1(cm[1])}L${qu(b)}L${qu(a)}Z" fill="${mix(tetto, "#000000", .16)}"/>`;
    };
    I.paesi.forEach((p, k) => {
      const r = seme(101 + k * 17), g = el("g", { class: "iso-paese", "data-id": p.id }), base = P(p.x, p.y, p.z);
      const case_ = []; const N = 8;
      for (let i = 0; i < N; i++) {
        const a = r() * Math.PI * 2, rr = 9 + r() * 30;
        case_.push({ x: p.x + Math.cos(a) * rr, y: p.y + Math.sin(a) * rr, s: 12 + r() * 7, h: 11 + r() * 8, t: ["#B5573A", "#C4633F", "#A54B33"][Math.floor(r() * 3)] });
      }
      case_.sort((a, b) => a.x + a.y - (b.x + b.y));
      const chiesa = { x: p.x - 2, y: p.y - 4 };
      let h = "";
      case_.forEach((c) => { if (Math.hypot(c.x - chiesa.x, c.y - chiesa.y) < 13) return; h += cubo(c.x, c.y, p.z, c.s, c.h, c.t, "#F3E7CC", "#D9C6A0"); });
      // campanile
      h += cubo(chiesa.x, chiesa.y, p.z, 11, 40, "#7C2F4B", "#F6ECD6", "#DCC9A5");
      g.innerHTML = `<ellipse cx="${f1(base[0] + 4)}" cy="${f1(base[1] + 6)}" rx="46" ry="18" fill="rgba(30,15,5,.22)" filter="url(#isoBlur2)"/><g class="iso-case">${h}</g>`;
      // fumo dai camini
      for (let i = 0; i < 3; i++) { const c = case_[(i * 2 + 1) % case_.length], q = P(c.x, c.y, p.z); const f = el("circle", { class: "iso-fumo", cx: f1(q[0] + 2), cy: f1(q[1] - c.h - 8), r: 2.4, style: `animation-delay:${-(i * 1.3 + k * 0.4).toFixed(1)}s` }); g.appendChild(f); }
      gLivello(p.z).appendChild(g);
      const top = P(p.x, p.y, p.z);
      // etichetta
      const testo = window.LSDV.comuni.find((c) => c.id === p.id), nome = testo ? testo.nome : p.nome;
      const lab = el("g", { class: "iso-lab", transform: `translate(${f1(top[0])} ${f1(top[1] - 66)})`, opacity: 0 });
      const w = Math.max(96, nome.length * 9.6 + 30);
      lab.innerHTML = `<path d="M-7 17 L0 27 L7 17Z" fill="#FCF6E1"/><rect x="${f1(-w / 2)}" y="-24" width="${f1(w)}" height="42" rx="21" fill="#FCF6E1" stroke="#442413" stroke-width="1.6"/><text class="iso-lab-n" y="-4">${nome}</text><text class="iso-lab-q" y="10">${Math.round(p.q)} m s.l.m.</text>`;
      paesi[p.id] = { ...p, g, lab, sx: top[0], sy: top[1], nome };
    });

    // ---- strada ----
    const gS = el("g", { class: "iso-strada" }); svg.appendChild(gS);
    const strade = I.strade.map((s, i) => {
      const pts = s.pts.map((q) => P(q[0], q[1], q[2] + 2));
      // curva morbida per i punti proiettati
      let d = "M" + f1(pts[0][0]) + " " + f1(pts[0][1]);
      for (let k = 0; k < pts.length - 1; k++) { const p0 = pts[k - 1] || pts[k], p1 = pts[k], p2 = pts[k + 1], p3 = pts[k + 2] || p2; d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`; }
      const mid = `isoM${i}`, defs = el("defs", {}, `<mask id="${mid}" maskUnits="userSpaceOnUse" x="${f1(B.x0)}" y="${f1(B.y0)}" width="${f1(B.w)}" height="${f1(B.h)}"><path class="iso-mk" d="${d}" fill="none" stroke="#fff" stroke-width="20"/></mask>`);
      const g = el("g", { class: "iso-tratto" });
      g.appendChild(defs);
      const bordo = el("path", { class: "iso-r-bordo", d }), asf = el("path", { class: "iso-r-asf", d }), mez = el("path", { class: "iso-r-mez", d, mask: `url(#${mid})` });
      g.appendChild(bordo); g.appendChild(asf); g.appendChild(mez); gS.appendChild(g);
      return { da: s.da, a: s.a, bordo, asf, mez, mk: defs.querySelector(".iso-mk"), len: asf.getTotalLength() };
    });

    // ---- effetti: nuvole, uccelli, polvere, auto ----
    const gFx = el("g", { class: "iso-fx" }); svg.appendChild(gFx);
    const gPolvere = el("g", { class: "iso-polvere" }); gFx.appendChild(gPolvere);
    const gEtichette = el("g", { class: "iso-etichette" }); gFx.appendChild(gEtichette);
    Object.values(paesi).forEach((p) => gEtichette.appendChild(p.lab));
    const auto = el("g", { class: "iso-auto", opacity: 0 });
    auto.innerHTML = `<ellipse cx="0" cy="3.4" rx="9" ry="2.6" fill="rgba(30,15,5,.35)"/><g class="iso-auto-c"><rect x="-9" y="-7" width="18" height="8.4" rx="2.6" fill="#7C2F4B"/><path d="M1 -7 L5 -12 L11 -12 L11 -7Z" fill="#FCF6E1" transform="translate(-2 0)"/><rect x="-7" y="-12" width="7" height="5" rx="1.4" fill="#FCF6E1"/><circle cx="-4.8" cy="1.6" r="2.5" fill="#2E1A0E"/><circle cx="4.8" cy="1.6" r="2.5" fill="#2E1A0E"/><circle cx="-4.8" cy="1.6" r=".9" fill="#ADC136"/><circle cx="4.8" cy="1.6" r=".9" fill="#ADC136"/><circle cx="6.5" cy="-11" r="2.6" fill="#5E2141"/><circle cx="7.8" cy="-11.6" r="2.2" fill="#7C2F4B"/><path d="M6.5 -13.6 q1 -2 2.4 -1.6" stroke="#4B5D23" stroke-width="1" fill="none"/></g>`;
    gFx.appendChild(auto);

    const gCielo = el("g", { class: "iso-cielo" }); svg.appendChild(gCielo);
    [[.12, .1, 1.1, 90], [.42, .06, .8, 120], [.7, .13, 1, 100], [.9, .04, .7, 140]].forEach(([fx, fy, s, dur], i) => {
      const g = el("g", { class: "iso-nuvola", style: `animation-duration:${dur}s;animation-delay:${-i * 27}s`, transform: `translate(${f1(B.x0 + B.w * fx)} ${f1(B.y0 + B.h * fy)}) scale(${s})` });
      g.innerHTML = `<ellipse cx="0" cy="0" rx="70" ry="16" fill="rgba(255,252,240,.62)" filter="url(#isoBlur2)"/><ellipse cx="-24" cy="-9" rx="34" ry="12" fill="rgba(255,252,240,.7)" filter="url(#isoBlur2)"/><ellipse cx="22" cy="-6" rx="30" ry="11" fill="rgba(255,252,240,.66)" filter="url(#isoBlur2)"/>`;
      gCielo.appendChild(g);
    });
    [[.2, .2, 0], [.5, .12, -4], [.75, .18, -9]].forEach(([fx, fy, dl], i) => {
      const g = el("g", { class: "iso-uccello", style: `animation-delay:${dl}s;animation-duration:${26 + i * 5}s`, transform: `translate(${f1(B.x0 + B.w * fx)} ${f1(B.y0 + B.h * fy)})` });
      g.innerHTML = `<path class="iso-ala" d="M-6 0 Q-3 -4 0 0 Q3 -4 6 0" fill="none" stroke="#442413" stroke-width="1.5" stroke-linecap="round"/>`;
      gCielo.appendChild(g);
    });

    // ---- vista ----
    let vista = { cx: B.x0 + B.w / 2, cy: B.y0 + B.h / 2, w: B.w };
    const rapporto = () => { const r = root.getBoundingClientRect(); return r.width && r.height ? r.height / r.width : 0.6; };
    function vai(cx, cy, w) {
      vista = { cx, cy, w }; const h = w * rapporto();
      svg.setAttribute("viewBox", `${f1(cx - w / 2)} ${f1(cy - h / 2)} ${f1(w)} ${f1(h)}`);
    }
    const intera = () => { const r = rapporto(), w = Math.max(B.w, (B.h * 1.02) / r); return { cx: B.x0 + B.w / 2, cy: B.y0 + B.h / 2, w }; };
    { const v = intera(); vai(v.cx, v.cy, v.w); }

    // ---- funzioni di scena ----
    const tratto = (i) => strade[i];
    // posizione dell'auto sul tratto i, a frazione t (0..1), in direzione inversa se rev
    function posiziona(i, t, rev, prec) {
      const s = strade[i], u = rev ? 1 - t : t, p = s.asf.getPointAtLength(s.len * u), q = s.asf.getPointAtLength(Math.max(0, Math.min(s.len, s.len * u + (rev ? -3 : 3))));
      auto.setAttribute("transform", `translate(${f1(p.x)} ${f1(p.y)}) scale(1.75)`);
      const dir = q.x - p.x >= 0 ? 1 : -1;
      const c = auto.firstElementChild.nextElementSibling; c.setAttribute("transform", `scale(${dir} 1)`);
      return { x: p.x, y: p.y, dir };
    }
    let ultimaPolvere = null;
    function polvere(x, y) {
      if (ultimaPolvere && Math.hypot(x - ultimaPolvere[0], y - ultimaPolvere[1]) < 9) return;
      ultimaPolvere = [x, y];
      const c = el("circle", { cx: f1(x), cy: f1(y + 2), r: 2.2, fill: "rgba(250,240,215,.85)" }); gPolvere.appendChild(c);
      if (window.gsap) gsap.to(c, { attr: { r: 7, cy: y - 6 }, opacity: 0, duration: 0.9, ease: "power1.out", onComplete: () => c.remove() }); else c.remove();
    }
    function mostraEtichetta(id, on) {
      const p = paesi[id]; if (!p) return;
      if (!window.gsap) { p.lab.setAttribute("opacity", on ? 1 : 0); return; }
      gsap.to(p.lab, { opacity: on ? 1 : 0, duration: 0.35, overwrite: "auto" });
      gsap.fromTo(p.lab.querySelector("rect"), { scaleY: on ? 0.6 : 1 }, { scaleY: 1, duration: 0.4, ease: "back.out(2)", transformOrigin: "center", overwrite: "auto" });
    }
    function disegnaTratto(i, p) {
      const s = strade[i]; if (!window.gsap) return;
      [s.bordo, s.asf, s.mk].forEach((e) => gsap.set(e, { drawSVG: `0% ${p * 100}%` }));
    }

    // stato iniziale: tutto costruito e visibile; chi anima lo nasconde
    return { svg, root, B, P, paesi, strade, gruppi, fiumi, alberi: alberiEl, auto, gCielo, gFx, posiziona, polvere, mostraEtichetta, disegnaTratto, vai, vista: () => vista, intera, tratto, rapporto };
  }

  window.LSDVIso = { crea, P };
})();
