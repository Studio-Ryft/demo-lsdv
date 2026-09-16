/* «Il grappolo della rete»: foto reale dei vigneti, un grappolo per ogni azienda.
   Ogni punto è una bolla sferica con il logotipo adattato e luce al neon nei colori della vigna.
   Posizioni e raggi rilevati dalla foto con sito/tools/acini.py. */
(function () {
  "use strict";
  const ACINI = [
    { x: 39.1, y: 11.6, r: 3.0 }, { x: 42.2, y: 22.8, r: 3.3 }, { x: 18.2, y: 36.4, r: 3.4 },
    { x: 10.1, y: 42.2, r: 1.9 }, { x: 62.4, y: 39.4, r: 2.8 }, { x: 49.8, y: 43.7, r: 3.4 },
    { x: 65.3, y: 55.3, r: 1.7 }, { x: 13.8, y: 60.6, r: 3.4 }, { x: 24.4, y: 58.3, r: 3.4 },
    { x: 57.8, y: 61.8, r: 1.6 }, { x: 48.1, y: 67.8, r: 2.6 }, { x: 44.4, y: 76.1, r: 3.3 },
    { x: 13.0, y: 77.8, r: 2.9 }, { x: 23.2, y: 77.3, r: 2.7 }, { x: 11.9, y: 91.2, r: 2.2 },
    { x: 23.6, y: 91.4, r: 1.8 }, { x: 66.2, y: 73.0, r: 2.6 }
  ];
  const LOGHI = { "Alois": "alois", "Canestrini": "canestrini", "I Vignai del Casavecchia": "vignai", "Masseria Piccirillo": "piccirillo", "Sagliocco": "sagliocco", "Scaramuzzo": "scaramuzzo", "Sclavia": "sclavia" };
  const iniziali = (n) => n.replace(/[^A-Za-zÀ-ÿ ]/g, " ").split(/\s+/).filter((w) => w.length > 2).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

  /* filtro che gonfia il logotipo come su una sfera */
  const FILTRO = `<svg class="gp-defs" aria-hidden="true" width="0" height="0"><defs>
      <radialGradient id="gpMappa" cx="50%" cy="50%">
        <stop offset="0%" stop-color="#808080"/><stop offset="62%" stop-color="#9b9b9b"/><stop offset="100%" stop-color="#4a4a4a"/>
      </radialGradient>
      <filter id="gpSfera" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
        <feImage href="#gpSferaMappa" result="mappa"/>
        <feDisplacementMap in="SourceGraphic" in2="mappa" scale="14" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <circle id="gpSferaMappa" cx="50" cy="50" r="50" fill="url(#gpMappa)"/>
    </defs></svg>`;

  function crea(root, opt) {
    const { D, esc } = window.LSDVCore, cartella = opt.loghi || "loghi-chiari";
    const az = D.aziende;
    root.innerHTML = FILTRO + `<figure class="gp-foto">
        <img src="../shared/img/grappolo.webp" srcset="../shared/img/grappolo-mobile.webp 1100w, ../shared/img/grappolo.webp 2000w" sizes="100vw" alt="Grappoli di uva nera nei vigneti dell'Alta Campania">
        <div class="gp-grana" aria-hidden="true"></div>
        <ul class="gp-acini">${az.map((a, i) => {
          const p = ACINI[i % ACINI.length], n = a.split(" (")[0].split(" · ")[0], l = LOGHI[n] || LOGHI[a];
          return `<li class="gp-a" style="left:${p.x}%;top:${p.y}%;--d:${(p.r * 2).toFixed(2)}" data-i="${i}">
            <button type="button" data-snd="hover">
              <span class="gp-bolla">
                <span class="gp-mark${l ? "" : " mono"}"${l ? ` style="--logo:url(../shared/img/${cartella}/${l}.png)"` : ""}>${l ? "" : iniziali(n)}</span>
                <span class="gp-gloss"></span>
              </span>
              <span class="gp-ring"></span><span class="gp-ring due"></span>
              <span class="gp-lab">scopri</span>
              <span class="sr">${esc(a)}</span>
            </button>
          </li>`;
        }).join("")}</ul>
        <figcaption class="gp-cap">Diciassette grappoli, diciassette aziende · foto dai vigneti dell'Alta Campania</figcaption>
      </figure>
      <aside class="gp-card" id="gp-card" hidden aria-live="polite"><div class="gp-card-in"><span class="gp-n"></span><span class="gp-l"></span><b></b><small>azienda aderente della Strada</small></div></aside>`;

    const card = root.querySelector(".gp-card"), foto = root.querySelector(".gp-foto");
    const mostra = (li) => {
      const i = +li.dataset.i, a = az[i], n = a.split(" (")[0].split(" · ")[0], l = LOGHI[n] || LOGHI[a];
      card.querySelector("b").textContent = a;
      card.querySelector(".gp-n").textContent = String(i + 1).padStart(2, "0") + " / " + az.length;
      card.querySelector(".gp-l").innerHTML = l ? `<img src="../shared/img/${cartella}/${l}.png" alt="">` : "";
      const r = li.getBoundingClientRect(), fr = foto.getBoundingClientRect();
      card.style.left = Math.min(Math.max(r.left - fr.left + r.width / 2, 140), fr.width - 140) + "px";
      card.style.top = r.top - fr.top + "px";
      card.hidden = false;
      root.querySelectorAll(".gp-a").forEach((x) => x.classList.toggle("on", x === li));
      if (window.gsap && !window.LSDVCore.RM) window.gsap.fromTo(card, { autoAlpha: 0, y: 12, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.7)" });
      window.LSDVSound && window.LSDVSound.play("hover");
    };
    const nascondi = () => { card.hidden = true; root.querySelectorAll(".gp-a").forEach((x) => x.classList.remove("on")); };
    root.querySelectorAll(".gp-a").forEach((li, k) => {
      li.style.setProperty("--ritardo", (k % 6) * 0.45 + "s");
      li.addEventListener("pointerenter", () => mostra(li));
      li.addEventListener("focusin", () => mostra(li));
      li.addEventListener("click", () => mostra(li));
    });
    foto.addEventListener("pointerleave", nascondi);
    root.addEventListener("focusout", (e) => { if (!root.contains(e.relatedTarget)) nascondi(); });
    window.LSDVSound && window.LSDVSound.bind(root);
    return { foto, acini: Array.from(root.querySelectorAll(".gp-a")) };
  }

  window.LSDVGrappolo = { crea, ACINI };
})();
