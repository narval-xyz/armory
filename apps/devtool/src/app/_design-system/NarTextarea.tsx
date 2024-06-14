import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useState } from 'react'
import { classNames } from '../_lib/utils'

interface NarTextareaProps {
  id?: string
  label?: string
  value?: string
  placeholder?: string
  rows?: number
  errorMessage?: string
  disabled?: boolean
  leftIcon?: IconDefinition
  validate?: (value: string | undefined) => boolean
  onChange: (value: string) => void
}

const NarTextarea: FC<NarTextareaProps> = ({
  id,
  value,
  label,
  placeholder,
  rows = 3,
  errorMessage,
  disabled,
  leftIcon,
  validate,
  onChange
}) => {
  const [isError, setIsError] = useState(false)

  return (
    <fieldset className="flex flex-col w-full">
      {label && (
        <label className="text-nv-xs text-nv-white mb-[8px]" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative flex">
        {leftIcon && <FontAwesomeIcon className="absolute text-nv-white left-[12px] top-[12px]" icon={leftIcon} />}
        <textarea
          id={id}
          className={classNames(
            'flex-1 rounded-[8px] border border-nv-neutrals-500 text-nv-xs text-nv-white placeholder:text-nv-neutrals-400 bg-nv-neutrals-700 py-[10px] outline-none',
            !isError ? 'border-nv-neutrals-500' : 'border-nv-danger',
            leftIcon ? 'px-[36px]' : 'px-[12px]',
            disabled ? 'cursor-not-allowed' : ''
          )}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            if (isError) setIsError(false)
            onChange(e.target.value)
          }}
          onBlur={() => {
            if (validate && !validate(value)) setIsError(true)
            else setIsError(false)
          }}
          disabled={disabled}
        />
      </div>
      {isError && <div className="text-nv-xs text-nv-danger mt-[4px]">{errorMessage}</div>}
    </fieldset>
  )
}

export default NarTextarea
