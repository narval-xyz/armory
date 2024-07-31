'use client'

import {
  faFileSignature,
  faPen,
  faRedo,
  faRotateRight,
  faSpinner,
  faUpload,
  faXmarkCircle
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Entities, Policy } from '@narval/policy-engine-shared'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import CodeEditor from '../../_components/CodeEditor'
import ErrorStatus from '../../_components/ErrorStatus'
import NarButton from '../../_design-system/NarButton'
import NarCopyButton from '../../_design-system/NarCopyButton'
import NarUrlInput from '../../_design-system/NarUrlInput'

enum Action {
  SIGN = 'SIGN',
  SIGN_AND_PUSH = 'SIGN_AND_PUSH'
}

interface DataEditorProps<T> {
  data: { signature: string; data: T } | undefined
  label?: string
  url: string
  isFetching: boolean
  isSigning: boolean
  isSigningAndPushing: boolean
  error: boolean
  errorMessage: string | undefined
  setUrl: Dispatch<SetStateAction<string>>
  fetch: () => Promise<void>
  sign: (data: T) => Promise<void>
  signAndPush: (data: T) => Promise<void>
}

const DataEditor = <T extends Entities | Policy[]>({
  data,
  label,
  url,
  isFetching,
  isSigning,
  isSigningAndPushing,
  error,
  errorMessage,
  fetch,
  setUrl,
  sign,
  signAndPush
}: DataEditorProps<T>) => {
  const [editor, setEditor] = useState<string>()
  const [isReadOnly, setIsReadOnly] = useState(true)

  const handleAction = async (action: Action) => {
    if (!editor) return
    const data = JSON.parse(editor)

    if (Action.SIGN === action) {
      await sign(data)
    } else if (Action.SIGN_AND_PUSH === action) {
      await signAndPush(data)
      await fetch()
    }

    setIsReadOnly(true)
  }

  const handleEdit = async () => {
    if (isReadOnly) {
      const { data } = editor ? JSON.parse(editor) : { data: {} }
      setEditor(JSON.stringify(data, null, 2))
      setIsReadOnly(false)
    } else {
      await fetch()
      setIsReadOnly(true)
    }
  }

  useEffect(() => {
    if (!data) return

    setEditor(JSON.stringify(data, null, 2))
  }, [data])

  return (
    <div className="flex flex-col gap-[16px] h-full">
      <div className="flex items-end gap-[8px]">
        {label && <NarUrlInput label={label} value={url} onValueChange={setUrl} />}
        {isReadOnly && editor && (
          <>
            <NarCopyButton label="Copy" copy={editor} />
            <NarButton
              label="Fetch"
              leftIcon={<FontAwesomeIcon icon={isFetching ? faSpinner : faRotateRight} spin={isFetching} />}
              onClick={fetch}
              disabled={isFetching}
            />
          </>
        )}
        {!isReadOnly && (
          <div className="flex flex-row-reverse gap-[8px]">
            <NarButton
              label="Sign"
              leftIcon={<FontAwesomeIcon icon={isSigning ? faSpinner : faFileSignature} spin={isSigning} />}
              onClick={() => handleAction(Action.SIGN)}
              disabled={isSigning}
            />
            <NarButton
              label="Sign & Push"
              leftIcon={
                <FontAwesomeIcon icon={isSigningAndPushing ? faSpinner : faUpload} spin={isSigningAndPushing} />
              }
              onClick={() => handleAction(Action.SIGN_AND_PUSH)}
              disabled={isSigningAndPushing}
            />
          </div>
        )}
        <NarButton
          label={isReadOnly ? 'Edit' : 'Cancel'}
          variant={isReadOnly ? 'primary' : 'secondary'}
          leftIcon={<FontAwesomeIcon icon={isReadOnly ? faPen : faXmarkCircle} />}
          onClick={handleEdit}
        />
      </div>
      <CodeEditor readOnly={isReadOnly} value={editor} onChange={setEditor} />
      {error && (
        <div className="flex flex-col gap-4 mt-2 text-red-600">
          <ErrorStatus label={errorMessage} />
          <NarButton
            label="Retry"
            leftIcon={<FontAwesomeIcon icon={isFetching ? faSpinner : faRedo} spin={isFetching} />}
            onClick={fetch}
            disabled={isFetching}
          />
        </div>
      )}
    </div>
  )
}

export default DataEditor
