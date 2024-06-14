import { faCheck, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, ReactNode } from 'react'

export interface MenuItem<T = any> {
  label: string
  value: string
  description?: string
  leftImageCmp?: ReactNode
  rightDetailsCmp?: ReactNode
  iconDef?: IconDefinition
  checked?: boolean
  disabled?: boolean
  displayCheckbox?: boolean
  data?: T
}

const NarMenuItem: FC<MenuItem> = ({
  label,
  description,
  leftImageCmp,
  rightDetailsCmp,
  iconDef,
  checked,
  disabled,
  displayCheckbox
}) => (
  <div
    className={`flex items-center justify-between pl-[16px] pr-[12px] py-[10px] group ${
      !disabled
        ? 'text-nv-white hover:bg-nv-neutrals-400 cursor-pointer'
        : 'text-nv-neutrals-300 hover:bg-transparent cursor-not-allowed'
    }`}
  >
    <div className="flex items-center gap-[8px]">
      {displayCheckbox && (
        // We must use this component instead of NarCheckbox because it causes performance issues when searching in the dropdown
        <div
          className={`flex items-center justify-center h-[20px] w-[20px] rounded-[8px] border border-nv-neutrals-500 bg-nv-neutrals-800 data-[state=checked]:bg-nv-blue-500 appearance-none outline-none ${
            !disabled
              ? 'hover:bg-nv-blue-400 cursor-pointer opacity-100'
              : 'hover:bg-transparent cursor-not-allowed opacity-60'
          }`}
          role="button"
        >
          {checked && <FontAwesomeIcon className="text-nv-white" icon={faCheck} size="xs" />}
        </div>
      )}
      {iconDef && <FontAwesomeIcon icon={iconDef} size="xs" />}
      {leftImageCmp}
      <div className="flex flex-col">
        <div className={`text-nv-xs ${!disabled ? 'text-nv-white' : 'text-nv-neutrals-300'}`}>{label}</div>
        {description && (
          <div
            className={`text-nv-2xs ${
              !disabled
                ? 'text-nv-neutrals-200 group-hover:text-nv-white'
                : 'text-nv-neutrals-300 group-hover:text-nv-neutrals-300'
            }`}
          >
            {description}
          </div>
        )}
      </div>
    </div>
    {rightDetailsCmp}
  </div>
)

export default NarMenuItem
