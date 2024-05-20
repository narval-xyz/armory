import { faCheck } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Checkbox from '@radix-ui/react-checkbox'
import { FC, MouseEvent } from 'react'
import { classNames } from '../_lib/utils'

interface NarCheckboxProps {
  id?: string
  checked: boolean
  disabled?: boolean
  onCheckedChange?: (val: boolean) => void
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}

const NarCheckbox: FC<NarCheckboxProps> = ({ id, checked, disabled, onCheckedChange, onClick }) => (
  <Checkbox.Root
    className={classNames(
      'flex items-center justify-center h-[20px] w-[20px] rounded-[8px] border border-nv-neutrals-500 bg-nv-neutrals-800 hover:bg-nv-blue-400 data-[state=checked]:bg-nv-blue-500 appearance-none outline-none',
      disabled ? 'hover:bg-transparent opacity-60 cursor-not-allowed' : ''
    )}
    id={id}
    checked={checked}
    disabled={disabled}
    onCheckedChange={onCheckedChange}
    onClick={onClick}
  >
    <Checkbox.Indicator className="text-nv-white">
      <FontAwesomeIcon icon={faCheck} size="xs" />
    </Checkbox.Indicator>
  </Checkbox.Root>
)

export default NarCheckbox
