'use client'

import {
  faArrowsRotate,
  faCheckCircle,
  faFileSignature,
  faTriangleExclamation,
  faUpload,
  faXmarkCircle
} from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Decision, EvaluationRequest } from '@narval/policy-engine-shared'
import { useEffect, useMemo, useState } from 'react'
import { generatePrivateKey } from 'viem/accounts'
import CodeEditor from '../../_components/CodeEditor'
import NarButton from '../../_design-system/NarButton'
import useEngineApi from '../../_hooks/useEngineApi'
import useStore from '../../_hooks/useStore'
import useVaultApi from '../../_hooks/useVaultApi'
import { erc20, grantPermission, spendingLimits } from '../../_lib/request'

enum Template {
  ERC20 = 'ERC20',
  SPENDING_LIMITS = 'SPENDING_LIMITS',
  GRANT_PERMISSION = 'GRANT_PERMISSION'
}

const EvaluationDecision = ({ decision }: { decision: Decision }) => {
  switch (decision) {
    case Decision.PERMIT:
      return (
        <div className="flex items-center gap-[4px]">
          <FontAwesomeIcon icon={faCheckCircle} className="text-nv-green-500" />
          <div className="text-nv-white">{decision}</div>
        </div>
      )
    case Decision.FORBID:
      return (
        <div className="flex items-center gap-[4px]">
          <FontAwesomeIcon icon={faXmarkCircle} className="text-nv-red-500" />
          <div className="text-nv-white">{decision}</div>
        </div>
      )
    case Decision.CONFIRM:
      return (
        <div className="flex items-center gap-[4px]">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-nv-orange-500" />
          <div className="text-nv-white">{decision}</div>
        </div>
      )
    default:
      return <div className="text-nv-white">{decision}</div>
  }
}

const PlaygroundEditor = () => {
  const { engineUrl, engineClientId, vaultUrl, vaultClientId } = useStore()
  const { errors: evaluationErrors, evaluateRequest } = useEngineApi()
  const { errors: signatureErrors, signTransaction, importPrivateKey } = useVaultApi()

  const [editor, setEditor] = useState<string>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [response, setResponse] = useState<any>()
  const [errors, setErrors] = useState<string>()

  useEffect(() => {
    if (editor) return

    updateTemplate(Template.ERC20)
  }, [editor])

  useEffect(() => {
    if (evaluationErrors) {
      setErrors(evaluationErrors)
    }
    if (signatureErrors) {
      setErrors(signatureErrors)
    }
  }, [evaluationErrors, signatureErrors])

  const canBeSigned = useMemo(() => {
    if (!editor || !response) return false

    try {
      const { authentication } = JSON.parse(editor)
      const { decision } = response

      return authentication && decision === Decision.PERMIT
    } catch (error) {
      return false
    }
  }, [editor, response])

  const resetResponse = () => {
    setResponse(undefined)
    setErrors(undefined)
  }

  const updateTemplate = async (template: Template) => {
    switch (template) {
      case Template.ERC20:
        resetResponse()
        setEditor(JSON.stringify(await erc20(), null, 2))
        break
      case Template.SPENDING_LIMITS:
        resetResponse()
        setEditor(JSON.stringify(await spendingLimits(), null, 2))
        break
      case Template.GRANT_PERMISSION:
        resetResponse()
        setEditor(JSON.stringify(await grantPermission(), null, 2))
        break
      default:
        break
    }
  }

  const sendEvaluation = async () => {
    if (!editor) return

    setIsProcessing(true)
    setErrors(undefined)

    const request: EvaluationRequest = JSON.parse(editor)
    const evaluationResponse = await evaluateRequest(engineUrl, engineClientId, request)

    if (evaluationResponse) {
      const { evaluation, authentication } = evaluationResponse
      setEditor(
        JSON.stringify(
          {
            ...request,
            ...(evaluation.decision === Decision.PERMIT && { authentication })
          },
          null,
          2
        )
      )
      setResponse(evaluation)
    }

    setIsProcessing(false)
  }

  const signRequest = async () => {
    if (!response) return

    const { accessToken, request } = response

    if (!accessToken?.value || !request) return

    setIsProcessing(true)
    setErrors(undefined)

    const signature = await signTransaction(vaultUrl, vaultClientId, { request }, accessToken.value)

    setResponse(signature)
    setIsProcessing(false)
  }

  const importWallet = async () => {
    if (!response) return

    const { accessToken, request } = response

    if (!accessToken?.value || !request) return

    setIsProcessing(true)
    setErrors(undefined)

    const wallet = await importPrivateKey(
      vaultUrl,
      vaultClientId,
      { privateKey: generatePrivateKey() },
      accessToken.value
    )

    setResponse(wallet)
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col gap-[48px] h-full">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Request Playground</div>
        <div className="flex gap-[8px]">
          <NarButton
            label="Evaluate"
            leftIcon={<FontAwesomeIcon icon={faArrowsRotate} />}
            onClick={sendEvaluation}
            disabled={isProcessing}
          />
          {canBeSigned && (
            <NarButton
              label="Sign"
              leftIcon={<FontAwesomeIcon icon={faFileSignature} />}
              onClick={signRequest}
              disabled={isProcessing}
            />
          )}
          {canBeSigned && (
            <NarButton
              label="Import Wallet"
              leftIcon={<FontAwesomeIcon icon={faUpload} />}
              onClick={importWallet}
              disabled={isProcessing}
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-[32px] grow">
        <div className="flex h-full col-span-2">
          <CodeEditor value={editor} onChange={setEditor} />
        </div>
        <div className="flex flex-col gap-[16px] h-full col-span-1">
          <div className="flex gap-[8px]">
            <NarButton variant="secondary" label="ERC-20" onClick={() => updateTemplate(Template.ERC20)} />
            <NarButton
              variant="secondary"
              label="Spending limits"
              onClick={() => updateTemplate(Template.SPENDING_LIMITS)}
            />
            <NarButton
              variant="secondary"
              label="Grant Permissions"
              onClick={() => updateTemplate(Template.GRANT_PERMISSION)}
            />
            {response && <EvaluationDecision decision={response?.decision} />}
          </div>
          {errors && <div className="text-nv-red-500 truncate">{errors}</div>}
          {!errors && response && (
            <div className="border-2 border-white rounded-xl p-[4px] overflow-auto">
              <pre>{JSON.stringify(response, null, 3)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaygroundEditor
