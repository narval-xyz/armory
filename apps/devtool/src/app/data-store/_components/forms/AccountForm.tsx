'use client'

import { AccountEntity, isAddress } from '@narval/policy-engine-shared'
import { Dispatch, FC, SetStateAction } from 'react'
import NarInput from '../../../_design-system/NarInput'

interface AccountFormProps {
  account: AccountEntity
  setAccount: Dispatch<SetStateAction<AccountEntity>>
}

const AccountForm: FC<AccountFormProps> = ({ account, setAccount }) => (
  <div className="flex flex-col gap-6">
    {account.id && (
      <NarInput label="Id" value={account.id} onChange={(id) => setAccount((prev) => ({ ...prev, id }))} disabled />
    )}
    <NarInput
      label="Address"
      value={account.address}
      validate={(value) => (value ? isAddress(value) : false)}
      errorMessage="Invalid wallet address."
      onChange={(address) => setAccount((prev) => ({ ...prev, address }) as AccountEntity)}
    />
    <NarInput
      label="Account Type"
      value={account.accountType}
      onChange={(accountType) => setAccount((prev) => ({ ...prev, accountType }) as AccountEntity)}
    />
    <NarInput
      label="Chain Id"
      value={`${account.chainId || ''}`}
      onChange={(chainId) => setAccount((prev) => ({ ...prev, chainId: Number(chainId) }) as AccountEntity)}
    />
  </div>
)

export default AccountForm
