'use client'

import useDataStoreApi from '../../_hooks/useDataStoreApi'
import {
  faCode,
  faEdit,
  faFileSignature,
  faIdBadge,
  faKey,
  faList,
  faPlus,
  faRotateRight,
  faSpinner,
  faTrash,
  faUpload,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NarButton from '../../_design-system/NarButton'
import { useEffect, useState } from 'react'
import { AccountEntity, AccountType, CredentialEntity, Entities, EntityUtil, UserEntity } from '@narval/policy-engine-shared'
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

enum View {
  JSON,
  LIST,
}

const getUserRoleBadgeColor = (role: string): string => {
  const colors: Record<string, string> = {
    'root': 'text-nv-black bg-nv-red-400',
    'admin': 'text-nv-black bg-nv-yellow-400',
    'manager': 'text-nv-black bg-nv-blue-400',
    'member': 'text-nv-black bg-nv-green-400',

  }

  return colors[role] ? colors[role] : 'text-nv-black bg-nv-white'
};

const getAccountTypeColor = (accountType: AccountType): string => {
  const colors: Record<AccountType, string> = {
    [AccountType.AA]: 'text-nv-black bg-nv-green-400',
    [AccountType.EOA]: 'text-nv-black bg-nv-blue-400'
  }

  return colors[accountType] ? colors[accountType] : 'text-nv-black bg-nv-white'
};

const getChainId = (chainId: number): string => {
  const chains: Record<number, string> = {
    1: "Ethereum Mainnet",
    3: "Ropsten Testnet",
    4: "Rinkeby Testnet",
    5: "Goerli Testnet",
    42: "Kovan Testnet",
    56: "Binance Smart Chain Mainnet",
    97: "Binance Smart Chain Testnet",
    137: "Polygon Mainnet",
    80001: "Mumbai Testnet (Polygon)",
    43113: "Avalanche Fuji Testnet",
    43114: "Avalanche Mainnet",
    250: "Fantom Opera",
    4002: "Fantom Testnet",
    42161: "Arbitrum One",
    421611: "Arbitrum Testnet",
    10: "Optimism Mainnet",
    69: "Optimism Kovan Testnet"
  }

  return chains[chainId] ? chains[chainId] : `Chain ID: ${chainId}`
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
              <p className="text-xl text-semibold grow">Users</p>

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

            {entities.users.length === 0 && (
              <EmptyState
                title="No users found"
                description="Add users and credentials to operate accounts."
                icon={faUsers}
              />
            )}

            <ul className="flex flex-col gap-4 mb-6">
              {entities.users.map((user) => (
                <li key={user.id} className="relative flex items-center h-16 px-6 bg-nv-neutrals-500 rounded-2xl" >
                  <div className="flex grow items-center gap-4">
                    <span className="w-[400px] truncate">{user.id}</span>
                    <span className={`flex items-center h-[24px] px-[12px] text-nv-2xs rounded-full ${getUserRoleBadgeColor(user.role)}`}>{capitalize(user.role)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <NarIconButton
                      icon={faEdit}
                      onClick={() => {
                        setUser(user)
                        setCredential(undefined)
                        setEditUserDialogOpen(true)
                      }}
                    />

                    <NarIconButton
                      icon={faTrash}
                      onClick={() => setEntities(EntityUtil.removeUserById(entities, user.id))}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-nv-neutrals-900 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-6">
              <p className="text-xl text-semibold grow">Credentials</p>

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
                <li key={cred.id} className="relative flex items-center h-16 px-6 bg-nv-neutrals-500 rounded-2xl" >
                  <div className="flex grow items-center gap-4">
                    <span className="w-[400px] truncate text-ellipsis">{cred.id}</span>
                    <span className="w-12 text-white/50">from</span>
                    <span>{cred.userId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <NarIconButton
                      icon={faTrash}
                      onClick={() => setEntities(EntityUtil.removeCredentialById(entities, cred.id))}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-nv-neutrals-900 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-6">
              <p className="text-xl text-semibold grow">Accounts</p>

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
                icon={faKey}
              />
            )}

            <ul className="flex flex-col gap-4">
              {entities.accounts.map((acc) => (
                <li key={acc.id} className="relative flex items-center h-16 px-6 bg-nv-neutrals-500 rounded-2xl" >
                  <div className="flex grow items-center gap-4">
                    <span className="w-[400px] truncate">{acc.address}</span>
                    <span className={`flex items-center h-[24px] px-[12px] text-nv-2xs rounded-full ${getAccountTypeColor(acc.accountType)}`}>
                      {acc.accountType === AccountType.EOA ? 'EOA' : 'Smart Account'}
                    </span>
                    {acc.chainId && (
                      <span className="text-white/50">{getChainId(acc.chainId)}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <NarIconButton
                      icon={faTrash}
                      onClick={() => setEntities(EntityUtil.removeAccountById(entities, acc.id))}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )
      }
    </div >
  )
}
