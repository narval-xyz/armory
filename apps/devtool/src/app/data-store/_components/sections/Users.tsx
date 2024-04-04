'use client'

import { UserEntity } from '@narval/policy-engine-shared'
import { FC } from 'react'
import DataCard from '../layouts/DataCard'
import DataSection from '../layouts/DataSection'

interface UserProps {
  users: UserEntity[] | undefined
  onChange: (users: UserEntity[]) => void
}

const Users: FC<UserProps> = ({ users, onChange }) => {
  const handleEdit = (id: string) => {
    console.log(id)
  }

  const handleDelete = (id: string) => {
    if (!users) return
    onChange(users.filter((user) => user.id !== id))
  }

  return (
    <DataSection name="users" data={users}>
      {users?.map((user) => (
        <DataCard key={user.id} onEdit={() => handleEdit(user.id)} onDelete={() => handleDelete(user.id)}>
          <p>{user.id}</p>
        </DataCard>
      ))}
    </DataSection>
  )
}

export default Users
