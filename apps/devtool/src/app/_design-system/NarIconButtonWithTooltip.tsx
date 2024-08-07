import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import NarIconButton from './NarIconButton'
import NarTooltip from './NarTooltip'

interface NarIconButtonWithTooltipProps {
  icon: IconDefinition
  onClick: () => void
  alt: string
}

export default function NarIconButtonWithTooltip({ icon, onClick, alt }: NarIconButtonWithTooltipProps) {
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
