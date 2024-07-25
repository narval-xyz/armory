'use client'

import { AccountEntity, AccountType, getAddress, isAddress } from '@narval/policy-engine-shared'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import NarInput from '../../_design-system/NarInput'
import NarButton from '../../_design-system/NarButton'
import { resourceId } from '@narval/armory-sdk'

interface AccountFormProps {
  account?: AccountEntity
  setAccount: Dispatch<SetStateAction<AccountEntity | undefined>>
}

const AccountForm: FC<AccountFormProps> = ({ account, setAccount }) => {
  const [address, setAddress] = useState(account?.address || '')
  const [accountType, setAccountType] = useState(account?.accountType || AccountType.EOA)
  const [chainId, setChainId] = useState(account?.chainId?.toString())

  useEffect(() => {
    if (isAddress(address)) {
      const validAddress = getAddress(address)

      setAccount({
        accountType,
        address: validAddress,
        id: `eip155:${accountType}:${validAddress.toLowerCase()}`,
        ...(chainId ? { chainId: 1 } : {})
      })
    }
  }, [address, accountType, chainId])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <NarButton
          className={
            accountType === AccountType.EOA
              ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white'
              : ''
          }
          variant="tertiary"
          label="Externally Owned Account"
          onClick={() => {
            setAccountType(AccountType.EOA)
          }}
        />

        <NarButton
          className={
            accountType === AccountType.AA
              ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white'
              : ''
          }
          variant="tertiary"
          label="Smart Account"
          onClick={() => {
            setAccountType(AccountType.AA)
          }}
        />
      </div>

      <NarInput
        label="Address"
        value={address}
        validate={isAddress}
        errorMessage="Invalid address"
        onChange={setAddress}
      />

      {accountType === AccountType.AA && (
        <NarInput
          label="Chain Id"
          value={chainId}
          onChange={setChainId}
        />
      )}
    </div>
  )
}

export default AccountForm
