import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, KeyboardEvent, useState } from 'react'
import { classNames } from '../_lib/utils'

interface NarInputProps {
  id?: string
  label?: string
  value?: string
  placeholder?: string
  className?: string
  errorMessage?: string
  disabled?: boolean
  leftIcon?: IconDefinition
  validate?: (value: string | undefined) => boolean
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
  onChange: (value: string) => void
  type?: 'text' | 'password'
}

const NarInput: FC<NarInputProps> = ({
  id,
  value,
  label,
  placeholder,
  className,
  errorMessage,
  disabled,
  leftIcon,
  validate,
  onChange,
  onKeyDown,
  type
}) => {
  const [isDirty, setIsDirty] = useState(false)
  const [isError, setIsError] = useState(false)

  return (
    <fieldset className={classNames('flex flex-col grow', className)}>
      {label && (
        <label className="text-nv-xs text-nv-white mb-[8px]" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="flex relative">
        {leftIcon && <FontAwesomeIcon className="absolute text-nv-white left-[12px] top-[12px]" icon={leftIcon} />}
        <input
          id={id}
          className={classNames(
            'flex-1 h-[40px] rounded-[8px] border border-nv-neutrals-500 text-nv-xs text-nv-white placeholder:text-nv-neutrals-400 bg-nv-neutrals-700 py-[10px] outline-none',
            !isError ? 'border-nv-neutrals-500' : 'border-nv-danger',
            leftIcon ? 'px-[36px]' : 'px-[12px]',
            disabled ? 'cursor-not-allowed' : ''
          )}
          type={type || 'text'}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            if (!isDirty) setIsDirty(true)
            if (isError) setIsError(false)
            onChange(e.target.value)
          }}
          onBlur={() => {
            if (isDirty && validate && !validate(value)) setIsError(true)
            else setIsError(false)
          }}
          onKeyDown={onKeyDown}
          disabled={disabled}
        />
      </div>
      {isError && <div className="text-nv-xs text-nv-danger mt-[4px]">{errorMessage}</div>}
    </fieldset>
  )
}

export default NarInput
