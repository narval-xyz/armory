import NarCopyButton from '../../_design-system/NarCopyButton'

const ValueWithCopy = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex flex-col gap-[16px]">
      <div className="text-nv-md underline">{label}</div>
      <div className="flex items-center gap-[8px]">
        <p className="truncate">{value}</p>
        <NarCopyButton copy={value} />
      </div>
    </div>
  )
}

export default ValueWithCopy
