# WOPR Game Selection

Mobile-first React app hosting five turn-based strategy games on a single menu: Tic-Tac-Toe, Connect Four, Dots & Boxes, Go, and Global Thermonuclear War. WarGames (1983) themed.

Live: https://wopr.awrylabs.com

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build
npm run preview
```

## Deploy

Pushes to `main` build via GitHub Actions and publish to GitHub Pages. Custom domain `wopr.awrylabs.com` is bound via the `public/CNAME` file (which Vite copies to `dist/`) plus a Cloudflare DNS `CNAME wopr → rhoekstr.github.io`.

See [REFERENCE.md](./REFERENCE.md) for the full architecture and gameplay spec.
