'use client'

import { AccountEntity, AccountType, getAddress, isAddress } from '@narval/policy-engine-shared'
import { Dispatch, FC, SetStateAction, useState } from 'react'
import NarInput from '../../_design-system/NarInput'
import NarDropdownMenu, { DropdownItem } from '../../_design-system/NarDropdownMenu'
import NarButton from '../../_design-system/NarButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

interface AccountFormProps {
  account?: AccountEntity
  setAccount: Dispatch<SetStateAction<AccountEntity | undefined>>
}

const accountTypeDropdownItems: DropdownItem<AccountType>[] = [
  {
    isRadioGroup: true,
    items: Object.keys(AccountType).map((key) => ({
      label: key.toUpperCase(),
      value: key
    }))
  }
]

const AccountForm: FC<AccountFormProps> = ({ account, setAccount }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      {account?.id && (
        <NarInput
          label="ID"
          value={account.id}
          onChange={(id) => setAccount((prev) => prev ? { ...prev, id } : undefined)}
          disabled
        />
      )}

      <NarInput
        label="Address"
        value={account?.address}
        validate={isAddress}
        errorMessage="Invalid account address."
        onChange={(address) => setAccount((prev) => prev ? { ...prev, address: getAddress(address) } : undefined)}
      />

      <NarDropdownMenu
        label="Account Type"
        data={accountTypeDropdownItems}
        triggerButton={
          <NarButton
            variant="tertiary"
            label={account?.accountType?.toUpperCase() || 'Choose an account type'}
            rightIcon={<FontAwesomeIcon icon={faChevronDown} />}
          />
        }
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        onSelect={(item) => {
          setAccount((prev) => prev ? { ...prev, accountType: item.value as AccountType } : undefined)
          setIsDropdownOpen(false)
        }}
      />

      <NarInput
        label="Chain Id"
        value={account?.chainId?.toString() || ''}
        onChange={(chainId) => setAccount((prev) => prev ? { ...prev, chainId: Number(chainId) } : undefined)}
      />
    </div>
  )
}

export default AccountForm
