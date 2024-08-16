import {
  ApprovalRequirement as ApprovalRequirementModel,
  AuthorizationRequest,
  AuthorizationRequestApproval,
  AuthorizationRequestError,
  EvaluationLog
} from '@prisma/client/armory'

export type EvaluationLogWithApprovalsModel = EvaluationLog & { approvals: ApprovalRequirementModel[] }
export type AuthorizationRequestModel = AuthorizationRequest & {
  evaluationLog: EvaluationLogWithApprovalsModel[]
  approvals: AuthorizationRequestApproval[]
  errors?: AuthorizationRequestError[]
}
