import NarCopyButton from '../_design-system/NarCopyButton'

const ValueWithCopy = ({ label, value }: { label: string; value: string }) => {
  if (!value) return null

  return (
    <div className="flex flex-col gap-[16px] text-nv-xs">
      <div className="underline">{label}</div>
      <div className="flex items-center gap-[8px]">
        <p className="truncate">{value}</p>
        <NarCopyButton copy={value} isIconBtn />
      </div>
    </div>
  )
}

export default ValueWithCopy
