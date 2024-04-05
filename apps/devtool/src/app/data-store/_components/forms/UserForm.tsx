import { UserEntity } from '@narval/policy-engine-shared'
import { FC, useEffect, useState } from 'react'
import NarInput from '../../../_design-system/NarInput'

interface UserFormProps {
  user?: UserEntity
  onChange: (user: UserEntity) => void
}

const UserForm: FC<UserFormProps> = ({ user, onChange }) => {
  const [form, setForm] = useState<UserEntity>(
    user ||
      ({
        id: '',
        role: ''
      } as unknown as UserEntity)
  )

  useEffect(() => onChange(form), [form])

  return (
    <div className="flex flex-col gap-6">
      {form.id && (
        <NarInput label="Id" value={form.id} onChange={(id) => setForm((prev) => ({ ...prev, id }))} disabled />
      )}
      <NarInput
        label="Role"
        value={form.role}
        onChange={(role) => setForm((prev) => ({ ...prev, role }) as UserEntity)}
      />
    </div>
  )
}

export default UserForm
