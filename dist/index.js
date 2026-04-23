var pt = Object.defineProperty;
var ut = (c, e, a) => e in c ? pt(c, e, { enumerable: !0, configurable: !0, writable: !0, value: a }) : c[e] = a;
var $ = (c, e, a) => ut(c, typeof e != "symbol" ? e + "" : e, a);
let w = !1;
const P = (...c) => {
  w && console.log("[oh-StarTrek]", ...c);
};
function mt(c) {
  w = c, c && P("调试模式已开启");
}
const ot = (c) => {
  const e = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
  return e ? {
    r: parseInt(e[1], 16),
    g: parseInt(e[2], 16),
    b: parseInt(e[3], 16)
  } : { r: 18, g: 194, b: 233 };
};
let Y = { r: 18, g: 194, b: 233 }, X = { r: 233, g: 136, b: 18 };
function yt() {
  const c = getComputedStyle(document.documentElement), e = c.getPropertyValue("--milk-slate").trim() || "#12c2e9", a = c.getPropertyValue("--milk-orange").trim() || "#e98812";
  Y = ot(e), X = ot(a), P(`initColors: cyan=rgb(${Y.r},${Y.g},${Y.b}), orange=rgb(${X.r},${X.g},${X.b})`);
}
const it = () => Math.random() < 0.6 ? Y : X, bt = 400, ct = 1600, wt = 500, B = 4, et = 36, N = 1, st = 2, lt = 0.07, z = 250, gt = 1 / 8e3, xt = 30, Mt = 300, ht = 8, E = 0.1, vt = 0.15, dt = 0.1;
class St {
  // 巡航时长（大任务可延长）
  constructor(e) {
    $(this, "canvas");
    $(this, "ctx", null);
    $(this, "hideable");
    $(this, "stars", []);
    $(this, "canvasW", 0);
    $(this, "canvasH", 0);
    $(this, "scrollY", 0);
    $(this, "prevScrollY", 0);
    $(this, "frameCount", 0);
    // FPS 跟踪
    $(this, "fps", 0);
    $(this, "fpsFrameCount", 0);
    $(this, "fpsLastTime", 0);
    // 跃迁状态
    $(this, "warpPhase", "normal");
    $(this, "phaseStart", 0);
    $(this, "cruiseDuration", ct);
    this.hideable = e;
    const a = e.querySelectorAll(".orca-startrek-starfield");
    a.length > 0 && (P(`constructor: 清除 ${a.length} 个残留 canvas`), a.forEach((s) => s.remove())), this.canvas = document.createElement("canvas"), this.canvas.className = "orca-startrek-starfield", this.canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;", e.appendChild(this.canvas), this.resize();
  }
  /** 原地覆写：将星星重置为从圆边缘出发（跃迁回收用，零 GC） */
  resetAsCenterStar(e) {
    const a = this.canvasW / 2, s = this.canvasH / 2, o = Math.min(this.canvasW, this.canvasH) * (0.2 + Math.random() * 0.2), p = Math.random() * Math.PI * 2, u = a + Math.cos(p) * o, A = s + Math.sin(p) * o, C = Math.atan2(A - s, u - a), D = Math.sqrt(a * a + s * s), I = Math.min(1, o / D), n = it();
    e.ox = u, e.oy = A, e.x = u, e.y = A, e.size = 0.3 + Math.random() * 0.8, e.baseAlpha = 0.15 + Math.random() * 0.25, e.twinkleSpeed = 0.5 + Math.random() * 2, e.twinkleOffset = Math.random() * Math.PI * 2, e.warpAngle = C, e.warpSpeed = B + (et - B) * I, e.warpBornInWarp = !0, e.warpStreak = Math.random() < 0.5, e.colorR = n.r, e.colorG = n.g, e.colorB = n.b;
  }
  /** 创建一颗随机位置的常驻星星 */
  makeStar(e, a) {
    const s = Math.random() * this.canvasW, r = e + Math.random() * (a - e), o = it();
    return {
      ox: s,
      oy: r,
      x: s,
      y: r,
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
  /** 初始化星点 — 在画布 + 出血区范围内均匀分布 */
  generateStars() {
    this.stars = [];
    const e = this.canvasH * dt, a = this.canvasH + e * 2, s = this.canvasW * a, r = Math.max(
      xt,
      Math.min(Mt, Math.round(s * gt))
    );
    for (let o = 0; o < r; o++)
      this.stars.push(this.makeStar(-e, this.canvasH + e));
  }
  /** 触发跃迁：进入加速期；warp 期间可重置巡航计时器
   *  @param cruiseDuration 巡航时长（ms），默认 CRUISE_DURATION
   */
  triggerWarp(e = ct) {
    if (P(`triggerWarp: phase=${this.warpPhase}, stars=${this.stars.length}, cruise=${e}ms`), this.warpPhase === "ramp" || this.warpPhase === "decay") return;
    if (this.warpPhase === "warp") {
      this.phaseStart = performance.now(), P("triggerWarp: warp重置");
      return;
    }
    this.warpPhase = "ramp", this.phaseStart = performance.now(), this.cruiseDuration = e;
    const a = this.canvasW / 2, s = this.canvasH / 2, r = Math.sqrt(a * a + s * s);
    for (const o of this.stars) {
      const p = o.x - a, u = o.y - s, A = Math.sqrt(p * p + u * u);
      o.warpAngle = Math.atan2(u, p);
      const C = Math.min(1, A / r);
      o.warpSpeed = B + (et - B) * C, o.warpBornInWarp = !1, o.warpStreak = Math.random() < 0.5;
    }
    if (w) {
      const o = this.stars.slice(0, 5).map((p) => `(${p.x.toFixed(0)},${p.y.toFixed(0)})`).join(" ");
      P(`triggerWarp: 星星样本 = ${o}`);
    }
    P(`triggerWarp: 进入ramp, 星星数=${this.stars.length}`);
  }
  /** 调整 canvas 尺寸（容差 2px，防止 1px 抖动反复重建星星） */
  resize() {
    const e = this.hideable.clientWidth, a = this.hideable.clientHeight;
    if (e === 0 || a === 0) return;
    const s = Math.abs(e - this.canvasW), r = Math.abs(a - this.canvasH);
    if ((s >= 2 || r >= 2) && (P(`resize: ${this.canvasW}x${this.canvasH} → ${e}x${a} (dw=${s}, dh=${r})`), this.canvasW = e, this.canvasH = a, this.canvas.width = e, this.canvas.height = a, this.ctx = this.canvas.getContext("2d"), this.generateStars(), this.warpPhase !== "normal")) {
      P(`resize: 跃迁中(${this.warpPhase})，重算跃迁方向`);
      const o = e / 2, p = a / 2;
      for (const u of this.stars) {
        const A = u.x - o, C = u.y - p;
        u.warpAngle = Math.atan2(C, A), u.warpSpeed = B + Math.random() * (et - B), u.warpBornInWarp = !1;
      }
    }
  }
  /** 更新滚动位置 */
  updateScroll() {
    const e = this.hideable.querySelector(".orca-block-editor") ?? this.hideable;
    this.scrollY = e.scrollTop;
  }
  /** 画一个带拖尾的星星 */
  drawStreakStar(e, a, s, r, o, p, u, A, C) {
    if (this.ctx) {
      if (r > 0.5) {
        const D = e - Math.cos(s) * r, I = a - Math.sin(s) * r;
        this.ctx.beginPath(), this.ctx.moveTo(D, I), this.ctx.lineTo(e, a), this.ctx.strokeStyle = `rgba(${u},${A},${C},${p * 0.5})`, this.ctx.lineWidth = Math.max(0.5, o * 0.7), this.ctx.stroke();
      }
      this.ctx.beginPath(), this.ctx.arc(e, a, o, 0, Math.PI * 2), this.ctx.fillStyle = `rgba(255,255,255,${p})`, this.ctx.fill();
    }
  }
  /** 调试模式：画一颗亮红色圆点 + 方向线 */
  drawDebugDot(e, a, s) {
    if (s.beginPath(), s.arc(e.x, e.y, 3, 0, Math.PI * 2), s.fillStyle = "#ff0000", s.fill(), a) {
      const r = e.warpSpeed * 10;
      s.beginPath(), s.moveTo(e.x, e.y), s.lineTo(
        e.x + Math.cos(e.warpAngle) * r,
        e.y + Math.sin(e.warpAngle) * r
      ), s.strokeStyle = "rgba(255, 0, 0, 0.6)", s.lineWidth = 1, s.stroke();
    }
  }
  /** 绘制一帧 */
  draw(e, a, s, r) {
    if (!this.ctx) return;
    this.fpsFrameCount++, e - this.fpsLastTime >= 1e3 && (this.fps = this.fpsFrameCount, this.fpsFrameCount = 0, this.fpsLastTime = e);
    const p = (this.scrollY - this.prevScrollY) * vt;
    this.prevScrollY = this.scrollY;
    const u = this.canvasH * dt, A = -u, C = this.canvasH + u;
    if (this.warpPhase === "normal" || this.warpPhase === "decay")
      for (const i of this.stars)
        i.oy -= p, i.y -= p, i.oy > C ? (i.ox = Math.random() * this.canvasW, i.oy = A - Math.random() * u * 0.5, i.x = i.ox, i.y = i.oy) : i.oy < A && (i.ox = Math.random() * this.canvasW, i.oy = C + Math.random() * u * 0.5, i.x = i.ox, i.y = i.oy);
    this.frameCount++;
    let D = 0, I = 0;
    const n = this.ctx, S = this.canvasW, l = this.canvasH;
    n.clearRect(0, 0, S, l), w && (n.fillStyle = "rgba(255, 255, 0, 0.15)", n.fillRect(0, 0, S, l));
    const h = S / 2, d = l / 2, k = Math.sqrt(S * S + l * l) / 2;
    let f = 0;
    if (this.warpPhase !== "normal") {
      const i = this.warpPhase === "ramp" ? bt : this.warpPhase === "warp" ? this.cruiseDuration : wt;
      if (f = Math.max(0, Math.min(1, (e - this.phaseStart) / i)), f >= 1)
        if (this.warpPhase === "ramp")
          this.warpPhase = "warp", this.phaseStart = e, f = 0, P(`phase: ramp→warp, stars=${this.stars.length}`);
        else if (this.warpPhase === "warp") {
          this.warpPhase = "decay", this.phaseStart = e, f = 0;
          let t = 0;
          for (let T = 0; T < this.stars.length; T++) {
            const g = this.stars[T];
            g.ox = g.x, g.oy = g.y, g.warpBornInWarp = !1, (g.ox < -2 || g.ox > S + 2 || g.oy < -2 || g.oy > l + 2) && (this.resetAsCenterStar(g), t++);
          }
          P(`phase: warp→decay, stars=${this.stars.length}, recycled=${t}`);
        } else this.warpPhase === "decay" && (this.warpPhase = "normal", f = 0, P(`phase: decay→normal, stars=${this.stars.length}`));
    }
    if (w)
      n.shadowBlur = 0;
    else
      switch (this.warpPhase) {
        case "ramp":
          n.shadowBlur = 4 + 4 * f * f;
          break;
        case "warp":
          n.shadowBlur = 8;
          break;
        case "decay":
          n.shadowBlur = 4 + 4 * (1 - f);
          break;
        default:
          n.shadowBlur = 4;
          break;
      }
    if (w && this.warpPhase === "ramp" && f < 0.05) {
      const i = this.stars.slice(0, 5).map((t) => `(${t.x.toFixed(0)},${t.y.toFixed(0)})`).join(" ");
      P(`ramp-early: p=${f.toFixed(3)}, 星星样本 = ${i}`);
    }
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const t = this.stars[i], T = t.colorR, g = t.colorG, W = t.colorB;
      switch (w || (n.shadowColor = `rgba(${T}, ${g}, ${W}, 0.8)`), this.warpPhase) {
        case "normal": {
          if (a) {
            const x = t.x - s, M = t.y - r, v = Math.sqrt(x * x + M * M), y = v < z ? 1 - v / z : 0, m = Math.sin(e * 1e-3 * t.twinkleSpeed + t.twinkleOffset) * 0.5 + 0.5;
            if (v < z && v > 0) {
              const b = y * ht, F = t.ox - x / v * b, Q = t.oy - M / v * b;
              t.x += (F - t.x) * E, t.y += (Q - t.y) * E;
            } else
              t.x += (t.ox - t.x) * E, t.y += (t.oy - t.y) * E;
            if (t.y < -2 || t.y > l + 2) continue;
            if (w)
              this.drawDebugDot(t, !1, n);
            else {
              let b = t.baseAlpha;
              b += y * 0.9, b += m * 0.25 * y, b = Math.min(1, b), n.beginPath(), n.arc(t.x, t.y, t.size, 0, Math.PI * 2), n.fillStyle = `rgba(${T},${g},${W},${b})`, n.fill();
            }
          } else {
            if (t.x += (t.ox - t.x) * E, t.y += (t.oy - t.y) * E, t.y < -2 || t.y > l + 2) continue;
            w ? this.drawDebugDot(t, !1, n) : (n.beginPath(), n.arc(t.x, t.y, t.size, 0, Math.PI * 2), n.fillStyle = `rgba(${T},${g},${W},${t.baseAlpha})`, n.fill());
          }
          break;
        }
        case "ramp": {
          if (t.warpStreak) {
            const x = Math.sqrt(
              (t.x - h) * (t.x - h) + (t.y - d) * (t.y - d)
            ), M = Math.min(1, x / k), v = 5 - 4 * M, y = Math.pow(f, v), m = t.warpSpeed * y;
            if (t.x += Math.cos(t.warpAngle) * m, t.y += Math.sin(t.warpAngle) * m, t.x < -50 || t.x > S + 50 || t.y < -50 || t.y > l + 50) {
              this.resetAsCenterStar(t), w && I++;
              continue;
            }
            if (w)
              this.drawDebugDot(t, !0, n);
            else {
              const b = 1 + (st - 1) * y * M, F = t.size * b, Q = N * y;
              let tt = t.baseAlpha + Q;
              tt = Math.min(1, tt);
              const ft = m * 6;
              this.drawStreakStar(t.x, t.y, t.warpAngle, ft, F, tt, T, g, W);
            }
          } else {
            const x = Math.sqrt(
              (t.x - h) * (t.x - h) + (t.y - d) * (t.y - d)
            ), v = 5 - 4 * Math.min(1, x / k), y = Math.pow(f, v), m = t.warpSpeed * lt * y;
            if (t.x += Math.cos(t.warpAngle) * m, t.y += Math.sin(t.warpAngle) * m, t.x < -50 || t.x > S + 50 || t.y < -50 || t.y > l + 50) {
              this.resetAsCenterStar(t);
              continue;
            }
            if (w)
              this.drawDebugDot(t, !1, n);
            else {
              let b = t.baseAlpha + N * y;
              b = Math.min(1, b), n.beginPath(), n.arc(t.x, t.y, t.size, 0, Math.PI * 2), n.fillStyle = `rgba(${T},${g},${W},${b})`, n.fill();
            }
          }
          break;
        }
        case "warp": {
          if (t.warpStreak) {
            const x = t.warpSpeed * (1 - f * f);
            if (t.x += Math.cos(t.warpAngle) * x, t.y += Math.sin(t.warpAngle) * x, t.x < -50 || t.x > S + 50 || t.y < -50 || t.y > l + 50) {
              this.resetAsCenterStar(t), w && I++;
              continue;
            }
            if (w)
              this.drawDebugDot(t, !0, n);
            else {
              const M = Math.sqrt(
                (t.x - h) * (t.x - h) + (t.y - d) * (t.y - d)
              ), v = 1 + (st - 1) * Math.min(1, M / k), y = t.size * v;
              let m = t.baseAlpha + N;
              m = Math.min(1, m);
              const b = x * 6;
              this.drawStreakStar(t.x, t.y, t.warpAngle, b, y, m, T, g, W);
            }
          } else {
            const x = t.warpSpeed * lt * (1 - f * f);
            if (t.x += Math.cos(t.warpAngle) * x, t.y += Math.sin(t.warpAngle) * x, t.x < -50 || t.x > S + 50 || t.y < -50 || t.y > l + 50) {
              this.resetAsCenterStar(t);
              continue;
            }
            if (w)
              this.drawDebugDot(t, !1, n);
            else {
              let M = t.baseAlpha + N;
              M = Math.min(1, M), n.beginPath(), n.arc(t.x, t.y, t.size, 0, Math.PI * 2), n.fillStyle = `rgba(${T},${g},${W},${M})`, n.fill();
            }
          }
          break;
        }
        case "decay": {
          const x = 1 - (1 - f) * (1 - f), M = x;
          if (a && M > 0.01) {
            const v = t.x - s, y = t.y - r, m = Math.sqrt(v * v + y * y), b = m < z ? 1 - m / z : 0;
            if (m < z && m > 0) {
              const F = b * ht * M;
              t.x += (t.ox - v / m * F - t.x) * E, t.y += (t.oy - y / m * F - t.y) * E;
            } else
              t.x += (t.ox - t.x) * E * M, t.y += (t.oy - t.y) * E * M;
          }
          if (t.y < -2 || t.y > l + 2) continue;
          if (w)
            this.drawDebugDot(t, !1, n);
          else {
            const v = N * (1 - x);
            let y = t.baseAlpha + v;
            y = Math.min(1, y);
            const m = Math.sqrt(
              (t.x - h) * (t.x - h) + (t.y - d) * (t.y - d)
            ), b = 1 + (st - 1) * (1 - x) * Math.min(1, m / k), F = t.size * b;
            n.beginPath(), n.arc(t.x, t.y, F, 0, Math.PI * 2), n.fillStyle = `rgba(255,255,255,${y})`, n.fill();
          }
          break;
        }
      }
    }
    let L = 0, V = 0, G = 0, j = 0;
    if (w) {
      L = 1 / 0, V = -1 / 0, G = 1 / 0, j = -1 / 0;
      for (const i of this.stars)
        i.x < L && (L = i.x), i.x > V && (V = i.x), i.y < G && (G = i.y), i.y > j && (j = i.y), i.x >= 0 && i.x <= S && i.y >= 0 && i.y <= l && D++;
    }
    if (w) {
      n.shadowBlur = 0;
      const i = this.hideable.querySelectorAll(".orca-startrek-starfield").length;
      n.fillStyle = "#ff0000", n.font = "bold 14px monospace", n.textBaseline = "top", n.fillText(`phase: ${this.warpPhase} | fps: ${this.fps}`, 10, 10), n.fillText(`stars: ${this.stars.length} | inCanvas: ${D} | offCanvas: ${I}`, 10, 30), n.fillText(`canvas: ${S}x${l} | canvases: ${i}`, 10, 50), i > 1 && n.fillText(`⚠ 检测到 ${i} 个 canvas！`, 10, 70);
    }
    if (n.shadowBlur = 0, w) {
      const i = this.warpPhase !== "normal" ? 1 : 60;
      this.frameCount % i === 0 && P(`tick: phase=${this.warpPhase}, stars=${this.stars.length}, inCanvas=${D}, x=[${L.toFixed(0)},${V.toFixed(0)}] y=[${G.toFixed(0)},${j.toFixed(0)}], canvas=${S}x${l}`);
    }
  }
  /** 销毁实例 */
  destroy() {
    this.canvas.remove(), this.ctx = null, this.stars = [];
  }
}
const at = "__startrek_cleanup";
function $t() {
  const c = window[at];
  c && (P("startStarfield: 清理上一套残留实例"), c());
  let e = 0, a = -999, s = -999, r = null;
  const o = /* @__PURE__ */ new Map();
  yt();
  const p = () => {
    const l = document.querySelectorAll(
      ".orca-hideable:not(.orca-hideable-hidden):not(.orca-memoizedviews-active)"
    );
    for (const h of l) {
      const d = h;
      o.has(d) || o.set(d, new St(d));
    }
    for (const [h, d] of o)
      (!document.body.contains(h) || h.classList.contains("orca-hideable-hidden") || h.classList.contains("orca-memoizedviews-active")) && (d.destroy(), o.delete(h));
  }, u = (l) => {
    for (const [, h] of o) {
      h.resize(), h.updateScroll();
      const d = h.hideable === r, k = d ? a : -999, f = d ? s : -999;
      h.draw(l, d, k, f);
    }
    e = requestAnimationFrame(u);
  }, A = (l) => {
    var d;
    const h = document.elementFromPoint(l.clientX, l.clientY);
    if (h) {
      const k = (d = h.closest) == null ? void 0 : d.call(h, ".orca-hideable");
      if (k && o.has(k)) {
        r = k;
        const f = k.getBoundingClientRect();
        a = l.clientX - f.left, s = l.clientY - f.top;
      } else
        r = null, a = -999, s = -999;
    }
  }, C = () => {
    r = null, a = -999, s = -999;
  };
  document.addEventListener("pointermove", A), document.addEventListener("pointerleave", C);
  const D = new MutationObserver(() => {
    p();
  });
  D.observe(document.body, {
    childList: !0,
    subtree: !0
  });
  const I = new MutationObserver((l) => {
    for (const h of l)
      if (h.type === "attributes" && h.attributeName === "class") {
        const d = h.target;
        if (d.classList.contains("orca-repr-task-content") && d.classList.contains("orca-repr-task-1") && !d.classList.contains("orca-repr-task-0")) {
          const k = d.closest(".orca-hideable");
          if (k) {
            const f = o.get(k);
            f && f.triggerWarp();
          }
        }
      }
  });
  I.observe(document.body, {
    attributes: !0,
    subtree: !0,
    attributeFilter: ["class"]
  });
  const n = new MutationObserver((l) => {
    for (const h of l)
      if (h.type === "attributes" && h.attributeName === "data-status") {
        const d = h.target;
        if (d.dataset.name === "task" && d.dataset.status === "Done") {
          if (!d.closest(".orca-repr-main-content")) continue;
          const f = d.closest(".orca-hideable");
          if (f) {
            const L = o.get(f);
            L && (P("bigTaskObserver: 大任务完成，触发 5 秒跃迁"), L.triggerWarp(4100));
          }
        }
      }
  });
  n.observe(document.body, {
    attributes: !0,
    subtree: !0,
    attributeFilter: ["data-status"]
  }), p(), setTimeout(p, 500), setTimeout(p, 2e3), e = requestAnimationFrame(u);
  const S = () => {
    cancelAnimationFrame(e), document.removeEventListener("pointermove", A), document.removeEventListener("pointerleave", C), D.disconnect(), I.disconnect(), n.disconnect();
    for (const [, l] of o)
      l.destroy();
    o.clear(), document.querySelectorAll(".orca-startrek-starfield").forEach((l) => l.remove()), delete window[at];
  };
  return window[at] = S, S;
}
let q, nt = !1, U = !0;
const _ = "oh-StarTrek", H = (...c) => {
  nt && console.log("[oh-StarTrek]", ...c);
};
function Pt() {
  const c = (a = document) => {
    a.querySelectorAll(".orca-select-menu .orca-select-item-label").forEach((s) => {
      var o;
      const r = (o = s.textContent) == null ? void 0 : o.trim();
      r && (s.dataset.fontPreview || r !== "默认" && (s.style.fontFamily = `"${r}", sans-serif`, s.dataset.fontPreview = r));
    });
  };
  setTimeout(() => c(), 2e3);
  const e = new MutationObserver((a) => {
    for (const s of a)
      if (s.type === "childList" && s.addedNodes.length > 0)
        for (const r of s.addedNodes)
          r instanceof Element && c(r);
  });
  return e.observe(document.body, { childList: !0, subtree: !0 }), e;
}
let K = null;
function At() {
  const c = (e) => {
    const a = e.closest(".orca-input");
    if (!a) return;
    const s = a.offsetWidth, r = Math.max(200, Math.min(500, 150 + s * 0.15));
    a.style.setProperty("--milk-input-spread-dur", `${r}ms`);
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
function kt() {
  const c = (a) => {
    const s = a.offsetHeight, r = Math.max(400, Math.min(1500, 200 + s * 0.6));
    a.style.setProperty("--milk-scope-spread-dur", `${r}ms`);
  };
  document.addEventListener(
    "mouseenter",
    (a) => {
      var r, o;
      const s = (o = (r = a.target).closest) == null ? void 0 : o.call(r, ".orca-repr-scope-line");
      s && c(s);
    },
    !0
  ), new MutationObserver((a) => {
    for (const s of a)
      if (s.type === "attributes" && s.attributeName === "class") {
        const r = s.target;
        if (r.classList.contains("orca-active-parent")) {
          const o = r.querySelector(".orca-repr-scope-line");
          o && c(o);
        }
      }
  }).observe(document.body, { attributes: !0, subtree: !0, attributeFilter: ["class"] });
}
let R = null, O = null, J = null, Z = null;
function rt() {
  H(`applyStarfield: currentThemeName="${O}", THEME_NAME="${_}", fullMode=${U}`), R && (R(), R = null), O === _ && U ? (R = $t(), H("星空已启动")) : H(`星空未启动（${O !== _ ? "主题不匹配" : "满血模式关闭"}）`);
}
const Ct = () => {
  const c = !!document.querySelector('link[rel="stylesheet"][href*="startrek"]'), e = c ? _ : "";
  e !== O && (O = e, H(`主题变更检测: startrek CSS ${c ? "已加载" : "未加载"}`), rt());
};
async function Dt(c) {
  q = c, orca.state.locale, await orca.plugins.setSettingsSchema(q, {
    fullMode: {
      label: "跃迁引擎",
      description: "电脑太卡！关闭跃迁引擎！(ಥ_ಥ)",
      type: "boolean",
      defaultValue: !0
    },
    debugMode: {
      label: "调试模式",
      type: "boolean",
      defaultValue: !1
    }
  });
  const e = () => {
    var u;
    const r = (u = orca.state.plugins[q]) == null ? void 0 : u.settings, o = !!(r != null && r.debugMode), p = (r == null ? void 0 : r.fullMode) !== !1;
    nt = o, mt(nt), p !== U ? (U = p, rt()) : U = p;
  };
  e();
  const { subscribe: a } = window.Valtio;
  Z = a(orca.state.plugins, () => {
    e();
  }), orca.themes.register(q, _, "themes/startrek.css"), K = Pt(), kt(), At(), J = new MutationObserver(() => {
    Ct();
  }), J.observe(document.head, { childList: !0, subtree: !1 }), document.querySelector('link[rel="stylesheet"][href*="startrek"]') ? (O = _, H("检测到 startrek CSS 已加载，当前主题即为目标主题")) : O = "", rt(), H(`${q} loaded.`);
}
async function It() {
  orca.themes.unregister(_), K && (K.disconnect(), K = null), J && J.disconnect(), Z && (Z(), Z = null), R && (R(), R = null), H(`${q} unloaded.`);
}
export {
  Dt as load,
  It as unload
};
