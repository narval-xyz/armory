import { AccountEntity, AccountType, UserAccountEntity, UserEntity } from "@narval/policy-engine-shared"
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { DropdownItem } from '../../_design-system/NarDropdownMenu'
import NarCheckbox from "../../_design-system/NarCheckbox"
import { boolean } from "zod"

interface AssignAccountFormProps {
  user: UserEntity
  accounts: AccountEntity[]
  userAccounts: AccountEntity[]
  setUserAccount: Dispatch<SetStateAction<UserAccountEntity | undefined>>
}

const getAccountsDropdownItems = (accounts: AccountEntity[]): DropdownItem<AccountEntity>[] => [
  {
    isRadioGroup: true,
    items: accounts.map(({ address, accountType, chainId, id }) => ({
      label: accountType === AccountType.EOA ? address : `${address} Smart Account (Chain ID: ${chainId})`,
      value: id
    }))
  }
]

const AssignAccountForm: FC<AssignAccountFormProps> = ({ user, userAccounts, accounts, setUserAccount }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userId, setUserId] = useState(user.id)
  const [accountId, setAccountId] = useState<string | undefined>()
  console.log({ userAccounts, accounts })

  useEffect(() => {
    if (accountId) {
      setUserAccount({
        userId,
        accountId
      })
    }
  }, [accountId])


  return (
    <div className="flex flex-col gap-6">
      {accounts.map(({ address, accountType, chainId, id }) => (
        <NarCheckbox
          label={accountType === AccountType.EOA ? address : `${address} Smart Account on chain ${chainId}`}
          checked={Boolean(userAccounts.find((userAccount) => userAccount.id === id))}
        />
      ))}
    </div>
  )
}

export default AssignAccountForm


// <NarDropdownMenu
//   label="Account"
//   data={getAccountsDropdownItems(accounts)}
//   triggerButton={
//     <NarButton
//       variant="tertiary"
//       label={accountId || 'Choose an account'}
//       rightIcon={<FontAwesomeIcon icon={faChevronDown} />}
//     />
//   }
//   isOpen={isDropdownOpen}
//   onOpenChange={setIsDropdownOpen}
//   onSelect={(item) => {
//     setAccountId(item.value)
//     setIsDropdownOpen(false)
//   }}
// />
