import { AccountId, Action, Address, Alg, AssetId, Hex } from '@narval/authz-shared'
import { Intents } from '@narval/transaction-request-intent'
import { AccountType } from './domain.type'

type Wildcard = '*'

type AmountCondition = {
  currency: 'fiat:usd' | 'fiat:eur' | Wildcard
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  value: string
}

type ERC1155AmountCondition = {
  tokenId: AssetId
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  value: string
}

type SignMessageCondition = {
  operator: 'equals' | 'contains'
  value: string
}

type SignTypedDataDomainCondition = {
  version?: string[]
  chainId?: number[]
  name?: string[]
  verifyingContract?: Address[]
}

type PermitDeadlineCondition = {
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  value: string // timestamp in ms
}

interface PolicyBuilder {
  action: Action
  principal: {
    ids: string[] | Wildcard
    roles: string[] | Wildcard
    groups: string[] | Wildcard
  }
  resource: {
    ids: AccountId[] | Wildcard
    addresses: string[] | Wildcard
    accoutTypes: AccountType[] | Wildcard
    chainIds: number[] | Wildcard
    groups: string[] | Wildcard
  }
  intent: {
    types: Intents[] | Wildcard
    destination: {
      ids: AccountId[] | Wildcard
      addresses: string[] | Wildcard
      accoutTypes: AccountType[] | Wildcard
      classifications: string[] | Wildcard
    }
    [Intents.TRANSFER_NATIVE]?: {
      tokens?: AssetId[] | Wildcard
      amount?: AmountCondition | Wildcard
    }
    [Intents.TRANSFER_ERC20]?: {
      contracts?: AccountId[] | Wildcard
      amount?: AmountCondition | Wildcard
    }
    [Intents.TRANSFER_ERC721]?: {
      contracts?: AccountId[] | Wildcard
      nftIds?: AssetId[] | Wildcard
    }
    [Intents.TRANSFER_ERC1155]?: {
      contracts?: AccountId[] | Wildcard
      tokenIds?: ERC1155AmountCondition[] | Wildcard
    }
    [Intents.CALL_CONTRACT]?: {
      contracts?: AccountId[] | Wildcard
      hexSignatures?: Hex[] | Wildcard
    }
    [Intents.SIGN_MESSAGE]?: {
      condition?: SignMessageCondition | Wildcard
      algorithm?: Alg[] | Wildcard
      signTypedDataDomain?: SignTypedDataDomainCondition | Wildcard
    }
    [Intents.DEPLOY_CONTRACT]?: {
      chainIds?: number[] | Wildcard
    }
    [Intents.APPROVE_TOKEN_ALLOWANCE]?: {
      tokens?: AccountId[] | Wildcard
      spenders?: AccountId[] | Wildcard
      amount?: AmountCondition | Wildcard
    }
    [Intents.PERMIT]?: {
      spenders?: AccountId[] | Wildcard
      amount?: AmountCondition | Wildcard
      deadline?: PermitDeadlineCondition | Wildcard
    }
    [Intents.PERMIT2]?: {
      spenders?: AccountId[] | Wildcard
      amount?: AmountCondition | Wildcard
      deadline?: PermitDeadlineCondition | Wildcard
    }
  }
}
