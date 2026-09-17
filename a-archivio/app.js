/* Versione A · L'Archivio Vivo */
(function () {
  "use strict";
  const { D, M, RM, $, $$, esc, html, smooth, mapSVG, counter, membership, categoriaNome, icon, demoBadge, introOnce } = window.LSDVCore;
  const B = window.LSDV_BRAND, AR = window.LSDV_AROMI;
  const H = document.documentElement;
  const hasG = !!window.gsap;
  if (hasG) gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);
  if (RM) H.classList.add("rm");

  /* ================= RENDER ================= */
  const logoSVG = (el) => { el.setAttribute("viewBox", B.logo.vb); el.innerHTML = `<path fill="#442413" fill-rule="evenodd" d="${B.logo.br}"/><path fill="#4B5D23" fill-rule="evenodd" d="${B.logo.gr}"/>`; };
  $$("[data-logo]").forEach(logoSVG);
  const pit = $("[data-pitto]");
  if (pit) { pit.setAttribute("viewBox", B.pitto.vb); pit.innerHTML = `<path class="o" fill-rule="evenodd" d="${B.pitto.br}"/><path class="f" fill-rule="evenodd" d="${B.pitto.br}"/><path class="g" fill-rule="evenodd" d="${B.pitto.gr}"/>`; }

  $("[data-missione]").textContent = (D.ente.intro && D.ente.intro.a) || D.ente.missione;
  $("[data-quote]").textContent = D.ente.citazione.testo;
  $("[data-quote-a]").textContent = `${D.ente.citazione.autore} · ${D.ente.citazione.ruolo}`;
  $("[data-manifesto]").innerHTML = D.manifesto.map((m, i) => `<div class="mf-item"><span class="n">0${i + 1}</span><h3>${esc(m.t)}</h3><p>${esc(m.d)}</p></div>`).join("");
  $("[data-nums]").innerHTML = D.numeri.map((n) => `<div class="num"><b data-count="${n.n}">0</b><span>${esc(n.label)}</span></div>`).join("");

  $("[data-map]").innerHTML = mapSVG({ cls: "hero-terra" });
  // su schermi larghi la carta si sposta a destra, così i comuni non finiscono sotto il titolo
  const heroSvg = $(".hero-terra");
  const frameHero = () => { if (innerWidth > 1100) { heroSvg.setAttribute("viewBox", "-760 -60 2420 1390"); heroSvg.setAttribute("preserveAspectRatio", "xMaxYMid slice"); } else { heroSvg.setAttribute("viewBox", `0 0 ${M.vw} ${M.vh}`); heroSvg.setAttribute("preserveAspectRatio", "xMidYMid slice"); } };
  frameHero(); addEventListener("resize", frameHero);
  $("[data-map2]").innerHTML = mapSVG({ cls: "fly", par: "xMidYMid slice" });
  $("[data-comuni]").innerHTML = D.comuni.map((c, i) => {
    const m = M.comuni.find((x) => x.id === c.id) || {};
    return `<article class="comune" data-id="${c.id}" data-n="${String(i + 1).padStart(2, "0")}"><div class="cm-fig"><img src="../shared/img/comune-${c.id}.webp" alt="${esc(c.nome)}" loading="lazy"><span class="cm-quota" aria-hidden="true"><b data-cq="${m.quota || 0}">0</b> m</span></div><p class="k">${m.quota ? m.quota + " m · " : ""}DOC Casavecchia di Pontelatone</p><h3>${esc(c.nome)}</h3><p>${esc(c.testo)}</p></article>`;
  }).join("");
  // la rotta che unisce i comuni nell'ordine del racconto, sotto i segnaposto della carta
  {
    const svg = $(".terr-map svg"), pts = D.comuni.map((c) => M.comuni.find((x) => x.id === c.id)).filter(Boolean);
    const d = pts.map((q, k) => {
      if (!k) return `M${q.x} ${q.y}`;
      const a = pts[k - 1], mx = (a.x + q.x) / 2, my = (a.y + q.y) / 2 - Math.hypot(q.x - a.x, q.y - a.y) * 0.18;
      return `Q${mx.toFixed(1)} ${my.toFixed(1)} ${q.x} ${q.y}`;
    }).join(" ");
    svg.querySelector(".pins-g").insertAdjacentHTML("beforebegin", `<g class="rotta-g"><path class="rotta-base" d="${d}"/><path class="rotta" d="${d}"/></g>`);
  }

  const FAN = () => {
    const rays = Array.from({ length: 10 }, (_, i) => {
      const a = Math.PI * (0.08 + (i / 9) * 0.84), x = 150 - Math.cos(a) * 130, y = 190 - Math.sin(a) * 150, hi = i === 3 || i === 4;
      return `<line class="${hi ? "hi" : ""}" x1="150" y1="190" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/><text class="${hi ? "hi" : ""}" x="${(150 - Math.cos(a) * 146).toFixed(1)}" y="${(190 - Math.sin(a) * 166).toFixed(1)}" text-anchor="middle">${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][i]}</text>`;
    }).join("");
    return `<svg class="fan" viewBox="0 0 300 210" aria-label="Schema della Vigna del Ventaglio: dieci raggi, il IV e il V con il Piedimonte bianco e rosso">${rays}<circle cx="150" cy="190" r="5" fill="#ADC136"/></svg>`;
  };
  const STIMG = { "treglia": "../shared/img/comune-pontelatone.webp", "pontelatone": "../shared/img/vigna-lmp01931.webp" };
  $("[data-storia]").innerHTML = D.storia.map((s, i) => {
    let fig = "";
    if (/Ventaglio/.test(s.titolo)) fig = `<div class="fig">${FAN()}</div>`;
    else if (s.luogo && STIMG[s.luogo]) fig = `<div class="fig"><img src="${STIMG[s.luogo]}" alt="" loading="lazy"></div>`;
    else if (s.anno === "2022") fig = `<div class="fig"><img src="../shared/img/anteprima-lab.webp" alt="" loading="lazy"></div>`;
    return `<article class="ev-card" data-y="${esc(s.anno)}"><p class="y">${esc(s.anno)}</p><h3>${esc(s.titolo)}</h3><p>${esc(s.testo)}</p><span class="src">${esc(s.fonte)}</span>${fig}</article>`;
  }).join("");

  const HERB = (c) => {
    const berries = []; let seed = c.length * 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let r = 0; r < 7; r++) { const n = 6 - Math.floor(r * 0.8); for (let k = 0; k < n; k++) berries.push(`<circle class="berry" cx="${(100 - n * 7 + k * 14 + rnd() * 4).toFixed(1)}" cy="${(70 + r * 15 + rnd() * 3).toFixed(1)}" r="${(6.5 - r * 0.3).toFixed(1)}"/>`); }
    return `<svg class="herb" viewBox="0 0 200 210" aria-hidden="true"><path d="M100 10 C98 30 102 45 100 62"/><path d="M100 30 C120 20 150 22 170 40 C150 44 130 44 118 36 M150 34 C150 50 160 64 176 70"/><path d="M100 26 C82 16 52 18 34 34 C52 40 76 38 86 30"/>${berries.join("")}</svg>`;
  };
  $("[data-vitigni]").innerHTML = D.vitigni.map((v, i) => `<article class="vcard ${v.colore}"><div class="lab"><span>Tav. ${["I", "II", "III"][i]}</span><span>${esc(v.tag)}</span></div>${HERB(v.nome)}<h3>${esc(v.nome)}</h3><p class="tag">${esc(v.tag)}</p><p>${esc(v.testo)}</p><p class="orig">${esc(v.origine)}</p></article>`).join("");

  $("[data-suoli]").innerHTML = D.suoli.map((s) => `<article class="core"><div class="core-img"><img src="../${s.img}" alt="Vigneto su ${esc(s.nome.toLowerCase())}" loading="lazy"><div class="core-strata"><i></i><i></i><i></i><i></i></div></div><p class="area">${esc(s.area)}</p><h3>${esc(s.nome)}</h3><p class="wrb">${esc(s.wrb)}</p><p>${esc(s.testo)}</p></article>`).join("");

  $("[data-aziende]").innerHTML = D.aziende.map((a) => `<li>${esc(a)}</li>`).join("");
  const PERC = ["M10 150 C40 100 60 130 90 90 S140 60 160 20", "M10 40 C50 60 40 110 90 110 S150 150 170 120", "M20 160 C30 120 80 140 100 100 S120 30 170 50"];
  $("[data-percorsi]").innerHTML = D.percorsi.map((p, i) => `<article class="perc"><svg viewBox="0 0 180 180" aria-hidden="true"><path d="${PERC[i]}"/></svg><h3>${esc(p.nome)}</h3><p>${esc(p.testo)}</p></article>`).join("");

  const ant = D.eventi.find((e) => e.stato === "archivio");
  $("[data-evmain]").innerHTML = `<figure><img src="../${ant.img}" alt="Vigneti al tramonto"><figcaption>Archivio eventi</figcaption></figure><div class="ev-body"><p class="d">${esc(ant.data)}</p><h3>${esc(ant.titolo)}</h3><p class="l">${esc(ant.luogo)}</p><p>${esc(ant.testo)}</p><div class="panel"><div><h4>Panel degustatori</h4><ul>${D.panel.degustatori.slice(0, 7).map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div><div><h4>Panel enologi</h4><ul>${D.panel.enologi.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div></div></div>`;
  $("[data-evnext]").innerHTML = D.eventi.filter((e) => e.stato !== "archivio").map((e) => `<article class="enext"><p class="d">${esc(e.data)} · ${esc(e.luogo)}</p><h3>${esc(e.titolo)}</h3><p>${esc(e.testo)}</p>${e.demo ? '<span class="demo-tag">Esempio</span>' : ""}</article>`).join("");

  $("[data-blog]").innerHTML = D.blog.map((b) => `<a class="post" href="#racconti"><div class="im"><img src="../${b.img}" alt="" loading="lazy"></div><p class="c"><span>${esc(b.cat)}</span><span>${b.min} min</span></p><h3>${esc(b.titolo)}</h3><p>${esc(b.estratto)}</p></a>`).join("");
  $("[data-vlog]").innerHTML = D.vlog.map((v) => `<a class="vid" href="#racconti" data-vid="${v.ep}"><div class="im"><img src="../${v.img}" alt="" loading="lazy"><span class="play" aria-hidden="true"></span></div><p class="meta"><span>Ep. ${v.ep}</span><span>${v.durata}</span></p><h4>${esc(v.titolo)}</h4><p>${esc(v.testo)}</p></a>`).join("");

  $("[data-adintro]").textContent = D.adesione.intro;
  $("[data-vantaggi]").innerHTML = D.adesione.vantaggi.map((v) => `<li>${esc(v)}</li>`).join("");
  $("[data-passi]").innerHTML = D.adesione.passi.map((p) => `<li><b>${esc(p.t)}</b>${esc(p.d)}</li>`).join("");
  $("[data-adnota]").textContent = D.adesione.nota;
  $("[data-cats]").innerHTML = D.adesione.categorie.map((c) => `<button type="button" class="cat" data-cat="${c.id}" aria-pressed="false">${icon(c.icona)}<span><b>${esc(c.nome)}</b><small>${esc(c.desc)}</small></span></button>`).join("");
  $("#lcomuni").innerHTML = D.comuni.map((c) => `<option value="${esc(c.nome)}">`).join("");
  $("[data-partner]").innerHTML = D.partner.map((p) => `<div class="pt"><b>${esc(p.nome)}</b><span>${esc(p.ruolo)}</span></div>`).join("");
  $("[data-fcit]").textContent = "«" + D.ente.citazione2.testo + "»";
  $("[data-contatti]").innerHTML = `${esc(D.ente.sede)}<br><a href="mailto:${D.ente.email}">${D.ente.email}</a><a href="tel:+39${D.ente.tel.replace(/\s/g, "")}">${D.ente.tel}</a>`;
  $("#mnav nav").innerHTML = $$(".hd-nav a").map((a) => `<a href="${a.getAttribute("href")}">${a.textContent}</a>`).join("") + '<a href="#aderisci">Aderisci</a>';
  demoBadge("A · L'Archivio Vivo");

  /* ================= INTERAZIONI SENZA GSAP ================= */
  const burger = $(".hd-burger"), mnav = $("#mnav");
  const setMenu = (open) => { burger.setAttribute("aria-expanded", open); mnav.hidden = !open; H.classList.toggle("menu-open", open); window.__lenis && (open ? window.__lenis.stop() : window.__lenis.start()); };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  mnav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !mnav.hidden) setMenu(false); });

  // scheda comune al passaggio sui pin della hero
  const card = $(".pin-card"), hero = $(".hero");
  $$(".hero-terra .pin").forEach((p) => {
    const c = D.comuni.find((x) => x.id === p.dataset.id), m = M.comuni.find((x) => x.id === p.dataset.id);
    const showCard = () => {
      const r = p.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      card.querySelector("img").src = `../shared/img/comune-${c.id}.webp`;
      card.querySelector("b").textContent = c.nome; card.querySelector("span").textContent = `${m.quota} m s.l.m.`;
      card.style.left = r.left + r.width / 2 - hr.left + "px"; card.style.top = r.top - hr.top + "px"; card.hidden = false;
      if (hasG && !RM) gsap.fromTo(card, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" });
    };
    p.addEventListener("mouseenter", showCard); p.addEventListener("focus", showCard);
    p.addEventListener("mouseleave", () => (card.hidden = true)); p.addEventListener("blur", () => (card.hidden = true));
    p.addEventListener("click", () => { const t = $(`.comune[data-id="${c.id}"]`); window.__lenis ? window.__lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView({ behavior: "smooth" }); });
  });

  // ruota aromatica
  const avWrap = $("[data-av]"), asWrap = $("[data-as]");
  avWrap.innerHTML = Object.entries(AR.vitigni).map(([k, v], i) => `<button type="button" data-k="${k}" aria-pressed="${i === 2}">${v}</button>`).join("");
  asWrap.innerHTML = Object.entries(AR.suoli).map(([k, v], i) => `<button type="button" data-k="${k}" aria-pressed="${i === 0}">${v}</button>`).join("");
  const DESC = Object.keys(AR.descrittori);
  const donut = $("[data-donut]"), legend = $("[data-alegend]");
  donut.innerHTML = DESC.map((d) => `<path data-d="${d}" fill="${AR.descrittori[d]}"/>`).join("") + '<circle r="58" fill="#E9DCC3"/><text class="dc" y="-6" text-anchor="middle" style="font:500 12px Hanken Grotesk;letter-spacing:.2em;fill:#6E4E3E">AROMI</text><text class="dv" y="20" text-anchor="middle" style="font:italic 500 22px Cormorant Garamond;fill:#442413"></text>';
  const cur = Object.fromEntries(DESC.map((d) => [d, 0]));
  const arc = (a0, a1, r0, r1) => {
    if (a1 - a0 < 0.0005) return "";
    const L = a1 - a0 > Math.PI ? 1 : 0, p = (a, r) => `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
    return `M${p(a0, r1)}A${r1} ${r1} 0 ${L} 1 ${p(a1, r1)}L${p(a1, r0)}A${r0} ${r0} 0 ${L} 0 ${p(a0, r0)}Z`;
  };
  function drawDonut() {
    let a = -Math.PI / 2; const tot = DESC.reduce((s, d) => s + cur[d], 0) || 1;
    DESC.forEach((d) => { const span = (cur[d] / tot) * Math.PI * 2; $(`path[data-d="${d}"]`, donut).setAttribute("d", arc(a + 0.012, a + span - 0.012, 64, 112)); a += span; });
  }
  function setAroma(anim = true) {
    const v = $("[aria-pressed=true]", avWrap).dataset.k, s = $("[aria-pressed=true]", asWrap).dataset.k;
    const target = AR.dati[v][s];
    const to = Object.fromEntries(DESC.map((d) => [d, target[d] || 0]));
    $(".dv", donut).textContent = AR.vitigni[v].split(" ")[0];
    legend.innerHTML = Object.entries(target).sort((x, y) => y[1] - x[1]).map(([d, p]) => `<div class="leg"><i style="background:${AR.descrittori[d]}"></i>${d}<b>${String(p).replace(".", ",")}%</b></div>`).join("");
    if (hasG && anim && !RM) { gsap.to(cur, Object.assign({}, to, { duration: 1.1, ease: "expo.inOut", onUpdate: drawDonut })); gsap.from($$(".leg", legend), { x: 16, autoAlpha: 0, stagger: 0.06, duration: 0.5, ease: "power3.out" }); }
    else { Object.assign(cur, to); drawDonut(); }
  }
  [avWrap, asWrap].forEach((w) => w.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $$("button", w).forEach((x) => x.setAttribute("aria-pressed", x === b)); setAroma(); }));
  setAroma(false);

  // modulo adesione
  const form = $("[data-form]");
  membership(form, {
    onStep(from, to, dir) { if (hasG && !RM && dir) gsap.fromTo(to, { x: 40 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out" }); },
    onError(step) { if (hasG && !RM) gsap.fromTo(step, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1,0.3)" }); },
    onSubmit(data) {
      $$("[data-step]", form).forEach((s) => (s.hidden = true)); $("[data-progress]", form).style.setProperty("--p", 1);
      const ok = $(".ad-ok", form); ok.hidden = false;
      $("[data-okmsg]", form).textContent = `Grazie ${data.nome.split(" ")[0]}. La tua candidatura come «${categoriaNome(data.categoria)}» a ${data.comune} è nel registro. Ti contatteremo per conoscerci.`;
      const seal = $("[data-seal]", form); seal.setAttribute("viewBox", "-100 -100 200 200");
      let d = ""; for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2, r = 78 + (i % 2 ? 6 : 0) + Math.sin(i * 1.7) * 3; d += (i ? "L" : "M") + (Math.cos(a) * r).toFixed(1) + " " + (Math.sin(a) * r).toFixed(1); }
      const [vx, vy, vw, vh] = B.pitto.vb.split(" ").map(Number), sc = 90 / Math.max(vw, vh);
      seal.innerHTML = `<defs><radialGradient id="wax" cx="35%" cy="30%"><stop offset="0" stop-color="#9A3A40"/><stop offset="1" stop-color="#5E1C22"/></radialGradient></defs><path d="${d}Z" fill="url(#wax)"/><circle r="62" fill="none" stroke="#3E1015" stroke-opacity=".5" stroke-width="2"/><g transform="translate(${-vw * sc / 2 - vx * sc} ${-vh * sc / 2 - vy * sc}) scale(${sc})"><path fill="#3E1015" fill-opacity=".55" fill-rule="evenodd" d="${B.pitto.br}" transform="translate(4 6)"/><path fill="#C9747A" fill-opacity=".55" fill-rule="evenodd" d="${B.pitto.br}"/></g>`;
      if (hasG && !RM) { gsap.fromTo(seal, { scale: 2.6, rotate: -25, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.9, ease: "back.out(2.2)" }); gsap.from($$("h3,p", ok), { y: 20, autoAlpha: 0, stagger: 0.1, delay: 0.5, duration: 0.8, ease: "expo.out" }); }
      window.__lenis && window.__lenis.scrollTo(form, { offset: -120 });
    }
  });

  // vlog: anteprima d'esempio
  $$("[data-vid]").forEach((v) => v.addEventListener("click", (e) => { e.preventDefault(); const img = $("img", v); if (hasG && !RM) gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 0.9, ease: "expo.out" }); v.querySelector("p:last-child").textContent = "Episodio di esempio: il video sarà caricato dalla redazione."; }));

  /* ================= MOTION ================= */
  if (!hasG || RM) { $$("[data-count]").forEach((c) => (c.textContent = c.dataset.count)); $$(".comune img,.core-img img").forEach((i) => (i.style.clipPath = "none")); return; }

  const lenis = smooth();
  CustomEase.create("ink", "0.76,0,0.24,1");

  // header che si compatta e si nasconde
  let lastY = 0; const hd = $(".hd");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (st) => { const y = st.scroll(); hd.classList.toggle("solid", y > 40); lastY = y; } });
  $$(".hd-nav a").forEach((a) => { const t = $(a.getAttribute("href")); if (t) ScrollTrigger.create({ trigger: t, start: "top 50%", end: "bottom 50%", onToggle: (s) => a.classList.toggle("on", s.isActive) }); });

  // velo d'inchiostro sulla navigazione
  const veil = $(".veil"), ink = $(".veil-ink"), vlbl = $(".veil-lbl");
  $$('.hd-nav a, .mnav a, .hd-cta, .hero-act a').forEach((a) => a.addEventListener("click", (e) => {
    const t = $(a.getAttribute("href")); if (!t) return; e.preventDefault(); e.stopImmediatePropagation();
    vlbl.textContent = a.textContent.trim();
    gsap.timeline().set(veil, { visibility: "visible" })
      .fromTo(ink, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.75, ease: "ink" })
      .to(vlbl, { opacity: 1, duration: 0.3 }, 0.45)
      .add(() => lenis ? lenis.scrollTo(t, { immediate: true, offset: t.id === "storia" ? 0 : -10 }) : t.scrollIntoView())
      .to(vlbl, { opacity: 0, duration: 0.25 }, "+=0.2")
      .to(ink, { clipPath: "circle(0% at 50% 50%)", duration: 0.7, ease: "ink" }, "<")
      .set(veil, { visibility: "hidden" });
  }, true));

  // titoli: righe che si depositano
  $$("section h2").forEach((h) => {
    const sp = SplitText.create(h, { type: "lines", mask: "lines" });
    gsap.from(sp.lines, { yPercent: 105, duration: 1.2, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: h, start: "top 85%" } });
  });
  $$(".sec-h>p:not(.eyebrow), .eyebrow").forEach((p) => gsap.from(p, { y: 18, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: p, start: "top 90%" } }));

  // ---------- HERO + INTRO ----------
  const heroPaths = $$(".hero-terra .ct"), heroRivers = $$(".hero-terra .fiume"), heroPins = $$(".hero-terra .pin, .hero-terra .luogo");
  gsap.set(heroPaths, { drawSVG: "50% 50%" }); gsap.set(heroRivers, { drawSVG: "0%" }); gsap.set(heroPins, { autoAlpha: 0, scale: 0.4, transformOrigin: "center" });
  const titleSplit = SplitText.create(".hero-t .ln", { type: "chars", mask: "chars" });
  gsap.set(titleSplit.chars, { yPercent: 110 }); gsap.set([".hero .eyebrow", ".hero-lead", ".hero-act", ".hero-scroll"], { autoAlpha: 0, y: 20 });

  function heroIn(delay = 0) {
    const tl = gsap.timeline({ delay });
    tl.to(heroPaths, { drawSVG: "0% 100%", duration: 2.4, ease: "power2.inOut", stagger: { each: 0.012 } }, 0)
      .to(heroRivers, { drawSVG: "100%", duration: 2.2, ease: "power2.inOut" }, 0.5)
      .to(heroPins, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(2)", stagger: 0.07 }, 1.3)
      .to(".hero .eyebrow", { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.3)
      .to(titleSplit.chars, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.022 }, 0.4)
      .to([".hero-lead", ".hero-act", ".hero-scroll"], { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.12 }, 1.1);
    return tl;
  }

  const intro = $("#intro");
  if (introOnce("lsdvA")) {
    H.classList.add("intro-run"); lenis && lenis.stop();
    const o = $(".o", intro), f = $(".f", intro), g = $(".g", intro), qEl = $("[data-q]", intro);
    const word = SplitText.create(".intro-word", { type: "chars", mask: "chars" });
    gsap.set(".intro-word,.intro-sub", { visibility: "visible" }); gsap.set(word.chars, { yPercent: 115 }); gsap.set(".intro-sub", { autoAlpha: 0, y: 10 });
    gsap.set(o, { drawSVG: "0%" });
    const q = { z: 16 };
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".intro-frame", { scale: 1.04, autoAlpha: 0, duration: 1.2, ease: "expo.out" }, 0)
      .from(".ic", { autoAlpha: 0, y: 8, stagger: 0.08, duration: 0.8 }, 0.2)
      .to(o, { drawSVG: "100%", duration: 2.2, ease: "power2.inOut" }, 0.2)
      .to(q, { z: 966, duration: 2.6, ease: "power1.inOut", onUpdate: () => (qEl.textContent = String(Math.round(q.z)).padStart(3, "0")) }, 0.2)
      .to(f, { opacity: 1, duration: 0.9, ease: "power2.inOut" }, 1.9)
      .fromTo(g, { opacity: 0, scale: 0.6, transformOrigin: "0% 60%" }, { opacity: 1, scale: 1, duration: 0.9, ease: "back.out(2)" }, 2.3)
      .to(word.chars, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.04 }, 1.4)
      .to(".intro-sub", { autoAlpha: 1, y: 0, duration: 0.9 }, 2.1)
      .addLabel("out", 3.3)
      .to(word.chars, { yPercent: -115, duration: 0.6, ease: "power3.in", stagger: 0.02 }, "out")
      .to([".intro-sub", ".ic", ".intro-skip"], { autoAlpha: 0, duration: 0.4 }, "out")
      .to(".intro-pitto", { scale: 9, autoAlpha: 0, duration: 1.4, ease: "ink" }, "out+=0.25")
      .to(intro, { backgroundColor: "rgba(242,232,213,0)", duration: 1.1, ease: "power2.inOut" }, "out+=0.6")
      .to(".intro-frame", { autoAlpha: 0, duration: 0.8 }, "out+=0.6")
      .add(() => heroIn(0), "out+=0.5")
      .add(() => { H.classList.remove("intro-run"); intro.remove(); lenis && lenis.start(); ScrollTrigger.refresh(); }, "out+=1.7");
    const skip = () => tl.timeScale(5);
    $(".intro-skip").addEventListener("click", skip);
    addEventListener("keydown", (e) => { if (e.key === "Escape") skip(); }, { once: true });
    addEventListener("wheel", skip, { once: true, passive: true });
    addEventListener("touchmove", skip, { once: true, passive: true });
  } else { intro.remove(); heroIn(0.1); }

  // parallasse morbida della carta
  gsap.to(".hero-map svg", { scale: 1.12, yPercent: 6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-copy", { yPercent: -18, autoAlpha: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });

  // ---------- MANIFESTO: la citazione si accende parola per parola ----------
  const qs = SplitText.create("[data-quote]", { type: "words", wordsClass: "w" });
  gsap.to(qs.words, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: ".mf-quote", start: "top 75%", end: "bottom 40%", scrub: true } });
  gsap.from(".mf-item", { y: 40, autoAlpha: 0, stagger: 0.15, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".mf-grid", start: "top 85%" } });
  $$("[data-count]").forEach((c) => ScrollTrigger.create({ trigger: c, start: "top 90%", once: true, onEnter: () => counter(c, +c.dataset.count, 2) }));

  // ---------- TERRITORIO: volo sulla carta ----------
  const fly = $(".terr-map svg"), full = `0 0 ${M.vw} ${M.vh}`, tq = $("[data-tq]");
  fly.setAttribute("viewBox", full);
  gsap.from(".terr-map .ct", { drawSVG: "50% 50%", duration: 1.6, ease: "power2.inOut", stagger: 0.006, scrollTrigger: { trigger: ".terr", start: "top 70%" } });
  // la carta come foglio sospeso: si inclina in prospettiva seguendo lo scorrimento dei comuni
  const sticky = $(".terr-sticky"), carta = $(".terr-carta"), foglio = $(".terr-foglio"),
        luce = $(".terr-luce"), bussola = $(".terr-bussola");
  let inclina = null;
  if (!RM && matchMedia("(min-width:1101px)").matches) {
    gsap.set(carta, { rotationY: 9, rotationX: -5, z: -40 });
    const rY = gsap.quickTo(carta, "rotationY", { duration: 0.9, ease: "power3" }),
          rX = gsap.quickTo(carta, "rotationX", { duration: 0.9, ease: "power3" }),
          zC = gsap.quickTo(carta, "z", { duration: 0.9, ease: "power3" }),
          lx = gsap.quickTo(luce, "xPercent", { duration: 1.1, ease: "power2" }),
          rot = gsap.quickTo(bussola, "rotation", { duration: 1.1, ease: "power3" });
    let prog = 0, px = 0, py = 0;
    inclina = () => {
      // la prospettiva nasce dallo scorrimento, il mouse la corregge di poco
      rY(gsap.utils.mapRange(0, 1, 11, -11, prog) + px * 5);
      rX(gsap.utils.mapRange(0, 1, -6, 6, prog) - py * 4);
      zC(gsap.utils.mapRange(0, 1, -40, 30, prog));
      lx(gsap.utils.mapRange(0, 1, -26, 26, prog) + px * 8);
      rot(gsap.utils.mapRange(0, 1, -7, 7, prog));
    };
    ScrollTrigger.create({
      trigger: ".terr", start: "top bottom", end: "bottom top", scrub: true,
      onUpdate: (s) => { prog = s.progress; inclina(); },
      onToggle: (s) => sticky.classList.toggle("viva", s.isActive)
    });
    sticky.addEventListener("pointermove", (e) => {
      const r = sticky.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5; py = (e.clientY - r.top) / r.height - 0.5;
      inclina();
    });
    sticky.addEventListener("pointerleave", () => { px = py = 0; inclina(); });
  }

  const qv = { z: 0 }, ordine = D.comuni.map((c) => c.id);
  const tn = $("[data-tn]"), tnome = $("[data-tnome]");
  $(".tt-tot").textContent = "/ " + String(ordine.length).padStart(2, "0"); tnome.textContent = D.comuni[0].nome;
  let attivo = null;
  function flyTo(id) {
    const m = M.comuni.find((x) => x.id === id); if (!m || id === attivo) return;
    const verso = attivo && ordine.indexOf(id) < ordine.indexOf(attivo) ? -1 : 1;
    attivo = id;
    const w = 560, h = 560 * (fly.clientHeight / fly.clientWidth || 1);
    gsap.to(fly, { attr: { viewBox: `${m.x - w / 2} ${m.y - h / 2} ${w} ${h}` }, duration: 1.6, ease: "expo.inOut", overwrite: true });
    $$(".terr-map .pin").forEach((p) => p.classList.toggle("on", p.dataset.id === id));
    gsap.to(qv, { z: m.quota, duration: 1.2, ease: "power2.out", overwrite: true, onUpdate: () => (tq.textContent = Math.round(qv.z)) });
    // cartiglio: numero e nome escono e rientrano nel verso dello scorrimento
    const n = String(ordine.indexOf(id) + 1).padStart(2, "0"), nome = (D.comuni.find((c) => c.id === id) || {}).nome || m.nome;
    gsap.timeline({ overwrite: true })
      .to([tn, tnome], { yPercent: -110 * verso, autoAlpha: 0, duration: 0.28, ease: "power2.in", stagger: 0.04 })
      .add(() => { tn.textContent = n; tnome.textContent = nome; })
      .fromTo([tn, tnome], { yPercent: 110 * verso, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: "expo.out", stagger: 0.06 });
    // il foglio si solleva di scatto a ogni comune nuovo
    if (foglio && inclina) gsap.fromTo(foglio, { scale: 1 }, { scale: 1.035, duration: 0.5, ease: "power2.out", yoyo: true, repeat: 1, overwrite: true });
  }
  // la rotta si disegna man mano che si scorrono i comuni; la barretta sotto la carta segna l'avanzamento
  gsap.set(".terr-map .rotta", { drawSVG: "0%" });
  ScrollTrigger.create({
    trigger: "[data-comuni]", start: "top 55%", end: "bottom 55%", scrub: 0.6,
    animation: gsap.timeline()
      .to(".terr-map .rotta", { drawSVG: "100%", ease: "none" }, 0)
      .to(".terr-prog i", { scaleX: 1, ease: "none" }, 0)
  });
  const largo = matchMedia("(min-width:1101px)").matches;
  $$(".comune").forEach((c) => {
    ScrollTrigger.create({ trigger: c, start: "top 55%", end: "bottom 55%", onEnter: () => flyTo(c.dataset.id), onEnterBack: () => flyTo(c.dataset.id) });
    const fig = $(".cm-fig", c), img = $("img", c), h3 = $("h3", c), q = $("[data-cq]", c);
    // la foto si apre dal basso e intanto scorre dentro la cornice
    gsap.to(fig, { clipPath: "inset(0 0 0% 0)", duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 80%" } });
    if (largo) {
      gsap.fromTo(img, { scale: 1.18, yPercent: -7 }, { scale: 1.04, yPercent: 7, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(c, { "--ny": "60px" }, { "--ny": "-60px", ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
    }
    // il nome del comune sale lettera per lettera da sotto la riga
    const sp = SplitText.create(h3, { type: "chars", mask: "chars" });
    gsap.from(sp.chars, { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.028, scrollTrigger: { trigger: c, start: "top 68%" } });
    gsap.from($$("p", c), { y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 70%" } });
    ScrollTrigger.create({ trigger: c, start: "top 72%", once: true, onEnter: () => counter(q, +q.dataset.cq, 1.6) });
  });
  ScrollTrigger.create({ trigger: ".terr", start: "bottom 40%", onLeave: () => { attivo = null; gsap.to(fly, { attr: { viewBox: full }, duration: 1.2, ease: "expo.inOut" }); }, onLeaveBack: () => { attivo = null; gsap.to(fly, { attr: { viewBox: full }, duration: 1.2, ease: "expo.inOut" }); } });
  $$(".terr-map .pin").forEach((p) => p.addEventListener("click", () => { const t = $(`.comune[data-id="${p.dataset.id}"]`); lenis ? lenis.scrollTo(t, { offset: -90 }) : t.scrollIntoView(); }));

  // ---------- STORIA orizzontale ----------
  const track = $(".st-track"), yEl = $("[data-year]"), cards = $$(".ev-card");
  const mm = gsap.matchMedia();
  mm.add("(min-width: 0px)", () => {
    const dist = () => track.scrollWidth - innerWidth + 40;
    const hTween = gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: ".storia", start: "top top", end: () => "+=" + dist(), pin: ".st-pin", scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (st) => { gsap.set(".st-bar i", { scaleX: st.progress }); const i = Math.min(cards.length - 1, Math.round(st.progress * (cards.length - 1))); if (yEl.dataset.i != i) { yEl.dataset.i = i; gsap.fromTo(yEl, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power3.out", onStart: () => (yEl.textContent = cards[i].dataset.y) }); } } } });
    cards.forEach((c) => {
      gsap.from($$(".y,h3,p,.src", c), { y: 40, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: c, containerAnimation: hTween, start: "left 85%" } });
      const lines = $$(".fan line", c);
      if (lines.length) gsap.from(lines, { drawSVG: "0%", duration: 1, ease: "power2.inOut", stagger: 0.09, scrollTrigger: { trigger: c, containerAnimation: hTween, start: "left 70%" } });
      const im = $(".fig img", c);
      if (im) gsap.fromTo(im, { scale: 1.3, xPercent: -8 }, { scale: 1, xPercent: 8, ease: "none", scrollTrigger: { trigger: c, containerAnimation: hTween, start: "left right", end: "right left", scrub: true } });
    });
    // ventaglio interattivo: i raggi seguono il mouse
    $$(".fan").forEach((f) => f.addEventListener("mousemove", (e) => { const r = f.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; $$("line", f).forEach((l, i) => l.style.strokeOpacity = 1 - Math.min(0.8, Math.abs(x - (1 - i / 9)) * 1.6)); }));
  });

  // ---------- VITIGNI ----------
  $$(".vcard").forEach((c, i) => {
    gsap.from(c, { y: 80, rotate: i === 1 ? 0 : i ? 3 : -3, autoAlpha: 0, duration: 1.3, ease: "expo.out", delay: i * 0.12, scrollTrigger: { trigger: ".vit-grid", start: "top 80%" } });
    gsap.from($$(".herb path", c), { drawSVG: "0%", duration: 1.6, ease: "power2.inOut", stagger: 0.2, scrollTrigger: { trigger: c, start: "top 75%" } });
    gsap.from($$(".herb .berry", c), { scale: 0, transformOrigin: "center", duration: 0.5, ease: "back.out(3)", stagger: 0.02, delay: 0.6, scrollTrigger: { trigger: c, start: "top 75%" } });
    c.addEventListener("mousemove", (e) => { const r = c.getBoundingClientRect(); gsap.to(c, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 10, rotateX: -((e.clientY - r.top) / r.height - 0.5) * 8, duration: 0.6, ease: "power3.out" }); });
    c.addEventListener("mouseleave", () => gsap.to(c, { rotateY: 0, rotateX: 0, duration: 1, ease: "elastic.out(1,0.4)" }));
  });

  // ---------- SUOLI: carotaggio ----------
  $$(".core").forEach((c, i) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: "top 85%", end: "top 25%", scrub: 1 } });
    tl.to($("img", c), { clipPath: "inset(0 0 0% 0)", ease: "none" }, 0).from($$(".core-strata i", c), { scaleX: 0, transformOrigin: i % 2 ? "right" : "left", stagger: 0.2, ease: "none" }, 0);
    gsap.from($$("p,h3", c), { y: 20, autoAlpha: 0, stagger: 0.07, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 60%" } });
  });
  ScrollTrigger.create({ trigger: ".aroma", start: "top 75%", once: true, onEnter: () => { Object.keys(cur).forEach((k) => (cur[k] = 0)); setAroma(true); } });

  // ---------- RETE ----------
  gsap.from(".rete-list li", { y: 30, autoAlpha: 0, duration: 0.8, ease: "expo.out", stagger: 0.035, scrollTrigger: { trigger: ".rete-list", start: "top 80%" } });
  $$(".perc").forEach((p) => gsap.from($("path", p), { drawSVG: "0%", duration: 2, ease: "power2.inOut", scrollTrigger: { trigger: p, start: "top 80%" } }));

  // ---------- EVENTI, RACCONTI ----------
  gsap.to(".ev-main figure img", { scale: 1, ease: "none", scrollTrigger: { trigger: ".ev-main", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".ev-main", { clipPath: "inset(0 50% 0 50%)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: ".ev-main", start: "top 80%" } });
  gsap.from(".panel li", { x: -12, autoAlpha: 0, stagger: 0.03, duration: 0.5, scrollTrigger: { trigger: ".panel", start: "top 85%" } });
  gsap.from(".enext", { y: 40, autoAlpha: 0, stagger: 0.12, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".ev-next", start: "top 85%" } });
  gsap.from(".post", { y: 60, autoAlpha: 0, stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".blog", start: "top 80%" } });
  gsap.from(".vid", { y: 80, rotate: (i) => (i % 2 ? 2 : -2), autoAlpha: 0, stagger: 0.1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".vlog", start: "top 85%" } });

  // ---------- ADESIONE ----------
  gsap.from(".ad-vant li", { x: -20, autoAlpha: 0, stagger: 0.07, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: ".ad-vant", start: "top 85%" } });
  gsap.from(".ad-passi li", { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".ad-passi", start: "top 90%" } });
  gsap.from(".ad-form", { y: 80, rotate: 2, autoAlpha: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".ad", start: "top 70%" } });
  gsap.from(".cat", { y: 20, autoAlpha: 0, stagger: 0.05, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: ".cats", start: "top 85%" } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
