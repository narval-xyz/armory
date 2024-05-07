import { SerializedRequest } from '@narval/policy-engine-shared'
import axios from 'axios'
import { ImportPrivateKeyResponse, SignatureResponse } from '../domain'
import { SendImportPrivateKey, SendSignatureRequest } from './schema'

export const sendSignatureRequest = async (input: SendSignatureRequest): Promise<SignatureResponse> => {
  const { uri, headers, request } = input
  const serializedRequest = SerializedRequest.parse(request)
  const { data } = await axios.post(
    uri,
    { request: serializedRequest },
    {
      headers
    }
  )

  return data
}

export const sendImportPrivateKey = async (input: SendImportPrivateKey): Promise<ImportPrivateKeyResponse> => {
  const { uri, headers, request } = input

  const { data } = await axios.post(uri, request, {
    headers
  })
  return data
}
