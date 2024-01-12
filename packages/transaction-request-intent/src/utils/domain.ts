export enum BlockchainActions {
  SIGN_TRANSACTION = 'signTransaction',
  SIGN_RAW = 'signRaw',
  SIGN_MESSAGE = 'signMessage',
  SIGN_TYPED_DATA = 'signTypedData'
}

export enum PolicyManagementActions {
  SET_POLICY_RULES = 'setPolicyRules'
}

export type Actions = BlockchainActions | PolicyManagementActions

export enum Intents {
  TRANSFER_NATIVE = 'transferNative',
  TRANSFER_ERC20 = 'transferErc20',
  TRANSFER_ERC721 = 'transferErc721',
  TRANSFER_ERC1155 = 'transferErc1155',
  CALL_CONTRACT = 'callContract'
}

export const NATIVE_TRANSFER = 'nativeTransfer'

// TODO: Move below in a folder shared with other apps, these should be shared within the whole project
export enum AssetTypeEnum {
  AMBIGUOUS = 'ambiguous',
  ERC1155 = 'erc1155',
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  NATIVE = 'native',
  UNKNOWN = 'unknown'
}

export enum EipStandardEnum {
  EIP155 = 'eip155'
}
