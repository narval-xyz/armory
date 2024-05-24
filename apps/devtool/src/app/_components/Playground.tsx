/* eslint-disable no-empty */
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
import { EvaluationRequest, hexSchema } from '@narval/policy-engine-shared'
import { FC, useEffect, useState } from 'react'
import { generatePrivateKey } from 'viem/accounts'
import NarButton from '../_design-system/NarButton'
import NarDialog from '../_design-system/NarDialog'
import NarInput from '../_design-system/NarInput'
import useStore from '../_hooks/useStore'
import { erc20, grantPermission, spendingLimits } from '../_lib/request'
import CodeEditor from './CodeEditor'
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
  importPk?: (req: ImportPrivateKeyRequest) => Promise<ImportPrivateKeyResponse | SdkEvaluationResponse> | undefined
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [domLoaded, setDomLoaded] = useState(false)
  const [privateKey, setPrivateKey] = useState('')

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

    const responseJson = JSON.parse(responseEditor)

    const signatureReq = await validateResponse(responseJson)

    if (!signatureReq) return

    setIsProcessing(true)

    try {
      setResponseEditor(undefined)
      const response = sign && (await sign(signatureReq))
      if (response) setResponseEditor(JSON.stringify(response, null, 2))
    } catch (error) {}

    setIsProcessing(false)
  }

  const handleImport = async () => {
    setIsProcessing(true)

    try {
      setResponseEditor(undefined)

      const response = importPk && (await importPk({ privateKey: hexSchema.parse(privateKey) }))

      if (response) setResponseEditor(JSON.stringify(response, null, 2))

      closeDialog()
    } catch (error) {}

    setIsProcessing(false)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setPrivateKey('')
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
          {importPk && vaultClientId && (
            <NarDialog
              triggerButton={<NarButton label="Import Private Key" leftIcon={<FontAwesomeIcon icon={faUpload} />} />}
              title="Import Private Key"
              primaryButtonLabel="Import"
              isOpen={isDialogOpen}
              onOpenChange={(val) => (val ? setIsDialogOpen(val) : closeDialog())}
              onDismiss={closeDialog}
              onSave={handleImport}
              isSaving={isProcessing}
              isSaveDisabled={!privateKey || isProcessing}
            >
              <div className="w-[650px] px-12 py-4">
                <div className="flex gap-6">
                  <NarInput value={privateKey} onChange={setPrivateKey} />
                  <NarButton label="Generate" onClick={() => setPrivateKey(generatePrivateKey())} />
                </div>
              </div>
            </NarDialog>
          )}
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
