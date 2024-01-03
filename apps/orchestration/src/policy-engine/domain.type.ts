export enum Action {
  SIGN_TRANSACTION = 'signTransaction',
  SIGN_MESSAGE = 'signMessage',
  SIGN_TYPED_DATA = 'signTypedData'
}

export enum Intent {
  TRANSFER_NATIVE = 'transferNative',
  TRANSFER_TOKEN = 'transferToken',
  TRANSFER_NFT = 'transferNft',
  CALL_CONTRACT = 'callContract'
}

export enum Decision {
  PERMIT = 'PERMIT',
  FORBID = 'FORBID',
  CONFIRM = 'CONFIRM'
}
