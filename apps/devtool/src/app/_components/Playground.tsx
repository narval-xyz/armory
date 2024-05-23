'use client'

import { faArrowsRotate, faFileSignature, faUpload } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  AuthorizationRequest,
  ImportPrivateKeyRequest,
  ImportPrivateKeyResponse,
  SdkEvaluationResponse,
  SignatureRequest,
  SignatureResponse
} from '@narval/armory-sdk'
import { EvaluationRequest } from '@narval/policy-engine-shared'
import { FC, useEffect, useState } from 'react'
import { generatePrivateKey } from 'viem/accounts'
import NarButton from '../_design-system/NarButton'
import useStore from '../_hooks/useStore'
import { erc20, grantPermission, spendingLimits } from '../_lib/request'
import CodeEditor from './CodeEditor'
import RequestPlaygroundConfigModal from './PlaygroundConfigModal'
import ValueWithCopy from './ValueWithCopy'

enum Template {
  ERC20 = 'ERC20',
  SPENDING_LIMITS = 'SPENDING_LIMITS',
  GRANT_PERMISSION = 'GRANT_PERMISSION'
}

interface PlaygroundProps {
  title: string
  response?: string
  errors?: string | undefined
  authorize?: (req: EvaluationRequest) => Promise<AuthorizationRequest | undefined> | undefined
  evaluate?: (req: EvaluationRequest) => Promise<SdkEvaluationResponse> | undefined
  sign?: (req: SignatureRequest) => Promise<SignatureResponse> | undefined
  importPk?: (req: ImportPrivateKeyRequest) => Promise<ImportPrivateKeyResponse | SdkEvaluationResponse> | undefined
}

const Playground: FC<PlaygroundProps> = ({ title, response, errors, authorize, evaluate, sign, importPk }) => {
  const { engineClientId, vaultClientId } = useStore()
  const [requestEditor, setRequestEditor] = useState<string>()
  const [responseEditor, setResponseEditor] = useState<string>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [domLoaded, setDomLoaded] = useState(false)

  useEffect(() => setDomLoaded(true), [])

  useEffect(() => {
    if (requestEditor) return

    updateTemplate(Template.ERC20)
  }, [requestEditor])

  useEffect(() => {
    if (response) {
      setResponseEditor(response)
    }
  }, [response])

  useEffect(() => {
    if (errors) {
      setResponseEditor(`{ errors: ${errors} }`)
    }
  }, [errors])

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

  const handleAuthorization = async () => {
    if (!requestEditor) return

    setIsProcessing(true)

    try {
      setResponseEditor(undefined)
      const request = JSON.parse(requestEditor)
      const response = authorize && (await authorize(request))
      if (response) setResponseEditor(JSON.stringify(response, null, 2))
    } catch (error) {}

    setIsProcessing(false)
  }

  const handleEvaluation = async () => {
    if (!requestEditor) return

    setIsProcessing(true)

    try {
      setResponseEditor(undefined)
      const request = JSON.parse(requestEditor)
      const response = evaluate && (await evaluate(request))
      if (response) setResponseEditor(JSON.stringify(response, null, 2))
    } catch (error) {}

    setIsProcessing(false)
  }

  const handleSign = async () => {
    if (!responseEditor) return

    const { accessToken, request } = JSON.parse(responseEditor)

    if (!accessToken || !request) return

    setIsProcessing(true)

    try {
      setResponseEditor(undefined)
      const response = sign && (await sign({ accessToken, request }))
      if (response) setResponseEditor(JSON.stringify(response, null, 2))
    } catch (error) {}

    setIsProcessing(false)
  }

  const handleImport = async () => {
    setIsProcessing(true)

    try {
      setResponseEditor(undefined)
      const response = importPk && (await importPk({ privateKey: generatePrivateKey() }))
      if (response) setResponseEditor(JSON.stringify(response, null, 2))
    } catch (error) {}

    setIsProcessing(false)
  }

  if (!domLoaded) return null

  return (
    <div className="flex flex-col gap-[32px] h-full">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">{title}</div>
        <div className="flex items-center gap-[8px]">
          {authorize && (
            <NarButton
              label="Authorize"
              leftIcon={<FontAwesomeIcon icon={faArrowsRotate} />}
              onClick={handleAuthorization}
              disabled={isProcessing}
            />
          )}
          {evaluate && (
            <NarButton
              label="Evaluate"
              leftIcon={<FontAwesomeIcon icon={faArrowsRotate} />}
              onClick={handleEvaluation}
              disabled={isProcessing}
            />
          )}
          {sign && (
            <NarButton
              label="Sign"
              leftIcon={<FontAwesomeIcon icon={faFileSignature} />}
              onClick={handleSign}
              disabled={isProcessing}
            />
          )}
          {importPk && (
            <NarButton
              label="Import Private Key"
              leftIcon={<FontAwesomeIcon icon={faUpload} />}
              onClick={handleImport}
              disabled={isProcessing}
            />
          )}
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

export default Playground
