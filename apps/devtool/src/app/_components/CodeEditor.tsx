'use client'

import { Editor } from '@monaco-editor/react'
import { FC, useRef } from 'react'

interface CodeEditorProps {
  value: string | undefined
  readOnly?: boolean
  onChange?: (value: string | undefined) => void
}

const CodeEditor: FC<CodeEditorProps> = ({ value, readOnly = false, onChange }) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  return (
    <div className="border-2 border-white rounded-xl p-4 w-full grow">
      <Editor
        language="json"
        options={{
          readOnly,
          minimap: {
            enabled: false
          }
        }}
        value={value}
        onChange={onChange}
        onMount={(editor, monaco) => {
          editorRef.current = editor
          monacoRef.current = monaco
        }}
      />
    </div>
  )
}

export default CodeEditor
