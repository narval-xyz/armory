import NarInput from '../../_design-system/NarInput'
import { CredentialEntity, UserEntity } from "@narval/policy-engine-shared"
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
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
  const [userId, setUserId] = useState(credential?.userId)
  const [rawJwk, setRawJwk] = useState(credential?.key ? JSON.stringify(credential.key, null, 2) : '')

  const isValid = (value?: string) => {
    if (value) {
      try {
        return publicKeySchema.safeParse(JSON.parse(value)).success
      } catch {
        return false
      }
    }

    return false
  }

  useEffect(() => {
    if (userId && isValid(rawJwk)) {
      setCredential((prev) => {
        const key = publicKeySchema.parse(JSON.parse(rawJwk))

        if (prev) {
          return {
            ...prev,
            userId,
            key
          }
        }

        return {
          id: key.kid,
          userId,
          key
        }
      })
    }
  }, [userId, rawJwk])

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
            label={userId || 'Choose a user'}
            rightIcon={<FontAwesomeIcon icon={faChevronDown} />}
          />
        }
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        onSelect={(item) => {
          setUserId(item.value)
          setIsDropdownOpen(false)
        }}
      />

      <NarTextarea
        label="JSON Web Key"
        value={rawJwk}
        validate={isValid}
        errorMessage="Invalid JSON web key"
        onChange={setRawJwk}
      />
    </div>
  )
}

export default CredentialForm
