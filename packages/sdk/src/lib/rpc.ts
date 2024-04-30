import {
  AccessToken,
  Entities,
  EntityStore,
  Policy,
  PolicyStore,
  Request,
  SignTransactionAction
} from '@narval/policy-engine-shared'
import { Jwk } from '@narval/signature'
import { Hex, RpcSchema } from 'viem'

export const RpcMethod = {
  EthSignTransaction: 'eth_signTransaction',
  Nar_SaveEntities: 'nar_saveEntities',
  Nar_SavePolicies: 'nar_savePolicies',
  Nar_EvaluateRequest: 'nar_evaluateRequest',
  Nar_SignEvaluateAndSendTransaction: 'nar_signEvaluateAndSendTransaction'
} as const
export type RpcMethod = (typeof RpcMethod)[keyof typeof RpcMethod]

export type EthSignTransaction = {
  method: 'eth_signTransaction'
  params: {
    request: SignTransactionAction
    accessToken: AccessToken
    credential: Jwk
  }
}

export type NarSaveEntities = {
  method: 'nar_saveEntities'
  params: {
    entities: Entities
    credential: Jwk
  }
  ReturnType: EntityStore
}

export type NarSavePolicies = {
  method: 'nar_savePolicies'
  params: {
    policies: Policy[]
    credential: Jwk
  }
  ReturnType: PolicyStore
}

export type NarEvaluateRequest = {
  method: 'nar_evaluateRequest'
  params: {
    request: Request
    credential: Jwk
  }
  ReturnType: AccessToken
}

export type NarSignEvaluateAndSendTransaction = {
  method: 'nar_signEvaluateAndSendTransaction'
  params: {
    request: Request
    credential: Jwk
  }
  ReturnType: Hex
}

export const NarvalRpcSchema: RpcSchema = [
  {
    Method: RpcMethod.EthSignTransaction,
    Parameters: {
      request: 'object',
      accessToken: {
        value: 'string'
      },
      credential: 'object'
    },
    ReturnType: 'string'
  },
  {
    Method: RpcMethod.Nar_SaveEntities,
    Parameters: {
      entities: 'object',
      credential: 'object'
    },
    ReturnType: {
      data: 'object',
      signature: 'string'
    }
  },
  {
    Method: RpcMethod.Nar_SavePolicies,
    Parameters: {
      policies: 'object',
      credential: 'object'
    },
    ReturnType: {
      data: 'object',
      signature: 'string'
    }
  },
  {
    Method: RpcMethod.Nar_EvaluateRequest,
    Parameters: {
      request: 'object',
      credential: 'object'
    },
    ReturnType: {
      value: 'string'
    }
  },
  {
    Method: RpcMethod.Nar_SignEvaluateAndSendTransaction,
    Parameters: {
      request: 'object',
      credential: 'object'
    },
    ReturnType: 'string'
  }
]

export type NarvalRpcRequest =
  | EthSignTransaction
  | NarSaveEntities
  | NarSavePolicies
  | NarEvaluateRequest
  | NarSignEvaluateAndSendTransaction

export const RpcErrorCode = {
  UnsupportedMethod: 4200,
  Unauthorized: 4100,
  UserRejected: 4001
} as const
export type RpcErrorCode = (typeof RpcErrorCode)[keyof typeof RpcErrorCode]

type RpcErrorArg = {
  message: string
  code: RpcErrorCode
  context: Record<string, unknown>
}

export class NarvalRpcError extends Error {
  code: RpcErrorCode

  context: Record<string, unknown> = {}

  constructor({ message, code, context }: RpcErrorArg) {
    super(message)

    this.context = context

    this.code = code
  }
}
