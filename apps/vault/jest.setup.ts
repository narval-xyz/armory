import dotenv from 'dotenv'
import fs from 'fs'
// import { setupNock } from './test/nock.util'

const testEnvFile = `${__dirname}/.env.test`

// Ensure a test environment variable file exists because of the override config
// loading mechanics below.
if (!fs.existsSync(testEnvFile)) {
  throw new Error('No .env.test file found. Please create one by running "make vault/copy-default-env".')
}

// By default, dotenv always loads .env and then you can override with .env.test
// But this is confusing, because then you have to look in multiple files to know which envs are loaded
// So we will clear all envs and then load .env.test
// NOTE: This will also override any CLI-declared envs (e.g. `MY_ENV=test jest`)
for (const prop in process.env) {
  if (Object.prototype.hasOwnProperty.call(process.env, prop)) {
    delete process.env[prop]
  }
}

dotenv.config({ path: testEnvFile, override: true })

// Temp disable it
// setupNock()
