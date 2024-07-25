import { CredentialEntity } from "@narval/policy-engine-shared"
import Card from "./Card"
import NarIconButton from "../../_design-system/NarIconButton"
import { faTrash } from "@fortawesome/free-solid-svg-icons"

interface CredentialCardProps {
  credential: CredentialEntity
  onDeleteClick: () => void
}

export default function CredentialCard({ credential, onDeleteClick }: CredentialCardProps) {
  return (
    <Card>
      <div className="flex grow items-center gap-4">
        <span className="w-[400px] truncate text-ellipsis">{credential.id}</span>
      </div>

      <div className="flex items-center gap-2">
        <NarIconButton
          icon={faTrash}
          onClick={onDeleteClick}
        />
      </div>
    </Card>
  )
}

