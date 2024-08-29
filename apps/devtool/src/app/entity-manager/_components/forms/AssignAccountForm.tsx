import { AccountEntity, UserAccountEntity, UserEntity } from '@narval/armory-sdk'
import { Dispatch, FC, SetStateAction, useCallback } from 'react'
import MultiSelectList from '../MultiselectList'

interface AssignAccountFormProps {
  user: UserEntity
  accounts: AccountEntity[]
  userAccounts: AccountEntity[]
  setUserAccounts: Dispatch<SetStateAction<UserAccountEntity[]>>
}

const AssignAccountForm: FC<AssignAccountFormProps> = ({ user, accounts, userAccounts, setUserAccounts }) => {
  const handleSelect = useCallback(
    (items: string[]) => {
      setUserAccounts(items.map((accountId) => ({ userId: user.id, accountId })))
    },
    [user, setUserAccounts]
  )

  return (
    <MultiSelectList
      items={accounts.map(({ id, address }) => ({
        label: address,
        value: id,
        checked: userAccounts.map(({ id }) => id).includes(id)
      }))}
      onSelect={handleSelect}
    />
  )
}

export default AssignAccountForm
