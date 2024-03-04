import dotenv from 'dotenv'
import fs from 'fs'
import nock from 'nock'

const testEnvFile = `${__dirname}/.env.test`

// Ensure a test environment variable file exists because of the override config
// loading mechanics below.
if (!fs.existsSync(testEnvFile)) {
  throw new Error('No .env.test file found. Please create one by running "make policy-engine/copy-default-env".')
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

// Disable outgoing HTTP requests to avoid flaky tests.
nock.disableNetConnect()

// Enable outgoing HTTP requests to 127.0.0.1 to allow E2E tests with
// supertestwith supertest to work.
nock.enableNetConnect('127.0.0.1')
