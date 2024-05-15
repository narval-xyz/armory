import { faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dispatch, FC, SetStateAction, useState } from 'react'
import ErrorStatus from '../../../_components/ErrorStatus'
import SuccessStatus from '../../../_components/SuccessStatus'
import NarButton from '../../../_design-system/NarButton'
import NarInput from '../../../_design-system/NarInput'

interface SignAndPushFormProps {
  label: string
  value: string
  onChange: Dispatch<SetStateAction<string>>
  onBtnClick: () => Promise<void> | undefined
}

const SignAndPushForm: FC<SignAndPushFormProps> = ({ label, value, onChange, onBtnClick }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errors, setErrors] = useState('')

  const handleBtnClick = async () => {
    try {
      setErrors('')
      setIsProcessing(true)
      await onBtnClick()
      setIsProcessing(false)
      setSuccessMsg('Success!')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (e) {}
  }

  return (
    <div className="flex items-end gap-[8px]">
      <NarInput label={label} value={value} onChange={onChange} />
      <NarButton
        label={isProcessing ? 'Processing...' : 'Sign & Push'}
        leftIcon={isProcessing ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
        onClick={handleBtnClick}
        disabled={isProcessing}
      />
      <ErrorStatus label={errors} />
      <SuccessStatus label={successMsg} />
    </div>
  )
}

export default SignAndPushForm
