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
    f.src = conParam(f.dataset.src, f.dataset.goto);
  }), { rootMargin: "300px 0px" });
  $$(".fr-v").forEach((b) => oss.observe(b));

  // la sezione da mostrare e l'assenza dell'intro viaggiano nell'indirizzo, così funziona anche aprendo i file dal disco
  const conParam = (src, goto) => (goto ? src + (src.includes("?") ? "&" : "?") + "noi&goto=" + goto : src);

  // ---------- barra avanti / indietro / home della pagina ----------
  $$("[data-nb]").forEach((b) => b.addEventListener("click", () => (b.dataset.nb === "back" ? history.back() : history.forward())));

  // ---------- modalità «solo»: un solo componente a tutto schermo (usata dall'anteprima dei grappoli) ----------
  const solo = new URLSearchParams(location.search).get("solo");
  if (solo) {
    document.documentElement.classList.add("solo");
    const art = $(`[data-solo="${solo}"]`);
    if (art) art.classList.add("solo-on");
  }

  // ---------- anteprima a schermo intero ----------
  const fs = document.createElement("div");
  fs.className = "fs"; fs.hidden = true; fs.setAttribute("role", "dialog"); fs.setAttribute("aria-modal", "true"); fs.setAttribute("aria-label", "Anteprima a schermo intero");
  fs.innerHTML = `<nav class="fs-bar" aria-label="Navigazione dell'anteprima">
      <button type="button" class="nb-b" data-fs="back" aria-label="Indietro" title="Indietro">←</button>
      <button type="button" class="nb-b" data-fs="fwd" aria-label="Avanti" title="Avanti">→</button>
      <a class="nb-b nb-home" href="../index.html?salta" title="Torna alle quattro direzioni">Home</a>
      <span class="fs-t"></span>
      <button type="button" class="nb-b nb-x" data-fs="chiudi" aria-label="Chiudi l'anteprima" title="Chiudi (Esc)">Chiudi ✕</button>
    </nav><iframe class="fs-if" title="Anteprima a schermo intero"></iframe>`;
  document.body.appendChild(fs);
  const fif = $(".fs-if", fs), ftit = $(".fs-t", fs);
  let ultimo = null;
  const apri = (src, goto, titolo, da) => {
    ultimo = da || null; ftit.textContent = titolo || "";
    fs.hidden = false; document.documentElement.classList.add("fs-aperto");
    fif.src = conParam(src, goto);
    $(".nb-x", fs).focus();
  };
  const chiudi = () => {
    fs.hidden = true; document.documentElement.classList.remove("fs-aperto"); fif.src = "about:blank";
    ultimo && ultimo.focus();
  };
  fs.addEventListener("click", (e) => {
    const t = e.target.closest("[data-fs]"); if (!t) return;
    if (t.dataset.fs === "chiudi") chiudi(); else try { fif.contentWindow.postMessage({ lsdv: "nav", dir: t.dataset.fs }, "*"); } catch (x) {}
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !fs.hidden) chiudi(); });

  // la finestra scalata: un clic la apre alla pagina vera, a schermo intero
  $$(".fr-open").forEach((b) => b.addEventListener("click", () => {
    const f = b.parentElement.firstElementChild, fig = b.closest("figure");
    const titolo = (fig.querySelector("b") || {}).textContent || "";
    const url = f.dataset.src.replace("?intro", "?intro");
    apri(url, f.dataset.goto, titolo, b);
  }));
  // i grappoli: la stessa pagina in modalità «solo»
  $$("[data-fs]", document).forEach((b) => { if (!b.classList.contains("gv-fs")) return; b.addEventListener("click", () => {
    const art = b.closest("[data-solo]");
    apri("index.html?solo=" + art.dataset.solo, null, art.querySelector("h3").textContent, b);
  }); });
})();
