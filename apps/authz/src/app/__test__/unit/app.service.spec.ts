import { finalizeDecision } from '@app/authz/app/app.service'
import { NarvalDecision, NarvalEntities } from '@app/authz/shared/types/domain.type'
import { OpaResult } from '@app/authz/shared/types/rego'

describe('finalizeDecision', () => {
  it('should return Forbid if any of the reasons is Forbid', () => {
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
    expect(result.decision).toEqual(NarvalDecision.Forbid)
  })

  it('should return Permit if all of the reasons are Permit', () => {
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
    expect(result.decision).toEqual(NarvalDecision.Permit)
  })

  it('should return Confirm if any of the reasons are Forbid for a Permit type rule where approvals are missing', () => {
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
                approvalEntityType: NarvalEntities.User,
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
    expect(result.decision).toEqual(NarvalDecision.Confirm)
  })

  it('should return all missing, satisfied, and total approvals', () => {
    const missingApproval = {
      policyId: 'permit-rule-id',
      approvalCount: 1,
      approvalEntityType: NarvalEntities.User,
      entityIds: ['user-id'],
      countPrincipal: true
    }
    const missingApproval2 = {
      policyId: 'permit-rule-id-4',
      approvalCount: 1,
      approvalEntityType: NarvalEntities.User,
      entityIds: ['user-id'],
      countPrincipal: true
    }
    const satisfiedApproval = {
      policyId: 'permit-rule-id-2',
      approvalCount: 1,
      approvalEntityType: NarvalEntities.User,
      entityIds: ['user-id'],
      countPrincipal: true
    }
    const satisfiedApproval2 = {
      policyId: 'permit-rule-id-3',
      approvalCount: 1,
      approvalEntityType: NarvalEntities.User,
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
      decision: NarvalDecision.Confirm,
      totalApprovalsRequired: [missingApproval, missingApproval2, satisfiedApproval, satisfiedApproval2],
      approvalsMissing: [missingApproval, missingApproval2],
      approvalsSatisfied: [satisfiedApproval, satisfiedApproval2]
    })
  })
})
