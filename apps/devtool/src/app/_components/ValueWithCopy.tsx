'use client'

import NarCopyButton from '../_design-system/NarCopyButton'
import { classNames } from '../_lib/utils'

const ValueWithCopy = ({
  label,
  value,
  layout = 'vertical'
}: {
  label: string
  value: string | undefined
  layout?: 'horizontal' | 'vertical'
}) => {
  if (!value) return null

  return (
    <div className={classNames('flex gap-[8px]', layout === 'horizontal' ? 'flex-row items-center' : 'flex-col')}>
      <div className="underline text-nv-xs">{label}:</div>
      <div className="flex items-center gap-[8px]">
        <p className="truncate text-nv-xs">{value}</p>
        <NarCopyButton copy={value} isIconBtn />
      </div>
    </div>
  )
}

export default ValueWithCopy
