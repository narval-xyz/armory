'use client'

import { faCheckCircle, faChevronDown, faPlus, faSpinner, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
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
import { useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarButton from '../../_design-system/NarButton'
import NarCollapsible from '../../_design-system/NarCollapsible'
import NarCopyButton from '../../_design-system/NarCopyButton'
import NarDialog from '../../_design-system/NarDialog'
import NarDropdownMenu, { DropdownItem } from '../../_design-system/NarDropdownMenu'
import NarInput from '../../_design-system/NarInput'
import NarTextarea from '../../_design-system/NarTextarea'
import useDataStoreApi from '../../_hooks/useDataStoreApi'
import { extractErrorMessage } from '../../_lib/utils'

enum Steps {
  AddUserForm,
  AddUserSuccess,
  SignAndPush,
  Success,
  Error
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
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.AddUserForm)
  const [credentialType, setCredentialType] = useState<CredentialType>(CredentialType.EoaAddress)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [userForm, setUserForm] = useState<AddUserForm>(initUserFormState)
  const [newEntityStore, setNewEntityStore] = useState<Entities>()
  const [errors, setErrors] = useState<string>('')

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

  const btnLabel = useMemo(() => {
    if (currentStep === Steps.AddUserForm) {
      return 'Add'
    }
    if (currentStep === Steps.AddUserSuccess) {
      return 'Sign and Push'
    }
    if ([Steps.Success, Steps.Error].includes(currentStep)) {
      return 'Ok'
    }

    return 'Processing...'
  }, [currentStep])

  const handleClose = () => {
    setIsDialogOpen(false)
    setNewEntityStore(undefined)
    setUserForm(initUserFormState)
    setCurrentStep(Steps.AddUserForm)
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

      setNewEntityStore(entities)
      setCurrentStep(Steps.AddUserSuccess)
    } catch (error: any) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSignAndPush = async () => {
    if (!newEntityStore) return

    try {
      setIsProcessing(true)
      setCurrentStep(Steps.SignAndPush)
      await signAndPushEntity(newEntityStore)
      setCurrentStep(Steps.Success)
      await getEntityStore()
    } catch (error: any) {
      setErrors(extractErrorMessage(error))
      setCurrentStep(Steps.Error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <NarDialog
      triggerButton={<NarButton label="Add User" leftIcon={<FontAwesomeIcon icon={faPlus} />} />}
      title="Add User"
      primaryButtonLabel={btnLabel}
      isOpen={isDialogOpen}
      onOpenChange={(val) => (val ? setIsDialogOpen(val) : handleClose())}
      onDismiss={handleClose}
      onSave={currentStep === Steps.AddUserForm ? handleSave : handleSignAndPush}
      isSaving={isProcessing}
      isConfirm={[Steps.Success, Steps.Error].includes(currentStep)}
      isSaveDisabled={isProcessing || !isFormValid}
    >
      <div className="w-[650px] px-12 py-4">
        {currentStep === Steps.AddUserForm && (
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
                  if (credentialType === CredentialType.EoaAddress) return
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
                  if (credentialType === CredentialType.PublicJwk) return
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
          </div>
        )}
        {currentStep === Steps.AddUserSuccess && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-nv-xs italic">
              To add a user with its credentials you must <u>update, sign and push</u> your entity data store.
            </p>
            <NarCollapsible title="Entity Data Store">
              <div className="flex flex-col gap-[16px] max-h-[500px]">
                <div className="flex">
                  <NarCopyButton variant="primary" copy={JSON.stringify(newEntityStore)} />
                </div>
                <pre>{JSON.stringify(newEntityStore, null, 2)}</pre>
              </div>
            </NarCollapsible>
          </div>
        )}
        {currentStep === Steps.SignAndPush && (
          <div className="flex flex-col items-center justify-center gap-[8px]">
            <FontAwesomeIcon icon={faSpinner} spin size="xl" />
            <p className="text-nv-lg">Signing and pushing entity data store...</p>
          </div>
        )}
        {currentStep === Steps.Success && (
          <div className="flex flex-col items-center justify-center gap-[8px]">
            <FontAwesomeIcon className="text-nv-green-500" icon={faCheckCircle} size="xl" />
            <p className="text-nv-lg">Data store updated successfully!</p>
          </div>
        )}
        {currentStep === Steps.Error && (
          <div className="flex flex-col items-center justify-center gap-[8px]">
            <FontAwesomeIcon className="text-nv-red-500" icon={faXmarkCircle} size="xl" />
            {errors && <p className="text-nv-lg">An error occurred: {errors}</p>}
          </div>
        )}
      </div>
    </NarDialog>
  )
}

export default AddUserModal
