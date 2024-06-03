import { faCheckCircle, faChevronDown, faPlus, faSpinner, faXmarkCircle } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  CredentialEntity,
  Entities,
  UserEntity,
  UserRole,
  addressSchema,
  userRoleSchema
} from '@narval/policy-engine-shared'
import { Curves, KeyTypes, PublicKey, SigningAlg, jwkEoaSchema, publicKeySchema } from '@narval/signature'
import { capitalize } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarButton from '../_design-system/NarButton'
import NarDialog from '../_design-system/NarDialog'
import NarDropdownMenu, { DropdownItem } from '../_design-system/NarDropdownMenu'
import NarInput from '../_design-system/NarInput'
import NarTextarea from '../_design-system/NarTextarea'
import useDataStoreApi from '../_hooks/useDataStoreApi'
import useEngineApi from '../_hooks/useEngineApi'

enum Steps {
  AddUser,
  SignAndPush,
  SyncEngine
}

enum CredentialType {
  EoaAddress,
  PublicJwk
}

type AddUserForm = { role: UserRole; publicKey: string }

const initUserFormState: AddUserForm = {
  role: UserRole.ADMIN,
  publicKey: ''
}

const userRoleDropdownItems: DropdownItem<UserRole>[] = [
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

const AddUserModal = () => {
  const { entityStore, getEntityStore, signAndPushEntity } = useDataStoreApi()
  const { isSynced, sync: syncEngine } = useEngineApi()

  const [currentStep, setCurrentStep] = useState<Steps>(Steps.AddUser)
  const [credentialType, setCredentialType] = useState<CredentialType>(CredentialType.EoaAddress)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEngineSynced, setIsEngineSynced] = useState(false)
  const [userForm, setUserForm] = useState<AddUserForm>(initUserFormState)

  const isFormValid = useMemo(() => {
    const isValidUserRole = userForm.role && userRoleSchema.safeParse(userForm.role).success

    if (!isValidUserRole || !userForm.publicKey) return false

    if (addressSchema.safeParse(userForm.publicKey).success) {
      return true
    } else if (publicKeySchema.safeParse(JSON.parse(userForm.publicKey)).success) {
      return true
    } else {
      return false
    }
  }, [userForm])

  useEffect(() => {
    if (isSynced) {
      setIsEngineSynced(isSynced)
    }
  }, [isSynced])

  const handleClose = () => {
    setIsDialogOpen(false)
    setIsEngineSynced(false)
    setUserForm(initUserFormState)
    setCurrentStep(Steps.AddUser)
    setCredentialType(CredentialType.EoaAddress)
  }

  const handleSave = async () => {
    if (!entityStore || !isFormValid) return

    try {
      setIsProcessing(true)

      const newUser: UserEntity = {
        id: uuid(),
        role: userForm.role
      }

      let key: PublicKey

      if (addressSchema.safeParse(userForm.publicKey).success) {
        key = jwkEoaSchema.parse({
          kty: KeyTypes.EC,
          crv: Curves.SECP256K1,
          alg: SigningAlg.ES256K,
          kid: userForm.publicKey,
          addr: userForm.publicKey
        })
      } else if (publicKeySchema.safeParse(JSON.parse(userForm.publicKey)).success) {
        key = publicKeySchema.parse(JSON.parse(userForm.publicKey))
      } else {
        return
      }

      const newUserCredential: CredentialEntity = {
        id: key.addr as string,
        userId: newUser.id,
        key
      }

      const { users: currentUsers, credentials: currentCredentials } = entityStore.data

      const entities: Entities = {
        ...entityStore.data,
        users: [...currentUsers, newUser],
        credentials: [...currentCredentials, newUserCredential]
      }

      await signAndPushEntity(entities)
      setCurrentStep(Steps.SignAndPush)

      await syncEngine()
      setCurrentStep(Steps.SyncEngine)

      await getEntityStore()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <NarDialog
      triggerButton={<NarButton label="Add User" leftIcon={<FontAwesomeIcon icon={faPlus} />} />}
      title="Add User"
      primaryButtonLabel={isEngineSynced ? 'Ok' : 'Sign and Push'}
      isOpen={isDialogOpen}
      onOpenChange={(val) => (val ? setIsDialogOpen(val) : handleClose())}
      onDismiss={handleClose}
      onSave={handleSave}
      isSaving={isProcessing}
      isConfirm={currentStep === Steps.SyncEngine}
      isSaveDisabled={isProcessing || !isFormValid}
    >
      <div className="w-[650px] px-12 py-4">
        {currentStep === Steps.AddUser && (
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center gap-[8px] mb-[8px]">
              <NarButton
                className={
                  credentialType === CredentialType.EoaAddress
                    ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white'
                    : ''
                }
                variant="tertiary"
                label="EOA Address"
                onClick={() => {
                  setUserForm((prev) => ({ ...prev, publicKey: '' }))
                  setCredentialType(CredentialType.EoaAddress)
                }}
              />
              <NarButton
                className={
                  credentialType === CredentialType.PublicJwk
                    ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white'
                    : ''
                }
                variant="tertiary"
                label="Public JWK"
                onClick={() => {
                  setUserForm((prev) => ({ ...prev, publicKey: '' }))
                  setCredentialType(CredentialType.PublicJwk)
                }}
              />
            </div>
            {credentialType === CredentialType.EoaAddress && (
              <NarInput
                label="EOA Address"
                value={userForm.publicKey}
                onChange={(publicKey) => setUserForm((prev) => ({ ...prev, publicKey }))}
                validate={(value) => {
                  if (!value) return false
                  try {
                    const parsed = addressSchema.safeParse(value)
                    return parsed.success
                  } catch (e) {
                    return false
                  }
                }}
                errorMessage="Invalid EOA Address"
              />
            )}
            {credentialType === CredentialType.PublicJwk && (
              <NarTextarea
                label="Public Key"
                value={userForm.publicKey}
                onChange={(publicKey) => setUserForm((prev) => ({ ...prev, publicKey }))}
                validate={(value) => {
                  if (!value) return false
                  try {
                    const parsed = publicKeySchema.safeParse(JSON.parse(value))
                    return parsed.success
                  } catch (e) {
                    return false
                  }
                }}
                errorMessage="Invalid public key"
              />
            )}
            <NarDropdownMenu
              label="Role"
              data={userRoleDropdownItems}
              triggerButton={
                <NarButton
                  variant="tertiary"
                  label={capitalize(userForm.role) || 'Choose user role'}
                  rightIcon={<FontAwesomeIcon icon={faChevronDown} />}
                />
              }
              isOpen={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
              onSelect={(item) => {
                setUserForm((prev) => ({ ...prev, role: item.value as UserRole }))
                setIsDropdownOpen(false)
              }}
            />
            <p className="text-nv-xs italic">
              To add a user with its credentials you must <u>update, sign and push</u> your entity data store.
            </p>
          </div>
        )}
        {currentStep === Steps.SignAndPush && (
          <div className="flex flex-col items-center justify-center gap-[8px]">
            <FontAwesomeIcon icon={faSpinner} spin size="xl" />
            <p className="text-nv-lg">Signing and pushing entity data store...</p>
          </div>
        )}
        {currentStep === Steps.SyncEngine && (
          <div className="flex flex-col items-center justify-center gap-[8px]">
            <FontAwesomeIcon
              className={isEngineSynced ? 'text-nv-green-500' : 'text-nv-red-500'}
              icon={isEngineSynced ? faCheckCircle : faXmarkCircle}
              size="xl"
            />
            <p className="text-nv-lg">{isEngineSynced ? 'Engine synced!' : 'Failed to sync engine!'}</p>
          </div>
        )}
      </div>
    </NarDialog>
  )
}

export default AddUserModal
