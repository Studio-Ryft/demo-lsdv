/* Versione B · Il Suolo Parla */
(function () {
  "use strict";
  const { D, M, RM, $, $$, esc, smooth, mapSVG, counter, membership, categoriaNome, icon, demoBadge, introOnce } = window.LSDVCore;
  const B = window.LSDV_BRAND, AR = window.LSDV_AROMI, H = document.documentElement;
  const hasG = !!window.gsap;
  if (hasG) gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase, Draggable, InertiaPlugin);
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* ================= RENDER ================= */
  $$("[data-logo]").forEach((el) => { el.setAttribute("viewBox", B.logo.vb); el.innerHTML = `<path fill="#F2E8D5" fill-rule="evenodd" d="${B.logo.br}"/><path fill="#ADC136" fill-rule="evenodd" d="${B.logo.gr}"/>`; });
  const pitto = (el, cls = "") => { el.setAttribute("viewBox", B.pitto.vb); el.innerHTML = `<defs><clipPath id="fill${cls}"><rect class="lvl" x="1200" y="47" width="800" height="760"/></clipPath></defs><path class="o" fill-rule="evenodd" d="${B.pitto.br}"/><g clip-path="url(#fill${cls})"><path class="f" fill-rule="evenodd" d="${B.pitto.br}"/><path class="g" fill-rule="evenodd" d="${B.pitto.gr}"/></g>`; };
  pitto($("[data-pitto]"), "I"); pitto($("[data-okpitto]"), "O");

  /* ---------- video di sfondo: vendemmia e time lapse in vigna ---------- */
  const CLIPS = [
    { f: "vendemmia", t: "Vendemmia tra i filari" },
    { f: "sclavia-timelapse", t: "Time lapse in vigna · Sclavia" }
  ];
  const vids = $$(".hero-vid"), leggero = innerWidth < 900 || (navigator.connection && navigator.connection.saveData);
  const srcOf = (i) => `../shared/video/${CLIPS[i].f}${leggero ? "-mobile" : ""}.mp4`;
  $(".hero-clips").innerHTML = CLIPS.map((c, i) => `<li class="${i ? "" : "on"}"><i></i></li>`).join("");
  let cur = 0, slot = 0, rolling = false;
  function mostra(i, primo) {
    const a = vids[slot], b = vids[1 - slot];
    b.src = srcOf(i); b.load(); b.currentTime = 0;
    const via = () => {
      const p = b.play(); p && p.catch(() => {});
      b.classList.add("on");
      if (!primo) {
        if (window.gsap && !RM) {
          gsap.fromTo(b, { autoAlpha: 0, xPercent: 3, scale: 1.04 }, { autoAlpha: 1, xPercent: 0, scale: 1, duration: 1.6, ease: "power2.inOut" });
          gsap.to(a, { autoAlpha: 0, xPercent: -3, duration: 1.6, ease: "power2.inOut", onComplete: () => { a.classList.remove("on"); a.pause(); a.removeAttribute("src"); a.load(); } });
        } else { a.classList.remove("on"); a.pause(); }
      }
      slot = 1 - slot; cur = i;
      $$(".hero-clips li").forEach((li, k) => li.classList.toggle("on", k === i));
      window.LSDVSound && window.LSDVSound.play("slide");
    };
    b.readyState >= 2 ? via() : b.addEventListener("loadeddata", via, { once: true });
  }
  function avvia() {
    if (RM || rolling) return; rolling = true;
    vids[0].loop = true; vids[1].loop = true;
    mostra(0, true);
    if (CLIPS.length > 1) setInterval(() => { if (!document.hidden) mostra((cur + 1) % CLIPS.length); }, 10000);
  }
  avvia();

  $("[data-missione]").textContent = D.ente.missione;
  $("[data-herodata]").innerHTML = D.numeri.map((n) => `<li><b data-count="${n.n}">${n.n}</b>${esc(n.label)}</li>`).join("");
  $("[data-herocont]").innerHTML = mapSVG({ luoghi: false });
  $("[data-incont]").innerHTML = mapSVG({ luoghi: false });
  ["[data-quote]", "[data-quote2]"].forEach((s) => ($(s).textContent = "«" + D.ente.citazione.testo + "»"));
  ["[data-quote-a]", "[data-quote-a2]"].forEach((s) => ($(s).textContent = `${D.ente.citazione.autore} · ${D.ente.citazione.ruolo}`));
  $("[data-manifesto]").innerHTML = D.manifesto.map((m, i) => `<div><b>0${i + 1}</b><h3>${esc(m.t)}</h3><p>${esc(m.d)}</p></div>`).join("");

  // volo: comuni da ovest a est
  const ORD = M.comuni.slice().sort((a, b) => a.x - b.x).map((m) => Object.assign({}, m, D.comuni.find((c) => c.id === m.id)));
  $("[data-volomap]").innerHTML = mapSVG({ par: "xMidYMid slice" });

  const EDGE = "M0 14 C60 2 120 26 180 14 S300 2 360 14 480 26 540 14 660 2 720 14 840 26 900 14 1020 2 1080 14";
  $("[data-strati]").innerHTML = `<div class="st-track">${D.suoli.map((s, i) => {
    let g = ""; for (let k = 0; k < 26; k++) { const r = 2 + ((k * 37 + i * 11) % 9) * (i === 2 ? 0.6 : i === 0 ? 1.3 : 1); g += `<i style="left:${(k * 53 + i * 17) % 96}%;top:${(k * 29 + i * 7) % 96}%;width:${r}px;height:${r}px"></i>`; }
    return `<article class="stratum" data-s="${i}"><div class="tex"><img src="../${s.img}" alt="" loading="lazy"></div><svg class="edge" viewBox="0 0 1080 28" preserveAspectRatio="none"><path d="${EDGE}"/></svg><div class="grains">${g}</div><div class="txt"><p class="area">Macro area ${i + 1} · ${esc(s.area)}</p><h3>${esc(s.nome)}</h3><p class="wrb">${esc(s.wrb)}</p><p>${esc(s.testo)}</p></div></article>`;
  }).join("")}</div>`;
  $("[data-ruler]").innerHTML = [0, 25, 50, 75, 100, 125, 150].map((v) => `<span style="top:${(v / 150) * 100}%">${v}</span>`).join("") + "<i></i>";

  $("[data-storia]").innerHTML = D.storia.slice().reverse().map((s) => `<article class="layer"><p class="y">Strato<b>${esc(s.anno)}</b></p><div><h3>${esc(s.titolo)}</h3><p>${esc(s.testo)}</p><span class="src">${esc(s.fonte)}</span></div></article>`).join("");

  const mq = D.aziende.map((a) => `<span>${esc(a.split(" (")[0].split(" · ")[0])}</span>`).join("");
  $("[data-marq]").innerHTML = mq + mq;

  /* ---------- «Il grappolo della rete» ---------- */
  const gp = window.LSDVGrappolo.crea($("[data-grappolo]"), { loghi: "loghi-chiari" });
  $("[data-aziende]").innerHTML = D.aziende.map((a) => `<li>${esc(a)}</li>`).join("");

  const PERC = ["M10 120C40 70 60 100 90 60S130 20 140 10", "M8 20C40 50 30 90 80 90S130 120 140 100", "M10 130C20 90 70 110 90 70S110 10 140 30"];
  $("[data-percorsi]").innerHTML = D.percorsi.map((p, i) => `<article class="perc"><svg viewBox="0 0 150 140" aria-hidden="true"><path d="${PERC[i]}"/></svg><b>0${i + 1}</b><h3>${esc(p.nome)}</h3><p>${esc(p.testo)}</p></article>`).join("");

  const ant = D.eventi.find((e) => e.stato === "archivio");
  $("[data-evmain]").innerHTML = `<img src="../${ant.img}" alt="Vigneti al tramonto"><div class="ev-body"><div><p class="d">${esc(ant.data)}</p><h3>${esc(ant.titolo)}</h3><p class="l">${esc(ant.luogo)}</p><p class="t">${esc(ant.testo)}</p></div><div class="ev-panel"><h4>Panel degustatori</h4><ul>${D.panel.degustatori.map((p) => `<li>${esc(p)}</li>`).join("")}</ul><h4 style="margin-top:1.2rem">Panel enologi</h4><ul>${D.panel.enologi.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div></div>`;
  $("[data-evnext]").innerHTML = D.eventi.filter((e) => e.stato !== "archivio").map((e) => `<article class="ev-i"><p class="d">${esc(e.data)}</p><h3>${esc(e.titolo)}</h3><p>${esc(e.testo)}</p>${e.demo ? '<span class="tag-demo">Esempio</span>' : ""}</article>`).join("");

  $("[data-vlog]").innerHTML = D.vlog.concat(D.vlog.map((v, i) => Object.assign({}, v, { ep: String(5 + i).padStart(2, "0") }))).slice(0, 6).map((v, i) => `<div class="clip" data-cursor="Guarda"><img src="../${v.img}" alt="" draggable="false"><video muted loop playsinline preload="none" data-t="${i * 7}"><source src="../shared/video/vigna.mp4" type="video/mp4"></video><span class="rec">Episodio ${v.ep}</span><div class="meta"><p class="ep"><span>Voci dal suolo</span><span>${v.durata}</span></p><h4>${esc(v.titolo)}</h4><p>${esc(v.testo)}</p></div></div>`).join("");
  $("[data-blog]").innerHTML = D.blog.map((b) => `<a class="post" href="#video" data-cursor="Leggi"><p class="c"><span>${esc(b.cat)}</span><span>${b.min} min</span></p><div class="im"><img src="../${b.img}" alt="" loading="lazy"></div><h3>${esc(b.titolo)}</h3><p>${esc(b.estratto)}</p></a>`).join("");

  $("[data-adintro]").textContent = D.adesione.intro;
  $("[data-vantaggi]").innerHTML = D.adesione.vantaggi.map((v) => `<li>${esc(v)}</li>`).join("");
  $("[data-passi]").innerHTML = D.adesione.passi.map((p) => `<li><span><b>${esc(p.t)}</b> · ${esc(p.d)}</span></li>`).join("");
  $("[data-adnota]").textContent = D.adesione.nota;
  $("[data-cats]").innerHTML = D.adesione.categorie.map((c) => `<button type="button" class="cat" data-cat="${c.id}" aria-pressed="false">${icon(c.icona)}<span><b>${esc(c.nome)}</b><small>${esc(c.desc)}</small></span></button>`).join("");
  $("#lcomuni").innerHTML = D.comuni.map((c) => `<option value="${esc(c.nome)}">`).join("");
  $("[data-contatti]").innerHTML = `${esc(D.ente.sede)}<a href="mailto:${D.ente.email}">${D.ente.email}</a><a href="tel:+39${D.ente.tel.replace(/\s/g, "")}">${D.ente.tel}</a>`;
  $("[data-partner]").innerHTML = D.partner.map((p) => esc(p.nome)).join(" · ");
  $("#mnav nav").innerHTML = $$(".hd-nav a").map((a) => `<a href="${a.getAttribute("href")}">${a.textContent}</a>`).join("") + '<a href="#aderisci">Aderisci</a>';
  demoBadge("B · Il Suolo Parla");

  /* ================= RADAR ================= */
  const DESC = Object.keys(AR.descrittori), SUOLI = Object.keys(AR.suoli);
  const SC = { vulcanici: "#ADC136", marne: "#D9A24A", volturno: "#F2E8D5" };
  const radar = $("[data-radar]"), R = 130, N = DESC.length;
  const ang = (i) => -Math.PI / 2 + (i / N) * Math.PI * 2;
  let g = ""; for (let k = 1; k <= 4; k++) g += `<polygon class="grid" points="${DESC.map((_, i) => `${(Math.cos(ang(i)) * R * k / 4).toFixed(1)},${(Math.sin(ang(i)) * R * k / 4).toFixed(1)}`).join(" ")}"/>`;
  DESC.forEach((d, i) => { g += `<line class="axis" x1="0" y1="0" x2="${(Math.cos(ang(i)) * R).toFixed(1)}" y2="${(Math.sin(ang(i)) * R).toFixed(1)}"/><text class="lbl" x="${(Math.cos(ang(i)) * (R + 22)).toFixed(1)}" y="${(Math.sin(ang(i)) * (R + 22) + 3).toFixed(1)}" text-anchor="middle">${d}</text>`; });
  g += SUOLI.map((s) => `<polygon class="poly" data-s="${s}" stroke="${SC[s]}" fill="${SC[s]}"/>`).join("");
  radar.innerHTML = g;
  const vals = Object.fromEntries(SUOLI.map((s) => [s, Object.fromEntries(DESC.map((d) => [d, 0]))]));
  const drawRadar = () => SUOLI.forEach((s) => $(`.poly[data-s=${s}]`, radar).setAttribute("points", DESC.map((d, i) => { const r = (vals[s][d] / 80) * R; return `${(Math.cos(ang(i)) * r).toFixed(1)},${(Math.sin(ang(i)) * r).toFixed(1)}`; }).join(" ")));
  $("[data-rv]").innerHTML = Object.entries(AR.vitigni).map(([k, v], i) => `<button type="button" data-k="${k}" aria-pressed="${i === 2}">${v}<small>3 suoli a confronto</small></button>`).join("");
  $("[data-rleg]").innerHTML = SUOLI.map((s) => `<li data-s="${s}"><i style="background:${SC[s]}"></i>${AR.suoli[s]}</li>`).join("");
  function setRadar(anim) {
    const v = $("[data-rv] [aria-pressed=true]").dataset.k;
    SUOLI.forEach((s) => {
      const to = Object.fromEntries(DESC.map((d) => [d, AR.dati[v][s][d] || 0]));
      if (hasG && anim && !RM) gsap.to(vals[s], Object.assign({}, to, { duration: 1.2, ease: "elastic.out(1,0.6)", onUpdate: drawRadar, delay: SUOLI.indexOf(s) * 0.08 }));
      else { Object.assign(vals[s], to); drawRadar(); }
    });
  }
  $("[data-rv]").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("[data-rv] button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    setRadar(true);
    if (hasG && !RM) gsap.fromTo(b, { rotateX: -78, z: -60 }, { rotateX: 0, z: 0, duration: 0.85, ease: "back.out(1.7)", transformOrigin: "50% 50% -30px" });
    window.LSDVSound && window.LSDVSound.play("select");
  });
  $("[data-rleg]").addEventListener("click", (e) => { const li = e.target.closest("li"); if (!li) return; li.classList.toggle("off"); $(`.poly[data-s=${li.dataset.s}]`, radar).style.display = li.classList.contains("off") ? "none" : ""; });
  setRadar(false);

  /* ================= ALLA CIECA ================= */
  $("[data-cdesc]").innerHTML = DESC.map((d) => `<button type="button" aria-pressed="false">${d}</button>`).join("");
  $("[data-cdesc]").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const on = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", on);
    if (hasG && !RM) gsap.fromTo(b, { rotateY: on ? -70 : 70 }, { rotateY: 0, duration: 0.7, ease: "back.out(1.8)" });
    window.LSDVSound && window.LSDVSound.play(on ? "select" : "close");
  });
  $("[data-creveal]").addEventListener("click", () => {
    const sel = $$("[data-cdesc] [aria-pressed=true]").map((b) => b.textContent), res = $("[data-cres]");
    if (!sel.length) { res.textContent = "Scegli almeno un descrittore."; return; }
    let best = null;
    Object.keys(AR.dati).forEach((v) => SUOLI.forEach((s) => {
      const p = AR.dati[v][s]; let dot = 0, n1 = 0, n2 = 0;
      DESC.forEach((d) => { const a = sel.includes(d) ? 1 : 0, b = (p[d] || 0) / 100; dot += a * b; n1 += a * a; n2 += b * b; });
      const sim = dot / (Math.sqrt(n1) * Math.sqrt(n2) || 1);
      if (!best || sim > best.sim) best = { v, s, sim };
    }));
    $(".cieca-glass").classList.add("rev");
    const DOVE = { vulcanici: "sui depositi vulcanici", marne: "sulla collina marnoso-arenacea", volturno: "nel fondovalle del Volturno" };
    res.innerHTML = `Potrebbe essere un <b>${AR.vitigni[best.v]}</b> coltivato <b>${DOVE[best.s]}</b>. Affinità con il profilo misurato: ${Math.round(best.sim * 100)}%.`;
    if (hasG && !RM) { gsap.fromTo(".cieca-glass .wine", { attr: { y: 110 } }, { attr: { y: 40 }, duration: 1.4, ease: "power2.out" }); gsap.from(res, { y: 14, autoAlpha: 0, duration: 0.7 }); }
  });

  /* ================= MODULO ================= */
  const form = $("[data-form]");
  membership(form, {
    onStep(from, to, dir) { if (hasG && !RM && dir) gsap.fromTo(to, { y: 30 * dir, autoAlpha: 0, filter: "blur(6px)" }, { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }); },
    onError(step) { if (hasG && !RM) gsap.fromTo(step, { x: -10 }, { x: 0, duration: 0.6, ease: "elastic.out(1,.3)" }); },
    onSubmit(d) {
      $$("[data-step]", form).forEach((s) => (s.hidden = true)); $("[data-progress]", form).style.setProperty("--p", 1);
      const ok = $(".ad-ok", form); ok.hidden = false;
      $("[data-okmsg]", form).textContent = `${d.nome.split(" ")[0]}, la candidatura come «${categoriaNome(d.categoria)}» da ${d.comune} è arrivata. Ti ricontattiamo per conoscerci.`;
      if (hasG && !RM) { gsap.fromTo(".ok-pitto .lvl", { attr: { y: 800 } }, { attr: { y: 47 }, duration: 1.8, ease: "power2.inOut" }); gsap.fromTo(".ok-pitto .o", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.6, ease: "power2.inOut" }); gsap.from($$("h3,p", ok), { y: 20, autoAlpha: 0, stagger: 0.1, delay: 0.4, duration: 0.8, ease: "expo.out" }); }
    }
  });

  /* ================= MENU ================= */
  const burger = $(".hd-burger"), mnav = $("#mnav");
  const setMenu = (open) => { burger.setAttribute("aria-expanded", open); mnav.hidden = !open; H.classList.toggle("menu-open", open); window.__lenis && (open ? window.__lenis.stop() : window.__lenis.start()); };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  mnav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  // luce "alla cieca"
  const dq = $(".dark-quote");
  dq.addEventListener("pointermove", (e) => { const r = dq.getBoundingClientRect(); dq.style.setProperty("--mx", e.clientX - r.left + "px"); dq.style.setProperty("--my", e.clientY - r.top + "px"); });
  // video al passaggio
  $$(".clip").forEach((c) => {
    const v = $("video", c);
    const on = () => { c.classList.add("play"); if (v.preload !== "auto") { v.preload = "auto"; v.load(); v.currentTime = +v.dataset.t; } v.play().catch(() => {}); };
    const off = () => { c.classList.remove("play"); v.pause(); };
    c.addEventListener("mouseenter", on); c.addEventListener("mouseleave", off);
    c.addEventListener("click", () => (c.classList.contains("play") ? off() : on()));
  });

  if (!hasG || RM) return;

  /* ================= MOTION ================= */
  const lenis = smooth({ lerp: 0.08 });
  CustomEase.create("cut", "0.87,0,0.13,1");

  // cursore
  if (fine) {
    const cur = $(".cursor"), lbl = $("span", cur), pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const xs = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" }), ys = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    addEventListener("pointermove", (e) => { xs(e.clientX); ys(e.clientY); pos.x = e.clientX; pos.y = e.clientY; });
    document.addEventListener("pointerover", (e) => { const t = e.target.closest("[data-cursor],a,button"); cur.classList.toggle("big", !!(t && t.dataset.cursor)); lbl.textContent = t && t.dataset.cursor ? t.dataset.cursor : ""; });
    // HUD coordinate: il cursore sulla hero diventa un punto della carta
    const [lo0, la0, lo1, la1] = M.bbox, latEl = $("[data-lat]"), lonEl = $("[data-lon]"), altEl = $("[data-alt]");
    addEventListener("pointermove", (e) => {
      const la = la1 - (e.clientY / innerHeight) * (la1 - la0), lo = lo0 + (e.clientX / innerWidth) * (lo1 - lo0);
      latEl.textContent = la.toFixed(4); lonEl.textContent = lo.toFixed(4);
      const near = M.comuni.reduce((a, c) => (Math.hypot(c.lat - la, c.lon - lo) < Math.hypot(a.lat - la, a.lon - lo) ? c : a));
      altEl.textContent = near.quota;
    });
  }

  // header
  let lastY = 0; const hd = $(".hd");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (st) => { const y = st.scroll(); hd.classList.toggle("solid", y > 60); hd.classList.toggle("hide", y > lastY && y > 500); lastY = y; } });
  $$(".hd-nav a").forEach((a) => { const t = $(a.getAttribute("href")); if (t) ScrollTrigger.create({ trigger: t, start: "top 50%", end: "bottom 50%", onToggle: (s) => a.classList.toggle("on", s.isActive) }); });

  // titoli
  $$("section h2").forEach((h) => { if (h.closest(".volo-hud,.st-left")) return; const sp = SplitText.create(h, { type: "lines,words", mask: "lines" }); gsap.from(sp.words, { yPercent: 110, rotate: 4, duration: 1.2, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: h, start: "top 85%" } }); });

  // ---------- HERO + INTRO ----------
  const hsplit = SplitText.create(".hero-t span", { type: "chars", mask: "chars" });
  gsap.set(hsplit.chars, { yPercent: 105 }); gsap.set([".hero .kick", ".hero-sub", ".hero-foot", ".hero-data li"], { autoAlpha: 0, y: 24 });
  const hcont = $$(".hero-cont .ct"); gsap.set(hcont, { drawSVG: "0%" });
  function heroIn(d = 0) {
    gsap.timeline({ delay: d })
      .fromTo(".hero-vid", { scale: 1.35 }, { scale: 1.08, duration: 3, ease: "expo.out" }, 0)
      .to(hcont, { drawSVG: "100%", duration: 2.6, ease: "power2.inOut", stagger: { each: 0.008, from: "center" } }, 0.1)
      .to(hsplit.chars, { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.035 }, 0.2)
      .to(".hero .kick", { autoAlpha: 1, y: 0, duration: 1 }, 0.5)
      .to([".hero-sub", ".hero-foot"], { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.12 }, 0.9)
      .to(".hero-data li", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 1.1);
  }
  const intro = $("#intro");
  if (introOnce("lsdvB")) {
    H.classList.add("intro-run"); lenis && lenis.stop();
    const o = $(".in-pitto .o"), lvl = $(".in-pitto .lvl"), dEl = $("[data-depth]"), inC = $$(".in-contours .ct");
    const word = SplitText.create(".in-word", { type: "chars", mask: "chars" }); gsap.set(".in-word", { visibility: "visible" }); gsap.set(word.chars, { yPercent: 110 });
    gsap.set(o, { drawSVG: "0%" }); gsap.set(lvl, { attr: { y: 800 } }); gsap.set(inC, { drawSVG: "0%" });
    // il caricamento sale lungo le quote reali degli otto comuni, dalla più bassa alla più alta,
    // e alterna la dicitura delle tre macro aree di suolo
    const SALITA = M.comuni.slice().sort((a, b) => a.quota - b.quota);
    const comEl = $("[data-com]"), suoEl = $("[data-suolo]");
    const dep = { v: SALITA[0].quota };
    let ultimo = -1;
    const aggiorna = () => {
      dEl.textContent = String(Math.round(dep.v)).padStart(3, "0");
      let i = 0; while (i < SALITA.length - 1 && dep.v >= SALITA[i + 1].quota - 1) i++;
      if (i !== ultimo) {
        ultimo = i;
        comEl.textContent = SALITA[i].nome;
        suoEl.textContent = D.suoli[i % D.suoli.length].nome;
        if (!RM) { gsap.fromTo([comEl, suoEl], { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.05 }); }
      }
    };
    const tl = gsap.timeline();
    tl.to(inC, { drawSVG: "100%", duration: 2.8, ease: "power2.inOut", stagger: { each: 0.01, from: "random" } }, 0)
      .from(".in-ruler", { scaleY: 0, transformOrigin: "top", duration: 2.2, ease: "expo.out" }, 0.1)
      .to(o, { drawSVG: "100%", duration: 1.8, ease: "power2.inOut" }, 0.2)
      .to(lvl, { attr: { y: 47 }, duration: 2.2, ease: "power2.inOut" }, 0.9)
      .to(dep, { v: SALITA[SALITA.length - 1].quota, duration: 2.9, ease: "power1.inOut", onUpdate: aggiorna }, 0.2)
      .to(word.chars, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.035 }, 1.8)
      .addLabel("open", 3.4)
      .to([".in-center", ".in-ruler", ".in-skip"], { autoAlpha: 0, scale: 0.94, duration: 0.6, ease: "power2.in" }, "open")
      .to(".in-contours", { scale: 1.6, autoAlpha: 0, duration: 1.5, ease: "cut" }, "open+=0.2")
      .to(".in-top", { yPercent: -104, duration: 1.5, ease: "cut" }, "open+=0.3")
      .to(".in-bot", { yPercent: 104, duration: 1.5, ease: "cut" }, "open+=0.3")
      .add(() => heroIn(0), "open+=0.6")
      .add(() => { H.classList.remove("intro-run"); intro.remove(); lenis && lenis.start(); ScrollTrigger.refresh(); }, "open+=1.9");
    const skip = () => tl.timeScale(5);
    $(".in-skip").addEventListener("click", skip); addEventListener("keydown", (e) => e.key === "Escape" && skip(), { once: true });
    addEventListener("wheel", skip, { once: true, passive: true }); addEventListener("touchmove", skip, { once: true, passive: true });
  } else { intro.remove(); heroIn(0.1); }
  // parallasse e attenuazione agiscono sul contenitore, mai sul video:
  // animare filtri o opacità sull'elemento <video> rompe la decodifica hardware su alcune schede
  gsap.to(".hero-vidwrap", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.4 } })
    .to(".hero-veil", { opacity: 0.92, ease: "power1.in" }, 0);
  gsap.to(".hero-copy", { yPercent: -30, autoAlpha: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "30% top", end: "90% top", scrub: true } });
  if (fine) { const hc = $(".hero-cont"); addEventListener("pointermove", (e) => gsap.to(hc, { x: (e.clientX / innerWidth - 0.5) * -40, y: (e.clientY / innerHeight - 0.5) * -30, duration: 1.4, ease: "power3.out" })); }

  // ---------- LUCE ALLA CIECA ----------
  if (!fine) gsap.fromTo(dq, { "--mx": "15%", "--my": "35%" }, { "--mx": "85%", "--my": "55%", ease: "none", scrollTrigger: { trigger: dq, start: "top 70%", end: "bottom 30%", scrub: true } });
  gsap.from(".mani div", { y: 50, autoAlpha: 0, stagger: 0.12, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".mani", start: "top 85%" } });

  // ---------- VOLO ----------
  const vsvg = $(".volo-map svg"), card = $("[data-volocard]"), full = `0 0 ${M.vw} ${M.vh}`;
  vsvg.setAttribute("viewBox", full);
  const vb = (m) => { const asp = (vsvg.clientHeight || innerHeight) / (vsvg.clientWidth || innerWidth), w = innerWidth < 800 ? 420 : 620; return `${m.x - w * (innerWidth < 800 ? 0.5 : 0.36)} ${m.y - w * asp * (innerWidth < 800 ? 0.36 : 0.5)} ${w} ${w * asp}`; };
  let curI = -1;
  const setCard = (i) => {
    if (i === curI) return; curI = i; const c = ORD[i];
    $$(".volo-map .pin").forEach((p) => p.classList.toggle("on", p.dataset.id === c.id));
    gsap.timeline().to(card, { autoAlpha: 0.2, y: 10, duration: 0.18, ease: "power2.in" })
      .add(() => { $("[data-vcn]").textContent = String(i + 1).padStart(2, "0"); $("[data-vct]").textContent = c.nome; $("[data-vcd]").textContent = c.testo; $("[data-vcimg]").src = `../shared/img/comune-${c.id}.webp`; $("[data-vcq]").textContent = c.quota; $("[data-vcoord]").textContent = `${c.lat.toFixed(4)} N · ${c.lon.toFixed(4)} E`; })
      .add(() => window.LSDVSound && window.LSDVSound.play("slide"))
      .to(card, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" })
      .fromTo("[data-vcimg]", { scale: 1.25 }, { scale: 1, duration: 1, ease: "expo.out" }, "<");
  };
  const vtl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
  vtl.to(vsvg, { attr: { viewBox: vb(ORD[0]) }, duration: 1 });
  ORD.slice(1).forEach((m) => vtl.to(vsvg, { attr: { viewBox: vb(m) }, duration: 1 }, "+=0.35"));
  vtl.to(vsvg, { attr: { viewBox: full }, duration: 1 }, "+=0.35");
  ScrollTrigger.create({ trigger: ".volo", start: "top top", end: () => "+=" + innerHeight * 6, pin: ".volo-stage", scrub: 1, animation: vtl, anticipatePin: 1,
    onUpdate: (st) => { gsap.set(".volo-prog i", { scaleX: st.progress }); const t = vtl.duration() * st.progress; let i = Math.floor((t + 0.2) / 1.35); setCard(Math.max(0, Math.min(ORD.length - 1, i))); } });
  setCard(0);
  gsap.from(".volo-map .ct", { drawSVG: "0%", duration: 2, stagger: 0.004, ease: "power2.inOut", scrollTrigger: { trigger: ".volo", start: "top 80%" } });

  // ---------- STRATI ----------
  const col = $(".st-col"), track = $(".st-track"), sd = $("[data-sdepth]"), dot = $(".st-ruler i");
  const dv = { v: 0 };
  const stl = gsap.timeline();
  stl.to(track, { y: () => -(track.scrollHeight - col.clientHeight), ease: "none", duration: 1 }, 0)
    .to(dv, { v: 150, ease: "none", duration: 1, onUpdate: () => { sd.textContent = Math.round(dv.v); } }, 0)
    .to(dot, { top: "100%", ease: "none", duration: 1 }, 0);
  $$(".stratum").forEach((s, i) => { if (i) stl.from($$(".txt > *", s), { y: 60, autoAlpha: 0, stagger: 0.02, duration: 0.12, ease: "power2.out" }, i / 2 - 0.12); stl.fromTo($(".tex img", s), { scale: 1.3 }, { scale: 1, duration: 0.5, ease: "none" }, Math.max(0, i / 2 - 0.25)); });
  ScrollTrigger.create({ trigger: ".strati", start: "top top", end: () => "+=" + innerHeight * 3, pin: ".strati-stage", scrub: 1, animation: stl, invalidateOnRefresh: true, anticipatePin: 1 });
  $$(".stratum .grains i").forEach((g) => gsap.to(g, { y: "random(-20,20)", x: "random(-10,10)", duration: "random(2,5)", yoyo: true, repeat: -1, ease: "sine.inOut" }));

  // ---------- AROMI ----------
  ScrollTrigger.create({ trigger: ".radar-wrap", start: "top 70%", once: true, onEnter: () => { SUOLI.forEach((s) => DESC.forEach((d) => (vals[s][d] = 0))); drawRadar(); setRadar(true); } });
  gsap.from(".radar .grid", { scale: 0, transformOrigin: "0 0", stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".radar-wrap", start: "top 75%" } });
  gsap.from(".cieca", { y: 80, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".cieca", start: "top 85%" } });

  // ---------- STORIA ----------
  $$(".layer").forEach((l) => gsap.from(l.children, { y: 40, autoAlpha: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: l, start: "top 85%" } }));
  gsap.from(".core-time", { "--h": 0, scrollTrigger: { trigger: ".core-time", start: "top 80%" } });

  // ---------- RETE ----------
  const marq = $("[data-marq]");
  const loop = gsap.to(marq, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
  ScrollTrigger.create({ trigger: ".rete", start: "top bottom", end: "bottom top", onUpdate: (st) => { const v = st.getVelocity() / 300; gsap.to(loop, { timeScale: 1 + Math.abs(v), duration: 0.3, overwrite: true }); gsap.to(marq, { skewX: gsap.utils.clamp(-12, 12, -v * 2), duration: 0.4, overwrite: "auto" }); } });
  $$(".perc").forEach((p) => gsap.from($("path", p), { drawSVG: "0%", duration: 1.8, scrollTrigger: { trigger: p, start: "top 85%" } }));

  // ---------- EVENTI ----------
  gsap.fromTo(".ev-hero", { clipPath: "inset(12% 8% 12% 8% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none", scrollTrigger: { trigger: ".ev-hero", start: "top bottom", end: "top 20%", scrub: true } });
  gsap.to(".ev-hero img", { scale: 1, ease: "none", scrollTrigger: { trigger: ".ev-hero", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".ev-i", { y: 50, autoAlpha: 0, stagger: 0.12, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".ev-list", start: "top 88%" } });

  // ---------- VIDEO: bobina trascinabile ----------
  const reel = $(".reel");
  const bounds = () => ({ minX: Math.min(0, innerWidth - reel.scrollWidth), maxX: 0 });
  Draggable.create(reel, { type: "x", inertia: true, bounds: bounds(), edgeResistance: 0.85, dragClickables: true, onPress() { this.applyBounds(bounds()); } });
  gsap.from(".clip", { y: 120, rotate: (i) => (i % 2 ? 4 : -4), autoAlpha: 0, stagger: 0.08, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".reel", start: "top 85%" } });
  gsap.from(".post", { y: 50, autoAlpha: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".blog", start: "top 88%" } });

  // ---------- ADESIONE ----------
  gsap.from(".ad-v li", { scale: 0.9, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: "back.out(2)", scrollTrigger: { trigger: ".ad-v", start: "top 85%" } });
  gsap.from(".ad-form", { y: 80, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".ad", start: "top 70%" } });
  /* ---------- trasparenza in ingresso e in uscita di ogni blocco ---------- */
  $$("section").forEach((s) => {
    if (s.classList.contains("hero")) return;
    gsap.fromTo(s, { autoAlpha: 0.15 }, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: s, start: "top 92%", end: "top 55%", scrub: 0.5 } });
    gsap.to(s, { autoAlpha: 0.15, ease: "none", scrollTrigger: { trigger: s, start: "bottom 45%", end: "bottom 8%", scrub: 0.5 } });
  });

  /* ---------- il grappolo: zoom lento e acini che si accendono ---------- */
  gsap.fromTo(".gp-foto>img", { scale: 1.12 }, { scale: 1.02, ease: "none", scrollTrigger: { trigger: ".gp", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".gp-a", { autoAlpha: 0, scale: 0.2, duration: 0.8, ease: "back.out(2.2)", stagger: { each: 0.06, from: "random" }, scrollTrigger: { trigger: ".gp", start: "top 75%" } });
  gsap.from(".gp-cap, .gp-hint", { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: ".gp", start: "top 70%" } });
  ScrollTrigger.create({ trigger: ".gp", start: "top 60%", once: true, onEnter: () => window.LSDVSound && window.LSDVSound.play("open") });

  /* ---------- voci di menu in 3D ---------- */
  $$(".hd-nav a").forEach((a) => {
    a.addEventListener("pointerenter", () => gsap.fromTo(a, { rotateX: -55 }, { rotateX: 0, duration: 0.6, ease: "back.out(2)", transformOrigin: "50% 100% -12px" }));
    a.dataset.snd = "hover";
  });

  /* ---------- suoni discreti sui passaggi ---------- */
  window.LSDVSound && window.LSDVSound.bind();
  ScrollTrigger.create({ trigger: ".strati", start: "top 60%", once: true, onEnter: () => window.LSDVSound && window.LSDVSound.play("step") });
  ScrollTrigger.create({ trigger: ".dark-quote", start: "top 60%", once: true, onEnter: () => window.LSDVSound && window.LSDVSound.play("open") });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
