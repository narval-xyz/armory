/* eslint-disable no-empty */
'use client'

import { faArrowsRotate, faFileSignature } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  AuthorizationRequest,
  ImportPrivateKeyRequest,
  ImportPrivateKeyResponse,
  SdkEvaluationResponse,
  SignatureRequest,
  SignatureResponse
} from '@narval/armory-sdk'
import { EvaluationRequest, hexSchema } from '@narval/policy-engine-shared'
import { FC, useEffect, useState } from 'react'
import NarButton from '../_design-system/NarButton'
import useStore from '../_hooks/useStore'
import { erc20, grantPermission, spendingLimits } from '../_lib/request'
import CodeEditor from './CodeEditor'
import ImportPrivateKeyModal from './ImportPrivateKeyModal'
import PlaygroundConfigModal from './PlaygroundConfigModal'
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
  importPk?: (req: ImportPrivateKeyRequest) => Promise<ImportPrivateKeyResponse> | undefined
  validateResponse: (res: any) => Promise<SignatureRequest | undefined>
}

const Playground: FC<PlaygroundProps> = ({
  title,
  response,
  errors,
  authorize,
  evaluate,
  sign,
  importPk,
  validateResponse
}) => {
  const { engineClientId, vaultClientId } = useStore()
  const [requestEditor, setRequestEditor] = useState<string>()
  const [responseEditor, setResponseEditor] = useState<string>()
  const [accessToken, setAccessToken] = useState('')
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
      const authResponseParsed = AuthorizationRequest.parse(JSON.parse(response))
      setAccessToken(authResponseParsed.evaluations[0]?.signature || '')
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

    try {
      setIsProcessing(true)
      setResponseEditor(undefined)
      const request = JSON.parse(requestEditor)
      const response = authorize && (await authorize(request))
      if (response) {
        setResponseEditor(JSON.stringify(response, null, 2))
        const authResponseParsed = AuthorizationRequest.parse(response)
        setAccessToken(authResponseParsed.evaluations[0]?.signature || '')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEvaluation = async () => {
    if (!requestEditor) return

    try {
      setIsProcessing(true)
      setResponseEditor(undefined)
      const request = JSON.parse(requestEditor)
      const response = evaluate && (await evaluate(request))
      if (response) {
        setResponseEditor(JSON.stringify(response, null, 2))
        const evalResponseParsed = SdkEvaluationResponse.parse(response)
        setAccessToken(evalResponseParsed.accessToken?.value || '')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSign = async () => {
    if (!responseEditor) return

    const responseJson = JSON.parse(responseEditor)

    const signatureReq = await validateResponse(responseJson)

    if (!signatureReq) return

    try {
      setIsProcessing(true)
      setResponseEditor(undefined)
      const response = sign && (await sign(signatureReq))
      if (response) setResponseEditor(JSON.stringify(response, null, 2))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async (privateKey: string, accessToken: string) => {
    try {
      setIsProcessing(true)
      setResponseEditor(undefined)

      const response =
        importPk && (await importPk({ privateKey: hexSchema.parse(privateKey), accessToken: { value: accessToken } }))

      if (response) {
        setResponseEditor(JSON.stringify(response, null, 2))
      }

      return response
    } finally {
      setIsProcessing(false)
    }
  }

  if (!domLoaded) return null

  return (
    <div className="flex flex-col gap-[32px] h-full">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">{title}</div>
        <div className="flex items-center gap-[8px]">
          {authorize && engineClientId && (
            <NarButton
              label="Authorize"
              leftIcon={<FontAwesomeIcon icon={faArrowsRotate} />}
              onClick={handleAuthorization}
              disabled={isProcessing}
            />
          )}
          {evaluate && engineClientId && (
            <NarButton
              label="Evaluate"
              leftIcon={<FontAwesomeIcon icon={faArrowsRotate} />}
              onClick={handleEvaluation}
              disabled={isProcessing}
            />
          )}
          {sign && vaultClientId && (
            <NarButton
              label="Sign"
              leftIcon={<FontAwesomeIcon icon={faFileSignature} />}
              onClick={handleSign}
              disabled={isProcessing}
            />
          )}
          {importPk && vaultClientId && <ImportPrivateKeyModal accessToken={accessToken} import={handleImport} />}
          <PlaygroundConfigModal displayAuthServerUrl={Boolean(authorize)} />
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
