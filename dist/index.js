var Me = Object.defineProperty;
var Se = (l, e, t) => e in l ? Me(l, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : l[e] = t;
var E = (l, e, t) => Se(l, typeof e != "symbol" ? e + "" : e, t);
let F = !1;
const P = (...l) => {
  F && console.log("[oh-StarTrek]", ...l);
};
function ve(l) {
  F = l, l && P("调试模式已开启");
}
const Pe = "#12c2e9", Ae = "#e98812", he = (l) => {
  const e = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(l);
  return e ? {
    r: parseInt(e[1], 16),
    g: parseInt(e[2], 16),
    b: parseInt(e[3], 16)
  } : (F && console.warn("[oh-StarTrek] hexToRgb 解析失败:", l, "，使用 fallback"), { r: 18, g: 194, b: 233 });
};
let B = { r: 18, g: 194, b: 233 }, W = { r: 233, g: 136, b: 18 };
function Fe() {
  try {
    const l = getComputedStyle(document.documentElement), e = l.getPropertyValue("--milk-slate").trim() || Pe, t = l.getPropertyValue("--milk-orange").trim() || Ae;
    B = he(e), W = he(t), P(`initColors: cyan=rgb(${B.r},${B.g},${B.b}), orange=rgb(${W.r},${W.g},${W.b})`);
  } catch {
    P("initColors failed, using defaults");
  }
}
const $e = 0.6, ue = () => Math.random() < $e ? B : W, Ee = 400, de = 1600, xe = 500, k = 4, J = 36, O = 1, ee = 2, fe = 0.07, D = 250, Te = 1 / 12e3, Ce = 30, Le = 300, pe = 8, L = 0.1, _e = 0.15, me = 0.1, Re = 30, N = {
  full: { maxFps: 120, densityMultiplier: 1, label: "满功率" },
  cruise: { maxFps: 60, densityMultiplier: 0.8, label: "巡航功率" },
  standby: { maxFps: 30, densityMultiplier: 0.6, label: "待机功率" }
};
let Y = "full";
function Ie(l) {
  l !== Y && (Y = l, P(`引擎功率切换: ${N[l].label} (fps上限=${N[l].maxFps}, 密度×${N[l].densityMultiplier})`), ne = !0);
}
let ne = !1;
const ke = 16;
class De {
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
    // 跃迁状态
    E(this, "warpPhase", "normal");
    E(this, "phaseStart", 0);
    E(this, "cruiseDuration", de);
    this.hideable = e;
    const t = e.querySelectorAll(".orca-startrek-starfield");
    t.length > 0 && (P(`constructor: 清除 ${t.length} 个残留 canvas`), t.forEach((o) => o.remove())), this.canvas = document.createElement("canvas"), this.canvas.className = "orca-startrek-starfield", this.canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;", e.appendChild(this.canvas), this.resize();
  }
  /** 原地覆写：将星星重置为从圆边缘出发（跃迁回收用，零 GC） */
  resetAsCenterStar(e) {
    const t = this.canvasW / 2, o = this.canvasH / 2, n = Math.min(this.canvasW, this.canvasH) * (0.05 + Math.random() * 0.35), h = Math.random() * Math.PI * 2, c = t + Math.cos(h) * n, f = o + Math.sin(h) * n, u = Math.atan2(f - o, c - t), m = Math.sqrt(t * t + o * o), b = Math.min(1, n / m), a = ue();
    e.ox = c, e.oy = f, e.x = c, e.y = f, e.size = 0.3 + Math.random() * 0.8, e.baseAlpha = 0.15 + Math.random() * 0.25, e.twinkleSpeed = 0.5 + Math.random() * 2, e.twinkleOffset = Math.random() * Math.PI * 2, e.warpAngle = u, e.warpSpeed = k + (J - k) * b, e.warpBornInWarp = !0, e.warpStreak = Math.random() < 0.5, e.colorR = a.r, e.colorG = a.g, e.colorB = a.b;
  }
  /** 创建一颗随机位置的常驻星星 */
  makeStar(e, t) {
    const o = Math.random() * this.canvasW, i = e + Math.random() * (t - e), n = ue();
    return {
      ox: o,
      oy: i,
      x: o,
      y: i,
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
    const e = this.canvasH * me, t = this.canvasH + e * 2, o = this.canvasW * t, i = N[Y].densityMultiplier, n = Math.max(
      Ce,
      Math.min(Le, Math.round(o * Te * i))
    );
    for (let h = 0; h < n; h++)
      this.stars.push(this.makeStar(-e, this.canvasH + e));
  }
  /** 触发跃迁：进入加速期；warp 期间可重置巡航计时器
   *  @param cruiseDuration 巡航时长（ms），默认 CRUISE_DURATION
   */
  triggerWarp(e = de) {
    if (P(`triggerWarp: phase=${this.warpPhase}, stars=${this.stars.length}, cruise=${e}ms`), this.warpPhase === "ramp" || this.warpPhase === "decay") return;
    if (this.warpPhase === "warp") {
      this.phaseStart = performance.now(), P("triggerWarp: warp重置");
      return;
    }
    this.warpPhase = "ramp", this.phaseStart = performance.now(), this.cruiseDuration = e;
    const t = this.canvasW / 2, o = this.canvasH / 2, i = Math.sqrt(t * t + o * o);
    for (const n of this.stars) {
      const h = n.x - t, c = n.y - o, f = Math.sqrt(h * h + c * c);
      n.warpAngle = Math.atan2(c, h);
      const u = Math.min(1, f / i);
      n.warpSpeed = k + (J - k) * u, n.warpBornInWarp = !1, n.warpStreak = Math.random() < 0.5;
    }
    if (F) {
      const n = this.stars.slice(0, 5).map((h) => `(${h.x.toFixed(0)},${h.y.toFixed(0)})`).join(" ");
      P(`triggerWarp: 星星样本 = ${n}`);
    }
    P(`triggerWarp: 进入ramp, 星星数=${this.stars.length}`);
  }
  /** 调整 canvas 尺寸（容差 2px，防止 1px 抖动反复重建星星） */
  resize() {
    const e = this.hideable.clientWidth, t = this.hideable.clientHeight;
    if (e === 0 || t === 0) return;
    const o = Math.abs(e - this.canvasW), i = Math.abs(t - this.canvasH);
    if ((o >= 2 || i >= 2) && (P(`resize: ${this.canvasW}x${this.canvasH} → ${e}x${t} (dw=${o}, dh=${i})`), this.canvasW = e, this.canvasH = t, this.canvas.width = e, this.canvas.height = t, this.ctx = this.canvas.getContext("2d"), this.generateStars(), this.warpPhase !== "normal")) {
      P(`resize: 跃迁中(${this.warpPhase})，重算跃迁方向`);
      const n = e / 2, h = t / 2;
      for (const c of this.stars) {
        const f = c.x - n, u = c.y - h;
        c.warpAngle = Math.atan2(u, f), c.warpSpeed = k + Math.random() * (J - k), c.warpBornInWarp = !1;
      }
    }
  }
  /** 更新滚动位置 */
  updateScroll() {
    const e = this.hideable.querySelector(".orca-block-editor") ?? this.hideable;
    this.scrollY = e.scrollTop;
  }
  /** 画一个带拖尾的星星 */
  drawStreakStar(e, t, o, i, n, h, c, f, u) {
    if (this.ctx) {
      if (i > 0.5) {
        const m = e - Math.cos(o) * i, b = t - Math.sin(o) * i;
        this.ctx.beginPath(), this.ctx.moveTo(m, b), this.ctx.lineTo(e, t), this.ctx.strokeStyle = `rgba(${c},${f},${u},${h * 0.5})`, this.ctx.lineWidth = Math.max(0.5, n * 0.7), this.ctx.stroke();
      }
      this.ctx.beginPath(), this.ctx.arc(e, t, n, 0, Math.PI * 2), this.ctx.fillStyle = `rgba(255,255,255,${h})`, this.ctx.fill();
    }
  }
  /** 调试模式：画一颗亮红色圆点 + 方向线 */
  drawDebugDot(e, t, o) {
    if (o.beginPath(), o.arc(e.x, e.y, 3, 0, Math.PI * 2), o.fillStyle = "#ff0000", o.fill(), t) {
      const i = e.warpSpeed * 10;
      o.beginPath(), o.moveTo(e.x, e.y), o.lineTo(
        e.x + Math.cos(e.warpAngle) * i,
        e.y + Math.sin(e.warpAngle) * i
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
  drawNormal(e, t, o, i, n, h) {
    if (o) {
      const c = e.x - i, f = e.y - n, u = Math.sqrt(c * c + f * f), m = u < D ? 1 - u / D : 0, b = Math.sin(h * 1e-3 * e.twinkleSpeed + e.twinkleOffset) * 0.5 + 0.5;
      if (u < D && u > 0) {
        const a = m * pe, p = e.ox - c / u * a, d = e.oy - f / u * a;
        e.x += (p - e.x) * L, e.y += (d - e.y) * L;
      } else
        e.x += (e.ox - e.x) * L, e.y += (e.oy - e.y) * L;
      if (e.y < -2 || e.y > this.canvasH + 2) return !1;
      if (F)
        this.drawDebugDot(e, !1, t);
      else {
        let a = e.baseAlpha;
        a += m * 0.9, a += b * 0.25 * m, a = Math.min(1, a), t.beginPath(), t.arc(e.x, e.y, e.size * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${a * 0.12})`, t.fill(), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${a})`, t.fill();
      }
    } else {
      if (e.x += (e.ox - e.x) * L, e.y += (e.oy - e.y) * L, e.y < -2 || e.y > this.canvasH + 2) return !1;
      F ? this.drawDebugDot(e, !1, t) : (t.beginPath(), t.arc(e.x, e.y, e.size * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${e.baseAlpha * 0.12})`, t.fill(), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${e.baseAlpha})`, t.fill());
    }
    return !0;
  }
  /** 加速期：速度/拖尾/亮度从0渐增 */
  drawRamp(e, t, o, i, n, h, c, f) {
    if (e.warpStreak) {
      const u = Math.sqrt(
        (e.x - i) * (e.x - i) + (e.y - n) * (e.y - n)
      ), m = Math.min(1, u / h), b = 5 - 4 * m, a = Math.pow(o, b), p = e.warpSpeed * a;
      if (e.x += Math.cos(e.warpAngle) * p, e.y += Math.sin(e.warpAngle) * p, e.x < -50 || e.x > c + 50 || e.y < -50 || e.y > f + 50)
        return this.resetAsCenterStar(e), !1;
      if (F)
        this.drawDebugDot(e, !0, t);
      else {
        const d = 1 + (ee - 1) * a * m, A = e.size * d, T = O * a;
        let $ = e.baseAlpha + T;
        $ = Math.min(1, $);
        const w = p * 6;
        this.drawStreakStar(e.x, e.y, e.warpAngle, w, A, $, e.colorR, e.colorG, e.colorB);
      }
    } else {
      const u = Math.sqrt(
        (e.x - i) * (e.x - i) + (e.y - n) * (e.y - n)
      ), b = 5 - 4 * Math.min(1, u / h), a = Math.pow(o, b), p = e.warpSpeed * fe * a;
      if (e.x += Math.cos(e.warpAngle) * p, e.y += Math.sin(e.warpAngle) * p, e.x < -50 || e.x > c + 50 || e.y < -50 || e.y > f + 50)
        return this.resetAsCenterStar(e), !1;
      if (F)
        this.drawDebugDot(e, !1, t);
      else {
        let d = e.baseAlpha + O * a;
        d = Math.min(1, d), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${d})`, t.fill();
      }
    }
    return !0;
  }
  /** 巡航期：全速→减速停下，拖尾缩短 */
  drawWarp(e, t, o, i, n, h, c, f) {
    if (e.warpStreak) {
      const u = e.warpSpeed * (1 - o * o);
      if (e.x += Math.cos(e.warpAngle) * u, e.y += Math.sin(e.warpAngle) * u, e.x < -50 || e.x > c + 50 || e.y < -50 || e.y > f + 50)
        return this.resetAsCenterStar(e), !1;
      if (F)
        this.drawDebugDot(e, !0, t);
      else {
        const m = Math.sqrt(
          (e.x - i) * (e.x - i) + (e.y - n) * (e.y - n)
        ), b = 1 + (ee - 1) * Math.min(1, m / h), a = e.size * b;
        let p = e.baseAlpha + O;
        p = Math.min(1, p);
        const d = u * 6;
        this.drawStreakStar(e.x, e.y, e.warpAngle, d, a, p, e.colorR, e.colorG, e.colorB);
      }
    } else {
      const u = e.warpSpeed * fe * (1 - o * o);
      if (e.x += Math.cos(e.warpAngle) * u, e.y += Math.sin(e.warpAngle) * u, e.x < -50 || e.x > c + 50 || e.y < -50 || e.y > f + 50)
        return this.resetAsCenterStar(e), !1;
      if (F)
        this.drawDebugDot(e, !1, t);
      else {
        let m = e.baseAlpha + O;
        m = Math.min(1, m), t.beginPath(), t.arc(e.x, e.y, e.size, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${m})`, t.fill();
      }
    }
    return !0;
  }
  /** 衰减期：亮度/大小/光晕缓回正常，引力渐入
   *  @todo [W-01 技术债务] 无鼠标时星星缺少缓动回归原位的 else 分支，
   *  对比 drawNormal 有对应逻辑。当前 decay 持续约 500ms，影响轻微，后续补 3 行 else 即可 */
  drawDecay(e, t, o, i, n, h, c, f, u, m) {
    const b = 1 - (1 - o) * (1 - o), a = b;
    if (f && a > 0.01) {
      const p = e.x - u, d = e.y - m, A = Math.sqrt(p * p + d * d), T = A < D ? 1 - A / D : 0;
      if (A < D && A > 0) {
        const $ = T * pe * a;
        e.x += (e.ox - p / A * $ - e.x) * L, e.y += (e.oy - d / A * $ - e.y) * L;
      } else
        e.x += (e.ox - e.x) * L * a, e.y += (e.oy - e.y) * L * a;
    }
    if (e.y < -2 || e.y > c + 2) return !1;
    if (F)
      this.drawDebugDot(e, !1, t);
    else {
      const p = O * (1 - b);
      let d = e.baseAlpha + p;
      d = Math.min(1, d);
      const A = Math.sqrt(
        (e.x - i) * (e.x - i) + (e.y - n) * (e.y - n)
      ), T = 1 + (ee - 1) * (1 - b) * Math.min(1, A / h), $ = e.size * T;
      t.beginPath(), t.arc(e.x, e.y, $, 0, Math.PI * 2), t.fillStyle = `rgba(255,255,255,${d})`, t.fill();
      const w = d * 0.12 * (1 - b);
      w > 0.01 && (t.beginPath(), t.arc(e.x, e.y, $ * 2.5, 0, Math.PI * 2), t.fillStyle = `rgba(${e.colorR},${e.colorG},${e.colorB},${w})`, t.fill());
    }
    return !0;
  }
  /** 绘制一帧 */
  draw(e, t, o, i) {
    if (!this.ctx) return;
    this.fpsFrameCount++, e - this.fpsLastTime >= 1e3 && (this.fps = this.fpsFrameCount, this.fpsFrameCount = 0, this.fpsLastTime = e);
    const h = (this.scrollY - this.prevScrollY) * _e;
    this.prevScrollY = this.scrollY;
    const c = this.canvasH * me, f = -c, u = this.canvasH + c;
    if (this.warpPhase === "normal" || this.warpPhase === "decay")
      for (const s of this.stars)
        s.oy -= h, s.y -= h, s.oy > u ? (s.ox = Math.random() * this.canvasW, s.oy = f - Math.random() * c * 0.5, s.x = s.ox, s.y = s.oy) : s.oy < f && (s.ox = Math.random() * this.canvasW, s.oy = u + Math.random() * c * 0.5, s.x = s.ox, s.y = s.oy);
    this.frameCount++;
    let m = 0, b = 0;
    const a = this.ctx, p = this.canvasW, d = this.canvasH;
    a.clearRect(0, 0, p, d), F && (a.fillStyle = "rgba(255, 255, 0, 0.15)", a.fillRect(0, 0, p, d));
    const A = p / 2, T = d / 2, $ = Math.sqrt(p * p + d * d) / 2;
    let w = 0;
    if (this.warpPhase !== "normal") {
      const s = this.warpPhase === "ramp" ? Ee : this.warpPhase === "warp" ? this.cruiseDuration : xe;
      w = Math.max(0, Math.min(1, (e - this.phaseStart) / s)), w >= 1 && (this.warpPhase === "ramp" ? (this.warpPhase = "warp", this.phaseStart = e, w = 0, P("draw: ramp→warp")) : this.warpPhase === "warp" ? (this.warpPhase = "decay", this.phaseStart = e, w = 0, P("draw: warp→decay")) : this.warpPhase === "decay" && (this.warpPhase = "normal", w = 0, P("draw: decay→normal")));
    }
    const G = this.warpPhase !== "normal", X = this.fps === 0 || this.fps >= Re, g = G && X;
    if (F)
      a.shadowBlur = 0;
    else if (g)
      switch (this.warpPhase) {
        case "ramp":
          a.shadowBlur = 4 + 4 * w * w;
          break;
        case "warp":
          a.shadowBlur = 8;
          break;
        case "decay":
          a.shadowBlur = 4 + 4 * (1 - w);
          break;
        default:
          a.shadowBlur = 0;
          break;
      }
    else
      a.shadowBlur = 0;
    if (F && this.warpPhase === "ramp" && w < 0.05) {
      const s = this.stars.slice(0, 5).map((v) => `(${v.x.toFixed(0)},${v.y.toFixed(0)})`).join(" ");
      P(`ramp-early: p=${w.toFixed(3)}, 星星样本 = ${s}`);
    }
    for (let s = this.stars.length - 1; s >= 0; s--) {
      const v = this.stars[s], I = v.colorR, j = v.colorG, we = v.colorB;
      switch (g && (a.shadowColor = `rgba(${I}, ${j}, ${we}, 0.8)`), this.warpPhase) {
        case "normal": {
          if (!this.drawNormal(v, a, t, o, i, e)) continue;
          break;
        }
        case "ramp": {
          if (!this.drawRamp(v, a, w, A, T, $, p, d)) continue;
          break;
        }
        case "warp": {
          if (!this.drawWarp(v, a, w, A, T, $, p, d)) continue;
          break;
        }
        case "decay": {
          if (!this.drawDecay(v, a, w, A, T, $, d, t, o, i)) continue;
          break;
        }
      }
    }
    if (this.warpPhase !== "normal")
      for (const s of this.stars)
        s.ox = s.x, s.oy = s.y;
    let x = 0, M = 0, S = 0, y = 0;
    if (F) {
      x = 1 / 0, M = -1 / 0, S = 1 / 0, y = -1 / 0;
      for (const s of this.stars)
        s.x < x && (x = s.x), s.x > M && (M = s.x), s.y < S && (S = s.y), s.y > y && (y = s.y), s.x >= 0 && s.x <= p && s.y >= 0 && s.y <= d ? m++ : b++;
    }
    if (F) {
      a.shadowBlur = 0;
      const s = this.hideable.querySelectorAll(".orca-startrek-starfield").length;
      a.fillStyle = "#ff0000", a.font = "bold 14px monospace", a.textBaseline = "top", a.fillText(`phase: ${this.warpPhase} | fps: ${this.fps} | ${N[Y].label}`, 10, 10), a.fillText(`stars: ${this.stars.length} | inCanvas: ${m} | offCanvas: ${b}`, 10, 30), a.fillText(`canvas: ${p}x${d} | canvases: ${s}`, 10, 50), s > 1 && a.fillText(`⚠ 检测到 ${s} 个 canvas！`, 10, 70);
    }
    if (a.shadowBlur = 0, F) {
      const s = this.warpPhase !== "normal" ? 1 : 60;
      this.frameCount % s === 0 && P(`tick: phase=${this.warpPhase}, stars=${this.stars.length}, inCanvas=${m}, x=[${x.toFixed(0)},${M.toFixed(0)}] y=[${S.toFixed(0)},${y.toFixed(0)}], canvas=${p}x${d}`);
    }
  }
  /** 销毁实例 */
  destroy() {
    this.canvas.remove(), this.ctx = null, this.stars = [];
  }
}
function Ne() {
  const l = window.__startrek_cleanup;
  l && (P("startStarfield: 清理上一套残留实例"), l());
  let e = 0, t = -999, o = -999, i = null;
  const n = /* @__PURE__ */ new Map();
  Fe();
  const h = () => {
    const g = document.querySelector(".orca-panels-container");
    if (!g) return;
    const x = g.querySelectorAll(
      ".orca-hideable:not(.orca-hideable-hidden):not(.orca-memoizedviews-active)"
    );
    for (const M of x) {
      const S = M;
      n.has(S) || n.set(S, new De(S));
    }
    for (const [M, S] of n)
      (!document.body.contains(M) || M.classList.contains("orca-hideable-hidden") || M.classList.contains("orca-memoizedviews-active")) && (S.destroy(), n.delete(M));
  };
  let c = 0;
  const f = (g) => {
    const S = 1e3 / (Array.from(n.values()).some((y) => y.warpPhase !== "normal") ? 120 : N[Y].maxFps);
    if (g - c < S) {
      e = requestAnimationFrame(f);
      return;
    }
    if (c = g, ne) {
      ne = !1;
      for (const [, y] of n)
        y.generateStars();
    }
    for (const [y, s] of n) {
      if (y.classList.contains("orca-hideable-hidden") || y.classList.contains("orca-memoizedviews-active") || !document.body.contains(y)) {
        s.destroy(), n.delete(y);
        continue;
      }
      s.resize(), s.updateScroll();
      const v = s.hideable === i, I = v ? t : -999, j = v ? o : -999;
      s.draw(g, v, I, j);
    }
    e = requestAnimationFrame(f);
  };
  let u = 0;
  const m = (g) => {
    var S;
    const x = performance.now();
    if (x - u < ke) {
      if (i && n.has(i)) {
        const y = i.getBoundingClientRect();
        t = g.clientX - y.left, o = g.clientY - y.top;
      }
      return;
    }
    u = x;
    const M = document.elementFromPoint(g.clientX, g.clientY);
    if (M) {
      const y = (S = M.closest) == null ? void 0 : S.call(M, ".orca-hideable");
      if (y && n.has(y)) {
        i = y;
        const s = y.getBoundingClientRect();
        t = g.clientX - s.left, o = g.clientY - s.top;
      } else
        i = null, t = -999, o = -999;
    }
  }, b = () => {
    i = null, t = -999, o = -999;
  };
  document.addEventListener("pointermove", m), document.addEventListener("pointerleave", b);
  const a = new MutationObserver((g) => {
    var x, M;
    for (const S of g) {
      if (S.type !== "attributes") continue;
      const y = S.target;
      if (S.attributeName === "class" && y.classList.contains("orca-repr-task-content") && y.classList.contains("orca-repr-task-1") && !y.classList.contains("orca-repr-task-0")) {
        const s = y.closest(".orca-hideable");
        if (s) {
          const v = n.get(s);
          v && v.triggerWarp();
        }
      }
      if (S.attributeName === "data-status" && ((x = y.dataset) == null ? void 0 : x.name) === "task" && ((M = y.dataset) == null ? void 0 : M.status) === "Done") {
        if (!y.closest(".orca-repr-main-content")) continue;
        const v = y.closest(".orca-hideable");
        if (v) {
          const I = n.get(v);
          I && (P("bigTaskObserver: 大任务完成，触发 5 秒跃迁"), I.triggerWarp(4100));
        }
      }
    }
  });
  a.observe(document.body, {
    attributes: !0,
    subtree: !0,
    attributeFilter: ["class", "data-status"]
  });
  const p = new MutationObserver(() => {
    h();
  });
  p.observe(document.body, {
    childList: !0,
    subtree: !0
  });
  let d = !1;
  const A = (g) => {
    d || (d = !0, cancelAnimationFrame(e), P(`暂停渲染: ${g}`));
  }, T = (g) => {
    d && (d = !1, c = 0, e = requestAnimationFrame(f), P(`恢复渲染: ${g}`));
  }, $ = () => {
    document.hidden ? A("visibilitychange") : T("visibilitychange");
  }, w = () => A("window blur"), G = () => T("window focus");
  document.addEventListener("visibilitychange", $), window.addEventListener("blur", w), window.addEventListener("focus", G), h(), setTimeout(h, 500), setTimeout(h, 2e3), e = requestAnimationFrame(f);
  const X = () => {
    cancelAnimationFrame(e), document.removeEventListener("pointermove", m), document.removeEventListener("pointerleave", b), document.removeEventListener("visibilitychange", $), window.removeEventListener("blur", w), window.removeEventListener("focus", G), p.disconnect(), a.disconnect();
    for (const [, g] of n)
      g.destroy();
    n.clear(), document.querySelectorAll(".orca-startrek-starfield").forEach((g) => g.remove()), Reflect.deleteProperty(window, "__startrek_cleanup");
  };
  return window.__startrek_cleanup = X, X;
}
const _ = "oh-StarTrek", oe = 55, se = 54, te = "Noto Serif SC", ye = '"Noto Serif", "Noto Serif SC", "Source Han Serif SC", Georgia, "STSong", "SimSun", serif', Oe = 200, Be = 500, We = 150, He = 0.15, Ue = 400, qe = 1500, ze = 200, Ye = 0.6, ge = 'link[rel="stylesheet"][href*="startrek"]', r = {
  pluginName: "",
  debugMode: !1,
  fullMode: !0,
  serifFontMode: !1,
  queryFontUnifyMode: !1,
  currentThemeName: null,
  originalEditorFont: null,
  originalUIFont: null,
  powerLevel: "full"
}, C = (...l) => {
  r.debugMode && console.log("[oh-StarTrek]", ...l);
};
let V = null, K = null, H = null, Q = null, R = null, U = null, q = null, z = null;
function Ge() {
  const l = (t = document) => {
    t.querySelectorAll(".orca-select-menu .orca-select-item-label").forEach((o) => {
      var n;
      const i = (n = o.textContent) == null ? void 0 : n.trim();
      i && (o.dataset.fontPreview || i !== "默认" && (o.style.fontFamily = `"${i}", sans-serif`, o.dataset.fontPreview = i));
    });
  };
  setTimeout(() => l(), 2e3);
  const e = new MutationObserver((t) => {
    for (const o of t)
      if (o.type === "childList" && o.addedNodes.length > 0)
        for (const i of o.addedNodes)
          i instanceof Element && l(i);
  });
  return e.observe(document.body, { childList: !0, subtree: !0 }), e;
}
function Xe() {
  const l = (e) => {
    const t = e.closest(".orca-input");
    if (!t) return;
    const o = t.offsetWidth, i = Math.max(Oe, Math.min(Be, We + o * He));
    t.style.setProperty("--milk-input-spread-dur", `${i}ms`);
  };
  U = (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const t = e.target.closest(".orca-input");
    t && (l(e.target), t.style.setProperty("--milk-input-spread", "1"));
  }, q = (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const t = e.target.closest(".orca-input");
    t && t.style.removeProperty("--milk-input-spread");
  }, document.addEventListener("focusin", U, !0), document.addEventListener("focusout", q, !0);
}
function Ve() {
  const l = (t) => {
    const o = t.offsetHeight, i = Math.max(Ue, Math.min(qe, ze + o * Ye));
    t.style.setProperty("--milk-scope-spread-dur", `${i}ms`);
  };
  z = (t) => {
    var i, n;
    if (!(t.target instanceof HTMLElement)) return;
    const o = (n = (i = t.target).closest) == null ? void 0 : n.call(i, ".orca-repr-scope-line");
    o && l(o);
  }, document.addEventListener("mouseenter", z, !0);
  const e = new MutationObserver((t) => {
    for (const o of t)
      if (o.type === "attributes" && o.attributeName === "class") {
        const i = o.target;
        if (i.classList.contains("orca-active-parent")) {
          const n = i.querySelector(".orca-repr-scope-line");
          n && l(n);
        }
      }
  });
  e.observe(document.body, { attributes: !0, subtree: !0, attributeFilter: ["class"] }), K = e;
}
function ie() {
  C(`applyStarfield: currentThemeName="${r.currentThemeName}", THEME_NAME="${_}", fullMode=${r.fullMode}`), R && (R(), R = null), r.currentThemeName === _ && r.fullMode ? (R = Ne(), C("星空已启动")) : C(`星空未启动（${r.currentThemeName !== _ ? "主题不匹配" : "满血模式关闭"}）`);
}
function ae() {
  r.originalEditorFont === null && (r.originalEditorFont = orca.state.settings[oe]), r.originalUIFont === null && (r.originalUIFont = orca.state.settings[se]), orca.state.settings[oe] = te, orca.state.settings[se] = te, document.documentElement.style.setProperty("--orca-fontfamily-editor", ye), document.documentElement.style.setProperty("--orca-fontfamily-ui", ye), C(`已设置字体为 ${te}（设置值 + CSS 变量）`);
}
function le() {
  r.originalEditorFont !== null && (orca.state.settings[oe] = r.originalEditorFont), r.originalUIFont !== null && (orca.state.settings[se] = r.originalUIFont), document.documentElement.style.removeProperty("--orca-fontfamily-editor"), document.documentElement.style.removeProperty("--orca-fontfamily-ui"), r.originalEditorFont = null, r.originalUIFont = null, C("已恢复用户原始字体设置");
}
const be = "startrek-query-font-unified";
function re() {
  document.documentElement.classList.add(be), C("已开启查询字体统一化");
}
function ce() {
  document.documentElement.classList.remove(be), C("已关闭查询字体统一化");
}
const Ke = () => {
  const l = !!document.querySelector(ge), e = l ? _ : "";
  e !== r.currentThemeName && (r.currentThemeName = e, C(`主题变更检测: startrek CSS ${l ? "已加载" : "未加载"}`), l && r.serifFontMode && ae(), !l && r.serifFontMode && r.originalEditorFont !== null && le(), l && r.queryFontUnifyMode ? re() : l || ce(), ie());
};
async function je(l) {
  r.pluginName = l;
  const e = (n) => ({
    fullMode: {
      label: "跃迁引擎",
      description: "电脑太卡！关闭跃迁引擎！(ಥ_ಥ)",
      type: "boolean",
      defaultValue: !0
    },
    ...n ? {
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
  await orca.plugins.setSettingsSchema(r.pluginName, e(!0));
  const t = () => {
    var b;
    const n = (b = orca.state.plugins[r.pluginName]) == null ? void 0 : b.settings, h = !!(n != null && n.debugMode), c = (n == null ? void 0 : n.fullMode) !== !1, f = !!(n != null && n.serifFontMode), u = !!(n != null && n.queryFontUnifyMode);
    r.debugMode = h, ve(r.debugMode);
    const m = (n == null ? void 0 : n.powerLevel) || "full";
    m !== r.powerLevel && (r.powerLevel = m, Ie(m)), f !== r.serifFontMode && (r.serifFontMode = f, r.serifFontMode && r.currentThemeName === _ && ae(), !r.serifFontMode && r.originalEditorFont !== null && le()), u !== r.queryFontUnifyMode && (r.queryFontUnifyMode = u, r.queryFontUnifyMode && r.currentThemeName === _ ? re() : r.queryFontUnifyMode || ce()), c !== r.fullMode ? (r.fullMode = c, ie(), orca.plugins.setSettingsSchema(r.pluginName, e(c))) : r.fullMode = c;
  };
  t();
  const { subscribe: o } = window.Valtio;
  Q = o(orca.state.plugins, () => {
    t();
  }), orca.themes.register(r.pluginName, _, "themes/startrek.css"), V = Ge(), Ve(), Xe(), H = new MutationObserver(() => {
    Ke();
  }), H.observe(document.head, { childList: !0, subtree: !1 }), document.querySelector(ge) ? (r.currentThemeName = _, C("检测到 startrek CSS 已加载，当前主题即为目标主题"), r.serifFontMode && ae(), r.queryFontUnifyMode && re()) : r.currentThemeName = "", ie(), C(`${r.pluginName} loaded.`);
}
async function Ze() {
  orca.themes.unregister(_), r.originalEditorFont !== null && le(), ce(), V && (V.disconnect(), V = null), K && (K.disconnect(), K = null), z && (document.removeEventListener("mouseenter", z, !0), z = null), U && (document.removeEventListener("focusin", U, !0), U = null), q && (document.removeEventListener("focusout", q, !0), q = null), H && (H.disconnect(), H = null), Q && (Q(), Q = null), R && (R(), R = null), C(`${r.pluginName} unloaded.`);
}
export {
  je as load,
  Ze as unload
};
