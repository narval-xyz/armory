import { Json } from '@narval/nestjs-shared'
import { Action } from '@narval/policy-engine-shared'
import {
  AuthorizationRequestError as AuthorizationRequestErrorModel,
  EvaluationLog as EvaluationLogModel
} from '@prisma/client/armory'
import { SetOptional } from 'type-fest'
import { ZodIssueCode, ZodSchema, z } from 'zod'
import { AuthorizationRequest, AuthorizationRequestError, Evaluation } from '../../core/type/domain.type'
import { ACTION_REQUEST } from '../../orchestration.constant'
import { DecodeAuthorizationRequestException } from '../../persistence/exception/decode-authorization-request.exception'
import { AuthorizationRequestModel } from '../../persistence/type/model.type'

type Model = SetOptional<AuthorizationRequestModel, 'evaluationLog'>

const actionSchema = z.nativeEnum(Action)

const buildEvaluation = ({ id, decision, signature, createdAt }: EvaluationLogModel): Evaluation => ({
  id,
  decision,
  signature,
  createdAt
})

const buildError = ({ id, message, name, context }: AuthorizationRequestErrorModel): AuthorizationRequestError => ({
  id,
  message,
  name,
  context: Json.parse(context)
})

const buildSharedAttributes = (model: Model): Omit<AuthorizationRequest, 'action' | 'request'> => {
  return {
    id: model.id,
    clientId: model.clientId,
    status: model.status,
    idempotencyKey: model.idempotencyKey,
    authentication: model.authnSig,
    approvals: z.array(z.string()).parse(model.approvals.map((approval) => approval.sig)),
    evaluations: (model.evaluationLog || []).map(buildEvaluation),
    errors: (model.errors || []).map(buildError),
    createdAt: model.createdAt,
    updatedAt: model.updatedAt
  }
}

/**
 * Decodes a given schema with proper error handling.
 *
 * @throws {DecodeAuthorizationRequestException}
 * @returns {AuthorizationRequest}
 */
const decode = ({ model, schema }: { model: Model; schema: ZodSchema }): AuthorizationRequest => {
  try {
    const decode = schema.safeParse(model.request)

    if (decode.success) {
      return {
        ...buildSharedAttributes(model),
        request: decode.data
      }
    }

    throw new DecodeAuthorizationRequestException(decode.error.issues)
  } catch (error) {
    // The try/catch statement is implemented here specifically to prevent the
    // irony of "safeParse" throwing a TypeError due to bigint coercion on
    // null and undefined values.
    throw new DecodeAuthorizationRequestException([
      {
        code: ZodIssueCode.custom,
        message: `Unknown decode exception ${error.message}`,
        path: ['request']
      }
    ])
  }
}

/**
 * Decodes an authorization request based on its action, throws on errors.
 *
 * @throws {DecodeAuthorizationRequestException}
 * @returns {AuthorizationRequest}
 */
export const decodeAuthorizationRequest = (model: Model): AuthorizationRequest => {
  const action = actionSchema.safeParse(model.action)

  if (action.success) {
    const config = ACTION_REQUEST.get(action.data)

    if (config) {
      return decode({
        model,
        schema: config.schema.read
      })
    }
  }

  throw new DecodeAuthorizationRequestException([
    {
      code: ZodIssueCode.invalid_literal,
      message: 'Authorization request decoder not found for action type',
      path: ['action'],
      expected: Object.keys(ACTION_REQUEST),
      received: model.action
    }
  ])
}
