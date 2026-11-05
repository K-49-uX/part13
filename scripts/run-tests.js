const { spawnSync } = require('node:child_process')
const path = require('node:path')

const nodePath = [
  path.join(__dirname, '..', 'node_modules'),
  path.join(__dirname, '..', 'Frontend', 'node_modules'),
  process.env.NODE_PATH,
].filter(Boolean).join(path.delimiter)

const result = spawnSync(process.execPath, [
  '--test',
  '--test-concurrency=1',
], {
  stdio: 'inherit',
  env: { ...process.env, TESTING: 'true', NODE_PATH: nodePath },
})

if (result.error) throw result.error
process.exitCode = result.status ?? 1
