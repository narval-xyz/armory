import { JwtError, hash, verifyJwt } from '@narval/signature'
import { EvaluationRequest } from '../type/domain.type'

export class ConfirmationClaimError extends Error {}

export const verifyConfirmationClaimProofOfPossession = async (evaluation: EvaluationRequest): Promise<boolean> => {
  if (evaluation.metadata?.confirmation && evaluation.metadata.confirmation?.key.proof) {
    const { confirmation } = evaluation.metadata

    if (!confirmation.key.jws) {
      throw new ConfirmationClaimError('Missing confirmation claim jws')
    }

    try {
      const jwt = await verifyJwt(confirmation.key.jws, confirmation.key.jwk)
      const message = hash(evaluation.request)

      if (jwt.payload.requestHash !== message) {
        throw new ConfirmationClaimError('Confirmation claim jws hash mismatch')
      }
    } catch (error: unknown) {
      if (error instanceof JwtError) {
        throw new ConfirmationClaimError(`Invalid confirmation claim jws: ${error.message}`)
      }

      throw error
    }
  }

  return true
}
