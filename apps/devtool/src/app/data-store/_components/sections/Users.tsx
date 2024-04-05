'use client'

import { UserEntity } from '@narval/policy-engine-shared'
import { FC, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarDialog from '../../../_design-system/NarDialog'
import UserForm from '../forms/UserForm'
import DataCard from '../layouts/DataCard'
import DataSection from '../layouts/DataSection'

const initUserFormState = {
  id: '',
  role: ''
} as unknown as UserEntity

interface UserProps {
  users: UserEntity[] | undefined
  onChange: (users: UserEntity[]) => void
}

const Users: FC<UserProps> = ({ users, onChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userData, setUserData] = useState<UserEntity>(initUserFormState)

  const openDialog = (user?: UserEntity) => {
    if (user) {
      setUserData(user)
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
    newUsers.push({ ...userData, id: uuid() })
    onChange(newUsers)
    closeDialog()
  }

  const handleEdit = () => {
    if (!users || !userData) return
    const index = users.findIndex((w) => w.id === userData.id)
    if (index === -1) return
    users[index] = userData
    onChange(users)
    closeDialog()
  }

  const handleDelete = (id: string) => {
    if (!users) return
    onChange(users.filter((user) => user.id !== id))
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
