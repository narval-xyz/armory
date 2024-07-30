'use client'

import { faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ErrorStatus = ({ label }: { label: unknown }) => {
  if (!label || (typeof label !== 'string' && typeof label !== 'object')) return null

  const displayLabel = typeof label === 'string' ? label : JSON.stringify(label, null, 2)

  return (
    <div className="flex items-start gap-4 mt-2 max-w-full">
      <FontAwesomeIcon icon={faXmarkCircle} className="text-nv-red-500" />
      <pre className="text-nv-white whitespace-pre-wrap bg-nv-gray-800 p-2 rounded break-words max-w-full overflow-auto">{displayLabel}</pre>
      </div>
  )

}

export default ErrorStatus
