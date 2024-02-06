import { Criterion, Then } from '@app/authz/shared/types/policy-builder.type'
import { readFileSync, writeFileSync } from 'fs'
import Handlebars from 'handlebars'
import { isEmpty } from 'lodash'
import { policies } from './mockData'

Handlebars.registerHelper('criterion', function (item) {
  const criterion: Criterion = item.criterion
  const args = item.args

  if (args === null) {
    return `${criterion}`
  }

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
})

Handlebars.registerHelper('reason', function (item) {
  if (item.then === Then.PERMIT) {
    const reason = [
      `"type": "${item.then}"`,
      `"policyId": "${item.name}"`,
      '"approvalsSatisfied": approvals.approvalsSatisfied',
      '"approvalsMissing": approvals.approvalsMissing'
    ]
    return `reason = {${reason.join(', ')}}`
  }

  if (item.then === Then.FORBID) {
    const reason = {
      type: item.then,
      policyId: item.name,
      approvalsSatisfied: [],
      approvalsMissing: []
    }
    return `reason = ${JSON.stringify(reason)}`
  }
})

// Read the template file
const templateSource = readFileSync(
  '/Users/samuel/Documents/narval/narval/apps/authz/src/opa/template/template.hbs',
  'utf-8'
)

// Compile the template
const template = Handlebars.compile(templateSource)

// Generate Rego file content
const regoContent = template(policies)

// Write the content to a Rego file
writeFileSync('/Users/samuel/Documents/narval/narval/apps/authz/src/opa/rego/policies/e2e.rego', regoContent, 'utf-8')

console.log('Policy .rego file generated successfully.')
