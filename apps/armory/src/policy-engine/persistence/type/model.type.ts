import { AuthorizationRequest, AuthorizationRequestApproval, EvaluationLog } from '@prisma/client/armory'

export type AuthorizationRequestModel = AuthorizationRequest & {
  evaluationLog: EvaluationLog[]
  approvals: AuthorizationRequestApproval[]
}
