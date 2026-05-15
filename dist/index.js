var Ae = Object.defineProperty;
var Ee = (l, e, t) => e in l ? Ae(l, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : l[e] = t;
var E = (l, e, t) => Ee(l, typeof e != "symbol" ? e + "" : e, t);
let R = !1;
const F = (...l) => {
  R && console.log("[oh-StarTrek]", ...l);
};
function $e(l) {
  R = l, l && F("调试模式已开启");
}
const Te = "#12c2e9", Re = "#e98812", pe = (l) => {
  const e = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(l);
  return e ? {
    r: parseInt(e[1], 16),
    g: parseInt(e[2], 16),
    b: parseInt(e[3], 16)
  } : (R && console.warn("[oh-StarTrek] hexToRgb 解析失败:", l, "，使用 fallback"), { r: 18, g: 194, b: 233 });
};
let z = { r: 18, g: 194, b: 233 }, G = { r: 233, g: 136, b: 18 };
function Ce() {
  try {
    const l = getComputedStyle(document.documentElement), e = l.getPropertyValue("--milk-slate").trim() || Te, t = l.getPropertyValue("--milk-orange").trim() || Re;
    z = pe(e), G = pe(t), F(`initColors: cyan=rgb(${z.r},${z.g},${z.b}), orange=rgb(${G.r},${G.g},${G.b})`);
  } catch {
    F("initColors failed, using defaults");
  }
}
const _e = 0.6, me = () => Math.random() < _e ? z : G, Le = 400, ye = 1600, ke = 500, U = 4, oe = 36, D = 1, X = 2, ge = 0.07, N = 250, Ie = 1 / 12e3, De = 30, Ne = 300, be = 8, L = 0.1, Oe = 0.15, we = 0.25, We = 0.08, Be = 0.04, Ue = 8, He = 0.03, Me = 0.1, qe = 30, H = {
  full: { maxFps: 120, densityMultiplier: 1, label: "满功率" },
  cruise: { maxFps: 60, densityMultiplier: 0.8, label: "巡航功率" },
  standby: { maxFps: 30, densityMultiplier: 0.6, label: "待机功率" }
};
let j = "full";
function Xe(l) {
  l !== j && (j = l, F(`引擎功率切换: ${H[l].label} (fps上限=${H[l].maxFps}, 密度×${H[l].densityMultiplier})`), se = !0);
}
let se = !1;
const ze = 16;
class Ge {
  // 巡航时长（大任务可延长）
  constructor(e) {
    E(this, "canvas");
    E(this, "ctx", null);
    E(this, "hideable");
    E(this, "stars", []);
    E(this, "canvasW", 0);
    E(this, "canvasH", 0);
    E(this, "scrollY", 0);
    E(this, "prevScrollY", 0);
    E(this, "frameCount", 0);
    // FPS 跟踪
    E(this, "fps", 0);
    E(this, "fpsFrameCount", 0);
    E(this, "fpsLastTime", 0);
    // 手柄引力缓存：每帧开始时计算一次
    E(this, "handleGravityX", []);
    // 手柄指示线在 hideable 中的 x 坐标
    E(this, "handleDragging", !1);
    // 是否有手柄正在拖拽
    // 跃迁状态
    E(this, "warpPhase", "normal");
    E(this, "phaseStart", 0);
    E(this, "cruiseDuration", ye);
    this.hideable = e;
    const t = e.querySelectorAll(".orca-startrek-starfield");
    t.length > 0 && (F(`constructor: 清除 ${t.length} 个残留 canvas`), t.forEach((o) => o.remove())), this.canvas = document.createElement("canvas"), this.canvas.className = "orca-startrek-starfield", this.canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;", e.appendChild(this.canvas), this.resize();
  }
  /** 原地覆写：将星星重置为从圆边缘出发（跃迁回收用，零 GC） */
  resetAsCenterStar(e) {
    const t = this.canvasW / 2, o = this.canvasH / 2, n = Math.min(this.canvasW, this.canvasH) * (0.05 + Math.random() * 0.35), f = Math.random() * Math.PI * 2, h = t + Math.cos(f) * n, d = o + Math.sin(f) * n, p = Math.atan2(d - o, h - t), g = Math.sqrt(t * t + o * o), w = Math.min(1, n / g), b = me();
    e.ox = h, e.oy = d, e.x = h, e.y = d, e.vx = 0, e.prevX = h, e.morphicPhase = "idle", e.morphicPeak = 0, e.size = 0.3 + Math.random() * 0.8, e.baseAlpha = 0.15 + Math.random() * 0.25, e.twinkleSpeed = 0.5 + Math.random() * 2, e.twinkleOffset = Math.random() * Math.PI * 2, e.warpAngle = p, e.warpSpeed = U + (oe - U) * w, e.warpBornInWarp = !0, e.warpStreak = Math.random() < 0.5, e.colorR = b.r, e.colorG = b.g, e.colorB = b.b;
  }
  /** 创建一颗随机位置的常驻星星 */
  makeStar(e, t) {
    const o = Math.random() * this.canvasW, s = e + Math.random() * (t - e), n = me();
    return {
      ox: o,
      oy: s,
      x: o,
      y: s,
      vx: 0,
      prevX: o,
      morphicPhase: "idle",
      morphicPeak: 0,
      size: 0.3 + Math.random() * 0.8,
      baseAlpha: 0.15 + Math.random() * 0.25,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinkleOffset: Math.random() * Math.PI * 2,
      warpAngle: 0,
      warpSpeed: 0,
      warpBornInWarp: !1,
      warpStreak: !1,
      colorR: n.r,
      colorG: n.g,
      colorB: n.b
    };
  }
  /** 初始化星点 — 在画布 + 出血区范围内均匀分布
   *  密度倍率由引擎功率档位控制 */
  generateStars() {
    this.stars = [];
    const e = this.canvasH * Me, t = this.canvasH + e * 2, o = this.canvasW * t, s = H[j].densityMultiplier, n = Math.max(
      De,
      Math.min(Ne, Math.round(o * Ie * s))
    );
    for (let f = 0; f < n; f++)
      this.stars.push(this.makeStar(-e, this.canvasH + e));
  }
  /** 触发跃迁：进入加速期；warp 期间可重置巡航计时器
   *  @param cruiseDuration 巡航时长（ms），默认 CRUISE_DURATION
   */
  triggerWarp(e = ye) {
    if (F(`triggerWarp: phase=${this.warpPhase}, stars=${this.stars.length}, cruise=${e}ms`), this.warpPhase === "ramp" || this.warpPhase === "decay") return;
    if (this.warpPhase === "warp") {
      this.phaseStart = performance.now(), F("triggerWarp: warp重置");
      return;
    }
    this.warpPhase = "ramp", this.phaseStart = performance.now(), this.cruiseDuration = e;
    const t = this.canvasW / 2, o = this.canvasH / 2, s = Math.sqrt(t * t + o * o);
    for (const n of this.stars) {
      const f = n.x - t, h = n.y - o, d = Math.sqrt(f * f + h * h);
      n.warpAngle = Math.atan2(h, f);
      const p = Math.min(1, d / s);
      n.warpSpeed = U + (oe - U) * p, n.warpBornInWarp = !1, n.warpStreak = Math.random() < 0.5;
    }
    if (R) {
      const n = this.stars.slice(0, 5).map((f) => `(${f.x.toFixed(0)},${f.y.toFixed(0)})`).join(" ");
      F(`triggerWarp: 星星样本 = ${n}`);
    }
    F(`triggerWarp: 进入ramp, 星星数=${this.stars.length}`);
  }
  /** 调整 canvas 尺寸（容差 2px，防止 1px 抖动反复重建星星） */
  resize() {
    const e = this.hideable.clientWidth, t = this.hideable.clientHeight;
    if (e === 0 || t === 0) return;
    const o = Math.abs(e - this.canvasW), s = Math.abs(t - this.canvasH);
    if ((o >= 2 || s >= 2) && (F(`resize: ${this.canvasW}x${this.canvasH} → ${e}x${t} (dw=${o}, dh=${s})`), this.canvasW = e, this.canvasH = t, this.canvas.width = e, this.canvas.height = t, this.ctx = this.canvas.getContext("2d"), this.generateStars(), this.warpPhase !== "normal")) {
      F(`resize: 跃迁中(${this.warpPhase})，重算跃迁方向`);
      const n = e / 2, f = t / 2;
      for (const h of this.stars) {
        const d = h.x - n, p = h.y - f;
        h.warpAngle = Math.atan2(p, d), h.warpSpeed = U + Math.random() * (oe - U), h.warpBornInWarp = !1;
      }
    }
  }
  /** 更新滚动位置 */
  updateScroll() {
    const e = this.hideable.querySelector(".orca-block-editor") ?? this.hideable;
    this.scrollY = e.scrollTop;
  }
  /** 画一个带拖尾的星星 */
  drawStreakStar(e, t, o, s, n, f, h, d, p) {
    if (this.ctx) {
      if (s > 0.5) {
        const g = e - Math.cos(o) * s, w = t - Math.sin(o) * s;
        this.ctx.beginPath(), this.ctx.moveTo(g, w), this.ctx.lineTo(e, t), this.ctx.strokeStyle = `rgba(${h},${d},${p},${f * 0.5})`, this.ctx.lineWidth = Math.max(0.5, n * 0.7), this.ctx.stroke();
      }
      this.ctx.beginPath(), this.ctx.arc(e, t, n, 0, Math.PI * 2), this.ctx.fillStyle = `rgba(255,255,255,${f})`, this.ctx.fill();
    }
  }
  /** 调试模式：画一颗亮红色圆点 + 方向线 */
  drawDebugDot(e, t, o) {
    if (o.beginPath(), o.arc(e.x, e.y, 3, 0, Math.PI * 2), o.fillStyle = "#ff0000", o.fill(), t) {
      const s = e.warpSpeed * 10;
      o.beginPath(), o.moveTo(e.x, e.y), o.lineTo(
        e.x + Math.cos(e.warpAngle) * s,
        e.y + Math.sin(e.warpAngle) * s
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
  drawNormal(e, t, o, s, n, f) {
    if (o) {
      const r = e.x - s, u = e.y - n, m = Math.sqrt(r * r + u * u);
      if (m < N && m > 0) {
        const T = (1 - m / N) * be, v = e.ox - r / m * T, W = e.oy - u / m * T;
        e.x += (v - e.x) * L, e.y += (W - e.y) * L;
      } else
        e.x += (e.ox - e.x) * L, e.y += (e.oy - e.y) * L;
    } else
      e.x += (e.ox - e.x) * L, e.y += (e.oy - e.y) * L;
    const h = this.canvasW * we;
    if (this.handleGravityX.length > 0) {
      for (const r of this.handleGravityX) {
        const u = r - e.x, m = Math.abs(u);
        if (m < h && m > 1) {
          const M = Math.pow(1 - m / h, 1.5);
          e.x += u * M * We;
        }
      }
      e.morphicPhase !== "active" && (e.morphicPhase = "active");
    } else
      e.morphicPhase === "active" && (e.morphicPhase = "decay"), e.morphicPhase === "decay" ? (e.x += (e.ox - e.x) * Be, e.morphicPeak > 0 ? (e.morphicPeak *= 1 - He, e.morphicPeak < 0.01 && (e.morphicPeak = 0, e.morphicPhase = "idle")) : e.morphicPhase = "idle") : e.x += (e.ox - e.x) * L;
    if (e.y < -2 || e.y > this.canvasH + 2) return !1;
    let d = 0;
    if (e.morphicPhase === "active" && this.handleDragging) {
      const r = this.canvasW * we;
      for (const u of this.handleGravityX) {
        const m = Math.abs(e.ox - u);
        m < r && (d = Math.max(d, Math.pow(1 - m / r, 1.5)));
      }
      e.morphicPeak = d;
    } else e.morphicPhase === "decay" && (d = e.morphicPeak);
    const p = e.x - e.prevX;
    e.prevX = e.x;
    const g = Math.abs(p) * Ue;
    if (g > 0.5) {
      const r = p > 0 ? 0 : Math.PI, u = 1 + (X - 1) * d, m = e.size * u;
      let M = e.baseAlpha + D * d;
      return M = Math.min(1, M), this.drawStreakStar(e.x, e.y, r, g, m, M, e.colorR, e.colorG, e.colorB), !0;
    }
    const w = 1 + (X - 1) * d, b = e.size * w, c = D * d;
    if (R)
      return this.drawDebugDot(e, !1, t), !0;
    if (o) {
      const r = e.x - s, u = e.y - n, m = Math.sqrt(r * r + u * u), M = m < N ? 1 - m / N : 0, T = Math.sin(f * 1e-3 * e.twinkleSpeed + e.twinkleOffset) * 0.5 + 0.5;
      let v = e.baseAlpha;
      v += M * 0.9, v += T * 0.25 * M, v += c, v = Math.min(1, v), t.beginPath(), t.arc(e.x, e.y, b * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${v * 0.12})`, t.fill(), t.beginPath(), t.arc(e.x, e.y, b, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${v})`, t.fill();
    } else {
      let r = e.baseAlpha + c;
      r = Math.min(1, r), t.beginPath(), t.arc(e.x, e.y, b * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${r * 0.12})`, t.fill(), t.beginPath(), t.arc(e.x, e.y, b, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${r})`, t.fill();
    }
    return !0;
  }
  /** 加速期：速度/拖尾/亮度从0渐增 */
  drawRamp(e, t, o, s, n, f, h, d) {
    if (e.warpStreak) {
      const p = Math.sqrt(
        (e.x - s) * (e.x - s) + (e.y - n) * (e.y - n)
      ), g = Math.min(1, p / f), w = 5 - 4 * g, b = Math.pow(o, w), c = e.warpSpeed * b;
      if (e.x += Math.cos(e.warpAngle) * c, e.y += Math.sin(e.warpAngle) * c, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if (R)
        this.drawDebugDot(e, !0, t);
      else {
        const r = 1 + (X - 1) * b * g, u = e.size * r, m = D * b;
        let M = e.baseAlpha + m;
        M = Math.min(1, M);
        const T = c * 6;
        this.drawStreakStar(e.x, e.y, e.warpAngle, T, u, M, e.colorR, e.colorG, e.colorB);
      }
    } else {
      const p = Math.sqrt(
        (e.x - s) * (e.x - s) + (e.y - n) * (e.y - n)
      ), w = 5 - 4 * Math.min(1, p / f), b = Math.pow(o, w), c = e.warpSpeed * ge * b;
      if (e.x += Math.cos(e.warpAngle) * c, e.y += Math.sin(e.warpAngle) * c, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if (R)
        this.drawDebugDot(e, !1, t);
      else {
        let r = e.baseAlpha + D * b;
        r = Math.min(1, r), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${r})`, t.fill();
      }
    }
    return !0;
  }
  /** 巡航期：全速→减速停下，拖尾缩短 */
  drawWarp(e, t, o, s, n, f, h, d) {
    if (e.warpStreak) {
      const p = e.warpSpeed * (1 - o * o);
      if (e.x += Math.cos(e.warpAngle) * p, e.y += Math.sin(e.warpAngle) * p, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if (R)
        this.drawDebugDot(e, !0, t);
      else {
        const g = Math.sqrt(
          (e.x - s) * (e.x - s) + (e.y - n) * (e.y - n)
        ), w = 1 + (X - 1) * Math.min(1, g / f), b = e.size * w;
        let c = e.baseAlpha + D;
        c = Math.min(1, c);
        const r = p * 6;
        this.drawStreakStar(e.x, e.y, e.warpAngle, r, b, c, e.colorR, e.colorG, e.colorB);
      }
    } else {
      const p = e.warpSpeed * ge * (1 - o * o);
      if (e.x += Math.cos(e.warpAngle) * p, e.y += Math.sin(e.warpAngle) * p, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if (R)
        this.drawDebugDot(e, !1, t);
      else {
        let g = e.baseAlpha + D;
        g = Math.min(1, g), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${g})`, t.fill();
      }
    }
    return !0;
  }
  /** 衰减期：亮度/大小/光晕缓回正常，引力渐入
   *  @todo [W-01 技术债务] 无鼠标时星星缺少缓动回归原位的 else 分支，
   *  对比 drawNormal 有对应逻辑。当前 decay 持续约 500ms，影响轻微，后续补 3 行 else 即可 */
  drawDecay(e, t, o, s, n, f, h, d, p, g) {
    const w = 1 - (1 - o) * (1 - o), b = w;
    if (d && b > 0.01) {
      const c = e.x - p, r = e.y - g, u = Math.sqrt(c * c + r * r), m = u < N ? 1 - u / N : 0;
      if (u < N && u > 0) {
        const M = m * be * b;
        e.x += (e.ox - c / u * M - e.x) * L, e.y += (e.oy - r / u * M - e.y) * L;
      } else
        e.x += (e.ox - e.x) * L * b, e.y += (e.oy - e.y) * L * b;
    }
    if (e.y < -2 || e.y > h + 2) return !1;
    if (R)
      this.drawDebugDot(e, !1, t);
    else {
      const c = D * (1 - w);
      let r = e.baseAlpha + c;
      r = Math.min(1, r);
      const u = Math.sqrt(
        (e.x - s) * (e.x - s) + (e.y - n) * (e.y - n)
      ), m = 1 + (X - 1) * (1 - w) * Math.min(1, u / f), M = e.size * m;
      t.beginPath(), t.arc(e.x, e.y, M, 0, Math.PI * 2), t.fillStyle = `rgba(255,255,255,${r})`, t.fill();
      const T = r * 0.12 * (1 - w);
      T > 0.01 && (t.beginPath(), t.arc(e.x, e.y, M * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${T})`, t.fill());
    }
    return !0;
  }
  /** 绘制一帧 */
  draw(e, t, o, s) {
    if (!this.ctx) return;
    this.fpsFrameCount++, e - this.fpsLastTime >= 1e3 && (this.fps = this.fpsFrameCount, this.fpsFrameCount = 0, this.fpsLastTime = e), this.handleGravityX = [], this.handleDragging = !1;
    const n = this.hideable.querySelector(".orca-lcars-width-handle.dragging");
    if (n) {
      this.handleDragging = !0;
      const i = this.hideable.getBoundingClientRect(), A = n.getBoundingClientRect(), q = A.left + A.width / 2 - i.left;
      this.handleGravityX.push(q);
      const Z = n.closest(".orca-block-editor");
      if (Z) {
        const ne = Z.querySelectorAll(".orca-lcars-width-handle");
        for (const B of ne)
          if (!B.classList.contains("dragging")) {
            const fe = B.getBoundingClientRect();
            this.handleGravityX.push(fe.left + fe.width / 2 - i.left);
          }
      }
    }
    const h = (this.scrollY - this.prevScrollY) * Oe;
    this.prevScrollY = this.scrollY;
    const d = this.canvasH * Me, p = -d, g = this.canvasH + d;
    if (this.warpPhase === "normal" || this.warpPhase === "decay")
      for (const i of this.stars)
        i.oy -= h, i.y -= h, i.oy > g ? (i.ox = Math.random() * this.canvasW, i.oy = p - Math.random() * d * 0.5, i.x = i.ox, i.y = i.oy, i.prevX = i.x) : i.oy < p && (i.ox = Math.random() * this.canvasW, i.oy = g + Math.random() * d * 0.5, i.x = i.ox, i.y = i.oy, i.prevX = i.x);
    this.frameCount++;
    let w = 0, b = 0;
    const c = this.ctx, r = this.canvasW, u = this.canvasH;
    c.clearRect(0, 0, r, u), R && (c.fillStyle = "rgba(255, 255, 0, 0.15)", c.fillRect(0, 0, r, u));
    const m = r / 2, M = u / 2, T = Math.sqrt(r * r + u * u) / 2;
    let v = 0;
    if (this.warpPhase !== "normal") {
      const i = this.warpPhase === "ramp" ? Le : this.warpPhase === "warp" ? this.cruiseDuration : ke;
      v = Math.max(0, Math.min(1, (e - this.phaseStart) / i)), v >= 1 && (this.warpPhase === "ramp" ? (this.warpPhase = "warp", this.phaseStart = e, v = 0, F("draw: ramp→warp")) : this.warpPhase === "warp" ? (this.warpPhase = "decay", this.phaseStart = e, v = 0, F("draw: warp→decay")) : this.warpPhase === "decay" && (this.warpPhase = "normal", v = 0, F("draw: decay→normal")));
    }
    const W = this.warpPhase !== "normal", S = this.fps === 0 || this.fps >= qe, _ = W && S;
    if (R)
      c.shadowBlur = 0;
    else if (_)
      switch (this.warpPhase) {
        case "ramp":
          c.shadowBlur = 4 + 4 * v * v;
          break;
        case "warp":
          c.shadowBlur = 8;
          break;
        case "decay":
          c.shadowBlur = 4 + 4 * (1 - v);
          break;
        default:
          c.shadowBlur = 0;
          break;
      }
    else
      c.shadowBlur = 0;
    if (R && this.warpPhase === "ramp" && v < 0.05) {
      const i = this.stars.slice(0, 5).map((A) => `(${A.x.toFixed(0)},${A.y.toFixed(0)})`).join(" ");
      F(`ramp-early: p=${v.toFixed(3)}, 星星样本 = ${i}`);
    }
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const A = this.stars[i], q = A.colorR, Z = A.colorG, ne = A.colorB;
      switch (_ && (c.shadowColor = `rgba(${q}, ${Z}, ${ne}, 0.8)`), this.warpPhase) {
        case "normal": {
          if (!this.drawNormal(A, c, t, o, s, e)) continue;
          break;
        }
        case "ramp": {
          if (!this.drawRamp(A, c, v, m, M, T, r, u)) continue;
          break;
        }
        case "warp": {
          if (!this.drawWarp(A, c, v, m, M, T, r, u)) continue;
          break;
        }
        case "decay": {
          if (!this.drawDecay(A, c, v, m, M, T, u, t, o, s)) continue;
          break;
        }
      }
    }
    if (this.warpPhase !== "normal")
      for (const i of this.stars)
        i.ox = i.x, i.oy = i.y, i.prevX = i.x;
    let P = 0, x = 0, y = 0, $ = 0;
    if (R) {
      P = 1 / 0, x = -1 / 0, y = 1 / 0, $ = -1 / 0;
      for (const i of this.stars)
        i.x < P && (P = i.x), i.x > x && (x = i.x), i.y < y && (y = i.y), i.y > $ && ($ = i.y), i.x >= 0 && i.x <= r && i.y >= 0 && i.y <= u ? w++ : b++;
    }
    if (R) {
      c.shadowBlur = 0;
      const i = this.hideable.querySelectorAll(".orca-startrek-starfield").length;
      c.fillStyle = "#ff0000", c.font = "bold 14px monospace", c.textBaseline = "top", c.fillText(`phase: ${this.warpPhase} | fps: ${this.fps} | ${H[j].label}`, 10, 10), c.fillText(`stars: ${this.stars.length} | inCanvas: ${w} | offCanvas: ${b}`, 10, 30), c.fillText(`canvas: ${r}x${u} | canvases: ${i}`, 10, 50), i > 1 && c.fillText(`⚠ 检测到 ${i} 个 canvas！`, 10, 70);
    }
    if (c.shadowBlur = 0, R) {
      const i = this.warpPhase !== "normal" ? 1 : 60;
      this.frameCount % i === 0 && F(`tick: phase=${this.warpPhase}, stars=${this.stars.length}, inCanvas=${w}, x=[${P.toFixed(0)},${x.toFixed(0)}] y=[${y.toFixed(0)},${$.toFixed(0)}], canvas=${r}x${u}`);
    }
  }
  /** 销毁实例 */
  destroy() {
    this.canvas.remove(), this.ctx = null, this.stars = [];
  }
}
function Ye() {
  const l = window.__startrek_cleanup;
  l && (F("startStarfield: 清理上一套残留实例"), l());
  let e = 0, t = -999, o = -999, s = null;
  const n = /* @__PURE__ */ new Map();
  Ce();
  const f = () => {
    const S = document.querySelector(".orca-panels-container");
    if (!S) return;
    const _ = S.querySelectorAll(
      ".orca-hideable:not(.orca-hideable-hidden):not(.orca-memoizedviews-active)"
    );
    for (const P of _) {
      const x = P;
      n.has(x) || n.set(x, new Ge(x));
    }
    for (const [P, x] of n)
      (!document.body.contains(P) || P.classList.contains("orca-hideable-hidden") || P.classList.contains("orca-memoizedviews-active")) && (x.destroy(), n.delete(P));
  };
  let h = 0;
  const d = (S) => {
    const x = 1e3 / (Array.from(n.values()).some((y) => y.warpPhase !== "normal") ? 120 : H[j].maxFps);
    if (S - h < x) {
      e = requestAnimationFrame(d);
      return;
    }
    if (h = S, se) {
      se = !1;
      for (const [, y] of n)
        y.generateStars();
    }
    for (const [y, $] of n) {
      if (y.classList.contains("orca-hideable-hidden") || y.classList.contains("orca-memoizedviews-active") || !document.body.contains(y)) {
        $.destroy(), n.delete(y);
        continue;
      }
      $.resize(), $.updateScroll();
      const i = $.hideable === s, A = i ? t : -999, q = i ? o : -999;
      $.draw(S, i, A, q);
    }
    e = requestAnimationFrame(d);
  };
  let p = 0;
  const g = (S) => {
    var x;
    const _ = performance.now();
    if (_ - p < ze) {
      if (s && n.has(s)) {
        const y = s.getBoundingClientRect();
        t = S.clientX - y.left, o = S.clientY - y.top;
      }
      return;
    }
    p = _;
    const P = document.elementFromPoint(S.clientX, S.clientY);
    if (P) {
      const y = (x = P.closest) == null ? void 0 : x.call(P, ".orca-hideable");
      if (y && n.has(y)) {
        s = y;
        const $ = y.getBoundingClientRect();
        t = S.clientX - $.left, o = S.clientY - $.top;
      } else
        s = null, t = -999, o = -999;
    }
  }, w = () => {
    s = null, t = -999, o = -999;
  };
  document.addEventListener("pointermove", g), document.addEventListener("pointerleave", w);
  const b = new MutationObserver((S) => {
    var _, P;
    for (const x of S) {
      if (x.type !== "attributes") continue;
      const y = x.target;
      if (x.attributeName === "class" && y.classList.contains("orca-repr-task-content") && y.classList.contains("orca-repr-task-1") && !y.classList.contains("orca-repr-task-0")) {
        const $ = y.closest(".orca-hideable");
        if ($) {
          const i = n.get($);
          i && i.triggerWarp();
        }
      }
      if (x.attributeName === "data-status" && ((_ = y.dataset) == null ? void 0 : _.name) === "task" && ((P = y.dataset) == null ? void 0 : P.status) === "Done") {
        if (!y.closest(".orca-repr-main-content")) continue;
        const i = y.closest(".orca-hideable");
        if (i) {
          const A = n.get(i);
          A && (F("bigTaskObserver: 大任务完成，触发 5 秒跃迁"), A.triggerWarp(4100));
        }
      }
    }
  });
  b.observe(document.body, {
    attributes: !0,
    subtree: !0,
    attributeFilter: ["class", "data-status"]
  });
  const c = new MutationObserver(() => {
    f();
  });
  c.observe(document.body, {
    childList: !0,
    subtree: !0
  });
  let r = !1;
  const u = (S) => {
    r || (r = !0, cancelAnimationFrame(e), F(`暂停渲染: ${S}`));
  }, m = (S) => {
    r && (r = !1, h = 0, e = requestAnimationFrame(d), F(`恢复渲染: ${S}`));
  }, M = () => {
    document.hidden ? u("visibilitychange") : m("visibilitychange");
  }, T = () => u("window blur"), v = () => m("window focus");
  document.addEventListener("visibilitychange", M), window.addEventListener("blur", T), window.addEventListener("focus", v), f(), setTimeout(f, 500), setTimeout(f, 2e3), e = requestAnimationFrame(d);
  const W = () => {
    cancelAnimationFrame(e), document.removeEventListener("pointermove", g), document.removeEventListener("pointerleave", w), document.removeEventListener("visibilitychange", M), window.removeEventListener("blur", T), window.removeEventListener("focus", v), c.disconnect(), b.disconnect();
    for (const [, S] of n)
      S.destroy();
    n.clear(), document.querySelectorAll(".orca-startrek-starfield").forEach((S) => S.remove()), Reflect.deleteProperty(window, "__startrek_cleanup");
  };
  return window.__startrek_cleanup = W, W;
}
let Se = "en", Pe = {};
function Ve(l, e) {
  Se = l, Pe = e;
}
function C(l, e, t) {
  var s;
  return ((s = Pe[t ?? Se]) == null ? void 0 : s[l]) ?? l;
}
const Qe = {
  // Settings schema labels & descriptions
  "Warp Engine": "跃迁引擎",
  "Too laggy? Turn off the warp engine! (ಥ_ಥ)": "电脑太卡！关闭跃迁引擎！(ಥ_ಥ)",
  "Engine Power": "引擎功率",
  "Full: density ×1.0 | Cruise: density ×0.8 | Standby: density ×0.6. Frame rate unlocks during warp.": "最大功率：密度×1.0 | 巡航功率：密度×0.8 | 引擎怠速：密度×0.6。跃迁期间自动解锁帧率",
  "Full Power": "最大功率",
  Cruise: "巡航功率",
  Standby: "引擎怠速",
  "Use Recommended Fonts": "加载主题时使用推荐字体",
  "When enabled, switching to this theme automatically sets editor & UI fonts to serif (Noto Serif SC). Disabling restores native behavior.": "启用后，切换到本主题时自动将编辑器与 UI 字体设为衬线体（Noto Serif SC）；关闭则恢复原生逻辑",
  "Unify Query Fonts": "查询字体统一化",
  "When enabled, heading fonts in query results (cards/tables/lists) match body text font.": "启用后，查询结果（卡片/表格/列表）中的标题块字体与文本块保持一致",
  "Debug Mode": "调试模式"
}, I = "oh-StarTrek", ae = 55, re = 54, ie = "Noto Serif SC", ve = '"Noto Serif", "Noto Serif SC", "Source Han Serif SC", Georgia, "STSong", "SimSun", serif', Ke = 200, je = 500, Ze = 150, Je = 0.15, et = 400, tt = 1500, nt = 200, ot = 0.6, xe = 'link[rel="stylesheet"][href*="startrek"]', a = {
  pluginName: "",
  debugMode: !1,
  fullMode: !0,
  serifFontMode: !1,
  queryFontUnifyMode: !1,
  currentThemeName: null,
  originalEditorFont: null,
  originalUIFont: null,
  powerLevel: "full"
}, k = (...l) => {
  a.debugMode && console.log("[oh-StarTrek]", ...l);
};
let J = null, ee = null, Y = null, te = null, O = null, V = null, Q = null, K = null;
function it() {
  const l = (t = document) => {
    t.querySelectorAll(".orca-select-menu .orca-select-item-label").forEach((o) => {
      var n;
      const s = (n = o.textContent) == null ? void 0 : n.trim();
      s && (o.dataset.fontPreview || s !== "默认" && (o.style.fontFamily = `"${s}", sans-serif`, o.dataset.fontPreview = s));
    });
  };
  setTimeout(() => l(), 2e3);
  const e = new MutationObserver((t) => {
    for (const o of t)
      if (o.type === "childList" && o.addedNodes.length > 0)
        for (const s of o.addedNodes)
          s instanceof Element && l(s);
  });
  return e.observe(document.body, { childList: !0, subtree: !0 }), e;
}
function st() {
  const l = (e) => {
    const t = e.closest(".orca-input");
    if (!t) return;
    const o = t.offsetWidth, s = Math.max(Ke, Math.min(je, Ze + o * Je));
    t.style.setProperty("--milk-input-spread-dur", `${s}ms`);
  };
  V = (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const t = e.target.closest(".orca-input");
    t && (l(e.target), t.style.setProperty("--milk-input-spread", "1"));
  }, Q = (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const t = e.target.closest(".orca-input");
    t && t.style.removeProperty("--milk-input-spread");
  }, document.addEventListener("focusin", V, !0), document.addEventListener("focusout", Q, !0);
}
function at() {
  const l = (t) => {
    const o = t.offsetHeight, s = Math.max(et, Math.min(tt, nt + o * ot));
    t.style.setProperty("--milk-scope-spread-dur", `${s}ms`);
  };
  K = (t) => {
    var s, n;
    if (!(t.target instanceof HTMLElement)) return;
    const o = (n = (s = t.target).closest) == null ? void 0 : n.call(s, ".orca-repr-scope-line");
    o && l(o);
  }, document.addEventListener("mouseenter", K, !0);
  const e = new MutationObserver((t) => {
    for (const o of t)
      if (o.type === "attributes" && o.attributeName === "class") {
        const s = o.target;
        if (s.classList.contains("orca-active-parent")) {
          const n = s.querySelector(".orca-repr-scope-line");
          n && l(n);
        }
      }
  });
  e.observe(document.body, { attributes: !0, subtree: !0, attributeFilter: ["class"] }), ee = e;
}
function le() {
  k(`applyStarfield: currentThemeName="${a.currentThemeName}", THEME_NAME="${I}", fullMode=${a.fullMode}`), O && (O(), O = null), a.currentThemeName === I && a.fullMode ? (O = Ye(), k("星空已启动")) : k(`星空未启动（${a.currentThemeName !== I ? "主题不匹配" : "满血模式关闭"}）`);
}
function ce() {
  a.originalEditorFont === null && (a.originalEditorFont = orca.state.settings[ae]), a.originalUIFont === null && (a.originalUIFont = orca.state.settings[re]), orca.state.settings[ae] = ie, orca.state.settings[re] = ie, document.documentElement.style.setProperty("--orca-fontfamily-editor", ve), document.documentElement.style.setProperty("--orca-fontfamily-ui", ve), k(`已设置字体为 ${ie}（设置值 + CSS 变量）`);
}
function de() {
  a.originalEditorFont !== null && (orca.state.settings[ae] = a.originalEditorFont), a.originalUIFont !== null && (orca.state.settings[re] = a.originalUIFont), document.documentElement.style.removeProperty("--orca-fontfamily-editor"), document.documentElement.style.removeProperty("--orca-fontfamily-ui"), a.originalEditorFont = null, a.originalUIFont = null, k("已恢复用户原始字体设置");
}
const Fe = "startrek-query-font-unified";
function he() {
  document.documentElement.classList.add(Fe), k("已开启查询字体统一化");
}
function ue() {
  document.documentElement.classList.remove(Fe), k("已关闭查询字体统一化");
}
const rt = () => {
  const l = !!document.querySelector(xe), e = l ? I : "";
  e !== a.currentThemeName && (a.currentThemeName = e, k(`主题变更检测: startrek CSS ${l ? "已加载" : "未加载"}`), l && a.serifFontMode && ce(), !l && a.serifFontMode && a.originalEditorFont !== null && de(), l && a.queryFontUnifyMode ? he() : l || ue(), le());
};
async function ct(l) {
  a.pluginName = l, Ve(orca.state.locale, { "zh-CN": Qe });
  const e = (n) => ({
    fullMode: {
      label: C("Warp Engine"),
      description: C("Too laggy? Turn off the warp engine! (ಥ_ಥ)"),
      type: "boolean",
      defaultValue: !0
    },
    ...n ? {
      powerLevel: {
        label: C("Engine Power"),
        description: C("Full: density ×1.0 | Cruise: density ×0.8 | Standby: density ×0.6. Frame rate unlocks during warp."),
        type: "singleChoice",
        defaultValue: "full",
        choices: [
          { label: C("Full Power"), value: "full" },
          { label: C("Cruise"), value: "cruise" },
          { label: C("Standby"), value: "standby" }
        ]
      }
    } : {},
    serifFontMode: {
      label: C("Use Recommended Fonts"),
      description: C("When enabled, switching to this theme automatically sets editor & UI fonts to serif (Noto Serif SC). Disabling restores native behavior."),
      type: "boolean",
      defaultValue: !1
    },
    queryFontUnifyMode: {
      label: C("Unify Query Fonts"),
      description: C("When enabled, heading fonts in query results (cards/tables/lists) match body text font."),
      type: "boolean",
      defaultValue: !1
    },
    debugMode: {
      label: C("Debug Mode"),
      type: "boolean",
      defaultValue: !1
    }
  });
  await orca.plugins.setSettingsSchema(a.pluginName, e(!0));
  const t = () => {
    var w;
    const n = (w = orca.state.plugins[a.pluginName]) == null ? void 0 : w.settings, f = !!(n != null && n.debugMode), h = (n == null ? void 0 : n.fullMode) !== !1, d = !!(n != null && n.serifFontMode), p = !!(n != null && n.queryFontUnifyMode);
    a.debugMode = f, $e(a.debugMode);
    const g = (n == null ? void 0 : n.powerLevel) || "full";
    g !== a.powerLevel && (a.powerLevel = g, Xe(g)), d !== a.serifFontMode && (a.serifFontMode = d, a.serifFontMode && a.currentThemeName === I && ce(), !a.serifFontMode && a.originalEditorFont !== null && de()), p !== a.queryFontUnifyMode && (a.queryFontUnifyMode = p, a.queryFontUnifyMode && a.currentThemeName === I ? he() : a.queryFontUnifyMode || ue()), h !== a.fullMode ? (a.fullMode = h, le(), orca.plugins.setSettingsSchema(a.pluginName, e(h))) : a.fullMode = h;
  };
  t();
  const { subscribe: o } = window.Valtio;
  te = o(orca.state.plugins, () => {
    t();
  }), orca.themes.register(a.pluginName, I, "themes/startrek.css"), J = it(), at(), st(), Y = new MutationObserver(() => {
    rt();
  }), Y.observe(document.head, { childList: !0, subtree: !1 }), document.querySelector(xe) ? (a.currentThemeName = I, k("检测到 startrek CSS 已加载，当前主题即为目标主题"), a.serifFontMode && ce(), a.queryFontUnifyMode && he()) : a.currentThemeName = "", le(), k(`${a.pluginName} loaded.`);
}
async function ht() {
  orca.themes.unregister(I), a.originalEditorFont !== null && de(), ue(), J && (J.disconnect(), J = null), ee && (ee.disconnect(), ee = null), K && (document.removeEventListener("mouseenter", K, !0), K = null), V && (document.removeEventListener("focusin", V, !0), V = null), Q && (document.removeEventListener("focusout", Q, !0), Q = null), Y && (Y.disconnect(), Y = null), te && (te(), te = null), O && (O(), O = null), k(`${a.pluginName} unloaded.`);
}
export {
  ct as load,
  ht as unload
};
