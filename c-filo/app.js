/* Versione C · Il Filo */
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

  $("[data-missione]").textContent = D.ente.missione;
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
  $("[data-contatti]").innerHTML = `${esc(D.ente.sede)}<a href="mailto:${D.ente.email}">${D.ente.email}</a><a href="tel:+39${D.ente.tel.replace(/\s/g, "")}">${D.ente.tel}</a>`;
  $("[data-partner]").innerHTML = D.partner.map((p) => esc(p.nome)).join(" · ");
  $("[data-fcit]").textContent = "«" + D.ente.citazione2.testo + "»";
  $("#mnav nav").innerHTML = $$(".hd-nav a").map((a) => `<a href="${a.getAttribute("href")}">${a.textContent}</a>`).join("") + '<a href="#aderisci">Aderisci</a>';
  demoBadge("C · Il Filo");

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

  /* ================= COSTELLAZIONE ================= */
  const cst = $("[data-const]"), svg = $(".const-svg", cst), tip = $(".const-tip", cst);
  const GR = { center: { c: "#442413", r: 34, l: "Strada del Vino" }, az: { c: "#4B5D23", r: 11, l: "Aziende" }, co: { c: "#8A5A3C", r: 13, l: "Comuni" }, vi: { c: "#8E3942", r: 16, l: "Vitigni" }, pa: { c: "#ADC136", r: 10, l: "Partner" } };
  const nodes = [{ id: "c", g: "center", label: "Strada del Vino" }];
  D.aziende.forEach((a, i) => nodes.push({ id: "a" + i, g: "az", label: a }));
  D.comuni.forEach((c) => nodes.push({ id: "co-" + c.id, g: "co", label: c.nome, ref: c.id }));
  D.vitigni.forEach((v) => nodes.push({ id: "v-" + v.id, g: "vi", label: v.nome }));
  D.partner.forEach((p, i) => nodes.push({ id: "p" + i, g: "pa", label: p.nome }));
  const links = [];
  nodes.forEach((n) => { if (n.g !== "center") links.push([n.id, "c"]); });
  D.comuni.forEach((c) => { const m = M.comuni.find((x) => x.id === c.id); M.comuni.filter((x) => x.id !== c.id).sort((a, b) => Math.hypot(a.x - m.x, a.y - m.y) - Math.hypot(b.x - m.x, b.y - m.y)).slice(0, 2).forEach((nb) => { if (!links.find((l) => (l[0] === "co-" + nb.id && l[1] === "co-" + c.id))) links.push(["co-" + c.id, "co-" + nb.id]); }); });
  const RING = { az: 0.36, co: 0.2, vi: 0.12, pa: 0.46 };
  let W = 0, Hh = 0, running = false, drag = null, energy = 1;
  const byId = {};
  function build() {
    svg.innerHTML = ""; const gl = document.createElementNS(NS, "g"), gn = document.createElementNS(NS, "g"); svg.append(gl, gn);
    links.forEach((l) => { const e = document.createElementNS(NS, "line"); e.setAttribute("class", "lk"); l.el = e; gl.appendChild(e); });
    nodes.forEach((n, i) => {
      byId[n.id] = n; const g = document.createElementNS(NS, "g"); g.setAttribute("class", `nd g-${n.g}${n.me ? " me" : ""}`);
      g.innerHTML = `<circle r="${GR[n.g].r}" fill="${n.me ? "#ADC136" : GR[n.g].c}"/>${n.g === "center" || n.g === "vi" || n.g === "co" || n.me ? `<text y="${GR[n.g].r + 16}" text-anchor="middle">${esc(n.label)}</text>` : ""}`;
      n.el = g; gn.appendChild(g);
      if (n.x == null) { const a = (i / nodes.length) * Math.PI * 12, rr = n.g === "center" ? 0 : (RING[n.g] || 0.3); n.x = W / 2 + Math.cos(a) * rr * Math.min(W, Hh) * 1.2 + (Math.random() - 0.5) * 40; n.y = Hh / 2 + Math.sin(a) * rr * Math.min(W, Hh) + (Math.random() - 0.5) * 40; n.vx = 0; n.vy = 0; }
      g.addEventListener("pointerdown", (e) => { drag = n; g.setPointerCapture(e.pointerId); wake(); });
      g.addEventListener("pointerenter", () => focus(n)); g.addEventListener("pointerleave", () => focus(null));
    });
  }
  function size() { const r = svg.getBoundingClientRect(); W = r.width; Hh = r.height; svg.setAttribute("viewBox", `0 0 ${W} ${Hh}`); }
  function focus(n) {
    const hid = new Set(); if (n) links.forEach((l) => { if (l[0] === n.id || l[1] === n.id) { hid.add(l[0]); hid.add(l[1]); } });
    nodes.forEach((m) => m.el.classList.toggle("dim", !!n && !hid.has(m.id)));
    links.forEach((l) => l.el.classList.toggle("hi", !!n && (l[0] === n.id || l[1] === n.id)));
    if (n) { tip.hidden = false; tip.textContent = n.label + (n.g !== "center" ? " · " + (n.me ? "la tua realtà" : GR[n.g].l.toLowerCase()) : ""); tip.style.left = n.x + "px"; tip.style.top = n.y - GR[n.g].r + "px"; } else tip.hidden = true;
  }
  function step() {
    const k = Math.min(W, Hh);
    nodes.forEach((a) => {
      if (a.g === "center") { a.vx += (W / 2 - a.x) * 0.02; a.vy += (Hh / 2 - a.y) * 0.02; }
      nodes.forEach((b) => { if (a === b) return; const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 0.01, min = (GR[a.g].r + GR[b.g].r + 14); if (d2 < 22000) { const f = (a.g === "center" || b.g === "center" ? 900 : 380) / d2; a.vx += dx * f; a.vy += dy * f; } if (d2 < min * min) { const d = Math.sqrt(d2); a.vx += (dx / d) * 0.6; a.vy += (dy / d) * 0.6; } });
    });
    links.forEach((l) => { const a = byId[l[0]], b = byId[l[1]]; const rest = b.g === "center" ? (RING[a.g] || 0.3) * k : 0.14 * k; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = (d - rest) * 0.004; a.vx += dx / d * f * d * 0.02; a.vy += dy / d * f * d * 0.02; if (b.g !== "center") { b.vx -= dx / d * f * d * 0.02; b.vy -= dy / d * f * d * 0.02; } });
    energy = 0;
    nodes.forEach((n) => {
      if (n === drag) return;
      n.vx *= 0.82; n.vy *= 0.82; n.x += n.vx; n.y += n.vy;
      const m = GR[n.g].r + 10; n.x = Math.max(m, Math.min(W - m, n.x)); n.y = Math.max(m, Math.min(Hh - m - 30, n.y));
      energy += Math.abs(n.vx) + Math.abs(n.vy);
    });
    links.forEach((l) => { const a = byId[l[0]], b = byId[l[1]]; l.el.setAttribute("x1", a.x.toFixed(1)); l.el.setAttribute("y1", a.y.toFixed(1)); l.el.setAttribute("x2", b.x.toFixed(1)); l.el.setAttribute("y2", b.y.toFixed(1)); });
    nodes.forEach((n) => n.el.setAttribute("transform", `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`));
    if (energy > 0.4 || drag) requestAnimationFrame(step); else running = false;
  }
  function wake() { if (!running) { running = true; requestAnimationFrame(step); } }
  svg.addEventListener("pointermove", (e) => { if (!drag) return; const r = svg.getBoundingClientRect(); drag.x = e.clientX - r.left; drag.y = e.clientY - r.top; drag.vx = drag.vy = 0; focus(drag); });
  addEventListener("pointerup", () => { if (drag) { drag = null; wake(); } });
  size(); build();
  new IntersectionObserver(([en]) => { if (en.isIntersecting) wake(); }, { threshold: 0.2 }).observe(cst);
  addEventListener("resize", () => { size(); wake(); });
  // filtri per gruppo
  const counts = { az: D.aziende.length, co: D.comuni.length, vi: D.vitigni.length, pa: D.partner.length };
  $("[data-chips]").innerHTML = Object.entries(counts).map(([g, n]) => `<button type="button" class="chip" data-g="${g}" aria-pressed="true"><i style="background:${GR[g].c}"></i>${GR[g].l} <b>${n}</b></button>`).join("");
  $("[data-chips]").addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (!c) return; const on = c.getAttribute("aria-pressed") !== "true"; c.setAttribute("aria-pressed", on); nodes.forEach((n) => { if (n.g === c.dataset.g) n.el.style.display = on ? "" : "none"; }); links.forEach((l) => { const a = byId[l[0]]; if (a.g === c.dataset.g) l.el.style.display = on ? "" : "none"; }); });
  // aggiungi la tua realtà
  $("[data-addme]").addEventListener("click", () => {
    if (byId.me) { window.__lenis ? window.__lenis.scrollTo("#aderisci", { offset: -40 }) : $("#aderisci").scrollIntoView(); return; }
    const n = { id: "me", g: "az", me: true, label: "Tu", x: W - 80, y: Hh - 80, vx: -6, vy: -6 };
    nodes.push(n); links.push(["me", "c"]); links.push(["me", nodes.find((x) => x.g === "co").id]);
    build(); wake(); focus(n);
    $$("[data-siamo]").forEach((s) => (s.textContent = "17 + 1"));
    $("[data-addme]").textContent = "Completa la candidatura →";
    if (hasG && !RM) { const me = byId.me.el.querySelector("circle"); gsap.fromTo(me, { scale: 5, transformOrigin: "50% 50%" }, { scale: 1, duration: 1.1, ease: "back.out(3)" }); $$(".lk").slice(-2).forEach((l) => gsap.fromTo(l, { strokeOpacity: 1, strokeWidth: 4, stroke: "#ADC136" }, { strokeOpacity: 0.8, strokeWidth: 1.8, duration: 1.4 })); }
  });

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
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (st) => { const y = st.scroll(); hd.classList.toggle("solid", y > innerHeight * 0.7); hd.classList.toggle("hide", y > lastY && y > innerHeight); lastY = y; } });
  $$(".hd-nav a").forEach((a) => { const t = $(a.getAttribute("href")); if (t) ScrollTrigger.create({ trigger: t, start: "top 50%", end: "bottom 50%", onToggle: (s) => a.classList.toggle("on", s.isActive) }); });

  $$("section h2").forEach((h) => { const sp = SplitText.create(h, { type: "lines,words", mask: "lines" }); gsap.from(sp.words, { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: h, start: "top 85%" } }); });

  // ---------- IL FILO lungo la pagina ----------
  const th = $(".thread"), tbg = $(".thread-bg"), tfg = $(".thread-fg"), tdot = $(".thread-dot");
  let tLen = 0;
  function layoutThread() {
    const docH = document.documentElement.scrollHeight, w = document.documentElement.clientWidth, gut = Math.max(9, Math.min(34, w * 0.02));
    th.setAttribute("height", docH); th.setAttribute("viewBox", `0 0 ${w} ${docH}`); th.style.height = docH + "px";
    const knots = $$("[data-knot]").map((el) => el.getBoundingClientRect().top + scrollY);
    let x = w / 2, y = innerHeight * 0.92, d = `M${x} ${y}`, side = 0;
    knots.slice(1).forEach((ky, i) => {
      const nx = i % 2 === 0 ? w - gut : gut, cy = ky + 30;
      d += ` L${x} ${Math.max(y, cy - 80)} C${x} ${cy} ${nx} ${cy - 40} ${nx} ${cy + 40}`;
      x = nx; y = cy + 40; side++;
    });
    d += ` L${x} ${docH - 40}`;
    tbg.setAttribute("d", d); tfg.setAttribute("d", d); tLen = tfg.getTotalLength();
  }
  layoutThread();
  gsap.set(tfg, { drawSVG: "0%" });
  const threadST = ScrollTrigger.create({ trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.6, onUpdate: (st) => { gsap.set(tfg, { drawSVG: `0% ${st.progress * 100}%` }); const p = tfg.getPointAtLength(tLen * st.progress); tdot.setAttribute("cx", p.x); tdot.setAttribute("cy", p.y); } });
  ScrollTrigger.addEventListener("refreshInit", () => layoutThread());

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
    const s = $("[data-inthread]"), w = innerWidth, h = innerHeight; s.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const pts = []; for (let i = 0; i < 28; i++) { const a = i * 2.39996, r = Math.sqrt(i / 28) * Math.min(w, h) * 0.34; pts.push({ x: w / 2 + Math.cos(a) * r * 1.35, y: h * 0.42 + Math.sin(a) * r }); }
    let lk = ""; pts.forEach((p, i) => { const q = pts[(i * 7 + 3) % pts.length]; lk += `<line class="link" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`; });
    const ord = pts.slice().sort((a, b) => a.x - b.x);
    const dd = catmull(ord.map((p) => ({ x: +p.x.toFixed(1), y: +p.y.toFixed(1) })));
    s.innerHTML = `<g>${lk}</g><path class="ln" d="${dd}"/>${pts.map((p, i) => `<circle class="node ${i % 3 ? "" : "c"}" cx="${p.x}" cy="${p.y}" r="${i % 3 ? 5 : 8}"/>`).join("")}`;
    const tw = SplitText.create(".in-t", { type: "words", mask: "words" });
    gsap.set($$(".node", s), { scale: 0, transformOrigin: "center" }); gsap.set($$(".link", s), { drawSVG: "0%" }); gsap.set($(".ln", s), { drawSVG: "0%" }); gsap.set(tw.words, { yPercent: 110 });
    const tl = gsap.timeline();
    tl.to($$(".node", s), { scale: 1, duration: 0.6, ease: "back.out(3)", stagger: { each: 0.03, from: "center" } }, 0)
      .to($$(".link", s), { drawSVG: "100%", duration: 1, ease: "power2.inOut", stagger: 0.02 }, 0.4)
      .to($(".ln", s), { drawSVG: "100%", duration: 2, ease: "power2.inOut" }, 0.6)
      .to(tw.words, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, 1)
      .addLabel("out", 2.9)
      .to(tw.words, { yPercent: -110, duration: 0.5, ease: "power3.in", stagger: 0.03 }, "out")
      .to($$(".node,.link", s), { autoAlpha: 0, duration: 0.5 }, "out")
      .to($(".ln", s), { drawSVG: "100% 100%", duration: 1, ease: "power3.in" }, "out")
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
  gsap.from(".chip", { y: 20, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: "back.out(2)", scrollTrigger: { trigger: ".chips", start: "top 90%" } });
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
