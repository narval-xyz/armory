import dotenv from 'dotenv'
import fs from 'fs'
import nock from 'nock'

const testEnvFile = `${__dirname}/.env.test`

// Ensure a test environment variable file exists because of the override config
// loading mechanics below.
if (!fs.existsSync(testEnvFile)) {
  throw new Error('No .env.test file found. Please create one by running "make policy-engine/copy-default-env".')
}

// We don't want to have two dotenv files that are exactly the same, so we
// override the default with .env.test.
//
// If a .env.test file is not found, the DATABASE_URL will fallback to the
// default. Consequently, you'll lose your development database during the
// integration tests teardown. Hence, the check above.

// We also don't even want any .env values; just kill them during tests.
// Clear process.env
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
