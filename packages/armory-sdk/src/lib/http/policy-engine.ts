import {
  EvaluationResponse,
  SerializedEvaluationRequest,
  SerializedEvaluationResponse
} from '@narval/policy-engine-shared'
import axios from 'axios'
import { SendEvaluationRequest } from './schema'

export const sendEvaluationRequest = async (input: SendEvaluationRequest): Promise<EvaluationResponse> => {
  const { uri, request, headers } = input

  const serializedRequest = SerializedEvaluationRequest.parse(request)
  const { data } = await axios.post<SerializedEvaluationResponse>(uri, serializedRequest, {
    headers
  })

  return EvaluationResponse.parse(data)
}
