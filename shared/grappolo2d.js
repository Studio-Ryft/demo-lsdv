/* «Il grappolo della rete» in 2D: stessa lingua grafica del tralcio (incisione, crema, vino, oliva),
   ma disposto come un vero grappolo verticale. Diciassette chicchi, uno per azienda socia.
   Nessuna libreria 3D: solo SVG e GSAP. */
(function () {
  "use strict";
  let uid = 0;

  const VB = [760, 940];
  // file del grappolo: quante bacche per fila e quanto è larga la fila
  const FILE = [
    { n: 4, y: 290, dx: 118 },
    { n: 4, y: 382, dx: 108 },
    { n: 3, y: 474, dx: 118 },
    { n: 3, y: 566, dx: 104 },
    { n: 2, y: 654, dx: 108 },
    { n: 1, y: 738, dx: 0 }
  ];
  const R = 45;

  // numeri finti ma sempre uguali: il grappolo non cambia a ogni visita
  const caso = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  const iniziali = (n) => n.replace(/[^A-Za-zÀ-ÿ ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !/^(del|dei|della|gi[aà])$/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const nomeBreve = (a) => a.split(" (")[0].split(" · ")[0];

  function crea(root, opt = {}) {
    const { D, esc, RM } = window.LSDVCore;
    const hasG = !!window.gsap;
    const cartella = "loghi";
    const aziende = D.aziende.slice();
    const loghi = D.loghi || {};
    const id = "g2" + ++uid;
    let tl = null, respiro = null, parallax = null;

    // posizioni: una bacca per azienda, con scarti minimi perché nessuna fila sia perfetta
    const posti = [];
    let k = 0;
    FILE.forEach((f, r) => {
      for (let i = 0; i < f.n && k < aziende.length; i++, k++) {
        const c = (i - (f.n - 1) / 2);
        const s = k + 1;
        const dietro = (r + i) % 3 === 1;                 // qualche chicco resta indietro: il grappolo ha spessore
        posti.push({
          x: VB[0] / 2 + c * f.dx + (caso(s) - 0.5) * 16,
          y: f.y + (caso(s * 3) - 0.5) * 14,
          r: R * (0.93 + caso(s * 7) * 0.14) * (dietro ? 0.9 : 1),
          z: dietro ? 0.82 : 1 + caso(s * 11) * 0.12,
          rot: (caso(s * 13) - 0.5) * 22
        });
      }
    });
    // i chicchi in fondo si disegnano per primi, i più vicini per ultimi
    const ordine = posti.map((p, i) => i).sort((a, b) => posti[a].z - posti[b].z);

    root.classList.add("g2");
    root.innerHTML = `<div class="g2-scena">
        <svg class="g2-svg" viewBox="0 0 ${VB[0]} ${VB[1]}" role="img" aria-labelledby="${id}-t"><title id="${id}-t">Il grappolo della Strada del Vino: ${aziende.length} aziende socie, una per chicco</title></svg>
      </div>
      <aside class="g2-card" hidden aria-live="polite"><span class="g2-card-l"></span><b></b><small>azienda socia della Strada</small><div class="g2-card-m"></div></aside>
      <div class="g2-bar"><p class="g2-conta"><b data-g2-n>0</b> / ${aziende.length} aziende</p><button type="button" class="g2-rivedi" data-g2-rivedi>Rivedi la maturazione</button></div>`;

    const svg = root.querySelector(".g2-svg"), card = root.querySelector(".g2-card"), conta = root.querySelector("[data-g2-n]");
    const scena = root.querySelector(".g2-scena");
    if (window.LSDVCore.mapSVG) scena.insertAdjacentHTML("afterbegin", `<div class="g2-carta" aria-hidden="true">${window.LSDVCore.mapSVG({ cls: "g2-terra", luoghi: false })}</div>`);

    const foglia = (x, y, s, r) => `<g class="g2-foglia" transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0 C-18 -10 -40 -8 -52 -26 C-40 -30 -44 -46 -30 -58 C-22 -48 -10 -56 -6 -72 C4 -58 16 -60 22 -70 C26 -52 44 -52 50 -40 C36 -30 46 -16 36 -6 C22 -12 12 -2 0 0Z"/><path class="g2-nerv" d="M0 0 L-30 -44 M0 0 L-4 -60 M0 0 L28 -46"/></g>`;

    const piccioli = posti.map((p) => {
      const cx = (VB[0] / 2 + p.x) / 2 + (p.x - VB[0] / 2) * 0.12, cy = 200 + (p.y - 200) * 0.55;
      return `<path class="g2-picciolo" d="M${(VB[0] / 2).toFixed(1)} 228 Q${cx.toFixed(1)} ${cy.toFixed(1)} ${p.x.toFixed(1)} ${(p.y - p.r * 0.72).toFixed(1)}"/>`;
    }).join("");

    const chicco = (i) => {
      const p = posti[i], nome = aziende[i], logo = loghi[nome], r = p.r, cp = `${id}-cp${i}`;
      const inner = logo
        ? `<clipPath id="${cp}"><circle r="${(r * 0.7).toFixed(1)}"/></clipPath><image class="g2-logo" href="../shared/img/${cartella}/${logo}.png" x="${(-r * 0.56).toFixed(1)}" y="${(-r * 0.56).toFixed(1)}" width="${(r * 1.12).toFixed(1)}" height="${(r * 1.12).toFixed(1)}" preserveAspectRatio="xMidYMid meet" clip-path="url(#${cp})"/>`
        : `<text class="g2-mono" dy="${(r * 0.2).toFixed(1)}" style="font-size:${(r * 0.62).toFixed(1)}px">${esc(iniziali(nomeBreve(nome)))}</text>`;
      return `<g class="g2-acino" data-i="${i}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(nome)}">
          <g class="g2-a-in" style="--z:${p.z.toFixed(2)}">
            <ellipse class="g2-a-ombra" cx="${(r * 0.2).toFixed(1)}" cy="${(r * 0.9).toFixed(1)}" rx="${(r * 0.82).toFixed(1)}" ry="${(r * 0.24).toFixed(1)}" filter="url(#${id}-ombra)"/>
            <circle class="g2-anello" r="${(r + 9).toFixed(1)}"/>
            <g transform="rotate(${p.rot.toFixed(1)})">
              <ellipse rx="${r.toFixed(1)}" ry="${(r * 1.06).toFixed(1)}" fill="url(#${id}-buccia)"/>
              <ellipse rx="${(r * 0.97).toFixed(1)}" ry="${(r * 1.03).toFixed(1)}" fill="url(#${id}-pruina)"/>
            </g>
            <circle class="g2-disco" r="${(r * 0.72).toFixed(1)}" fill="url(#${id}-disco)"/>
            <g class="g2-a-logo">${inner}</g>
            <ellipse cx="${(-r * 0.34).toFixed(1)}" cy="${(-r * 0.46).toFixed(1)}" rx="${(r * 0.28).toFixed(1)}" ry="${(r * 0.16).toFixed(1)}" fill="url(#${id}-luce)" transform="rotate(-32 ${(-r * 0.34).toFixed(1)} ${(-r * 0.46).toFixed(1)})"/>
            <ellipse class="g2-bordo" rx="${r.toFixed(1)}" ry="${(r * 1.06).toFixed(1)}" transform="rotate(${p.rot.toFixed(1)})"/>
          </g>
        </g>`;
    };

    svg.innerHTML = svg.querySelector("title").outerHTML + `<defs>
        <linearGradient id="${id}-cort" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A5236"/><stop offset=".5" stop-color="#5B3A24"/><stop offset="1" stop-color="#3A2314"/></linearGradient>
        <radialGradient id="${id}-buccia" cx="36%" cy="28%" r="76%"><stop offset="0" stop-color="#B85A77"/><stop offset=".35" stop-color="#7C2F4B"/><stop offset=".75" stop-color="#4A1830"/><stop offset="1" stop-color="#26091A"/></radialGradient>
        <radialGradient id="${id}-pruina" cx="50%" cy="55%" r="60%"><stop offset=".55" stop-color="#E9DDF0" stop-opacity="0"/><stop offset="1" stop-color="#E9DDF0" stop-opacity=".3"/></radialGradient>
        <radialGradient id="${id}-disco" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#FFFBEF"/><stop offset=".7" stop-color="#F6ECD6"/><stop offset="1" stop-color="#E4D3B2"/></radialGradient>
        <radialGradient id="${id}-luce" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <filter id="${id}-ombra" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
      </defs>
      <g class="g2-pendolo">
        <g class="g2-fondo">
          ${foglia(232, 214, 1.25, -122)}
          ${foglia(528, 206, 1.15, 118)}
          <path class="g2-viticcio" d="M300 196 C 268 168 262 128 286 112 C 304 100 322 118 308 132 C 296 144 278 134 284 120"/>
          <path class="g2-viticcio" d="M470 186 C 508 160 516 122 494 104 C 476 90 456 108 470 124 C 482 136 500 126 494 112"/>
        </g>
        <g class="g2-rachide">
          <path class="g2-gambo-ombra" d="M380 26 C 352 88, 404 140, 380 232"/>
          <path class="g2-gambo" d="M380 26 C 352 88, 404 140, 380 232" stroke="url(#${id}-cort)"/>
          <path class="g2-gambo-luce" d="M380 26 C 352 88, 404 140, 380 232"/>
        </g>
        <g class="g2-piccioli">${piccioli}</g>
        <g class="g2-acini">${ordine.map(chicco).join("")}</g>
      </g>`;

    const acini = Array.from(svg.querySelectorAll(".g2-acino"));
    const gambi = Array.from(svg.querySelectorAll(".g2-picciolo"));
    const pendolo = svg.querySelector(".g2-pendolo");

    /* ---------- scheda dell'azienda ---------- */
    const mostra = (el) => {
      const nome = aziende[+el.dataset.i], logo = loghi[nome];
      card.querySelector("b").textContent = nomeBreve(nome);
      card.querySelector(".g2-card-l").innerHTML = logo ? `<img src="../shared/img/${cartella}/${logo}.png" alt="">` : `<i>${esc(iniziali(nomeBreve(nome)))}</i>`;
      card.querySelector(".g2-card-m").innerHTML = window.LSDVCore.schedaAzienda ? window.LSDVCore.schedaAzienda(nome) : "";
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
    acini.forEach((a) => {
      a.addEventListener("pointerenter", () => mostra(a));
      a.addEventListener("focus", () => mostra(a));
      a.addEventListener("click", () => { mostra(a); card.classList.add("aperta"); });
      a.addEventListener("blur", nascondi);
    });
    svg.addEventListener("pointerleave", nascondi);
    svg.addEventListener("click", (e) => { if (!e.target.closest(".g2-acino")) { card.classList.remove("aperta"); card.hidden = true; } });

    /* ---------- maturazione: il gambo scende, i chicchi si riempiono ---------- */
    if (!hasG || RM) {
      conta.textContent = aziende.length;
      root.classList.add("cresciuto");
      return { rivedi: () => {} };
    }

    const gambo = svg.querySelectorAll(".g2-gambo,.g2-gambo-luce,.g2-gambo-ombra");
    const foglie = svg.querySelectorAll(".g2-foglia");
    const viticci = svg.querySelectorAll(".g2-viticcio");
    const dentro = acini.map((a) => a.firstElementChild);

    function monta() {
      tl && tl.kill();
      gsap.set(gambo, { drawSVG: "0%" });
      gsap.set(gambi, { drawSVG: "0%" });
      gsap.set(viticci, { drawSVG: "0%" });
      gsap.set(foglie, { scale: 0, opacity: 0, transformOrigin: "0% 0%" });
      gsap.set(dentro, { scale: 0, transformOrigin: "50% 50%" });
      const cont = { v: 0 };
      tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } })
        .to(gambo, { drawSVG: "100%", duration: 1.5, ease: "power1.inOut" }, 0)
        .to(foglie, { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.5)", stagger: 0.25 }, 0.7)
        .to(viticci, { drawSVG: "100%", duration: 1.1, stagger: 0.3 }, 1);
      // l'ordine di maturazione segue il grappolo dall'alto verso la punta
      const perY = posti.map((p, i) => i).sort((a, b) => posti[a].y - posti[b].y);
      perY.forEach((i, j) => {
        const at = 1.1 + j * 0.26;
        tl.to(gambi[i], { drawSVG: "100%", duration: 0.5 }, at)
          .to(dentro[acini.findIndex((a) => +a.dataset.i === i)], { scale: 1, duration: 0.6, ease: "back.out(2.2)" }, at + 0.32)
          .fromTo(acini.find((a) => +a.dataset.i === i).querySelector(".g2-a-logo"), { opacity: 0 }, { opacity: 1, duration: 0.45 }, at + 0.58);
      });
      const fine = 1.1 + (aziende.length - 1) * 0.26 + 1;
      tl.to(cont, { v: aziende.length, duration: fine - 1.1, ease: "none", onUpdate: () => (conta.textContent = Math.round(cont.v)) }, 1.2)
        .add(() => root.classList.add("cresciuto"), fine);
    }
    monta();

    /* ---------- respiro: il grappolo oscilla appena, come appeso al filare ---------- */
    respiro = gsap.to(pendolo, { rotation: 1.1, transformOrigin: "50% 3%", duration: 5.4, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });

    /* ---------- profondità al passaggio del puntatore ---------- */
    if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
      const muovi = acini.map((a) => {
        const z = +a.firstElementChild.style.getPropertyValue("--z") || 1;
        return { x: gsap.quickTo(a.firstElementChild, "x", { duration: 1, ease: "power3" }), y: gsap.quickTo(a.firstElementChild, "y", { duration: 1, ease: "power3" }), z };
      });
      const rx = gsap.quickTo(scena, "rotationX", { duration: 1.2, ease: "power3" });
      const ry = gsap.quickTo(scena, "rotationY", { duration: 1.2, ease: "power3" });
      parallax = (e) => {
        const b = root.getBoundingClientRect(), px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
        muovi.forEach((m) => { m.x(px * 22 * (m.z - 0.7)); m.y(py * 14 * (m.z - 0.7)); });
        rx(py * -4); ry(px * 6);
      };
      root.addEventListener("pointermove", parallax);
      root.addEventListener("pointerleave", () => { muovi.forEach((m) => { m.x(0); m.y(0); }); rx(0); ry(0); });
    }

    const avvia = () => { root.classList.remove("cresciuto"); tl.restart(); respiro.play(); };
    const oss = new IntersectionObserver((v) => { if (v.some((e) => e.isIntersecting)) { oss.disconnect(); avvia(); } }, { threshold: 0.25 });
    oss.observe(root);
    root.querySelector("[data-g2-rivedi]").addEventListener("click", avvia);

    return { rivedi: avvia };
  }

  window.LSDVGrappolo2D = { crea };

  // se la pagina contiene già il contenitore, il grappolo nasce da solo
  document.addEventListener("DOMContentLoaded", () => {
    const host = document.querySelector("[data-grappolo2d]");
    if (host && !host.dataset.pronto) { host.dataset.pronto = "1"; crea(host, { loghi: "loghi-chiari" }); }
  });
})();
