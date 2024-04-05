'use client'

import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const GreenCheckStatus = ({ isChecked, label }: { isChecked: boolean; label: string }) => {
  if (!isChecked) return null

  return (
    <div className="flex items-center gap-4">
      <FontAwesomeIcon icon={faCheckCircle} className="text-nv-green-500" />
      <div className="text-nv-white">{label}</div>
    </div>
  )
}

export default GreenCheckStatus
