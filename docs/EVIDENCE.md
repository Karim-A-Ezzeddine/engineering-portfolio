# Source evidence and public-content boundaries

This document records the local repository evidence used to write the public portfolio. Source repositories and raw datasets are not copied into this site.

## Intelligent BMS

- `intelligent_bms/README.md` and `docs/phases/01_DATA_AND_LOADER.md`: RWTH Aachen UR18650E NMC/graphite dataset, 48 cells, 1.85 Ah nominal capacity, time/current/voltage/temperature signals.
- `docs/phases/04_KALMAN_EKF_SOC.md`, `outputs/phase4_ekf_metrics.json`, `outputs/phase4_ekf_trace.csv`: cell-002 88,196-sample comparison; coulomb-counting MAE 18.155 points, EKF MAE 1.388 points and RMSE 1.842 points, 92.35% MAE reduction. Reference is protocol-anchored, **not independent ground truth**.
- `docs/phases/05_SOH_AND_ML.md`, `outputs/phase5_soh_dataset.csv`: SoH is normalized to each cell's first valid capacity check, not the manufacturer's nominal capacity.
- `docs/phases/06_MODEL_COMPARISON.md`, `outputs/phase6_chronological_metrics.csv`: nested leave-one-cell-out Random Forest MAE 2.420 points, R² 0.9767; later-life Random Forest MAE 25.825 points, R² -6.2745. The latter is not hidden.
- `docs/phases/07_ANOMALY_DETECTION.md`: 464 cycle review flags from 10,528 aging cycles; no verified fault labels.
- `docs/phases/08_STREAMLIT_DASHBOARD.md` and `app.py`: Streamlit monitor exists.

## Driver behavior

- `driver-behavior/README.md`, `outputs/dataset_report.md`: 443,367 deduplicated rows, 3,450 crossings, 2,455 usable windows, 48 distinct recordings (not proof of 48 unique humans).
- `outputs/baseline/generic_v1/baseline_report.md` and `aggregate_metrics.csv`: equal-driver test macro-F1 for logistic/all signals = 0.986 / 0.809 / 0.664 at 1 / 2 / 3 seconds. Tree/all = 0.965 / 0.828 / 0.688. Test set uses 10 held-out recording IDs and event-aligned, sampled KEEP examples.
- `outputs/personalization/model_b_v1/MODEL_B_REPORT.md`: Model B is **implemented**, contrary to the older README's future-work language. Generic 3-second/no-indicator tree = 0.633; B1 H10 = 0.693; shuffled profiles = 0.685; only 6/10 drivers improve. No reliable driver-specific benefit established.
- `outputs/embedding_personalization/c1_v1/EXPERIMENT_C1_REPORT.md` and `KE_MOTORS_RESEARCH_CHECKPOINT_V2.md`: a learned embedding personalization experiment is also complete and offers negligible advantage over generic. A general vehicle-invariant personal representation remains future work.
- The road animation is labeled a conceptual explanation, not a replay of measured trajectories.

## E.ON data analytics challenge

- `E.on/datasets/E.on_Gitlab/README.md`: day-ahead energy-consumption/production challenge, daily household consumption and hourly weather source data; challenge describes 156 households.
- `outputs/linear_regression/metrics.json`: global linear regression uses 152 model-ready households, 83,429 rows, per-household chronological 80/20 split; test MAE 4.946 kWh/day, RMSE 7.205 kWh/day, R² 0.891.
- `Base_Model_Plus_ClusteringID/BASELINE_CLUSTERING_COMPARISON_REPORT.md` and `outputs/metrics_summary.json`: four K-means household segments, with the global model stronger than separate cluster Ridge models overall (4.919 vs 5.121 kWh/day MAE on report-qualifying grouped households). First comparison is not feature-identical: the global model includes weather while cluster models do not. Adding Cluster_ID to the global model yields only a small gain, 4.946 to 4.912 kWh/day MAE, on a slightly different subset and should not be described as a controlled effect.
- No individual household IDs, readings, or household-specific plots are published.
