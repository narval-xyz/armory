import { SizeProp } from '@fortawesome/fontawesome-svg-core'
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ForwardedRef, forwardRef, ReactNode } from 'react'
import { classNames } from '../_lib/utils'

interface NarIconButtonProps {
  icon: IconDefinition
  iconSize?: SizeProp
  className?: string
  spin?: boolean
  children?: ReactNode
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const NarIconButton = forwardRef(
  (
    { icon, iconSize, className, spin, children, disabled, onClick, ...props }: NarIconButtonProps,
    forwardedRef: ForwardedRef<HTMLButtonElement>
  ) => (
    <button
      {...props}
      ref={forwardedRef}
      className={classNames(
        'flex items-center justify-center rounded-[12px] h-[32px] w-[32px] hover:outline-none focus:outline-none focus-visible:outline-none',
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} spin={spin} size={iconSize} />
      {children}
    </button>
  )
)

export default NarIconButton
