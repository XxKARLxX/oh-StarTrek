# Changelog

All notable changes to this project will be documented in this file.

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
