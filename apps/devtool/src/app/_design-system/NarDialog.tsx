import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Dialog from '@radix-ui/react-dialog'
import { FC, ReactNode } from 'react'
import { classNames } from '../_lib/utils'
import NarButton from './NarButton'

interface NarDialogProps {
  title: string
  triggerButton: ReactNode
  children: ReactNode
  isOpen: boolean
  isSaving?: boolean
  isSaveDisabled?: boolean
  isConfirm?: boolean
  primaryButtonLabel?: string
  onDismiss?: () => void
  onSave?: () => void
  onOpenChange: (value: boolean) => void
}

const NarDialog: FC<NarDialogProps> = ({
  title,
  triggerButton,
  children,
  isOpen,
  isSaving,
  isSaveDisabled,
  isConfirm,
  primaryButtonLabel,
  onDismiss,
  onSave,
  onOpenChange
}) => (
  <Dialog.Root open={Boolean(isOpen)} onOpenChange={onOpenChange}>
    <Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 opacity-50 bg-nv-neutrals-900" />
      <Dialog.Content
        className={classNames(
          'data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] max-w-[90vw] rounded-[12px] border border-nv-neutrals-300 bg-nv-black translate-x-[-50%] translate-y-[-50%] focus:outline-none',
          'shadow-[0_1px_2px_0_rgba(0,0,0,0.06),0_1px_3px_0_rgba(0,0,0,0.05)]'
        )}
      >
        <Dialog.Title className="text-nv-white text-nv-sm border-b border-b-nv-neutrals-500 px-[20px] py-[16px]">
          {title}
        </Dialog.Title>
        {children}

        <div className="flex gap-[16px] justify-end bg-nv-neutrals-900 px-[20px] py-[16px] rounded-b-[12px]">
          {!isConfirm && (
            <>
              <NarButton label="Cancel" variant="secondary" onClick={onDismiss} />
              <NarButton
                label={primaryButtonLabel || 'Save'}
                rightIcon={isSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                onClick={onSave}
                disabled={isSaving || isSaveDisabled}
              />
            </>
          )}
          {isConfirm && <NarButton label={primaryButtonLabel || 'Confirm'} variant="secondary" onClick={onDismiss} />}
        </div>

        <Dialog.Close asChild>
          <div
            className="absolute flex flex-col items-center justify-center h-[20px] w-[20px] top-[16px] right-[20px] text-nv-white border border-nv-neutrals-300 rounded-full"
            role="button"
          >
            <FontAwesomeIcon icon={faXmark} size="xs" />
          </div>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)

export default NarDialog
