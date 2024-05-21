'use client'

import { faArrowsRotate, faFileSignature, faUpload } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EvaluationRequest } from '@narval/policy-engine-shared'
import { useEffect, useState } from 'react'
import { generatePrivateKey } from 'viem/accounts'
import CodeEditor from '../../_components/CodeEditor'
import ValueWithCopy from '../../_components/ValueWithCopy'
import NarButton from '../../_design-system/NarButton'
import useEngineApi from '../../_hooks/useEngineApi'
import useStore from '../../_hooks/useStore'
import useVaultApi from '../../_hooks/useVaultApi'
import { erc20, grantPermission, spendingLimits } from '../../_lib/request'
import RequestPlaygroundConfigModal from './RequestPlaygroundConfigModal'

enum Template {
  ERC20 = 'ERC20',
  SPENDING_LIMITS = 'SPENDING_LIMITS',
  GRANT_PERMISSION = 'GRANT_PERMISSION'
}

const RequestPlayground = () => {
  const { engineClientId, vaultClientId } = useStore()
  const { errors: evaluationErrors, evaluateRequest } = useEngineApi()
  const { errors: signatureErrors, sign, importPK: importPrivateKey } = useVaultApi()

  const [domLoaded, setDomLoaded] = useState(false)
  const [requestEditor, setRequestEditor] = useState<string>()
  const [responseEditor, setResponseEditor] = useState<string>()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => setDomLoaded(true), [])

  useEffect(() => {
    if (requestEditor) return

    updateTemplate(Template.ERC20)
  }, [requestEditor])

  useEffect(() => {
    if (evaluationErrors) {
      setResponseEditor(`{ error: ${evaluationErrors} }`)
    } else if (signatureErrors) {
      setResponseEditor(`{ error: ${signatureErrors} }`)
    }
  }, [evaluationErrors, signatureErrors])

  const updateTemplate = async (template: Template) => {
    switch (template) {
      case Template.ERC20:
        setResponseEditor(undefined)
        setRequestEditor(JSON.stringify(await erc20(), null, 2))
        break
      case Template.SPENDING_LIMITS:
        setResponseEditor(undefined)
        setRequestEditor(JSON.stringify(await spendingLimits(), null, 2))
        break
      case Template.GRANT_PERMISSION:
        setResponseEditor(undefined)
        setRequestEditor(JSON.stringify(await grantPermission(), null, 2))
        break
      default:
        break
    }
  }

  const sendEvaluation = async () => {
    if (!requestEditor) return

    try {
      setIsProcessing(true)
      setResponseEditor(undefined)
      const request: EvaluationRequest = JSON.parse(requestEditor)
      const evaluationResponse = await evaluateRequest(request)
      if (evaluationResponse) {
        setResponseEditor(JSON.stringify(evaluationResponse, null, 2))
      }
    } catch (error) {}

    setIsProcessing(false)
  }

  const signRequest = async () => {
    if (!responseEditor) return
    const { accessToken, request } = JSON.parse(responseEditor)
    if (!accessToken || !request) return

    try {
      setIsProcessing(true)
      setResponseEditor(undefined)
      const signature = await sign({ accessToken, request })
      setResponseEditor(JSON.stringify(signature, null, 2))
    } catch (error) {}

    setIsProcessing(false)
  }

  const importWallet = async () => {
    try {
      setIsProcessing(true)
      setResponseEditor(undefined)
      const wallet = await importPrivateKey({ privateKey: generatePrivateKey() })
      setResponseEditor(JSON.stringify(wallet, null, 2))
    } catch (error) {}

    setIsProcessing(false)
  }

  if (!domLoaded) return null

  return (
    <div className="flex flex-col gap-[32px] h-full">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Request Playground</div>
        <div className="flex items-center gap-[8px]">
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
            disabled={isProcessing}
          />
          <NarButton
            label="Import Wallet"
            leftIcon={<FontAwesomeIcon icon={faUpload} />}
            onClick={importWallet}
            disabled={isProcessing}
          />
          <RequestPlaygroundConfigModal />
        </div>
      </div>
      <div className="flex items-start">
        <div className="grow">
          <div className="flex flex-col gap-[8px]">
            <ValueWithCopy layout="horizontal" label="Engine Client ID" value={engineClientId} />
            <ValueWithCopy layout="horizontal" label="Vault Client ID" value={vaultClientId} />
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          <div className="underline text-nv-xs">Templates:</div>
          <NarButton variant="quaternary" label="ERC-20" onClick={() => updateTemplate(Template.ERC20)} />
          <NarButton
            variant="quaternary"
            label="Spending limits"
            onClick={() => updateTemplate(Template.SPENDING_LIMITS)}
          />
          <NarButton
            variant="quaternary"
            label="Grant Permissions"
            onClick={() => updateTemplate(Template.GRANT_PERMISSION)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[32px] grow">
        <CodeEditor value={requestEditor} onChange={setRequestEditor} />
        <CodeEditor value={responseEditor} readOnly />
      </div>
    </div>
  )
}

export default RequestPlayground
