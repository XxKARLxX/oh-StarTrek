# Changelog

All notable changes to this project will be documented in this file.

## [2.5.0] - 2026-05-15

### Added

- **变形场联动（Morphic Field）** — 拖拽 LCARS 手柄时，指示线附近的星星受引力牵引飞驰，拖出流光尾迹；松手后星星缓缓归位，光芒渐熄
  - 纯引力模型：星星朝手柄当前位置移动，距离越近偏移越小
  - 拖尾基于帧位移，停走即消失
  - 发光放大复用跃迁 WARP_SIZE_SCALE / WARP_ALPHA_BOOST
  - decay 阶段：发光从峰值以 MORPHIC_DECAY_SPEED 衰减，与归位同步
  - 引力范围按画布宽度比例（25%）自适应
- **手柄指示线视觉增强** — 覆盖 LCARS 基础样式，融入主题风格
  - 橙色线体（--milk-caramel），hover 渐显 0.3s，移走渐隐 0.5s
  - 拖拽中：4px 宽，橙色渐变（中间全色两端淡出），4 层蓝色发光（14/26/42/84px）
  - 两边指示线同时显示（:has() 选择器）

### Fixed

- L-01：跃迁结束/视差回收时同步 prevX，防止一帧假拖尾
- M-01：无拖拽时跳过 DOM 查询，querySelector 替代 querySelectorAll

## [2.4.0] - 2026-05-12

### Added

- **引擎功率三档系统** — 新增插件设置项，可切换最大功率 / 巡航功率 / 引擎怠速，控制星空密度倍率与帧率上限
  - 最大功率：120fps / 密度×1.0
  - 巡航功率：60fps / 密度×0.8
  - 引擎怠速：30fps / 密度×0.6
  - 跃迁期间自动解锁帧率至 120fps 保证动画流畅
  - 关闭跃迁引擎时功率选项自动隐藏
- **窗口失焦暂停** — 切换到其他应用时暂停星空渲染（`visibilitychange` + `window blur/focus` 双层覆盖），回到 Orca 自动恢复
- **渲染容器白名单** — 星空仅在 `.orca-panels-container` 主编辑区域创建，侧边栏插件面板不再创建无意义实例
- 调试模式显示当前功率档位
- `PowerLevel` 类型导出，`PluginState.powerLevel` 使用联合类型

### Changed

- 密度倍率作用于面积密度而非最大星数上限，确保档位切换实际生效
- `vite.config.publish.ts` 改用环境变量 `ORCA_PLUGIN_DIR`，与开发配置保持一致
- 衰减期添加伪光晕渐出效果，视觉风格与正常状态过渡更自然
- `hexToRgb` 解析失败时直接返回 fallback RGB，消除递归调用
- 调试模式 `offCanvasCount` 补充实际统计逻辑

### Fixed

- **scopeLine mouseenter 监听器泄漏**：保存引用 `scopeLineMouseEnterHandler`，`unload()` 中正确移除
- **PluginState.powerLevel 类型过宽**：从 `string` 改为 `PowerLevel` 联合类型，消除 `as` 断言
- **lastPointerX/Y 死代码**：删除未使用的变量声明

### Removed

- 移除 i18n 基础设施（`l10n.ts` + `zhCN.ts` + `setupL10N` 调用），所有 UI 文案直接硬编码中文

## [2.3.0] - 2026-05-12

### Changed

- **[性能] 星空渲染优化**：正常状态关闭 `shadowBlur` 高斯模糊，改用双圈伪光晕模拟柔光效果；跃迁期间才启用 `shadowBlur`；低于 30fps 时自适应全面关闭
- **[性能] 合并 MutationObserver**：task observer 和 bigTask observer 合并为一个，减少 DOM 监听回调开销
- **[性能] elementFromPoint 节流**：16ms 节流限制 `elementFromPoint` 调用频率，减少 reflow
- **[重构] draw() 方法拆分**：提取为 `drawNormal()`/`drawRamp()`/`drawWarp()`/`drawDecay()` 四个独立方法，降低圈复杂度
- **[重构] 插件状态封装**：模块级变量封装为 `PluginState` 接口 + `state` 对象

### Fixed

- **[P1] scopeLine MutationObserver 内存泄漏**：`startScopeLineDynamics()` 创建的 Observer 在 `unload()` 中未断开
- **[P1] focusin/focusout 监听器残留**：插件卸载后事件监听器仍在 `document` 上触发
- **[P1] 字体设置不恢复**：开启推荐字体后关闭主题或卸载插件，用户原始字体设置被永久修改
- **[P2] hexToRgb 解析失败静默**：调试模式下输出 `console.warn` 便于排查配色错误
- **[P2] initColors 异常未处理**：`getComputedStyle` 在特殊时机可能抛异常
- **[P2] 跃迁后星星缩回原位**：跃迁期间持续同步 `ox/oy` 锚点，避免衰减期缓动拉回旧位置
- **[类型] window as any**：`Window` 接口扩展 `__startrek_cleanup`，`delete` 改用 `Reflect.deleteProperty`
- **[类型] e.target as HTMLElement**：改用 `instanceof` 类型守卫
- **[类型] orca.d.ts 双重 declare**：移除冗余的 `declare` 关键字
- **[类型] Window.Valtio 类型为 any**：定义最小必要类型签名

### Added

- 主题检测选择器提取为 `THEME_CSS_SELECTOR` 常量，注释说明为何保留 `*=` 包含匹配
- 颜色 fallback 值提取为 `SLATE_FALLBACK`/`ORANGE_FALLBACK` 命名常量
- 青色星星比例提取为 `CYAN_RATIO` 命名常量
- 流光公式参数提取为 `INPUT_SPREAD_*`/`SCOPE_SPREAD_*` 命名常量
- `vite.config.ts` 支持环境变量 `ORCA_PLUGIN_DIR` 覆盖默认输出路径
- README 新增 Browser Compatibility 章节，标注 CSS 现代特性最低 Chromium 版本要求
- 代码审计报告（`audit/audit-report.md`）和复核报告（`audit/review-report.md`）

## [2.2.2] - 2026-04-24

### Fixed

- 修复查询块展开时卡顿：隐藏面板（`orca-hideable-hidden`）的星空 canvas 不再渲染，避免触发 `content-visibility` 强制布局

## [2.2.1] - 2026-04-24

### Changed

- 跃迁星星生成范围从 minSide 的 20%~40% 调整为 5%~40%，填充中心空洞
- 星星密度从 1/8000 调整为 1/12000，降低视觉密度

## [2.2.0] - 2026-04-24

### Added

- **查询字体统一化** — 新增插件设置项，启用后查询结果（卡片/表格/列表）中的标题块字体与文本块保持一致
  - 开启时：查询结果中 heading 的 font-size、font-weight、line-height 继承自父容器，与 text 视觉一致
  - 关闭时：移除 CSS class，恢复 Orca 原生 heading 样式
  - 关→开：若主题已激活，立即应用
  - 仅作用于 `.orca-query-results` 内，不影响其他区域的 heading
- 新增 `vite.config.publish.ts` — 支持构建到发布仓库（`npm run build:publish`）

## [2.1.0] - 2026-04-24

### Added

- **加载主题时使用推荐字体** — 新增插件设置项，启用后切换到 oh-StarTrek 主题时自动将编辑器与 UI 字体设为衬线体（Noto Serif SC）
  - 开启时：每次启用主题自动切换字体
  - 关闭时：仅关闭自动切换逻辑，不清空已生效的字体
  - 关→开：若主题已激活，立即切换字体
  - 邪修原理：同时修改 Orca 设置值（正道）和 CSS 变量（邪修），确保字体立即生效
- 字体预览 — 设置面板字体下拉菜单中，每个选项以实际字体渲染，方便预览

### Changed

- 移除所有 CSS `font-family !important` 强制覆盖，字体控制完全交给用户
- 插件不再在加载时自动修改用户字体设置，改为用户主动开启

## [2.0.1] - 2026-04-22

### Fixed

- 更新 icon.png

## [2.0.0] - 2026-04-22

### Added

- 星空画布（Starfield Canvas）— 多编辑器面板独立星空，鼠标引力，滚动视差
- 跃迁动画（Warp Animation）— 任务完成触发星空跃迁特效
  - 小任务（勾选 checkbox）~2.5s
  - 大任务（标签设为 Done）~5s
- 主题设计 — 无边框风格，纯中性灰阶，橙 `#C7592A` + 青 `#12C2E9` 强调色
- 引导线流光 — CSS 动画 + 动态时长（按引导线高度自适应）
- 输入框聚焦流光 — 双端展开动画 + 动态时长（按输入框宽度自适应）
- 跃迁引擎开关 — 可关闭星空效果以节省性能
- 调试模式 — 显示 FPS、星星坐标、跃迁阶段信息
- i18n 中文翻译
