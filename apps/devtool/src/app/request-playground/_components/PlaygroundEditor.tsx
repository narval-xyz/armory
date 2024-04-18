'use client'

import {
  faArrowsRotate,
  faCheck,
  faCheckCircle,
  faFileSignature,
  faTriangleExclamation,
  faXmarkCircle
} from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Editor } from '@monaco-editor/react'
import { Decision, EvaluationRequest, EvaluationResponse } from '@narval/policy-engine-shared'
import { hash } from '@narval/signature'
import { useEffect, useMemo, useRef, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import useAccountSignature from '../../_hooks/useAccountSignature'
import useEngineApi from '../../_hooks/useEngineApi'
import useVaultApi from '../../_hooks/useVaultApi'
import { erc20, spendingLimits } from './request'

const PlaygroundEditor = () => {
  const { signAccountJwt } = useAccountSignature()
  const { errors: evaluationErrors, evaluateRequest } = useEngineApi()
  const { errors: signatureErrors, signTransaction } = useVaultApi()
  const [codeEditor, setCodeEditor] = useState<string | undefined>()
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [evaluationResponse, setEvaluationResponse] = useState<EvaluationResponse>()
  const [signature, setSignature] = useState<string>()
  const error = evaluationErrors || signatureErrors

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const canBeSigned = useMemo(() => {
    if (!codeEditor || !evaluationResponse) return false

    try {
      const transactionRequest = JSON.parse(codeEditor)
      return transactionRequest.authentication && evaluationResponse.decision === Decision.PERMIT
    } catch (error) {
      return false
    }
  }, [codeEditor, evaluationResponse])

  const getApprovalSignature = async () => {
    if (!codeEditor) return

    const transactionRequest = JSON.parse(codeEditor)

    const payload = {
      iss: 'fe723044-35df-4e99-9739-122a48d4ab96',
      sub: transactionRequest.request.resourceId,
      requestHash: hash(transactionRequest.request)
    }

    const authentication = await signAccountJwt(payload)

    console.log(authentication)
  }

  const sendEvaluation = async () => {
    if (!codeEditor) return

    setIsProcessing(true)
    setEvaluationResponse(undefined)
    setSignature(undefined)

    const request: EvaluationRequest = JSON.parse(codeEditor)
    const { evaluation, authentication } = (await evaluateRequest(request)) || {}

    setCodeEditor(
      JSON.stringify(
        {
          ...request,
          ...(evaluation?.decision === Decision.PERMIT && { authentication })
        },
        null,
        2
      )
    )

    setEvaluationResponse(evaluation)
    setIsProcessing(false)
  }

  const signRequest = async () => {
    if (!evaluationResponse) return

    const { accessToken, request } = evaluationResponse

    if (!accessToken?.value || !request) return

    setIsProcessing(true)
    setEvaluationResponse(undefined)
    setSignature(undefined)

    const signature = await signTransaction({ request }, accessToken.value)

    setSignature(signature)
    setEvaluationResponse(undefined)
    setIsProcessing(false)
  }

  const updateExample = async () => {
    setCodeEditor(JSON.stringify(await erc20(), null, 2))
  }

  useEffect(() => {
    if (codeEditor) return

    updateExample()
  }, [codeEditor])

  return (
    <div className="flex items-start gap-12">
      <div className="w-2/3">
        <div className="border-2 border-white rounded-xl p-4">
          <Editor
            height="60vh"
            language="json"
            value={codeEditor}
            options={{
              minimap: {
                enabled: false
              }
            }}
            onChange={(value) => setCodeEditor(value)}
            onMount={(editor, monaco) => {
              editorRef.current = editor
              monacoRef.current = monaco
            }}
          />
        </div>
        <div className="pt-4">
          <h3 className="pb-4">Examples</h3>
          <div className="flex gap-5 ">
            <NarButton label="ERC-20" onClick={async () => setCodeEditor(JSON.stringify(await erc20(), null, 2))} />
            <NarButton
              label="Spending limits"
              onClick={async () => setCodeEditor(JSON.stringify(await spendingLimits(), null, 2))}
            />
          </div>
        </div>
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
          {false && (
            <NarButton label="Approve" leftIcon={<FontAwesomeIcon icon={faCheck} />} onClick={getApprovalSignature} />
          )}
          {!isProcessing && !error && evaluationResponse && (
            <div className="flex items-center gap-2">
              {evaluationResponse.decision === Decision.PERMIT && (
                <FontAwesomeIcon icon={faCheckCircle} className="text-nv-green-500" />
              )}
              {evaluationResponse.decision === Decision.FORBID && (
                <FontAwesomeIcon icon={faXmarkCircle} className="text-nv-red-500" />
              )}
              {evaluationResponse.decision === Decision.CONFIRM && (
                <FontAwesomeIcon icon={faTriangleExclamation} className="text-nv-orange-500" />
              )}
              <div className="text-nv-white">{evaluationResponse.decision}</div>
            </div>
          )}
        </div>
        {!isProcessing && error && <div className="text-nv-red-500 truncate">{error}</div>}
        {!isProcessing && !error && evaluationResponse && (
          <div className="border-2 border-white rounded-t-xl p-4 overflow-auto">
            <pre>{JSON.stringify(evaluationResponse, null, 3)}</pre>
          </div>
        )}
        {!isProcessing && !error && signature && (
          <div className="border-2 border-white rounded-t-xl p-4 overflow-clip">
            <pre>{signature}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlaygroundEditor
