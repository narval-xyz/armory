'use client'

import { faPenCircle, faTrashCan } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, ReactNode } from 'react'

interface DataCardProps {
  children: ReactNode
  onEdit: () => void
  onDelete: () => void
}

const DataCard: FC<DataCardProps> = ({ children, onEdit, onDelete }) => (
  <div className="flex px-8 py-4 border border-nv-neutrals-300 bg-nv-neutrals-800 hover:bg-nv-neutrals-600 rounded-xl group">
    <div className="flex items-center gap-4 grow">{children}</div>
    <div className="hidden group-hover:flex group-hover:items-center group-hover:gap-4">
      <FontAwesomeIcon className="cursor-pointer" icon={faPenCircle} size="lg" onClick={onEdit} />
      <FontAwesomeIcon className="cursor-pointer" icon={faTrashCan} size="lg" onClick={onDelete} />
    </div>
  </div>
)

export default DataCard
