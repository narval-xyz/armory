'use client'

import Editor from '@monaco-editor/react'
import { EntityUtil, entityDataSchema, policyDataSchema } from '@narval/policy-engine-shared'
import { Curves, Jwk, KeyTypes, Payload, SigningAlg, hash, hexToBase64Url, signJwt } from '@narval/signature'
import { signMessage } from '@wagmi/core'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import NarButton from '../../design-system/NarButton'
import NarDialog from '../../design-system/NarDialog'
import NarInput from '../../design-system/NarInput'
import useStore from '../../hooks/useStore'
import { config } from '../../lib/config'

const DataStoreEditor = () => {
  const account = useAccount()
  const {
    engineUrl,
    engineClientId,
    engineClientSecret,
    entityDataStoreUrl,
    setEntityDataStoreUrl,
    entitySignatureUrl,
    setEntitySignatureUrl,
    policyDataStoreUrl,
    setPolicyDataStoreUrl,
    policySignatureUrl,
    setPolicySignatureUrl
  } = useStore()

  const [data, setData] = useState<string>()
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

  const signData = async () => {
    if (!data) return
    if (!account.address) return

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

    const jwk: Jwk = {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: account.address
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

  return (
    <>
      <div className="flex gap-12">
        <div className="flex flex-col gap-6 w-1/3">
          <NarInput label="Data URL" value={entityDataStoreUrl} onChange={setEntityDataStoreUrl} />
          <NarInput label="Signature URL" value={entitySignatureUrl} onChange={setEntitySignatureUrl} />
          <NarInput label="Data URL" value={policyDataStoreUrl} onChange={setPolicyDataStoreUrl} />
          <NarInput label="Signature URL" value={policySignatureUrl} onChange={setPolicySignatureUrl} />
          <div className="flex flex-row-reverse">
            <NarButton label="Sign Data" onClick={signData} />
          </div>
        </div>
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
          <div className="px-12 py-4">
            <ul className="flex flex-col gap-1 text-nv-white text-nv-sm list-disc">
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

export default DataStoreEditor
