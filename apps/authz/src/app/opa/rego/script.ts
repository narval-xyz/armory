import { loadPolicy } from '@open-policy-agent/opa-wasm'
import fs from 'fs'
import policyData from '../build/data.json'
import policyInput from './input.json'

const policyWasm = fs.readFileSync('/Users/samuel/Documents/narval/narval/apps/authz/src/app/opa/build/policy.wasm')
const data = JSON.stringify(policyData)
const input = JSON.stringify(policyInput)

loadPolicy(policyWasm)
  .then((policy) => {
    policy.setData({ data })
    const resultSet = policy.evaluate(input, 'main/evaluate')

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
