import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { UserEntity, UserRole } from '@narval/policy-engine-shared'
import { Dispatch, FC, SetStateAction, useState } from 'react'
import NarButton from '../../../_design-system/NarButton'
import NarDropdownMenu, { DropdownItem } from '../../../_design-system/NarDropdownMenu'
import NarInput from '../../../_design-system/NarInput'
import NarTextarea from '../../../_design-system/NarTextarea'
import { capitalize } from '../../../_lib/utils'

export type UserData = UserEntity & { publicKey: string }

interface UserFormProps {
  user: UserData
  setUser: Dispatch<SetStateAction<UserData>>
}

const UserForm: FC<UserFormProps> = ({ user, setUser }) => {
  const [isOpen, setIsOpen] = useState(false)

  const dropdownData: DropdownItem[] = [
    {
      isRadioGroup: true,
      items: Object.keys(UserRole).map((key) => {
        const value = key.toLowerCase() as UserRole
        const label = capitalize(value)

        return {
          label,
          value
        }
      })
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      {user.id && (
        <NarInput label="Id" value={user.id} onChange={(id) => setUser((prev) => ({ ...prev, id }))} disabled />
      )}
      <NarTextarea
        label="Public Key"
        value={user.publicKey}
        onChange={(publicKey) => setUser((prev) => ({ ...prev, publicKey }) as UserData)}
      />
      <NarDropdownMenu
        label="Role"
        data={dropdownData}
        triggerButton={
          <NarButton
            variant="tertiary"
            label={capitalize(user.role) || 'Choose user role'}
            rightIcon={<FontAwesomeIcon icon={faChevronDown} />}
          />
        }
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={(item) => {
          setUser((prev) => ({ ...prev, role: item.value }) as UserData)
          setIsOpen(false)
        }}
      />
    </div>
  )
}

export default UserForm
