import {
  Action,
  Request,
  TransactionRequest,
  TransactionRequestEIP1559,
  TransactionRequestLegacy
} from '@narval/policy-engine-shared'

export const WildcardableFields = {
  GAS: 'gas',
  MAX_FEE_PER_GAS: 'maxFeePerGas',
  MAX_PRIORITY_FEE_PER_GAS: 'maxPriorityFeePerGas',
  GAS_PRICE: 'gasPrice',
  NONCE: 'nonce'
} as const

export type WildcardableField = (typeof WildcardableFields)[keyof typeof WildcardableFields]

export const Type0WildcarableFields = {
  GAS: 'gas',
  GAS_PRICE: 'gasPrice',
  NONCE: 'nonce'
} as const

export type Type0WildcardableField = (typeof Type0WildcarableFields)[keyof typeof Type0WildcarableFields]

export const Type2WildcarableFields = {
  GAS: 'gas',
  MAX_FEE_PER_GAS: 'maxFeePerGas',
  MAX_PRIORITY_FEE_PER_GAS: 'maxPriorityFeePerGas',
  NONCE: 'nonce'
} as const

export type Type2WildcardableField = (typeof Type2WildcarableFields)[keyof typeof Type2WildcarableFields]

export const isWildcardableField = (field: string): field is WildcardableField => {
  return Object.values(WildcardableFields).includes(field as WildcardableField)
}

export const findType0UndefinedWildcardableFields = (transaction: TransactionRequest): Type0WildcardableField[] => {
  const undefinedFields: Type0WildcardableField[] = []

  const legacyRes = TransactionRequestLegacy.safeParse(transaction)
  if (legacyRes.success) {
    if (legacyRes.data.gasPrice === undefined) {
      undefinedFields.push(Type0WildcarableFields.GAS_PRICE)
    }
  }
  return undefinedFields
}

export const findType2UndefinedWildcardableFields = (transaction: TransactionRequest): Type2WildcardableField[] => {
  const undefinedFields: Type2WildcardableField[] = []

  const res = TransactionRequestEIP1559.safeParse(transaction)
  if (res.success) {
    if (res.data.maxFeePerGas === undefined) {
      undefinedFields.push(Type2WildcarableFields.MAX_FEE_PER_GAS)
    }
    if (res.data.maxPriorityFeePerGas === undefined) {
      undefinedFields.push(Type2WildcarableFields.MAX_PRIORITY_FEE_PER_GAS)
    }
  }
  return undefinedFields
}

export const findUndefinedWildcardableFields = (transaction: TransactionRequest): WildcardableField[] => {
  const commonFields: WildcardableField[] = []
  if (transaction.gas === undefined) {
    commonFields.push(Type0WildcarableFields.GAS)
  }
  if (transaction.nonce === undefined) {
    commonFields.push(Type0WildcarableFields.NONCE)
  }
  const legFields = findType0UndefinedWildcardableFields(transaction)
  const eipFields = findType2UndefinedWildcardableFields(transaction)
  return [...commonFields, ...legFields, ...eipFields]
}

export const prefixWithPath = (fields: WildcardableField[], path: string) => {
  return fields.map((field) => `${path}.${field}`)
}

export const buildTransactionRequestHashWildcard = (request: Request) =>
  request.action === Action.SIGN_TRANSACTION
    ? prefixWithPath(findUndefinedWildcardableFields(request.transactionRequest), 'transactionRequest')
    : undefined
