import { PrivateWallet, PublicWallet } from '../../../shared/type/domain.type'

export const privateToPublicWallet = (privateWallet: PrivateWallet): PublicWallet => ({
  resourceId: privateWallet.id,
  address: privateWallet.address,
  publicKey: privateWallet.publicKey,
  keyId: privateWallet.keyId,
  derivationPath: privateWallet.derivationPath
})
