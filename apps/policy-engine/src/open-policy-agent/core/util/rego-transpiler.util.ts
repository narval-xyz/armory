import { Criterion, Policy, PolicyCriterion, Then } from '@narval/policy-engine-shared'
import { readFile } from 'fs/promises'
import Handlebars from 'handlebars'
import { isEmpty } from 'lodash'
import { resolve } from 'path'
import { v4 as uuid } from 'uuid'

const REGO_RULES_TEMPLATE_PATH = resolve(__dirname, '../../resource/rego-rules.template.hbs')

export const transpileCriterion = (item: PolicyCriterion) => {
  const criterion: Criterion = item.criterion
  const args = item.args

  if (!isEmpty(args)) {
    if (Array.isArray(args)) {
      if (typeof args[0] === 'string') {
        return `${criterion}({${args.map((el) => `"${el}"`).join(', ')}})`
      }

      if (criterion === Criterion.CHECK_APPROVALS) {
        return `approvals = ${criterion}([${args.map((el) => JSON.stringify(el)).join(', ')}])`
      }

      return `${criterion}([${args.map((el) => JSON.stringify(el)).join(', ')}])`
    }

    return `${criterion}(${JSON.stringify(args)})`
  }

  return `${criterion}`
}

export const transpileReason = (item: Policy & { id: string }) => {
  if (item.then === Then.PERMIT) {
    const approvals = item.when.find((c) => c.criterion === Criterion.CHECK_APPROVALS)
    const approvalsSatisfied = approvals
      ? '"approvalsSatisfied":approvals.approvalsSatisfied'
      : '"approvalsSatisfied":[]'
    const approvalsMissing = approvals ? '"approvalsMissing":approvals.approvalsMissing' : '"approvalsMissing":[]'

    const reason = [
      `"type":"${item.then}"`,
      `"policyId":"${item.id}"`,
      `"policyName":"${item.name}"`,
      approvalsSatisfied,
      approvalsMissing
    ]

    return `reason = {${reason.join(',')}}`
  }

  const reason = {
    type: item.then,
    policyId: item.id,
    policyName: item.name,
    approvalsSatisfied: [],
    approvalsMissing: []
  }

  return `reason = ${JSON.stringify(reason)}`
}

export const transpile = async (policies: Policy[]): Promise<string> => {
  Handlebars.registerHelper('criterion', transpileCriterion)
  Handlebars.registerHelper('reason', transpileReason)

  const template = Handlebars.compile(await readFile(REGO_RULES_TEMPLATE_PATH, 'utf-8'))

  return template({
    // TODO: Here the policy must have an ID already.
    policies: policies.map((policy) => ({ ...policy, id: uuid() }))
  })
}
