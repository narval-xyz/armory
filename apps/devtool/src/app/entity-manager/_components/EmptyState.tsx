import { IconDefinition, faBoxOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description: string
  icon?: IconDefinition
  children?: ReactNode
}

const EmptyState: FC<EmptyStateProps> = ({ title, description, icon, children }) => (
  <div className="flex flex-col items-center justify-center mb-6">
    <div className="flex flex-col items-center text-center gap-[14px] w-[479px]">
      <div className="flex flex-col items-center justify-center h-[80px] w-[80px] rounded-full bg-nv-neutrals-900">
        <FontAwesomeIcon className="text-nv-neutrals-500" icon={icon ? icon : faBoxOpen} size="3x" />
      </div>
      <div className="text-nv-xl text-nv-white">{title}</div>
      <div className="text-nv-sm text-nv-neutrals-100">{description}</div>
      {children}
    </div>
  </div>
)

export default EmptyState
