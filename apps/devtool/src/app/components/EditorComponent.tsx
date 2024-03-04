'use client'

import Editor from '@monaco-editor/react'
import { signMessage } from '@wagmi/core'
import axios from 'axios'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { config } from './config'
import example from './data.json'

const EditorComponent = () => {
  const account = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  const [data, setData] = useState<string | undefined>(JSON.stringify(example, null, 2))
  const [displayLink, setDisplayLink] = useState(false)

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const sign = async () => {
    if (!data) return

    const { entity, policy } = JSON.parse(data)

    const entitySig = await signMessage(config, { message: JSON.stringify(entity) })
    const policySig = await signMessage(config, { message: JSON.stringify(policy) })

    await axios.post('/api/data-store', {
      entity: {
        signature: entitySig,
        data: entity
      },
      policy: {
        signature: policySig,
        data: policy
      }
    })

    setDisplayLink(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <Image
          src="/narval-wordmark.png"
          width="150"
          height="50"
          alt="Narval Logo"
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
          priority
        />
        <div className="flex flex-row-reverse gap-4 flex-1">
          {!account.isConnected && (
            <div className="flex gap-2">
              {connectors.map((connector) => (
                <button
                  type="button"
                  className="rounded-md bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                >
                  Connect Wallet
                </button>
              ))}
            </div>
          )}
          {account.isConnected && (
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
      </div>
      <div className="flex items-center gap-4">
        {displayLink && (
          <a className="text-blue-400 underline" href="http://127.0.0.1:4200/api/data-store" target="_blank">
            Data Store
          </a>
        )}
      </div>
      <div className="border border-black rounded-xl p-4">
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
    </div>
  )
}

export default EditorComponent
