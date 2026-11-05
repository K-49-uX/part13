const { spawnSync } = require('node:child_process')

const result = spawnSync(process.execPath, [
  '--test',
  '--test-concurrency=1',
  'tests/api_ch3.test.js',
], {
  stdio: 'inherit',
  env: { ...process.env, TESTING: 'true' },
})

if (result.error) throw result.error
process.exitCode = result.status ?? 1
