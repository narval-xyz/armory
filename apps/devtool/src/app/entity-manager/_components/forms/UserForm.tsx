import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CredentialEntity, UserEntity, UserRole } from '@narval/policy-engine-shared'
import { capitalize } from 'lodash'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarButton from '../../../_design-system/NarButton'
import NarDropdownMenu, { DropdownItem } from '../../../_design-system/NarDropdownMenu'
import NarInput from '../../../_design-system/NarInput'
import CredentialForm from './CredentialForm'

interface UserFormProps {
  user?: UserEntity
  setUser: Dispatch<SetStateAction<UserEntity | undefined>>
  credential?: CredentialEntity
  setCredential: Dispatch<SetStateAction<CredentialEntity | undefined>>
  isEdit?: boolean
}

const userRoleDropdownItems: DropdownItem<UserRole>[] = [
  {
    isRadioGroup: true,
    items: Object.values(UserRole).map((key) => ({
      label: capitalize(key),
      value: key
    }))
  }
]

const UserForm: FC<UserFormProps> = (props) => {
  const { user, setUser, isEdit, setCredential, credential } = props
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      setUser({ id: uuid(), role: UserRole.MEMBER })
    }
  }, [user, setUser])

  return (
    <div className="flex flex-col gap-6">
      <NarInput
        label="ID"
        value={user?.id || ''}
        onChange={(id) => setUser((prev) => (prev ? { ...prev, id } : undefined))}
        disabled={isEdit}
      />

      <NarDropdownMenu
        label="Role"
        data={userRoleDropdownItems}
        triggerButton={
          <NarButton
            variant="tertiary"
            label={user ? capitalize(user.role) : 'Choose a role'}
            rightIcon={<FontAwesomeIcon icon={faChevronDown} />}
          />
        }
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        onSelect={(item) => {
          setUser((prev) => (prev ? { ...prev, role: item.value as UserRole } : undefined))
          setIsDropdownOpen(false)
        }}
      />

      {!isEdit && user && (
        <fieldset>
          <legend className="mb-4">Credential</legend>

          <CredentialForm user={user} setCredential={setCredential} credential={credential} isEmbedded={true} />
        </fieldset>
      )}
    </div>
  )
}

export default UserForm
