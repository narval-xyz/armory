'use client'

import useDataStoreApi from '../../_hooks/useDataStoreApi'
import {
  faEdit,
  faFileSignature,
  faPlus,
  faRotateRight,
  faSpinner,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NarButton from '../../_design-system/NarButton'
import { useEffect, useState } from 'react'
import { AccountEntity, CredentialEntity, Entities, EntityUtil, UserEntity } from '@narval/policy-engine-shared'
import AccountForm from './AccountForm'
import NarDialog from '../../_design-system/NarDialog'
import CredentialForm from './CredentialForm'
import UserForm from './UserForm'
import CodeEditor from '../../_components/CodeEditor'
import DataStoreConfigModal from '../../_components/modals/DataStoreConfigModal'

enum Tab {
  JSON,
  USERS,
}

export default function EntityManager() {
  const {
    entityStore,
    processingStatus: {
      isFetchingEntity,
      isSigningEntity,
      isSigningAndPushingEntity,
    },
    getEntityStore,
    signEntityData,
    signAndPushEntity,
  } = useDataStoreApi()

  const [tab, setTab] = useState(Tab.USERS)
  const [entities, setEntities] = useState<Entities>(EntityUtil.empty())

  const [user, setUser] = useState<UserEntity | undefined>()
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setEditUserDialogOpen] = useState(false)

  const [credential, setCredential] = useState<CredentialEntity | undefined>()
  const [isAddCredentialDialogOpen, setAddCredentialDialogOpen] = useState(false)

  const [isAccountDialogOpen, setAccountDialogOpen] = useState(false)
  const [account, setAccount] = useState<AccountEntity | undefined>()

  useEffect(() => {
    if (entityStore) {
      setEntities(entityStore.data)
    }
  }, [entityStore, setEntities])

  return (
    <div className="flex flex-col gap-[8px] h-full">
      <div className="flex flex-col gap-[8px]">
        <div className="flex items-center gap-[8px] mb-[8px]">
          <NarButton
            variant={tab === Tab.USERS ? 'primary' : 'secondary'}
            label="User Management"
            onClick={() => setTab(Tab.USERS)}
          />

          <NarButton
            variant={tab === Tab.JSON ? 'primary' : 'secondary'}
            label="JSON"
            onClick={() => setTab(Tab.JSON)}
          />
        </div>

        <div className="flex items-center gap-[8px] mb-[8px]">
          <NarButton
            variant="secondary"
            label="Sign"
            leftIcon={<FontAwesomeIcon icon={isSigningEntity ? faSpinner : faFileSignature} spin={isSigningEntity} />}
            disabled={isSigningEntity}
            onClick={() => {
              signEntityData(entities)
            }}
          />

          <NarButton
            variant="secondary"
            label="Sign & Push"
            leftIcon={
              <FontAwesomeIcon icon={isSigningAndPushingEntity ? faSpinner : faUpload} spin={isSigningAndPushingEntity} />
            }
            disabled={isSigningAndPushingEntity}
            onClick={() => {
              signAndPushEntity(entities)
            }}
          />

          <NarButton
            variant="secondary"
            label="Fetch"
            leftIcon={<FontAwesomeIcon icon={isFetchingEntity ? faSpinner : faRotateRight} spin={isFetchingEntity} />}
            onClick={getEntityStore}
            disabled={isFetchingEntity}
          />

          <DataStoreConfigModal />
        </div>
      </div>

      {tab === Tab.JSON && (
        <div className="flex items-start h-full">
          <div className="grid grow h-full">
            <CodeEditor
              value={JSON.stringify(entities, null, 2)}
              onChange={(json) => {
                if (json) {
                  setEntities(JSON.parse(json))
                }
              }}
            />
          </div>
        </div>
      )}

      {tab === Tab.USERS && (
        <>
          <div className="flex">
            <p className="text-xl mr-8">Users</p>

            <NarDialog
              triggerButton={<NarButton label="Add" leftIcon={<FontAwesomeIcon icon={faPlus} />} />}
              title="Add User"
              primaryButtonLabel={"Add"}
              isOpen={isAddUserDialogOpen}
              onOpenChange={setAddUserDialogOpen}
              onDismiss={() => {
                setAddUserDialogOpen(false)
                setUser(undefined)
                setCredential(undefined)
              }}
              onSave={() => {
                setEntities((prev) => {
                  const newEntities = {
                    ...prev,
                    users: user ? [...(prev?.users || []), user] : prev?.users,
                    credentials: credential ? [...(prev?.credentials || []), credential] : prev?.credentials,
                  }

                  const result = EntityUtil.validate(newEntities)

                  if (result.success) {
                    return newEntities
                  }

                  return prev
                })

                setAddUserDialogOpen(false)
                setUser(undefined)
                setCredential(undefined)
              }}
            >
              <div className="w-[650px] px-12 py-4">
                <UserForm
                  isEdit={false}
                  user={user}
                  setUser={setUser}
                  setCredential={setCredential}
                  credential={credential}
                />
              </div>
            </NarDialog>

            <NarDialog
              triggerButton={null}
              title="Edit User"
              primaryButtonLabel={"Edit"}
              isOpen={isEditUserDialogOpen}
              onOpenChange={setEditUserDialogOpen}
              onDismiss={() => {
                setEditUserDialogOpen(false)
                setUser(undefined)
                setCredential(undefined)
              }}
              onSave={() => {
                setEntities((prev) => {
                  if (user) {
                    const newEntities = EntityUtil.updateUser(prev, user)

                    const result = EntityUtil.validate(newEntities)

                    if (result.success) {
                      return newEntities
                    }
                  }

                  return prev
                })

                setEditUserDialogOpen(false)
                setUser(undefined)
                setCredential(undefined)
              }}
            >
              <div className="w-[650px] px-12 py-4">
                <UserForm
                  isEdit={true}
                  user={user}
                  setUser={setUser}
                  setCredential={setCredential}
                  credential={credential}
                />
              </div>
            </NarDialog>
          </div>

          {entities.users.map((user) => (
            <div className="flex items-center" key={user.id}>
              <span>{user.id} ({user.role})</span>
              <NarButton
                leftIcon={<FontAwesomeIcon icon={faEdit} />}
                onClick={() => {
                  setUser(user)
                  setCredential(undefined)
                  setEditUserDialogOpen(true)
                }}
              />
              <NarButton
                leftIcon={<FontAwesomeIcon icon={faTrash} />}
                onClick={() => setEntities(EntityUtil.removeUserById(entities, user.id))}
              />
            </div>
          ))}

          <div className="flex">
            <p className="text-xl mr-8">Credentials</p>

            <NarDialog
              triggerButton={<NarButton label="Add" leftIcon={<FontAwesomeIcon icon={faPlus} />} />}
              title="Add Credential"
              primaryButtonLabel={"Add"}
              isOpen={isAddCredentialDialogOpen}
              onOpenChange={setAddCredentialDialogOpen}
              onDismiss={() => {
                setAddCredentialDialogOpen(false)
                setCredential(undefined)
              }}
              onSave={() => {
                setEntities((prev) => credential ? { ...prev, credentials: [...prev.credentials, credential] } : prev)
                setAddCredentialDialogOpen(false)
                setCredential(undefined)
              }}
            >
              <div className="w-[650px] px-12 py-4">
                <CredentialForm users={entities.users} setCredential={setCredential} credential={credential} />
              </div>
            </NarDialog>
          </div>

          {entities.credentials.map((cred) => (
            <div className="flex items-center" key={cred.id}>
              <span>{cred.key.kid} from {cred.userId}</span>

              <NarButton
                leftIcon={<FontAwesomeIcon icon={faTrash} />}
                onClick={() => setEntities(EntityUtil.removeCredentialById(entities, cred.id))}
              />
            </div>
          ))}

          <div className="flex">
            <p className="text-xl mr-8">Accounts</p>

            <NarDialog
              triggerButton={<NarButton label="Add" leftIcon={<FontAwesomeIcon icon={faPlus} />} />}
              title="Add Account"
              primaryButtonLabel={"Add"}
              isOpen={isAccountDialogOpen}
              onOpenChange={setAccountDialogOpen}
              onDismiss={() => {
                setAccountDialogOpen(false)
                setAccount(undefined)
              }}
              onSave={() => {
                setEntities((prev) => account ? { ...prev, accounts: [...prev.accounts, account] } : prev)
                setAccountDialogOpen(false)
                setAccount(undefined)
              }}
            >
              <div className="w-[650px] px-12 py-4">
                <AccountForm setAccount={setAccount} account={account} />
              </div>
            </NarDialog>
          </div>

          {entities.accounts.map((acc) => (
            <div className="flex items-center" key={acc.id}>
              <span>{acc.address}</span>
              <NarButton
                leftIcon={<FontAwesomeIcon icon={faTrash} />}
                onClick={() => setEntities(EntityUtil.removeAccountById(entities, acc.id))}
              />
            </div>
          ))}

        </>
      )}


    </div>
  )
}
