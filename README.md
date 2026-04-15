<div align="center">
  <img src="/public/favicon.svg" alt="Blacktop icon" width="120" />
  <h1>Blacktop</h1>
  <p><strong>OLED-friendly fullscreen black overlay for Android desktop setups</strong></p>
</div>

---

## Why

Android desktop modes (Google Pixel, Samsung DeX, etc.) keep the phone screen powered on while connected to an external monitor. The screen sits face-down or unused, draining battery and wearing out OLED pixels. Blacktop fixes this: one tap sends the display into a pure black fullscreen, cutting OLED power draw to near-zero without actually turning off the screen (which would kill the desktop session).

## Features

### Pure Black Fullscreen
Covers the entire screen with `#000000`. On OLED panels, black pixels are physically off — zero light output, minimal power draw. Tap anywhere to exit.

### Wake Lock
Prevents the display from sleeping while Blacktop is in fullscreen mode. Toggle available in the UI. When the tab loses visibility, the lock is released automatically and re-acquired when the tab returns.

### PWA — Install as App
Blacktop ships as a Progressive Web App. Install it to the home screen for standalone, fullscreen launch without browser chrome. Works on Android Chrome and supports iOS Safari via `apple-mobile-web-app-capable`.

### Offline Support
Service Worker caches all assets. Works without a network connection after first load.

### No Backend, No Permissions
Static page. No server, no login, no data collected. Runs entirely in the browser.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | [Svelte 5](https://svelte.dev) (runes) |
| Styling | [Tailwind CSS](https://tailwindcss.com) + [shadcn-svelte](https://shadcn-svelte.com) |
| Bundler | [Vite](https://vitejs.dev) |
| Distribution | GitHub Pages |

## Development

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Production build
npm run build
```

## Usage

1. Open [blacktop](https://maxmoffa.github.io/blacktop/) on the Android device used as desktop.
2. (Optional) Install as PWA via **Install App** button.
3. Tap **Enter Fullscreen** — screen goes black.
4. Tap anywhere to exit.
