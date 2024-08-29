import {
  CredentialEntity,
  Curves,
  KeyTypes,
  SigningAlg,
  UserEntity,
  isAddress,
  jwkEoaSchema,
  publicKeySchema
} from '@narval/armory-sdk'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import NarButton from '../../../_design-system/NarButton'
import NarInput from '../../../_design-system/NarInput'
import NarTextarea from '../../../_design-system/NarTextarea'

interface CredentialFormProps {
  credential?: CredentialEntity
  setCredential: Dispatch<SetStateAction<CredentialEntity | undefined>>
  user: UserEntity
  isEmbedded?: boolean
}

enum CredentialType {
  NONE,
  EOA,
  JWK
}

const ExternallyOwnedAccountCredentialForm: FC<CredentialFormProps> = ({ user, credential, setCredential }) => {
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

      setCredential({
        id: key.kid,
        userId: user.id,
        key
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

const JsonWebKeyForm: FC<CredentialFormProps> = ({ user, setCredential, credential }) => {
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

const CredentialForm: FC<CredentialFormProps> = (props) => {
  const { isEmbedded } = props
  const [credentialType, setCredentialType] = useState(CredentialType.EOA)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <NarButton
          className={
            credentialType === CredentialType.EOA ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white' : ''
          }
          variant="tertiary"
          label="Address"
          onClick={() => {
            setCredentialType(CredentialType.EOA)
          }}
        />

        <NarButton
          className={
            credentialType === CredentialType.JWK ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white' : ''
          }
          variant="tertiary"
          label="Json Web Key"
          onClick={() => {
            setCredentialType(CredentialType.JWK)
          }}
        />

        {isEmbedded && (
          <NarButton
            className={
              credentialType === CredentialType.NONE ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white' : ''
            }
            variant="tertiary"
            label="No credential"
            onClick={() => {
              setCredentialType(CredentialType.NONE)
            }}
          />
        )}
      </div>

      {credentialType === CredentialType.EOA && <ExternallyOwnedAccountCredentialForm {...props} />}

      {credentialType === CredentialType.JWK && <JsonWebKeyForm {...props} />}
    </div>
  )
}

export default CredentialForm
