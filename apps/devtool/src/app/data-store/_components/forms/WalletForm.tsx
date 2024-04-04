'use client'

import { WalletEntity, isAddress } from '@narval/policy-engine-shared'
import { FC, useEffect, useState } from 'react'
import NarInput from '../../../_design-system/NarInput'

interface WalletFormProps {
  wallet?: WalletEntity
  onChange: (wallet: WalletEntity) => void
}

const WalletForm: FC<WalletFormProps> = ({ wallet, onChange }) => {
  const [form, setForm] = useState<WalletEntity>(
    wallet ||
      ({
        id: '',
        address: '',
        accountType: ''
      } as unknown as WalletEntity)
  )

  useEffect(() => onChange(form), [form])

  return (
    <div className="flex flex-col gap-6">
      {form.id && (
        <NarInput label="Wallet ID" value={form.id} onChange={(id) => setForm((prev) => ({ ...prev, id }))} disabled />
      )}
      <NarInput
        label="Address"
        value={form.address}
        validate={(value) => (value ? isAddress(value) : false)}
        errorMessage="Invalid wallet address."
        onChange={(address) => setForm((prev) => ({ ...prev, address }) as WalletEntity)}
      />
      <NarInput
        label="Account Type"
        value={form.accountType}
        onChange={(accountType) => setForm((prev) => ({ ...prev, accountType }) as WalletEntity)}
      />
      <NarInput
        label="Chain ID"
        value={`${form.chainId || ''}`}
        onChange={(chainId) => setForm((prev) => ({ ...prev, chainId: Number(chainId) }) as WalletEntity)}
      />
    </div>
  )
}

export default WalletForm
