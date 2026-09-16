/* «Il grappolo della rete»: foto reale dei grappoli del territorio, un acino per ogni azienda.
   Posizioni in percentuale sull'immagine 3:2. Usato dalle versioni B e D. */
(function () {
  "use strict";
  const ACINI = [
    { x: 33.2, y: 15.9 }, { x: 13.8, y: 33.9 }, { x: 21.0, y: 34.9 }, { x: 42.3, y: 36.4 }, { x: 10.3, y: 40.5 }, { x: 34.2, y: 43.6 }, { x: 19.8, y: 44.7 }, { x: 8.6, y: 47.8 }, { x: 65.4, y: 54.9 }, { x: 41.9, y: 57.1 }, { x: 10.9, y: 60.5 }, { x: 57.8, y: 61.7 }, { x: 13.7, y: 71.3 }, { x: 31.3, y: 76.1 }, { x: 21.8, y: 78.9 }, { x: 13.0, y: 79.2 }, { x: 9.7, y: 89.4 }
  ];
  const LOGHI = { "Alois": "alois", "Canestrini": "canestrini", "I Vignai del Casavecchia": "vignai", "Masseria Piccirillo": "piccirillo", "Sagliocco": "sagliocco", "Scaramuzzo": "scaramuzzo", "Sclavia": "sclavia" };

  function crea(root, opt) {
    const { D, esc } = window.LSDVCore, cartella = opt.loghi || "loghi-chiari";
    const az = D.aziende;
    root.innerHTML = `<figure class="gp-foto">
        <img src="../shared/img/grappolo.webp" srcset="../shared/img/grappolo-mobile.webp 1100w, ../shared/img/grappolo.webp 2000w" sizes="100vw" alt="Grappoli di uva nera nei vigneti dell'Alta Campania">
        <div class="gp-grana" aria-hidden="true"></div>
        <ul class="gp-acini">${az.map((a, i) => {
          const p = ACINI[i % ACINI.length], n = a.split(" (")[0].split(" · ")[0], l = LOGHI[n] || LOGHI[a];
          return `<li class="gp-a" style="left:${p.x}%;top:${p.y}%" data-i="${i}">
            <button type="button" aria-describedby="gp-card" data-snd="hover"><span class="gp-ring"></span><span class="sr">${esc(a)}</span></button>
            <span class="gp-nome">${esc(n)}</span>
            <span class="gp-logo">${l ? `<img src="../shared/img/${cartella}/${l}.png" alt="" loading="lazy">` : ""}</span>
          </li>`;
        }).join("")}</ul>
        <figcaption class="gp-cap">Diciassette acini, diciassette aziende · foto dai vigneti dell'Alta Campania</figcaption>
      </figure>
      <aside class="gp-card" id="gp-card" hidden aria-live="polite"><div class="gp-card-in"><span class="gp-n"></span><span class="gp-l"></span><b></b><small>azienda aderente della Strada</small></div></aside>`;

    const card = root.querySelector(".gp-card"), foto = root.querySelector(".gp-foto");
    const mostra = (li) => {
      const i = +li.dataset.i, a = az[i], n = a.split(" (")[0].split(" · ")[0], l = LOGHI[n] || LOGHI[a];
      card.querySelector("b").textContent = a;
      card.querySelector(".gp-n").textContent = String(i + 1).padStart(2, "0") + " / " + az.length;
      card.querySelector(".gp-l").innerHTML = l ? `<img src="../shared/img/${cartella}/${l}.png" alt="">` : "";
      const r = li.getBoundingClientRect(), fr = foto.getBoundingClientRect();
      card.style.left = Math.min(Math.max(r.left - fr.left + r.width / 2, 130), fr.width - 130) + "px";
      card.style.top = r.top - fr.top + "px";
      card.hidden = false;
      root.querySelectorAll(".gp-a").forEach((x) => x.classList.toggle("on", x === li));
      if (window.gsap && !window.LSDVCore.RM) window.gsap.fromTo(card, { autoAlpha: 0, y: 10, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" });
      window.LSDVSound && window.LSDVSound.play("hover");
    };
    const nascondi = () => { card.hidden = true; root.querySelectorAll(".gp-a").forEach((x) => x.classList.remove("on")); };
    root.querySelectorAll(".gp-a").forEach((li) => {
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
