/* Effetti sonori sobri, sintetizzati al volo (nessun file audio da scaricare).
   Spenti finché l'utente non li accende; la scelta resta salvata. */
(function () {
  "use strict";
  const KEY = "lsdv-suono";
  let ctx = null, master = null, on = false, last = 0;
  try { on = localStorage.getItem(KEY) === "1"; } catch (e) {}

  function boot() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    return ctx;
  }

  function env(node, t0, a, d, peak) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    node.connect(g); g.connect(master);
    return g;
  }

  function tone(freq, type, a, d, peak, detune) {
    const t0 = ctx.currentTime, o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (detune) o.frequency.exponentialRampToValueAtTime(detune, t0 + a + d);
    env(o, t0, a, d, peak);
    o.start(t0); o.stop(t0 + a + d + 0.05);
  }

  function noise(dur, peak, freq) {
    const t0 = ctx.currentTime, n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = 1.2;
    src.connect(f); env(f, t0, 0.005, dur, peak);
    src.start(t0);
  }

  const VOICES = {
    hover() { tone(2100, "sine", 0.004, 0.05, 0.02); },
    tap() { tone(520, "triangle", 0.004, 0.14, 0.05, 340); noise(0.06, 0.012, 1800); },
    select() { tone(660, "sine", 0.005, 0.18, 0.045); setTimeout(() => on && tone(990, "sine", 0.005, 0.22, 0.03), 70); },
    open() { tone(220, "sine", 0.02, 0.5, 0.05, 330); noise(0.35, 0.01, 700); },
    close() { tone(330, "sine", 0.01, 0.3, 0.035, 180); },
    step() { tone(150, "sine", 0.02, 0.45, 0.06, 120); },
    pour() { noise(0.9, 0.02, 520); tone(110, "sine", 0.05, 0.8, 0.04, 90); },
    slide() { tone(1400, "sine", 0.003, 0.04, 0.012); }
  };

  function play(name) {
    if (!on || !VOICES[name]) return;
    const now = performance.now();
    if (name === "hover" && now - last < 70) return;
    last = now;
    if (!boot()) return;
    if (ctx.state === "suspended") ctx.resume();
    try { VOICES[name](); } catch (e) {}
  }

  function setOn(v) {
    on = v;
    try { localStorage.setItem(KEY, v ? "1" : "0"); } catch (e) {}
    if (v) { boot(); ctx && ctx.state === "suspended" && ctx.resume(); play("select"); }
    document.documentElement.classList.toggle("suono-on", v);
    document.querySelectorAll("[data-sound-toggle]").forEach((b) => { b.setAttribute("aria-pressed", v); const l = b.querySelector("[data-sound-label]"); if (l) l.textContent = v ? "Suono acceso" : "Suono spento"; });
  }

  /* collega automaticamente gli elementi marcati con data-snd="nome" */
  function bind(root = document) {
    root.querySelectorAll("[data-snd]").forEach((el) => {
      if (el.__snd) return; el.__snd = 1;
      const n = el.dataset.snd;
      el.addEventListener("pointerenter", () => play("hover"));
      el.addEventListener("click", () => play(n === "hover" ? "tap" : n));
    });
  }

  document.addEventListener("click", (e) => { const t = e.target.closest("[data-sound-toggle]"); if (t) setOn(!on); });
  window.LSDVSound = { play, setOn, bind, isOn: () => on };
  document.addEventListener("DOMContentLoaded", () => { setOn(on); bind(); });
})();
