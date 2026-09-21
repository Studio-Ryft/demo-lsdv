(function () {
  "use strict";
  const { $, $$ } = window.LSDVCore;
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
  window.LSDVTralcio.crea($("[data-tralcio]"), { loghi: "loghi-chiari" });
  window.LSDVGrappolo.crea($("[data-grappolo]"), { loghi: "loghi-chiari" });

  // le finestre mostrano la pagina a 1440 px di larghezza, rimpicciolita per stare nella colonna
  const scala = () => $$(".fr-v").forEach((b) => { b.firstElementChild.style.transform = "scale(" + (b.clientWidth / 1440) + ")"; });
  scala(); addEventListener("resize", scala);

  // ogni pagina si carica solo quando la finestra sta per entrare in vista
  const oss = new IntersectionObserver((v) => v.forEach((e) => {
    if (!e.isIntersecting) return;
    const f = e.target.firstElementChild; oss.unobserve(e.target);
    f.src = f.dataset.src; window.vaiA(f);
  }), { rootMargin: "300px 0px" });
  $$(".fr-v").forEach((b) => oss.observe(b));

  // ogni finestra salta alla sezione indicata quando la pagina è pronta (e di nuovo dopo, se il layout si è mosso)
  window.vaiA = (fr) => {
    const id = fr.dataset.goto; if (!id) return;
    const salta = () => {
      const w = fr.contentWindow, el = w.document.getElementById(id);
      const y = el.getBoundingClientRect().top + w.scrollY - 20;
      if (w.__lenis) w.__lenis.scrollTo(y, { immediate: true, force: true }); else w.scrollTo(0, y);
    };
    let n = 0;
    const t = setInterval(() => {
      n++;
      try {
        const w = fr.contentWindow, d = w.document;
        if (d.getElementById(id) && (d.readyState === "complete" || n > 14)) {
          clearInterval(t); salta(); setTimeout(salta, 1800);
        }
      } catch (e) { clearInterval(t); }
      if (n > 120) clearInterval(t);
    }, 500);
  };
})();
