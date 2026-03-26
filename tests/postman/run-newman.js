const { spawnSync } = require('node:child_process');

const baseHost = process.env.ROCKETCHAT_URL || 'http://localhost:3000';
const baseUrl = `${baseHost.replace(/\/+$/, '')}/api/v1`;
const adminUser = process.env.RC_ADMIN_USER || 'admin';
const adminPass = process.env.RC_ADMIN_PASS || 'admin123';

const runner = 'npx';
const args = [
  'newman',
  'run',
  'tests/postman/rocketchat-collection.json',
  '--env-var',
  `base_url=${baseUrl}`,
  '--env-var',
  `admin_user=${adminUser}`,
  '--env-var',
  `admin_pass=${adminPass}`,
];

const result = spawnSync(runner, args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
