import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactNode } from 'react'

interface MessageProps {
  icon: IconDefinition
  color: 'danger' | 'warning' | 'success'
  children: ReactNode
  className?: string
}

const getColor = (color: string) => {
  const colors: Record<string, string> = {
    danger: 'text-nv-red-500',
    warning: 'text-nv-yellow-500',
    success: 'text-nv-green-500'
  }

  return colors[color] || 'text-nv-white'
}

export default function Message({ icon, color, children, className }: MessageProps) {
  return (
    <div className={`bg-nv-neutrals-900 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-4">
        <FontAwesomeIcon icon={icon} className={getColor(color)} />
        <div className="text-nv-white">{children}</div>
      </div>
    </div>
  )
}
