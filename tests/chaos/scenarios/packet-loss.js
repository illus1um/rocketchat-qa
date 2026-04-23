'use strict';

// Chaos scenario C4: Severe network degradation via toxiproxy.
// Applies latency that exceeds the probe's client-side timeout, producing
// ECONNABORTED failures — from the application's perspective this is
// indistinguishable from severe packet loss on the network (the request never
// completes within the deadline, client errors out). We use latency rather
// than reset_peer / bandwidth toxics because those either require
// disabling HTTP keep-alive in the client or only affect large responses,
// neither of which reflects typical real-world chaos-engineering impact.

const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');

const FAULT_MS = parseInt(process.env.FAULT_MS || '60000', 10);
const PROBE_DURATION_MS = FAULT_MS + 90000;
// Must exceed probe HTTP timeout (4000 ms) to trigger application-level
// failure. Default 6000 ms gives 100 % failure during the fault window.
const LATENCY_MS = parseInt(process.env.LATENCY_MS || '6000', 10);
const TOXICITY = parseFloat(process.env.TOXICITY || '1.0');
const SCENARIO = 'packet-loss';
const TOXIPROXY_API = 'http://localhost:8474';

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function addToxic() {
  await axios.post(`${TOXIPROXY_API}/proxies/rocketchat/toxics`, {
    name: 'packet_loss_latency',
    type: 'latency',
    stream: 'downstream',
    toxicity: TOXICITY,
    attributes: { latency: LATENCY_MS, jitter: 0 },
  });
}

async function removeToxic() {
  await axios.delete(`${TOXIPROXY_API}/proxies/rocketchat/toxics/packet_loss_latency`).catch(() => {});
}

(async function run() {
  const probe = spawn('node', [path.join(__dirname, '..', 'probe.js'), SCENARIO], {
    env: {
      ...process.env,
      PROBE_DURATION_MS: String(PROBE_DURATION_MS),
      PROBE_BASE_URL: 'http://localhost:3001',
    },
    stdio: 'inherit',
  });

  await sleep(15000);
  process.stdout.write(`[${SCENARIO}] injecting ${LATENCY_MS}ms latency @ toxicity=${TOXICITY} (probe timeout=4000ms)\n`);
  await addToxic();
  await sleep(FAULT_MS);
  process.stdout.write(`[${SCENARIO}] removing toxic\n`);
  await removeToxic();

  await new Promise((resolve) => probe.on('exit', resolve));
  process.stdout.write(`[${SCENARIO}] scenario complete\n`);
})();
