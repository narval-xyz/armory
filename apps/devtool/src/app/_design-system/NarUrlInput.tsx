import { FC } from 'react'

import { isValidUrl } from '../_lib/utils'
import NarInput from './NarInput'

interface NarUrlInputProps {
  label: string
  value: string
  onValueChange: (value: string) => void
}

const NarUrlInput: FC<NarUrlInputProps> = ({ label, value, onValueChange }) => {
  return (
    <NarInput
      label={label}
      value={value}
      onChange={onValueChange}
      validate={isValidUrl}
      errorMessage="Invalid URL format. Please enter a valid URL."
    />
  )
}

export default NarUrlInput
