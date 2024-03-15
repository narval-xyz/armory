import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { readFileSync } from 'fs'
import path from 'path'
import policyData from '../rego/data.json'
import policyInput from '../rego/input.json'

const OPA_WASM_PATH = readFileSync(path.join(process.cwd(), './rego-build/policy.wasm'))

loadPolicy(OPA_WASM_PATH, undefined, {
  'time.now_ns': () => new Date().getTime() * 1000000
})
  .then((policy) => {
    policy.setData(policyData)
    const resultSet = policy.evaluate(policyInput, 'main/evaluate')

    if (resultSet == null) {
      console.error('evaluation error')
    } else if (resultSet.length == 0) {
      console.log('undefined')
    } else {
      console.dir(resultSet, { depth: null })
    }
  })
  .catch((error) => {
    console.error('Failed to load policy: ', error)
  })
