'use client'

import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SuccessStatus = ({ label }: { label: string }) => {
  if (!label) return null

  return (
    <div className="flex items-center gap-[4px]">
      <FontAwesomeIcon icon={faCheckCircle} className="text-nv-green-500" />
      <div className="text-nv-white">{label}</div>
    </div>
  )
}

export default SuccessStatus
