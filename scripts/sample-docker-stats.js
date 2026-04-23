#!/usr/bin/env node
'use strict';

// Samples `docker stats --no-stream` for the Rocket.Chat + MongoDB containers
// every INTERVAL_MS and writes one JSON-line per sample to an output file.
// Intended to be run in parallel with a k6 load/endurance scenario.

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DURATION_MS = parseInt(process.env.DURATION_MS || '300000', 10);
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || '2000', 10);
const OUT_FILE = process.argv[2] || path.join(__dirname, '..', 'results', 'performance', 'resource-sample.jsonl');
const CONTAINERS = (process.env.CONTAINERS ||
  'rocketchat-qa-rocketchat-1,rocketchat-qa-mongodb-1').split(',');

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, '');

function sample() {
  const res = spawnSync('docker', [
    'stats', '--no-stream', '--format', '{{json .}}',
    ...CONTAINERS,
  ], { encoding: 'utf8' });
  if (res.status !== 0) return null;
  const ts = new Date().toISOString();
  const lines = res.stdout.split('\n').filter(Boolean);
  for (const l of lines) {
    try {
      const s = JSON.parse(l);
      const record = {
        ts,
        name: s.Name,
        cpu_pct: parseFloat((s.CPUPerc || '0').replace('%', '')),
        mem_usage: s.MemUsage,
        mem_pct: parseFloat((s.MemPerc || '0').replace('%', '')),
        net_io: s.NetIO,
        block_io: s.BlockIO,
      };
      fs.appendFileSync(OUT_FILE, JSON.stringify(record) + '\n');
    } catch (_) { /* skip */ }
  }
}

(async function main() {
  const start = Date.now();
  process.stdout.write(`sampling ${CONTAINERS.join(',')} every ${INTERVAL_MS}ms for ${DURATION_MS}ms → ${OUT_FILE}\n`);
  while (Date.now() - start < DURATION_MS) {
    sample();
    const elapsed = (Date.now() - start) % INTERVAL_MS;
    await new Promise((r) => setTimeout(r, Math.max(250, INTERVAL_MS - elapsed)));
  }
  process.stdout.write('sampler done\n');
})();
