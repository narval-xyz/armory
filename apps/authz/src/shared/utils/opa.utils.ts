import { isEmpty } from 'lodash'
import { Criterion, Policy, PolicyCriterion, Then } from '../types/policy.type'

export const criterionToString = (item: PolicyCriterion) => {
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

export const reasonToString = (item: Policy & { id: string }) => {
  if (item.then === Then.PERMIT) {
    const reason = [
      `"type":"${item.then}"`,
      `"policyId":"${item.id}"`,
      `"policyName":"${item.name}"`,
      '"approvalsSatisfied":approvals.approvalsSatisfied',
      '"approvalsMissing":approvals.approvalsMissing'
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
