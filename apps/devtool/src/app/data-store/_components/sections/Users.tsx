'use client'

import { UserEntity } from '@narval/policy-engine-shared'
import { FC, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarDialog from '../../../_design-system/NarDialog'
import UserForm from '../forms/UserForm'
import DataCard from '../layouts/DataCard'
import DataSection from '../layouts/DataSection'

interface UserProps {
  users: UserEntity[] | undefined
  onChange: (users: UserEntity[]) => void
}

const Users: FC<UserProps> = ({ users, onChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userForm, setUserForm] = useState<UserEntity>()

  const openDialog = (user?: UserEntity) => {
    if (user) {
      setUserForm(user)
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!userForm) return
    const newUsers = users ? [...users] : []
    newUsers.push({ ...userForm, id: uuid() })
    onChange(newUsers)
    setUserForm(undefined)
    setIsDialogOpen(false)
  }

  const handleEdit = () => {
    if (!users || !userForm) return
    const index = users.findIndex((w) => w.id === userForm.id)
    if (index === -1) return
    users[index] = userForm
    onChange(users)
    setUserForm(undefined)
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!users) return
    onChange(users.filter((user) => user.id !== id))
  }

  return (
    <>
      <DataSection name="users" data={users} onClick={() => openDialog()}>
        {users?.map((user) => (
          <DataCard key={user.id} onEdit={() => openDialog(user)} onDelete={() => handleDelete(user.id)}>
            <p>{user.id}</p>
          </DataCard>
        ))}
      </DataSection>
      {isDialogOpen && (
        <NarDialog
          triggerButton={null}
          title={userForm?.id ? 'Edit User' : 'Create User'}
          primaryButtonLabel="Create"
          isOpen={isDialogOpen}
          onOpenChange={(open) => setIsDialogOpen(open)}
          onDismiss={() => setIsDialogOpen(false)}
          onSave={userForm?.id ? handleEdit : handleSave}
        >
          <div className="w-[650px] px-12 py-4">
            <UserForm user={userForm} onChange={setUserForm} />
          </div>
        </NarDialog>
      )}
    </>
  )
}

export default Users
