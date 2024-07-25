'use client'

import useDataStoreApi from '../../_hooks/useDataStoreApi'
import {
  faCode,
  faEdit,
  faFileSignature,
  faHockeyPuck,
  faIdBadge,
  faKey,
  faLink,
  faList,
  faPlus,
  faRotateRight,
  faSpinner,
  faTrash,
  faUpload,
  faUsers,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NarButton from '../../_design-system/NarButton'
import { useEffect, useState } from 'react'
import { AccountEntity, AccountType, CredentialEntity, Entities, EntityUtil, UserAccountEntity, UserEntity } from '@narval/policy-engine-shared'
import AccountForm from './AccountForm'
import NarDialog from '../../_design-system/NarDialog'
import CredentialForm from './CredentialForm'
import UserForm from './UserForm'
import CodeEditor from '../../_components/CodeEditor'
import DataStoreConfigModal from '../../_components/modals/DataStoreConfigModal'
import NarIconButton from '../../_design-system/NarIconButton'
import { capitalize } from 'lodash'
import EmptyState from './EmptyState'
import ErrorStatus from '../../_components/ErrorStatus'
import AssignAccountForm from './AssignAccountForm'
import AccountCard from './AccountCard'
import CredentialCard from './CredentialCard'
import UserCard from './UserCard'

enum View {
  JSON,
  LIST,
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

  const [view, setView] = useState(View.LIST)
  const [entities, setEntities] = useState<Entities>(EntityUtil.empty())
  const [errors, setErrors] = useState<string[]>([])

  const [user, setUser] = useState<UserEntity | undefined>()
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setEditUserDialogOpen] = useState(false)

  const [userAccount, setUserAccount] = useState<UserAccountEntity | undefined>()
  const [isAssignAccountDialogOpen, setAssignAccountDialogOpen] = useState(false)

  const [credential, setCredential] = useState<CredentialEntity | undefined>()
  const [isAddCredentialDialogOpen, setAddCredentialDialogOpen] = useState(false)

  const [isAccountDialogOpen, setAccountDialogOpen] = useState(false)
  const [account, setAccount] = useState<AccountEntity | undefined>()

  useEffect(() => {
    if (entityStore) {
      setEntities(entityStore.data)
    }
  }, [entityStore, setEntities])

  console.log(JSON.stringify(user))

  return (
    <div className="h-full">
      <div className="flex items-center mb-12">
        <div className="flex grow gap-2">
          <NarButton
            variant={view === View.LIST ? 'primary' : 'secondary'}
            leftIcon={<FontAwesomeIcon icon={faList} />}
            label="List"
            onClick={() => setView(View.LIST)}
          />

          <NarButton
            variant={view === View.JSON ? 'primary' : 'secondary'}
            leftIcon={<FontAwesomeIcon icon={faCode} />}
            label="JSON"
            onClick={() => setView(View.JSON)}
          />
        </div>

        <div className="flex gap-2">
          <NarButton
            variant="secondary"
            label="Fetch"
            leftIcon={<FontAwesomeIcon icon={isFetchingEntity ? faSpinner : faRotateRight} spin={isFetchingEntity} />}
            onClick={getEntityStore}
            disabled={isFetchingEntity}
          />

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

          <DataStoreConfigModal />
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-nv-neutrals-900 rounded-xl p-6 mb-6">
          <ErrorStatus label={errors.join(', ')} />
        </div>
      )}

      {view === View.JSON && (
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

      {view === View.LIST && (
        <>
          <div className="bg-nv-neutrals-900 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="flex items-center gap-2 text-xl text-semibold grow">
                <FontAwesomeIcon icon={faUsers} />
                <h2>Users</h2>
              </div>

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
                  setErrors([])

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

                    setErrors(result.issues.map((issue) => issue.message))

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
            </div>

            {entities.users.length === 0 && (
              <EmptyState
                title="No users found"
                description="Add users and credentials to operate accounts."
                icon={faUsers}
              />
            )}

            <ul className="flex flex-col gap-4 mb-6">
              {entities.users.map((user) => {
                const credentials = EntityUtil.getUserCredentials(entities, user)
                const accounts = EntityUtil.getUserAccounts(entities, user)

                return (
                  <li key={user.id}>
                    <UserCard
                      user={user}
                      onAssignAccountClick={() => {
                        setUser(user)
                        setAssignAccountDialogOpen(true)
                      }}

                      onEditClick={() => {
                        setUser(user)
                        setCredential(undefined)
                        setEditUserDialogOpen(true)
                      }}
                      onDeleteClick={() => setEntities(EntityUtil.removeUserById(entities, user.id))}
                    />

                    {accounts.length > 0 && (
                      <>
                        <div className="pl-8 flex items-center gap-2 text-lg text-semibold grow my-4">
                          <FontAwesomeIcon icon={faWallet} />
                          <h2>Accounts</h2>
                        </div>

                        <ul>
                          {EntityUtil.getUserAccounts(entities, user).map((acc) => (
                            <li key={`${user.id}-${acc.id}`} className="flex flex-col pl-8 mb-4">
                              <AccountCard
                                account={acc}
                                onDeleteClick={() => setEntities(EntityUtil.removeAccountById(entities, acc.id))}
                              />
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {credentials.length > 0 && (
                      <>
                        <div className="pl-8 flex items-center gap-2 text-lg text-semibold grow my-4">
                          <FontAwesomeIcon icon={faIdBadge} />
                          <h2>Credentials</h2>
                        </div>

                        <ul>
                          {credentials.map((cred) => (
                            <li key={`${user.id}-${cred.id}`} className="flex flex-col pl-8 mb-4">
                              <CredentialCard
                                credential={cred}
                                onDeleteClick={() => setEntities(EntityUtil.removeCredentialById(entities, cred.id))}
                              />
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="bg-nv-neutrals-900 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="flex items-center gap-2 text-xl text-semibold grow">
                <FontAwesomeIcon icon={faWallet} />
                <h2>Accounts</h2>
              </div>

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

            {entities.accounts.length === 0 && (
              <EmptyState
                title="No accounts found"
                description="You haven't added or imported any account yet."
                icon={faWallet}
              />
            )}

            <ul className="flex flex-col gap-4">
              {entities.accounts.map((acc) => (
                <li key={acc.id}>
                  <AccountCard
                    account={acc}
                    onDeleteClick={() => setEntities(EntityUtil.removeAccountById(entities, acc.id))}
                  />
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="bg-nv-neutrals-900 rounded-xl p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="flex items-center gap-2 text-xl text-semibold grow">
            <FontAwesomeIcon icon={faIdBadge} />
            <h2>Credentials</h2>
          </div>

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

        {entities.credentials.length === 0 && (
          <EmptyState
            title="No credentials found"
            description="Add credentials to allow users to authenticate."
            icon={faIdBadge}
          />
        )}

        <ul className="flex flex-col gap-4 mb-6">
          {entities.credentials.map((cred) => (
            <li key={cred.id}>
              <CredentialCard
                credential={cred}
                onDeleteClick={() => setEntities(EntityUtil.removeCredentialById(entities, cred.id))}
              />
            </li>
          ))}
        </ul>
      </div>

      {user && (
        <>
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
                const newEntities = EntityUtil.updateUser(prev, user)

                const result = EntityUtil.validate(newEntities)

                if (result.success) {
                  return newEntities
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

          <NarDialog
            triggerButton={null}
            title="Assign Account"
            primaryButtonLabel={"Assign"}
            isOpen={isAssignAccountDialogOpen}
            onOpenChange={setAssignAccountDialogOpen}
            onDismiss={() => {
              setAssignAccountDialogOpen(false)
              setUser(undefined)
            }}
            onSave={() => {
              setEntities({
                ...entities,
                userAccounts: userAccount ? [...entities.userAccounts, userAccount] : entities.userAccounts
              })
              setAssignAccountDialogOpen(false)
              setUser(undefined)
            }}
          >
            <div className="w-[650px] px-12 py-4">
              <AssignAccountForm
                setUserAccount={setUserAccount}
                user={user}
                userAccounts={EntityUtil.getUserAccounts(entities, user)}
                accounts={entities.accounts}
              />
            </div>
          </NarDialog>
        </>
      )}
    </div>
  )
}
