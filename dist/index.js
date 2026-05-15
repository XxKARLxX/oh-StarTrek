var Pe = Object.defineProperty;
var xe = (c, e, t) => e in c ? Pe(c, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : c[e] = t;
var E = (c, e, t) => xe(c, typeof e != "symbol" ? e + "" : e, t);
let R = !1;
const A = (...c) => {
  R && console.log("[oh-StarTrek]", ...c);
};
function Ae(c) {
  R = c, c && A("调试模式已开启");
}
const Fe = "#12c2e9", Ee = "#e98812", fe = (c) => {
  const e = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
  return e ? {
    r: parseInt(e[1], 16),
    g: parseInt(e[2], 16),
    b: parseInt(e[3], 16)
  } : (R && console.warn("[oh-StarTrek] hexToRgb 解析失败:", c, "，使用 fallback"), { r: 18, g: 194, b: 233 });
};
let X = { r: 18, g: 194, b: 233 }, z = { r: 233, g: 136, b: 18 };
function $e() {
  try {
    const c = getComputedStyle(document.documentElement), e = c.getPropertyValue("--milk-slate").trim() || Fe, t = c.getPropertyValue("--milk-orange").trim() || Ee;
    X = fe(e), z = fe(t), A(`initColors: cyan=rgb(${X.r},${X.g},${X.b}), orange=rgb(${z.r},${z.g},${z.b})`);
  } catch {
    A("initColors failed, using defaults");
  }
}
const Te = 0.6, pe = () => Math.random() < Te ? X : z, Re = 400, me = 1600, _e = 500, H = 4, oe = 36, I = 1, U = 2, ye = 0.07, D = 250, Le = 1 / 12e3, Ce = 30, ke = 300, ge = 8, L = 0.1, Ie = 0.15, we = 0.25, De = 0.08, Ne = 0.04, Oe = 8, Be = 0.03, be = 0.1, He = 30, W = {
  full: { maxFps: 120, densityMultiplier: 1, label: "满功率" },
  cruise: { maxFps: 60, densityMultiplier: 0.8, label: "巡航功率" },
  standby: { maxFps: 30, densityMultiplier: 0.6, label: "待机功率" }
};
let Q = "full";
function We(c) {
  c !== Q && (Q = c, A(`引擎功率切换: ${W[c].label} (fps上限=${W[c].maxFps}, 密度×${W[c].densityMultiplier})`), ie = !0);
}
let ie = !1;
const qe = 16;
class Ue {
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
    E(this, "cruiseDuration", me);
    this.hideable = e;
    const t = e.querySelectorAll(".orca-startrek-starfield");
    t.length > 0 && (A(`constructor: 清除 ${t.length} 个残留 canvas`), t.forEach((n) => n.remove())), this.canvas = document.createElement("canvas"), this.canvas.className = "orca-startrek-starfield", this.canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;", e.appendChild(this.canvas), this.resize();
  }
  /** 原地覆写：将星星重置为从圆边缘出发（跃迁回收用，零 GC） */
  resetAsCenterStar(e) {
    const t = this.canvasW / 2, n = this.canvasH / 2, o = Math.min(this.canvasW, this.canvasH) * (0.05 + Math.random() * 0.35), f = Math.random() * Math.PI * 2, h = t + Math.cos(f) * o, d = n + Math.sin(f) * o, p = Math.atan2(d - n, h - t), g = Math.sqrt(t * t + n * n), b = Math.min(1, o / g), w = pe();
    e.ox = h, e.oy = d, e.x = h, e.y = d, e.vx = 0, e.prevX = h, e.morphicPhase = "idle", e.morphicPeak = 0, e.size = 0.3 + Math.random() * 0.8, e.baseAlpha = 0.15 + Math.random() * 0.25, e.twinkleSpeed = 0.5 + Math.random() * 2, e.twinkleOffset = Math.random() * Math.PI * 2, e.warpAngle = p, e.warpSpeed = H + (oe - H) * b, e.warpBornInWarp = !0, e.warpStreak = Math.random() < 0.5, e.colorR = w.r, e.colorG = w.g, e.colorB = w.b;
  }
  /** 创建一颗随机位置的常驻星星 */
  makeStar(e, t) {
    const n = Math.random() * this.canvasW, s = e + Math.random() * (t - e), o = pe();
    return {
      ox: n,
      oy: s,
      x: n,
      y: s,
      vx: 0,
      prevX: n,
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
      colorR: o.r,
      colorG: o.g,
      colorB: o.b
    };
  }
  /** 初始化星点 — 在画布 + 出血区范围内均匀分布
   *  密度倍率由引擎功率档位控制 */
  generateStars() {
    this.stars = [];
    const e = this.canvasH * be, t = this.canvasH + e * 2, n = this.canvasW * t, s = W[Q].densityMultiplier, o = Math.max(
      Ce,
      Math.min(ke, Math.round(n * Le * s))
    );
    for (let f = 0; f < o; f++)
      this.stars.push(this.makeStar(-e, this.canvasH + e));
  }
  /** 触发跃迁：进入加速期；warp 期间可重置巡航计时器
   *  @param cruiseDuration 巡航时长（ms），默认 CRUISE_DURATION
   */
  triggerWarp(e = me) {
    if (A(`triggerWarp: phase=${this.warpPhase}, stars=${this.stars.length}, cruise=${e}ms`), this.warpPhase === "ramp" || this.warpPhase === "decay") return;
    if (this.warpPhase === "warp") {
      this.phaseStart = performance.now(), A("triggerWarp: warp重置");
      return;
    }
    this.warpPhase = "ramp", this.phaseStart = performance.now(), this.cruiseDuration = e;
    const t = this.canvasW / 2, n = this.canvasH / 2, s = Math.sqrt(t * t + n * n);
    for (const o of this.stars) {
      const f = o.x - t, h = o.y - n, d = Math.sqrt(f * f + h * h);
      o.warpAngle = Math.atan2(h, f);
      const p = Math.min(1, d / s);
      o.warpSpeed = H + (oe - H) * p, o.warpBornInWarp = !1, o.warpStreak = Math.random() < 0.5;
    }
    if (R) {
      const o = this.stars.slice(0, 5).map((f) => `(${f.x.toFixed(0)},${f.y.toFixed(0)})`).join(" ");
      A(`triggerWarp: 星星样本 = ${o}`);
    }
    A(`triggerWarp: 进入ramp, 星星数=${this.stars.length}`);
  }
  /** 调整 canvas 尺寸（容差 2px，防止 1px 抖动反复重建星星） */
  resize() {
    const e = this.hideable.clientWidth, t = this.hideable.clientHeight;
    if (e === 0 || t === 0) return;
    const n = Math.abs(e - this.canvasW), s = Math.abs(t - this.canvasH);
    if ((n >= 2 || s >= 2) && (A(`resize: ${this.canvasW}x${this.canvasH} → ${e}x${t} (dw=${n}, dh=${s})`), this.canvasW = e, this.canvasH = t, this.canvas.width = e, this.canvas.height = t, this.ctx = this.canvas.getContext("2d"), this.generateStars(), this.warpPhase !== "normal")) {
      A(`resize: 跃迁中(${this.warpPhase})，重算跃迁方向`);
      const o = e / 2, f = t / 2;
      for (const h of this.stars) {
        const d = h.x - o, p = h.y - f;
        h.warpAngle = Math.atan2(p, d), h.warpSpeed = H + Math.random() * (oe - H), h.warpBornInWarp = !1;
      }
    }
  }
  /** 更新滚动位置 */
  updateScroll() {
    const e = this.hideable.querySelector(".orca-block-editor") ?? this.hideable;
    this.scrollY = e.scrollTop;
  }
  /** 画一个带拖尾的星星 */
  drawStreakStar(e, t, n, s, o, f, h, d, p) {
    if (this.ctx) {
      if (s > 0.5) {
        const g = e - Math.cos(n) * s, b = t - Math.sin(n) * s;
        this.ctx.beginPath(), this.ctx.moveTo(g, b), this.ctx.lineTo(e, t), this.ctx.strokeStyle = `rgba(${h},${d},${p},${f * 0.5})`, this.ctx.lineWidth = Math.max(0.5, o * 0.7), this.ctx.stroke();
      }
      this.ctx.beginPath(), this.ctx.arc(e, t, o, 0, Math.PI * 2), this.ctx.fillStyle = `rgba(255,255,255,${f})`, this.ctx.fill();
    }
  }
  /** 调试模式：画一颗亮红色圆点 + 方向线 */
  drawDebugDot(e, t, n) {
    if (n.beginPath(), n.arc(e.x, e.y, 3, 0, Math.PI * 2), n.fillStyle = "#ff0000", n.fill(), t) {
      const s = e.warpSpeed * 10;
      n.beginPath(), n.moveTo(e.x, e.y), n.lineTo(
        e.x + Math.cos(e.warpAngle) * s,
        e.y + Math.sin(e.warpAngle) * s
      ), n.strokeStyle = "rgba(255, 0, 0, 0.6)", n.lineWidth = 1, n.stroke();
    }
  }
  // ════════════════════════════════════════════════════════
  // [P1-Q03] draw() 重构：四个状态分支提取为独立方法
  // ════════════════════════════════════════════════════════
  /**
   * 正常状态：引力 + 闪烁 + 视差
   * [P0-P03] 正常状态不使用 shadowBlur，改用双圈伪光晕模拟柔光效果
   */
  drawNormal(e, t, n, s, o, f) {
    if (n) {
      const r = e.x - s, u = e.y - o, m = Math.sqrt(r * r + u * u);
      if (m < D && m > 0) {
        const T = (1 - m / D) * ge, v = e.ox - r / m * T, O = e.oy - u / m * T;
        e.x += (v - e.x) * L, e.y += (O - e.y) * L;
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
          e.x += u * M * De;
        }
      }
      e.morphicPhase !== "active" && (e.morphicPhase = "active");
    } else
      e.morphicPhase === "active" && (e.morphicPhase = "decay"), e.morphicPhase === "decay" ? (e.x += (e.ox - e.x) * Ne, e.morphicPeak > 0 ? (e.morphicPeak *= 1 - Be, e.morphicPeak < 0.01 && (e.morphicPeak = 0, e.morphicPhase = "idle")) : e.morphicPhase = "idle") : e.x += (e.ox - e.x) * L;
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
    const g = Math.abs(p) * Oe;
    if (g > 0.5) {
      const r = p > 0 ? 0 : Math.PI, u = 1 + (U - 1) * d, m = e.size * u;
      let M = e.baseAlpha + I * d;
      return M = Math.min(1, M), this.drawStreakStar(e.x, e.y, r, g, m, M, e.colorR, e.colorG, e.colorB), !0;
    }
    const b = 1 + (U - 1) * d, w = e.size * b, l = I * d;
    if (R)
      return this.drawDebugDot(e, !1, t), !0;
    if (n) {
      const r = e.x - s, u = e.y - o, m = Math.sqrt(r * r + u * u), M = m < D ? 1 - m / D : 0, T = Math.sin(f * 1e-3 * e.twinkleSpeed + e.twinkleOffset) * 0.5 + 0.5;
      let v = e.baseAlpha;
      v += M * 0.9, v += T * 0.25 * M, v += l, v = Math.min(1, v), t.beginPath(), t.arc(e.x, e.y, w * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${v * 0.12})`, t.fill(), t.beginPath(), t.arc(e.x, e.y, w, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${v})`, t.fill();
    } else {
      let r = e.baseAlpha + l;
      r = Math.min(1, r), t.beginPath(), t.arc(e.x, e.y, w * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${r * 0.12})`, t.fill(), t.beginPath(), t.arc(e.x, e.y, w, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${r})`, t.fill();
    }
    return !0;
  }
  /** 加速期：速度/拖尾/亮度从0渐增 */
  drawRamp(e, t, n, s, o, f, h, d) {
    if (e.warpStreak) {
      const p = Math.sqrt(
        (e.x - s) * (e.x - s) + (e.y - o) * (e.y - o)
      ), g = Math.min(1, p / f), b = 5 - 4 * g, w = Math.pow(n, b), l = e.warpSpeed * w;
      if (e.x += Math.cos(e.warpAngle) * l, e.y += Math.sin(e.warpAngle) * l, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if (R)
        this.drawDebugDot(e, !0, t);
      else {
        const r = 1 + (U - 1) * w * g, u = e.size * r, m = I * w;
        let M = e.baseAlpha + m;
        M = Math.min(1, M);
        const T = l * 6;
        this.drawStreakStar(e.x, e.y, e.warpAngle, T, u, M, e.colorR, e.colorG, e.colorB);
      }
    } else {
      const p = Math.sqrt(
        (e.x - s) * (e.x - s) + (e.y - o) * (e.y - o)
      ), b = 5 - 4 * Math.min(1, p / f), w = Math.pow(n, b), l = e.warpSpeed * ye * w;
      if (e.x += Math.cos(e.warpAngle) * l, e.y += Math.sin(e.warpAngle) * l, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if (R)
        this.drawDebugDot(e, !1, t);
      else {
        let r = e.baseAlpha + I * w;
        r = Math.min(1, r), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${r})`, t.fill();
      }
    }
    return !0;
  }
  /** 巡航期：全速→减速停下，拖尾缩短 */
  drawWarp(e, t, n, s, o, f, h, d) {
    if (e.warpStreak) {
      const p = e.warpSpeed * (1 - n * n);
      if (e.x += Math.cos(e.warpAngle) * p, e.y += Math.sin(e.warpAngle) * p, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if (R)
        this.drawDebugDot(e, !0, t);
      else {
        const g = Math.sqrt(
          (e.x - s) * (e.x - s) + (e.y - o) * (e.y - o)
        ), b = 1 + (U - 1) * Math.min(1, g / f), w = e.size * b;
        let l = e.baseAlpha + I;
        l = Math.min(1, l);
        const r = p * 6;
        this.drawStreakStar(e.x, e.y, e.warpAngle, r, w, l, e.colorR, e.colorG, e.colorB);
      }
    } else {
      const p = e.warpSpeed * ye * (1 - n * n);
      if (e.x += Math.cos(e.warpAngle) * p, e.y += Math.sin(e.warpAngle) * p, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if (R)
        this.drawDebugDot(e, !1, t);
      else {
        let g = e.baseAlpha + I;
        g = Math.min(1, g), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${g})`, t.fill();
      }
    }
    return !0;
  }
  /** 衰减期：亮度/大小/光晕缓回正常，引力渐入
   *  @todo [W-01 技术债务] 无鼠标时星星缺少缓动回归原位的 else 分支，
   *  对比 drawNormal 有对应逻辑。当前 decay 持续约 500ms，影响轻微，后续补 3 行 else 即可 */
  drawDecay(e, t, n, s, o, f, h, d, p, g) {
    const b = 1 - (1 - n) * (1 - n), w = b;
    if (d && w > 0.01) {
      const l = e.x - p, r = e.y - g, u = Math.sqrt(l * l + r * r), m = u < D ? 1 - u / D : 0;
      if (u < D && u > 0) {
        const M = m * ge * w;
        e.x += (e.ox - l / u * M - e.x) * L, e.y += (e.oy - r / u * M - e.y) * L;
      } else
        e.x += (e.ox - e.x) * L * w, e.y += (e.oy - e.y) * L * w;
    }
    if (e.y < -2 || e.y > h + 2) return !1;
    if (R)
      this.drawDebugDot(e, !1, t);
    else {
      const l = I * (1 - b);
      let r = e.baseAlpha + l;
      r = Math.min(1, r);
      const u = Math.sqrt(
        (e.x - s) * (e.x - s) + (e.y - o) * (e.y - o)
      ), m = 1 + (U - 1) * (1 - b) * Math.min(1, u / f), M = e.size * m;
      t.beginPath(), t.arc(e.x, e.y, M, 0, Math.PI * 2), t.fillStyle = `rgba(255,255,255,${r})`, t.fill();
      const T = r * 0.12 * (1 - b);
      T > 0.01 && (t.beginPath(), t.arc(e.x, e.y, M * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${T})`, t.fill());
    }
    return !0;
  }
  /** 绘制一帧 */
  draw(e, t, n, s) {
    if (!this.ctx) return;
    this.fpsFrameCount++, e - this.fpsLastTime >= 1e3 && (this.fps = this.fpsFrameCount, this.fpsFrameCount = 0, this.fpsLastTime = e), this.handleGravityX = [], this.handleDragging = !1;
    const o = this.hideable.querySelector(".orca-lcars-width-handle.dragging");
    if (o) {
      this.handleDragging = !0;
      const i = this.hideable.getBoundingClientRect(), F = o.getBoundingClientRect(), q = F.left + F.width / 2 - i.left;
      this.handleGravityX.push(q);
      const j = o.closest(".orca-block-editor");
      if (j) {
        const te = j.querySelectorAll(".orca-lcars-width-handle");
        for (const B of te)
          if (!B.classList.contains("dragging")) {
            const ue = B.getBoundingClientRect();
            this.handleGravityX.push(ue.left + ue.width / 2 - i.left);
          }
      }
    }
    const h = (this.scrollY - this.prevScrollY) * Ie;
    this.prevScrollY = this.scrollY;
    const d = this.canvasH * be, p = -d, g = this.canvasH + d;
    if (this.warpPhase === "normal" || this.warpPhase === "decay")
      for (const i of this.stars)
        i.oy -= h, i.y -= h, i.oy > g ? (i.ox = Math.random() * this.canvasW, i.oy = p - Math.random() * d * 0.5, i.x = i.ox, i.y = i.oy, i.prevX = i.x) : i.oy < p && (i.ox = Math.random() * this.canvasW, i.oy = g + Math.random() * d * 0.5, i.x = i.ox, i.y = i.oy, i.prevX = i.x);
    this.frameCount++;
    let b = 0, w = 0;
    const l = this.ctx, r = this.canvasW, u = this.canvasH;
    l.clearRect(0, 0, r, u), R && (l.fillStyle = "rgba(255, 255, 0, 0.15)", l.fillRect(0, 0, r, u));
    const m = r / 2, M = u / 2, T = Math.sqrt(r * r + u * u) / 2;
    let v = 0;
    if (this.warpPhase !== "normal") {
      const i = this.warpPhase === "ramp" ? Re : this.warpPhase === "warp" ? this.cruiseDuration : _e;
      v = Math.max(0, Math.min(1, (e - this.phaseStart) / i)), v >= 1 && (this.warpPhase === "ramp" ? (this.warpPhase = "warp", this.phaseStart = e, v = 0, A("draw: ramp→warp")) : this.warpPhase === "warp" ? (this.warpPhase = "decay", this.phaseStart = e, v = 0, A("draw: warp→decay")) : this.warpPhase === "decay" && (this.warpPhase = "normal", v = 0, A("draw: decay→normal")));
    }
    const O = this.warpPhase !== "normal", S = this.fps === 0 || this.fps >= He, _ = O && S;
    if (R)
      l.shadowBlur = 0;
    else if (_)
      switch (this.warpPhase) {
        case "ramp":
          l.shadowBlur = 4 + 4 * v * v;
          break;
        case "warp":
          l.shadowBlur = 8;
          break;
        case "decay":
          l.shadowBlur = 4 + 4 * (1 - v);
          break;
        default:
          l.shadowBlur = 0;
          break;
      }
    else
      l.shadowBlur = 0;
    if (R && this.warpPhase === "ramp" && v < 0.05) {
      const i = this.stars.slice(0, 5).map((F) => `(${F.x.toFixed(0)},${F.y.toFixed(0)})`).join(" ");
      A(`ramp-early: p=${v.toFixed(3)}, 星星样本 = ${i}`);
    }
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const F = this.stars[i], q = F.colorR, j = F.colorG, te = F.colorB;
      switch (_ && (l.shadowColor = `rgba(${q}, ${j}, ${te}, 0.8)`), this.warpPhase) {
        case "normal": {
          if (!this.drawNormal(F, l, t, n, s, e)) continue;
          break;
        }
        case "ramp": {
          if (!this.drawRamp(F, l, v, m, M, T, r, u)) continue;
          break;
        }
        case "warp": {
          if (!this.drawWarp(F, l, v, m, M, T, r, u)) continue;
          break;
        }
        case "decay": {
          if (!this.drawDecay(F, l, v, m, M, T, u, t, n, s)) continue;
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
        i.x < P && (P = i.x), i.x > x && (x = i.x), i.y < y && (y = i.y), i.y > $ && ($ = i.y), i.x >= 0 && i.x <= r && i.y >= 0 && i.y <= u ? b++ : w++;
    }
    if (R) {
      l.shadowBlur = 0;
      const i = this.hideable.querySelectorAll(".orca-startrek-starfield").length;
      l.fillStyle = "#ff0000", l.font = "bold 14px monospace", l.textBaseline = "top", l.fillText(`phase: ${this.warpPhase} | fps: ${this.fps} | ${W[Q].label}`, 10, 10), l.fillText(`stars: ${this.stars.length} | inCanvas: ${b} | offCanvas: ${w}`, 10, 30), l.fillText(`canvas: ${r}x${u} | canvases: ${i}`, 10, 50), i > 1 && l.fillText(`⚠ 检测到 ${i} 个 canvas！`, 10, 70);
    }
    if (l.shadowBlur = 0, R) {
      const i = this.warpPhase !== "normal" ? 1 : 60;
      this.frameCount % i === 0 && A(`tick: phase=${this.warpPhase}, stars=${this.stars.length}, inCanvas=${b}, x=[${P.toFixed(0)},${x.toFixed(0)}] y=[${y.toFixed(0)},${$.toFixed(0)}], canvas=${r}x${u}`);
    }
  }
  /** 销毁实例 */
  destroy() {
    this.canvas.remove(), this.ctx = null, this.stars = [];
  }
}
function Xe() {
  const c = window.__startrek_cleanup;
  c && (A("startStarfield: 清理上一套残留实例"), c());
  let e = 0, t = -999, n = -999, s = null;
  const o = /* @__PURE__ */ new Map();
  $e();
  const f = () => {
    const S = document.querySelector(".orca-panels-container");
    if (!S) return;
    const _ = S.querySelectorAll(
      ".orca-hideable:not(.orca-hideable-hidden):not(.orca-memoizedviews-active)"
    );
    for (const P of _) {
      const x = P;
      o.has(x) || o.set(x, new Ue(x));
    }
    for (const [P, x] of o)
      (!document.body.contains(P) || P.classList.contains("orca-hideable-hidden") || P.classList.contains("orca-memoizedviews-active")) && (x.destroy(), o.delete(P));
  };
  let h = 0;
  const d = (S) => {
    const x = 1e3 / (Array.from(o.values()).some((y) => y.warpPhase !== "normal") ? 120 : W[Q].maxFps);
    if (S - h < x) {
      e = requestAnimationFrame(d);
      return;
    }
    if (h = S, ie) {
      ie = !1;
      for (const [, y] of o)
        y.generateStars();
    }
    for (const [y, $] of o) {
      if (y.classList.contains("orca-hideable-hidden") || y.classList.contains("orca-memoizedviews-active") || !document.body.contains(y)) {
        $.destroy(), o.delete(y);
        continue;
      }
      $.resize(), $.updateScroll();
      const i = $.hideable === s, F = i ? t : -999, q = i ? n : -999;
      $.draw(S, i, F, q);
    }
    e = requestAnimationFrame(d);
  };
  let p = 0;
  const g = (S) => {
    var x;
    const _ = performance.now();
    if (_ - p < qe) {
      if (s && o.has(s)) {
        const y = s.getBoundingClientRect();
        t = S.clientX - y.left, n = S.clientY - y.top;
      }
      return;
    }
    p = _;
    const P = document.elementFromPoint(S.clientX, S.clientY);
    if (P) {
      const y = (x = P.closest) == null ? void 0 : x.call(P, ".orca-hideable");
      if (y && o.has(y)) {
        s = y;
        const $ = y.getBoundingClientRect();
        t = S.clientX - $.left, n = S.clientY - $.top;
      } else
        s = null, t = -999, n = -999;
    }
  }, b = () => {
    s = null, t = -999, n = -999;
  };
  document.addEventListener("pointermove", g), document.addEventListener("pointerleave", b);
  const w = new MutationObserver((S) => {
    var _, P;
    for (const x of S) {
      if (x.type !== "attributes") continue;
      const y = x.target;
      if (x.attributeName === "class" && y.classList.contains("orca-repr-task-content") && y.classList.contains("orca-repr-task-1") && !y.classList.contains("orca-repr-task-0")) {
        const $ = y.closest(".orca-hideable");
        if ($) {
          const i = o.get($);
          i && i.triggerWarp();
        }
      }
      if (x.attributeName === "data-status" && ((_ = y.dataset) == null ? void 0 : _.name) === "task" && ((P = y.dataset) == null ? void 0 : P.status) === "Done") {
        if (!y.closest(".orca-repr-main-content")) continue;
        const i = y.closest(".orca-hideable");
        if (i) {
          const F = o.get(i);
          F && (A("bigTaskObserver: 大任务完成，触发 5 秒跃迁"), F.triggerWarp(4100));
        }
      }
    }
  });
  w.observe(document.body, {
    attributes: !0,
    subtree: !0,
    attributeFilter: ["class", "data-status"]
  });
  const l = new MutationObserver(() => {
    f();
  });
  l.observe(document.body, {
    childList: !0,
    subtree: !0
  });
  let r = !1;
  const u = (S) => {
    r || (r = !0, cancelAnimationFrame(e), A(`暂停渲染: ${S}`));
  }, m = (S) => {
    r && (r = !1, h = 0, e = requestAnimationFrame(d), A(`恢复渲染: ${S}`));
  }, M = () => {
    document.hidden ? u("visibilitychange") : m("visibilitychange");
  }, T = () => u("window blur"), v = () => m("window focus");
  document.addEventListener("visibilitychange", M), window.addEventListener("blur", T), window.addEventListener("focus", v), f(), setTimeout(f, 500), setTimeout(f, 2e3), e = requestAnimationFrame(d);
  const O = () => {
    cancelAnimationFrame(e), document.removeEventListener("pointermove", g), document.removeEventListener("pointerleave", b), document.removeEventListener("visibilitychange", M), window.removeEventListener("blur", T), window.removeEventListener("focus", v), l.disconnect(), w.disconnect();
    for (const [, S] of o)
      S.destroy();
    o.clear(), document.querySelectorAll(".orca-startrek-starfield").forEach((S) => S.remove()), Reflect.deleteProperty(window, "__startrek_cleanup");
  };
  return window.__startrek_cleanup = O, O;
}
const k = "oh-StarTrek", se = 55, ae = 54, ne = "Noto Serif SC", Me = '"Noto Serif", "Noto Serif SC", "Source Han Serif SC", Georgia, "STSong", "SimSun", serif', ze = 200, Ge = 500, Ye = 150, Ve = 0.15, Ke = 400, Qe = 1500, je = 200, Ze = 0.6, ve = 'link[rel="stylesheet"][href*="startrek"]', a = {
  pluginName: "",
  debugMode: !1,
  fullMode: !0,
  serifFontMode: !1,
  queryFontUnifyMode: !1,
  currentThemeName: null,
  originalEditorFont: null,
  originalUIFont: null,
  powerLevel: "full"
}, C = (...c) => {
  a.debugMode && console.log("[oh-StarTrek]", ...c);
};
let Z = null, J = null, G = null, ee = null, N = null, Y = null, V = null, K = null;
function Je() {
  const c = (t = document) => {
    t.querySelectorAll(".orca-select-menu .orca-select-item-label").forEach((n) => {
      var o;
      const s = (o = n.textContent) == null ? void 0 : o.trim();
      s && (n.dataset.fontPreview || s !== "默认" && (n.style.fontFamily = `"${s}", sans-serif`, n.dataset.fontPreview = s));
    });
  };
  setTimeout(() => c(), 2e3);
  const e = new MutationObserver((t) => {
    for (const n of t)
      if (n.type === "childList" && n.addedNodes.length > 0)
        for (const s of n.addedNodes)
          s instanceof Element && c(s);
  });
  return e.observe(document.body, { childList: !0, subtree: !0 }), e;
}
function et() {
  const c = (e) => {
    const t = e.closest(".orca-input");
    if (!t) return;
    const n = t.offsetWidth, s = Math.max(ze, Math.min(Ge, Ye + n * Ve));
    t.style.setProperty("--milk-input-spread-dur", `${s}ms`);
  };
  Y = (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const t = e.target.closest(".orca-input");
    t && (c(e.target), t.style.setProperty("--milk-input-spread", "1"));
  }, V = (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const t = e.target.closest(".orca-input");
    t && t.style.removeProperty("--milk-input-spread");
  }, document.addEventListener("focusin", Y, !0), document.addEventListener("focusout", V, !0);
}
function tt() {
  const c = (t) => {
    const n = t.offsetHeight, s = Math.max(Ke, Math.min(Qe, je + n * Ze));
    t.style.setProperty("--milk-scope-spread-dur", `${s}ms`);
  };
  K = (t) => {
    var s, o;
    if (!(t.target instanceof HTMLElement)) return;
    const n = (o = (s = t.target).closest) == null ? void 0 : o.call(s, ".orca-repr-scope-line");
    n && c(n);
  }, document.addEventListener("mouseenter", K, !0);
  const e = new MutationObserver((t) => {
    for (const n of t)
      if (n.type === "attributes" && n.attributeName === "class") {
        const s = n.target;
        if (s.classList.contains("orca-active-parent")) {
          const o = s.querySelector(".orca-repr-scope-line");
          o && c(o);
        }
      }
  });
  e.observe(document.body, { attributes: !0, subtree: !0, attributeFilter: ["class"] }), J = e;
}
function re() {
  C(`applyStarfield: currentThemeName="${a.currentThemeName}", THEME_NAME="${k}", fullMode=${a.fullMode}`), N && (N(), N = null), a.currentThemeName === k && a.fullMode ? (N = Xe(), C("星空已启动")) : C(`星空未启动（${a.currentThemeName !== k ? "主题不匹配" : "满血模式关闭"}）`);
}
function le() {
  a.originalEditorFont === null && (a.originalEditorFont = orca.state.settings[se]), a.originalUIFont === null && (a.originalUIFont = orca.state.settings[ae]), orca.state.settings[se] = ne, orca.state.settings[ae] = ne, document.documentElement.style.setProperty("--orca-fontfamily-editor", Me), document.documentElement.style.setProperty("--orca-fontfamily-ui", Me), C(`已设置字体为 ${ne}（设置值 + CSS 变量）`);
}
function he() {
  a.originalEditorFont !== null && (orca.state.settings[se] = a.originalEditorFont), a.originalUIFont !== null && (orca.state.settings[ae] = a.originalUIFont), document.documentElement.style.removeProperty("--orca-fontfamily-editor"), document.documentElement.style.removeProperty("--orca-fontfamily-ui"), a.originalEditorFont = null, a.originalUIFont = null, C("已恢复用户原始字体设置");
}
const Se = "startrek-query-font-unified";
function ce() {
  document.documentElement.classList.add(Se), C("已开启查询字体统一化");
}
function de() {
  document.documentElement.classList.remove(Se), C("已关闭查询字体统一化");
}
const ot = () => {
  const c = !!document.querySelector(ve), e = c ? k : "";
  e !== a.currentThemeName && (a.currentThemeName = e, C(`主题变更检测: startrek CSS ${c ? "已加载" : "未加载"}`), c && a.serifFontMode && le(), !c && a.serifFontMode && a.originalEditorFont !== null && he(), c && a.queryFontUnifyMode ? ce() : c || de(), re());
};
async function it(c) {
  a.pluginName = c;
  const e = (o) => ({
    fullMode: {
      label: "跃迁引擎",
      description: "电脑太卡！关闭跃迁引擎！(ಥ_ಥ)",
      type: "boolean",
      defaultValue: !0
    },
    ...o ? {
      powerLevel: {
        label: "引擎功率",
        description: "最大功率：密度×1.0 | 巡航功率：密度×0.8 | 引擎怠速：密度×0.6。跃迁期间自动解锁帧率",
        type: "singleChoice",
        defaultValue: "full",
        choices: [
          { label: "最大功率", value: "full" },
          { label: "巡航功率", value: "cruise" },
          { label: "引擎怠速", value: "standby" }
        ]
      }
    } : {},
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
  await orca.plugins.setSettingsSchema(a.pluginName, e(!0));
  const t = () => {
    var b;
    const o = (b = orca.state.plugins[a.pluginName]) == null ? void 0 : b.settings, f = !!(o != null && o.debugMode), h = (o == null ? void 0 : o.fullMode) !== !1, d = !!(o != null && o.serifFontMode), p = !!(o != null && o.queryFontUnifyMode);
    a.debugMode = f, Ae(a.debugMode);
    const g = (o == null ? void 0 : o.powerLevel) || "full";
    g !== a.powerLevel && (a.powerLevel = g, We(g)), d !== a.serifFontMode && (a.serifFontMode = d, a.serifFontMode && a.currentThemeName === k && le(), !a.serifFontMode && a.originalEditorFont !== null && he()), p !== a.queryFontUnifyMode && (a.queryFontUnifyMode = p, a.queryFontUnifyMode && a.currentThemeName === k ? ce() : a.queryFontUnifyMode || de()), h !== a.fullMode ? (a.fullMode = h, re(), orca.plugins.setSettingsSchema(a.pluginName, e(h))) : a.fullMode = h;
  };
  t();
  const { subscribe: n } = window.Valtio;
  ee = n(orca.state.plugins, () => {
    t();
  }), orca.themes.register(a.pluginName, k, "themes/startrek.css"), Z = Je(), tt(), et(), G = new MutationObserver(() => {
    ot();
  }), G.observe(document.head, { childList: !0, subtree: !1 }), document.querySelector(ve) ? (a.currentThemeName = k, C("检测到 startrek CSS 已加载，当前主题即为目标主题"), a.serifFontMode && le(), a.queryFontUnifyMode && ce()) : a.currentThemeName = "", re(), C(`${a.pluginName} loaded.`);
}
async function st() {
  orca.themes.unregister(k), a.originalEditorFont !== null && he(), de(), Z && (Z.disconnect(), Z = null), J && (J.disconnect(), J = null), K && (document.removeEventListener("mouseenter", K, !0), K = null), Y && (document.removeEventListener("focusin", Y, !0), Y = null), V && (document.removeEventListener("focusout", V, !0), V = null), G && (G.disconnect(), G = null), ee && (ee(), ee = null), N && (N(), N = null), C(`${a.pluginName} unloaded.`);
}
export {
  it as load,
  st as unload
};
