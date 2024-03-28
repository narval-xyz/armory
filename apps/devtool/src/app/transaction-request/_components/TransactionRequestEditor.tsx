'use client'

import { Editor } from '@monaco-editor/react'
import { Curves, Jwk, KeyTypes, SigningAlg, base64UrlToHex, buildSignerEip191, hash, signJwt } from '@narval/signature'
import axios from 'axios'
import { useRef, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import useStore from '../../_hooks/useStore'
import example from './example.json'

const TransactionRequestEditor = () => {
  const { engineUrl, engineClientId, engineClientSecret } = useStore()
  const [data, setData] = useState<string | undefined>(JSON.stringify(example, null, 2))

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const sendEvaluation = async () => {
    if (!data) return

    const transactionRequest = JSON.parse(data)

    const jwk: Jwk = {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: '0xE7349Bf47e09d3aa047FC4cDE514DaafAfc97037',
      x: 'PQ1ekiQFSp6UN3-RGQDUwzUuZC7jjaDY_vIOhuGI_f4',
      y: 'CNiOEfEhjvPfIFaz7CzIgyST_tHtQDhNqak9CDDIwRc',
      d: 'NSlaSDg8LEzCYP8goPXV11X6S6oiolaqt6M6fplDxoM'
    }

    const pk = base64UrlToHex(jwk.d as string)
    const signer = buildSignerEip191(pk)

    const payload = {
      iss: 'fe723044-35df-4e99-9739-122a48d4ab96',
      sub: transactionRequest.request.resourceId,
      requestHash: hash(transactionRequest.request)
    }

    const authentication = await signJwt(payload, jwk, { alg: SigningAlg.EIP191 }, signer)

    const evaluationResult = await axios.post(
      `${engineUrl}/evaluations`,
      { ...transactionRequest, authentication },
      {
        headers: {
          'x-client-id': engineClientId,
          'x-client-secret': engineClientSecret
        }
      }
    )

    console.log(evaluationResult.data)
  }

  return (
    <div className="flex gap-12">
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
      <NarButton label="Send" onClick={sendEvaluation} />
    </div>
  )
}

export default TransactionRequestEditor
