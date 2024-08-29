import {
  faChevronCircleDown,
  faChevronCircleUp,
  faEdit,
  faIdBadge,
  faTrash,
  faWallet
} from '@fortawesome/free-solid-svg-icons'
import { UserEntity } from '@narval/armory-sdk'
import * as Collapsible from '@radix-ui/react-collapsible'
import { capitalize } from 'lodash/fp'
import { useState } from 'react'
import NarIconButton from '../../../_design-system/NarIconButton'
import NarIconButtonWithTooltip from '../../../_design-system/NarIconButtonWithTooltip'
import Card from '../Card'

interface UserCardProps {
  user: UserEntity
  nbAccounts: number
  nbCredentials: number
  children: React.ReactNode
  onAssignAccountClick: () => void
  onAddCredentialClick: () => void
  onEditClick: () => void
  onDeleteClick: () => void
}

const getRoleBadgeColor = (role: string): string => {
  const colors: Record<string, string> = {
    root: 'text-nv-yellow-800 bg-nv-yellow-400'
  }

  return colors[role] ? colors[role] : 'text-nv-black bg-nv-white'
}

export default function UserCard({
  user,
  nbAccounts,
  nbCredentials,
  children,
  onAssignAccountClick,
  onAddCredentialClick,
  onEditClick,
  onDeleteClick
}: UserCardProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <div className="grid grid-cols-8 grow">
          <div className="col-span-2 truncate">{user.id}</div>
          <div className="col-span-6 flex items-center gap-8">
            <div className="w-[120px]">
              <div
                className={`flex items-center w-fit h-[24px] px-[12px] text-nv-2xs rounded-full ${getRoleBadgeColor(user.role)}`}
              >
                {capitalize(user.role)}
              </div>
            </div>
            <div className="w-[120px]">{nbAccounts} Accounts</div>
            <div className="w-[120px]">{nbCredentials} Credentials</div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <NarIconButtonWithTooltip icon={faWallet} onClick={onAssignAccountClick} alt="Assign accounts" />
            <NarIconButtonWithTooltip icon={faIdBadge} onClick={onAddCredentialClick} alt="Add credential" />
            <NarIconButtonWithTooltip icon={faEdit} onClick={onEditClick} alt="Edit user" />
            <NarIconButtonWithTooltip icon={faTrash} onClick={onDeleteClick} alt="Delete user" />
          </div>
          <Collapsible.Trigger asChild>
            <NarIconButton
              className="text-nv-neutrals-100"
              icon={isOpen ? faChevronCircleUp : faChevronCircleDown}
              iconSize="xl"
            />
          </Collapsible.Trigger>
        </div>
      </Card>
      <Collapsible.Content>{children}</Collapsible.Content>
    </Collapsible.Root>
  )
}
