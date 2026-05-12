# 🖖 oh-StarTrek

A Star Trek-inspired visual theme plugin for [Orca Note](https://github.com/sethyuan/orca-note), featuring an interactive starfield canvas with warp animation, mouse gravity, and task-triggered jump effects.

## Features

### 🌌 Starfield Canvas

- **Multi-panel support** — each editor panel gets its own independent starfield
- **Mouse gravity** — stars near your cursor brighten and pull toward it
- **Scroll parallax** — stars drift slower than content for a depth effect
- **Dual-color stars** — 60% cyan, 40% orange, matching the theme accents

### ⚡ Warp Animation

Task completion triggers a 4-phase warp animation:

- **Ramp** (0.4s) — stars accelerate outward from center
- **Cruise** (1.6s small / 4.1s big task) — full speed with streak trails
- **Decay** (0.5s) — brightness and size fade back to normal

| Trigger | Duration | How |
|---------|----------|-----|
| Checkbox task (小任务) | ~2.5s | Checking a task checkbox |
| Tag "Done" task (大任务) | ~5s | Setting a task tag to "Done" |

50% of stars produce streak trails during warp; the other 50% only drift slowly, keeping visual density comfortable.

### 🎨 Theme Design

- **Borderless** — uses inset box-shadows for depth instead of borders
- **Pure neutral B&W** gray scale — zero hue shift on base colors
- **Dark mode accents**: orange `#C7592A` + cyan `#12C2E9`
- **Light mode accents**: deep red `#B81C1C` + purple `#8B5CF6`
- **Scope-line gradient**: orange → cyan → orange with CSS-animatable spread
- **Input focus glow**: spread animation with duration scaled to input width
- **Font preview**: dropdown menus show actual font rendering

### ⚙️ Plugin Settings

| Setting | Default | Description |
|---------|---------|-------------|
| 跃迁引擎 (Warp Engine) | On | Controls starfield activation. Turn off if experiencing lag (ಥ_ಥ) |
| 调试模式 (Debug Mode) | Off | Shows FPS counter, star coordinates, and phase info overlay |

## Installation

1. Clone or download this repo into your Orca Note plugins directory
2. The plugin directory should be named `oh-StarTrek`
3. Restart Orca Note — the theme "oh-StarTrek" will appear in theme settings

### Build from Source

```bash
npm install
npm run build
```

Build output goes to `dist/`. Make sure `vite.config.ts` `PLUGIN_DIR` points to your Orca plugins directory.

## Architecture

```
src/
  main.tsx          # Plugin lifecycle, theme detection, settings
  starfield.ts      # Starfield engine: multi-panel canvas, warp state machine
  orca.d.ts         # Orca API type declarations
  libs/l10n.ts      # i18n helper
  translations/
    zhCN.ts         # Chinese translations
themes/
  startrek.css      # Theme CSS: variable overrides + dark mode
```

## Related Projects

- **Orca Note** — [github.com/sethyuan/orca-note](https://github.com/sethyuan/orca-note)
- **Awesome OrcaNote** (plugin collection) — [github.com/sethyuan/awesome-orcanote](https://github.com/sethyuan/awesome-orcanote)

## Browser Compatibility

oh-StarTrek uses modern CSS features that require a recent Chromium-based browser. Since Orca Note runs on Electron, compatibility is generally not an issue.

| Feature | Min Chrome | Min Firefox | Min Safari |
|---------|-----------|------------|------------|
| `color-mix(in oklab, ...)` | 111 | 113 | 16.2 |
| `rgb(from ...)` (relative color) | 119 | 128 | 16.4 |
| `@property` | 85 | 128 | 15.4 |
| `@scope` | 118 | — | — |
| `oklch()` | 111 | 113 | 15.4 |

**Minimum recommended**: Chrome 119+ / Electron 28+

## License

MIT
