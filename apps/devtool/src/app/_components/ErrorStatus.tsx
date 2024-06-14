'use client'

import { faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ErrorStatus = ({ label }: { label: string | undefined }) => {
  if (!label) return null

  return (
    <div className="flex items-center gap-4">
      <FontAwesomeIcon icon={faXmarkCircle} className="text-nv-red-500" />
      <div className="text-nv-white">{label}</div>
    </div>
  )
}

export default ErrorStatus
