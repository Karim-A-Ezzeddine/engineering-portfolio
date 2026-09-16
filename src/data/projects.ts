export type ProjectId = 'bms' | 'driver' | 'eon';
export type VisualId =
  | 'bms-pipeline' | 'bms-signals' | 'bms-coulomb' | 'bms-circuit' | 'bms-soc' | 'bms-soh' | 'bms-validation' | 'bms-anomaly' | 'bms-dashboard'
  | 'driver-timeline' | 'driver-audit' | 'driver-road' | 'driver-horizon' | 'driver-ablation' | 'driver-split' | 'driver-memory' | 'driver-research'
  | 'eon-system' | 'eon-data' | 'eon-features' | 'eon-baseline' | 'eon-clusters' | 'eon-comparison' | 'eon-takeaway';

export interface ProjectMetric {
  value: string;
  label: string;
  note?: string;
}

export interface StoryStep {
  kicker: string;
  title: string;
  body: string[];
  visual: VisualId;
  insight?: string;
  detail?: { title: string; body: string[] };
  source: string;
}

export interface Project {
  id: ProjectId;
  short: string;
  number: string;
  discipline: string;
  title: string;
  question: string;
  summary: string;
  heroMetric: ProjectMetric;
  metrics: ProjectMetric[];
  methods: string[];
  sourceNote: string;
  figure?: { src: string; alt: string; caption: string };
  steps: StoryStep[];
}

export const projects: Project[] = [
  {
    id: 'bms', short: 'BMS', number: '01', discipline: 'STATE ESTIMATION · BATTERY SYSTEMS',
    title: 'Intelligent Battery Management System',
    question: 'How much can model-based voltage correction reduce SoC drift?',
    summary: 'An independent Python pipeline turns lithium-ion cycling data into state estimates, degradation models, and anomaly-review signals.',
    heroMetric: { value: '1.388', label: 'pp SoC MAE', note: 'Cell 002 · protocol-anchored reference' },
    metrics: [
      { value: '92.35%', label: 'SoC MAE reduction', note: 'EKF versus Coulomb counting' },
      { value: '2.420', label: 'pp SoH MAE', note: 'Leave-one-cell-out Random Forest' },
      { value: '25.825', label: 'pp later-life MAE', note: 'Random Forest chronological test' },
    ],
    methods: ['Python', 'Signal processing', 'Coulomb counting', 'Thevenin EKF', 'Random Forest', 'Streamlit'],
    sourceNote: 'RWTH Aachen UR18650E cells. SoC uses a protocol-derived approximation, not independent ground truth. SoH is relative to the first valid capacity check.',
    figure: { src: 'figures/bms-ekf-comparison.png', alt: 'Original project plot comparing Coulomb counting, EKF, and the protocol-anchored SoC reference over time', caption: 'Original analysis output · cell 002 · Phase 4' },
    steps: [
      {
        kicker: '01 / THE SYSTEM', title: 'From measured signals to decisions',
        body: ['A battery management system cannot measure charge or health directly. It has voltage, current, temperature, and the history of how the cell has been used.', 'This project builds the full chain from a raw archive to estimates that can be inspected, compared, and challenged.'],
        visual: 'bms-pipeline', insight: 'Every downstream result depends on consistent cleaning and cycle boundaries.', source: 'README.md · phases 1–8',
      },
      {
        kicker: '02 / DATASET', title: 'A controlled aging campaign',
        body: ['The RWTH Aachen release contains cycling and aging records for 48 nominally identical 1.85 Ah NMC/graphite cylindrical cells. The loader reads nested experiment archives without expanding the full ~5 GB release.', 'Time, current, voltage, and temperature are cleaned before charge/discharge cycle segmentation and throughput integration.'],
        visual: 'bms-signals', insight: 'The plotted signals are sampled from the real cell-002 evaluation trace.', source: 'README.md · phase 1 and phase 2 reports',
        detail: { title: 'Preprocessing controls', body: ['Critical signal values are range-checked rather than imputed. Duplicate timestamps are removed. Integration skips logging gaps longer than 60 seconds and cycle boundaries.'] },
      },
      {
        kicker: '03 / BASELINE', title: 'Integration is simple. Drift is not.',
        body: ['Coulomb counting integrates current from an assumed initial 80% SoC. It is transparent, but current and capacity errors accumulate in open loop.', 'On 88,196 samples from complete cell-002 cycles, the baseline reaches 18.155 percentage-point MAE against a protocol-anchored SoC reference.'],
        visual: 'bms-coulomb', insight: 'The benchmark reference is derived from the cycling protocol—not an independent SoC sensor.', source: 'Phase 3 report · Phase 4 EKF report',
      },
      {
        kicker: '04 / MODEL', title: 'Correct with measured voltage',
        body: ['A two-state Extended Kalman Filter estimates SoC and RC polarization voltage. Current integration predicts the state; an OCV–SoC curve and one-RC Thevenin circuit predict terminal voltage.', 'The difference between predicted and measured voltage updates the state instead of allowing integration error to grow unchecked.'],
        visual: 'bms-circuit', insight: 'The OCV curve and circuit parameters were calibrated from separate beginning-of-life records for cell 002.', source: 'Phase 4 EKF report',
        detail: { title: 'How the EKF works', body: ['State: x = [SoC, polarization voltage]. SoC follows signed current integration; polarization decays through an RC time constant. Predicted terminal voltage is OCV(SoC) + R₀I + polarization voltage under the dataset’s positive-charge convention.', 'The voltage innovation updates both states. A 0.25 V innovation gate excludes implausible corrections, and covariance uses the Joseph update form.'] },
      },
      {
        kicker: '05 / EVALUATION', title: 'A smaller error, with a defined reference',
        body: ['On the identical cell-002 sample mask, EKF MAE is 1.388 points and RMSE is 1.842 points. Coulomb counting records 18.155 and 20.621 points respectively.', 'That is a 92.35% MAE reduction on this benchmark. It is not a claim of absolute field accuracy because the SoC reference is protocol-derived.'],
        visual: 'bms-soc', insight: 'Voltage correction keeps the estimate near the reference while the open-loop baseline drifts.', source: 'Phase 4 EKF report · Phase 6 shared-mask comparison',
      },
      {
        kicker: '06 / DEGRADATION', title: 'Health is capacity, measured over time',
        body: ['Usable capacity comes from comparable diagnostic discharges. Each cell is normalized to its first valid check, producing a capacity-based degradation index.', 'For four cells, 67 checks provide targets for models using preceding cycling exposure, temperature, voltage, and efficiency features.'],
        visual: 'bms-soh', insight: 'The first observed capacity check—not the 1.85 Ah nominal rating—defines 100% SoH here.', source: 'Phase 5 SoH report · phase5_soh_dataset.csv',
      },
      {
        kicker: '07 / VALIDATION', title: 'Interpolation is not forecasting',
        body: ['Nested leave-one-cell-out testing asks whether a model transfers to another cell within the same campaign. The Random Forest scores 2.420-point MAE and R² 0.9767.', 'Training on early checks and predicting later-life degradation is a different problem. The same model reaches 25.825-point MAE and negative R². A simple quadratic trend is less inaccurate, but also has negative R².'],
        visual: 'bms-validation', insight: 'The strong cross-cell fit does not support long-horizon remaining-life claims.', source: 'Phase 6 model comparison report',
        detail: { title: 'Evaluation protocol', body: ['The outer leave-one-cell-out fold holds out each of cells 002–005 once; configuration selection occurs inside the remaining training cells. The chronological split trains on the earliest 60% of checks for each cell and tests on the later 40%.'] },
      },
      {
        kicker: '08 / SCREENING', title: 'Flag unusual behavior—do not diagnose it',
        body: ['Engineering thresholds and Isolation Forest together flag 464 of 10,528 aging cycles for review. The rule and statistical reasons remain separate and auditable.', 'The dataset has no verified fault labels. These are screening signals, not confirmed battery faults.'],
        visual: 'bms-anomaly', insight: 'Unusual cycles include incomplete boundaries and regime changes, not necessarily damage.', source: 'Phase 7 anomaly-detection report',
      },
      {
        kicker: '09 / INTERFACE', title: 'Make the evidence inspectable',
        body: ['A Streamlit monitor brings signal exploration, SoC traces, SoH degradation, model comparison, and anomaly flags together by cell and cycle.', 'The project demonstrates battery modeling, estimation, signal processing, leakage-aware evaluation, anomaly screening, and testable Python software.'],
        visual: 'bms-dashboard', insight: 'The interface preview is a schematic reconstruction of the implemented dashboard, not a screenshot.', source: 'Phase 8 dashboard report · app.py',
      },
    ],
  },
  {
    id: 'driver', short: 'DRIVER BEHAVIOR', number: '02', discipline: 'AUTOMOTIVE DATA · CAUSAL MACHINE LEARNING',
    title: 'Driver Behavior AI',
    question: 'Can earlier driving behavior improve later lane-change prediction?',
    summary: 'An audit-first study of lane-change intention, causal observation windows, and the limits of personalized driver memory.',
    heroMetric: { value: '0.986', label: 'macro-F1', note: '1 s horizon · generic logistic baseline' },
    metrics: [
      { value: '48', label: 'distinct recordings', note: 'After duplicate removal' },
      { value: '2,455', label: 'usable events', note: 'From 3,450 geometric crossings' },
      { value: '0.633', label: 'macro-F1 at 3 s', note: 'Generic tree · no indicators' },
    ],
    methods: ['Python', 'Vehicle dynamics', 'Causal features', 'Logistic regression', 'Decision trees', 'Driver-level evaluation'],
    sourceNote: 'Event-aligned simulator benchmark. Recording IDs are not proof of unique human identities. Results are not continuous-driving deployment performance.',
    figure: { src: 'figures/driver-horizon-ablation.png', alt: 'Original project plot of mean per-driver macro-F1 versus prediction horizon, with and without indicators', caption: 'Original generic-baseline analysis output · ten unseen test recordings' },
    steps: [
      {
        kicker: '01 / QUESTION', title: 'Predict before the maneuver',
        body: ['The task is LEFT, RIGHT, or KEEP at a fixed time before a lane crossing. A useful predictor must see only what was available at its decision time.', 'The larger research question is whether earlier events from the same recording add value beyond a generic model.'],
        visual: 'driver-timeline', insight: 'An observation window must end before its prediction cutoff; the crossing is future information.', source: 'README.md · baseline report',
      },
      {
        kicker: '02 / DATA AUDIT', title: 'Establish the actual population',
        body: ['Two exact duplicate recording pairs were removed from 50 filename IDs. The audited set contains 443,367 rows, 3,450 geometric crossings, and 2,455 usable isolated event windows across 48 distinct recordings.', 'The window definition reconstructs direction from lane geometry and excludes nearby crossings that would contaminate an event.'],
        visual: 'driver-audit', insight: '48 distinct recordings is not independent proof of 48 unique people.', source: 'README.md · dataset_report.md',
        detail: { title: 'Event construction', body: ['A usable event has a complete four-second countdown, a full ignored period after crossing, corroborating lane-boundary wraps, finite core signals, and no crossing in its 5.5-second audit span. These are quality rules, not a measured physical maneuver duration.'] },
      },
      {
        kicker: '03 / VEHICLE SIGNALS', title: 'Dynamics, controls, and context',
        body: ['Steering angle, yaw rate, lateral acceleration, speed, indicators, lane geometry, and observed traffic form the measured context.', 'The road motion here is a conceptual explanation of the prediction task; it is not a replay of a particular recorded trajectory.'],
        visual: 'driver-road', insight: 'Model inputs are derived from real signal columns, not imagined driver traits.', source: 'README.md · baseline feature manifest',
      },
      {
        kicker: '04 / BASELINE', title: 'Prediction gets harder earlier',
        body: ['Separate logistic and shallow-tree classifiers predict at 1, 2, and 3 seconds before crossing. The most recent measured sample is 1.1, 2.1, or 3.1 seconds before the event.', 'The generic logistic model scores 0.986, 0.809, and 0.664 mean per-driver test macro-F1 with all signals as the horizon moves earlier.'],
        visual: 'driver-horizon', insight: 'These are ten held-out recording IDs on event-aligned, sampled KEEP examples.', source: 'baseline_report.md · aggregate_metrics.csv',
      },
      {
        kicker: '05 / ABLATION', title: 'Remove the obvious cue',
        body: ['Ablating both turn indicators tests whether the models rely primarily on a direct intent signal. The logistic baseline at 3 seconds falls from 0.664 to 0.611 macro-F1; the tree falls from 0.688 to 0.633.', 'Performance remains above the majority KEEP reference of 0.222, but the gap shows why feature ablations matter.'],
        visual: 'driver-ablation', insight: 'Feature removal applies to both current inputs and historical profiles in the later personalization test.', source: 'baseline_report.md · Model B report',
      },
      {
        kicker: '06 / PROTOCOL', title: 'Freeze the evaluation before modeling',
        body: ['The split is by recording: 33 train, 5 validation, and 10 test. Validation selects model settings before one test inference.', 'Personal histories use only completed past events. The same later evaluation examples, labels, KEEP anchors, and prediction cutoffs are held fixed across generic and personalized conditions.'],
        visual: 'driver-split', insight: 'No model sees future rows, held-out test drivers during fitting, or its own evaluation event inside its history.', source: 'README.md · Model B report',
        detail: { title: 'Leakage controls', body: ['One-second current observations are strictly before the cutoff. Historical event windows must complete before the current observation starts. Driver-level splits prevent the same recording from appearing in training and test. A frozen H10 suffix keeps H0/H5/H10 comparisons on identical events.'] },
      },
      {
        kicker: '07 / PERSONAL MEMORY', title: 'A gain is not automatically personalization',
        body: ['Handcrafted Model B is implemented. At the 3-second, indicator-free condition, raw H10 memory raises the tree from 0.633 to 0.693 macro-F1. But shuffled other-driver memory reaches 0.685, and only 6 of 10 drivers improve.', 'The prespecified consistency rule was not met; the context-adjusted profile did not reproduce the gain. The result is no-go for claiming a reliable driver-specific benefit.'],
        visual: 'driver-memory', insight: 'The correct-minus-shuffled advantage is only +0.008, with an interval that includes zero.', source: 'MODEL_B_REPORT.md',
      },
      {
        kicker: '08 / RESEARCH DIRECTION', title: 'Identity signal ≠ task utility',
        body: ['A later learned-embedding test also found negligible improvement over a competent generic lane-change predictor. The repository therefore does not claim that personalized memory improves this task.', 'Separate same-vehicle, common-route cross-trip experiments found behavioral persistence, including 0.605 top-1 retrieval in a ten-driver cohort. Vehicle and context invariance remain open questions.'],
        visual: 'driver-research', insight: 'Model C current-versus-personal deviation features are not implemented for lane-change prediction.', source: 'C1 report · KE Motors Research Checkpoint V2',
      },
    ],
  },
  {
    id: 'eon', short: 'E.ON', number: '03', discipline: 'ENERGY SYSTEMS · DAY-AHEAD FORECASTING',
    title: 'E.ON Data Analytics Challenge',
    question: 'Do household segments improve day-ahead energy forecasts?',
    summary: 'An interpretable consumption-forecasting baseline and a test of whether household clustering adds useful predictive structure.',
    heroMetric: { value: '4.946', label: 'kWh/day MAE', note: 'Global baseline · 152 model-ready households' },
    metrics: [
      { value: '152', label: 'households modeled', note: 'Of 156 in the challenge dataset' },
      { value: '0.891', label: 'test R²', note: 'Global linear regression' },
      { value: '4', label: 'household segments', note: 'Exploratory K-means grouping' },
    ],
    methods: ['Python', 'Time-series forecasting', 'Weather alignment', 'Linear regression', 'K-means', 'Ridge regression'],
    sourceNote: 'Aggregate challenge findings only; no individual household readings or identifiers are published. Cluster and baseline models did not use identical features in the first comparison.',
    figure: { src: 'figures/eon-feature-importance.png', alt: 'Original project plot of standardized coefficients and permutation importance for the global household consumption model', caption: 'Original analysis output · aggregate feature importance' },
    steps: [
      {
        kicker: '01 / ENERGY QUESTION', title: 'Forecast tomorrow’s demand',
        body: ['Day-ahead procurement depends on anticipating consumption before the next trading window. Heat pumps and rooftop PV make household patterns heterogeneous.', 'The challenge asks for a forecasting engine, then tests whether grouping similar households helps more than one pooled model.'],
        visual: 'eon-system', insight: 'The project is about day-ahead consumption forecasting, not real-time grid control.', source: 'E.ON challenge README',
      },
      {
        kicker: '02 / DATA', title: 'Align two clocks',
        body: ['The challenge provides daily smart-meter consumption for 156 households and hourly observations from eight weather stations. The implemented baseline has 152 model-ready households and 83,429 rows.', 'Weather is aggregated to daily features and joined with each household’s calendar and consumption history.'],
        visual: 'eon-data', insight: 'Only aggregate properties are shown publicly; household-level records remain outside this site.', source: 'E.ON challenge README · linear_regression/metrics.json',
      },
      {
        kicker: '03 / FEATURES', title: 'Let yesterday inform tomorrow',
        body: ['The global model uses yesterday’s demand, a seven-day lag and rolling mean, daily temperature, sunshine, precipitation, and calendar features.', 'Permutation tests rank lag-1 consumption and the rolling seven-day mean above weather variables on this test set.'],
        visual: 'eon-features', insight: 'Shuffling lag-1 consumption increases test MAE by 9.41 kWh/day in the saved analysis.', source: 'feature_importance_permutation.csv · comparison report',
      },
      {
        kicker: '04 / BASELINE', title: 'A transparent global forecast',
        body: ['A single linear regression model is trained across model-ready households. Each household is split chronologically: earlier 80% for training, later 20% for testing.', 'The resulting test MAE is 4.946 kWh/day, RMSE is 7.205 kWh/day, and R² is 0.891.'],
        visual: 'eon-baseline', insight: 'The chronological split preserves the forecasting direction; a random split would be easier but misleading.', source: 'linear_regression/metrics.json',
      },
      {
        kicker: '05 / SEGMENTATION', title: 'Four interpretable household groups',
        body: ['K-means groups 150 households using 32 standardized household-level descriptors: consumption distribution, weekly and seasonal patterns, building metadata, and PV ownership.', 'The groups separate PV owners, moderate stable demand, high volatility, and very high consumption. Separate Ridge models then forecast within each group.'],
        visual: 'eon-clusters', insight: 'Segmentation can be useful for understanding heterogeneity even if it does not improve forecast error.', source: 'Baseline Clustering Comparison Report',
      },
      {
        kicker: '06 / COMPARISON', title: 'Specialization did not win overall',
        body: ['On the report-qualified clustered households, the pooled baseline records 4.919 kWh/day MAE versus 5.121 for the weighted cluster-specific Ridge models. Three of four segments favor the global model.', 'This is directional, not a pure clustering effect: the global model includes weather while the cluster models do not.'],
        visual: 'eon-comparison', insight: 'The strongest fair next test would use identical households, features, and time splits for pooled and cluster models.', source: 'Baseline Clustering Comparison Report',
        detail: { title: 'Comparison caveat', body: ['The first grouped comparison aligns households and chronological test rows but not feature sets. A separate global model with Cluster_ID as a feature improves MAE only slightly; its subset also differs from the headline baseline. Neither result justifies a broad causal claim about clustering.'] },
      },
      {
        kicker: '07 / TAKEAWAY', title: 'Interpretability is a result too',
        body: ['The global, weather-enriched baseline is the stronger forecast in the current comparison. Clusters offer a useful description of household behavior rather than a clear accuracy gain.', 'The work shows how temporal validation, feature audit, and a transparent baseline can prevent a more complex method from being credited without controlled evidence.'],
        visual: 'eon-takeaway', insight: 'Next experiment: matched-feature global Ridge versus cluster-specific Ridge on the same test rows.', source: 'Baseline Clustering Comparison Report',
      },
    ],
  },
];

export const projectById = Object.fromEntries(projects.map((project) => [project.id, project])) as Record<ProjectId, Project>;
