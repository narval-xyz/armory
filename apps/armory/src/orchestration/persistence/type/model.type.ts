import {
  AuthorizationRequest,
  AuthorizationRequestApproval,
  AuthorizationRequestError,
  EvaluationLog
} from '@prisma/client/armory'

export type AuthorizationRequestModel = AuthorizationRequest & {
  evaluationLog: EvaluationLog[]
  approvals: AuthorizationRequestApproval[]
  errors?: AuthorizationRequestError[]
}
