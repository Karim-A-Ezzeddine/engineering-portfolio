# Karim Ezzeddine — engineering portfolio

A static, evidence-led engineering case-study site for Karim Ezzeddine, M.Sc. Electrical Engineering at the Technical University of Munich (Automation & Robotics). The three initial studies cover battery state estimation, lane-change prediction, and day-ahead household energy forecasting.

## Run locally

Requires Node.js 24 and pnpm 10.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:5173/engineering-portfolio/`.

## Production build

```bash
pnpm build
pnpm preview
```

The static output is `dist/`. The Vite base path is `/engineering-portfolio/` for a GitHub **project** site. Case-study links use hash routes (`#/work/bms`, `#/work/driver`, `#/work/eon`) so direct links and refreshes work without server rewrites. If the GitHub repository is renamed, change `base` in `vite.config.ts` and update the canonical URLs in `index.html`, `public/robots.txt`, and `public/sitemap.xml`.

## Architecture

- `src/data/projects.ts` is the reusable case-study schema and content. Add a project there, its visual ID and rendering in `src/components/Visuals.tsx`, and its source evidence in `docs/EVIDENCE.md`.
- `src/App.tsx` supplies navigation, a reusable case-study page, a sticky desktop story, and sequential mobile presentation.
- `src/components/Visuals.tsx` contains lightweight SVG/HTML engineering diagrams and charts. It uses no chart framework.
- `src/data/derived/` contains two small, rounded, sampled **derived** JSON traces for the BMS visuals, generated from local analysis outputs with `scripts/extract-evidence.mjs`. The source repository is not needed to build this portfolio.
- `public/figures/` contains three original aggregate figures from the project repositories.
- `src/data/site.ts` holds configurable contact links. No email, LinkedIn URL, or CV was guessed.
- `docs/IMPLEMENTATION_PLAN.md` and `docs/EVIDENCE.md` document design choices and repository evidence.

The portfolio does **not** include raw battery archives, vehicle recordings, household-level smart-meter readings, proprietary employer information, or model binaries.

## Technical evidence and limitations

The BMS project evaluates an EKF against a **protocol-anchored SoC approximation**, not an independent ground-truth sensor. Its strong leave-one-cell-out SoH result does not carry over to later-life extrapolation. Driver Behavior Model B was implemented but did **not** establish a reliable driver-specific lane-change benefit after a shuffled-memory control. The E.ON global model and cluster-specific models did not use identical features in the first comparison, so the observed difference is not a clean causal estimate of clustering's value. Precise source paths and metrics are in [`docs/EVIDENCE.md`](docs/EVIDENCE.md).

## GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds on every push to `main` and publishes `dist/` with the official GitHub Pages Actions flow. In the repository's **Settings → Pages**, choose **GitHub Actions** as the build and deployment source. Then run the workflow or push to `main`.

Expected public URL: `https://karim-a-ezzeddine.github.io/engineering-portfolio/`.

## Before sharing widely

Set the verified public email, LinkedIn URL, and/or CV path in `src/data/site.ts`. A profile photograph or explanatory video is optional and intentionally absent. If these fields stay unset, the site shows clear non-clickable placeholders rather than broken or invented links.
