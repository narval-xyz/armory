'use client'

import { faArrowsRotate, faCheckCircle, faFileSignature, faXmarkCircle } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Editor } from '@monaco-editor/react'
import { Decision, EvaluationResponse } from '@narval/policy-engine-shared'
import { hash } from '@narval/signature'
import axios from 'axios'
import { useMemo, useRef, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import useAccountSignature from '../../_hooks/useAccountSignature'
import useStore from '../../_hooks/useStore'
import example from './example.json'

const PlaygroundEditor = () => {
  const { engineUrl, engineClientId, engineClientSecret, vaultUrl, vaultClientId } = useStore()
  const { jwk, signAccountJwsd, signAccountJwt } = useAccountSignature()
  const [data, setData] = useState<string | undefined>(JSON.stringify(example, null, 2))
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [evaluationResponse, setEvaluationResponse] = useState<EvaluationResponse>()
  const [signature, setSignature] = useState<string>()

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const canBeSigned = useMemo(() => {
    try {
      const transactionRequest = JSON.parse(data || '{}')
      return transactionRequest?.authentication && evaluationResponse?.decision === Decision.PERMIT
    } catch (error) {
      return false
    }
  }, [data, evaluationResponse])

  const sendEvaluation = async () => {
    if (!data || !jwk) return

    setIsProcessing(true)

    try {
      const transactionRequest = JSON.parse(data)

      const payload = {
        iss: 'fe723044-35df-4e99-9739-122a48d4ab96',
        sub: transactionRequest.request.resourceId,
        requestHash: hash(transactionRequest.request)
      }

      const authentication = await signAccountJwt(payload)

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

      setData(JSON.stringify({ ...transactionRequest, authentication }, null, 2))
      setEvaluationResponse(evaluation.data)
    } catch (error) {
      console.log(error)
    }

    setIsProcessing(false)
  }

  const signRequest = async () => {
    if (!evaluationResponse || !jwk) return

    const { accessToken, request } = evaluationResponse

    if (!accessToken?.value || !request) return

    try {
      const bodyPayload = { request }

      const detachedJws = await signAccountJwsd(bodyPayload, accessToken.value)

      const { data } = await axios.post(`${vaultUrl}/sign`, bodyPayload, {
        headers: {
          'x-client-id': vaultClientId,
          'detached-jws': detachedJws,
          authorization: `GNAP ${accessToken.value}`
        }
      })

      setSignature(data.signature)
      setEvaluationResponse(undefined)
    } catch (error) {
      console.log(error)
    }

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
            label="Evaluate"
            leftIcon={<FontAwesomeIcon icon={faArrowsRotate} />}
            onClick={sendEvaluation}
            disabled={isProcessing}
          />
          <NarButton
            label="Sign"
            leftIcon={<FontAwesomeIcon icon={faFileSignature} />}
            onClick={signRequest}
            disabled={isProcessing || !canBeSigned}
          />
          {!isProcessing && evaluationResponse && (
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={evaluationResponse.decision === Decision.PERMIT ? faCheckCircle : faXmarkCircle}
                className={evaluationResponse.decision === Decision.PERMIT ? 'text-nv-green-500' : 'text-nv-red-500'}
              />
              <div className="text-nv-white">{evaluationResponse.decision}</div>
            </div>
          )}
        </div>
        {!isProcessing && evaluationResponse && (
          <div className="border-2 border-white rounded-t-xl p-4 overflow-auto">
            <pre>{JSON.stringify(evaluationResponse, null, 3)}</pre>
          </div>
        )}
        {!isProcessing && signature && <div className="text-nv-white truncate">{signature}</div>}
      </div>
    </div>
  )
}

export default PlaygroundEditor
