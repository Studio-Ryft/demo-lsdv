/* «Il tralcio della rete»: il nome della Strada è il ramo principale; in circa dieci secondi
   ne nascono i piccioli e su ognuno matura un chicco con il logotipo di un'azienda socia.
   Geometria orizzontale su schermi larghi, verticale sul telefono. GSAP + DrawSVG. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;

  // ramo principale: curve morbide, una per orientamento
  const GEO = {
    oriz: { vb: [1400, 780], crop: [0, 70, 1400, 700], ramo: "M40 452 C 210 392, 330 520, 520 462 S 820 330, 1010 418 S 1250 480, 1362 388", lato: 1 },
    vert: { vb: [640, 1640], crop: [0, 0, 640, 1640], ramo: "M318 36 C 238 196, 402 330, 322 500 S 212 800, 316 980 S 430 1300, 312 1604", lato: -1 }
  };
  const TESTO = "STRADA DEL VINO · CASAVECCHIA DI PONTELATONE";

  const iniziali = (n) => n.replace(/[^A-Za-zÀ-ÿ ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !/^(del|dei|della|gi[aà])$/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const nomeBreve = (a) => a.split(" (")[0];

  function crea(root, opt = {}) {
    const { D, esc, RM } = window.LSDVCore;
    const hasG = !!window.gsap, cartella = opt.loghi || "loghi-chiari";
    const aziende = D.aziende.slice(), loghi = D.loghi || {};
    const id = "tc" + ++uid;
    let modo = null, tl = null, parallax = null;

    root.classList.add("tc");
    root.innerHTML = `<div class="tc-scena"><svg class="tc-svg" role="img" aria-labelledby="${id}-t"><title id="${id}-t">Il tralcio della Strada del Vino: ${aziende.length} aziende socie, una per chicco</title></svg></div>
      <aside class="tc-card" hidden aria-live="polite"><span class="tc-card-l"></span><b></b><small>azienda socia della Strada</small><div class="tc-card-m"></div></aside>
      <div class="tc-bar"><p class="tc-conta"><b data-tc-n>0</b> / ${aziende.length} aziende</p><button type="button" class="tc-rivedi" data-tc-rivedi>Rivedi la crescita</button></div>`;
    const svg = root.querySelector(".tc-svg"), card = root.querySelector(".tc-card"), conta = root.querySelector("[data-tc-n]");

    function disegna() {
      const g = matchMedia("(max-width:760px)").matches ? GEO.vert : GEO.oriz;
      const nuovo = g === GEO.vert ? "vert" : "oriz";
      if (nuovo === modo) return; modo = nuovo;
      const [W, H] = g.vb;
      svg.setAttribute("viewBox", g.crop.join(" "));
      svg.innerHTML = svg.querySelector("title").outerHTML + `<defs>
          <linearGradient id="${id}-cort" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A5236"/><stop offset=".45" stop-color="#5B3A24"/><stop offset="1" stop-color="#3A2314"/></linearGradient>
          <radialGradient id="${id}-buccia" cx="36%" cy="30%" r="75%"><stop offset="0" stop-color="#B85A77"/><stop offset=".35" stop-color="#7C2F4B"/><stop offset=".75" stop-color="#4A1830"/><stop offset="1" stop-color="#26091A"/></radialGradient>
          <radialGradient id="${id}-pruina" cx="50%" cy="55%" r="60%"><stop offset=".55" stop-color="#E9DDF0" stop-opacity="0"/><stop offset="1" stop-color="#E9DDF0" stop-opacity=".28"/></radialGradient>
          <radialGradient id="${id}-disco" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#FFFBEF"/><stop offset=".7" stop-color="#F6ECD6"/><stop offset="1" stop-color="#E4D3B2"/></radialGradient>
          <radialGradient id="${id}-luce" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
          <filter id="${id}-ombra" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
          <mask id="${id}-scrivi" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><path class="tc-mask" d="${g.ramo}" fill="none" stroke="#fff" stroke-width="70" stroke-linecap="round"/></mask>
        </defs>
        <g class="tc-fondo"></g>
        <g class="tc-piccioli"></g>
        <g class="tc-ramo-g">
          <path class="tc-ramo-ombra" d="${g.ramo}" filter="url(#${id}-ombra)"/>
          <path class="tc-ramo" id="${id}-ramo" d="${g.ramo}" stroke="url(#${id}-cort)"/>
          <path class="tc-ramo-luce" d="${g.ramo}"/>
          <text class="tc-nome" mask="url(#${id}-scrivi)" dy="${modo === "vert" ? 7 : 6}"><textPath href="#${id}-ramo" startOffset="50%" text-anchor="middle">${TESTO}</textPath></text>
        </g>
        <g class="tc-acini"></g>`;

      const ramo = svg.querySelector(".tc-ramo"), L = ramo.getTotalLength();
      const gP = svg.querySelector(".tc-piccioli"), gA = svg.querySelector(".tc-acini"), gF = svg.querySelector(".tc-fondo");
      const n = aziende.length, v = modo === "vert";
      const piccioli = [], acini = [];

      // foglie e viticci come contorno, dietro ai chicchi
      const foglia = (x, y, s, r) => `<g class="tc-foglia" transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0 C-18 -10 -40 -8 -52 -26 C-40 -30 -44 -46 -30 -58 C-22 -48 -10 -56 -6 -72 C4 -58 16 -60 22 -70 C26 -52 44 -52 50 -40 C36 -30 46 -16 36 -6 C22 -12 12 -2 0 0Z"/><path class="tc-nerv" d="M0 0 L-30 -44 M0 0 L-4 -60 M0 0 L28 -46"/></g>`;
      const viticcio = (x, y, s, r) => `<path class="tc-viticcio" transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="M0 0 C 20 -10 34 -30 26 -46 C 20 -58 4 -54 6 -42 C 8 -32 22 -34 22 -44"/>`;
      [0.18, 0.47, 0.73, 0.93].forEach((t, k) => {
        const p = ramo.getPointAtLength(L * t), s = k % 2 ? -1 : 1;
        gF.insertAdjacentHTML("beforeend", foglia(p.x + (v ? 40 * s : 10), p.y + (v ? 0 : -30 * s), v ? 1.1 : 1.35, v ? (s > 0 ? 70 : -70) : (s > 0 ? -10 : 170)));
      });
      [0.32, 0.6, 0.86].forEach((t, k) => {
        const p = ramo.getPointAtLength(L * t), s = k % 2 ? 1 : -1;
        gF.insertAdjacentHTML("beforeend", viticcio(p.x, p.y, 1.1, v ? (s > 0 ? 90 : -90) : (s > 0 ? 180 : 0)));
      });

      const posti = [];
      aziende.forEach((nome, i) => {
        const t = 0.06 + (i / (n - 1)) * 0.9;
        const p = ramo.getPointAtLength(L * t), q = ramo.getPointAtLength(Math.min(L, L * t + 2));
        const tx = q.x - p.x, ty = q.y - p.y, tl0 = Math.hypot(tx, ty) || 1;
        const nx = -ty / tl0, ny = tx / tl0, lato = i % 2 ? 1 : -1;
        const z = [1, 0.86, 1.12][i % 3], r = (v ? 52 : 46) * z;
        let lung = 150 + ((i * 37) % 3) * (v ? 34 : 46), ex, ey;
        // se il chicco tocca uno già posato, il picciolo si allunga (entro i margini del disegno)
        for (let k = 0; k < 12; k++) {
          ex = p.x + nx * lato * lung + (tx / tl0) * (v ? 0 : 26); ey = p.y + ny * lato * lung + (ty / tl0) * (v ? 26 : 0);
          const urta = posti.some((o) => Math.hypot(o.x - ex, o.y - ey) < o.r + r + 16);
          if (!urta) break;
          lung += 34;
        }
        posti.push({ x: ex, y: ey, r });
        const cx = p.x + nx * lato * lung * 0.45 + (tx / tl0) * 70, cy = p.y + ny * lato * lung * 0.45 + (ty / tl0) * 70;
        const logo = loghi[nome];
        const cp = `${id}-cp${i}`;
        gP.insertAdjacentHTML("beforeend", `<path class="tc-picciolo" d="M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}"/>`);
        const inner = logo
          ? `<clipPath id="${cp}"><circle r="${(r * 0.7).toFixed(1)}"/></clipPath><image class="tc-logo" href="../shared/img/loghi/${logo}.png" x="${(-r * 0.56).toFixed(1)}" y="${(-r * 0.56).toFixed(1)}" width="${(r * 1.12).toFixed(1)}" height="${(r * 1.12).toFixed(1)}" preserveAspectRatio="xMidYMid meet" clip-path="url(#${cp})"/>`
          : `<text class="tc-mono" dy="${(r * 0.2).toFixed(1)}" style="font-size:${(r * 0.62).toFixed(1)}px">${esc(iniziali(nomeBreve(nome)))}</text>`;
        gA.insertAdjacentHTML("beforeend", `<g class="tc-acino" data-i="${i}" transform="translate(${ex.toFixed(1)} ${ey.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(nome)}">
            <g class="tc-a-in" style="--z:${z}">
              <ellipse class="tc-a-ombra" cx="${(r * 0.22).toFixed(1)}" cy="${(r * 0.92).toFixed(1)}" rx="${(r * 0.86).toFixed(1)}" ry="${(r * 0.26).toFixed(1)}" filter="url(#${id}-ombra)"/>
              <circle class="tc-anello" r="${(r + 9).toFixed(1)}"/>
              <circle r="${r.toFixed(1)}" fill="url(#${id}-buccia)"/>
              <circle r="${(r * 0.97).toFixed(1)}" fill="url(#${id}-pruina)"/>
              <circle class="tc-disco" r="${(r * 0.74).toFixed(1)}" fill="url(#${id}-disco)"/>
              <g class="tc-a-logo">${inner}</g>
              <ellipse cx="${(-r * 0.34).toFixed(1)}" cy="${(-r * 0.44).toFixed(1)}" rx="${(r * 0.3).toFixed(1)}" ry="${(r * 0.17).toFixed(1)}" fill="url(#${id}-luce)" transform="rotate(-32 ${(-r * 0.34).toFixed(1)} ${(-r * 0.44).toFixed(1)})"/>
              <circle class="tc-bordo" r="${r.toFixed(1)}"/>
            </g>
          </g>`);
        piccioli.push(gP.lastElementChild); acini.push(gA.lastElementChild);
      });

      // interazione: scheda al passaggio, al fuoco e al tocco
      const mostra = (el) => {
        const nome = aziende[+el.dataset.i], logo = loghi[nome];
        card.querySelector("b").textContent = nomeBreve(nome);
        card.querySelector(".tc-card-l").innerHTML = logo ? `<img src="../shared/img/loghi/${logo}.png" alt="">` : `<i>${esc(iniziali(nomeBreve(nome)))}</i>`;
        card.querySelector(".tc-card-m").innerHTML = window.LSDVCore.schedaAzienda(nome);
        const r = el.getBoundingClientRect(), fr = root.getBoundingClientRect();
        const mezza = (card.offsetWidth || 260) / 2 + 10;
        card.style.left = Math.min(Math.max(r.left - fr.left + r.width / 2, mezza), Math.max(fr.width - mezza, mezza)) + "px";
        card.style.top = r.top - fr.top + "px";
        card.hidden = false;
        acini.forEach((a) => a.classList.toggle("on", a === el));
        root.classList.add("fuoco");
        if (hasG && !RM) gsap.fromTo(card, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out", overwrite: true });
        window.LSDVSound && window.LSDVSound.play("hover");
      };
      const nascondi = () => { if (card.classList.contains("aperta")) return; card.hidden = true; acini.forEach((a) => a.classList.remove("on")); root.classList.remove("fuoco"); };
      acini.forEach((a) => { a.addEventListener("pointerenter", () => mostra(a)); a.addEventListener("focus", () => mostra(a)); a.addEventListener("click", () => { mostra(a); card.classList.add("aperta"); }); a.addEventListener("blur", nascondi); });
      svg.addEventListener("pointerleave", nascondi);
      svg.addEventListener("click", (e) => { if (!e.target.closest(".tc-acino")) { card.classList.remove("aperta"); card.hidden = true; } });

      // stato di partenza e timeline di crescita
      tl && tl.kill();
      if (!hasG || RM) { conta.textContent = n; root.classList.add("cresciuto"); return; }
      const nome = svg.querySelector(".tc-mask"), foglie = gF.querySelectorAll(".tc-foglia"), vit = gF.querySelectorAll(".tc-viticcio");
      gsap.set([ramo, svg.querySelector(".tc-ramo-luce"), svg.querySelector(".tc-ramo-ombra"), nome], { drawSVG: "0%" });
      gsap.set(piccioli, { drawSVG: "0%" });
      gsap.set(acini.map((a) => a.firstElementChild), { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(foglie, { scale: 0, transformOrigin: "0% 0%", opacity: 0 });
      gsap.set(vit, { drawSVG: "0%" });
      const cont = { v: 0 };
      tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to([ramo, svg.querySelector(".tc-ramo-luce"), svg.querySelector(".tc-ramo-ombra"), nome], { drawSVG: "100%", duration: 3.2, ease: "power1.inOut" }, 0)
        .to(foglie, { scale: 1, opacity: 1, duration: 1.1, ease: "back.out(1.6)", stagger: 0.7 }, 0.6)
        .to(vit, { drawSVG: "100%", duration: 1.2, stagger: 0.9 }, 1.2);
      acini.forEach((a, i) => {
        const at = 1.1 + (i / (n - 1)) * 7.4;
        tl.to(piccioli[i], { drawSVG: "100%", duration: 0.75, ease: "power1.out" }, at)
          .to(a.firstElementChild, { scale: 1, duration: 0.7, ease: "back.out(2.4)" }, at + 0.6)
          .fromTo(a.querySelector(".tc-a-logo"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, at + 0.85);
      });
      tl.to(cont, { v: n, duration: 8.2, ease: "none", onUpdate: () => (conta.textContent = Math.round(cont.v)) }, 1.4)
        .add(() => root.classList.add("cresciuto"), 9.6);

      // profondità: i chicchi più vicini si spostano di più seguendo il puntatore
      if (parallax) root.removeEventListener("pointermove", parallax);
      if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
        const muovi = acini.map((a) => { const z = +a.firstElementChild.style.getPropertyValue("--z") || 1; return { x: gsap.quickTo(a.firstElementChild, "x", { duration: 0.9, ease: "power3" }), y: gsap.quickTo(a.firstElementChild, "y", { duration: 0.9, ease: "power3" }), z }; });
        const ramoX = gsap.quickTo(svg.querySelector(".tc-ramo-g"), "x", { duration: 1, ease: "power3" });
        const scena = root.querySelector(".tc-scena");
        const rx = gsap.quickTo(scena, "rotationX", { duration: 1.2, ease: "power3" }), ry = gsap.quickTo(scena, "rotationY", { duration: 1.2, ease: "power3" });
        parallax = (e) => {
          const b = root.getBoundingClientRect(), px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
          muovi.forEach((m) => { m.x(px * 26 * (m.z - 0.7)); m.y(py * 18 * (m.z - 0.7)); });
          ramoX(px * -6); rx(py * -5); ry(px * 7);
        };
        root.addEventListener("pointermove", parallax);
        root.addEventListener("pointerleave", () => { muovi.forEach((m) => { m.x(0); m.y(0); }); ramoX(0); rx(0); ry(0); });
      }
    }

    disegna();
    let avviato = false;
    const avvia = () => { if (tl) { root.classList.remove("cresciuto"); tl.restart(); avviato = true; } };
    if (hasG && !RM && window.ScrollTrigger) ScrollTrigger.create({ trigger: root, start: "top 68%", once: true, onEnter: avvia });
    root.querySelector("[data-tc-rivedi]").addEventListener("click", avvia);
    matchMedia("(max-width:760px)").addEventListener("change", () => { disegna(); if (avviato && tl) tl.progress(1); });
    return { rivedi: avvia, aggiungi: () => { root.classList.add("con-te"); } };
  }

  window.LSDVTralcio = { crea };
})();
