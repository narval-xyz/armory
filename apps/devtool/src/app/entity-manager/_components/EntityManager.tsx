'use client'

import {
  faCode,
  faCogs,
  faDatabase,
  faDotCircle,
  faIdBadge,
  faRotateRight,
  faShield,
  faSpinner,
  faUpload,
  faUsers,
  faWallet,
  faXmarkCircle
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  AccountEntity,
  CredentialEntity,
  Entities,
  EntityUtil,
  UserAccountEntity,
  UserEntity,
  hash
} from '@narval/armory-sdk'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import CodeEditor from '../../_components/CodeEditor'
import AuthConfigModal, { ConfigForm } from '../../_components/modals/AuthConfigModal'
import NarButton from '../../_design-system/NarButton'
import NarCollapsible from '../../_design-system/NarCollapsible'
import NarDialog from '../../_design-system/NarDialog'
import useDataStoreApi from '../../_hooks/useDataStoreApi'
import useStore from '../../_hooks/useStore'
import { extractErrorMessage } from '../../_lib/utils'
import DataEditor from '../../data-store/_components/DataEditor'
import Card from './Card'
import EmptyState from './EmptyState'
import Info from './Info'
import Message from './Message'
import AccountCard from './cards/AccountCard'
import CredentialCard from './cards/CredentialCard'
import UserCard from './cards/UserCard'
import DeriveAccountsDialog from './dialogs/DeriveAccountDialog'
import GenerateWalletDialog from './dialogs/GenerateWalletDialog'
import ImportKeyDialog from './dialogs/ImportKeyDialog'
import AccountForm from './forms/AccountForm'
import AssignAccountForm from './forms/AssignAccountForm'
import CredentialForm from './forms/CredentialForm'
import UserForm from './forms/UserForm'

enum View {
  ENTITY,
  ENTITY_JSON,
  POLICY_JSON
}

const Ready = z.object({
  authUrl: z.string().url(),
  authClientId: z.string().min(1),
  vaultUrl: z.string().url(),
  vaultClientId: z.string().min(1)
})

export default function EntityManager() {
  const {
    setEntityDataStoreUrl,
    setPolicyDataStoreUrl,
    authClientId,
    authUrl,
    vaultUrl,
    vaultClientId,
    policyDataStoreUrl
  } = useStore()

  const {
    entityStore,
    policyStore,
    processingStatus: {
      isFetchingEntity,
      isFetchingPolicy,
      isSigningPolicy,
      isSigningAndPushingEntity,
      isSigningAndPushingPolicy,
      policyFetchError
    },
    getEntityStore,
    getPolicyStore,
    policyError,
    signPolicyData,
    signAndPushEntity,
    signAndPushPolicy
  } = useDataStoreApi()

  const [view, setView] = useState(View.ENTITY)
  const [entities, setEntities] = useState<Entities>(EntityUtil.empty())
  const [errors, setErrors] = useState<string[]>([])

  const [entityStoreHash, setEntityStoreHash] = useState('')

  const [user, setUser] = useState<UserEntity | undefined>()
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setEditUserDialogOpen] = useState(false)

  const [userAccounts, setUserAccounts] = useState<UserAccountEntity[]>([])
  const [isAssignAccountDialogOpen, setAssignAccountDialogOpen] = useState(false)

  const [credential, setCredential] = useState<CredentialEntity | undefined>()
  const [isAddCredentialDialogOpen, setAddCredentialDialogOpen] = useState(false)

  const [account, setAccount] = useState<AccountEntity | undefined>()
  const [isAccountDialogOpen, setAccountDialogOpen] = useState(false)

  const [isInitialized, setInitialized] = useState(false)

  const isReady = () => isInitialized && Ready.safeParse({ authClientId, authUrl, vaultUrl, vaultClientId }).success

  const signAndPushEntityWithErrorHandling = async () => {
    try {
      await signAndPushEntity(entities)
    } catch (error) {
      setErrors([extractErrorMessage(error)])
    }
  }

  const onSaveAuthConfig = (config: ConfigForm) => {
    setEntityDataStoreUrl(`${config.authUrl}/entities?clientId=${config.authClientId}`)
    setPolicyDataStoreUrl(`${config.authUrl}/policies?clientId=${config.authClientId}`)
  }

  // This is needed to ensure we aren't `ready` before the component is
  // mounted, otherwise you get a SSR hyrdation mis-match because `useStore` is
  // coming from localstorage.
  useEffect(() => {
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (entityStore) {
      setEntities(entityStore.data)
      setEntityStoreHash(hash(entityStore.data))
    }
  }, [entityStore, setEntities])

  if (!isReady()) {
    return (
      <EmptyState
        icon={faCogs}
        title="DevTool setup required"
        description="It looks like DevTool isn't set up yet. Click the button below to configure it now and get started."
      >
        <AuthConfigModal onSave={onSaveAuthConfig} />
      </EmptyState>
    )
  }

  return (
    <div className="h-full">
      <div className="flex items-center mb-12">
        <div className="flex grow gap-2">
          <NarButton
            variant={view === View.ENTITY ? 'primary' : 'secondary'}
            leftIcon={<FontAwesomeIcon icon={faDatabase} />}
            label="Entity"
            onClick={() => setView(View.ENTITY)}
          />

          <NarButton
            variant={view === View.POLICY_JSON ? 'primary' : 'secondary'}
            leftIcon={<FontAwesomeIcon icon={faShield} />}
            label="Policy"
            onClick={() => setView(View.POLICY_JSON)}
          />
        </div>
        <div className="flex gap-2">
          {(view === View.ENTITY || view === View.ENTITY_JSON) && (
            <>
              <NarButton
                variant={view === View.ENTITY_JSON ? 'primary' : 'secondary'}
                leftIcon={<FontAwesomeIcon icon={faCode} />}
                label="JSON"
                onClick={() => setView(View.ENTITY_JSON)}
              />

              <NarButton
                variant="secondary"
                label="Fetch"
                leftIcon={
                  <FontAwesomeIcon icon={isFetchingEntity ? faSpinner : faRotateRight} spin={isFetchingEntity} />
                }
                onClick={getEntityStore}
                disabled={isFetchingEntity}
              />

              <NarButton
                variant="secondary"
                label="Sign & Push"
                leftIcon={
                  <FontAwesomeIcon
                    icon={isSigningAndPushingEntity ? faSpinner : faUpload}
                    spin={isSigningAndPushingEntity}
                  />
                }
                disabled={isSigningAndPushingEntity}
                onClick={() => signAndPushEntityWithErrorHandling()}
              />

              <GenerateWalletDialog setEntities={setEntities} />
            </>
          )}
          <AuthConfigModal onSave={onSaveAuthConfig} />
        </div>
      </div>

      {isFetchingEntity && <div>Loading...</div>}

      {!isFetchingEntity && (
        <>
          {errors.length > 0 && (
            <Message icon={faXmarkCircle} color="danger" className="mb-6">
              {errors.join(', ')}
            </Message>
          )}

          {entityStoreHash !== hash(entities) && (
            <Message icon={faDotCircle} color="warning" className="mb-6">
              You have unpushed changes. Sign & Push before you leave the application.
            </Message>
          )}

          {view === View.ENTITY_JSON && (
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

          {view === View.ENTITY && (
            <>
              <div className="bg-nv-neutrals-900 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-6">
                  <div className="flex items-center gap-2 text-xl text-semibold grow">
                    <FontAwesomeIcon icon={faWallet} />
                    <h2>Accounts</h2>
                  </div>

                  <div className="flex gap-6">
                    <ImportKeyDialog setEntities={setEntities} />
                    <DeriveAccountsDialog setEntities={setEntities} />
                    <NarDialog
                      triggerButton={<NarButton label="Track" />}
                      title="Track Account"
                      primaryButtonLabel={'Track'}
                      isOpen={isAccountDialogOpen}
                      onOpenChange={setAccountDialogOpen}
                      onDismiss={() => {
                        setAccountDialogOpen(false)
                        setAccount(undefined)
                      }}
                      onSave={() => {
                        setEntities((prev) => (account ? { ...prev, accounts: [...prev.accounts, account] } : prev))
                        setAccountDialogOpen(false)
                        setAccount(undefined)
                      }}
                    >
                      <div className="w-[650px] px-12 py-4">
                        <AccountForm setAccount={setAccount} account={account} />
                        <Info text="Use to track existing accounts within Narval." />
                      </div>
                    </NarDialog>
                  </div>
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
                      <Card>
                        <AccountCard
                          account={acc}
                          onDeleteClick={() => setEntities(EntityUtil.removeAccountById(entities, acc.id))}
                        />
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-nv-neutrals-900 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-6">
                  <div className="flex items-center gap-2 text-xl text-semibold grow">
                    <FontAwesomeIcon icon={faUsers} />
                    <h2>Users</h2>
                  </div>

                  <NarDialog
                    triggerButton={<NarButton label="Add" />}
                    title="Add User"
                    primaryButtonLabel={'Add'}
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
                          credentials: credential ? [...(prev?.credentials || []), credential] : prev?.credentials
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
                    const accounts = EntityUtil.getUserAssignedAccounts(entities, user)

                    return (
                      <li key={user.id}>
                        <UserCard
                          user={user}
                          nbAccounts={accounts.length}
                          nbCredentials={credentials.length}
                          onAssignAccountClick={() => {
                            setUser(user)
                            setAssignAccountDialogOpen(true)
                          }}
                          onAddCredentialClick={() => {
                            setUser(user)
                            setCredential(undefined)
                            setAddCredentialDialogOpen(true)
                          }}
                          onEditClick={() => {
                            setUser(user)
                            setCredential(undefined)
                            setEditUserDialogOpen(true)
                          }}
                          onDeleteClick={() => setEntities(EntityUtil.removeUserById(entities, user.id))}
                        >
                          <div className="flex flex-col gap-4 mt-4">
                            {accounts.length > 0 && (
                              <div className="pl-8 flex items-center">
                                <NarCollapsible icon={faWallet} title={`${accounts.length} Accounts`}>
                                  <ul className="w-full">
                                    {EntityUtil.getUserAssignedAccounts(entities, user).map((acc) => (
                                      <li
                                        key={`${user.id}-${acc.id}`}
                                        className="first:pt-0 last:pb-0 last:border-b-0 py-4 border-b-2 border-nv-black"
                                      >
                                        <AccountCard
                                          account={acc}
                                          onUnassignClick={() => {
                                            const existingUserAccounts = EntityUtil.getUserAccounts(entities, user)
                                            const updatedUserAccounts = existingUserAccounts.filter(
                                              (ua) => ua.accountId !== acc.id && ua.userId === user.id
                                            )

                                            setEntities(
                                              EntityUtil.updateUserAccounts(entities, user, updatedUserAccounts)
                                            )
                                          }}
                                        />
                                      </li>
                                    ))}
                                  </ul>
                                </NarCollapsible>
                              </div>
                            )}
                            {credentials.length > 0 && (
                              <div className="pl-8 flex items-center">
                                <NarCollapsible icon={faIdBadge} title={`${credentials.length} Credentials`}>
                                  <ul className="w-full">
                                    {credentials.map((cred) => (
                                      <li
                                        key={`${user.id}-${cred.id}`}
                                        className="first:pt-0 last:pb-0 last:border-b-0 py-4 border-b-2 border-nv-black"
                                      >
                                        <CredentialCard
                                          credential={cred}
                                          onDeleteClick={() =>
                                            setEntities(EntityUtil.removeCredentialById(entities, cred.id))
                                          }
                                        />
                                      </li>
                                    ))}
                                  </ul>
                                </NarCollapsible>
                              </div>
                            )}
                          </div>
                        </UserCard>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </>
          )}

          {view === View.POLICY_JSON && (
            <DataEditor
              data={policyStore}
              url={policyDataStoreUrl}
              isFetching={isFetchingPolicy}
              isSigning={isSigningPolicy}
              isSigningAndPushing={isSigningAndPushingPolicy}
              fetch={getPolicyStore}
              error={policyFetchError}
              errorMessage={policyError}
              setUrl={setPolicyDataStoreUrl}
              sign={signPolicyData}
              signAndPush={signAndPushPolicy}
            />
          )}

          {user && (
            <>
              <NarDialog
                triggerButton={null}
                title="Edit User"
                primaryButtonLabel={'Edit'}
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
                primaryButtonLabel={'Assign'}
                isOpen={isAssignAccountDialogOpen}
                onOpenChange={setAssignAccountDialogOpen}
                onDismiss={() => {
                  setAssignAccountDialogOpen(false)
                  setUser(undefined)
                }}
                onSave={() => {
                  setEntities(EntityUtil.updateUserAccounts(entities, user, userAccounts))
                  setAssignAccountDialogOpen(false)
                  setUser(undefined)
                }}
              >
                <div className="w-[650px] px-12 py-4">
                  {entities.accounts.length === 0 && (
                    <div className="flex justify-items-center flex-col">
                      <span>{"You haven't added or imported any account yet."}</span>
                      <div className="flex text-center items-center gap-6 mt-6">
                        <ImportKeyDialog
                          triggerButton={<NarButton label="Import Account" variant="tertiary" />}
                          setEntities={setEntities}
                        />
                        <span>or</span>
                        <NarButton
                          label="Add Account"
                          variant="tertiary"
                          onClick={() => {
                            setAssignAccountDialogOpen(false)
                            setAccountDialogOpen(true)
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {entities.accounts.length > 0 && (
                    <AssignAccountForm
                      setUserAccounts={setUserAccounts}
                      user={user}
                      userAccounts={EntityUtil.getUserAssignedAccounts(entities, user)}
                      accounts={entities.accounts}
                    />
                  )}
                </div>
              </NarDialog>

              <NarDialog
                triggerButton={null}
                title="Add Credential"
                primaryButtonLabel={'Add'}
                isOpen={isAddCredentialDialogOpen}
                onOpenChange={setAddCredentialDialogOpen}
                onDismiss={() => {
                  setAddCredentialDialogOpen(false)
                  setCredential(undefined)
                }}
                onSave={() => {
                  setEntities((prev) =>
                    credential ? { ...prev, credentials: [...prev.credentials, credential] } : prev
                  )
                  setAddCredentialDialogOpen(false)
                  setCredential(undefined)
                }}
              >
                <div className="w-[650px] px-12 py-4">
                  <CredentialForm user={user} setCredential={setCredential} credential={credential} />
                </div>
              </NarDialog>
            </>
          )}
        </>
      )}
    </div>
  )
}
