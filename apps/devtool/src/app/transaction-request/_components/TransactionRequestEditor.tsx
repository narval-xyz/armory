'use client'

import { faCheckCircle, faSpinner, faXmarkCircle } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Editor } from '@monaco-editor/react'
import { EvaluationResponse } from '@narval/policy-engine-shared'
import { Curves, Jwk, KeyTypes, SigningAlg, base64UrlToHex, buildSignerEip191, hash, signJwt } from '@narval/signature'
import axios from 'axios'
import { useRef, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import useStore from '../../_hooks/useStore'
import example from './example.json'

const TransactionRequestEditor = () => {
  const { engineUrl, engineClientId, engineClientSecret } = useStore()
  const [data, setData] = useState<string | undefined>(JSON.stringify(example, null, 2))
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponse>()

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const sendEvaluation = async () => {
    if (!data) return

    setIsProcessing(true)

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

    const evaluation = await axios.post(
      `${engineUrl}/evaluations`,
      { ...transactionRequest, authentication },
      {
        headers: {
          'x-client-id': engineClientId,
          'x-client-secret': engineClientSecret
        }
      }
    )

    setEvaluationResult(evaluation.data)
    setIsProcessing(false)
  }

  return (
    <div className="flex items-start gap-12">
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
      <div className="flex flex-col gap-5 w-1/3">
        <div className="flex items-center gap-4">
          <NarButton
            label={isProcessing ? 'Processing...' : 'Send'}
            rightIcon={isProcessing ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
            onClick={sendEvaluation}
            disabled={isProcessing}
          />
          {!isProcessing && evaluationResult && (
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={evaluationResult.decision === 'Permit' ? faCheckCircle : faXmarkCircle}
                className={evaluationResult.decision === 'Permit' ? 'text-nv-green-500' : 'text-nv-red-500'}
              />
              <div className="text-nv-white">{evaluationResult.decision}</div>
            </div>
          )}
        </div>
        {!isProcessing && evaluationResult && (
          <div className="border-2 border-white rounded-t-xl p-4 overflow-auto">
            <pre>{JSON.stringify(evaluationResult, null, 3)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionRequestEditor
