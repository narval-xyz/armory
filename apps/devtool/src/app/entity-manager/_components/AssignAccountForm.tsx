import { AccountEntity, AccountType, UserAccountEntity, UserEntity } from "@narval/policy-engine-shared"
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { DropdownItem } from '../../_design-system/NarDropdownMenu'
import NarCheckbox from "../../_design-system/NarCheckbox"
import { boolean } from "zod"

interface AssignAccountFormProps {
  user: UserEntity
  accounts: AccountEntity[]
  userAccounts: AccountEntity[]
  setUserAccounts: Dispatch<SetStateAction<UserAccountEntity[]>>
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

const AssignAccountForm: FC<AssignAccountFormProps> = ({ user, userAccounts, accounts, setUserAccounts }) => {
  const [assignedAccounts, setAssignedAccounts] = useState(userAccounts)

  useEffect(() => {
    setUserAccounts(assignedAccounts.map(({ id }) => ({ userId: user.id, accountId: id })))
  }, [assignedAccounts])

  return (
    <div className="flex flex-col gap-6">
      {accounts.map(({ address, accountType, chainId, id }) => (
        <NarCheckbox
          id={`assigned-account-${user.id}-${id}`}
          label={accountType === AccountType.EOA ? address : `${address} Smart Account on chain ${chainId}`}
          checked={Boolean(assignedAccounts.find((userAccount) => userAccount.id === id))}
          onCheckedChange={(checked) => {
            if (checked) {
              setAssignedAccounts((prev) => [...prev, { address, accountType, chainId, id }])
            } else {
              setAssignedAccounts((prev) => prev.filter((account) => account.id !== id))
            }
          }}
        />
      ))}
    </div>
  )
}

export default AssignAccountForm
