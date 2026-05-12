var ge = Object.defineProperty;
var be = (c, e, t) => e in c ? ge(c, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : c[e] = t;
var P = (c, e, t) => be(c, typeof e != "symbol" ? e + "" : e, t);
let S = !1;
const v = (...c) => {
  S && console.log("[oh-StarTrek]", ...c);
};
function we(c) {
  S = c, c && v("调试模式已开启");
}
const de = "#12c2e9", Me = "#e98812", j = (c) => {
  const e = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
  return e ? {
    r: parseInt(e[1], 16),
    g: parseInt(e[2], 16),
    b: parseInt(e[3], 16)
  } : (S && console.warn("[oh-StarTrek] hexToRgb 解析失败:", c, "，使用 fallback"), j(de));
};
let L = { r: 18, g: 194, b: 233 }, D = { r: 233, g: 136, b: 18 };
function Se() {
  try {
    const c = getComputedStyle(document.documentElement), e = c.getPropertyValue("--milk-slate").trim() || de, t = c.getPropertyValue("--milk-orange").trim() || Me;
    L = j(e), D = j(t), v(`initColors: cyan=rgb(${L.r},${L.g},${L.b}), orange=rgb(${D.r},${D.g},${D.b})`);
  } catch {
    v("initColors failed, using defaults");
  }
}
const ve = 0.6, ae = () => Math.random() < ve ? L : D, Pe = 400, ie = 1600, Ae = 500, C = 4, V = 36, I = 1, K = 2, re = 0.07, k = 250, Fe = 1 / 12e3, xe = 30, $e = 300, le = 8, $ = 0.1, Ee = 0.15, ce = 0.1, Te = 30, _e = 16;
class Ce {
  // 巡航时长（大任务可延长）
  constructor(e) {
    P(this, "canvas");
    P(this, "ctx", null);
    P(this, "hideable");
    P(this, "stars", []);
    P(this, "canvasW", 0);
    P(this, "canvasH", 0);
    P(this, "scrollY", 0);
    P(this, "prevScrollY", 0);
    P(this, "frameCount", 0);
    // FPS 跟踪
    P(this, "fps", 0);
    P(this, "fpsFrameCount", 0);
    P(this, "fpsLastTime", 0);
    // 跃迁状态
    P(this, "warpPhase", "normal");
    P(this, "phaseStart", 0);
    P(this, "cruiseDuration", ie);
    this.hideable = e;
    const t = e.querySelectorAll(".orca-startrek-starfield");
    t.length > 0 && (v(`constructor: 清除 ${t.length} 个残留 canvas`), t.forEach((o) => o.remove())), this.canvas = document.createElement("canvas"), this.canvas.className = "orca-startrek-starfield", this.canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;", e.appendChild(this.canvas), this.resize();
  }
  /** 原地覆写：将星星重置为从圆边缘出发（跃迁回收用，零 GC） */
  resetAsCenterStar(e) {
    const t = this.canvasW / 2, o = this.canvasH / 2, s = Math.min(this.canvasW, this.canvasH) * (0.05 + Math.random() * 0.35), f = Math.random() * Math.PI * 2, h = t + Math.cos(f) * s, y = o + Math.sin(f) * s, d = Math.atan2(y - o, h - t), b = Math.sqrt(t * t + o * o), M = Math.min(1, s / b), a = ae();
    e.ox = h, e.oy = y, e.x = h, e.y = y, e.size = 0.3 + Math.random() * 0.8, e.baseAlpha = 0.15 + Math.random() * 0.25, e.twinkleSpeed = 0.5 + Math.random() * 2, e.twinkleOffset = Math.random() * Math.PI * 2, e.warpAngle = d, e.warpSpeed = C + (V - C) * M, e.warpBornInWarp = !0, e.warpStreak = Math.random() < 0.5, e.colorR = a.r, e.colorG = a.g, e.colorB = a.b;
  }
  /** 创建一颗随机位置的常驻星星 */
  makeStar(e, t) {
    const o = Math.random() * this.canvasW, n = e + Math.random() * (t - e), s = ae();
    return {
      ox: o,
      oy: n,
      x: o,
      y: n,
      size: 0.3 + Math.random() * 0.8,
      baseAlpha: 0.15 + Math.random() * 0.25,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinkleOffset: Math.random() * Math.PI * 2,
      warpAngle: 0,
      warpSpeed: 0,
      warpBornInWarp: !1,
      warpStreak: !1,
      colorR: s.r,
      colorG: s.g,
      colorB: s.b
    };
  }
  /** 初始化星点 — 在画布 + 出血区范围内均匀分布 */
  generateStars() {
    this.stars = [];
    const e = this.canvasH * ce, t = this.canvasH + e * 2, o = this.canvasW * t, n = Math.max(
      xe,
      Math.min($e, Math.round(o * Fe))
    );
    for (let s = 0; s < n; s++)
      this.stars.push(this.makeStar(-e, this.canvasH + e));
  }
  /** 触发跃迁：进入加速期；warp 期间可重置巡航计时器
   *  @param cruiseDuration 巡航时长（ms），默认 CRUISE_DURATION
   */
  triggerWarp(e = ie) {
    if (v(`triggerWarp: phase=${this.warpPhase}, stars=${this.stars.length}, cruise=${e}ms`), this.warpPhase === "ramp" || this.warpPhase === "decay") return;
    if (this.warpPhase === "warp") {
      this.phaseStart = performance.now(), v("triggerWarp: warp重置");
      return;
    }
    this.warpPhase = "ramp", this.phaseStart = performance.now(), this.cruiseDuration = e;
    const t = this.canvasW / 2, o = this.canvasH / 2, n = Math.sqrt(t * t + o * o);
    for (const s of this.stars) {
      const f = s.x - t, h = s.y - o, y = Math.sqrt(f * f + h * h);
      s.warpAngle = Math.atan2(h, f);
      const d = Math.min(1, y / n);
      s.warpSpeed = C + (V - C) * d, s.warpBornInWarp = !1, s.warpStreak = Math.random() < 0.5;
    }
    if (S) {
      const s = this.stars.slice(0, 5).map((f) => `(${f.x.toFixed(0)},${f.y.toFixed(0)})`).join(" ");
      v(`triggerWarp: 星星样本 = ${s}`);
    }
    v(`triggerWarp: 进入ramp, 星星数=${this.stars.length}`);
  }
  /** 调整 canvas 尺寸（容差 2px，防止 1px 抖动反复重建星星） */
  resize() {
    const e = this.hideable.clientWidth, t = this.hideable.clientHeight;
    if (e === 0 || t === 0) return;
    const o = Math.abs(e - this.canvasW), n = Math.abs(t - this.canvasH);
    if ((o >= 2 || n >= 2) && (v(`resize: ${this.canvasW}x${this.canvasH} → ${e}x${t} (dw=${o}, dh=${n})`), this.canvasW = e, this.canvasH = t, this.canvas.width = e, this.canvas.height = t, this.ctx = this.canvas.getContext("2d"), this.generateStars(), this.warpPhase !== "normal")) {
      v(`resize: 跃迁中(${this.warpPhase})，重算跃迁方向`);
      const s = e / 2, f = t / 2;
      for (const h of this.stars) {
        const y = h.x - s, d = h.y - f;
        h.warpAngle = Math.atan2(d, y), h.warpSpeed = C + Math.random() * (V - C), h.warpBornInWarp = !1;
      }
    }
  }
  /** 更新滚动位置 */
  updateScroll() {
    const e = this.hideable.querySelector(".orca-block-editor") ?? this.hideable;
    this.scrollY = e.scrollTop;
  }
  /** 画一个带拖尾的星星 */
  drawStreakStar(e, t, o, n, s, f, h, y, d) {
    if (this.ctx) {
      if (n > 0.5) {
        const b = e - Math.cos(o) * n, M = t - Math.sin(o) * n;
        this.ctx.beginPath(), this.ctx.moveTo(b, M), this.ctx.lineTo(e, t), this.ctx.strokeStyle = `rgba(${h},${y},${d},${f * 0.5})`, this.ctx.lineWidth = Math.max(0.5, s * 0.7), this.ctx.stroke();
      }
      this.ctx.beginPath(), this.ctx.arc(e, t, s, 0, Math.PI * 2), this.ctx.fillStyle = `rgba(255,255,255,${f})`, this.ctx.fill();
    }
  }
  /** 调试模式：画一颗亮红色圆点 + 方向线 */
  drawDebugDot(e, t, o) {
    if (o.beginPath(), o.arc(e.x, e.y, 3, 0, Math.PI * 2), o.fillStyle = "#ff0000", o.fill(), t) {
      const n = e.warpSpeed * 10;
      o.beginPath(), o.moveTo(e.x, e.y), o.lineTo(
        e.x + Math.cos(e.warpAngle) * n,
        e.y + Math.sin(e.warpAngle) * n
      ), o.strokeStyle = "rgba(255, 0, 0, 0.6)", o.lineWidth = 1, o.stroke();
    }
  }
  // ════════════════════════════════════════════════════════
  // [P1-Q03] draw() 重构：四个状态分支提取为独立方法
  // ════════════════════════════════════════════════════════
  /**
   * 正常状态：引力 + 闪烁 + 视差
   * [P0-P03] 正常状态不使用 shadowBlur，改用双圈伪光晕模拟柔光效果
   */
  drawNormal(e, t, o, n, s, f) {
    if (o) {
      const h = e.x - n, y = e.y - s, d = Math.sqrt(h * h + y * y), b = d < k ? 1 - d / k : 0, M = Math.sin(f * 1e-3 * e.twinkleSpeed + e.twinkleOffset) * 0.5 + 0.5;
      if (d < k && d > 0) {
        const a = b * le, p = e.ox - h / d * a, l = e.oy - y / d * a;
        e.x += (p - e.x) * $, e.y += (l - e.y) * $;
      } else
        e.x += (e.ox - e.x) * $, e.y += (e.oy - e.y) * $;
      if (e.y < -2 || e.y > this.canvasH + 2) return !1;
      if (S)
        this.drawDebugDot(e, !1, t);
      else {
        let a = e.baseAlpha;
        a += b * 0.9, a += M * 0.25 * b, a = Math.min(1, a), t.beginPath(), t.arc(e.x, e.y, e.size * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${a * 0.12})`, t.fill(), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${a})`, t.fill();
      }
    } else {
      if (e.x += (e.ox - e.x) * $, e.y += (e.oy - e.y) * $, e.y < -2 || e.y > this.canvasH + 2) return !1;
      S ? this.drawDebugDot(e, !1, t) : (t.beginPath(), t.arc(e.x, e.y, e.size * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${e.baseAlpha * 0.12})`, t.fill(), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${e.baseAlpha})`, t.fill());
    }
    return !0;
  }
  /** 加速期：速度/拖尾/亮度从0渐增 */
  drawRamp(e, t, o, n, s, f, h, y) {
    if (e.warpStreak) {
      const d = Math.sqrt(
        (e.x - n) * (e.x - n) + (e.y - s) * (e.y - s)
      ), b = Math.min(1, d / f), M = 5 - 4 * b, a = Math.pow(o, M), p = e.warpSpeed * a;
      if (e.x += Math.cos(e.warpAngle) * p, e.y += Math.sin(e.warpAngle) * p, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > y + 50)
        return this.resetAsCenterStar(e), !1;
      if (S)
        this.drawDebugDot(e, !0, t);
      else {
        const l = 1 + (K - 1) * a * b, m = e.size * l, g = I * a;
        let w = e.baseAlpha + g;
        w = Math.min(1, w);
        const u = p * 6;
        this.drawStreakStar(e.x, e.y, e.warpAngle, u, m, w, e.colorR, e.colorG, e.colorB);
      }
    } else {
      const d = Math.sqrt(
        (e.x - n) * (e.x - n) + (e.y - s) * (e.y - s)
      ), M = 5 - 4 * Math.min(1, d / f), a = Math.pow(o, M), p = e.warpSpeed * re * a;
      if (e.x += Math.cos(e.warpAngle) * p, e.y += Math.sin(e.warpAngle) * p, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > y + 50)
        return this.resetAsCenterStar(e), !1;
      if (S)
        this.drawDebugDot(e, !1, t);
      else {
        let l = e.baseAlpha + I * a;
        l = Math.min(1, l), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${l})`, t.fill();
      }
    }
    return !0;
  }
  /** 巡航期：全速→减速停下，拖尾缩短 */
  drawWarp(e, t, o, n, s, f, h, y) {
    if (e.warpStreak) {
      const d = e.warpSpeed * (1 - o * o);
      if (e.x += Math.cos(e.warpAngle) * d, e.y += Math.sin(e.warpAngle) * d, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > y + 50)
        return this.resetAsCenterStar(e), !1;
      if (S)
        this.drawDebugDot(e, !0, t);
      else {
        const b = Math.sqrt(
          (e.x - n) * (e.x - n) + (e.y - s) * (e.y - s)
        ), M = 1 + (K - 1) * Math.min(1, b / f), a = e.size * M;
        let p = e.baseAlpha + I;
        p = Math.min(1, p);
        const l = d * 6;
        this.drawStreakStar(e.x, e.y, e.warpAngle, l, a, p, e.colorR, e.colorG, e.colorB);
      }
    } else {
      const d = e.warpSpeed * re * (1 - o * o);
      if (e.x += Math.cos(e.warpAngle) * d, e.y += Math.sin(e.warpAngle) * d, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > y + 50)
        return this.resetAsCenterStar(e), !1;
      if (S)
        this.drawDebugDot(e, !1, t);
      else {
        let b = e.baseAlpha + I;
        b = Math.min(1, b), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${b})`, t.fill();
      }
    }
    return !0;
  }
  /** 衰减期：亮度/大小/光晕缓回正常，引力渐入 */
  drawDecay(e, t, o, n, s, f, h, y, d, b) {
    const M = 1 - (1 - o) * (1 - o), a = M;
    if (y && a > 0.01) {
      const p = e.x - d, l = e.y - b, m = Math.sqrt(p * p + l * l), g = m < k ? 1 - m / k : 0;
      if (m < k && m > 0) {
        const w = g * le * a;
        e.x += (e.ox - p / m * w - e.x) * $, e.y += (e.oy - l / m * w - e.y) * $;
      } else
        e.x += (e.ox - e.x) * $ * a, e.y += (e.oy - e.y) * $ * a;
    }
    if (e.y < -2 || e.y > h + 2) return !1;
    if (S)
      this.drawDebugDot(e, !1, t);
    else {
      const p = I * (1 - M);
      let l = e.baseAlpha + p;
      l = Math.min(1, l);
      const m = Math.sqrt(
        (e.x - n) * (e.x - n) + (e.y - s) * (e.y - s)
      ), g = 1 + (K - 1) * (1 - M) * Math.min(1, m / f), w = e.size * g;
      t.beginPath(), t.arc(e.x, e.y, w, 0, Math.PI * 2), t.fillStyle = `rgba(255,255,255,${l})`, t.fill();
    }
    return !0;
  }
  /** 绘制一帧 */
  draw(e, t, o, n) {
    if (!this.ctx) return;
    this.fpsFrameCount++, e - this.fpsLastTime >= 1e3 && (this.fps = this.fpsFrameCount, this.fpsFrameCount = 0, this.fpsLastTime = e);
    const f = (this.scrollY - this.prevScrollY) * Ee;
    this.prevScrollY = this.scrollY;
    const h = this.canvasH * ce, y = -h, d = this.canvasH + h;
    if (this.warpPhase === "normal" || this.warpPhase === "decay")
      for (const r of this.stars)
        r.oy -= f, r.y -= f, r.oy > d ? (r.ox = Math.random() * this.canvasW, r.oy = y - Math.random() * h * 0.5, r.x = r.ox, r.y = r.oy) : r.oy < y && (r.ox = Math.random() * this.canvasW, r.oy = d + Math.random() * h * 0.5, r.x = r.ox, r.y = r.oy);
    this.frameCount++;
    let b = 0, M = 0;
    const a = this.ctx, p = this.canvasW, l = this.canvasH;
    a.clearRect(0, 0, p, l), S && (a.fillStyle = "rgba(255, 255, 0, 0.15)", a.fillRect(0, 0, p, l));
    const m = p / 2, g = l / 2, w = Math.sqrt(p * p + l * l) / 2;
    let u = 0;
    if (this.warpPhase !== "normal") {
      const r = this.warpPhase === "ramp" ? Pe : this.warpPhase === "warp" ? this.cruiseDuration : Ae;
      u = Math.max(0, Math.min(1, (e - this.phaseStart) / r)), u >= 1 && (this.warpPhase === "ramp" ? (this.warpPhase = "warp", this.phaseStart = e, u = 0, v("draw: ramp→warp")) : this.warpPhase === "warp" ? (this.warpPhase = "decay", this.phaseStart = e, u = 0, v("draw: warp→decay")) : this.warpPhase === "decay" && (this.warpPhase = "normal", u = 0, v("draw: decay→normal")));
    }
    const F = this.warpPhase !== "normal", T = this.fps === 0 || this.fps >= Te, R = F && T;
    if (S)
      a.shadowBlur = 0;
    else if (R)
      switch (this.warpPhase) {
        case "ramp":
          a.shadowBlur = 4 + 4 * u * u;
          break;
        case "warp":
          a.shadowBlur = 8;
          break;
        case "decay":
          a.shadowBlur = 4 + 4 * (1 - u);
          break;
        default:
          a.shadowBlur = 0;
          break;
      }
    else
      a.shadowBlur = 0;
    if (S && this.warpPhase === "ramp" && u < 0.05) {
      const r = this.stars.slice(0, 5).map((x) => `(${x.x.toFixed(0)},${x.y.toFixed(0)})`).join(" ");
      v(`ramp-early: p=${u.toFixed(3)}, 星星样本 = ${r}`);
    }
    for (let r = this.stars.length - 1; r >= 0; r--) {
      const x = this.stars[r], pe = x.colorR, me = x.colorG, ye = x.colorB;
      switch (R && (a.shadowColor = `rgba(${pe}, ${me}, ${ye}, 0.8)`), this.warpPhase) {
        case "normal": {
          if (!this.drawNormal(x, a, t, o, n, e)) continue;
          break;
        }
        case "ramp": {
          if (!this.drawRamp(x, a, u, m, g, w, p, l)) continue;
          break;
        }
        case "warp": {
          if (!this.drawWarp(x, a, u, m, g, w, p, l)) continue;
          break;
        }
        case "decay": {
          if (!this.drawDecay(x, a, u, m, g, w, l, t, o, n)) continue;
          break;
        }
      }
    }
    if (this.warpPhase !== "normal")
      for (const r of this.stars)
        r.ox = r.x, r.oy = r.y;
    let H = 0, U = 0, W = 0, q = 0;
    if (S) {
      H = 1 / 0, U = -1 / 0, W = 1 / 0, q = -1 / 0;
      for (const r of this.stars)
        r.x < H && (H = r.x), r.x > U && (U = r.x), r.y < W && (W = r.y), r.y > q && (q = r.y), r.x >= 0 && r.x <= p && r.y >= 0 && r.y <= l && b++;
    }
    if (S) {
      a.shadowBlur = 0;
      const r = this.hideable.querySelectorAll(".orca-startrek-starfield").length;
      a.fillStyle = "#ff0000", a.font = "bold 14px monospace", a.textBaseline = "top", a.fillText(`phase: ${this.warpPhase} | fps: ${this.fps}`, 10, 10), a.fillText(`stars: ${this.stars.length} | inCanvas: ${b} | offCanvas: ${M}`, 10, 30), a.fillText(`canvas: ${p}x${l} | canvases: ${r}`, 10, 50), r > 1 && a.fillText(`⚠ 检测到 ${r} 个 canvas！`, 10, 70);
    }
    if (a.shadowBlur = 0, S) {
      const r = this.warpPhase !== "normal" ? 1 : 60;
      this.frameCount % r === 0 && v(`tick: phase=${this.warpPhase}, stars=${this.stars.length}, inCanvas=${b}, x=[${H.toFixed(0)},${U.toFixed(0)}] y=[${W.toFixed(0)},${q.toFixed(0)}], canvas=${p}x${l}`);
    }
  }
  /** 销毁实例 */
  destroy() {
    this.canvas.remove(), this.ctx = null, this.stars = [];
  }
}
function ke() {
  const c = window.__startrek_cleanup;
  c && (v("startStarfield: 清理上一套残留实例"), c());
  let e = 0, t = -999, o = -999, n = null;
  const s = /* @__PURE__ */ new Map();
  Se();
  const f = () => {
    const l = document.querySelectorAll(
      ".orca-hideable:not(.orca-hideable-hidden):not(.orca-memoizedviews-active)"
    );
    for (const m of l) {
      const g = m;
      s.has(g) || s.set(g, new Ce(g));
    }
    for (const [m, g] of s)
      (!document.body.contains(m) || m.classList.contains("orca-hideable-hidden") || m.classList.contains("orca-memoizedviews-active")) && (g.destroy(), s.delete(m));
  }, h = (l) => {
    for (const [m, g] of s) {
      if (m.classList.contains("orca-hideable-hidden") || m.classList.contains("orca-memoizedviews-active") || !document.body.contains(m)) {
        g.destroy(), s.delete(m);
        continue;
      }
      g.resize(), g.updateScroll();
      const w = g.hideable === n, u = w ? t : -999, F = w ? o : -999;
      g.draw(l, w, u, F);
    }
    e = requestAnimationFrame(h);
  };
  let y = 0;
  const d = (l) => {
    var w;
    const m = performance.now();
    if (m - y < _e) {
      if (n && s.has(n)) {
        const u = n.getBoundingClientRect();
        t = l.clientX - u.left, o = l.clientY - u.top;
      }
      return;
    }
    y = m;
    const g = document.elementFromPoint(l.clientX, l.clientY);
    if (g) {
      const u = (w = g.closest) == null ? void 0 : w.call(g, ".orca-hideable");
      if (u && s.has(u)) {
        n = u;
        const F = u.getBoundingClientRect();
        t = l.clientX - F.left, o = l.clientY - F.top;
      } else
        n = null, t = -999, o = -999;
    }
  }, b = () => {
    n = null, t = -999, o = -999;
  };
  document.addEventListener("pointermove", d), document.addEventListener("pointerleave", b);
  const M = new MutationObserver((l) => {
    var m, g;
    for (const w of l) {
      if (w.type !== "attributes") continue;
      const u = w.target;
      if (w.attributeName === "class" && u.classList.contains("orca-repr-task-content") && u.classList.contains("orca-repr-task-1") && !u.classList.contains("orca-repr-task-0")) {
        const F = u.closest(".orca-hideable");
        if (F) {
          const T = s.get(F);
          T && T.triggerWarp();
        }
      }
      if (w.attributeName === "data-status" && ((m = u.dataset) == null ? void 0 : m.name) === "task" && ((g = u.dataset) == null ? void 0 : g.status) === "Done") {
        if (!u.closest(".orca-repr-main-content")) continue;
        const T = u.closest(".orca-hideable");
        if (T) {
          const R = s.get(T);
          R && (v("bigTaskObserver: 大任务完成，触发 5 秒跃迁"), R.triggerWarp(4100));
        }
      }
    }
  });
  M.observe(document.body, {
    attributes: !0,
    subtree: !0,
    attributeFilter: ["class", "data-status"]
  });
  const a = new MutationObserver(() => {
    f();
  });
  a.observe(document.body, {
    childList: !0,
    subtree: !0
  }), f(), setTimeout(f, 500), setTimeout(f, 2e3), e = requestAnimationFrame(h);
  const p = () => {
    cancelAnimationFrame(e), document.removeEventListener("pointermove", d), document.removeEventListener("pointerleave", b), a.disconnect(), M.disconnect();
    for (const [, l] of s)
      l.destroy();
    s.clear(), document.querySelectorAll(".orca-startrek-starfield").forEach((l) => l.remove()), Reflect.deleteProperty(window, "__startrek_cleanup");
  };
  return window.__startrek_cleanup = p, p;
}
const E = "oh-StarTrek", Z = 55, J = 54, Q = "Noto Serif SC", he = '"Noto Serif", "Noto Serif SC", "Source Han Serif SC", Georgia, "STSong", "SimSun", serif', Re = 200, Ie = 500, Le = 150, De = 0.15, Ne = 400, Oe = 1500, Be = 200, He = 0.6, fe = 'link[rel="stylesheet"][href*="startrek"]', i = {
  pluginName: "",
  debugMode: !1,
  fullMode: !0,
  serifFontMode: !1,
  queryFontUnifyMode: !1,
  currentThemeName: null,
  originalEditorFont: null,
  originalUIFont: null
}, A = (...c) => {
  i.debugMode && console.log("[oh-StarTrek]", ...c);
};
let z = null, Y = null, N = null, X = null, _ = null, O = null, B = null;
function Ue() {
  const c = (t = document) => {
    t.querySelectorAll(".orca-select-menu .orca-select-item-label").forEach((o) => {
      var s;
      const n = (s = o.textContent) == null ? void 0 : s.trim();
      n && (o.dataset.fontPreview || n !== "默认" && (o.style.fontFamily = `"${n}", sans-serif`, o.dataset.fontPreview = n));
    });
  };
  setTimeout(() => c(), 2e3);
  const e = new MutationObserver((t) => {
    for (const o of t)
      if (o.type === "childList" && o.addedNodes.length > 0)
        for (const n of o.addedNodes)
          n instanceof Element && c(n);
  });
  return e.observe(document.body, { childList: !0, subtree: !0 }), e;
}
function We() {
  const c = (e) => {
    const t = e.closest(".orca-input");
    if (!t) return;
    const o = t.offsetWidth, n = Math.max(Re, Math.min(Ie, Le + o * De));
    t.style.setProperty("--milk-input-spread-dur", `${n}ms`);
  };
  O = (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const t = e.target.closest(".orca-input");
    t && (c(e.target), t.style.setProperty("--milk-input-spread", "1"));
  }, B = (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const t = e.target.closest(".orca-input");
    t && t.style.removeProperty("--milk-input-spread");
  }, document.addEventListener("focusin", O, !0), document.addEventListener("focusout", B, !0);
}
function qe() {
  const c = (t) => {
    const o = t.offsetHeight, n = Math.max(Ne, Math.min(Oe, Be + o * He));
    t.style.setProperty("--milk-scope-spread-dur", `${n}ms`);
  };
  document.addEventListener(
    "mouseenter",
    (t) => {
      var n, s;
      if (!(t.target instanceof HTMLElement)) return;
      const o = (s = (n = t.target).closest) == null ? void 0 : s.call(n, ".orca-repr-scope-line");
      o && c(o);
    },
    !0
  );
  const e = new MutationObserver((t) => {
    for (const o of t)
      if (o.type === "attributes" && o.attributeName === "class") {
        const n = o.target;
        if (n.classList.contains("orca-active-parent")) {
          const s = n.querySelector(".orca-repr-scope-line");
          s && c(s);
        }
      }
  });
  e.observe(document.body, { attributes: !0, subtree: !0, attributeFilter: ["class"] }), Y = e;
}
function ee() {
  A(`applyStarfield: currentThemeName="${i.currentThemeName}", THEME_NAME="${E}", fullMode=${i.fullMode}`), _ && (_(), _ = null), i.currentThemeName === E && i.fullMode ? (_ = ke(), A("星空已启动")) : A(`星空未启动（${i.currentThemeName !== E ? "主题不匹配" : "满血模式关闭"}）`);
}
function te() {
  i.originalEditorFont === null && (i.originalEditorFont = orca.state.settings[Z]), i.originalUIFont === null && (i.originalUIFont = orca.state.settings[J]), orca.state.settings[Z] = Q, orca.state.settings[J] = Q, document.documentElement.style.setProperty("--orca-fontfamily-editor", he), document.documentElement.style.setProperty("--orca-fontfamily-ui", he), A(`已设置字体为 ${Q}（设置值 + CSS 变量）`);
}
function ne() {
  i.originalEditorFont !== null && (orca.state.settings[Z] = i.originalEditorFont), i.originalUIFont !== null && (orca.state.settings[J] = i.originalUIFont), document.documentElement.style.removeProperty("--orca-fontfamily-editor"), document.documentElement.style.removeProperty("--orca-fontfamily-ui"), i.originalEditorFont = null, i.originalUIFont = null, A("已恢复用户原始字体设置");
}
const ue = "startrek-query-font-unified";
function oe() {
  document.documentElement.classList.add(ue), A("已开启查询字体统一化");
}
function se() {
  document.documentElement.classList.remove(ue), A("已关闭查询字体统一化");
}
const ze = () => {
  const c = !!document.querySelector(fe), e = c ? E : "";
  e !== i.currentThemeName && (i.currentThemeName = e, A(`主题变更检测: startrek CSS ${c ? "已加载" : "未加载"}`), c && i.serifFontMode && te(), !c && i.serifFontMode && i.originalEditorFont !== null && ne(), c && i.queryFontUnifyMode ? oe() : c || se(), ee());
};
async function Xe(c) {
  i.pluginName = c, orca.state.locale, await orca.plugins.setSettingsSchema(i.pluginName, {
    fullMode: {
      label: "跃迁引擎",
      description: "电脑太卡！关闭跃迁引擎！(ಥ_ಥ)",
      type: "boolean",
      defaultValue: !0
    },
    serifFontMode: {
      label: "加载主题时使用推荐字体",
      description: "启用后，切换到本主题时自动将编辑器与 UI 字体设为衬线体（Noto Serif SC）；关闭则恢复原生逻辑",
      type: "boolean",
      defaultValue: !1
    },
    queryFontUnifyMode: {
      label: "查询字体统一化",
      description: "启用后，查询结果（卡片/表格/列表）中的标题块字体与文本块保持一致",
      type: "boolean",
      defaultValue: !1
    },
    debugMode: {
      label: "调试模式",
      type: "boolean",
      defaultValue: !1
    }
  });
  const e = () => {
    var d;
    const n = (d = orca.state.plugins[i.pluginName]) == null ? void 0 : d.settings, s = !!(n != null && n.debugMode), f = (n == null ? void 0 : n.fullMode) !== !1, h = !!(n != null && n.serifFontMode), y = !!(n != null && n.queryFontUnifyMode);
    i.debugMode = s, we(i.debugMode), h !== i.serifFontMode && (i.serifFontMode = h, i.serifFontMode && i.currentThemeName === E && te(), !i.serifFontMode && i.originalEditorFont !== null && ne()), y !== i.queryFontUnifyMode && (i.queryFontUnifyMode = y, i.queryFontUnifyMode && i.currentThemeName === E ? oe() : i.queryFontUnifyMode || se()), f !== i.fullMode ? (i.fullMode = f, ee()) : i.fullMode = f;
  };
  e();
  const { subscribe: t } = window.Valtio;
  X = t(orca.state.plugins, () => {
    e();
  }), orca.themes.register(i.pluginName, E, "themes/startrek.css"), z = Ue(), qe(), We(), N = new MutationObserver(() => {
    ze();
  }), N.observe(document.head, { childList: !0, subtree: !1 }), document.querySelector(fe) ? (i.currentThemeName = E, A("检测到 startrek CSS 已加载，当前主题即为目标主题"), i.serifFontMode && te(), i.queryFontUnifyMode && oe()) : i.currentThemeName = "", ee(), A(`${i.pluginName} loaded.`);
}
async function Ge() {
  orca.themes.unregister(E), i.originalEditorFont !== null && ne(), se(), z && (z.disconnect(), z = null), Y && (Y.disconnect(), Y = null), O && (document.removeEventListener("focusin", O, !0), O = null), B && (document.removeEventListener("focusout", B, !0), B = null), N && (N.disconnect(), N = null), X && (X(), X = null), _ && (_(), _ = null), A(`${i.pluginName} unloaded.`);
}
export {
  Xe as load,
  Ge as unload
};
