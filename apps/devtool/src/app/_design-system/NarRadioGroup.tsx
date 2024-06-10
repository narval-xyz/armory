import * as RadioGroup from '@radix-ui/react-radio-group'
import { FC } from 'react'

interface NarRadioGroupProps {
  name: string
  defaultValue: string
  items: {
    value: string
    label: string
  }[]
  onChange: (value: string) => void
}

const NarRadioGroup: FC<NarRadioGroupProps> = ({ name, defaultValue, items, onChange }) => (
  <RadioGroup.Root
    className="flex gap-[8px]"
    name={name}
    defaultValue={defaultValue}
    onValueChange={onChange}
    aria-label={name}
  >
    {items.map((item) => (
      <div className="flex items-center">
        <RadioGroup.Item
          className="bg-white w-[25px] h-[25px] rounded-full shadow-[0_2px_10px] shadow-blackA4 hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black outline-none cursor-default"
          value={item.value}
          id={item.value}
        >
          <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[11px] after:h-[11px] after:rounded-[50%] after:bg-violet11" />
        </RadioGroup.Item>
        <label className="text-nv-xs text-nv-white" htmlFor={item.value}>
          {item.label}
        </label>
      </div>
    ))}
  </RadioGroup.Root>
)

export default NarRadioGroup
