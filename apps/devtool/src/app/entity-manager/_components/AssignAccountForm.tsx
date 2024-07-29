import { AccountEntity, UserAccountEntity, UserEntity } from '@narval/policy-engine-shared'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import NarCheckbox from '../../_design-system/NarCheckbox'

interface AssignAccountFormProps {
  user: UserEntity
  accounts: AccountEntity[]
  userAccounts: AccountEntity[]
  setUserAccounts: Dispatch<SetStateAction<UserAccountEntity[]>>
}

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
          label={id}
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
