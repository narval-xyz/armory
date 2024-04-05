import { UserEntity } from '@narval/policy-engine-shared'
import { Dispatch, FC, SetStateAction } from 'react'
import NarInput from '../../../_design-system/NarInput'

interface UserFormProps {
  user: UserEntity
  setUser: Dispatch<SetStateAction<UserEntity>>
}

const UserForm: FC<UserFormProps> = ({ user, setUser }) => (
  <div className="flex flex-col gap-6">
    {user.id && (
      <NarInput label="Id" value={user.id} onChange={(id) => setUser((prev) => ({ ...prev, id }))} disabled />
    )}
    <NarInput
      label="Role"
      value={user.role}
      onChange={(role) => setUser((prev) => ({ ...prev, role }) as UserEntity)}
    />
  </div>
)

export default UserForm
