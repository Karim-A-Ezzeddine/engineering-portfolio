import fs from 'node:fs';
import path from 'node:path';

const source = process.argv[2];
if (!source) {
  throw new Error('Pass the path to the intelligent_bms repository.');
}

function readCsv(file) {
  const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const headers = lines.shift().split(',');
  return lines.map((line) => {
    const fields = [];
    let token = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (quoted && line[i + 1] === '"') { token += '"'; i += 1; }
        else quoted = !quoted;
      } else if (char === ',' && !quoted) {
        fields.push(token); token = '';
      } else token += char;
    }
    fields.push(token);
    return Object.fromEntries(headers.map((header, index) => [header, fields[index]]));
  });
}

const trace = readCsv(path.join(source, 'outputs/phase4_ekf_trace.csv'));
const firstTime = Date.parse(trace[0].timestamp.replace(' ', 'T') + 'Z');
const sampled = trace.filter((_, index) => index % 80 === 0 || index === trace.length - 1).map((row) => ({
  day: +((Date.parse(row.timestamp.replace(' ', 'T') + 'Z') - firstTime) / 86400000).toFixed(4),
  ref: +(100 * Number(row.soc_protocol_reference)).toFixed(2),
  cc: +(100 * Number(row.soc_cc)).toFixed(2),
  ekf: +(100 * Number(row.soc_ekf)).toFixed(2),
  voltage: +Number(row.voltage_v).toFixed(3),
  current: +Number(row.current_a).toFixed(3),
  temperature: +Number(row.cell_temperature_c).toFixed(2),
}));

const health = readCsv(path.join(source, 'outputs/phase5_soh_dataset.csv'))
  .filter((row) => [2, 3, 4, 5].includes(Number(row.cell_id)))
  .map((row) => ({
    cell: Number(row.cell_id),
    cycles: Number(row.cumulative_complete_cycles),
    soh: +(100 * Number(row.soh)).toFixed(2),
  }));

fs.mkdirSync('src/data/derived', { recursive: true });
fs.writeFileSync('src/data/derived/socTrace.json', JSON.stringify(sampled));
fs.writeFileSync('src/data/derived/sohSeries.json', JSON.stringify(health));
console.log(`Exported ${sampled.length} SoC trace samples and ${health.length} SoH checks.`);
