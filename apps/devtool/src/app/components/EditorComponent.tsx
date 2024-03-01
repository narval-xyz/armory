'use client'

import Editor from '@monaco-editor/react'
import { signMessage } from '@wagmi/core'
import axios from 'axios'
import { useRef, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { config } from './config'
import example from './example.json'

const EditorComponent = () => {
  const account = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  const [policies, setPolicies] = useState<string | undefined>(JSON.stringify(example, null, 2))
  const [signature, setSignature] = useState('')

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const sign = async () => {
    if (!policies) return

    const sig = await signMessage(config, { message: policies })
    setSignature(sig)

    await axios.post('/api/signature', { policies: JSON.parse(policies), signature: sig })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row-reverse gap-4">
        {account.status !== 'connected' && (
          <div className="flex gap-2">
            {connectors.map((connector) => (
              <button
                type="button"
                className="rounded-md bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
                key={connector.uid}
                onClick={() => connect({ connector })}
              >
                {connector.name}
              </button>
            ))}
          </div>
        )}
        {account.status === 'connected' && (
          <>
            <button
              type="button"
              className="rounded-md bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
            <button
              type="button"
              className="rounded-md bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
              onClick={() => sign()}
            >
              Sign
            </button>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {signature && (
          <a className="text-blue-400 underline" href="http://127.0.0.1:4200/api/policies" target="_blank">
            Policies
          </a>
        )}
        {signature && (
          <a className="text-blue-400 underline" href="http://127.0.0.1:4200/api/signature" target="_blank">
            Signature
          </a>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <Editor
          height="70vh"
          language="json"
          value={policies}
          onChange={(value) => setPolicies(value)}
          onMount={(editor, monaco) => {
            editorRef.current = editor
            monacoRef.current = monaco
          }}
        />
      </div>
    </div>
  )
}

export default EditorComponent
