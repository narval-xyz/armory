'use client'

import Editor from '@monaco-editor/react'
import { EntityUtil, entityDataSchema, policyDataSchema } from '@narval/policy-engine-shared'
import { Jwk, Payload, SigningAlg, hash, hexToBase64Url, signJwt } from '@narval/signature'
import { signMessage } from '@wagmi/core'
import axios from 'axios'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import NarButton from '../design-system/NarButton'
import NarDialog from '../design-system/NarDialog'
import NarInput from '../design-system/NarInput'
import { config } from '../lib/config'

const DATA_STORE_URL = 'http://127.0.0.1:4200/api/data-store'
const ENGINE_URL = 'http://127.0.0.1:3010'

const LOCAL_STORAGE_KEYS = {
  engineApiKey: 'narvalEngineApiKey',
  engineClientId: 'narvalEngineClientId',
  engineClientSecret: 'narvalEngineClientSecret',
  engineUrl: 'narvalEngineUrl',
  entityDataStoreUrl: 'narvalEntityDataStoreUrl',
  policyDataStoreUrl: 'narvalPolicyDataStoreUrl',
  entitySignatureUrl: 'narvalEntitySignatureUrl',
  policySignatureUrl: 'narvalPolicySignatureUrl'
}

const CodeEditor = () => {
  const account = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  const [engineApiKey, setEngineApiKey] = useLocalStorage(LOCAL_STORAGE_KEYS.engineApiKey, '')
  const [engineClientId, setEngineClientId] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientId, '')
  const [engineClientSecret, setEngineClientSecret] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientSecret, '')
  const [engineUrl, setEngineUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.engineUrl, ENGINE_URL)
  const [entityDataStoreUrl, setEntityDataStoreUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.entityDataStoreUrl,
    DATA_STORE_URL
  )
  const [entitySignatureUrl, setEntitySignatureUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.entitySignatureUrl,
    DATA_STORE_URL
  )
  const [policyDataStoreUrl, setPolicyDataStoreUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.policyDataStoreUrl,
    DATA_STORE_URL
  )
  const [policySignatureUrl, setPolicySignatureUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.policySignatureUrl,
    DATA_STORE_URL
  )

  const [data, setData] = useState<string>()
  const [jwk, setJwk] = useState<Jwk>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  useEffect(() => {
    if (data) return

    const getData = async () => {
      const dataStore = await axios.get('/api/data-store')
      const { entity, policy } = dataStore.data
      setData(JSON.stringify({ entity: entity.data, policy: policy.data }, null, 2))
    }

    getData()
  }, [data])

  useEffect(() => {
    if (!account.address) return
    if (jwk) return

    setJwk({
      kty: 'EC',
      crv: 'secp256k1',
      alg: SigningAlg.ES256K,
      kid: account.address
    })
  }, [account])

  const sign = async () => {
    if (!data || !jwk) return

    const { entity, policy } = JSON.parse(data)

    const entityValidationResult = entityDataSchema.safeParse({ entity: { data: entity } })

    if (!entityValidationResult.success) {
      setValidationErrors(
        entityValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`)
      )
      setIsDialogOpen(true)
      return
    }

    const policyValidationResult = policyDataSchema.safeParse({ policy: { data: policy } })

    if (!policyValidationResult.success) {
      setValidationErrors(
        policyValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`)
      )
      setIsDialogOpen(true)
      return
    }

    const validation = EntityUtil.validate(entity)

    if (!validation.success) {
      setValidationErrors(validation.issues.map((issue) => issue.message))
      setIsDialogOpen(true)
      return
    }

    const jwtSigner = async (message: string) => {
      const jwtSig = await signMessage(config, { message })

      return hexToBase64Url(jwtSig)
    }

    if (!account.address) {
      throw new Error('No address connected')
    }

    const now = Math.floor(Date.now() / 1000)

    const entityPayload: Payload = {
      data: hash(entity),
      sub: account.address,
      iss: 'https://devtool.narval.xyz',
      iat: now
    }

    const policyPayload: Payload = {
      data: hash(policy),
      sub: account.address,
      iss: 'https://devtool.narval.xyz',
      iat: now
    }
    const entitySig = await signJwt(entityPayload, jwk, { alg: SigningAlg.EIP191 }, jwtSigner)
    const policySig = await signJwt(policyPayload, jwk, { alg: SigningAlg.EIP191 }, jwtSigner)

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

    console.log('Data signed and stored!')

    await axios.post(`${engineUrl}/tenants/sync`, null, {
      headers: {
        'x-client-id': engineClientId,
        'x-client-secret': engineClientSecret
      }
    })

    console.log('Data store synced with engine!')
  }

  const onboard = async () => {
    const { data: tenant } = await axios.post(
      `${engineUrl}/tenants`,
      {
        ...(engineClientId && { clientId: engineClientId }),
        entityDataStore: {
          dataUrl: entityDataStoreUrl,
          signatureUrl: entitySignatureUrl
        },
        policyDataStore: {
          dataUrl: policyDataStoreUrl,
          signatureUrl: policySignatureUrl
        }
      },
      {
        headers: {
          'x-api-key': engineApiKey
        }
      }
    )

    setEngineClientId(tenant.clientId)
    setEngineClientSecret(tenant.clientSecret)
  }

  return (
    <>
      <div className="flex flex-col gap-[40px]">
        <div className="flex items-center">
          <Image
            src="/narval-wordmark-white.png"
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
                  <NarButton
                    label=" Connect Wallet"
                    variant="primary"
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                  />
                ))}
              </div>
            )}
            {account.isConnected && (
              <>
                <NarButton label="Disconnect" variant="secondary" onClick={() => disconnect()} />
                <NarButton label="Sign" variant="primary" onClick={() => sign()} />
              </>
            )}
          </div>
        </div>
        <div className="flex gap-[32px]">
          <div className="flex flex-col gap-[24px] w-1/2">
            <div className="flex flex-col gap-[8px]">
              <div className="underline">Entity Data store config:</div>
              <div className="flex items-center gap-[4px]">
                <div className="w-[200px]">Data URL:</div>
                <NarInput value={entityDataStoreUrl} onChange={setEntityDataStoreUrl} />
              </div>
              <div className="flex items-center gap-[4px]">
                <div className="w-[200px]">Signature URL:</div>
                <NarInput value={entitySignatureUrl} onChange={setEntitySignatureUrl} />
              </div>
            </div>
            <div className="flex flex-col gap-[8px]">
              <div className="underline">Policy Data store config:</div>
              <div className="flex items-center gap-[4px]">
                <div className="w-[200px]">Data URL:</div>
                <NarInput value={policyDataStoreUrl} onChange={setPolicyDataStoreUrl} />
              </div>
              <div className="flex items-center gap-[4px]">
                <div className="w-[200px]">Signature URL:</div>
                <NarInput value={policySignatureUrl} onChange={setPolicySignatureUrl} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[8px] w-1/2">
            <div className="underline">Policy Engine config:</div>
            <div className="flex items-center gap-[4px]">
              <div className="w-[200px]">Engine URL:</div>
              <NarInput value={engineUrl} onChange={setEngineUrl} />
            </div>
            <div className="flex items-center gap-[4px]">
              <div className="w-[200px]">Engine API Key:</div>
              <NarInput value={engineApiKey} onChange={setEngineApiKey} />
            </div>
            {engineClientId && (
              <div className="flex items-center gap-[4px]">
                <div className="w-[200px]">Engine Client ID:</div>
                <div>{engineClientId}</div>
              </div>
            )}
            {engineClientSecret && (
              <div className="flex items-center gap-[4px]">
                <div className="w-[200px]">Engine Client Secret:</div>
                <div>{engineClientSecret}</div>
              </div>
            )}
            {engineUrl && engineApiKey && !engineClientId && <NarButton label="Onboard Tenant" onClick={onboard} />}
          </div>
        </div>
        <div className="border-2 border-white rounded-xl p-4">
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
      {isDialogOpen && (
        <NarDialog
          triggerButton={<></>}
          title="Data validation failed"
          primaryButtonLabel="OK"
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onDismiss={() => setIsDialogOpen(false)}
          isConfirm
        >
          <div className="px-[52px] py-[16px]">
            <ul className="flex flex-col gap-[4px] text-nv-white text-nv-sm list-disc">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </NarDialog>
      )}
    </>
  )
}

export default CodeEditor
