import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import NarIconButton from '../../_design-system/NarIconButton'
import NarTooltip from '../../_design-system/NarTooltip'

interface CardButtonProps {
  icon: IconDefinition
  onClick: () => void
  alt: string
}

export default function CardButton({ icon, onClick, alt }: CardButtonProps) {
  return (
    <NarTooltip
      side="top"
      bgColor="nv-neutrals-400"
      className="text-nv-xs"
      triggerButton={<NarIconButton icon={icon} onClick={onClick} />}
    >
      {alt}
    </NarTooltip>
  )
}
