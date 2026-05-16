var $e = Object.defineProperty;
var Re = (s, e, t) => e in s ? $e(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var E = (s, e, t) => Re(s, typeof e != "symbol" ? e + "" : e, t);
let $ = !1;
const T = (...s) => {
  $ && console.log("[oh-StarTrek]", ...s);
};
function _e(s) {
  $ = s, s && T("调试模式已开启");
}
const Ce = "#12c2e9", ke = "#e98812", ye = (s) => {
  const e = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(s);
  return e ? {
    r: parseInt(e[1], 16),
    g: parseInt(e[2], 16),
    b: parseInt(e[3], 16)
  } : ($ && console.warn("[oh-StarTrek] hexToRgb 解析失败:", s, "，使用 fallback"), { r: 18, g: 194, b: 233 });
};
let X = { r: 18, g: 194, b: 233 }, G = { r: 233, g: 136, b: 18 };
function Ie() {
  try {
    const s = getComputedStyle(document.documentElement), e = s.getPropertyValue("--startrek-slate").trim() || Ce, t = s.getPropertyValue("--startrek-orange").trim() || ke;
    X = ye(e), G = ye(t), T(`initColors: cyan=rgb(${X.r},${X.g},${X.b}), orange=rgb(${G.r},${G.g},${G.b})`);
  } catch {
    T("initColors failed, using defaults");
  }
}
const De = 0.6, ge = () => Math.random() < De ? X : G, Ne = 400, we = 1600, Be = 500, H = 4, ae = 36, D = 1, z = 2, Me = 0.07, N = 250, Oe = 1 / 12e3, We = 30, He = 300, ve = 8, k = 0.1, Ue = 0.15, Se = 0.25, qe = 0.08, ze = 0.04, Xe = 8, Ge = 0.03, Pe = 0.1, Ye = 30, U = {
  full: { maxFps: 120, densityMultiplier: 1, label: "满功率" },
  cruise: { maxFps: 60, densityMultiplier: 0.8, label: "巡航功率" },
  standby: { maxFps: 30, densityMultiplier: 0.6, label: "待机功率" }
};
let Z = "full";
function Ve(s) {
  s !== Z && (Z = s, T(`引擎功率切换: ${U[s].label} (fps上限=${U[s].maxFps}, 密度×${U[s].densityMultiplier})`), re = !0);
}
let re = !1;
const Qe = 16;
class Ke {
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
    E(this, "cruiseDuration", we);
    this.hideable = e;
    const t = e.querySelectorAll(".orca-startrek-starfield");
    t.length > 0 && (T(`constructor: 清除 ${t.length} 个残留 canvas`), t.forEach((n) => n.remove())), this.canvas = document.createElement("canvas"), this.canvas.className = "orca-startrek-starfield", this.canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;", e.appendChild(this.canvas), this.resize();
  }
  /** 原地覆写：将星星重置为从圆边缘出发（跃迁回收用，零 GC） */
  resetAsCenterStar(e) {
    const t = this.canvasW / 2, n = this.canvasH / 2, o = Math.min(this.canvasW, this.canvasH) * (0.05 + Math.random() * 0.35), f = Math.random() * Math.PI * 2, h = t + Math.cos(f) * o, d = n + Math.sin(f) * o, p = Math.atan2(d - n, h - t), g = Math.sqrt(t * t + n * n), w = Math.min(1, o / g), m = ge();
    e.ox = h, e.oy = d, e.x = h, e.y = d, e.vx = 0, e.prevX = h, e.morphicPhase = "idle", e.morphicPeak = 0, e.size = 0.3 + Math.random() * 0.8, e.baseAlpha = 0.15 + Math.random() * 0.25, e.twinkleSpeed = 0.5 + Math.random() * 2, e.twinkleOffset = Math.random() * Math.PI * 2, e.warpAngle = p, e.warpSpeed = H + (ae - H) * w, e.warpBornInWarp = !0, e.warpStreak = Math.random() < 0.5, e.colorR = m.r, e.colorG = m.g, e.colorB = m.b;
  }
  /** 创建一颗随机位置的常驻星星 */
  makeStar(e, t) {
    const n = Math.random() * this.canvasW, i = e + Math.random() * (t - e), o = ge();
    return {
      ox: n,
      oy: i,
      x: n,
      y: i,
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
    const e = this.canvasH * Pe, t = this.canvasH + e * 2, n = this.canvasW * t, i = U[Z].densityMultiplier, o = Math.max(
      We,
      Math.min(He, Math.round(n * Oe * i))
    );
    for (let f = 0; f < o; f++)
      this.stars.push(this.makeStar(-e, this.canvasH + e));
  }
  /** 触发跃迁：进入加速期；warp 期间可重置巡航计时器
   *  @param cruiseDuration 巡航时长（ms），默认 CRUISE_DURATION
   */
  triggerWarp(e = we) {
    if (T(`triggerWarp: phase=${this.warpPhase}, stars=${this.stars.length}, cruise=${e}ms`), this.warpPhase === "ramp" || this.warpPhase === "decay") return;
    if (this.warpPhase === "warp") {
      this.phaseStart = performance.now(), T("triggerWarp: warp重置");
      return;
    }
    this.warpPhase = "ramp", this.phaseStart = performance.now(), this.cruiseDuration = e;
    const t = this.canvasW / 2, n = this.canvasH / 2, i = Math.sqrt(t * t + n * n);
    for (const o of this.stars) {
      const f = o.x - t, h = o.y - n, d = Math.sqrt(f * f + h * h);
      o.warpAngle = Math.atan2(h, f);
      const p = Math.min(1, d / i);
      o.warpSpeed = H + (ae - H) * p, o.warpBornInWarp = !1, o.warpStreak = Math.random() < 0.5;
    }
    if ($) {
      const o = this.stars.slice(0, 5).map((f) => `(${f.x.toFixed(0)},${f.y.toFixed(0)})`).join(" ");
      T(`triggerWarp: 星星样本 = ${o}`);
    }
    T(`triggerWarp: 进入ramp, 星星数=${this.stars.length}`);
  }
  /** 调整 canvas 尺寸（容差 2px，防止 1px 抖动反复重建星星） */
  resize() {
    const e = this.hideable.clientWidth, t = this.hideable.clientHeight;
    if (e === 0 || t === 0) return;
    const n = Math.abs(e - this.canvasW), i = Math.abs(t - this.canvasH);
    if ((n >= 2 || i >= 2) && (T(`resize: ${this.canvasW}x${this.canvasH} → ${e}x${t} (dw=${n}, dh=${i})`), this.canvasW = e, this.canvasH = t, this.canvas.width = e, this.canvas.height = t, this.ctx = this.canvas.getContext("2d"), this.generateStars(), this.warpPhase !== "normal")) {
      T(`resize: 跃迁中(${this.warpPhase})，重算跃迁方向`);
      const o = e / 2, f = t / 2;
      for (const h of this.stars) {
        const d = h.x - o, p = h.y - f;
        h.warpAngle = Math.atan2(p, d), h.warpSpeed = H + Math.random() * (ae - H), h.warpBornInWarp = !1;
      }
    }
  }
  /** 更新滚动位置 */
  updateScroll() {
    const e = this.hideable.querySelector(".orca-block-editor") ?? this.hideable;
    this.scrollY = e.scrollTop;
  }
  /** 画一个带拖尾的星星 */
  drawStreakStar(e, t, n, i, o, f, h, d, p) {
    if (this.ctx) {
      if (i > 0.5) {
        const g = e - Math.cos(n) * i, w = t - Math.sin(n) * i;
        this.ctx.beginPath(), this.ctx.moveTo(g, w), this.ctx.lineTo(e, t), this.ctx.strokeStyle = `rgba(${h},${d},${p},${f * 0.5})`, this.ctx.lineWidth = Math.max(0.5, o * 0.7), this.ctx.stroke();
      }
      this.ctx.beginPath(), this.ctx.arc(e, t, o, 0, Math.PI * 2), this.ctx.fillStyle = `rgba(255,255,255,${f})`, this.ctx.fill();
    }
  }
  /** 调试模式：画一颗亮红色圆点 + 方向线 */
  drawDebugDot(e, t, n) {
    if (n.beginPath(), n.arc(e.x, e.y, 3, 0, Math.PI * 2), n.fillStyle = "#ff0000", n.fill(), t) {
      const i = e.warpSpeed * 10;
      n.beginPath(), n.moveTo(e.x, e.y), n.lineTo(
        e.x + Math.cos(e.warpAngle) * i,
        e.y + Math.sin(e.warpAngle) * i
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
  drawNormal(e, t, n, i, o, f) {
    if (n) {
      const l = e.x - i, u = e.y - o, b = Math.sqrt(l * l + u * u);
      if (b < N && b > 0) {
        const L = (1 - b / N) * ve, v = e.ox - l / b * L, O = e.oy - u / b * L;
        e.x += (v - e.x) * k, e.y += (O - e.y) * k;
      } else
        e.x += (e.ox - e.x) * k, e.y += (e.oy - e.y) * k;
    } else
      e.x += (e.ox - e.x) * k, e.y += (e.oy - e.y) * k;
    const h = this.canvasW * Se;
    if (this.handleGravityX.length > 0) {
      for (const l of this.handleGravityX) {
        const u = l - e.x, b = Math.abs(u);
        if (b < h && b > 1) {
          const M = Math.pow(1 - b / h, 1.5);
          e.x += u * M * qe;
        }
      }
      e.morphicPhase !== "active" && (e.morphicPhase = "active");
    } else
      e.morphicPhase === "active" && (e.morphicPhase = "decay"), e.morphicPhase === "decay" ? (e.x += (e.ox - e.x) * ze, e.morphicPeak > 0 ? (e.morphicPeak *= 1 - Ge, e.morphicPeak < 0.01 && (e.morphicPeak = 0, e.morphicPhase = "idle")) : e.morphicPhase = "idle") : e.x += (e.ox - e.x) * k;
    if (e.y < -2 || e.y > this.canvasH + 2) return !1;
    let d = 0;
    if (e.morphicPhase === "active" && this.handleDragging) {
      const l = this.canvasW * Se;
      for (const u of this.handleGravityX) {
        const b = Math.abs(e.ox - u);
        b < l && (d = Math.max(d, Math.pow(1 - b / l, 1.5)));
      }
      e.morphicPeak = d;
    } else e.morphicPhase === "decay" && (d = e.morphicPeak);
    const p = e.x - e.prevX;
    e.prevX = e.x;
    const g = Math.abs(p) * Xe;
    if (g > 0.5) {
      const l = p > 0 ? 0 : Math.PI, u = 1 + (z - 1) * d, b = e.size * u;
      let M = e.baseAlpha + D * d;
      return M = Math.min(1, M), this.drawStreakStar(e.x, e.y, l, g, b, M, e.colorR, e.colorG, e.colorB), !0;
    }
    const w = 1 + (z - 1) * d, m = e.size * w, c = D * d;
    if ($)
      return this.drawDebugDot(e, !1, t), !0;
    if (n) {
      const l = e.x - i, u = e.y - o, b = Math.sqrt(l * l + u * u), M = b < N ? 1 - b / N : 0, L = Math.sin(f * 1e-3 * e.twinkleSpeed + e.twinkleOffset) * 0.5 + 0.5;
      let v = e.baseAlpha;
      v += M * 0.9, v += L * 0.25 * M, v += c, v = Math.min(1, v), t.beginPath(), t.arc(e.x, e.y, m * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${v * 0.12})`, t.fill(), t.beginPath(), t.arc(e.x, e.y, m, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${v})`, t.fill();
    } else {
      let l = e.baseAlpha + c;
      l = Math.min(1, l), t.beginPath(), t.arc(e.x, e.y, m * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${l * 0.12})`, t.fill(), t.beginPath(), t.arc(e.x, e.y, m, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${l})`, t.fill();
    }
    return !0;
  }
  /** 加速期：速度/拖尾/亮度从0渐增 */
  drawRamp(e, t, n, i, o, f, h, d) {
    if (e.warpStreak) {
      const p = Math.sqrt(
        (e.x - i) * (e.x - i) + (e.y - o) * (e.y - o)
      ), g = Math.min(1, p / f), w = 5 - 4 * g, m = Math.pow(n, w), c = e.warpSpeed * m;
      if (e.x += Math.cos(e.warpAngle) * c, e.y += Math.sin(e.warpAngle) * c, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if ($)
        this.drawDebugDot(e, !0, t);
      else {
        const l = 1 + (z - 1) * m * g, u = e.size * l, b = D * m;
        let M = e.baseAlpha + b;
        M = Math.min(1, M);
        const L = c * 6;
        this.drawStreakStar(e.x, e.y, e.warpAngle, L, u, M, e.colorR, e.colorG, e.colorB);
      }
    } else {
      const p = Math.sqrt(
        (e.x - i) * (e.x - i) + (e.y - o) * (e.y - o)
      ), w = 5 - 4 * Math.min(1, p / f), m = Math.pow(n, w), c = e.warpSpeed * Me * m;
      if (e.x += Math.cos(e.warpAngle) * c, e.y += Math.sin(e.warpAngle) * c, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if ($)
        this.drawDebugDot(e, !1, t);
      else {
        let l = e.baseAlpha + D * m;
        l = Math.min(1, l), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${l})`, t.fill();
      }
    }
    return !0;
  }
  /** 巡航期：全速→减速停下，拖尾缩短 */
  drawWarp(e, t, n, i, o, f, h, d) {
    if (e.warpStreak) {
      const p = e.warpSpeed * (1 - n * n);
      if (e.x += Math.cos(e.warpAngle) * p, e.y += Math.sin(e.warpAngle) * p, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if ($)
        this.drawDebugDot(e, !0, t);
      else {
        const g = Math.sqrt(
          (e.x - i) * (e.x - i) + (e.y - o) * (e.y - o)
        ), w = 1 + (z - 1) * Math.min(1, g / f), m = e.size * w;
        let c = e.baseAlpha + D;
        c = Math.min(1, c);
        const l = p * 6;
        this.drawStreakStar(e.x, e.y, e.warpAngle, l, m, c, e.colorR, e.colorG, e.colorB);
      }
    } else {
      const p = e.warpSpeed * Me * (1 - n * n);
      if (e.x += Math.cos(e.warpAngle) * p, e.y += Math.sin(e.warpAngle) * p, e.x < -50 || e.x > h + 50 || e.y < -50 || e.y > d + 50)
        return this.resetAsCenterStar(e), !1;
      if ($)
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
  drawDecay(e, t, n, i, o, f, h, d, p, g) {
    const w = 1 - (1 - n) * (1 - n), m = w;
    if (d && m > 0.01) {
      const c = e.x - p, l = e.y - g, u = Math.sqrt(c * c + l * l), b = u < N ? 1 - u / N : 0;
      if (u < N && u > 0) {
        const M = b * ve * m;
        e.x += (e.ox - c / u * M - e.x) * k, e.y += (e.oy - l / u * M - e.y) * k;
      } else
        e.x += (e.ox - e.x) * k * m, e.y += (e.oy - e.y) * k * m;
    }
    if (e.y < -2 || e.y > h + 2) return !1;
    if ($)
      this.drawDebugDot(e, !1, t);
    else {
      const c = D * (1 - w);
      let l = e.baseAlpha + c;
      l = Math.min(1, l);
      const u = Math.sqrt(
        (e.x - i) * (e.x - i) + (e.y - o) * (e.y - o)
      ), b = 1 + (z - 1) * (1 - w) * Math.min(1, u / f), M = e.size * b;
      t.beginPath(), t.arc(e.x, e.y, M, 0, Math.PI * 2), t.fillStyle = `rgba(255,255,255,${l})`, t.fill();
      const L = l * 0.12 * (1 - w);
      L > 0.01 && (t.beginPath(), t.arc(e.x, e.y, M * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${L})`, t.fill());
    }
    return !0;
  }
  /** 绘制一帧 */
  draw(e, t, n, i) {
    if (!this.ctx) return;
    this.fpsFrameCount++, e - this.fpsLastTime >= 1e3 && (this.fps = this.fpsFrameCount, this.fpsFrameCount = 0, this.fpsLastTime = e), this.handleGravityX = [], this.handleDragging = !1;
    const o = this.hideable.querySelector(".orca-lcars-width-handle.dragging");
    if (o) {
      this.handleDragging = !0;
      const a = this.hideable.getBoundingClientRect(), A = o.getBoundingClientRect(), q = A.left + A.width / 2 - a.left;
      this.handleGravityX.push(q);
      const J = o.closest(".orca-block-editor");
      if (J) {
        const ne = J.querySelectorAll(".orca-lcars-width-handle");
        for (const W of ne)
          if (!W.classList.contains("dragging")) {
            const be = W.getBoundingClientRect();
            this.handleGravityX.push(be.left + be.width / 2 - a.left);
          }
      }
    }
    const h = (this.scrollY - this.prevScrollY) * Ue;
    this.prevScrollY = this.scrollY;
    const d = this.canvasH * Pe, p = -d, g = this.canvasH + d;
    if (this.warpPhase === "normal" || this.warpPhase === "decay")
      for (const a of this.stars)
        a.oy -= h, a.y -= h, a.oy > g ? (a.ox = Math.random() * this.canvasW, a.oy = p - Math.random() * d * 0.5, a.x = a.ox, a.y = a.oy, a.prevX = a.x) : a.oy < p && (a.ox = Math.random() * this.canvasW, a.oy = g + Math.random() * d * 0.5, a.x = a.ox, a.y = a.oy, a.prevX = a.x);
    this.frameCount++;
    let w = 0, m = 0;
    const c = this.ctx, l = this.canvasW, u = this.canvasH;
    c.clearRect(0, 0, l, u), $ && (c.fillStyle = "rgba(255, 255, 0, 0.15)", c.fillRect(0, 0, l, u));
    const b = l / 2, M = u / 2, L = Math.sqrt(l * l + u * u) / 2;
    let v = 0;
    if (this.warpPhase !== "normal") {
      const a = this.warpPhase === "ramp" ? Ne : this.warpPhase === "warp" ? this.cruiseDuration : Be;
      v = Math.max(0, Math.min(1, (e - this.phaseStart) / a)), v >= 1 && (this.warpPhase === "ramp" ? (this.warpPhase = "warp", this.phaseStart = e, v = 0, T("draw: ramp→warp")) : this.warpPhase === "warp" ? (this.warpPhase = "decay", this.phaseStart = e, v = 0, T("draw: warp→decay")) : this.warpPhase === "decay" && (this.warpPhase = "normal", v = 0, T("draw: decay→normal")));
    }
    const O = this.warpPhase !== "normal", S = this.fps === 0 || this.fps >= Ye, C = O && S;
    if ($)
      c.shadowBlur = 0;
    else if (C)
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
    if ($ && this.warpPhase === "ramp" && v < 0.05) {
      const a = this.stars.slice(0, 5).map((A) => `(${A.x.toFixed(0)},${A.y.toFixed(0)})`).join(" ");
      T(`ramp-early: p=${v.toFixed(3)}, 星星样本 = ${a}`);
    }
    for (let a = this.stars.length - 1; a >= 0; a--) {
      const A = this.stars[a], q = A.colorR, J = A.colorG, ne = A.colorB;
      switch (C && (c.shadowColor = `rgba(${q}, ${J}, ${ne}, 0.8)`), this.warpPhase) {
        case "normal": {
          if (!this.drawNormal(A, c, t, n, i, e)) continue;
          break;
        }
        case "ramp": {
          if (!this.drawRamp(A, c, v, b, M, L, l, u)) continue;
          break;
        }
        case "warp": {
          if (!this.drawWarp(A, c, v, b, M, L, l, u)) continue;
          break;
        }
        case "decay": {
          if (!this.drawDecay(A, c, v, b, M, L, u, t, n, i)) continue;
          break;
        }
      }
    }
    if (this.warpPhase !== "normal")
      for (const a of this.stars)
        a.ox = a.x, a.oy = a.y, a.prevX = a.x;
    let P = 0, x = 0, y = 0, F = 0;
    if ($) {
      P = 1 / 0, x = -1 / 0, y = 1 / 0, F = -1 / 0;
      for (const a of this.stars)
        a.x < P && (P = a.x), a.x > x && (x = a.x), a.y < y && (y = a.y), a.y > F && (F = a.y), a.x >= 0 && a.x <= l && a.y >= 0 && a.y <= u ? w++ : m++;
    }
    if ($) {
      c.shadowBlur = 0;
      const a = this.hideable.querySelectorAll(".orca-startrek-starfield").length;
      c.fillStyle = "#ff0000", c.font = "bold 14px monospace", c.textBaseline = "top", c.fillText(`phase: ${this.warpPhase} | fps: ${this.fps} | ${U[Z].label}`, 10, 10), c.fillText(`stars: ${this.stars.length} | inCanvas: ${w} | offCanvas: ${m}`, 10, 30), c.fillText(`canvas: ${l}x${u} | canvases: ${a}`, 10, 50), a > 1 && c.fillText(`⚠ 检测到 ${a} 个 canvas！`, 10, 70);
    }
    if (c.shadowBlur = 0, $) {
      const a = this.warpPhase !== "normal" ? 1 : 60;
      this.frameCount % a === 0 && T(`tick: phase=${this.warpPhase}, stars=${this.stars.length}, inCanvas=${w}, x=[${P.toFixed(0)},${x.toFixed(0)}] y=[${y.toFixed(0)},${F.toFixed(0)}], canvas=${l}x${u}`);
    }
  }
  /** 销毁实例 */
  destroy() {
    this.canvas.remove(), this.ctx = null, this.stars = [];
  }
}
function je() {
  const s = window.__startrek_cleanup;
  s && (T("startStarfield: 清理上一套残留实例"), s());
  let e = 0, t = -999, n = -999, i = null;
  const o = /* @__PURE__ */ new Map();
  Ie();
  const f = () => {
    const S = document.querySelector(".orca-panels-container");
    if (!S) return;
    const C = S.querySelectorAll(
      ".orca-hideable:not(.orca-hideable-hidden):not(.orca-memoizedviews-active)"
    );
    for (const P of C) {
      const x = P;
      o.has(x) || o.set(x, new Ke(x));
    }
    for (const [P, x] of o)
      (!document.body.contains(P) || P.classList.contains("orca-hideable-hidden") || P.classList.contains("orca-memoizedviews-active")) && (x.destroy(), o.delete(P));
  };
  let h = 0;
  const d = (S) => {
    const x = 1e3 / (Array.from(o.values()).some((y) => y.warpPhase !== "normal") ? 120 : U[Z].maxFps);
    if (S - h < x) {
      e = requestAnimationFrame(d);
      return;
    }
    if (h = S, re) {
      re = !1;
      for (const [, y] of o)
        y.generateStars();
    }
    for (const [y, F] of o) {
      if (y.classList.contains("orca-hideable-hidden") || y.classList.contains("orca-memoizedviews-active") || !document.body.contains(y)) {
        F.destroy(), o.delete(y);
        continue;
      }
      F.resize(), F.updateScroll();
      const a = F.hideable === i, A = a ? t : -999, q = a ? n : -999;
      F.draw(S, a, A, q);
    }
    e = requestAnimationFrame(d);
  };
  let p = 0;
  const g = (S) => {
    var x;
    const C = performance.now();
    if (C - p < Qe) {
      if (i && o.has(i)) {
        const y = i.getBoundingClientRect();
        t = S.clientX - y.left, n = S.clientY - y.top;
      }
      return;
    }
    p = C;
    const P = document.elementFromPoint(S.clientX, S.clientY);
    if (P) {
      const y = (x = P.closest) == null ? void 0 : x.call(P, ".orca-hideable");
      if (y && o.has(y)) {
        i = y;
        const F = y.getBoundingClientRect();
        t = S.clientX - F.left, n = S.clientY - F.top;
      } else
        i = null, t = -999, n = -999;
    }
  }, w = () => {
    i = null, t = -999, n = -999;
  };
  document.addEventListener("pointermove", g), document.addEventListener("pointerleave", w);
  const m = new MutationObserver((S) => {
    var C, P;
    for (const x of S) {
      if (x.type !== "attributes") continue;
      const y = x.target;
      if (x.attributeName === "class" && y.classList.contains("orca-repr-task-content") && y.classList.contains("orca-repr-task-1") && !y.classList.contains("orca-repr-task-0")) {
        const F = y.closest(".orca-hideable");
        if (F) {
          const a = o.get(F);
          a && a.triggerWarp();
        }
      }
      if (x.attributeName === "data-status" && ((C = y.dataset) == null ? void 0 : C.name) === "task" && ((P = y.dataset) == null ? void 0 : P.status) === "Done") {
        if (!y.closest(".orca-repr-main-content")) continue;
        const a = y.closest(".orca-hideable");
        if (a) {
          const A = o.get(a);
          A && (T("bigTaskObserver: 大任务完成，触发 5 秒跃迁"), A.triggerWarp(4100));
        }
      }
    }
  });
  m.observe(document.body, {
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
  let l = !1;
  const u = (S) => {
    l || (l = !0, cancelAnimationFrame(e), T(`暂停渲染: ${S}`));
  }, b = (S) => {
    l && (l = !1, h = 0, e = requestAnimationFrame(d), T(`恢复渲染: ${S}`));
  }, M = () => {
    document.hidden ? u("visibilitychange") : b("visibilitychange");
  }, L = () => u("window blur"), v = () => b("window focus");
  document.addEventListener("visibilitychange", M), window.addEventListener("blur", L), window.addEventListener("focus", v), f(), setTimeout(f, 500), setTimeout(f, 2e3), e = requestAnimationFrame(d);
  const O = () => {
    cancelAnimationFrame(e), document.removeEventListener("pointermove", g), document.removeEventListener("pointerleave", w), document.removeEventListener("visibilitychange", M), window.removeEventListener("blur", L), window.removeEventListener("focus", v), c.disconnect(), m.disconnect();
    for (const [, S] of o)
      S.destroy();
    o.clear(), document.querySelectorAll(".orca-startrek-starfield").forEach((S) => S.remove()), Reflect.deleteProperty(window, "__startrek_cleanup");
  };
  return window.__startrek_cleanup = O, O;
}
let Ae = "en", Ee = {};
function Ze(s, e) {
  Ae = s, Ee = e;
}
function R(s, e, t) {
  var i;
  return ((i = Ee[t ?? Ae]) == null ? void 0 : i[s]) ?? s;
}
const xe = {
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
  "Three-Line Table": "三线表",
  "Academic-style table: only top border, header separator, and bottom border. Top/bottom 3px at 80% opacity, header line 2px at 80%.": "学术风格三线表：仅保留顶线、表头分隔线和底线。顶线和底线 3px 80% 透明度，表头线 2px 80% 透明度",
  "Debug Mode": "调试模式"
}, I = "oh-StarTrek", se = 55, le = 54, ie = "Noto Serif SC", Te = '"Noto Serif", "Noto Serif SC", "Source Han Serif SC", Georgia, "STSong", "SimSun", serif', Je = 200, et = 500, tt = 150, ot = 0.15, nt = 400, at = 1500, it = 200, rt = 0.6, Fe = 'link[rel="stylesheet"][href*="startrek"]', r = {
  pluginName: "",
  debugMode: !1,
  fullMode: !0,
  serifFontMode: !1,
  queryFontUnifyMode: !1,
  threeLineTableMode: !1,
  threeLineTableAutoByTheme: !1,
  currentThemeName: null,
  originalEditorFont: null,
  originalUIFont: null,
  powerLevel: "full"
}, _ = (...s) => {
  r.debugMode && console.log("[oh-StarTrek]", ...s);
};
let ee = null, te = null, Y = null, oe = null, B = null, V = null, Q = null, K = null;
function st() {
  const s = (t = document) => {
    t.querySelectorAll(".orca-select-menu .orca-select-item-label").forEach((n) => {
      var o;
      const i = (o = n.textContent) == null ? void 0 : o.trim();
      i && (n.dataset.fontPreview || i !== "默认" && (n.style.fontFamily = `"${i}", sans-serif`, n.dataset.fontPreview = i));
    });
  };
  setTimeout(() => s(), 2e3);
  const e = new MutationObserver((t) => {
    for (const n of t)
      if (n.type === "childList" && n.addedNodes.length > 0)
        for (const i of n.addedNodes)
          i instanceof Element && s(i);
  });
  return e.observe(document.body, { childList: !0, subtree: !0 }), e;
}
function lt() {
  const s = (e) => {
    const t = e.closest(".orca-input");
    if (!t) return;
    const n = t.offsetWidth, i = Math.max(Je, Math.min(et, tt + n * ot));
    t.style.setProperty("--startrek-input-spread-dur", `${i}ms`);
  };
  V = (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const t = e.target.closest(".orca-input");
    t && (s(e.target), t.style.setProperty("--startrek-input-spread", "1"));
  }, Q = (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const t = e.target.closest(".orca-input");
    t && t.style.removeProperty("--startrek-input-spread");
  }, document.addEventListener("focusin", V, !0), document.addEventListener("focusout", Q, !0);
}
function ct() {
  const s = (t) => {
    const n = t.offsetHeight, i = Math.max(nt, Math.min(at, it + n * rt));
    t.style.setProperty("--startrek-scope-spread-dur", `${i}ms`);
  };
  K = (t) => {
    var i, o;
    if (!(t.target instanceof HTMLElement)) return;
    const n = (o = (i = t.target).closest) == null ? void 0 : o.call(i, ".orca-repr-scope-line");
    n && s(n);
  }, document.addEventListener("mouseenter", K, !0);
  const e = new MutationObserver((t) => {
    for (const n of t)
      if (n.type === "attributes" && n.attributeName === "class") {
        const i = n.target;
        if (i.classList.contains("orca-active-parent")) {
          const o = i.querySelector(".orca-repr-scope-line");
          o && s(o);
        }
      }
  });
  e.observe(document.body, { attributes: !0, subtree: !0, attributeFilter: ["class"] }), te = e;
}
function ce() {
  _(`applyStarfield: currentThemeName="${r.currentThemeName}", THEME_NAME="${I}", fullMode=${r.fullMode}`), B && (B(), B = null), r.currentThemeName === I && r.fullMode ? (B = je(), _("星空已启动")) : _(`星空未启动（${r.currentThemeName !== I ? "主题不匹配" : "满血模式关闭"}）`);
}
function he() {
  r.originalEditorFont === null && (r.originalEditorFont = orca.state.settings[se]), r.originalUIFont === null && (r.originalUIFont = orca.state.settings[le]), orca.state.settings[se] = ie, orca.state.settings[le] = ie, document.documentElement.style.setProperty("--orca-fontfamily-editor", Te), document.documentElement.style.setProperty("--orca-fontfamily-ui", Te), _(`已设置字体为 ${ie}（设置值 + CSS 变量）`);
}
function fe() {
  r.originalEditorFont !== null && (orca.state.settings[se] = r.originalEditorFont), r.originalUIFont !== null && (orca.state.settings[le] = r.originalUIFont), document.documentElement.style.removeProperty("--orca-fontfamily-editor"), document.documentElement.style.removeProperty("--orca-fontfamily-ui"), r.originalEditorFont = null, r.originalUIFont = null, _("已恢复用户原始字体设置");
}
const Le = "startrek-query-font-unified", j = "startrek-three-line-table", ht = `
.startrek-three-line-table .orca-table2:not(.orca-table2-no-border) .orca-table2-cell {
    --orca-border-general: none !important;
    border: none !important;
}
.startrek-three-line-table .orca-table2:not(.orca-table2-no-border) .orca-table2-cell[data-r="1"] {
    border-top: 3px solid color-mix(in oklab, var(--orca-color-text-2, var(--orca-color-border, hsl(0 0% 25%))) 80%, transparent) !important;
    border-bottom: 2px solid color-mix(in oklab, var(--orca-color-text-2, var(--orca-color-border, hsl(0 0% 25%))) 80%, transparent) !important;
}
.startrek-three-line-table .orca-table2:not(.orca-table2-no-border) .orca-table2-cell.orca-table2-last-row {
    border-bottom: 3px solid color-mix(in oklab, var(--orca-color-text-2, var(--orca-color-border, hsl(0 0% 25%))) 80%, transparent) !important;
}
/* P1-2: 表格内输入框流光恢复 */
.startrek-three-line-table .orca-table2:not(.orca-table2-no-border) .orca-table2-cell .orca-input {
    border-bottom: 1px solid var(--orca-color-gray-4, hsl(0 0% 65%)) !important;
}
.startrek-three-line-table .orca-table2:not(.orca-table2-no-border) .orca-table2-cell .orca-input:focus-within {
    border-bottom-color: transparent !important;
}
`;
function de() {
  document.documentElement.classList.add(Le), _("已开启查询字体统一化");
}
function pe() {
  document.documentElement.classList.remove(Le), _("已关闭查询字体统一化");
}
function ue() {
  document.documentElement.classList.add(j);
  let s = document.getElementById(j);
  if (s || (s = document.createElement("style"), s.id = j, s.textContent = ht, document.head.appendChild(s)), r.debugMode) {
    const e = !!document.querySelector('.orca-table2-cell[data-r="1"]'), t = !!document.querySelector(".orca-table2-cell.orca-table2-last-row");
    (!e || !t) && _(`⚠ 三线表选择器警告: [data-r="1"]=${e}, .orca-table2-last-row=${t} — 当前页面无表格，或 Orca 版本变更了 DOM 结构`);
  }
  _("已开启三线表");
}
function me() {
  document.documentElement.classList.remove(j);
  const s = document.getElementById(j);
  s && s.remove(), _("已关闭三线表");
}
const dt = () => {
  const s = !!document.querySelector(Fe), e = s ? I : "";
  e !== r.currentThemeName && (r.currentThemeName = e, _(`主题变更检测: startrek CSS ${s ? "已加载" : "未加载"}`), s && r.serifFontMode && he(), !s && r.serifFontMode && r.originalEditorFont !== null && fe(), s && r.queryFontUnifyMode ? de() : s || pe(), s && !r.threeLineTableMode ? (r.threeLineTableMode = !0, r.threeLineTableAutoByTheme = !0, ue()) : !s && r.threeLineTableAutoByTheme && (r.threeLineTableMode = !1, r.threeLineTableAutoByTheme = !1, me()), ce());
};
async function ft(s) {
  r.pluginName = s, Ze(orca.state.locale, { zh: xe, "zh-CN": xe });
  const e = (o) => ({
    fullMode: {
      label: R("Warp Engine"),
      description: R("Too laggy? Turn off the warp engine! (ಥ_ಥ)"),
      type: "boolean",
      defaultValue: !0
    },
    ...o ? {
      powerLevel: {
        label: R("Engine Power"),
        description: R("Full: density ×1.0 | Cruise: density ×0.8 | Standby: density ×0.6. Frame rate unlocks during warp."),
        type: "singleChoice",
        defaultValue: "full",
        choices: [
          { label: R("Full Power"), value: "full" },
          { label: R("Cruise"), value: "cruise" },
          { label: R("Standby"), value: "standby" }
        ]
      }
    } : {},
    serifFontMode: {
      label: R("Use Recommended Fonts"),
      description: R("When enabled, switching to this theme automatically sets editor & UI fonts to serif (Noto Serif SC). Disabling restores native behavior."),
      type: "boolean",
      defaultValue: !1
    },
    queryFontUnifyMode: {
      label: R("Unify Query Fonts"),
      description: R("When enabled, heading fonts in query results (cards/tables/lists) match body text font."),
      type: "boolean",
      defaultValue: !1
    },
    threeLineTableMode: {
      label: R("Three-Line Table"),
      description: R("Academic-style table: only top border, header separator, and bottom border. Top/bottom 3px at 80% opacity, header line 2px at 80%."),
      type: "boolean",
      defaultValue: !1
    },
    debugMode: {
      label: R("Debug Mode"),
      type: "boolean",
      defaultValue: !1
    }
  });
  await orca.plugins.setSettingsSchema(r.pluginName, e(!0));
  const t = () => {
    var m;
    const o = (m = orca.state.plugins[r.pluginName]) == null ? void 0 : m.settings, f = !!(o != null && o.debugMode), h = (o == null ? void 0 : o.fullMode) !== !1, d = !!(o != null && o.serifFontMode), p = !!(o != null && o.queryFontUnifyMode), g = !!(o != null && o.threeLineTableMode);
    r.debugMode = f, _e(r.debugMode);
    const w = (o == null ? void 0 : o.powerLevel) || "full";
    w !== r.powerLevel && (r.powerLevel = w, Ve(w)), d !== r.serifFontMode && (r.serifFontMode = d, r.serifFontMode && r.currentThemeName === I && he(), !r.serifFontMode && r.originalEditorFont !== null && fe()), p !== r.queryFontUnifyMode && (r.queryFontUnifyMode = p, r.queryFontUnifyMode && r.currentThemeName === I ? de() : r.queryFontUnifyMode || pe()), g !== r.threeLineTableMode && (r.threeLineTableMode = g, r.threeLineTableAutoByTheme = !1, r.threeLineTableMode ? ue() : me()), h !== r.fullMode ? (r.fullMode = h, ce(), orca.plugins.setSettingsSchema(r.pluginName, e(h))) : r.fullMode = h;
  };
  t();
  const { subscribe: n } = window.Valtio;
  oe = n(orca.state.plugins, () => {
    t();
  }), orca.themes.register(r.pluginName, I, "themes/startrek.css"), ee = st(), ct(), lt(), Y = new MutationObserver(() => {
    dt();
  }), Y.observe(document.head, { childList: !0, subtree: !1 }), document.querySelector(Fe) ? (r.currentThemeName = I, _("检测到 startrek CSS 已加载，当前主题即为目标主题"), r.serifFontMode && he(), r.queryFontUnifyMode && de()) : r.currentThemeName = "", r.threeLineTableMode && ue(), ce(), _(`${r.pluginName} loaded.`);
}
async function pt() {
  orca.themes.unregister(I), r.originalEditorFont !== null && fe(), pe(), me(), ee && (ee.disconnect(), ee = null), te && (te.disconnect(), te = null), K && (document.removeEventListener("mouseenter", K, !0), K = null), V && (document.removeEventListener("focusin", V, !0), V = null), Q && (document.removeEventListener("focusout", Q, !0), Q = null), Y && (Y.disconnect(), Y = null), oe && (oe(), oe = null), B && (B(), B = null), _(`${r.pluginName} unloaded.`);
}
export {
  ft as load,
  pt as unload
};
