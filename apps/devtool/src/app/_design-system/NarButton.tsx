import { BaseSyntheticEvent, ForwardedRef, forwardRef, ReactElement, ReactNode } from 'react'
import { classNames } from '../_lib/utils'

interface ButtonProps {
  label?: string
  type?: 'button' | 'reset' | 'submit'
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'danger' | 'danger-stroke'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  rounded?: boolean
  disabled?: boolean
  leftIcon?: ReactElement
  rightIcon?: ReactElement
  children?: ReactNode
  onClick?: (e: BaseSyntheticEvent) => void
}

const getVariantClass = (variant: ButtonProps['variant']) => {
  const defaultVariant = 'text-nv-black bg-nv-white hover:bg-nv-neutrals-25'

  switch (variant) {
    case 'primary':
      return defaultVariant
    case 'secondary':
      return 'text-nv-white bg-nv-neutrals-800 border border-nv-white'
    case 'tertiary':
      return 'text-nv-white bg-nv-neutrals-600 border border-nv-neutrals-500 hover:bg-nv-neutrals-400 hover:border-nv-neutrals-400'
    case 'quaternary':
      return 'text-nv-white !p-0 hover:underline underline-offset-4 focus:!ring-0 focus-visible:!outline-none'
    case 'danger':
      return 'text-nv-white bg-nv-danger'
    case 'danger-stroke':
      return 'text-nv-danger bg-nv-neutrals-800 border border-nv-danger hover:border-nv-red-400'
    default:
      return defaultVariant
  }
}

const getSizeClass = (size: ButtonProps['size']) => {
  const defaultSize = 'text-[14px] h-[40px] px-[20px] gap-[8px]'

  switch (size) {
    case 'xs':
      return 'text-[10px] h-[26px] px-[16px] gap-[2px]'
    case 'sm':
      return 'text-[12px] h-[32px] px-[16px] gap-[4px]'
    case 'md':
      return defaultSize
    case 'lg':
      return 'text-[16px] h-[40px] px-[20px] gap-[8px]'
    default:
      return defaultSize
  }
}

const btnStyles = 'relative flex items-center justify-center focus:ring focus:ring-nv-brand-500/20'

const iconStyles = 'flex flex-col items-center justify-center h-[16px] w-[16px]'

const NarButton = forwardRef(
  (
    {
      label,
      type,
      variant = 'primary',
      size = 'md',
      className,
      rounded,
      disabled,
      leftIcon,
      rightIcon,
      children,
      onClick,
      ...props
    }: ButtonProps,
    forwardedRef: ForwardedRef<HTMLButtonElement>
  ) => {
    const btnRounded = rounded ? 'rounded-full' : 'rounded-[12px]'
    const btnDisabled = disabled
      ? '!text-nv-neutrals-200 hover:!text-nv-neutrals-200 !bg-nv-neutrals-400 hover:!bg-nv-neutrals-400 !border-none cursor-not-allowed'
      : ''

    return (
      <button
        {...props}
        ref={forwardedRef}
        type={type || 'button'}
        className={classNames(
          getVariantClass(variant),
          getSizeClass(size),
          btnStyles,
          btnRounded,
          btnDisabled,
          className
        )}
        onClick={onClick}
        disabled={disabled}
      >
        {leftIcon && <span className={iconStyles}>{leftIcon}</span>}
        {children || label}
        {rightIcon && <span className={iconStyles}>{rightIcon}</span>}
      </button>
    )
  }
)

export default NarButton
