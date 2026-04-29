var xt = Object.defineProperty;
var St = (c, e, a) => e in c ? xt(c, e, { enumerable: !0, configurable: !0, writable: !0, value: a }) : c[e] = a;
var k = (c, e, a) => St(c, typeof e != "symbol" ? e + "" : e, a);
let w = !1;
const F = (...c) => {
  w && console.log("[oh-StarTrek]", ...c);
};
function Mt(c) {
  w = c, c && F("调试模式已开启");
}
const dt = (c) => {
  const e = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
  return e ? {
    r: parseInt(e[1], 16),
    g: parseInt(e[2], 16),
    b: parseInt(e[3], 16)
  } : { r: 18, g: 194, b: 233 };
};
let U = { r: 18, g: 194, b: 233 }, X = { r: 233, g: 136, b: 18 };
function vt() {
  const c = getComputedStyle(document.documentElement), e = c.getPropertyValue("--milk-slate").trim() || "#12c2e9", a = c.getPropertyValue("--milk-orange").trim() || "#e98812";
  U = dt(e), X = dt(a), F(`initColors: cyan=rgb(${U.r},${U.g},${U.b}), orange=rgb(${X.r},${X.g},${X.b})`);
}
const ft = () => Math.random() < 0.6 ? U : X, $t = 400, ut = 1600, Pt = 500, H = 4, at = 36, Y = 1, nt = 2, pt = 0.07, q = 250, At = 1 / 12e3, kt = 30, Ft = 300, mt = 8, I = 0.1, Ct = 0.15, yt = 0.1;
class Tt {
  // 巡航时长（大任务可延长）
  constructor(e) {
    k(this, "canvas");
    k(this, "ctx", null);
    k(this, "hideable");
    k(this, "stars", []);
    k(this, "canvasW", 0);
    k(this, "canvasH", 0);
    k(this, "scrollY", 0);
    k(this, "prevScrollY", 0);
    k(this, "frameCount", 0);
    // FPS 跟踪
    k(this, "fps", 0);
    k(this, "fpsFrameCount", 0);
    k(this, "fpsLastTime", 0);
    // 跃迁状态
    k(this, "warpPhase", "normal");
    k(this, "phaseStart", 0);
    k(this, "cruiseDuration", ut);
    this.hideable = e;
    const a = e.querySelectorAll(".orca-startrek-starfield");
    a.length > 0 && (F(`constructor: 清除 ${a.length} 个残留 canvas`), a.forEach((s) => s.remove())), this.canvas = document.createElement("canvas"), this.canvas.className = "orca-startrek-starfield", this.canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;", e.appendChild(this.canvas), this.resize();
  }
  /** 原地覆写：将星星重置为从圆边缘出发（跃迁回收用，零 GC） */
  resetAsCenterStar(e) {
    const a = this.canvasW / 2, s = this.canvasH / 2, r = Math.min(this.canvasW, this.canvasH) * (0.05 + Math.random() * 0.35), u = Math.random() * Math.PI * 2, p = a + Math.cos(u) * r, g = s + Math.sin(u) * r, P = Math.atan2(g - s, p - a), T = Math.sqrt(a * a + s * s), E = Math.min(1, r / T), o = ft();
    e.ox = p, e.oy = g, e.x = p, e.y = g, e.size = 0.3 + Math.random() * 0.8, e.baseAlpha = 0.15 + Math.random() * 0.25, e.twinkleSpeed = 0.5 + Math.random() * 2, e.twinkleOffset = Math.random() * Math.PI * 2, e.warpAngle = P, e.warpSpeed = H + (at - H) * E, e.warpBornInWarp = !0, e.warpStreak = Math.random() < 0.5, e.colorR = o.r, e.colorG = o.g, e.colorB = o.b;
  }
  /** 创建一颗随机位置的常驻星星 */
  makeStar(e, a) {
    const s = Math.random() * this.canvasW, n = e + Math.random() * (a - e), r = ft();
    return {
      ox: s,
      oy: n,
      x: s,
      y: n,
      size: 0.3 + Math.random() * 0.8,
      baseAlpha: 0.15 + Math.random() * 0.25,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinkleOffset: Math.random() * Math.PI * 2,
      warpAngle: 0,
      warpSpeed: 0,
      warpBornInWarp: !1,
      warpStreak: !1,
      colorR: r.r,
      colorG: r.g,
      colorB: r.b
    };
  }
  /** 初始化星点 — 在画布 + 出血区范围内均匀分布 */
  generateStars() {
    this.stars = [];
    const e = this.canvasH * yt, a = this.canvasH + e * 2, s = this.canvasW * a, n = Math.max(
      kt,
      Math.min(Ft, Math.round(s * At))
    );
    for (let r = 0; r < n; r++)
      this.stars.push(this.makeStar(-e, this.canvasH + e));
  }
  /** 触发跃迁：进入加速期；warp 期间可重置巡航计时器
   *  @param cruiseDuration 巡航时长（ms），默认 CRUISE_DURATION
   */
  triggerWarp(e = ut) {
    if (F(`triggerWarp: phase=${this.warpPhase}, stars=${this.stars.length}, cruise=${e}ms`), this.warpPhase === "ramp" || this.warpPhase === "decay") return;
    if (this.warpPhase === "warp") {
      this.phaseStart = performance.now(), F("triggerWarp: warp重置");
      return;
    }
    this.warpPhase = "ramp", this.phaseStart = performance.now(), this.cruiseDuration = e;
    const a = this.canvasW / 2, s = this.canvasH / 2, n = Math.sqrt(a * a + s * s);
    for (const r of this.stars) {
      const u = r.x - a, p = r.y - s, g = Math.sqrt(u * u + p * p);
      r.warpAngle = Math.atan2(p, u);
      const P = Math.min(1, g / n);
      r.warpSpeed = H + (at - H) * P, r.warpBornInWarp = !1, r.warpStreak = Math.random() < 0.5;
    }
    if (w) {
      const r = this.stars.slice(0, 5).map((u) => `(${u.x.toFixed(0)},${u.y.toFixed(0)})`).join(" ");
      F(`triggerWarp: 星星样本 = ${r}`);
    }
    F(`triggerWarp: 进入ramp, 星星数=${this.stars.length}`);
  }
  /** 调整 canvas 尺寸（容差 2px，防止 1px 抖动反复重建星星） */
  resize() {
    const e = this.hideable.clientWidth, a = this.hideable.clientHeight;
    if (e === 0 || a === 0) return;
    const s = Math.abs(e - this.canvasW), n = Math.abs(a - this.canvasH);
    if ((s >= 2 || n >= 2) && (F(`resize: ${this.canvasW}x${this.canvasH} → ${e}x${a} (dw=${s}, dh=${n})`), this.canvasW = e, this.canvasH = a, this.canvas.width = e, this.canvas.height = a, this.ctx = this.canvas.getContext("2d"), this.generateStars(), this.warpPhase !== "normal")) {
      F(`resize: 跃迁中(${this.warpPhase})，重算跃迁方向`);
      const r = e / 2, u = a / 2;
      for (const p of this.stars) {
        const g = p.x - r, P = p.y - u;
        p.warpAngle = Math.atan2(P, g), p.warpSpeed = H + Math.random() * (at - H), p.warpBornInWarp = !1;
      }
    }
  }
  /** 更新滚动位置 */
  updateScroll() {
    const e = this.hideable.querySelector(".orca-block-editor") ?? this.hideable;
    this.scrollY = e.scrollTop;
  }
  /** 画一个带拖尾的星星 */
  drawStreakStar(e, a, s, n, r, u, p, g, P) {
    if (this.ctx) {
      if (n > 0.5) {
        const T = e - Math.cos(s) * n, E = a - Math.sin(s) * n;
        this.ctx.beginPath(), this.ctx.moveTo(T, E), this.ctx.lineTo(e, a), this.ctx.strokeStyle = `rgba(${p},${g},${P},${u * 0.5})`, this.ctx.lineWidth = Math.max(0.5, r * 0.7), this.ctx.stroke();
      }
      this.ctx.beginPath(), this.ctx.arc(e, a, r, 0, Math.PI * 2), this.ctx.fillStyle = `rgba(255,255,255,${u})`, this.ctx.fill();
    }
  }
  /** 调试模式：画一颗亮红色圆点 + 方向线 */
  drawDebugDot(e, a, s) {
    if (s.beginPath(), s.arc(e.x, e.y, 3, 0, Math.PI * 2), s.fillStyle = "#ff0000", s.fill(), a) {
      const n = e.warpSpeed * 10;
      s.beginPath(), s.moveTo(e.x, e.y), s.lineTo(
        e.x + Math.cos(e.warpAngle) * n,
        e.y + Math.sin(e.warpAngle) * n
      ), s.strokeStyle = "rgba(255, 0, 0, 0.6)", s.lineWidth = 1, s.stroke();
    }
  }
  /** 绘制一帧 */
  draw(e, a, s, n) {
    if (!this.ctx) return;
    this.fpsFrameCount++, e - this.fpsLastTime >= 1e3 && (this.fps = this.fpsFrameCount, this.fpsFrameCount = 0, this.fpsLastTime = e);
    const u = (this.scrollY - this.prevScrollY) * Ct;
    this.prevScrollY = this.scrollY;
    const p = this.canvasH * yt, g = -p, P = this.canvasH + p;
    if (this.warpPhase === "normal" || this.warpPhase === "decay")
      for (const i of this.stars)
        i.oy -= u, i.y -= u, i.oy > P ? (i.ox = Math.random() * this.canvasW, i.oy = g - Math.random() * p * 0.5, i.x = i.ox, i.y = i.oy) : i.oy < g && (i.ox = Math.random() * this.canvasW, i.oy = P + Math.random() * p * 0.5, i.x = i.ox, i.y = i.oy);
    this.frameCount++;
    let T = 0, E = 0;
    const o = this.ctx, A = this.canvasW, l = this.canvasH;
    o.clearRect(0, 0, A, l), w && (o.fillStyle = "rgba(255, 255, 0, 0.15)", o.fillRect(0, 0, A, l));
    const h = A / 2, d = l / 2, $ = Math.sqrt(A * A + l * l) / 2;
    let f = 0;
    if (this.warpPhase !== "normal") {
      const i = this.warpPhase === "ramp" ? $t : this.warpPhase === "warp" ? this.cruiseDuration : Pt;
      if (f = Math.max(0, Math.min(1, (e - this.phaseStart) / i)), f >= 1)
        if (this.warpPhase === "ramp")
          this.warpPhase = "warp", this.phaseStart = e, f = 0, F(`phase: ramp→warp, stars=${this.stars.length}`);
        else if (this.warpPhase === "warp") {
          this.warpPhase = "decay", this.phaseStart = e, f = 0;
          let t = 0;
          for (let C = 0; C < this.stars.length; C++) {
            const x = this.stars[C];
            x.ox = x.x, x.oy = x.y, x.warpBornInWarp = !1, (x.ox < -2 || x.ox > A + 2 || x.oy < -2 || x.oy > l + 2) && (this.resetAsCenterStar(x), t++);
          }
          F(`phase: warp→decay, stars=${this.stars.length}, recycled=${t}`);
        } else this.warpPhase === "decay" && (this.warpPhase = "normal", f = 0, F(`phase: decay→normal, stars=${this.stars.length}`));
    }
    if (w)
      o.shadowBlur = 0;
    else
      switch (this.warpPhase) {
        case "ramp":
          o.shadowBlur = 4 + 4 * f * f;
          break;
        case "warp":
          o.shadowBlur = 8;
          break;
        case "decay":
          o.shadowBlur = 4 + 4 * (1 - f);
          break;
        default:
          o.shadowBlur = 4;
          break;
      }
    if (w && this.warpPhase === "ramp" && f < 0.05) {
      const i = this.stars.slice(0, 5).map((t) => `(${t.x.toFixed(0)},${t.y.toFixed(0)})`).join(" ");
      F(`ramp-early: p=${f.toFixed(3)}, 星星样本 = ${i}`);
    }
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const t = this.stars[i], C = t.colorR, x = t.colorG, O = t.colorB;
      switch (w || (o.shadowColor = `rgba(${C}, ${x}, ${O}, 0.8)`), this.warpPhase) {
        case "normal": {
          if (a) {
            const S = t.x - s, M = t.y - n, v = Math.sqrt(S * S + M * M), y = v < q ? 1 - v / q : 0, m = Math.sin(e * 1e-3 * t.twinkleSpeed + t.twinkleOffset) * 0.5 + 0.5;
            if (v < q && v > 0) {
              const b = y * mt, R = t.ox - S / v * b, et = t.oy - M / v * b;
              t.x += (R - t.x) * I, t.y += (et - t.y) * I;
            } else
              t.x += (t.ox - t.x) * I, t.y += (t.oy - t.y) * I;
            if (t.y < -2 || t.y > l + 2) continue;
            if (w)
              this.drawDebugDot(t, !1, o);
            else {
              let b = t.baseAlpha;
              b += y * 0.9, b += m * 0.25 * y, b = Math.min(1, b), o.beginPath(), o.arc(t.x, t.y, t.size, 0, Math.PI * 2), o.fillStyle = `rgba(${C},${x},${O},${b})`, o.fill();
            }
          } else {
            if (t.x += (t.ox - t.x) * I, t.y += (t.oy - t.y) * I, t.y < -2 || t.y > l + 2) continue;
            w ? this.drawDebugDot(t, !1, o) : (o.beginPath(), o.arc(t.x, t.y, t.size, 0, Math.PI * 2), o.fillStyle = `rgba(${C},${x},${O},${t.baseAlpha})`, o.fill());
          }
          break;
        }
        case "ramp": {
          if (t.warpStreak) {
            const S = Math.sqrt(
              (t.x - h) * (t.x - h) + (t.y - d) * (t.y - d)
            ), M = Math.min(1, S / $), v = 5 - 4 * M, y = Math.pow(f, v), m = t.warpSpeed * y;
            if (t.x += Math.cos(t.warpAngle) * m, t.y += Math.sin(t.warpAngle) * m, t.x < -50 || t.x > A + 50 || t.y < -50 || t.y > l + 50) {
              this.resetAsCenterStar(t), w && E++;
              continue;
            }
            if (w)
              this.drawDebugDot(t, !0, o);
            else {
              const b = 1 + (nt - 1) * y * M, R = t.size * b, et = Y * y;
              let st = t.baseAlpha + et;
              st = Math.min(1, st);
              const gt = m * 6;
              this.drawStreakStar(t.x, t.y, t.warpAngle, gt, R, st, C, x, O);
            }
          } else {
            const S = Math.sqrt(
              (t.x - h) * (t.x - h) + (t.y - d) * (t.y - d)
            ), v = 5 - 4 * Math.min(1, S / $), y = Math.pow(f, v), m = t.warpSpeed * pt * y;
            if (t.x += Math.cos(t.warpAngle) * m, t.y += Math.sin(t.warpAngle) * m, t.x < -50 || t.x > A + 50 || t.y < -50 || t.y > l + 50) {
              this.resetAsCenterStar(t);
              continue;
            }
            if (w)
              this.drawDebugDot(t, !1, o);
            else {
              let b = t.baseAlpha + Y * y;
              b = Math.min(1, b), o.beginPath(), o.arc(t.x, t.y, t.size, 0, Math.PI * 2), o.fillStyle = `rgba(${C},${x},${O},${b})`, o.fill();
            }
          }
          break;
        }
        case "warp": {
          if (t.warpStreak) {
            const S = t.warpSpeed * (1 - f * f);
            if (t.x += Math.cos(t.warpAngle) * S, t.y += Math.sin(t.warpAngle) * S, t.x < -50 || t.x > A + 50 || t.y < -50 || t.y > l + 50) {
              this.resetAsCenterStar(t), w && E++;
              continue;
            }
            if (w)
              this.drawDebugDot(t, !0, o);
            else {
              const M = Math.sqrt(
                (t.x - h) * (t.x - h) + (t.y - d) * (t.y - d)
              ), v = 1 + (nt - 1) * Math.min(1, M / $), y = t.size * v;
              let m = t.baseAlpha + Y;
              m = Math.min(1, m);
              const b = S * 6;
              this.drawStreakStar(t.x, t.y, t.warpAngle, b, y, m, C, x, O);
            }
          } else {
            const S = t.warpSpeed * pt * (1 - f * f);
            if (t.x += Math.cos(t.warpAngle) * S, t.y += Math.sin(t.warpAngle) * S, t.x < -50 || t.x > A + 50 || t.y < -50 || t.y > l + 50) {
              this.resetAsCenterStar(t);
              continue;
            }
            if (w)
              this.drawDebugDot(t, !1, o);
            else {
              let M = t.baseAlpha + Y;
              M = Math.min(1, M), o.beginPath(), o.arc(t.x, t.y, t.size, 0, Math.PI * 2), o.fillStyle = `rgba(${C},${x},${O},${M})`, o.fill();
            }
          }
          break;
        }
        case "decay": {
          const S = 1 - (1 - f) * (1 - f), M = S;
          if (a && M > 0.01) {
            const v = t.x - s, y = t.y - n, m = Math.sqrt(v * v + y * y), b = m < q ? 1 - m / q : 0;
            if (m < q && m > 0) {
              const R = b * mt * M;
              t.x += (t.ox - v / m * R - t.x) * I, t.y += (t.oy - y / m * R - t.y) * I;
            } else
              t.x += (t.ox - t.x) * I * M, t.y += (t.oy - t.y) * I * M;
          }
          if (t.y < -2 || t.y > l + 2) continue;
          if (w)
            this.drawDebugDot(t, !1, o);
          else {
            const v = Y * (1 - S);
            let y = t.baseAlpha + v;
            y = Math.min(1, y);
            const m = Math.sqrt(
              (t.x - h) * (t.x - h) + (t.y - d) * (t.y - d)
            ), b = 1 + (nt - 1) * (1 - S) * Math.min(1, m / $), R = t.size * b;
            o.beginPath(), o.arc(t.x, t.y, R, 0, Math.PI * 2), o.fillStyle = `rgba(255,255,255,${y})`, o.fill();
          }
          break;
        }
      }
    }
    let L = 0, Q = 0, K = 0, j = 0;
    if (w) {
      L = 1 / 0, Q = -1 / 0, K = 1 / 0, j = -1 / 0;
      for (const i of this.stars)
        i.x < L && (L = i.x), i.x > Q && (Q = i.x), i.y < K && (K = i.y), i.y > j && (j = i.y), i.x >= 0 && i.x <= A && i.y >= 0 && i.y <= l && T++;
    }
    if (w) {
      o.shadowBlur = 0;
      const i = this.hideable.querySelectorAll(".orca-startrek-starfield").length;
      o.fillStyle = "#ff0000", o.font = "bold 14px monospace", o.textBaseline = "top", o.fillText(`phase: ${this.warpPhase} | fps: ${this.fps}`, 10, 10), o.fillText(`stars: ${this.stars.length} | inCanvas: ${T} | offCanvas: ${E}`, 10, 30), o.fillText(`canvas: ${A}x${l} | canvases: ${i}`, 10, 50), i > 1 && o.fillText(`⚠ 检测到 ${i} 个 canvas！`, 10, 70);
    }
    if (o.shadowBlur = 0, w) {
      const i = this.warpPhase !== "normal" ? 1 : 60;
      this.frameCount % i === 0 && F(`tick: phase=${this.warpPhase}, stars=${this.stars.length}, inCanvas=${T}, x=[${L.toFixed(0)},${Q.toFixed(0)}] y=[${K.toFixed(0)},${j.toFixed(0)}], canvas=${A}x${l}`);
    }
  }
  /** 销毁实例 */
  destroy() {
    this.canvas.remove(), this.ctx = null, this.stars = [];
  }
}
const ot = "__startrek_cleanup";
function Et() {
  const c = window[ot];
  c && (F("startStarfield: 清理上一套残留实例"), c());
  let e = 0, a = -999, s = -999, n = null;
  const r = /* @__PURE__ */ new Map();
  vt();
  const u = () => {
    const l = document.querySelectorAll(
      ".orca-hideable:not(.orca-hideable-hidden):not(.orca-memoizedviews-active)"
    );
    for (const h of l) {
      const d = h;
      r.has(d) || r.set(d, new Tt(d));
    }
    for (const [h, d] of r)
      (!document.body.contains(h) || h.classList.contains("orca-hideable-hidden") || h.classList.contains("orca-memoizedviews-active")) && (d.destroy(), r.delete(h));
  }, p = (l) => {
    for (const [h, d] of r) {
      if (h.classList.contains("orca-hideable-hidden") || h.classList.contains("orca-memoizedviews-active") || !document.body.contains(h)) {
        d.destroy(), r.delete(h);
        continue;
      }
      d.resize(), d.updateScroll();
      const $ = d.hideable === n, f = $ ? a : -999, L = $ ? s : -999;
      d.draw(l, $, f, L);
    }
    e = requestAnimationFrame(p);
  }, g = (l) => {
    var d;
    const h = document.elementFromPoint(l.clientX, l.clientY);
    if (h) {
      const $ = (d = h.closest) == null ? void 0 : d.call(h, ".orca-hideable");
      if ($ && r.has($)) {
        n = $;
        const f = $.getBoundingClientRect();
        a = l.clientX - f.left, s = l.clientY - f.top;
      } else
        n = null, a = -999, s = -999;
    }
  }, P = () => {
    n = null, a = -999, s = -999;
  };
  document.addEventListener("pointermove", g), document.addEventListener("pointerleave", P);
  const T = new MutationObserver(() => {
    u();
  });
  T.observe(document.body, {
    childList: !0,
    subtree: !0
  });
  const E = new MutationObserver((l) => {
    for (const h of l)
      if (h.type === "attributes" && h.attributeName === "class") {
        const d = h.target;
        if (d.classList.contains("orca-repr-task-content") && d.classList.contains("orca-repr-task-1") && !d.classList.contains("orca-repr-task-0")) {
          const $ = d.closest(".orca-hideable");
          if ($) {
            const f = r.get($);
            f && f.triggerWarp();
          }
        }
      }
  });
  E.observe(document.body, {
    attributes: !0,
    subtree: !0,
    attributeFilter: ["class"]
  });
  const o = new MutationObserver((l) => {
    for (const h of l)
      if (h.type === "attributes" && h.attributeName === "data-status") {
        const d = h.target;
        if (d.dataset.name === "task" && d.dataset.status === "Done") {
          if (!d.closest(".orca-repr-main-content")) continue;
          const f = d.closest(".orca-hideable");
          if (f) {
            const L = r.get(f);
            L && (F("bigTaskObserver: 大任务完成，触发 5 秒跃迁"), L.triggerWarp(4100));
          }
        }
      }
  });
  o.observe(document.body, {
    attributes: !0,
    subtree: !0,
    attributeFilter: ["data-status"]
  }), u(), setTimeout(u, 500), setTimeout(u, 2e3), e = requestAnimationFrame(p);
  const A = () => {
    cancelAnimationFrame(e), document.removeEventListener("pointermove", g), document.removeEventListener("pointerleave", P), T.disconnect(), E.disconnect(), o.disconnect();
    for (const [, l] of r)
      l.destroy();
    r.clear(), document.querySelectorAll(".orca-startrek-starfield").forEach((l) => l.remove()), delete window[ot];
  };
  return window[ot] = A, A;
}
let z, it = !1, G = !0, V = !1, B = !1;
const _ = "oh-StarTrek", It = 55, Dt = 54, rt = "Noto Serif SC", bt = '"Noto Serif", "Noto Serif SC", "Source Han Serif SC", Georgia, "STSong", "SimSun", serif', D = (...c) => {
  it && console.log("[oh-StarTrek]", ...c);
};
function Lt() {
  const c = (a = document) => {
    a.querySelectorAll(".orca-select-menu .orca-select-item-label").forEach((s) => {
      var r;
      const n = (r = s.textContent) == null ? void 0 : r.trim();
      n && (s.dataset.fontPreview || n !== "默认" && (s.style.fontFamily = `"${n}", sans-serif`, s.dataset.fontPreview = n));
    });
  };
  setTimeout(() => c(), 2e3);
  const e = new MutationObserver((a) => {
    for (const s of a)
      if (s.type === "childList" && s.addedNodes.length > 0)
        for (const n of s.addedNodes)
          n instanceof Element && c(n);
  });
  return e.observe(document.body, { childList: !0, subtree: !0 }), e;
}
let Z = null;
function _t() {
  const c = (e) => {
    const a = e.closest(".orca-input");
    if (!a) return;
    const s = a.offsetWidth, n = Math.max(200, Math.min(500, 150 + s * 0.15));
    a.style.setProperty("--milk-input-spread-dur", `${n}ms`);
  };
  document.addEventListener(
    "focusin",
    (e) => {
      const a = e.target, s = a.closest(".orca-input");
      s && (c(a), s.style.setProperty("--milk-input-spread", "1"));
    },
    !0
  ), document.addEventListener(
    "focusout",
    (e) => {
      const s = e.target.closest(".orca-input");
      s && s.style.removeProperty("--milk-input-spread");
    },
    !0
  );
}
function Wt() {
  const c = (a) => {
    const s = a.offsetHeight, n = Math.max(400, Math.min(1500, 200 + s * 0.6));
    a.style.setProperty("--milk-scope-spread-dur", `${n}ms`);
  };
  document.addEventListener(
    "mouseenter",
    (a) => {
      var n, r;
      const s = (r = (n = a.target).closest) == null ? void 0 : r.call(n, ".orca-repr-scope-line");
      s && c(s);
    },
    !0
  ), new MutationObserver((a) => {
    for (const s of a)
      if (s.type === "attributes" && s.attributeName === "class") {
        const n = s.target;
        if (n.classList.contains("orca-active-parent")) {
          const r = n.querySelector(".orca-repr-scope-line");
          r && c(r);
        }
      }
  }).observe(document.body, { attributes: !0, subtree: !0, attributeFilter: ["class"] });
}
let N = null, W = null, tt = null, J = null;
function ct() {
  D(`applyStarfield: currentThemeName="${W}", THEME_NAME="${_}", fullMode=${G}`), N && (N(), N = null), W === _ && G ? (N = Et(), D("星空已启动")) : D(`星空未启动（${W !== _ ? "主题不匹配" : "满血模式关闭"}）`);
}
function lt() {
  orca.state.settings[It] = rt, orca.state.settings[Dt] = rt, document.documentElement.style.setProperty("--orca-fontfamily-editor", bt), document.documentElement.style.setProperty("--orca-fontfamily-ui", bt), D(`已设置字体为 ${rt}（设置值 + CSS 变量）`);
}
const wt = "startrek-query-font-unified";
function ht() {
  document.documentElement.classList.add(wt), D("已开启查询字体统一化");
}
function Rt() {
  document.documentElement.classList.remove(wt), D("已关闭查询字体统一化");
}
const Ot = () => {
  const c = !!document.querySelector('link[rel="stylesheet"][href*="startrek"]'), e = c ? _ : "";
  e !== W && (W = e, D(`主题变更检测: startrek CSS ${c ? "已加载" : "未加载"}`), c && V && lt(), c && B && ht(), ct());
};
async function Ht(c) {
  z = c, orca.state.locale, await orca.plugins.setSettingsSchema(z, {
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
    var P;
    const n = (P = orca.state.plugins[z]) == null ? void 0 : P.settings, r = !!(n != null && n.debugMode), u = (n == null ? void 0 : n.fullMode) !== !1, p = !!(n != null && n.serifFontMode), g = !!(n != null && n.queryFontUnifyMode);
    it = r, Mt(it), p !== V && (V = p, V && W === _ && lt()), g !== B && (B = g, B && W === _ ? ht() : B || Rt()), u !== G ? (G = u, ct()) : G = u;
  };
  e();
  const { subscribe: a } = window.Valtio;
  J = a(orca.state.plugins, () => {
    e();
  }), orca.themes.register(z, _, "themes/startrek.css"), Z = Lt(), Wt(), _t(), tt = new MutationObserver(() => {
    Ot();
  }), tt.observe(document.head, { childList: !0, subtree: !1 }), document.querySelector('link[rel="stylesheet"][href*="startrek"]') ? (W = _, D("检测到 startrek CSS 已加载，当前主题即为目标主题"), V && lt(), B && ht()) : W = "", ct(), D(`${z} loaded.`);
}
async function qt() {
  orca.themes.unregister(_), Z && (Z.disconnect(), Z = null), tt && tt.disconnect(), J && (J(), J = null), N && (N(), N = null), D(`${z} unloaded.`);
}
export {
  Ht as load,
  qt as unload
};
