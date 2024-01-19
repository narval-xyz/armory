import { loadPolicy } from '@open-policy-agent/opa-wasm'
import fs from 'fs'
import policyData from './data.json'
import policyInput from './input.json'

const policyWasm = fs.readFileSync('/Users/samuel/Documents/narval/narval/rego-build/policy.wasm')

loadPolicy(policyWasm, undefined, {
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
