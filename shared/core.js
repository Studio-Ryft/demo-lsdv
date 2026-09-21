/* Nucleo comune alle tre versioni: utilità, carta del territorio, modulo di adesione, scroll fluido, accessibilità. */
(function () {
  "use strict";
  const D = window.LSDV, M = window.LSDV_MAP;
  const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const slug = (t) => String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const html = (s) => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content.firstElementChild; };

  /* ---------- scroll fluido (Lenis) sincronizzato con ScrollTrigger ---------- */
  function smooth(opts = {}) {
    if (RM || !window.Lenis) return null;
    const lenis = new Lenis(Object.assign({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true }, opts));
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href"); if (id.length < 2) return;
      const t = $(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 1.4 });
    }));
    window.__lenis = lenis;
    return lenis;
  }

  /* ---------- carta del territorio (SVG reale) ---------- */
  function mapSVG(o = {}) {
    const vb = o.viewBox || `0 0 ${M.vw} ${M.vh}`;
    const paths = M.paths.map(([z, ma, d]) => `<path class="ct ${ma ? "ma" : "mi"}" data-z="${z}" d="${d}"/>`).join("");
    const fiume = M.fiume.map((d) => `<path class="fiume" d="${d}"/>`).join("");
    const pins = M.comuni.map((c) => `<g class="pin" data-id="${c.id}" transform="translate(${c.x} ${c.y})" tabindex="0" role="button" aria-label="${esc(c.nome)}, ${c.quota} metri"><circle class="pin-halo" r="26"/><circle class="pin-dot" r="7"/><text class="pin-lbl" x="14" y="5">${esc(c.nome)}</text></g>`).join("");
    const luoghi = (o.luoghi === false ? [] : M.luoghi).map((c) => `<g class="luogo" data-id="${c.id}" transform="translate(${c.x} ${c.y})"><path class="luogo-mk" d="M-6 0L0-6L6 0L0 6Z"/><text class="luogo-lbl" x="12" y="4">${esc(c.nome)}</text></g>`).join("");
    return `<svg class="terra ${o.cls || ""}" viewBox="${vb}" preserveAspectRatio="${o.par || "xMidYMid slice"}" role="img" aria-label="Carta delle curve di livello dell'area della DOC Casavecchia di Pontelatone con gli otto comuni"><g class="ct-g">${paths}</g><g class="fiume-g">${fiume}</g><g class="luoghi-g">${luoghi}</g><g class="pins-g">${pins}</g></svg>`;
  }

  /* ---------- numeri che contano ---------- */
  function counter(el, to, dur = 1.6) {
    if (RM || !window.gsap) { el.textContent = to; return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: dur, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)) });
  }

  /* ---------- modulo di adesione (logica condivisa, grafica di ciascuna versione) ---------- */
  function membership(root, hooks = {}) {
    if (!root) return;
    const steps = $$("[data-step]", root);
    const prog = $("[data-progress]", root);
    let i = 0;
    const state = { categoria: null };
    function show(n, dir = 1) {
      const from = steps[i]; i = Math.max(0, Math.min(steps.length - 1, n)); const to = steps[i];
      steps.forEach((s, k) => { s.hidden = k !== i; s.setAttribute("aria-hidden", k !== i); });
      if (prog) prog.style.setProperty("--p", (i / (steps.length - 1)));
      root.dataset.at = i;
      if (hooks.onStep) hooks.onStep(from, to, dir, i);
      const f = $("input,textarea,button", to); if (f && dir) setTimeout(() => f.focus({ preventScroll: true }), 350);
    }
    function valid(step) {
      let ok = true;
      $$("[required]", step).forEach((f) => {
        const bad = f.type === "email" ? !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value) : f.type === "checkbox" ? !f.checked : !f.value.trim();
        f.closest(".fld") && f.closest(".fld").classList.toggle("err", bad);
        f.setAttribute("aria-invalid", bad);
        if (bad) ok = false;
      });
      if (step.querySelector("[data-cats]") && !state.categoria) { ok = false; step.querySelector("[data-cats]").classList.add("err"); }
      if (!ok && hooks.onError) hooks.onError(step);
      return ok;
    }
    $$("[data-cat]", root).forEach((b) => b.addEventListener("click", () => {
      $$("[data-cat]", root).forEach((x) => x.setAttribute("aria-pressed", x === b));
      state.categoria = b.dataset.cat;
      const wrap = b.closest("[data-cats]"); wrap && wrap.classList.remove("err");
      if (hooks.onCategory) hooks.onCategory(state.categoria, b);
    }));
    $$("input,textarea", root).forEach((f) => f.addEventListener("input", () => { if (hooks.onInput) hooks.onInput(f, state); f.closest(".fld") && f.closest(".fld").classList.remove("err"); }));
    root.addEventListener("click", (e) => {
      const nx = e.target.closest("[data-next]"), pv = e.target.closest("[data-prev]");
      if (nx) { e.preventDefault(); if (valid(steps[i])) show(i + 1, 1); }
      if (pv) { e.preventDefault(); show(i - 1, -1); }
    });
    root.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!valid(steps[i])) return;
      const data = Object.fromEntries(new FormData(root)); data.categoria = state.categoria;
      try { localStorage.setItem("lsdv-candidatura-demo", JSON.stringify(data)); } catch (err) {}
      if (hooks.onSubmit) hooks.onSubmit(data);
    });
    show(0, 0);
    return { show, state };
  }

  function categoriaNome(id) { const c = D.adesione.categorie.find((x) => x.id === id); return c ? c.nome : ""; }

  /* ---------- icone lineari delle categorie ---------- */
  const ICONS = {
    grappolo: '<path d="M12 3c2 0 3 1 3 2M9 7a2 2 0 1 0 0 .1M15 7a2 2 0 1 0 0 .1M12 10a2 2 0 1 0 0 .1M8 11a2 2 0 1 0 0 .1M16 11a2 2 0 1 0 0 .1M10 14a2 2 0 1 0 0 .1M14 14a2 2 0 1 0 0 .1M12 18a2 2 0 1 0 0 .1"/>',
    calice: '<path d="M7 3h10c0 5-2 8-5 8s-5-3-5-8ZM12 11v8M8 21h8"/>',
    casa: '<path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6"/>',
    spiga: '<path d="M12 21V5M12 8c-3 0-4-2-4-4 3 0 4 2 4 4Zm0 0c3 0 4-2 4-4-3 0-4 2-4 4Zm0 5c-3 0-4-2-4-4 3 0 4 2 4 4Zm0 0c3 0 4-2 4-4-3 0-4 2-4 4Zm0 5c-3 0-4-2-4-4 3 0 4 2 4 4Zm0 0c3 0 4-2 4-4-3 0-4 2-4 4Z"/>',
    mappa: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14"/>',
    colonna: '<path d="M4 9h16L12 4 4 9ZM6 9v9M10 9v9M14 9v9M18 9v9M3 20h18"/>',
    cuore: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>'
  };
  const icon = (k) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ""}</svg>`;

  /* ---------- banner demo e salta intro ---------- */
  function demoBadge(label) {
    if (window.self !== window.top) return;   // dentro l'anteprima a schermo intero c'è la barra della pagina «animazioni»
    // barra fluttuante: indietro, avanti, home + etichetta della versione
    if (!document.getElementById("dn-stile")) document.head.insertAdjacentHTML("beforeend", `<style id="dn-stile">
      .demo-badge .dn-b{display:inline-grid;place-items:center;min-width:28px;height:26px;padding:0 .55rem;border-radius:999px;border:1px solid currentColor;background:transparent;color:inherit;font:inherit;font-size:13px;letter-spacing:0;line-height:1;text-decoration:none;cursor:pointer;opacity:.8;transition:opacity .25s,background .25s,color .25s}
      .demo-badge .dn-b:hover,.demo-badge .dn-b:focus-visible{opacity:1;background:rgba(128,128,128,.28)}
      .demo-badge .dn-b.home{font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700}
      .demo-badge .dn-l{opacity:.9}
    </style>`);
    const b = html(`<nav class="demo-badge" aria-label="Navigazione della demo">
      <button type="button" class="dn-b" data-dn="back" aria-label="Indietro" title="Indietro"><i>←</i></button>
      <button type="button" class="dn-b" data-dn="fwd" aria-label="Avanti" title="Avanti"><i>→</i></button>
      <a class="dn-b home" href="../index.html" target="_top" title="Torna alle quattro direzioni"><i>Home</i></a>
      <span>Demo</span><em class="dn-l">${esc(label)}</em></nav>`);
    b.addEventListener("click", (e) => { const t = e.target.closest("[data-dn]"); if (!t) return; t.dataset.dn === "back" ? history.back() : history.forward(); });
    document.body.appendChild(b);
  }

  /* ---------- intro una volta per sessione ---------- */
  function introOnce(key) {
    if (RM) return false;
    try { if (new URLSearchParams(location.search).has("intro")) return true; if (sessionStorage.getItem(key)) return false; sessionStorage.setItem(key, "1"); } catch (e) {}
    return true;
  }

  /* ---------- scheda di un'azienda: descrizione e collegamento al suo sito ---------- */
  function schedaAzienda(nome) {
    const i = (D.info || {})[nome] || {};
    const etichetta = i.tipo === "social" ? (/instagram/.test(i.sito) ? "Vai al profilo Instagram" : "Vai alla pagina Facebook") : "Vai al sito";
    return `${i.testo ? `<p class="sch-t">${esc(i.testo)}</p>` : ""}` +
      `${i.sito ? `<a class="sch-b" href="${esc(i.sito)}" target="_blank" rel="noopener">${etichetta}<i aria-hidden="true">↗</i></a>` : '<p class="sch-no">Nessun sito indicato dall\'azienda</p>'}`;
  }

  /* ---------- sezione «Chi siamo»: stesso testo, grafica di ciascuna versione ---------- */
  function chiSiamo(el) {
    const c = D.chisiamo; if (!el || !c) return;
    el.innerHTML = `<div class="cs-in"><header class="cs-h"><p class="cs-kick">${esc(c.occhiello)}</p><h2 class="cs-t">${esc(c.titolo)}</h2></header>
      <div class="cs-grid">${c.blocchi.map((b, i) => `<article class="cs-b"><span class="cs-n">${String(i + 1).padStart(2, "0")}</span><h3>${esc(b.t)}</h3><p>${esc(b.d)}</p></article>`).join("")}</div></div>`;
  }
  $$("[data-chisiamo]").forEach(chiSiamo);
  // entrata dei tre blocchi, quando GSAP e ScrollTrigger sono pronti
  addEventListener("load", () => {
    if (RM || !window.gsap || !window.ScrollTrigger) return;
    $$("[data-chisiamo]").forEach((s) => {
      gsap.from($$(".cs-kick, .cs-t", s), { y: 30, autoAlpha: 0, duration: 1, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 78%" } });
      gsap.from($$(".cs-b", s), { y: 50, autoAlpha: 0, duration: 1.1, stagger: 0.14, ease: "expo.out", scrollTrigger: { trigger: $(".cs-grid", s), start: "top 85%" } });
    });
  });

  window.LSDVCore = { D, M, RM, $, $$, esc, slug, html, smooth, mapSVG, counter, membership, categoriaNome, icon, demoBadge, introOnce, chiSiamo, schedaAzienda };
})();
