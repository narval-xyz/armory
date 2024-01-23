import { AuthorizationRequest, AuthorizationRequestApproval, EvaluationLog } from '@prisma/client/orchestration'

export type AuthorizationRequestModel = AuthorizationRequest & {
  evaluationLog: EvaluationLog[]
  approvals: AuthorizationRequestApproval[]
}
