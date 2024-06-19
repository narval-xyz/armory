'use client'

import { faUpload, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Address, Namespace, UserWalletEntity, WalletEntity, toAccountId } from '@narval/policy-engine-shared'
import { groupBy } from 'lodash'
import { FC, useMemo, useState } from 'react'
import NarButton from '../../../_design-system/NarButton'
import NarDialog from '../../../_design-system/NarDialog'
import useStore from '../../../_hooks/useStore'
import useVaultApi from '../../../_hooks/useVaultApi'
import ImportWalletForm from '../forms/ImportWalletForm'
import WalletForm from '../forms/WalletForm'
import DataCard from '../layouts/DataCard'
import DataSection from '../layouts/DataSection'

const initWalletFormState = {
  id: '',
  address: '',
  accountType: '',
  chainId: ''
} as unknown as WalletEntity

interface WalletsProps {
  wallets: WalletEntity[] | undefined
  userWallets: UserWalletEntity[] | undefined
  onChange: (wallets: WalletEntity[]) => void
}

const Wallets: FC<WalletsProps> = ({ wallets, userWallets, onChange }) => {
  const { vaultUrl, vaultClientId } = useStore()
  const { importPk } = useVaultApi()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportForm, setIsImportForm] = useState(false)
  const [isWalletForm, setIsWalletForm] = useState(false)
  const [walletData, setWalletData] = useState<WalletEntity>(initWalletFormState)
  const [privateKey, setPrivateKey] = useState('')

  const walletAssignees = groupBy(userWallets, 'walletId')

  const dialogTitle = useMemo(() => {
    if (isImportForm) return 'Import Wallet'
    if (isWalletForm) return walletData?.id ? 'Edit Wallet' : 'Create Wallet'
    return ''
  }, [isImportForm, isWalletForm, walletData])

  const dialogPrimaryButtonLabel = useMemo(() => {
    if (isImportForm) return 'Import'
    if (isWalletForm) return walletData?.id ? 'Edit' : 'Create'
    return ''
  }, [isImportForm, isWalletForm, walletData])

  const closeDialog = () => {
    setIsDialogOpen(false)
    setIsImportForm(false)
    setIsWalletForm(false)
    setWalletData(initWalletFormState)
    setPrivateKey('')
  }

  const openImportDialog = () => {
    setIsImportForm(true)
    setIsDialogOpen(true)
  }

  const openWalletDialog = (wallet?: WalletEntity) => {
    if (wallet) {
      setWalletData(wallet)
    }
    setIsWalletForm(true)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!walletData) return
    const newWallets = wallets ? [...wallets] : []
    const index = newWallets.findIndex((w) => w.address === walletData.address)
    if (index !== -1) {
      console.log('Wallet already exists')
      return
    }
    let id = ''
    if (walletData.chainId) {
      id = toAccountId({ ...walletData, chainId: Number(walletData.chainId) })
    } else if (walletData.accountType === 'eoa') {
      id = `${Namespace.EIP155}:eoa:${walletData.address}`
    } else {
      id = walletData.address as string
    }
    newWallets.push({ ...walletData, id })
    onChange(newWallets)
  }

  const handleEdit = () => {
    if (!wallets || !walletData) return
    const newWallets = wallets ? [...wallets] : []
    const index = newWallets.findIndex((w) => w.id === walletData.id)
    if (index === -1) return
    newWallets[index] = walletData
    onChange(newWallets)
  }

  const handleDelete = (id: string) => {
    if (!wallets) return
    onChange(wallets.filter((wallet) => wallet.id !== id))
  }

  // const handleImport = async (accesToken: string) => {
  //   const wallet = await importPk({ privateKey, accesToken })
  //   if (!wallet) return
  //   const newWallets = wallets ? [...wallets] : []
  //   newWallets.push({ ...wallet, address: wallet.address.toLowerCase() as Address, accountType: 'eoa' })
  //   onChange(newWallets)
  // }

  const onSaveDialog = async () => {
    if (isWalletForm) {
      walletData?.id ? handleEdit() : handleSave()
    }

    // if (isImportForm) {
    //   await handleImport()
    // }

    closeDialog()
  }

  return (
    <>
      <DataSection
        name="wallets"
        data={wallets}
        buttons={
          <NarButton
            variant="tertiary"
            label="Import"
            leftIcon={<FontAwesomeIcon icon={faUpload} />}
            onClick={openImportDialog}
          />
        }
        onCreate={() => openWalletDialog()}
      >
        {wallets?.map((wallet) => (
          <DataCard
            key={wallet.id}
            buttons={<FontAwesomeIcon className="cursor-pointer" icon={faUserPlus} />}
            onEdit={() => openWalletDialog(wallet)}
            onDelete={() => handleDelete(wallet.id)}
          >
            <p>{wallet.address}</p>
            {walletAssignees[wallet.id]?.length > 0 && <p>{walletAssignees[wallet.id].length} assignee</p>}
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
            {isWalletForm && <WalletForm wallet={walletData} setWallet={setWalletData} />}
          </div>
        </NarDialog>
      )}
    </>
  )
}

export default Wallets
