/* Versione D · Terra e persone — sintesi fra il racconto scientifico e la rete */
(function () {
  "use strict";
  const { D, M, RM, $, $$, esc, smooth, mapSVG, counter, membership, categoriaNome, icon, demoBadge, introOnce } = window.LSDVCore;
  const B = window.LSDV_BRAND, AR = window.LSDV_AROMI, H = document.documentElement;
  const hasG = !!window.gsap;
  if (hasG) gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
  const snd = (n) => window.LSDVSound && window.LSDVSound.play(n);

  /* ================= RENDER ================= */
  const logo = (el, br, gr) => { el.setAttribute("viewBox", B.logo.vb); el.innerHTML = `<path fill="${br}" fill-rule="evenodd" d="${B.logo.br}"/><path fill="${gr}" fill-rule="evenodd" d="${B.logo.gr}"/>`; };
  $$("[data-logo]").forEach((el) => logo(el, "#442413", "#ADC136"));
  logo($("[data-logow]"), "#FCF6E1", "#ADC136");
  const pit = $("[data-pitto]");
  pit.setAttribute("viewBox", B.pitto.vb);
  pit.innerHTML = `<path class="o" fill-rule="evenodd" d="${B.pitto.br}"/><path class="f" fill-rule="evenodd" d="${B.pitto.br}"/><path class="g" fill-rule="evenodd" d="${B.pitto.gr}"/>`;

  $("[data-missione]").textContent = D.ente.missione;
  $("[data-nums]").innerHTML = D.numeri.map((n) => `<li><b data-count="${n.n}">${n.n}</b><span>${esc(n.label)}</span></li>`).join("");
  $("[data-quote]").textContent = "«" + D.ente.citazione.testo + "»";
  $("[data-quote-a]").textContent = `${D.ente.citazione.autore} · ${D.ente.citazione.ruolo}`;
  $("[data-manifesto]").innerHTML = D.manifesto.map((m, i) => `<div><b>0${i + 1}</b><h3>${esc(m.t)}</h3><p>${esc(m.d)}</p></div>`).join("");
  $("[data-storia]").innerHTML = D.storia.map((s) => `<article data-y="${esc(s.anno)}"><h3>${esc(s.titolo)}</h3><p>${esc(s.testo)}</p><span class="src">${esc(s.fonte)}</span></article>`).join("");
  $("[data-year]").textContent = D.storia[0].anno;

  $("[data-map]").innerHTML = mapSVG({ par: "xMidYMid slice" });
  $("[data-map2]").innerHTML = mapSVG({ par: "xMidYMid slice" });
  $("[data-comuni]").innerHTML = D.comuni.map((c) => {
    const m = M.comuni.find((x) => x.id === c.id) || {};
    return `<li data-id="${c.id}" tabindex="0"><b>${esc(c.nome)}</b><span>${m.quota || ""} m</span><p>${esc(c.testo)}</p></li>`;
  }).join("");

  $("[data-suoli]").innerHTML = D.suoli.map((s) => `<article class="su-s"><img src="../${s.img}" alt="" loading="lazy"><div><p class="area">${esc(s.area)}</p><h3>${esc(s.nome)}</h3><p class="wrb">${esc(s.wrb)}</p><p>${esc(s.testo)}</p></div></article>`).join("");

  const LOGHI = { "Alois": "alois", "Canestrini": "canestrini", "I Vignai del Casavecchia": "vignai", "Masseria Piccirillo": "piccirillo", "Sagliocco": "sagliocco", "Scaramuzzo": "scaramuzzo", "Sclavia": "sclavia" };
  const ring = $("[data-ring]"), NAZ = D.aziende.length, STEP = 360 / NAZ;
  const RAD = () => (innerWidth < 700 ? 290 : innerWidth < 1200 ? 420 : 500);
  ring.innerHTML = D.aziende.map((a, i) => {
    const l = LOGHI[a.split(" (")[0].split(" · ")[0]] || LOGHI[a];
    return `<article class="gcard" data-i="${i}"><span class="n">${String(i + 1).padStart(2, "0")}</span>${l ? `<img src="../shared/img/loghi/${l}.png" alt="" loading="lazy">` : ""}<b>${esc(a)}</b><small>azienda aderente</small></article>`;
  }).join("");
  $("[data-aziende]").innerHTML = D.aziende.map((a) => `<li>${esc(a)}</li>`).join("");
  const PERC = ["M10 120C40 70 60 100 90 60S130 20 145 8", "M8 20C40 50 30 92 82 92S140 122 146 104", "M12 130C22 90 72 110 92 70S112 12 146 30"];
  $("[data-percorsi]").innerHTML = D.percorsi.map((p, i) => `<article class="perc"><svg viewBox="0 0 150 140" aria-hidden="true"><path d="${PERC[i]}"/></svg><h3>${esc(p.nome)}</h3><p>${esc(p.testo)}</p></article>`).join("");

  const ant = D.eventi.find((e) => e.stato === "archivio");
  $("[data-evmain]").innerHTML = `<figure><img src="../${ant.img}" alt="Vigneti al tramonto"></figure><div class="ev-b"><p class="d">${esc(ant.data)}</p><h3>${esc(ant.titolo)}</h3><p class="l">${esc(ant.luogo)}</p><p>${esc(ant.testo)}</p><div class="panel"><div><h4>Panel degustatori</h4><ul>${D.panel.degustatori.slice(0, 6).map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div><div><h4>Panel enologi</h4><ul>${D.panel.enologi.slice(0, 6).map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div></div></div>`;
  $("[data-evnext]").innerHTML = D.eventi.filter((e) => e.stato !== "archivio").map((e) => `<article class="ev-i"><p class="d">${esc(e.data)} · ${esc(e.luogo)}</p><h3>${esc(e.titolo)}</h3><p>${esc(e.testo)}</p>${e.demo ? '<span class="tag">esempio</span>' : ""}</article>`).join("");

  $("[data-vlog]").innerHTML = D.vlog.map((v, i) => `<article class="voce" data-i="${i}" tabindex="0" role="button" aria-label="${esc(v.titolo)}"><img src="../${v.img}" alt="" loading="lazy"><video muted loop playsinline preload="none" data-t="${i * 9}"><source src="../shared/video/vigna.mp4" type="video/mp4"></video><div><p class="ep">EP. ${v.ep} · ${v.durata}</p><h3>${esc(v.titolo)}</h3><p>${esc(v.testo)}</p></div></article>`).join("");
  $("[data-blog]").innerHTML = D.blog.map((b) => `<a class="art" href="#racconti"><p class="c"><span>${esc(b.cat)}</span><span>${b.min} min</span></p><div class="im"><img src="../${b.img}" alt="" loading="lazy"></div><h3>${esc(b.titolo)}</h3><p>${esc(b.estratto)}</p></a>`).join("");

  $("[data-adintro]").textContent = D.adesione.intro;
  $("[data-passi]").innerHTML = D.adesione.passi.map((p) => `<li><b>${esc(p.t)}</b>${esc(p.d)}</li>`).join("");
  $("[data-cats]").innerHTML = D.adesione.categorie.map((c) => `<button type="button" class="cat" data-cat="${c.id}" aria-pressed="false">${icon(c.icona)}<span>${esc(c.nome)}</span></button>`).join("");
  $("#lcomuni").innerHTML = D.comuni.map((c) => `<option value="${esc(c.nome)}">`).join("");
  $("[data-contatti]").innerHTML = `${esc(D.ente.sede)}<a href="mailto:${D.ente.email}">${D.ente.email}</a><a href="tel:+39${D.ente.tel.replace(/\s/g, "")}">${D.ente.tel}</a>`;
  $("[data-partner]").innerHTML = D.partner.map((p) => esc(p.nome)).join(" · ");
  $("[data-fcit]").textContent = "«" + D.ente.citazione2.testo + "»";
  $("#mnav nav").innerHTML = $$(".hd-nav a").map((a) => `<a href="${a.getAttribute("href")}">${a.textContent}</a>`).join("") + '<a href="#aderisci">Aderisci</a>';
  demoBadge("D · Terra e persone");

  /* ---------- video in rotazione nella colonna della hero ---------- */
  const CLIPS = [
    { f: "vendemmia", t: "Vendemmia tra i filari" },
    { f: "vendemmia-mani", t: "Il taglio del grappolo" },
    { f: "vendemmia-tramonto", t: "I filari al tramonto" }
  ];
  const vids = $$(".hero-vid"), leggero = innerWidth < 900 || (navigator.connection && navigator.connection.saveData);
  let cur = 0, slot = 0;
  function mostra(i, primo) {
    const a = vids[slot], b = vids[1 - slot];
    b.src = `../shared/video/${CLIPS[i].f}${leggero ? "-mobile" : ""}.mp4`; b.load();
    const via = () => {
      const p = b.play(); p && p.catch(() => {});
      b.classList.add("on");
      $("[data-vcap]").textContent = CLIPS[i].t;
      if (!primo && hasG && !RM) {
        gsap.fromTo(b, { autoAlpha: 0, xPercent: 4 }, { autoAlpha: 1, xPercent: 0, duration: 1.5, ease: "power2.inOut" });
        gsap.to(a, { autoAlpha: 0, xPercent: -4, duration: 1.5, ease: "power2.inOut", onComplete: () => { a.classList.remove("on"); a.pause(); a.removeAttribute("src"); a.load(); } });
        gsap.fromTo("[data-vcap]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6 });
      } else if (!primo) { a.classList.remove("on"); a.pause(); }
      slot = 1 - slot; cur = i;
    };
    b.readyState >= 2 ? via() : b.addEventListener("loadeddata", via, { once: true });
  }
  if (!RM) { mostra(0, true); setInterval(() => { if (!document.hidden) mostra((cur + 1) % CLIPS.length); }, 9500); }

  /* ---------- radar degli aromi ---------- */
  const DESC = Object.keys(AR.descrittori), SUOLI = Object.keys(AR.suoli), SC = { vulcanici: "#ADC136", marne: "#C98A3C", volturno: "#F2E8D5" };
  const radar = $("[data-radar]"), R = 128, NR = DESC.length, ang = (i) => -Math.PI / 2 + (i / NR) * Math.PI * 2;
  let g = "";
  for (let k = 1; k <= 4; k++) g += `<polygon class="grid" points="${DESC.map((_, i) => `${(Math.cos(ang(i)) * R * k / 4).toFixed(1)},${(Math.sin(ang(i)) * R * k / 4).toFixed(1)}`).join(" ")}"/>`;
  DESC.forEach((d, i) => { g += `<line class="axis" x1="0" y1="0" x2="${(Math.cos(ang(i)) * R).toFixed(1)}" y2="${(Math.sin(ang(i)) * R).toFixed(1)}"/><text class="lbl" x="${(Math.cos(ang(i)) * (R + 21)).toFixed(1)}" y="${(Math.sin(ang(i)) * (R + 21) + 3).toFixed(1)}" text-anchor="middle">${d}</text>`; });
  g += SUOLI.map((s) => `<polygon class="poly" data-s="${s}" stroke="${SC[s]}" fill="${SC[s]}"/>`).join("");
  radar.innerHTML = g;
  const vals = Object.fromEntries(SUOLI.map((s) => [s, Object.fromEntries(DESC.map((d) => [d, 0]))]));
  const draw = () => SUOLI.forEach((s) => $(`.poly[data-s=${s}]`, radar).setAttribute("points", DESC.map((d, i) => { const r = (vals[s][d] / 80) * R; return `${(Math.cos(ang(i)) * r).toFixed(1)},${(Math.sin(ang(i)) * r).toFixed(1)}`; }).join(" ")));
  $("[data-rv]").innerHTML = Object.entries(AR.vitigni).map(([k, v], i) => `<button type="button" data-k="${k}" aria-pressed="${i === 2}">${v}<small>3 suoli a confronto</small></button>`).join("");
  $("[data-rleg]").innerHTML = SUOLI.map((s) => `<li data-s="${s}"><i style="background:${SC[s]}"></i>${AR.suoli[s]}</li>`).join("");
  function setRadar(anim) {
    const v = $("[data-rv] [aria-pressed=true]").dataset.k;
    SUOLI.forEach((s) => {
      const to = Object.fromEntries(DESC.map((d) => [d, AR.dati[v][s][d] || 0]));
      if (hasG && anim && !RM) gsap.to(vals[s], Object.assign({}, to, { duration: 1.1, ease: "elastic.out(1,.65)", onUpdate: draw, delay: SUOLI.indexOf(s) * 0.07 }));
      else { Object.assign(vals[s], to); draw(); }
    });
  }
  $("[data-rv]").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("[data-rv] button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    setRadar(true); snd("select");
    if (hasG && !RM) gsap.fromTo(b, { rotateX: -70, z: -50 }, { rotateX: 0, z: 0, duration: 0.8, ease: "back.out(1.7)", transformOrigin: "50% 50% -25px" });
  });
  $("[data-rleg]").addEventListener("click", (e) => { const li = e.target.closest("li"); if (!li) return; li.classList.toggle("off"); $(`.poly[data-s=${li.dataset.s}]`, radar).style.display = li.classList.contains("off") ? "none" : ""; snd("tap"); });
  setRadar(false);

  /* ---------- giostra dei logotipi ---------- */
  const gcards = $$(".gcard", ring);
  let gi = 0, gRot = 0, gDrag = null;
  const layout = () => { const r = RAD(); gcards.forEach((c, i) => (c.style.transform = `rotateY(${i * STEP}deg) translateZ(${r}px)`)); ring.style.transform = `translateZ(${-r}px) rotateY(${gRot}deg)`; };
  function vaiA(i, s) {
    gi = (i + NAZ) % NAZ; gRot = -gi * STEP;
    gcards.forEach((c, k) => c.classList.toggle("on", k === gi));
    $("[data-gname]").textContent = D.aziende[gi];
    $("[data-gnum]").textContent = String(gi + 1).padStart(2, "0");
    if (hasG && !RM) gsap.to(ring, { rotateY: gRot, duration: 1.05, ease: "power3.out", overwrite: true }); else layout();
    if (s) snd("slide");
  }
  layout(); vaiA(0);
  addEventListener("resize", layout);
  $("[data-gnext]").addEventListener("click", () => vaiA(gi + 1));
  $("[data-gprev]").addEventListener("click", () => vaiA(gi - 1));
  gcards.forEach((c) => c.addEventListener("click", () => vaiA(+c.dataset.i, true)));
  ring.addEventListener("pointerdown", (e) => { gDrag = { x: e.clientX, r: gRot }; ring.setPointerCapture(e.pointerId); });
  ring.addEventListener("pointermove", (e) => { if (!gDrag || !hasG) return; gsap.set(ring, { rotateY: gDrag.r + (e.clientX - gDrag.x) * 0.25 }); });
  ring.addEventListener("pointerup", (e) => { if (!gDrag) return; const d = (e.clientX - gDrag.x) * 0.25; gDrag = null; vaiA(Math.round(-(gRot + d) / STEP), true); });

  /* ---------- video verticali ---------- */
  $$(".voce").forEach((v) => {
    const vid = $("video", v);
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !RM) { if (vid.preload !== "auto") { vid.preload = "auto"; vid.load(); vid.currentTime = +vid.dataset.t; } vid.play().then(() => v.classList.add("on")).catch(() => {}); }
      else { vid.pause(); v.classList.remove("on"); }
    }, { threshold: 0.5 }).observe(v);
  });

  /* ---------- quote e modulo ---------- */
  const TIERS = {
    persone: [
      { t: "Under 30", p: 10, d: "Per studenti e giovani sommelier.", v: ["Tessera digitale", "Newsletter", "Inviti agli eventi"], cat: "sostenitori" },
      { t: "Sostenitore", p: 25, d: "Per chi sostiene la divulgazione.", v: ["Tessera", "Riduzioni agli eventi", "Voce nell'assemblea"], cat: "sostenitori", badge: "Consigliata" },
      { t: "Famiglia", p: 60, d: "Una tessera per il nucleo.", v: ["Fino a 4 tessere", "Passeggiate tra i filari", "Riduzioni"], cat: "sostenitori" },
      { t: "Mecenate", p: 250, d: "Per chi sostiene ricerca e archivio.", v: ["Registro dei mecenati", "Visita all'Archivio", "Tutto il resto"], cat: "sostenitori" }
    ],
    aziende: [
      { t: "Cantine", p: 200, d: "Aziende vitivinicole DOC e IGT.", v: ["Scheda nella mappa", "Anteprima", "Racconto video"], cat: "cantine" },
      { t: "Ristorazione", p: 150, d: "Ristoranti, wine bar, enoteche.", v: ["Scheda nella mappa", "Percorso dei Sapori", "Eventi"], cat: "ristorazione" },
      { t: "Ospitalità", p: 120, d: "B&B, agriturismi, affittacamere.", v: ["Scheda nella mappa", "Pacchetti", "Eventi"], cat: "ospitalita" },
      { t: "Produttori ed enti", p: 80, d: "Agroalimentare; enti da 150 €.", v: ["Scheda nella mappa", "Percorso dei Sapori", "Mercati"], cat: "agroalimentare" }
    ]
  };
  let aud = "persone";
  const renderTiers = (anim) => {
    $("[data-tiers]").innerHTML = TIERS[aud].map((t, i) => `<button type="button" class="tier" data-i="${i}" aria-pressed="false">${t.badge ? `<span class="badge">${t.badge}</span>` : ""}<h3>${esc(t.t)}</h3><p class="pr">${t.p} €<small> /anno</small></p><p>${esc(t.d)}</p><ul>${t.v.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></button>`).join("");
    if (anim && hasG && !RM) gsap.from(".tier", { y: 26, autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: "expo.out" });
    window.LSDVSound && window.LSDVSound.bind();
  };
  renderTiers(false);
  $$(".ad-tabs button").forEach((b) => b.addEventListener("click", () => { $$(".ad-tabs button").forEach((x) => x.setAttribute("aria-selected", x === b)); aud = b.dataset.aud; renderTiers(true); $("[data-ck]").textContent = aud === "persone" ? "Tessera sostenitore" : "Socio della Strada"; }));

  const form = $("[data-form]"), card = $("[data-card]");
  membership(form, {
    onStep(from, to, dir) { if (hasG && !RM && dir) gsap.fromTo(to, { y: 26 * dir, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out" }); },
    onCategory(c) { $("[data-ccat]").textContent = categoriaNome(c); snd("select"); },
    onInput(f) { if (f.name === "nome") $("[data-cname]").textContent = f.value || "Il tuo nome"; },
    onError(step) { if (hasG && !RM) gsap.fromTo(step, { x: -9 }, { x: 0, duration: 0.55, ease: "elastic.out(1,.3)" }); },
    onSubmit(d) {
      $$("[data-step]", form).forEach((s) => (s.hidden = true)); $("[data-progress]", form).style.setProperty("--p", 1);
      const ok = $(".ad-ok", form); ok.hidden = false;
      $("[data-okmsg]", form).textContent = `Grazie ${d.nome.split(" ")[0]}: la candidatura come «${categoriaNome(d.categoria)}» da ${d.comune} è arrivata. Ti ricontattiamo per conoscerci.`;
      card.classList.add("flip"); snd("open");
      if (hasG && !RM) gsap.from($$("h3,p", ok), { y: 18, autoAlpha: 0, stagger: 0.09, duration: 0.7, ease: "expo.out" });
    }
  });
  $("[data-tiers]").addEventListener("click", (e) => { const t = e.target.closest(".tier"); if (!t) return; $$(".tier").forEach((x) => x.setAttribute("aria-pressed", x === t)); const tier = TIERS[aud][+t.dataset.i]; const b = $(`[data-cat="${tier.cat}"]`, form); b && b.click(); $("[data-ck]").textContent = tier.t + " · " + tier.p + " €"; });
  card.addEventListener("pointermove", (e) => { if (card.classList.contains("flip")) return; const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; $(".card-in", card).style.transform = `rotateY(${(x - .5) * 14}deg) rotateX(${-(y - .5) * 10}deg)`; $(".card-f", card).style.setProperty("--gx", x * 100 + "%"); $(".card-f", card).style.setProperty("--gy", y * 100 + "%"); });
  card.addEventListener("pointerleave", () => { if (!card.classList.contains("flip")) $(".card-in", card).style.transform = ""; });
  card.addEventListener("click", () => card.classList.remove("flip"));

  /* ---------- menu ---------- */
  const burger = $(".hd-burger"), mnav = $("#mnav");
  const setMenu = (o) => { burger.setAttribute("aria-expanded", o); mnav.hidden = !o; H.classList.toggle("menu-open", o); window.__lenis && (o ? window.__lenis.stop() : window.__lenis.start()); };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  mnav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  window.LSDVSound && window.LSDVSound.bind();

  /* ---------- carta che segue i comuni ---------- */
  const fly = $(".terr-map svg"), full = `0 0 ${M.vw} ${M.vh}`, tq = $("[data-tq]");
  fly.setAttribute("viewBox", full);
  const qv = { z: 0 };
  function flyTo(id) {
    const m = M.comuni.find((x) => x.id === id); if (!m) return;
    const w = 620, h = w * ((fly.clientHeight || 600) / (fly.clientWidth || 800));
    if (hasG) gsap.to(fly, { attr: { viewBox: `${m.x - w / 2} ${m.y - h / 2} ${w} ${h}` }, duration: 1.4, ease: "expo.inOut", overwrite: true });
    $$(".terr-map .pin").forEach((p) => p.classList.toggle("on", p.dataset.id === id));
    if (hasG) gsap.to(qv, { z: m.quota, duration: 1, overwrite: true, onUpdate: () => (tq.textContent = Math.round(qv.z)) }); else tq.textContent = m.quota;
  }
  $$(".terr-list li").forEach((li) => {
    const attiva = () => { $$(".terr-list li").forEach((x) => x.classList.toggle("on", x === li)); flyTo(li.dataset.id); snd("slide"); };
    li.addEventListener("pointerenter", attiva); li.addEventListener("focus", attiva); li.addEventListener("click", attiva);
  });

  if (!hasG || RM) { $$("[data-count]").forEach((c) => (c.textContent = c.dataset.count)); return; }

  /* ================= MOTION ================= */
  const lenis = smooth({ lerp: 0.09 });
  let lastY = 0; const hd = $(".hd");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (st) => { const y = st.scroll(); hd.classList.toggle("solid", y > 80); hd.classList.toggle("hide", y > lastY && y > 600); lastY = y; } });
  $$(".hd-nav a").forEach((a) => {
    const t = $(a.getAttribute("href"));
    if (t) ScrollTrigger.create({ trigger: t, start: "top 50%", end: "bottom 50%", onToggle: (s) => a.classList.toggle("on", s.isActive) });
    a.addEventListener("pointerenter", () => gsap.fromTo(a, { rotateX: -50 }, { rotateX: 0, duration: 0.55, ease: "back.out(2)", transformOrigin: "50% 100% -10px" }));
    a.dataset.snd = "hover";
  });
  window.LSDVSound && window.LSDVSound.bind();

  // titoli e testi
  $$("h2").forEach((h) => { const sp = SplitText.create(h, { type: "lines,words", mask: "lines" }); gsap.from(sp.words, { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: h, start: "top 86%" } }); });

  // hero
  const hs = SplitText.create(".hero h1 span, .hero h1 em", { type: "chars", mask: "chars" });
  gsap.set(hs.chars, { yPercent: 110 });
  gsap.timeline({ delay: 0.15 })
    .to(hs.chars, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.02 }, 0)
    .from(".hero .kick, .lead, .acts", { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" }, 0.25)
    .from(".hero-media", { autoAlpha: 0, x: 40, duration: 1.4, ease: "expo.out" }, 0.1)
    .from(".hero-n li", { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.9);
  gsap.from(".hero-map .ct", { drawSVG: "50% 50%", duration: 1.8, ease: "power2.inOut", stagger: 0.006, scrollTrigger: { trigger: ".hero-map", start: "top 92%" } });
  $$("[data-count]").forEach((c) => { c.textContent = "0"; ScrollTrigger.create({ trigger: c, start: "top 95%", once: true, onEnter: () => counter(c, +c.dataset.count, 1.6) }); });
  // il video si attenua quando si scorre, e torna se si risale
  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.4 } })
    .to(".sfondo-vid", { opacity: 0.45, ease: "power1.in" }, 0)
    .to(".hero-media", { y: -40, ease: "none" }, 0);

  // citazione parola per parola
  const qw = SplitText.create("[data-quote]", { type: "words", wordsClass: "w" });
  gsap.to(qw.words, { opacity: 1, stagger: 0.09, ease: "none", scrollTrigger: { trigger: ".quote", start: "top 78%", end: "center 55%", scrub: true } });
  gsap.from(".pill3 div", { y: 44, autoAlpha: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".pill3", start: "top 88%" } });

  // storia: anno grande che cambia
  const ys = $("[data-year]"), arts = $$(".st-list article");
  arts.forEach((a) => {
    gsap.from(a.children, { y: 26, autoAlpha: 0, stagger: 0.08, duration: 0.85, ease: "expo.out", scrollTrigger: { trigger: a, start: "top 88%" } });
    ScrollTrigger.create({ trigger: a, start: "top 55%", end: "bottom 55%", onToggle: (s) => { if (s.isActive) { ys.textContent = a.dataset.y; gsap.fromTo(ys, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }); } } });
  });

  // suolo: blocco scuro che entra
  gsap.from(".su-s", { y: 60, autoAlpha: 0, stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".su-strati", start: "top 86%" } });
  gsap.fromTo(".suolo", { borderRadius: "90px" }, { borderRadius: "44px", ease: "none", scrollTrigger: { trigger: ".suolo", start: "top bottom", end: "top 55%", scrub: true } });
  ScrollTrigger.create({ trigger: ".su-radar", start: "top 72%", once: true, onEnter: () => { SUOLI.forEach((s) => DESC.forEach((d) => (vals[s][d] = 0))); draw(); setRadar(true); snd("step"); } });

  // rete
  gsap.from(".gcard", { autoAlpha: 0, z: -380, rotateY: -55, duration: 1.1, ease: "expo.out", stagger: { each: 0.045, from: "center" }, scrollTrigger: { trigger: ".giostra", start: "top 82%" } });
  $$(".perc").forEach((p) => gsap.from($("path", p), { drawSVG: "0%", duration: 1.7, scrollTrigger: { trigger: p, start: "top 88%" } }));

  // eventi, racconti, adesione
  gsap.to(".ev-main img", { scale: 1, ease: "none", scrollTrigger: { trigger: ".ev-main", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".ev-i", { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.95, ease: "expo.out", scrollTrigger: { trigger: ".ev-next", start: "top 88%" } });
  gsap.from(".voce", { y: 70, rotate: (i) => (i % 2 ? 3 : -3), autoAlpha: 0, stagger: 0.09, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".voci", start: "top 86%" } });
  gsap.from(".art", { y: 44, autoAlpha: 0, stagger: 0.09, duration: 0.95, ease: "expo.out", scrollTrigger: { trigger: ".mag", start: "top 88%" } });
  gsap.fromTo(".tier", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".tiers", start: "top 88%" } });
  gsap.from(".card3d", { rotateY: -34, rotateX: 16, y: 50, autoAlpha: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".ad-flow", start: "top 82%" } });
  gsap.from(".passi li", { y: 26, autoAlpha: 0, stagger: 0.09, duration: 0.85, ease: "expo.out", scrollTrigger: { trigger: ".passi", start: "top 92%" } });

  // trasparenza in ingresso e in uscita dei blocchi
  $$("section").forEach((s) => {
    if (s.classList.contains("hero")) return;
    gsap.fromTo(s, { autoAlpha: 0.2 }, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: s, start: "top 92%", end: "top 58%", scrub: 0.5 } });
    gsap.to(s, { autoAlpha: 0.2, ease: "none", scrollTrigger: { trigger: s, start: "bottom 46%", end: "bottom 6%", scrub: 0.5 } });
  });

  /* ---------- intro ---------- */
  const intro = $("#intro");
  if (introOnce("lsdvD")) {
    H.classList.add("intro-run"); lenis && lenis.stop();
    const w = SplitText.create(".in-w", { type: "words", mask: "words" });
    gsap.set(".in-w", { visibility: "visible" }); gsap.set(w.words, { yPercent: 110 }); gsap.set(".in-pitto .o", { drawSVG: "0%" });
    const tl = gsap.timeline();
    tl.to(".in-pitto .o", { drawSVG: "100%", duration: 1.6, ease: "power2.inOut" }, 0)
      .to(".in-pitto .f", { opacity: 1, duration: 0.8 }, 1.1)
      .to(".in-pitto .g", { opacity: 1, duration: 0.6, ease: "back.out(2)" }, 1.4)
      .to(w.words, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }, 1.2)
      .addLabel("out", 2.6)
      .to(".in-wrap", { y: -30, autoAlpha: 0, duration: 0.7, ease: "power2.in" }, "out")
      .to(intro, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "out+=0.2")
      .add(() => { H.classList.remove("intro-run"); intro.remove(); lenis && lenis.start(); ScrollTrigger.refresh(); }, "out+=1.1");
    const skip = () => tl.timeScale(4.5);
    $(".in-skip").addEventListener("click", skip);
    addEventListener("wheel", skip, { once: true, passive: true }); addEventListener("touchmove", skip, { once: true, passive: true });
    addEventListener("keydown", (e) => e.key === "Escape" && skip(), { once: true });
  } else intro.remove();

  addEventListener("load", () => ScrollTrigger.refresh());
})();
