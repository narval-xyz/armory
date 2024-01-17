export enum InputType {
  TRANSACTION_REQUEST = 'transactionRequest',
  MESSAGE = 'message',
  TYPED_DATA = 'typedData',
  RAW = 'raw'
}

export enum TransactionCategory {
  TRANSACTION_MANAGEMENT = 'transactionManagement',
  NATIVE_TRANSFER = 'nativeTransfer',
  CONTRACT_CREATION = 'ContractCreation',
  CONTRACT_INTERACTION = 'ContractCall'
}

export enum TransactionStatus {
  PENDING = 'pending',
  FAILED = 'failed'
}

export enum Intents {
  TRANSFER_NATIVE = 'transferNative',
  TRANSFER_ERC20 = 'transferErc20',
  TRANSFER_ERC721 = 'transferErc721',
  TRANSFER_ERC1155 = 'transferErc1155',
  APPROVE_TOKEN_ALLOWANCE = 'approveTokenAllowance',
  PERMIT = 'permit',
  PERMIT2 = 'permit2',
  CALL_CONTRACT = 'callContract',
  RETRY_TRANSACTION = 'retryTransaction',
  CANCEL_TRANSACTION = 'cancelTransaction',
  DEPLOY_CONTRACT = 'deployContract',
  DEPLOY_ERC_4337_WALLET = 'deployErc4337Wallet',
  DEPLOY_SAFE_WALLET = 'deploySafeWallet',
  SIGN_MESSAGE = 'signMessage',
  SIGN_RAW_MESSAGE = 'signRawMessage',
  SIGN_RAW_PAYLOAD = 'signRawPayload',
  SIGN_TYPED_DATA = 'signTypedData'
}

export enum AssetTypeEnum {
  ERC1155 = 'erc1155',
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  NATIVE = 'native',
  UNKNOWN = 'unknown'
}

export enum EipStandardEnum {
  EIP155 = 'eip155'
}

export const permit2Address = '0x000000000022d473030f116ddee9f6b43ac78ba3'
export const NULL_METHOD_ID = '0x00000000'
