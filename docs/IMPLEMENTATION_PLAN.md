# Engineering portfolio implementation plan

## Purpose and audience

A concise, technical case-study site for engineering recruiters, researchers, thesis supervisors, and automotive R&D teams. The site presents electrical/automotive engineering first and uses machine learning as a method, not an identity.

## Visual system

- Dark graphite background, warm white type, subtle grid/rule structure, restrained teal (battery), amber (driving), and blue (energy) accents.
- Editorial typography, wide whitespace, and dense but legible data graphics. Motion explains transitions and stops under reduced-motion preferences.
- One visual language, not a light/dark toggle. No stock images or decorative fake interfaces.

## Architecture

- React + TypeScript + Vite, with carefully structured CSS and no charting or animation dependency.
- Project content is defined in typed data objects; one case-study page renders any project through reusable story, metric, visual, and navigation components.
- Hash-addressed case-study URLs work on GitHub Pages without server rewrites.
- Small, committed visualization datasets are derived from existing output CSV files; no raw battery, driving, or household data are published.

## Case-study map

| Project | Evidence-led story | Primary visuals |
| --- | --- | --- |
| Intelligent BMS | RWTH signal pipeline; coulomb-counting drift; two-state Thevenin EKF; capacity SoH; interpolation versus later-life extrapolation; anomaly review. | Real SoC trace, circuit diagram, SoH trajectory, model comparisons, flag summary. |
| Driver behavior | Simulator data audit; causal LEFT/RIGHT/KEEP baseline; horizon and indicator ablation; completed but inconclusive personalized memory; distinctiveness follow-on. | Causal timeline, conceptual lane-change animation, real benchmark chart, personalized-versus-shuffled comparison. |
| E.ON challenge | Day-ahead household energy forecasting; calendar/lag/weather alignment; chronological baseline; clustering as segmentation; comparative limits. | Forecast pipeline, feature-importance chart, cluster segmentation, aggregate MAE comparison. |

## Verification and publication

Build the production bundle; check metrics against the source reports, project routes, responsive layouts, asset paths, keyboard operation, and reduced motion. Publish only the portfolio site to a new public GitHub repository with a GitHub Actions Pages workflow. Keep the three source repositories private and exclude all raw datasets, private identifiers, and model binaries.
