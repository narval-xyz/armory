'use client'

import { CredentialEntity, UserAccountEntity, UserEntity } from '@narval/policy-engine-shared'
import { FC, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarDialog from '../../../_design-system/NarDialog'
import UserForm, { UserData } from '../forms/UserForm'
import DataCard from '../layouts/DataCard'
import DataSection from '../layouts/DataSection'

const initUserFormState = {
  id: '',
  role: '',
  publicKey: ''
} as unknown as UserData

interface UserProps {
  users: UserEntity[] | undefined
  credentials: CredentialEntity[] | undefined
  userWallets: UserAccountEntity[] | undefined
  onChange: ({
    users,
    credentials,
    userWallets
  }: {
    users: UserEntity[]
    credentials: CredentialEntity[]
    userWallets?: UserAccountEntity[]
  }) => void
}

const Users: FC<UserProps> = ({ users, credentials, userWallets, onChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userData, setUserData] = useState<UserData>(initUserFormState)

  const openDialog = (user?: UserEntity) => {
    if (user) {
      const credential = credentials?.find((c) => c.userId === user.id)
      const publicKey = credential?.key ? JSON.stringify(credential.key) : ''
      setUserData({ ...user, publicKey })
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setUserData(initUserFormState)
  }

  const handleSave = () => {
    if (!userData) return

    const newUsers = users ? [...users] : []
    const newCredentials = credentials ? [...credentials] : []

    const { publicKey, ...user } = userData
    const userId = uuid()
    newUsers.push({ ...user, id: userId })
    newCredentials.push({ id: uuid(), userId, key: JSON.parse(publicKey) })

    onChange({ users: newUsers, credentials: newCredentials })
    closeDialog()
  }

  const handleEdit = () => {
    if (!users || !credentials || !userData) return

    const editedUsers = [...users]
    const editedCredentials = [...credentials]

    const userIndex = editedUsers.findIndex((u) => u.id === userData.id)
    if (userIndex === -1) return

    const credentialIndex = editedCredentials.findIndex((c) => c.userId === userData.id)
    if (credentialIndex === -1) return

    const { publicKey, ...user } = userData
    editedUsers[userIndex] = user
    editedCredentials[credentialIndex].key = JSON.parse(publicKey)

    onChange({ users: editedUsers, credentials: editedCredentials })
    closeDialog()
  }

  const handleDelete = (id: string) => {
    if (!users || !credentials) return
    const newUsers = users.filter((u) => u.id !== id)
    const newCredentials = credentials.filter((c) => c.userId !== id)
    const newUsersWallets = userWallets?.filter((w) => w.userId !== id)

    onChange({ users: newUsers, credentials: newCredentials, userWallets: newUsersWallets })
  }

  return (
    <>
      <DataSection name="users" data={users} onCreate={() => openDialog()}>
        {users?.map((user) => (
          <DataCard key={user.id} onEdit={() => openDialog(user)} onDelete={() => handleDelete(user.id)}>
            <p>{user.id}</p>
            <p>{user.role}</p>
          </DataCard>
        ))}
      </DataSection>
      {isDialogOpen && (
        <NarDialog
          triggerButton={null}
          title={userData?.id ? 'Edit User' : 'Create User'}
          primaryButtonLabel={userData?.id ? 'Edit' : 'Create'}
          isOpen={isDialogOpen}
          onOpenChange={(val) => (val ? setIsDialogOpen(val) : closeDialog())}
          onDismiss={closeDialog}
          onSave={userData?.id ? handleEdit : handleSave}
        >
          <div className="w-[650px] px-12 py-4">
            <UserForm user={userData} setUser={setUserData} />
          </div>
        </NarDialog>
      )}
    </>
  )
}

export default Users
