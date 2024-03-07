import { Criterion, Policy, PolicyCriterion, Then } from '@narval/policy-engine-shared'
import { isEmpty } from 'lodash'

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
