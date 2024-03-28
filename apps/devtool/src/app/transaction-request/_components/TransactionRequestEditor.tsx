'use client'

import { Editor } from '@monaco-editor/react'
import { useRef, useState } from 'react'

const TransactionRequestEditor = () => {
  const [data, setData] = useState<string>()

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  return (
    <div className="border-2 border-white rounded-xl p-4 w-2/3">
      <Editor
        height="70vh"
        language="json"
        value={data}
        onChange={(value) => setData(value)}
        onMount={(editor, monaco) => {
          editorRef.current = editor
          monacoRef.current = monaco
        }}
      />
    </div>
  )
}

export default TransactionRequestEditor