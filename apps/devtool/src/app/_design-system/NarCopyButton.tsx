import { faCheck, faCopy } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useState } from 'react'
import { classNames } from '../_lib/utils'
import NarButton from './NarButton'
import NarIconButton from './NarIconButton'
import NarTooltip from './NarTooltip'

interface NarCopyButtonProps {
  copy: string
  className?: string
  label?: string
  isIconBtn?: boolean
  delay?: number
}

const NarCopyButton: FC<NarCopyButtonProps> = ({ copy, label, isIconBtn, className, delay = 2000 }) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleClick = (e: any) => {
    e.stopPropagation()
    navigator.clipboard.writeText(copy)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), delay)
  }

  return (
    <NarTooltip
      side="top"
      open={isCopied}
      bgColor="nv-neutrals-400"
      className="text-nv-xs"
      triggerButton={
        isIconBtn ? (
          <NarIconButton
            icon={isCopied ? faCheck : faCopy}
            className={classNames(className, isCopied ? 'text-nv-green-500' : '')}
            onClick={handleClick}
          />
        ) : (
          <NarButton
            label={isCopied ? 'Copied!' : label || 'Copy'}
            leftIcon={<FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />}
            onClick={handleClick}
          />
        )
      }
      delay={delay}
    >
      Copied!
    </NarTooltip>
  )
}

export default NarCopyButton
