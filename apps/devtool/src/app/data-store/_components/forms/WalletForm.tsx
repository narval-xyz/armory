'use client'

import { WalletEntity, isAddress } from '@narval/policy-engine-shared'
import { Dispatch, FC, SetStateAction } from 'react'
import NarInput from '../../../_design-system/NarInput'

interface WalletFormProps {
  wallet: WalletEntity
  setWallet: Dispatch<SetStateAction<WalletEntity>>
}

const WalletForm: FC<WalletFormProps> = ({ wallet, setWallet }) => (
  <div className="flex flex-col gap-6">
    {wallet.id && (
      <NarInput label="Id" value={wallet.id} onChange={(id) => setWallet((prev) => ({ ...prev, id }))} disabled />
    )}
    <NarInput
      label="Address"
      value={wallet.address}
      validate={(value) => (value ? isAddress(value) : false)}
      errorMessage="Invalid wallet address."
      onChange={(address) => setWallet((prev) => ({ ...prev, address }) as WalletEntity)}
    />
    <NarInput
      label="Account Type"
      value={wallet.accountType}
      onChange={(accountType) => setWallet((prev) => ({ ...prev, accountType }) as WalletEntity)}
    />
    <NarInput
      label="Chain Id"
      value={`${wallet.chainId || ''}`}
      onChange={(chainId) => setWallet((prev) => ({ ...prev, chainId: Number(chainId) }) as WalletEntity)}
    />
  </div>
)

export default WalletForm
