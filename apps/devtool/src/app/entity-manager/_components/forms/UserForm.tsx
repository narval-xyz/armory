import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  CredentialEntity,
  Curves,
  KeyTypes,
  SigningAlg,
  UserEntity,
  UserRole,
  isAddress,
  jwkEoaSchema,
  publicKeySchema
} from '@narval/armory-sdk'
import { capitalize } from 'lodash'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarButton from '../../../_design-system/NarButton'
import NarDropdownMenu, { DropdownItem } from '../../../_design-system/NarDropdownMenu'
import NarInput from '../../../_design-system/NarInput'
import NarTextarea from '../../../_design-system/NarTextarea'
import CredentialForm from './CredentialForm'

enum CredentialType {
  NONE,
  EOA,
  JWK
}

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

const ExternallyOwnedAccountCredentialForm: FC<UserFormProps> = ({ user, credential, setCredential }) => {
  const [address, setAddress] = useState(credential?.key.addr || '')

  useEffect(() => {
    if (isAddress(address)) {
      const key = jwkEoaSchema.parse({
        kty: KeyTypes.EC,
        crv: Curves.SECP256K1,
        alg: SigningAlg.ES256K,
        kid: address,
        addr: address
      })

      setCredential((prev) => {
        if (prev) {
          return { ...prev, key }
        }

        if (user) {
          return {
            id: key.kid,
            userId: user.id,
            key
          }
        }

        return undefined
      })
    }
  }, [address, setCredential, user])

  return (
    <>
      <NarInput
        label="Address"
        value={address}
        onChange={setAddress}
        validate={isAddress}
        errorMessage="Invalid address"
      />
    </>
  )
}

const JsonWebKeyForm: FC<UserFormProps> = ({ user, setCredential, credential }) => {
  const [jwk, setJwk] = useState(credential ? JSON.stringify(credential.key, null, 2) : '')

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
    if (isValid(jwk)) {
      const key = publicKeySchema.parse(JSON.parse(jwk))

      setCredential((prev) => {
        if (prev) {
          return { ...prev, key }
        }

        if (user) {
          return {
            id: key.kid,
            userId: user.id,
            key
          }
        }

        return undefined
      })
    }
  }, [jwk, setCredential, user])

  return (
    <NarTextarea
      label="Public Key"
      value={jwk}
      onChange={setJwk}
      validate={isValid}
      errorMessage="Invalid public key"
    />
  )
}

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
