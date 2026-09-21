/* Versione C · La Strada */
(function () {
  "use strict";
  const { D, M, RM, $, $$, esc, smooth, mapSVG, counter, membership, categoriaNome, icon, demoBadge, introOnce } = window.LSDVCore;
  const B = window.LSDV_BRAND, H = document.documentElement;
  const hasG = !!window.gsap;
  if (hasG) gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, Flip);
  const NS = "http://www.w3.org/2000/svg";

  /* ================= RENDER ================= */
  const logo = (el, br, gr) => { el.setAttribute("viewBox", B.logo.vb); el.innerHTML = `<path fill="${br}" fill-rule="evenodd" d="${B.logo.br}"/><path fill="${gr}" fill-rule="evenodd" d="${B.logo.gr}"/>`; };
  $$("[data-logo]").forEach((el) => logo(el, "#442413", "#ADC136"));
  logo($("[data-logow]"), "#FCF6E1", "#ADC136"); logo($("[data-logow2]"), "#FCF6E1", "#ADC136");

  $("[data-missione]").textContent = (D.ente.intro && D.ente.intro.c) || D.ente.missione;
  $("[data-nums]").innerHTML = D.numeri.map((n) => `<div class="num"><b data-count="${n.n}">${n.n}</b><span>${esc(n.label)}</span></div>`).join("");
  $("[data-quote]").textContent = `«${D.ente.citazione.testo}» ${D.ente.citazione.autore}, ${D.ente.citazione.ruolo}.`;

  $("[data-vlog]").innerHTML = D.vlog.map((v, i) => `<article class="voce" data-i="${i}" tabindex="0" role="button" aria-label="Apri il video ${esc(v.titolo)}"><img src="../${v.img}" alt="" loading="lazy"><video muted loop playsinline preload="none" data-t="${i * 9}"><source src="../shared/video/vigna.mp4" type="video/mp4"></video><span class="snd" aria-hidden="true">▶</span><div class="who"><p class="ep">EP. ${v.ep} · ${v.durata}</p><h3>${esc(v.titolo)}</h3><p>${esc(v.testo)}</p></div></article>`).join("");

  const ORDER = {
    borghi: ["formicola", "liberi", "pontelatone", "castel-di-sasso", "piana-di-monte-verna", "caiazzo", "castel-campagnano", "ruviano"],
    vino: ["liberi", "formicola", "pontelatone", "castel-di-sasso", "caiazzo"],
    sapori: ["pontelatone", "piana-di-monte-verna", "caiazzo", "ruviano", "castel-campagnano"]
  };
  $("[data-ptabs]").innerHTML = D.percorsi.map((p, i) => `<button class="ptab" role="tab" data-p="${p.id}" aria-selected="${i === 0}"><h3>${esc(p.nome)} <i>→</i></h3><p>${esc(p.testo)}</p><p class="st">${ORDER[p.id].length} tappe · tracciato indicativo</p></button>`).join("");
  $("[data-pmap]").innerHTML = mapSVG({ luoghi: false, par: "xMidYMid meet" });

  $("[data-storia]").innerHTML = D.storia.map((s, i) => `<article class="scard"><div><p class="y">${esc(s.anno)}</p><p class="n">${String(i + 1).padStart(2, "0")} / ${String(D.storia.length).padStart(2, "0")}</p></div><div><h3>${esc(s.titolo)}</h3><p>${esc(s.testo)}</p><span class="src">${esc(s.fonte)}</span></div></article>`).join("");

  const EVIMG = ["../shared/img/anteprima-aziende.webp", "../shared/img/anteprima-lab.webp", "../shared/img/vigna-lmp01995.webp", "../shared/img/comune-caiazzo.webp"];
  $("[data-eventi]").innerHTML = D.eventi.map((e, i) => `<li class="ev-row" data-img="${e.img ? "../" + e.img : EVIMG[i]}"><p class="d">${esc(e.data)}</p><div><h3>${esc(e.titolo)}${e.demo ? '<span class="tag">esempio</span>' : e.stato === "archivio" ? '<span class="tag">archivio</span>' : ""}</h3></div><p>${esc(e.luogo)}</p><span class="go" aria-hidden="true">→</span></li>`).join("");

  $("[data-blog]").innerHTML = D.blog.map((b) => `<a class="art" href="#magazine"><div class="im"><img src="../${b.img}" alt="" loading="lazy"><span class="cat">${esc(b.cat)}</span></div><h3><span>${esc(b.titolo)}</span></h3><p>${esc(b.estratto)}</p><span class="min">${b.min} minuti di lettura</span></a>`).join("");

  $("[data-adintro]").textContent = D.adesione.intro;
  $("[data-passi]").innerHTML = D.adesione.passi.map((p) => `<li><b>${esc(p.t)}</b>${esc(p.d)}</li>`).join("");
  $("[data-cats]").innerHTML = D.adesione.categorie.map((c) => `<button type="button" class="cat" data-cat="${c.id}" aria-pressed="false">${icon(c.icona)}<span>${esc(c.nome)}</span></button>`).join("");
  $("#lcomuni").innerHTML = D.comuni.map((c) => `<option value="${esc(c.nome)}">`).join("");
  $("[data-contatti]").innerHTML = `<a href="mailto:${D.ente.email}">${D.ente.email}</a><a href="tel:+39${D.ente.tel.replace(/\s/g, "")}">${D.ente.tel}</a>`;
  $("[data-fcit]").textContent = "«" + D.ente.citazione2.testo + "»";
  $("#mnav nav").innerHTML = $$(".hd-nav a").map((a) => `<a href="${a.getAttribute("href")}">${a.textContent}</a>`).join("") + '<a href="#aderisci">Aderisci</a>';
  demoBadge("C · La Strada");

  // quote indicative (COMASTRA §8.3, da deliberare)
  const TIERS = {
    persone: [
      { t: "Under 30", p: 10, d: "Per studenti e giovani sommelier.", v: ["Tessera digitale", "Newsletter", "Inviti agli eventi"], cat: "sostenitori" },
      { t: "Sostenitore", p: 25, d: "Per chi vuole sostenere la divulgazione.", v: ["Tessera", "Riduzioni agli eventi", "Voce nell'assemblea"], cat: "sostenitori", badge: "Consigliata" },
      { t: "Famiglia", p: 60, d: "Una tessera per tutto il nucleo.", v: ["Fino a 4 tessere", "Passeggiate tra i filari", "Riduzioni agli eventi"], cat: "sostenitori" },
      { t: "Mecenate", p: 250, d: "Per chi sostiene progetti di ricerca e archivio.", v: ["Nome nel registro dei mecenati", "Visita all'Archivio", "Tutto il resto"], cat: "sostenitori" }
    ],
    aziende: [
      { t: "Cantine", p: 200, d: "Aziende vitivinicole DOC e IGT.", v: ["Scheda nella mappa", "Anteprima", "Racconto video"], cat: "cantine" },
      { t: "Ristorazione", p: 150, d: "Ristoranti, wine bar, enoteche.", v: ["Scheda nella mappa", "Percorso dei Sapori", "Eventi"], cat: "ristorazione" },
      { t: "Ospitalità", p: 120, d: "B&B, agriturismi, affittacamere.", v: ["Scheda nella mappa", "Pacchetti con i soci", "Eventi"], cat: "ospitalita" },
      { t: "Produttori ed enti", p: 80, d: "Produttori agroalimentari; enti da 150 €.", v: ["Scheda nella mappa", "Percorso dei Sapori", "Mercati e fiere"], cat: "agroalimentare" }
    ]
  };
  let aud = "persone";
  const renderTiers = (anim) => { $("[data-tiers]").innerHTML = TIERS[aud].map((t, i) => `<button type="button" class="tier" data-i="${i}" aria-pressed="false">${t.badge ? `<span class="badge">${t.badge}</span>` : ""}<h3>${esc(t.t)}</h3><p class="pr">${t.p} €<small> /anno</small></p><p>${esc(t.d)}</p><ul>${t.v.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></button>`).join(""); if (anim && hasG && !RM) gsap.from(".tier", { y: 30, autoAlpha: 0, stagger: 0.07, duration: 0.7, ease: "expo.out" }); };
  renderTiers(false);
  $$(".tabs-ad button").forEach((b) => b.addEventListener("click", () => { $$(".tabs-ad button").forEach((x) => x.setAttribute("aria-selected", x === b)); aud = b.dataset.aud; renderTiers(true); $("[data-ck]").textContent = aud === "persone" ? "Tessera sostenitore" : "Socio della Strada"; }));

  /* ================= MODULO + TESSERA ================= */
  const form = $("[data-form]"), card = $("[data-card]");
  const mem = membership(form, {
    onStep(from, to, dir) { if (hasG && !RM && dir) gsap.fromTo(to, { x: 50 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out" }); },
    onCategory(c) { $("[data-ccat]").textContent = categoriaNome(c); if (hasG && !RM) gsap.fromTo("[data-ccat]", { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }); },
    onInput(f) { if (f.name === "nome") $("[data-cname]").textContent = f.value || "Il tuo nome"; },
    onError(step) { if (hasG && !RM) gsap.fromTo(step, { x: -10 }, { x: 0, duration: 0.6, ease: "elastic.out(1,.3)" }); },
    onSubmit(d) {
      $$("[data-step]", form).forEach((s) => (s.hidden = true)); $("[data-progress]", form).style.setProperty("--p", 1);
      const ok = $(".ad-ok", form); ok.hidden = false;
      $("[data-okmsg]", form).textContent = `Grazie ${d.nome.split(" ")[0]}: la candidatura come «${categoriaNome(d.categoria)}» da ${d.comune} è arrivata. Presto ti chiamiamo per conoscerci.`;
      card.classList.add("flip");
      $$("[data-siamo]").forEach((s) => (s.textContent = "18"));
      if (hasG && !RM) { gsap.from($$("h3,p", ok), { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: "expo.out" }); gsap.fromTo(".hd-cta b", { scale: 1.8 }, { scale: 1, duration: 0.8, ease: "back.out(3)" }); }
    }
  });
  $("[data-tiers]").addEventListener("click", (e) => { const t = e.target.closest(".tier"); if (!t) return; $$(".tier").forEach((x) => x.setAttribute("aria-pressed", x === t)); const tier = TIERS[aud][+t.dataset.i]; const btn = $(`[data-cat="${tier.cat}"]`, form); btn && btn.click(); $("[data-ck]").textContent = tier.t + " · " + tier.p + " €"; window.__lenis ? window.__lenis.scrollTo(".ad-flow", { offset: -120 }) : $(".ad-flow").scrollIntoView({ behavior: "smooth" }); });
  card.addEventListener("pointermove", (e) => { if (card.classList.contains("flip")) return; const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; $(".card-in", card).style.transform = `rotateY(${(x - 0.5) * 16}deg) rotateX(${-(y - 0.5) * 12}deg)`; $(".card-f", card).style.setProperty("--gx", x * 100 + "%"); $(".card-f", card).style.setProperty("--gy", y * 100 + "%"); });
  card.addEventListener("pointerleave", () => { if (!card.classList.contains("flip")) $(".card-in", card).style.transform = ""; });
  card.addEventListener("click", () => { if (card.classList.contains("flip")) card.classList.remove("flip"); });

  /* ================= MENU ================= */
  const burger = $(".hd-burger"), mnav = $("#mnav");
  const setMenu = (open) => { burger.setAttribute("aria-expanded", open); mnav.hidden = !open; H.classList.toggle("menu-open", open); window.__lenis && (open ? window.__lenis.stop() : window.__lenis.start()); };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  mnav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  /* ================= VOCI: video ================= */
  const modal = $(".modal"), mv = $("video", modal);
  $$(".voce").forEach((v) => {
    const vid = $("video", v);
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting && !RM) { if (vid.preload !== "auto") { vid.preload = "auto"; vid.load(); vid.currentTime = +vid.dataset.t; } vid.play().then(() => v.classList.add("on")).catch(() => {}); } else { vid.pause(); v.classList.remove("on"); } }, { threshold: 0.55 });
    io.observe(v);
    const open = () => {
      const x = D.vlog[+v.dataset.i];
      mv.src = "../shared/video/vigna.mp4"; mv.currentTime = +vid.dataset.t;
      $(".modal-t", modal).innerHTML = `${esc(x.titolo)}<small>Episodio di esempio · il video definitivo sarà caricato dalla redazione</small>`;
      modal.hidden = false; mv.play().catch(() => {}); window.__lenis && window.__lenis.stop();
      if (hasG && !RM) { const r = v.getBoundingClientRect(), mi = $(".modal-in", modal).getBoundingClientRect(); gsap.fromTo(".modal-in", { x: r.left + r.width / 2 - (mi.left + mi.width / 2), y: r.top + r.height / 2 - (mi.top + mi.height / 2), scale: r.width / mi.width, borderRadius: 22 }, { x: 0, y: 0, scale: 1, duration: 0.9, ease: "expo.inOut" }); gsap.from(modal, { backgroundColor: "rgba(40,20,10,0)", duration: 0.6 }); }
    };
    v.addEventListener("click", open); v.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
  const closeModal = () => { modal.hidden = true; mv.pause(); window.__lenis && window.__lenis.start(); };
  $(".modal-x").addEventListener("click", closeModal); modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  /* ================= IL TRALCIO DELLA RETE ================= */
  // il grappolo 3D si monta da shared/grappolo3d.js (modulo); il tralcio 2D parte solo se WebGL non c'è
  $("[data-addme]").addEventListener("click", (e) => { e.preventDefault(); window.__lenis ? window.__lenis.scrollTo("#aderisci", { offset: -40 }) : $("#aderisci").scrollIntoView({ behavior: "smooth" }); });

  /* ================= PERCORSI ================= */
  const pmap = $(".perc-map svg");
  const bx = M.comuni.map((c) => c.x), by = M.comuni.map((c) => c.y);
  const pad = 140, vx0 = Math.min(...bx) - pad, vy0 = Math.min(...by) - pad * 1.2;
  pmap.setAttribute("viewBox", `${vx0} ${vy0} ${Math.max(...bx) - vx0 + pad * 1.6} ${Math.max(...by) - vy0 + pad * 1.2}`);
  const gR = document.createElementNS(NS, "g"); pmap.insertBefore(gR, pmap.querySelector(".pins-g"));
  const catmull = (pts) => { let d = `M${pts[0].x} ${pts[0].y}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; d += ` C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(1)} ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(1)} ${p2.x} ${p2.y}`; } return d; };
  let walkTw = null;
  function route(id, anim = true) {
    const pts = ORDER[id].map((c) => M.comuni.find((m) => m.id === c));
    const d = catmull(pts);
    gR.innerHTML = `<path class="route-shadow" d="${d}"/><path class="route" d="${d}"/><circle class="walker-ring" r="16"/><circle class="walker" r="8"/>`;
    $$(".perc-map .pin").forEach((p) => p.classList.toggle("on", ORDER[id].includes(p.dataset.id)));
    if (!hasG || RM) return;
    walkTw && walkTw.kill();
    gsap.fromTo($$("path", gR), { drawSVG: "0%" }, { drawSVG: "100%", duration: anim ? 2 : 0.01, ease: "power2.inOut" });
    walkTw = gsap.to([$(".walker", gR), $(".walker-ring", gR)], { motionPath: { path: $(".route", gR), align: $(".route", gR), alignOrigin: [0.5, 0.5] }, duration: pts.length * 1.6, ease: "none", repeat: -1, delay: 1.6 });
    gsap.fromTo($(".walker-ring", gR), { scale: 0.6, transformOrigin: "center" }, { scale: 1.3, opacity: 0.4, duration: 0.9, yoyo: true, repeat: -1 });
  }
  $("[data-ptabs]").addEventListener("click", (e) => { const b = e.target.closest(".ptab"); if (!b) return; $$(".ptab").forEach((x) => x.setAttribute("aria-selected", x === b)); route(b.dataset.p); });

  /* ================= EVENTI: immagine che segue ================= */
  const fl = $(".ev-float"), fli = $("img", fl);
  if (hasG && !RM && matchMedia("(hover:hover)").matches) {
    const qx = gsap.quickTo(fl, "x", { duration: 0.5, ease: "power3" }), qy = gsap.quickTo(fl, "y", { duration: 0.5, ease: "power3" });
    $$(".ev-row").forEach((r) => { r.addEventListener("pointerenter", () => { fli.src = r.dataset.img; gsap.to(fl, { opacity: 1, scale: 1, rotate: gsap.utils.random(-6, 6), duration: 0.5, ease: "expo.out" }); }); r.addEventListener("pointerleave", () => gsap.to(fl, { opacity: 0, scale: 0.6, duration: 0.4 })); });
    $(".ev-rows").addEventListener("pointermove", (e) => { qx(e.clientX + 170); qy(e.clientY); });
  }

  if (!hasG || RM) { route("borghi", false); return; }

  /* ================= MOTION ================= */
  const lenis = smooth({ lerp: 0.09 });

  let lastY = 0; const hd = $(".hd");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (st) => { const y = st.scroll(); hd.classList.toggle("solid", y > innerHeight * 0.7); lastY = y; } });
  $$(".hd-nav a").forEach((a) => { const t = $(a.getAttribute("href")); if (t) ScrollTrigger.create({ trigger: t, start: "top 50%", end: "bottom 50%", onToggle: (s) => a.classList.toggle("on", s.isActive) }); });

  $$("section h2").forEach((h) => { const sp = SplitText.create(h, { type: "lines,words", mask: "lines" }); gsap.from(sp.words, { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: h, start: "top 85%" } }); });

  // ---------- LA STRADA lungo la pagina ----------
  // una strada che scende sul margine sinistro: asfalto, mezzeria, pietre chilometriche a ogni capitolo;
  // la mezzeria si accende e l'auto avanza man mano che si scorre
  const th = $(".thread"), tEdge = $(".thread-edge"), tbg = $(".thread-bg"), tmid = $(".thread-mid"), tfg = $(".thread-fg"), tmk = $(".thread-mk"), tkm = $(".thread-km"), tcar = $(".thread-car");
  let tLen = 0, kms = [], kmEls = [];
  function layoutThread() {
    const docH = document.documentElement.scrollHeight, w = document.documentElement.clientWidth, gut = Math.max(9, Math.min(30, w * 0.02));
    th.setAttribute("height", docH); th.setAttribute("viewBox", `0 0 ${w} ${docH}`); th.style.height = docH + "px";
    th.querySelector("mask").setAttribute("width", w); th.querySelector("mask").setAttribute("height", docH);
    const y0 = innerHeight * 0.9, y1 = docH - 40, xa = (y) => gut + Math.sin(y / 310) * Math.min(9, gut * 0.4) + Math.sin(y / 97) * 1.6;
    let d = `M${xa(y0).toFixed(1)} ${y0.toFixed(1)}`;
    for (let y = y0 + 28; y < y1; y += 28) d += ` L${xa(y).toFixed(1)} ${y.toFixed(1)}`;
    [tEdge, tbg, tmid, tfg, tmk].forEach((p) => p.setAttribute("d", d));
    tLen = tfg.getTotalLength();
    // pietre chilometriche: una per capitolo, sul punto della strada all'altezza della sezione
    const knots = $$("[data-knot]").map((el) => el.getBoundingClientRect().top + scrollY).slice(1);
    kms = knots.map((ky, i) => {
      const yy = Math.max(y0 + 40, ky + 34);
      let lo = 0, hi = tLen; for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; tfg.getPointAtLength(m).y < yy ? (lo = m) : (hi = m); }
      const pt = tfg.getPointAtLength(lo);
      return { at: lo, x: pt.x, y: pt.y, n: String(i + 1).padStart(2, "0") };
    });
    tkm.innerHTML = kms.map((k) => `<g class="km" transform="translate(${k.x.toFixed(1)} ${k.y.toFixed(1)})"><rect x="-21" y="-11" width="42" height="22" rx="6"/><text y="4">KM ${k.n}</text></g>`).join("");
    kmEls = $$(".km", tkm);
  }
  layoutThread();
  const strada = (p) => {
    gsap.set(tmk, { drawSVG: `0% ${p * 100}%` });
    const pt = tfg.getPointAtLength(tLen * p); tcar.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    kmEls.forEach((el, i) => el.classList.toggle("on", kms[i].at <= tLen * p + 4));
  };
  strada(0);
  ScrollTrigger.create({ trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.6, onUpdate: (st) => strada(st.progress) });
  ScrollTrigger.addEventListener("refreshInit", () => layoutThread());

  // il territorio come motivo del sito: curve di livello in filigrana dietro la missione
  const isec = $(".intro-sec");
  if (isec) isec.insertAdjacentHTML("afterbegin", `<div class="terr-bg" aria-hidden="true">${mapSVG({ cls: "terr-bg-svg", luoghi: false, viewBox: "0 180 1600 760" })}</div>`);


  // ---------- IL VIAGGIO: lo scorrimento guida l'auto lungo la strada, paese per paese ----------
  const vgm = $("[data-vgmap]");
  if (vgm && window.LSDVIso && hasG) {
    const iso = window.LSDVIso.crea(vgm), IDS = ["formicola", "pontelatone", "castel-di-sasso", "liberi", "piana-di-monte-verna", "caiazzo", "ruviano", "castel-campagnano"];
    const LEGS = [[0, false, 1], [1, false, 2], [2, false, 3], [2, true, 2], [3, false, 4], [4, false, 5], [5, false, 6], [6, false, 7]];
    const vport = () => innerHeight > innerWidth, zoom = () => iso.B.w / (vport() ? 2.6 : 2.1);
    const cam = { x: 0, y: 0, w: iso.intera().w };
    const c0 = iso.paesi[IDS[0]];
    const testi = Object.fromEntries(D.comuni.map((c) => [c.id, c]));
    const card = { n: $("[data-vn]"), nome: $("[data-vnome]"), q: $("[data-vq]"), t: $("[data-vt]") }, barra = $(".vg-prog i"), cardEl = $(".vg-card"), vgH = $(".vg-h");
    let corrente = -1;
    const setStop = (k) => {
      if (k === corrente) return; corrente = k; const p = iso.paesi[IDS[k]], c = testi[IDS[k]] || {};
      card.n.textContent = String(k + 1).padStart(2, "0"); card.nome.textContent = p.nome; card.q.textContent = Math.round(p.q) + " m s.l.m."; card.t.textContent = c.testo || "";
      gsap.fromTo(cardEl, { y: 16, autoAlpha: 0.2 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", overwrite: true });
      IDS.forEach((id, j) => iso.mostraEtichetta(id, j === k));
    };
    iso.strade.forEach((t, i) => iso.disegnaTratto(i, 0));
    iso.posiziona(0, 0, false); iso.auto.setAttribute("opacity", 1);
    const focus = (p) => ({ x: p.sx, y: p.sy });
    const quando = [];   // istante di arrivo a ciascun paese
    const tl = gsap.timeline({ defaults: { ease: "none" } });
    const f0 = focus(c0); cam.x = iso.intera().cx; cam.y = iso.intera().cy;
    tl.to(cam, { x: f0.x, y: f0.y, w: zoom(), duration: 1.0, ease: "power2.inOut", onUpdate: () => iso.vai(cam.x, cam.y, cam.w) }, 0);
    quando[0] = 0.8; let t0 = 0.8 + 0.3;
    LEGS.forEach(([i, rev, dest], n) => {
      const pr = { t: 0 }, a = iso.paesi[IDS[dest]];
      tl.fromTo(pr, { t: 0 }, { t: 1, duration: 0.8, ease: "sine.inOut", onUpdate: () => {
          const q = iso.posiziona(i, pr.t, rev); if (!rev) iso.disegnaTratto(i, pr.t);
          cam.x += (q.x - cam.x) * 0.22; cam.y += (q.y - cam.y) * 0.22; cam.w = zoom(); iso.vai(cam.x, cam.y, cam.w);
        } }, t0);
      t0 += 0.8;
      if (!rev) { quando[dest] = t0; }
      t0 += 0.3;
    });
    // per il ritorno da Liberi a Castel di Sasso non c'è sosta: la strada continua verso Piana di Monte Verna
    const durata = t0;
    const st = ScrollTrigger.create({
      trigger: ".viaggio", start: "top top", end: () => "+=" + Math.round(innerHeight * 3.4), pin: ".vg-pin", scrub: 0.9, animation: tl, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (self) => {
        const tt = self.progress * durata; let k = 0; quando.forEach((q, j) => { if (q !== undefined && tt >= q - 0.05) k = j; });
        setStop(k); barra.style.transform = `scaleY(${self.progress})`; vgH.style.opacity = Math.max(0, 1 - self.progress * 14);
      }
    });
    setStop(0);
    addEventListener("resize", () => iso.vai(cam.x, cam.y, cam.w));
  }

  // ---------- INTRO ----------
  const hsplit = SplitText.create(".hero-t", { type: "words", mask: "words" });
  gsap.set(hsplit.words, { yPercent: 110 }); gsap.set([".hero-act", ".hero-count"], { autoAlpha: 0, y: 20 }); gsap.set(".hero-logo path", { autoAlpha: 0 });
  function heroIn(dl = 0) {
    gsap.timeline({ delay: dl })
      .fromTo(".hero-img img", { scale: 1.3 }, { scale: 1.04, duration: 3.2, ease: "expo.out" }, 0)
      .to(".hero-logo path:first-child", { autoAlpha: 1, duration: 1.2 }, 0.2)
      .fromTo(".hero-logo path:last-child", { autoAlpha: 1, drawSVG: "0%", stroke: "#ADC136", strokeWidth: 6 }, { drawSVG: "100%", duration: 1.4, ease: "power2.inOut" }, 0.3)
      .to(hsplit.words, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.045 }, 0.5)
      .to([".hero-act", ".hero-count"], { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.15 }, 1.2);
  }
  const intro = $("#intro");
  if (introOnce("lsdvC")) {
    H.classList.add("intro-run"); lenis && lenis.stop();
    // la carta nasce dalle sole curve di livello; poi il grappolo corre lungo la strada e la colora, paese per paese
    const host = $("[data-instrada]"), portrait = innerHeight > innerWidth;
    const iso = window.LSDVIso.crea(host), IDS = ["formicola", "pontelatone", "castel-di-sasso", "liberi", "piana-di-monte-verna", "caiazzo", "ruviano", "castel-campagnano"];
    const LEGS = [[0, false, "pontelatone"], [1, false, "castel-di-sasso"], [2, false, "liberi"], [2, true, "castel-di-sasso"], [3, false, "piana-di-monte-verna"], [4, false, "caiazzo"], [5, false, "ruviano"], [6, false, "castel-campagnano"]];
    const v0 = iso.intera();
    let cam = { x: v0.cx, y: v0.cy, w: portrait ? 480 : v0.w * 1.04 };
    if (portrait) { const f = iso.paesi.formicola; cam.x = f.sx; cam.y = f.sy; }
    iso.vai(cam.x, cam.y, cam.w);
    gsap.set(iso.righe, { drawSVG: "0%" });
    gsap.set(iso.fiumi, { opacity: 0 });
    IDS.forEach((id) => gsap.set(iso.paesi[id].g, { opacity: 0 }));
    iso.strade.forEach((t, i) => iso.disegnaTratto(i, 0));
    const tw = SplitText.create(".in-t", { type: "words", mask: "words" });
    gsap.set(tw.words, { yPercent: 110 });
    const tl = gsap.timeline();
    tl.to(iso.righe, { drawSVG: "100%", duration: 0.6, ease: "power1.inOut", stagger: 0.01 }, 0)
      .to(iso.fiumi, { opacity: 1, duration: 0.4 }, 0.4)
      .to(IDS.map((id) => iso.paesi[id].g), { opacity: 1, duration: 0.3, stagger: 0.03 }, 0.5)
      .to(tw.words, { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.05 }, 0.3);
    if (!portrait) tl.to(cam, { w: v0.w, duration: 2.2, ease: "power2.out", onUpdate: () => iso.vai(cam.x, cam.y, cam.w) }, 0);
    // il viaggio
    const totale = LEGS.reduce((n, l) => n + iso.strade[l[0]].len, 0), DRIVE = 1.4, PAUSA = 0.07;
    let t0 = 0.8; iso.posiziona(0, 0, false);
    tl.to(iso.auto, { opacity: 1, duration: 0.3 }, t0 - 0.2).add(() => iso.mostraEtichetta("formicola", true), t0 - 0.1);
    let prec = "formicola";
    LEGS.forEach(([i, rev, fine]) => {
      const dur = (iso.strade[i].len / totale) * DRIVE, pr = { t: 0 }, daNascondere = prec;
      tl.add(() => { iso.mostraEtichetta(daNascondere, false); }, t0 + 0.05);
      tl.fromTo(pr, { t: 0 }, { t: 1, duration: dur, ease: "sine.inOut", onUpdate: () => {
          const q = iso.posiziona(i, pr.t, rev); iso.polvere(q.x, q.y);
          if (!rev) iso.disegnaTratto(i, pr.t);
          if (portrait) { cam.x += (q.x - cam.x) * 0.09; cam.y += (q.y - cam.y) * 0.09; iso.vai(cam.x, cam.y, cam.w); }
        } }, t0 + 0.05);
      t0 += 0.05 + dur;
      tl.add(() => iso.mostraEtichetta(fine, true), t0);
      prec = fine; t0 += PAUSA;
    });
    tl.addLabel("out", t0 + 0.15)
      .to(tw.words, { yPercent: -110, duration: 0.5, ease: "power3.in", stagger: 0.03 }, "out")
      .to(iso.auto, { opacity: 0, duration: 0.3 }, "out")
      .to(intro, { clipPath: "inset(50% 0% 50% 0%)", duration: 1.1, ease: "expo.inOut" }, "out+=0.5")
      .add(() => heroIn(0), "out+=0.7")
      .add(() => { H.classList.remove("intro-run"); intro.remove(); lenis && lenis.start(); ScrollTrigger.refresh(); }, "out+=1.6");
    const skip = () => tl.timeScale(5);
    $(".in-skip").addEventListener("click", skip); addEventListener("wheel", skip, { once: true, passive: true }); addEventListener("touchmove", skip, { once: true, passive: true }); addEventListener("keydown", (e) => e.key === "Escape" && skip(), { once: true });
  } else { intro.remove(); heroIn(0.1); }
  gsap.to(".hero-img img", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // ---------- missione parola per parola ----------
  const bw = SplitText.create("[data-missione]", { type: "words", wordsClass: "w" });
  gsap.to(bw.words, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: ".big", start: "top 80%", end: "bottom 45%", scrub: true } });
  $$("[data-count]").forEach((c) => { c.textContent = "0"; ScrollTrigger.create({ trigger: c, start: "top 90%", once: true, onEnter: () => counter(c, +c.dataset.count, 1.8) }); });
  gsap.from(".num", { y: 60, rotate: (i) => [-3, 2, -2, 3][i], autoAlpha: 0, stagger: 0.1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".nums", start: "top 85%" } });

  // ---------- voci ----------
  gsap.from(".voce", { y: 140, rotate: (i) => (i % 2 ? 5 : -5), autoAlpha: 0, stagger: 0.12, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".voci-row", start: "top 85%" } });
  gsap.fromTo(".voci", { borderRadius: "120px 120px 0 0" }, { borderRadius: "40px 40px 0 0", ease: "none", scrollTrigger: { trigger: ".voci", start: "top bottom", end: "top 40%", scrub: true } });

  // ---------- costellazione e percorsi ----------
  ScrollTrigger.create({ trigger: ".perc-map", start: "top 70%", once: true, onEnter: () => route("borghi") });
  gsap.from(".ptab", { x: -40, autoAlpha: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".perc-tabs", start: "top 85%" } });

  // ---------- mazzo della storia ----------
  const cards = $$(".scard");
  cards.forEach((c, i) => {
    if (i < cards.length - 1) gsap.to(c, { scale: 0.94, ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 110px", scrub: true } });
    gsap.from($$("h3,p,.src", c), { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 80%" } });
  });

  // ---------- eventi, magazine, adesione ----------
  gsap.from(".ev-row", { y: 40, autoAlpha: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".ev-rows", start: "top 85%" } });
  gsap.from(".art", { y: 80, autoAlpha: 0, stagger: 0.1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".mag-grid", start: "top 85%" } });
  gsap.fromTo(".tier", { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".tiers", start: "top 85%" } });
  gsap.from(".card3d", { rotateY: -40, rotateX: 20, autoAlpha: 0, y: 60, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".ad-flow", start: "top 80%" } });
  gsap.from(".card-thread path", { drawSVG: "0%", duration: 1.6, ease: "power2.inOut", scrollTrigger: { trigger: ".ad-flow", start: "top 75%" } });
  gsap.from(".passi li", { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".passi", start: "top 90%" } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
