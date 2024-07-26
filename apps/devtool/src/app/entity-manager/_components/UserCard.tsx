import { UserEntity } from "@narval/policy-engine-shared";
import { faEdit, faIdBadge, faTrash, faWallet } from "@fortawesome/free-solid-svg-icons";
import Card from "./Card";
import { capitalize } from "lodash/fp";
import CardButton from "./CardActionButton";

interface UserCardProps {
  user: UserEntity
  onAssignAccountClick: () => void
  onAddCredentialClick: () => void
  onEditClick: () => void
  onDeleteClick: () => void
}

const getRoleBadgeColor = (role: string): string => {
  const colors: Record<string, string> = {
    'root': 'text-nv-black bg-nv-red-400',
    'admin': 'text-nv-black bg-nv-yellow-400',
    'manager': 'text-nv-black bg-nv-blue-400',
    'member': 'text-nv-black bg-nv-green-400',
  }

  return colors[role] ? colors[role] : 'text-nv-black bg-nv-white'
};

export default function UserCard({ user, onAssignAccountClick, onAddCredentialClick, onEditClick, onDeleteClick }: UserCardProps) {
  return (
    <Card>
      <div className="flex grow items-center gap-4">
        <span className="w-[400px] truncate">{user.id}</span>
        <span className={`flex items-center h-[24px] px-[12px] text-nv-2xs rounded-full ${getRoleBadgeColor(user.role)}`}>{capitalize(user.role)}</span>
      </div>

      <div className="flex items-center gap-2">
        <CardButton
          icon={faWallet}
          onClick={onAssignAccountClick}
          alt="Assign accounts"
        />

        <CardButton
          icon={faIdBadge}
          onClick={onAddCredentialClick}
          alt="Add credential"
        />

        <CardButton
          icon={faEdit}
          onClick={onEditClick}
          alt="Edit user"
        />

        <CardButton
          icon={faTrash}
          onClick={onDeleteClick}
          alt="Delete user"
        />
      </div>
    </Card>
  )
}
