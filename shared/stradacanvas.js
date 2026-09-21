/* «La strada del vino» su canvas: la carta del territorio (curve di livello dal DEM) nasce in linea, poi un punto percorre la strada
   tra gli otto comuni e la colora. Tutto il disegno pesante è preparato una volta sola; a ogni fotogramma si compongono pochi strati,
   quindi resta fluido anche su telefoni modesti. render(p) è una funzione pura di p (0..1): si può pilotare con GSAP e accelerare. */
(function () {
  "use strict";
  const RAMPA = [[0, "#F3E9C6"], [0.1, "#E6E4A4"], [0.24, "#CBD86C"], [0.4, "#A1B93B"], [0.55, "#71902F"], [0.7, "#4B5D23"], [0.83, "#7C2F4B"], [1, "#4A1830"]];
  const mixc = (a, b, t) => { const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); const c = (s) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t); return "#" + [16, 8, 0].map((s) => c(s).toString(16).padStart(2, "0")).join(""); };
  const rampa = (t) => { t = Math.max(0, Math.min(1, t)); for (let i = 1; i < RAMPA.length; i++) if (t <= RAMPA[i][0]) return mixc(RAMPA[i - 1][1], RAMPA[i][1], (t - RAMPA[i - 1][0]) / (RAMPA[i][0] - RAMPA[i - 1][0])); return RAMPA[RAMPA.length - 1][1]; };
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(h)); return c; };

  // percorso: tratto, verso, comune raggiunto alla fine
  const LEGS = [[0, false, "pontelatone"], [1, false, "castel-di-sasso"], [2, false, "liberi"], [2, true, "castel-di-sasso"], [3, false, "piana-di-monte-verna"], [4, false, "caiazzo"], [5, false, "ruviano"], [6, false, "castel-campagnano"]];

  function crea(host, opt = {}) {
    const I = window.LSDV_ISO, nomi = Object.fromEntries((window.LSDV ? window.LSDV.comuni : []).map((c) => [c.id, c.nome]));
    const [X0, Y0, X1, Y1] = I.ritaglio, PAD = 40;
    const B = { x0: X0 - PAD, y0: Y0 - PAD, w: X1 - X0 + 2 * PAD, h: Y1 - Y0 + 2 * PAD };
    const cv = document.createElement("canvas"); cv.className = "sc-canvas"; cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "Carta del territorio con la Strada del Vino che collega gli otto comuni");
    host.appendChild(cv); const ctx = cv.getContext("2d");

    let sw, sh, dpr, kd, portrait, world = {}, mask, mctx, brush, viewW, viewH, offX = 0, offY = 0, tmp, tctx, R;
    let route, total, townD, lastD = 0;
    const fam = "Manrope, system-ui, sans-serif";

    function costruisci() {
      sw = host.clientWidth || 1200; sh = host.clientHeight || 700; dpr = Math.min(2, window.devicePixelRatio || 1); portrait = sh > sw * 1.05;
      cv.width = Math.round(sw * dpr); cv.height = Math.round(sh * dpr); viewW = cv.width; viewH = cv.height;
      // scala: in orizzontale la carta sta tutta nello schermo, in verticale è più grande e la telecamera segue il punto
      const k = portrait ? (sw * 2.4) / B.w : sw / B.w; kd = k * dpr;
      const Ww = Math.round(B.w * kd), Wh = Math.round(B.h * kd);
      const P = (x, y) => [(x - B.x0) * kd, (y - B.y0) * kd];

      // strato delle curve di livello e dei fiumi
      const lin = mk(Ww, Wh), lc = lin.getContext("2d");
      lc.setTransform(kd, 0, 0, kd, -B.x0 * kd, -B.y0 * kd); lc.lineJoin = "round"; lc.lineCap = "round";
      I.strati.forEach((s) => { const idx = s.q % 100 === 0; lc.strokeStyle = idx ? "rgba(68,36,19,.34)" : "rgba(68,36,19,.17)"; lc.lineWidth = (idx ? 1.15 : 0.75) * dpr / kd; lc.stroke(new Path2D(s.d)); });
      lc.strokeStyle = "rgba(90,160,150,.55)"; lc.lineWidth = 3 * dpr / kd;
      I.fiumi.forEach((r) => { lc.beginPath(); r.forEach((p, i) => (i ? lc.lineTo(p[0], p[1]) : lc.moveTo(p[0], p[1]))); lc.stroke(); });

      // strato del colore: fasce ogni 50 m
      const col = mk(Ww, Wh), cc = col.getContext("2d");
      cc.setTransform(kd, 0, 0, kd, -B.x0 * kd, -B.y0 * kd);
      const zmin = I.strati[0].q, zmax = I.strati[I.strati.length - 1].q;
      I.strati.forEach((s) => { if (s.q % 50) return; cc.fillStyle = rampa((s.q - zmin) / (zmax - zmin)); cc.fill(new Path2D(s.d), "evenodd"); });

      // sfumatura dei bordi: la carta si scioglie nel foglio
      const fade = mk(Ww, Wh), fc = fade.getContext("2d");
      const gv = fc.createLinearGradient(0, 0, 0, Wh), a = (PAD / B.h), b = a + 0.16;
      gv.addColorStop(0, "rgba(0,0,0,0)"); gv.addColorStop(a, "rgba(0,0,0,0)"); gv.addColorStop(b, "#000"); gv.addColorStop(1 - b, "#000"); gv.addColorStop(1 - a, "rgba(0,0,0,0)"); gv.addColorStop(1, "rgba(0,0,0,0)");
      fc.fillStyle = gv; fc.fillRect(0, 0, Ww, Wh);
      fc.globalCompositeOperation = "destination-in";
      const gh = fc.createLinearGradient(0, 0, Ww, 0), ah = PAD / B.w, bh = ah + 0.09;
      gh.addColorStop(0, "rgba(0,0,0,0)"); gh.addColorStop(ah, "rgba(0,0,0,0)"); gh.addColorStop(bh, "#000"); gh.addColorStop(1 - bh, "#000"); gh.addColorStop(1 - ah, "rgba(0,0,0,0)"); gh.addColorStop(1, "rgba(0,0,0,0)");
      fc.fillStyle = gh; fc.fillRect(0, 0, Ww, Wh);
      [lc, cc].forEach((c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "destination-in"; c.drawImage(fade, 0, 0); c.globalCompositeOperation = "source-over"; });
      world = { lin, col, Ww, Wh, P };

      // pennello morbido e maschera del colore
      R = 190 * kd; brush = mk(R * 2, R * 2); const bc = brush.getContext("2d"), g = bc.createRadialGradient(R, R, 0, R, R, R);
      g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.45, "rgba(0,0,0,.85)"); g.addColorStop(1, "rgba(0,0,0,0)"); bc.fillStyle = g; bc.fillRect(0, 0, R * 2, R * 2);
      mask = mk(Ww, Wh); mctx = mask.getContext("2d"); tmp = mk(viewW, viewH); tctx = tmp.getContext("2d");

      // percorso in coordinate del mondo (pixel del canvas)
      route = LEGS.map(([i, rev, fine]) => {
        const pts = I.strade[i].pts.map((q) => P(q[0], q[1])); const cum = [0];
        for (let j = 1; j < pts.length; j++) cum.push(cum[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
        return { i, rev, fine, pts, cum, len: cum[cum.length - 1] };
      });
      total = route.reduce((n, l) => n + l.len, 0);
      townD = { formicola: 0 }; let acc = 0; route.forEach((l) => { acc += l.len; if (townD[l.fine] === undefined) townD[l.fine] = acc; });
      lastD = 0; mctx.clearRect(0, 0, Ww, Wh);
    }

    // posizione lungo il percorso alla distanza d (pixel del mondo)
    function pos(d) {
      d = clamp(d, 0, total); let acc = 0;
      for (const l of route) {
        if (d <= acc + l.len || l === route[route.length - 1]) {
          const s = clamp(d - acc, 0, l.len), u = l.rev ? l.len - s : s;
          let j = 1; while (j < l.cum.length - 1 && l.cum[j] < u) j++;
          const t = (u - l.cum[j - 1]) / ((l.cum[j] - l.cum[j - 1]) || 1), a = l.pts[j - 1], b = l.pts[j];
          return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        }
        acc += l.len;
      }
      return route[0].pts[0];
    }
    // disegna il tratto già percorso (solo i tratti in avanti aggiungono strada)
    function strada(d) {
      let acc = 0; const dis = [];
      route.forEach((l) => {
        if (!l.rev) { const f = clamp((d - acc) / l.len); if (f > 0) dis.push([l, f * l.len]); } else if (d > acc) { /* già disegnato all'andata */ }
        acc += l.len;
      });
      const tracce = (l, fino) => { ctx.beginPath(); ctx.moveTo(l.pts[0][0] - offX, l.pts[0][1] - offY); for (let j = 1; j < l.pts.length && l.cum[j - 1] < fino; j++) { const seg = l.cum[j] - l.cum[j - 1], f = Math.min(1, (fino - l.cum[j - 1]) / seg); const a = l.pts[j - 1], b = l.pts[j]; ctx.lineTo(a[0] + (b[0] - a[0]) * f - offX, a[1] + (b[1] - a[1]) * f - offY); } };
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "#FCF6E1"; ctx.lineWidth = 12 * dpr; dis.forEach(([l, f]) => { tracce(l, f); ctx.stroke(); });
      ctx.strokeStyle = "#442413"; ctx.lineWidth = 7.4 * dpr; dis.forEach(([l, f]) => { tracce(l, f); ctx.stroke(); });
      ctx.strokeStyle = "#ADC136"; ctx.lineWidth = 1.7 * dpr; ctx.setLineDash([7 * dpr, 6 * dpr]); dis.forEach(([l, f]) => { tracce(l, f); ctx.stroke(); }); ctx.setLineDash([]);
    }

    function render(p) {
      if (!world.lin) costruisci();
      const pa = clamp(p / 0.16), pd = clamp((p - 0.14) / 0.72), d = ease(pd) * total, pf = clamp((p - 0.86) / 0.14);
      const m = pos(d);
      // telecamera: in verticale segue il punto
      if (portrait) { offX = clamp(m[0] - viewW / 2, 0, Math.max(0, world.Ww - viewW)); offY = clamp(m[1] - viewH / 2, 0, Math.max(0, world.Wh - viewH)); }
      else { offX = -(viewW - world.Ww) / 2; offY = -(viewH - world.Wh) / 2; }

      // maschera del colore: si aggiunge un timbro morbido ogni ~12 px di strada
      if (d < lastD) { mctx.clearRect(0, 0, world.Ww, world.Wh); lastD = 0; }
      for (let s = lastD; s < d; s += 12 * dpr) { const q = pos(s); mctx.drawImage(brush, q[0] - R, q[1] - R); }
      if (d > lastD) { const q = pos(d); mctx.drawImage(brush, q[0] - R, q[1] - R); lastD = d; }

      ctx.clearRect(0, 0, viewW, viewH);
      const sx = Math.max(0, offX), sy = Math.max(0, offY), dx = Math.max(0, -offX), dy = Math.max(0, -offY);
      const cw = Math.min(viewW - dx, world.Ww - sx), ch = Math.min(viewH - dy, world.Wh - sy);
      // 1) colore, ritagliato dalla strada percorsa
      tctx.globalCompositeOperation = "source-over"; tctx.clearRect(0, 0, viewW, viewH);
      tctx.drawImage(world.col, sx, sy, cw, ch, dx, dy, cw, ch);
      tctx.globalCompositeOperation = "destination-in"; tctx.drawImage(mask, sx, sy, cw, ch, dx, dy, cw, ch);
      ctx.globalAlpha = 0.36 * pa; ctx.drawImage(tmp, 0, 0); ctx.globalAlpha = 1;
      // 2) curve di livello
      ctx.globalAlpha = pa; ctx.drawImage(world.lin, sx, sy, cw, ch, dx, dy, cw, ch); ctx.globalAlpha = 1;
      // 3) strada e paesi
      if (d > 0) strada(d);
      I.paesi.forEach((t) => {
        const q = world.P(t.x, t.y), x = q[0] - offX, y = q[1] - offY, dt = townD[t.id] === undefined ? 0 : townD[t.id], arr = clamp((d - dt) / (36 * dpr)), vis = pa;
        if (x < -80 || x > viewW + 80 || y < -80 || y > viewH + 80) return;
        const r = (5.5 + 2.5 * ease(arr)) * dpr;
        ctx.globalAlpha = vis * (0.45 + 0.55 * arr); ctx.fillStyle = "#FCF6E1"; ctx.strokeStyle = "#442413"; ctx.lineWidth = 2.2 * dpr;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#7C2F4B"; ctx.beginPath(); ctx.arc(x, y, 2.2 * dpr, 0, 7); ctx.fill();
        if (arr > 0 && arr < 1) { ctx.strokeStyle = "rgba(68,36,19," + (0.5 * (1 - arr)) + ")"; ctx.lineWidth = 1.5 * dpr; ctx.beginPath(); ctx.arc(x, y, r + arr * 16 * dpr, 0, 7); ctx.stroke(); }
        ctx.globalAlpha = vis * arr; ctx.fillStyle = "#442413"; ctx.font = "600 " + 11.5 * dpr + "px " + fam; ctx.textBaseline = "middle";
        const nome = (nomi[t.id] || t.nome).toUpperCase(), lato = t.x > 1250 ? -1 : 1;
        try { ctx.letterSpacing = 2.2 * dpr + "px"; } catch (e) {}
        ctx.textAlign = lato > 0 ? "left" : "right"; ctx.lineWidth = 4.5 * dpr; ctx.strokeStyle = "rgba(252,246,225,.92)"; ctx.lineJoin = "round";
        ctx.strokeText(nome, x + lato * (r + 8 * dpr), y); ctx.fillText(nome, x + lato * (r + 8 * dpr), y);
        try { ctx.letterSpacing = "0px"; } catch (e) {}
        ctx.globalAlpha = 1;
      });
      // 4) il punto, con la scia
      if (d > 0 && pf < 1) {
        for (let j = 9; j >= 1; j--) { const q = pos(d - j * 9 * dpr); ctx.globalAlpha = (1 - pf) * (1 - j / 10) * 0.55; ctx.fillStyle = "#ADC136"; ctx.beginPath(); ctx.arc(q[0] - offX, q[1] - offY, (6.5 - j * 0.45) * dpr, 0, 7); ctx.fill(); }
        ctx.globalAlpha = 1 - pf; ctx.fillStyle = "#ADC136"; ctx.strokeStyle = "#442413"; ctx.lineWidth = 2.6 * dpr; ctx.beginPath(); ctx.arc(m[0] - offX, m[1] - offY, 7.2 * dpr, 0, 7); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "rgba(68,36,19," + 0.5 * (1 - ((p * 9) % 1)) + ")"; ctx.lineWidth = 1.6 * dpr; ctx.beginPath(); ctx.arc(m[0] - offX, m[1] - offY, (9 + ((p * 9) % 1) * 18) * dpr, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
    window.addEventListener("resize", () => { world = {}; });
    return { render, canvas: cv, destroy: () => cv.remove() };
  }
  window.LSDVStrada = { crea };
})();
