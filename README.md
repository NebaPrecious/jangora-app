# Jangora App

Personal finance app built with Ionic, Angular and Capacitor.

Author: Engr. Wankie

## What you need

- Node.js 20 or newer
- npm

## First time

```bash
npm install
```

## Run the app

| Command | Sign in | Data |
|---|---|---|
| `npm start` | Real Firebase | Real backend (must be running on `http://localhost:3000`) |
| `npm run start:mock` | Real Firebase | Sample data saved in the browser (no backend needed) |
| `npm run start:offline` | Test sign-in (no internet needed) | Sample data saved in the browser |

The app opens at `http://localhost:8100` (`npm start` uses `http://localhost:4200`).

### Good to know

- With `start:mock` and `start:offline`, data stays in your browser only.
  To clear it, open the browser console and run `localStorage.clear()`, then refresh.
- With `start:offline`, emails are not sent. The verify and reset links show in a
  "Dev inbox" box on the screen.
- Fingerprint / Face ID unlock only works on a phone.

## Other commands

| Command | What it does |
|---|---|
| `npm test` | Runs the tests |
| `npm run lint` | Checks the code style |
| `npm run build` | Builds the app for release (output in `www/`) |
