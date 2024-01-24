import { finalizeDecision } from '@app/authz/app/app.service'
import { OpaResult } from '@app/authz/shared/types/rego'
import { Decision, EntityType } from '@narval/authz-shared'

describe('finalizeDecision', () => {
  it('returns Forbid if any of the reasons is Forbid', () => {
    const response: OpaResult[] = [
      {
        permit: false,
        reasons: [
          {
            policyId: 'forbid-rule-id',
            type: 'forbid',
            approvalsMissing: [],
            approvalsSatisfied: []
          },
          {
            policyId: 'permit-rule-id',
            type: 'permit',
            approvalsMissing: [],
            approvalsSatisfied: []
          }
        ]
      }
    ]
    const result = finalizeDecision(response)
    expect(result.decision).toEqual(Decision.FORBID)
  })

  it('returns Permit if all of the reasons are Permit', () => {
    const response: OpaResult[] = [
      {
        permit: true,
        reasons: [
          {
            policyId: 'permit-rule-id',
            type: 'permit',
            approvalsMissing: [],
            approvalsSatisfied: []
          },
          {
            policyId: 'permit-rule-id',
            type: 'permit',
            approvalsMissing: [],
            approvalsSatisfied: []
          }
        ]
      }
    ]
    const result = finalizeDecision(response)
    expect(result.decision).toEqual(Decision.PERMIT)
  })

  it('returns Confirm if any of the reasons are Forbid for a Permit type rule where approvals are missing', () => {
    const response: OpaResult[] = [
      {
        permit: false,
        reasons: [
          {
            policyId: 'permit-rule-id',
            type: 'permit',
            approvalsMissing: [
              {
                approvalCount: 1,
                approvalEntityType: EntityType.User,
                entityIds: ['user-id'],
                countPrincipal: true
              }
            ],
            approvalsSatisfied: []
          }
        ]
      }
    ]
    const result = finalizeDecision(response)
    expect(result.decision).toEqual(Decision.CONFIRM)
  })

  it('returns all missing, satisfied, and total approvals', () => {
    const missingApproval = {
      policyId: 'permit-rule-id',
      approvalCount: 1,
      approvalEntityType: EntityType.User,
      entityIds: ['user-id'],
      countPrincipal: true
    }
    const missingApproval2 = {
      policyId: 'permit-rule-id-4',
      approvalCount: 1,
      approvalEntityType: EntityType.User,
      entityIds: ['user-id'],
      countPrincipal: true
    }
    const satisfiedApproval = {
      policyId: 'permit-rule-id-2',
      approvalCount: 1,
      approvalEntityType: EntityType.User,
      entityIds: ['user-id'],
      countPrincipal: true
    }
    const satisfiedApproval2 = {
      policyId: 'permit-rule-id-3',
      approvalCount: 1,
      approvalEntityType: EntityType.User,
      entityIds: ['user-id'],
      countPrincipal: true
    }
    const response: OpaResult[] = [
      {
        permit: false,
        reasons: [
          {
            policyId: 'permit-rule-id',
            type: 'permit',
            approvalsMissing: [missingApproval],
            approvalsSatisfied: [satisfiedApproval]
          }
        ]
      },
      {
        permit: false,
        reasons: [
          {
            policyId: 'permit-rule-id',
            type: 'permit',
            approvalsMissing: [missingApproval2],
            approvalsSatisfied: [satisfiedApproval2]
          }
        ]
      }
    ]
    const result = finalizeDecision(response)
    expect(result).toEqual({
      originalResponse: response,
      decision: Decision.CONFIRM,
      totalApprovalsRequired: [missingApproval, missingApproval2, satisfiedApproval, satisfiedApproval2],
      approvalsMissing: [missingApproval, missingApproval2],
      approvalsSatisfied: [satisfiedApproval, satisfiedApproval2]
    })
  })
})
