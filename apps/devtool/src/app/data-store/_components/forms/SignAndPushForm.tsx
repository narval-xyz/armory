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
  onPush?: () => Promise<void> | undefined
  onSign?: () => Promise<void> | undefined
}

const SignAndPushForm: FC<SignAndPushFormProps> = ({ label, value, onChange, onPush, onSign }) => {
  const [isSigning, setIsSigning] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errors, setErrors] = useState('')

  const handleSign = async () => {
    try {
      if (!onSign) return
      setErrors('')
      setIsSigning(true)
      await onSign()
      setIsSigning(false)
      setSuccessMsg('Signed!')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (e) {}
  }

  const handlePush = async () => {
    try {
      if (!onPush) return
      setErrors('')
      setIsPushing(true)
      await onPush()
      setSuccessMsg('Pushed!')
      setIsPushing(false)
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (e) {}
  }

  return (
    <div className="flex items-end gap-[8px]">
      <NarInput label={label} value={value} onChange={onChange} />
      <ErrorStatus label={errors} />
      <SuccessStatus label={successMsg} />
      {!successMsg && (
        <>
          {onSign && (
            <NarButton
              label={isPushing ? 'Signing...' : 'Sign'}
              leftIcon={isSigning ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
              onClick={handleSign}
              disabled={isSigning || isPushing}
            />
          )}
          {onPush && (
            <NarButton
              label={isPushing ? 'Pushing...' : 'Push'}
              leftIcon={isPushing ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
              onClick={handlePush}
              disabled={isSigning || isPushing}
            />
          )}
        </>
      )}
    </div>
  )
}

export default SignAndPushForm
