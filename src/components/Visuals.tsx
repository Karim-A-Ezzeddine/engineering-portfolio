import { useState } from 'react';
import type { VisualId } from '../data/projects';
import socRaw from '../data/derived/socTrace.json';
import sohRaw from '../data/derived/sohSeries.json';

type Trace = { day: number; ref: number; cc: number; ekf: number; voltage: number; current: number; temperature: number };
type Health = { cell: number; cycles: number; soh: number };
const soc = socRaw as Trace[];
const soh = sohRaw as Health[];
const colors = { teal: '#2b8f82', amber: '#bd6b32', blue: '#4f7898', pale: '#27343a', muted: '#647477', red: '#bb604e' };

function Panel({ eyebrow, title, note, children }: { eyebrow: string; title: string; note?: string; children: React.ReactNode }) {
  return <div className="visual-frame"><div className="visual-heading"><span>{eyebrow}</span><strong>{title}</strong></div><div className="visual-content">{children}</div>{note && <p className="visual-note">{note}</p>}</div>;
}

function PathChart({ rows, x, y, series, xMax, yMin, yMax, xLabel, yLabel }: { rows: Array<Record<string, number>>; x: string; y?: string; series: { key: string; name: string; color: string }[]; xMax: number; yMin: number; yMax: number; xLabel: string; yLabel: string }) {
  const px = (value: number) => 45 + (Math.max(0, Math.min(value, xMax)) / xMax) * 545;
  const py = (value: number) => 262 - ((Math.max(yMin, Math.min(value, yMax)) - yMin) / (yMax - yMin)) * 222;
  const path = (key: string) => rows.map((row, index) => `${index ? 'L' : 'M'}${px(row[x]).toFixed(1)},${py(row[key]).toFixed(1)}`).join(' ');
  return <div className="chart-wrap"><svg viewBox="0 0 640 310" role="img" aria-label={`${yLabel} over ${xLabel}`}>
    {[40, 95.5, 151, 206.5, 262].map((value) => <line key={value} x1="45" x2="590" y1={value} y2={value} stroke="#405051" strokeWidth="1" />)}
    {[45, 181, 317, 453, 590].map((value) => <line key={value} y1="40" y2="262" x1={value} x2={value} stroke="#2d3d3d" strokeWidth="1" />)}
    <text x="45" y="291" className="chart-axis">0</text><text x="590" y="291" textAnchor="end" className="chart-axis">{xMax} {xLabel}</text>
    <text x="44" y="32" className="chart-axis">{yMax} {yLabel}</text><text x="44" y="278" className="chart-axis">{yMin}</text>
    {series.map((item) => <path key={item.key} d={path(item.key)} fill="none" stroke={item.color} strokeWidth="2.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />)}
    {y && <text x="315" y="305" textAnchor="middle" className="chart-axis">{y}</text>}
  </svg><div className="chart-legend">{series.map((item) => <span key={item.key}><i style={{ background: item.color }} />{item.name}</span>)}</div></div>;
}

function Pipeline() {
  return <Panel eyebrow="SYSTEM ARCHITECTURE" title="Measured → estimated → reviewed" note="Implemented Python pipeline · phases 1–8"><div className="pipeline">
    {['Raw cycling data','Clean & segment','Cycle features','SoC · SoH','Evaluate','Review flags','Monitor'].map((item, index) => <div className="pipeline-step" key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong>{index < 6 && <i aria-hidden="true">→</i>}</div>)}
  </div></Panel>;
}

function Signals() {
  const subset = soc.filter((point) => point.day <= .65);
  const normalized = subset.map((p) => ({ day: p.day, voltage: (p.voltage - 2.5) / 1.8, current: (p.current + 5) / 10, temperature: (p.temperature - 20) / 18 }));
  return <Panel eyebrow="CELL 002 · EVALUATION TRACE" title="Three measured channels" note="Real sampled trace. Lines are independently normalized to reveal timing, not directly comparable magnitudes."><PathChart rows={normalized} x="day" series={[{ key: 'voltage', name: 'Voltage', color: colors.teal }, { key: 'current', name: 'Current', color: colors.amber }, { key: 'temperature', name: 'Temperature', color: colors.blue }]} xMax={.65} yMin={0} yMax={1} xLabel="days" yLabel="normalized" /></Panel>;
}

function Coulomb() {
  return <Panel eyebrow="OPEN-LOOP BASELINE" title="Coulomb counting drifts" note="Cell 002 · 88,196 evaluated samples · reference is protocol-anchored"><PathChart rows={soc} x="day" series={[{ key: 'ref', name: 'Protocol reference', color: colors.pale }, { key: 'cc', name: 'Coulomb counting', color: colors.amber }]} xMax={6.7} yMin={0} yMax={105} xLabel="days" yLabel="SoC %" /></Panel>;
}

function Circuit() {
  return <Panel eyebrow="ONE-RC THEVENIN MODEL" title="Two states, one voltage correction" note="Equivalent circuit is explanatory; R₀ = 0.030 Ω, R₁ = 0.020 Ω, C₁ = 750 F in the cell-002 implementation."><svg className="circuit" viewBox="0 0 640 300" role="img" aria-label="Thevenin circuit showing OCV source, series resistance R0, RC polarization branch, current, and terminal voltage">
    <path d="M75 60H165 M215 60H306 M386 60H550 V242 H75 V60" fill="none" stroke="#b8dbd2" strokeWidth="3" />
    <circle cx="75" cy="151" r="37" fill="#f7f9fa" stroke="#2b8f82" strokeWidth="3" /><path d="M75 114v-54M75 188v54" stroke="#2b8f82" strokeWidth="3" /><path d="M64 143h22M75 132v22M65 163h20" stroke="#2b8f82" strokeWidth="2" />
    <path d="M165 44l8 32 11-32 11 32 10-32 10 32" fill="none" stroke="#d6a881" strokeWidth="3" /><path d="M306 60v36M386 60v36M306 96H386M306 192H386M306 192v50M386 192v50" fill="none" stroke="#95b2c7" strokeWidth="3" />
    <path d="M320 99l7 26 11-26 11 26 10-26 9 26v22" fill="none" stroke="#95b2c7" strokeWidth="3" /><path d="M369 165h33M369 177h33" stroke="#95b2c7" strokeWidth="3" />
    <path d="M550 100v32M550 174v32" stroke="#27343a" strokeWidth="2" /><circle cx="550" cy="153" r="12" fill="#f7f9fa" stroke="#27343a" strokeWidth="2" />
    <text x="27" y="270">OCV(SoC)</text><text x="169" y="106">R₀</text><text x="316" y="153">R₁</text><text x="410" y="179">C₁</text><text x="518" y="86">Vterminal</text><text x="458" y="45">I →</text>
  </svg><p className="circuit-equation">Vₜ = OCV(SoC) + R₀I + Vₚ</p></Panel>;
}

function SocComparison() {
  return <Panel eyebrow="IDENTICAL SAMPLE MASK" title="Correction contains the drift" note="MAE: 18.155 → 1.388 percentage points; protocol-derived reference, not absolute ground truth."><PathChart rows={soc} x="day" series={[{ key: 'ref', name: 'Protocol reference', color: colors.pale }, { key: 'cc', name: 'Coulomb counting', color: colors.amber }, { key: 'ekf', name: 'EKF', color: colors.teal }]} xMax={6.7} yMin={0} yMax={105} xLabel="days" yLabel="SoC %" /></Panel>;
}

function SohTrajectory() {
  const palette = [colors.teal, colors.amber, colors.blue, '#c4b0c9'];
  const rows = [2, 3, 4, 5].map((cell) => soh.filter((p) => p.cell === cell).map((p) => ({ cycles: p.cycles, soh: p.soh })));
  const px = (v: number) => 45 + v / 2700 * 545;
  const py = (v: number) => 262 - (v - 20) / 85 * 222;
  return <Panel eyebrow="CAPACITY CHECKS · CELLS 002–005" title="Degradation is measured, not inferred" note="67 diagnostic checks · normalized to each cell’s first valid capacity check."><div className="chart-wrap"><svg viewBox="0 0 640 310" role="img" aria-label="State of health measured over cumulative complete cycles for four cells">
    {[40,95.5,151,206.5,262].map((v) => <line key={v} x1="45" x2="590" y1={v} y2={v} stroke="#405051" />)}
    {[45,181,317,453,590].map((v) => <line key={v} y1="40" y2="262" x1={v} x2={v} stroke="#2d3d3d" />)}
    <text x="45" y="32" className="chart-axis">105 SoH %</text><text x="44" y="278" className="chart-axis">20</text><text x="45" y="291" className="chart-axis">0</text><text x="590" y="291" textAnchor="end" className="chart-axis">2700 cycles</text>
    {rows.map((series, index) => <g key={index}><path d={series.map((p, i) => `${i ? 'L' : 'M'}${px(p.cycles).toFixed(1)},${py(p.soh).toFixed(1)}`).join(' ')} fill="none" stroke={palette[index]} strokeWidth="2.5" />{series.map((p, i) => <circle key={i} cx={px(p.cycles)} cy={py(p.soh)} r="3.4" fill={palette[index]} />)}</g>)}
  </svg><div className="chart-legend">{[2,3,4,5].map((cell, i) => <span key={cell}><i style={{ background: palette[i] }} />Cell 00{cell}</span>)}</div></div></Panel>;
}

function BarPair({ items, max, unit = '' }: { items: { label: string; value: number; color: string; sub?: string }[]; max: number; unit?: string }) {
  return <div className="bar-pair">{items.map((item) => <div className="bar-row" key={item.label}><div className="bar-row-head"><span>{item.label}</span><strong>{item.value.toFixed(3)}{unit}</strong></div><div className="bar-track"><span style={{ width: `${Math.max(0, Math.min(item.value / max * 100, 100))}%`, background: item.color }} /></div>{item.sub && <small>{item.sub}</small>}</div>)}</div>;
}

function Validation() {
  return <Panel eyebrow="TWO DIFFERENT QUESTIONS" title="Same campaign ≠ later life" note="Random Forest results · capacity-based SoH · only four cells in one campaign."><BarPair items={[{ label: 'Leave-one-cell-out MAE', value: 2.420, color: colors.teal, sub: 'R² 0.9767 · same-campaign interpolation' }, { label: 'Later-life MAE', value: 25.825, color: colors.amber, sub: 'R² −6.2745 · chronological extrapolation' }]} max={30} unit=" pp" /></Panel>;
}

function Anomaly() {
  return <Panel eyebrow="REVIEW SIGNALS · NOT FAULT LABELS" title="464 cycles flagged for inspection" note="10,528 aging cycles screened · 4.41% in the combined review set."><div className="stacked"><div style={{ width: '2.37%', background: colors.teal }} /><div style={{ width: '65.3%', background: colors.blue }} /><div style={{ width: '32.33%', background: colors.amber }} /></div><div className="flag-grid"><div><strong>11</strong><span>Rule only</span></div><div><strong>303</strong><span>Statistical only</span></div><div><strong>150</strong><span>Both</span></div></div><p className="visual-callout">Rules name the engineering threshold; Isolation Forest ranks relative outliers. Neither confirms a physical fault.</p></Panel>;
}

function Dashboard() {
  return <Panel eyebrow="INTERFACE PREVIEW · SCHEMATIC" title="The model output stays inspectable" note="Recreated from the implemented Streamlit modules; not an application screenshot."><div className="dashboard-mock"><div className="dashboard-side"><span>INTELLIGENT BMS</span><strong>Cell 002</strong><small>Cycle range 02–160</small><hr /><small>Signals</small><small>SoC estimation</small><small>SoH degradation</small><small>Anomaly review</small></div><div className="dashboard-main"><span>MONITORING / CELL 002</span><div className="dashboard-mini-metrics"><b>1.388<small>SoC MAE · pp</small></b><b>2.420<small>SoH LOCO · pp</small></b></div><svg viewBox="0 0 370 100" aria-hidden="true"><path d="M0 70Q18 15 38 70T78 70T118 70T158 70T198 70T238 70T278 70T318 70T358 70" fill="none" stroke="#b8dbd2" strokeWidth="2"/><path d="M0 84Q18 30 38 82T78 80T118 79T158 82T198 76T238 74T278 70T318 67T358 62" fill="none" stroke="#d6a881" strokeWidth="2"/></svg><div className="dashboard-pills"><span>Voltage</span><span>Current</span><span>Temperature</span><span>Review flags</span></div></div></div></Panel>;
}

function Timeline() {
  return <Panel eyebrow="CAUSAL PREDICTION GEOMETRY" title="No view beyond the cutoff" note="The window represents the implemented one-second causal observation interval."><div className="timeline"><div className="timeline-track"><span className="observe">OBSERVE</span><span className="horizon">PREDICTION HORIZON</span><i /></div><div className="timeline-labels"><span>cutoff − 1 s</span><span>prediction cutoff</span><span>lane crossing</span></div></div><div className="timeline-classes"><b>LEFT</b><b>RIGHT</b><b>KEEP</b></div></Panel>;
}

function Audit() {
  return <Panel eyebrow="DATA VALIDATION" title="An audit before a classifier" note="Distinct recording IDs are not verified distinct humans."><div className="audit-grid"><div><strong>50</strong><span>filename IDs</span></div><div><strong>2</strong><span>duplicate pairs</span></div><div><strong>48</strong><span>distinct recordings</span></div><div><strong>3,450</strong><span>crossings</span></div><div><strong>2,455</strong><span>usable windows</span></div></div><p className="visual-callout">443,367 deduplicated timesteps, then event-quality filtering and causal windows.</p></Panel>;
}

function Road() {
  const [playing, setPlaying] = useState(true);
  return <Panel eyebrow="CONCEPTUAL EXPLANATION · NOT A REPLAY" title="Lane-change prediction in context" note="The movement illustrates the task only; probabilities and trajectories are not invented from missing data."><div className="road-controls"><span>LEFT / RIGHT / KEEP</span><button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause conceptual road animation' : 'Play conceptual road animation'}>{playing ? 'Pause' : 'Play'} motion</button></div><svg className="road" viewBox="0 0 640 300" role="img" aria-label="Conceptual top-down two-lane road with an ego vehicle changing lanes">
    <rect x="0" y="0" width="640" height="300" fill="#1b2627" /><path d="M0 26H640M0 274H640" stroke="#7b8d8e" strokeWidth="3" /><path d="M0 150H640" stroke="#819193" strokeWidth="2" strokeDasharray="26 18" />
    <g className={playing ? 'road-ego moving' : 'road-ego'}><rect x="250" y="191" width="97" height="43" rx="11" fill="#d6a881"/><rect x="277" y="196" width="44" height="33" rx="5" fill="#514a43"/><path d="M262 198v30M335 198v30" stroke="#f1dbbf" strokeWidth="3"/></g>
    <rect x="477" y="70" width="88" height="38" rx="10" fill="#435456"/><rect x="495" y="75" width="44" height="28" rx="4" fill="#819195"/>
    <path d="M95 213H161" stroke="#b8dbd2" strokeWidth="2" strokeDasharray="6 5"/><path d="m151 204 13 9-13 9" fill="none" stroke="#b8dbd2" strokeWidth="2"/><text x="85" y="190">ego vehicle</text><text x="442" y="60">surrounding traffic</text>
  </svg><p className="road-annotation">Measured signals → causal window → prediction before the crossing</p></Panel>;
}

const horizonData = {
  1: { logistic: .986, tree: .965, logisticNo: .976, treeNo: .886 },
  2: { logistic: .809, tree: .828, logisticNo: .762, treeNo: .723 },
  3: { logistic: .664, tree: .688, logisticNo: .611, treeNo: .633 },
} as const;

function Horizon({ ablation = false }: { ablation?: boolean }) {
  const [horizon, setHorizon] = useState<1 | 2 | 3>(ablation ? 3 : 1);
  const values = horizonData[horizon];
  return <Panel eyebrow="TEST SET · TEN UNSEEN RECORDINGS" title={ablation ? 'What changes without indicators?' : 'Earlier prediction is harder'} note="Mean per-driver macro-F1 · event-aligned benchmark, not continuous-driving false alarms."><div className="horizon-tabs" role="group" aria-label="Prediction horizon">{([1,2,3] as const).map((h) => <button key={h} type="button" aria-pressed={h === horizon} onClick={() => setHorizon(h)}>{h} s before</button>)}</div><BarPair max={1} items={[
    { label: 'Logistic · all signals', value: values.logistic, color: colors.teal },
    { label: 'Logistic · no indicators', value: values.logisticNo, color: colors.muted },
    { label: 'Shallow tree · all signals', value: values.tree, color: colors.amber },
    { label: 'Shallow tree · no indicators', value: values.treeNo, color: colors.blue },
  ]} /></Panel>;
}

function DriverSplit() {
  return <Panel eyebrow="FROZEN RESEARCH PROTOCOL" title="Split by recording, then by time" note="Personal profiles use completed earlier events; current and held-out evaluation events are excluded."><div className="split-bar"><span style={{ width: '68.75%' }}>33 TRAIN</span><span style={{ width: '10.42%' }}>5 VAL</span><span style={{ width: '20.83%' }}>10 TEST</span></div><div className="history-diagram"><div><span>PAST</span><strong>H0 / H5 / H10</strong><small>completed events only</small></div><i aria-hidden="true">→</i><div><span>FUTURE</span><strong>Same evaluation suffix</strong><small>frozen examples & cutoffs</small></div></div></Panel>;
}

function Memory() {
  return <Panel eyebrow="MODEL B · 3 S · NO INDICATORS" title="The shuffle control changes the conclusion" note="Only 6/10 drivers improve with matched H10; strong predeclared criterion requires 7/10."><BarPair max={.8} items={[
    { label: 'Generic tree', value: .633, color: colors.blue },
    { label: 'Matched H10 memory', value: .693, color: colors.teal },
    { label: 'Shuffled other-driver memory', value: .685, color: colors.amber },
  ]} /><p className="visual-callout">+0.060 raw gain; only +0.008 over shuffled history. No reliable driver-specific benefit established.</p></Panel>;
}

function Research() {
  return <Panel eyebrow="SEPARATE FOLLOW-ON EXPERIMENT" title="Identity structure is not task utility" note="Ten-driver cross-trip retrieval used a different dataset and same-vehicle/common-route conditions."><div className="research-grid"><div><span>LANE-CHANGE UTILITY</span><strong>Not established</strong><small>Model B and learned-embedding C1</small></div><div><span>CROSS-TRIP STRUCTURE</span><strong>0.605</strong><small>Top-1 retrieval · 0.10 chance</small></div></div><p className="visual-callout">Next research boundary: test whether personal structure survives changes of vehicle and context.</p></Panel>;
}

function EnergySystem() {
  return <Panel eyebrow="DAY-AHEAD PROCUREMENT" title="Forecast before the next day" note="Challenge scope: demand forecasting for heat-pump households, some with PV."><div className="energy-system"><div><span>TODAY</span><strong>Meter + weather</strong></div><i aria-hidden="true">→</i><div><span>MODEL</span><strong>Forecast demand</strong></div><i aria-hidden="true">→</i><div><span>TOMORROW</span><strong>Procurement decision</strong></div></div></Panel>;
}

function EnergyData() {
  return <Panel eyebrow="SOURCE ALIGNMENT" title="Different sampling rates, one forecast row" note="The public portfolio uses aggregates only; source readings and household identifiers remain private."><div className="data-clocks"><div><span>DAILY</span><strong>156</strong><small>household consumption series in challenge</small></div><div><span>HOURLY</span><strong>8</strong><small>weather-station sources</small></div></div><div className="clock-join">daily weather features + lagged consumption → 83,429 model-ready rows</div></Panel>;
}

function Features() {
  return <Panel eyebrow="PERMUTATION IMPORTANCE" title="Consumption history dominates" note="Increase in test MAE when each feature is shuffled; predictive importance, not causality."><BarPair max={10} unit=" kWh" items={[
    { label: 'Yesterday’s consumption', value: 9.41, color: colors.blue },
    { label: 'Recent seven-day mean', value: 3.49, color: colors.teal },
    { label: 'Daily temperature', value: .48, color: colors.amber },
    { label: 'Seven-day lag', value: .34, color: colors.muted },
  ]} /></Panel>;
}

function Baseline() {
  return <Panel eyebrow="GLOBAL LINEAR REGRESSION" title="Chronological holdout" note="152 model-ready households · per-household earlier 80% train / later 20% test."><div className="metric-stage"><div><strong>4.946</strong><span>kWh/day MAE</span></div><div><strong>7.205</strong><span>kWh/day RMSE</span></div><div><strong>0.891</strong><span>test R²</span></div></div></Panel>;
}

function Clusters() {
  const rows = [{ name: 'High & volatile', count: 76, pv: '12% PV' }, { name: 'PV owners', count: 28, pv: '100% PV' }, { name: 'Moderate & stable', count: 31, pv: '6% PV' }, { name: 'Very high consumption', count: 15, pv: '0% PV' }];
  return <Panel eyebrow="K-MEANS · 150 HOUSEHOLDS" title="Four interpretable segments" note="32 standardized household descriptors; segment labels are descriptive, not forecast targets."><div className="cluster-list">{rows.map((row, i) => <div key={row.name}><span className="cluster-index">0{i}</span><span className="cluster-name">{row.name}</span><span className="cluster-bar"><i style={{ width: `${row.count / 76 * 100}%` }} /></span><strong>{row.count}</strong><small>{row.pv}</small></div>)}</div></Panel>;
}

function EnergyComparison() {
  return <Panel eyebrow="GROUPED-HOUSEHOLD COMPARISON" title="The pooled model remains stronger" note="MAE on report-qualifying clustered households; model feature sets are not identical."><BarPair max={6} unit=" kWh" items={[{ label: 'Global baseline', value: 4.919, color: colors.teal }, { label: 'Weighted cluster Ridge', value: 5.121, color: colors.amber }]} /><p className="visual-callout">Lower is better. Weather features appear in the global model but not the cluster-specific Ridge models.</p></Panel>;
}

function EnergyTakeaway() {
  return <Panel eyebrow="ENGINEERING DECISION" title="Retain the baseline. Redesign the test." note="A matched-feature, same-row comparison is the unresolved next experiment."><div className="takeaway-grid"><div><span>CURRENT EVIDENCE</span><strong>Global baseline</strong><small>stronger forecast overall</small></div><div><span>VALUE OF CLUSTERS</span><strong>Segmentation</strong><small>interpretable household differences</small></div></div></Panel>;
}

export default function StoryVisual({ id }: { id: VisualId }) {
  switch (id) {
    case 'bms-pipeline': return <Pipeline />;
    case 'bms-signals': return <Signals />;
    case 'bms-coulomb': return <Coulomb />;
    case 'bms-circuit': return <Circuit />;
    case 'bms-soc': return <SocComparison />;
    case 'bms-soh': return <SohTrajectory />;
    case 'bms-validation': return <Validation />;
    case 'bms-anomaly': return <Anomaly />;
    case 'bms-dashboard': return <Dashboard />;
    case 'driver-timeline': return <Timeline />;
    case 'driver-audit': return <Audit />;
    case 'driver-road': return <Road />;
    case 'driver-horizon': return <Horizon />;
    case 'driver-ablation': return <Horizon ablation />;
    case 'driver-split': return <DriverSplit />;
    case 'driver-memory': return <Memory />;
    case 'driver-research': return <Research />;
    case 'eon-system': return <EnergySystem />;
    case 'eon-data': return <EnergyData />;
    case 'eon-features': return <Features />;
    case 'eon-baseline': return <Baseline />;
    case 'eon-clusters': return <Clusters />;
    case 'eon-comparison': return <EnergyComparison />;
    case 'eon-takeaway': return <EnergyTakeaway />;
  }
}
