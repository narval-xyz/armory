import * as Tooltip from '@radix-ui/react-tooltip'
import { FC, ReactNode } from 'react'
import { classNames } from '../_lib/utils'

/**
 * NarTooltip
 *
 * @bgColor is the background color class name following Tailwind's color
 * palette.
 *
 * @see https://radix-ui.com/primitives/docs/components/tooltip
 */
interface NarTooltipProps {
  triggerButton: ReactNode
  children: ReactNode
  className?: string
  open?: boolean
  delay?: number
  display?: boolean
  side?: 'top' | 'bottom' | 'left' | 'right'
  bgColor?: 'nv-black' | 'nv-orange-400' | 'nv-neutrals-300' | 'nv-neutrals-400' // you can't pass in arbitrary colors because you can't dynamically build tailwind classes, so we need to know all possible inputs here.
}

const getBackground = (bgColor: string) => {
  switch (bgColor) {
    case 'nv-black':
      return 'bg-nv-black'
    case 'nv-orange-400':
      return 'bg-nv-orange-400'
    case 'nv-neutrals-300':
      return 'bg-nv-neutrals-300'
    case 'nv-neutrals-400':
      return 'bg-nv-neutrals-400'
    default:
      return 'bg-nv-black'
  }
}

const getTextColor = (bgColor: string) => {
  switch (bgColor) {
    case 'nv-black':
      return 'text-nv-black'
    case 'nv-orange-400':
      return 'text-nv-orange-400'
    case 'nv-neutrals-300':
      return 'text-nv-neutrals-300'
    case 'nv-neutrals-400':
      return 'text-nv-neutrals-400'
    default:
      return 'text-nv-black'
  }
}

const NarTooltip: FC<NarTooltipProps> = ({
  side,
  display = true,
  triggerButton,
  className,
  delay = 0,
  children,
  open,
  bgColor = 'nv-black'
}) => (
  <Tooltip.Provider>
    <Tooltip.Root open={open} delayDuration={delay}>
      <Tooltip.Trigger asChild>{triggerButton}</Tooltip.Trigger>
      {display && (
        <Tooltip.Portal>
          <Tooltip.Content
            className={classNames(
              'text-nv-2xs text-nv-white px-[15px] py-[10px] rounded-[4px] leading-none select-none z-50 w-auto',
              getBackground(bgColor),
              className
            )}
            side={side}
            sideOffset={5}
          >
            {children}
            <Tooltip.Arrow className={getTextColor(bgColor)} fill="currentColor" />
          </Tooltip.Content>
        </Tooltip.Portal>
      )}
    </Tooltip.Root>
  </Tooltip.Provider>
)

export default NarTooltip
