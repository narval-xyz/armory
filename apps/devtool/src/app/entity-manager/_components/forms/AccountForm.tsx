'use client'

import { AccountEntity, AccountType, getAddress, isAddress } from '@narval/armory-sdk'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import NarInput from '../../../_design-system/NarInput'

interface AccountFormProps {
  account?: AccountEntity
  setAccount: Dispatch<SetStateAction<AccountEntity | undefined>>
}

const AccountForm: FC<AccountFormProps> = ({ account, setAccount }) => {
  const [address, setAddress] = useState(account?.address || '')

  useEffect(() => {
    if (isAddress(address)) {
      const validAddress = getAddress(address)

      setAccount({
        id: `eip155:eoa:${address.toLowerCase()}`,
        accountType: AccountType.EOA,
        address: validAddress
      })
    }
  }, [address])

  return (
    <div className="flex flex-col gap-6">
      <NarInput
        label="Address"
        value={address}
        validate={isAddress}
        errorMessage="Invalid address"
        onChange={setAddress}
      />
    </div>
  )
}

export default AccountForm
