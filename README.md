# CRT ICT Mobile Lab V2

A brand-new React + Vite starter for a mobile-first, screenshot-based CRT / ICT trading analysis workspace.

## Current build: 0.1.0

Included:
- TradingView and MT5 Deriv platform selection
- JPG, JPEG, PNG and WEBP screenshot upload
- Multi-image preview (up to 8 images per session)
- Selectable timeframes (H4, H1, M15, M1 defaults)
- Responsive dark trading-terminal interface
- PWA manifest, service worker and app icons
- Explicit placeholder states: no AI analysis, trading signals, broker connection or live prices are implemented

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

## Deploy

This project is configured for a static Vite deployment. Build output is generated in `dist/`. On GitHub Pages, configure the repository's Pages workflow or use a static host that supports Vite deployments.

## iPhone installation

After deployment over HTTPS:
1. Open the deployed site in Safari.
2. Tap Share.
3. Choose Add to Home Screen.
4. Enable Open as Web App if shown, then tap Add.

## Important limitations

- Screenshot previews are held in browser memory and are not uploaded to a server.
- The selected instrument and timeframe are not automatically extracted yet.
- AI vision, CRT/ICT rule evaluation, precise price extraction, risk sizing, journal persistence, backtesting and Deriv MT5 integration are future stages.
- Never treat this starter interface as a source of trading advice or a verified trading signal.

## Security

Do not put AI provider keys, Supabase service-role keys or broker credentials in frontend code. Add authenticated server-side endpoints before connecting any external analysis or broker service.
