import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useState } from 'react'
import { classNames } from '../_lib/utils'
import NarButton from './NarButton'
import NarIconButton from './NarIconButton'
import NarTooltip from './NarTooltip'

interface NarCopyButtonProps {
  copy: string
  className?: string
  variant?: 'primary' | 'secondary'
  label?: string
  isIconBtn?: boolean
  delay?: number
}

const NarCopyButton: FC<NarCopyButtonProps> = ({
  copy,
  className,
  variant = 'primary',
  label,
  isIconBtn = false,
  delay = 2000
}) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleClick = (e: any) => {
    e.stopPropagation()
    navigator.clipboard.writeText(copy)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), delay)
  }

  if (!isIconBtn) {
    return (
      <NarButton
        variant={variant}
        label={isCopied ? 'Copied!' : label || 'Copy'}
        leftIcon={<FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />}
        onClick={handleClick}
      />
    )
  }

  return (
    <NarTooltip
      side="top"
      open={isCopied}
      bgColor="nv-neutrals-400"
      className="text-nv-xs"
      triggerButton={
        <NarIconButton
          icon={isCopied ? faCheck : faCopy}
          className={classNames(className, isCopied ? 'text-nv-green-500' : '')}
          onClick={handleClick}
        />
      }
      delay={delay}
    >
      Copied!
    </NarTooltip>
  )
}

export default NarCopyButton
