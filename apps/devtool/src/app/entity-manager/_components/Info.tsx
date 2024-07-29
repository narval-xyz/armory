import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface InfoProps {
  text: string
}

export default function Info({ text }: InfoProps) {
  return (
    <div className="flex items-center gap-4 mt-6">
      <FontAwesomeIcon icon={faInfoCircle} className="text-nv-white/75" />
      <span className="grow text-nv-white/50">{text}</span>
    </div>
  )
}
