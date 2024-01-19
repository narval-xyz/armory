import { PersistenceRepository } from '@app/authz/shared/module/persistence/persistence.repository'
import {
  Alg,
  AuthCredential,
  AuthZRequest,
  AuthZRequestPayload,
  AuthZResponse,
  HistoricalTransfer,
  NarvalDecision,
  RequestSignature
} from '@app/authz/shared/types/domain.type'
import { OpaResult, RegoInput } from '@app/authz/shared/types/rego'
import { hashRequest } from '@narval/authz-shared'
import { safeDecode } from '@narval/transaction-request-intent'
import { Injectable } from '@nestjs/common'
import { InputType } from 'packages/transaction-request-intent/src/lib/domain'
import { Intent } from 'packages/transaction-request-intent/src/lib/intent.types'
import { Hex, verifyMessage } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { OpaService } from './opa/opa.service'

const ENGINE_PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

export const finalizeDecision = (response: OpaResult[]) => {
  // Explicit Forbid - a Forbid rule type that matches & decides Forbid
  const anyExplicitForbid = response.some((r) => r.permit === false && r.reasons?.some((rr) => rr.type === 'forbid'))

  const allPermit = response.every((r) => r.permit === true && r.reasons?.every((rr) => rr.type === 'permit'))

  const anyPermitWithMissingApprovals = response.some((r) =>
    r.reasons?.some((rr) => rr.type === 'permit' && rr.approvalsMissing.length > 0)
  )

  if (anyExplicitForbid) {
    return {
      originalResponse: response,
      decision: NarvalDecision.Forbid,
      approvalsMissing: [],
      approvalsSatisfied: []
    }
  }
  // Collect all the approvalsMissing & approvalsSatisfied using functional map/flat operators
  const approvalsSatisfied = response
    .flatMap((r) => r.reasons?.flatMap((rr) => rr.approvalsSatisfied))
    .filter((v) => !!v)
  const approvalsMissing = response.flatMap((r) => r.reasons?.flatMap((rr) => rr.approvalsMissing)).filter((v) => !!v)
  const totalApprovalsRequired = approvalsMissing.concat(approvalsSatisfied)

  const decision = allPermit && !anyPermitWithMissingApprovals ? NarvalDecision.Permit : NarvalDecision.Confirm
  return {
    originalResponse: response,
    decision,
    totalApprovalsRequired,
    approvalsMissing,
    approvalsSatisfied
  }
}

@Injectable()
export class AppService {
  constructor(private persistenceRepository: PersistenceRepository, private opaService: OpaService) {}

  async #verifySignature(requestSignature: RequestSignature, verificationMessage: string): Promise<AuthCredential> {
    const { pubKey, alg, sig } = requestSignature
    const credential = await this.persistenceRepository.getCredentialForPubKey(pubKey)
    if (alg === Alg.ES256K) {
      // TODO: ensure sig & pubkey begins with 0x
      const signature = sig.startsWith('0x') ? sig : `0x${sig}`
      const address = pubKey as Hex
      const valid = await verifyMessage({
        message: verificationMessage,
        address,
        signature: signature as Hex
      })
      if (!valid) throw new Error('Invalid Signature')
    }
    // TODO: verify other alg types

    return credential
  }

  async #populateApprovals(
    approvals: RequestSignature[] | undefined,
    verificationMessage: string
  ): Promise<AuthCredential[] | null> {
    if (!approvals) return null
    const approvalSigs = await Promise.all(
      approvals.map(async ({ sig, alg, pubKey }) => {
        const credential = await this.#verifySignature({ sig, alg, pubKey }, verificationMessage)
        return credential
      })
    )
    return approvalSigs
  }

  #buildRegoInput({
    principal,
    request,
    approvals,
    intent,
    transfers
  }: {
    principal: AuthCredential
    request: AuthZRequest
    approvals: AuthCredential[] | null
    intent?: Intent
    transfers?: HistoricalTransfer[]
  }): RegoInput {
    // intent only exists in SignTransaction actions
    return {
      action: request.action,
      intent,
      transactionRequest: request.transactionRequest,
      principal,
      resource: request.resourceId
        ? {
            uid: request.resourceId
          }
        : undefined,
      approvals: approvals || [],
      transfers: transfers || []
    }
  }

  /**
   * Actual Eval Flow
   */
  async runEvaluation({ request, authentication, approvals, transfers }: AuthZRequestPayload) {
    // Pre-Process
    // verify the signatures of the Principal and any Approvals
    const verificationMessage = hashRequest(request)
    const principalCredential = await this.#verifySignature(authentication, verificationMessage)
    if (!principalCredential) throw new Error(`Could not find principal`)
    const populatedApprovals = await this.#populateApprovals(approvals, verificationMessage)

    // Decode the intent
    const intentResult = request.transactionRequest
      ? safeDecode({
          type: InputType.TRANSACTION_REQUEST,
          txRequest: request.transactionRequest
        })
      : undefined
    if (intentResult?.success === false) throw new Error(`Could not decode intent: ${intentResult.error.message}`)
    const intent = intentResult?.intent

    const input = this.#buildRegoInput({
      principal: principalCredential,
      request,
      approvals: populatedApprovals,
      intent,
      transfers
    })

    // Actual Rego Evaluation
    const resultSet: OpaResult[] = await this.opaService.evaluate(input)

    console.log('OPA Result Set', JSON.stringify(resultSet, null, 2))

    // Post-processing to evaluate multisigs
    const finalDecision = finalizeDecision(resultSet)

    const authzResponse: AuthZResponse = {
      decision: finalDecision.decision,
      request,
      totalApprovalsRequired: finalDecision.totalApprovalsRequired,
      approvalsMissing: finalDecision.approvalsMissing,
      approvalsSatisfied: finalDecision.approvalsSatisfied
    }

    // If we are allowing, then the ENGINE signs the verification too
    if (finalDecision.decision === NarvalDecision.Permit) {
      // TODO: store a global configuration on the response signature alg
      const engineAccount = privateKeyToAccount(ENGINE_PRIVATE_KEY)
      const permitSignature = await engineAccount.signMessage({
        message: verificationMessage
      })
      authzResponse.permitSignature = {
        sig: permitSignature,
        alg: Alg.ES256K,
        pubKey: engineAccount.address // TODO: should this be account.publicKey?
      }
    }

    console.log('End')

    return authzResponse
  }
}
