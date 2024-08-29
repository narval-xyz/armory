import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { CredentialEntity } from '@narval/armory-sdk'
import NarIconButtonWithTooltip from '../../../_design-system/NarIconButtonWithTooltip'

interface CredentialCardProps {
  credential: CredentialEntity
  onDeleteClick: () => void
}

export default function CredentialCard({ credential, onDeleteClick }: CredentialCardProps) {
  return (
    <div className="flex items-center">
      <span className="grow w-[400px] truncate">{credential.id}</span>
      <NarIconButtonWithTooltip icon={faTrash} onClick={onDeleteClick} alt="Delete credential" />
    </div>
  )
}
