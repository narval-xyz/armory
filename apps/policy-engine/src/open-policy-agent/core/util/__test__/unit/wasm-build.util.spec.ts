import { FIXTURE } from '@narval/policy-engine-shared'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { withTempDirectory } from '../../../../../shared/testing/with-temp-directory.testing'
import { build, buildOpaBundle, copyRegoCore, createDirectories, unzip, writeRegoPolicies } from '../../wasm-build.util'

const getRegoSourceCodePath = () => resolve(__dirname, '../../../rego/')

describe('createDirectories', () => {
  it('creates rego source, generated rego, and dist directories', async () => {
    await withTempDirectory(async (path) => {
      const { regoSourceDirectory, generatedRegoDirectory, distDirectory } = await createDirectories(path)

      expect(existsSync(regoSourceDirectory)).toEqual(true)
      expect(existsSync(generatedRegoDirectory)).toEqual(true)
      expect(existsSync(distDirectory)).toEqual(true)
    })
  })
})

describe('writeRegoPolicies', () => {
  it('writes a file with transpiled rego policies', async () => {
    await withTempDirectory(async (path) => {
      const { file } = await writeRegoPolicies({
        policies: FIXTURE.POLICIES,
        filename: 'policies.rego',
        path
      })

      const content = await readFile(file, 'utf-8')

      expect(existsSync(file)).toEqual(true)

      // NOTE: The transpilation process is covered by rego-transpile.util.ts.
      // Here we only care if the file is empty or not.
      expect(content).toContain('permit')
      expect(content).toContain('forbid')
    })
  })
})

describe('copyRegoCore', () => {
  it('copies the rego core files', async () => {
    await withTempDirectory(async (path) => {
      await copyRegoCore({
        source: getRegoSourceCodePath(),
        destination: path
      })

      expect(existsSync(`${path}/criteria`)).toEqual(true)
      expect(existsSync(`${path}/main.rego`)).toEqual(true)
    })
  })

  it('does not copy the rego tests', async () => {
    await withTempDirectory(async (path) => {
      await copyRegoCore({
        source: getRegoSourceCodePath(),
        destination: path
      })

      expect(existsSync(`${path}/__test__`)).toEqual(false)
    })
  })
})

describe('bundleOpaBundle', () => {
  it('writes the bundle gzip tarball', async () => {
    await withTempDirectory(async (path) => {
      const { regoSourceDirectory, distDirectory } = await createDirectories(path)

      await copyRegoCore({
        source: getRegoSourceCodePath(),
        destination: regoSourceDirectory
      })

      const { bundleFile } = await buildOpaBundle({ regoSourceDirectory, distDirectory })

      expect(existsSync(bundleFile)).toEqual(true)
    })
  })
})

describe('unzip', () => {
  it('unzips a gziped file', async () => {
    await withTempDirectory(async (path) => {
      const { regoSourceDirectory, distDirectory } = await createDirectories(path)

      await copyRegoCore({
        source: getRegoSourceCodePath(),
        destination: regoSourceDirectory
      })

      const { bundleFile } = await buildOpaBundle({ regoSourceDirectory, distDirectory })

      await unzip({ source: bundleFile, destination: distDirectory })

      expect(existsSync(`${distDirectory}/policy.wasm`)).toEqual(true)
      expect(existsSync(`${distDirectory}/data.json`)).toEqual(true)
      expect(existsSync(`${distDirectory}/.manifest`)).toEqual(true)
      // NOTE: The OPA build includes the source code of the bundle in the
      // gzip file. That's why the `path` exists within the dist directory as
      // well.
      // See https://www.openpolicyagent.org/docs/latest/management-bundles/#bundle-file-format
      expect(existsSync(`${distDirectory}/${path}/rego/main.rego`)).toEqual(true)
    })
  })
})

describe('build', () => {
  it('resolves with a valid wasm and correct entrypoint', async () => {
    await withTempDirectory(async (path) => {
      const wasm = await build({
        path,
        regoCorePath: getRegoSourceCodePath(),
        policies: FIXTURE.POLICIES,
        cleanAfter: false
      })

      const opa = await loadPolicy(wasm)

      expect(opa.entrypoints).toEqual({ 'main/evaluate': 0 })
    })
  })
})
