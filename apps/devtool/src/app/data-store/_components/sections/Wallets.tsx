'use client'

import { Namespace, WalletEntity, toAccountId } from '@narval/policy-engine-shared'
import { FC, useState } from 'react'
import NarDialog from '../../../_design-system/NarDialog'
import WalletForm from '../forms/WalletForm'
import DataCard from '../layouts/DataCard'
import DataSection from '../layouts/DataSection'

interface WalletsProps {
  wallets: WalletEntity[] | undefined
  onChange: (wallets: WalletEntity[]) => void
}

const Wallets: FC<WalletsProps> = ({ wallets, onChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [walletForm, setWalletForm] = useState<WalletEntity>()

  const openDialog = (wallet?: WalletEntity) => {
    if (wallet) {
      setWalletForm(wallet)
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!walletForm) return
    const newWallets = wallets ? [...wallets] : []
    let id = walletForm.address as string
    if (walletForm.chainId) {
      id = toAccountId({ ...walletForm, chainId: Number(walletForm.chainId) })
    } else if (walletForm.accountType === 'eoa') {
      id = `${Namespace.EIP155}:eoa:${walletForm.address}`
    }
    newWallets.push({ ...walletForm, id })
    onChange(newWallets)
    setWalletForm(undefined)
    setIsDialogOpen(false)
  }

  const handleEdit = () => {
    if (!wallets || !walletForm) return
    const index = wallets.findIndex((w) => w.id === walletForm.id)
    if (index === -1) return
    wallets[index] = walletForm
    onChange(wallets)
    setWalletForm(undefined)
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!wallets) return
    onChange(wallets.filter((wallet) => wallet.id !== id))
  }

  return (
    <>
      <DataSection name="wallets" data={wallets} onClick={() => openDialog()}>
        {wallets?.map((wallet) => (
          <DataCard key={wallet.id} onEdit={() => openDialog(wallet)} onDelete={() => handleDelete(wallet.id)}>
            <p>{wallet.address}</p>
          </DataCard>
        ))}
      </DataSection>
      {isDialogOpen && (
        <NarDialog
          triggerButton={null}
          title={walletForm?.id ? 'Edit Wallet' : 'Create Wallet'}
          primaryButtonLabel="Create"
          isOpen={isDialogOpen}
          onOpenChange={(open) => setIsDialogOpen(open)}
          onDismiss={() => setIsDialogOpen(false)}
          onSave={walletForm?.id ? handleEdit : handleSave}
        >
          <div className="w-[650px] px-12 py-4">
            <WalletForm wallet={walletForm} onChange={setWalletForm} />
          </div>
        </NarDialog>
      )}
    </>
  )
}

export default Wallets
