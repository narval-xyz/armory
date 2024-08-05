'use client'

import { faUpload, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AccountEntity, Namespace, UserAccountEntity, toChainAccountId } from '@narval/policy-engine-shared'
import { groupBy } from 'lodash'
import { FC, useMemo, useState } from 'react'
import NarButton from '../../../_design-system/NarButton'
import NarDialog from '../../../_design-system/NarDialog'
import AccountForm from '../forms/AccountForm'
import ImportWalletForm from '../forms/ImportWalletForm'
import DataCard from '../layouts/DataCard'
import DataSection from '../layouts/DataSection'

const initAccountFormState = {
  id: '',
  address: '',
  accountType: '',
  chainId: ''
} as unknown as AccountEntity

interface WalletsProps {
  accounts: AccountEntity[] | undefined
  userAccounts: UserAccountEntity[] | undefined
  onChange: (wallets: AccountEntity[]) => void
}

const Accounts: FC<WalletsProps> = ({ accounts, userAccounts, onChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportForm, setIsImportForm] = useState(false)
  const [isAccountForm, setIsAccountForm] = useState(false)
  const [accountData, setAccountData] = useState<AccountEntity>(initAccountFormState)
  const [privateKey, setPrivateKey] = useState('')

  const accountAssignees = groupBy(userAccounts, 'accountId')

  const dialogTitle = useMemo(() => {
    if (isImportForm) return 'Import Wallet'
    if (isAccountForm) return accountData?.id ? 'Edit Account' : 'Create Account'
    return ''
  }, [isImportForm, isAccountForm, accountData])

  const dialogPrimaryButtonLabel = useMemo(() => {
    if (isImportForm) return 'Import'
    if (isAccountForm) return accountData?.id ? 'Edit' : 'Create'
    return ''
  }, [isImportForm, isAccountForm, accountData])

  const closeDialog = () => {
    setIsDialogOpen(false)
    setIsImportForm(false)
    setIsAccountForm(false)
    setAccountData(initAccountFormState)
    setPrivateKey('')
  }

  const openImportDialog = () => {
    setIsImportForm(true)
    setIsDialogOpen(true)
  }

  const openAccountDialog = (wallet?: AccountEntity) => {
    if (wallet) {
      setAccountData(wallet)
    }
    setIsAccountForm(true)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!accountData) return
    const newAccounts = accounts ? [...accounts] : []
    const index = newAccounts.findIndex((w) => w.address === accountData.address)
    if (index !== -1) {
      console.log('Account already exists')
      return
    }
    let id = ''
    if (accountData.chainId) {
      id = toChainAccountId({ ...accountData, chainId: Number(accountData.chainId) })
    } else if (accountData.accountType === 'eoa') {
      id = `${Namespace.EIP155}:eoa:${accountData.address}`
    } else {
      id = accountData.address as string
    }
    newAccounts.push({ ...accountData, id })
    onChange(newAccounts)
  }

  const handleEdit = () => {
    if (!accounts || !accountData) return
    const newAccounts = accounts ? [...accounts] : []
    const index = newAccounts.findIndex((w) => w.id === accountData.id)
    if (index === -1) return
    newAccounts[index] = accountData
    onChange(newAccounts)
  }

  const handleDelete = (id: string) => {
    if (!accounts) return
    onChange(accounts.filter((account) => account.id !== id))
  }

  // const handleImport = async (accesToken: string) => {
  //   const account = await importPk({ privateKey, accesToken })
  //   if (!account) return
  //   const newAccounts = accounts ? [...accounts] : []
  //   newAccounts.push({ ...account, address: account.address.toLowerCase() as Address, accountType: 'eoa' })
  //   onChange(newAccounts)
  // }

  const onSaveDialog = async () => {
    if (isAccountForm) {
      accountData?.id ? handleEdit() : handleSave()
    }

    // if (isImportForm) {
    //   await handleImport()
    // }

    closeDialog()
  }

  return (
    <>
      <DataSection
        name="accounts"
        data={accounts}
        buttons={
          <NarButton
            variant="tertiary"
            label="Import"
            leftIcon={<FontAwesomeIcon icon={faUpload} />}
            onClick={openImportDialog}
          />
        }
        onCreate={() => openAccountDialog()}
      >
        {accounts?.map((account) => (
          <DataCard
            key={account.id}
            buttons={<FontAwesomeIcon className="cursor-pointer" icon={faUserPlus} />}
            onEdit={() => openAccountDialog(account)}
            onDelete={() => handleDelete(account.id)}
          >
            <p>{account.address}</p>
            {accountAssignees[account.id]?.length > 0 && <p>{accountAssignees[account.id].length} assignee</p>}
          </DataCard>
        ))}
      </DataSection>
      {isDialogOpen && (
        <NarDialog
          triggerButton={null}
          title={dialogTitle}
          primaryButtonLabel={dialogPrimaryButtonLabel}
          isOpen={isDialogOpen}
          onOpenChange={(val) => (val ? setIsDialogOpen(val) : closeDialog())}
          onDismiss={closeDialog}
          onSave={onSaveDialog}
        >
          <div className="w-[650px] px-12 py-4">
            {isImportForm && <ImportWalletForm privateKey={privateKey} setPrivateKey={setPrivateKey} />}
            {isAccountForm && <AccountForm account={accountData} setAccount={setAccountData} />}
          </div>
        </NarDialog>
      )}
    </>
  )
}

export default Accounts
