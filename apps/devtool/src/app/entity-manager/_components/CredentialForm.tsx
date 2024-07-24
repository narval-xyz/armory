import NarInput from '../../_design-system/NarInput'
import { CredentialEntity, UserEntity } from "@narval/policy-engine-shared"
import { Dispatch, FC, SetStateAction, useState } from "react"
import NarTextarea from '../../_design-system/NarTextarea'
import { publicKeySchema } from '@narval/signature'
import NarDropdownMenu, { DropdownItem } from '../../_design-system/NarDropdownMenu'
import NarButton from '../../_design-system/NarButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

interface CredentialFormProps {
  credential?: CredentialEntity
  setCredential: Dispatch<SetStateAction<CredentialEntity | undefined>>
  users: UserEntity[]
}

const getUsersDropdownItems = (users: UserEntity[]): DropdownItem<UserEntity>[] => [
  {
    isRadioGroup: true,
    items: users.map(({ id, role }) => ({
      label: `${id} (${role})`,
      value: id
    }))
  }
]

const CredentialForm: FC<CredentialFormProps> = ({ credential, setCredential, users }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      {credential?.id && (
        <NarInput
          label="ID"
          value={credential.id}
          onChange={(id) => setCredential((prev) => prev ? { ...prev, id } : undefined)} disabled
        />
      )}

      <NarDropdownMenu
        label="User"
        data={getUsersDropdownItems(users)}
        triggerButton={
          <NarButton
            variant="tertiary"
            label={credential?.userId || 'Choose a user'}
            rightIcon={<FontAwesomeIcon icon={faChevronDown} />}
          />
        }
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        onSelect={(item) => {
          setCredential((prev) => prev ? { ...prev, userId: item.value } : undefined)
          setIsDropdownOpen(false)
        }}
      />

      <NarTextarea
        label="JSON Web Key"
        value={credential?.key ? JSON.stringify(credential.key, null, 2) : ''}
        validate={(value) => publicKeySchema.safeParse(value).success}
        errorMessage="Invalid public key."
        onChange={(rawJwk) => setCredential((prev) => prev ? { ...prev, key: publicKeySchema.parse(rawJwk) } : undefined)}
      />
    </div>
  )
}

export default CredentialForm
