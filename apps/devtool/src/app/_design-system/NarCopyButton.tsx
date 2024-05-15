import { faCheck, faCopy } from '@fortawesome/pro-regular-svg-icons'
import { FC, useState } from 'react'
import { classNames } from '../_lib/utils'
import NarIconButton from './NarIconButton'
import NarTooltip from './NarTooltip'

interface NarCopyButtonProps {
  className?: string
  copy: string
  delay?: number
}

const NarCopyButton: FC<NarCopyButtonProps> = ({ copy, className, delay = 2000 }) => {
  const [isCopied, setIsCopied] = useState(false)

  const triggerButton = (
    <NarIconButton
      icon={isCopied ? faCheck : faCopy}
      className={classNames(className, isCopied ? 'text-nv-green-500' : '')}
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(copy)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), delay)
      }}
    />
  )

  return (
    <NarTooltip
      side="top"
      open={isCopied}
      bgColor="nv-neutrals-400"
      className="text-nv-xs"
      triggerButton={triggerButton}
      delay={delay}
    >
      Copied!
    </NarTooltip>
  )
}

export default NarCopyButton
