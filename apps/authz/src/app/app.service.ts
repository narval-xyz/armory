import {
  ApprovalSignature,
  AuthZRequest,
  AuthZRequestPayload,
  AuthZResponse,
  NarvalDecision
} from '@app/authz/shared/types/http'
import { Injectable } from '@nestjs/common'
import { recoverMessageAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { BlockchainActions } from '@app/authz/shared/types/enums'
import { OpaResult, RegoInput } from '@app/authz/shared/types/rego'
import { PersistenceRepository } from '@app/authz/shared/module/persistence/persistence.repository'
import { OpaService } from './opa/opa.service'

const ENGINE_PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

@Injectable()
export class AppService {
  constructor(private persistenceRepository: PersistenceRepository, private opaService: OpaService) {}
  getData(): { message: string } {
    return { message: 'Hello AuthZ API' }
  }

  async #populateApprovals(
    approvalSignatures: `0x${string}`[] | undefined,
    verificationMessage: string
  ): Promise<ApprovalSignature[] | null> {
    if (!approvalSignatures) return null
    const approvalSigs = await Promise.all(
      approvalSignatures.map(async (sig) => {
        const address = await recoverMessageAddress({
          message: verificationMessage,
          signature: sig
        })
        const userId = await this.persistenceRepository.getUserForAddress(address);

        return {
          signature: sig,
          address,
          userId
        }
      })
    )
    return approvalSigs
  }

  #getRegoInputFromRequest(
    principalId: string,
    request: AuthZRequest,
    approvals: ApprovalSignature[] | null
  ): RegoInput {
    const intent = request.activityType === BlockchainActions.SIGN_TRANSACTION ? request.intent : undefined
    // intent only exists in SignTransaction actions
    return {
      activityType: request.activityType,
      intent,
      request: request.transactionRequest,
      principal: {
        uid: principalId
      },
      resource: {
        uid: request.resourceId
      },
      signatures: approvals?.map((a) => ({ signer: a.userId })) || []
    }
  }

  #finalizeDecision(response: OpaResult[]) {
    const firstResponse = response[0]
    if (firstResponse.result.permit === false && !firstResponse.result.confirms?.length) {
      return {
        originalResponse: firstResponse,
        decision: NarvalDecision.Forbid
      }
    }
    // TODO: also verify errors

    if (firstResponse.result.confirms?.length) {
      // TODO: find the approvalsSatisfied and approvalsMissing data & format/return here
      return {
        originalResponse: firstResponse,
        decision: NarvalDecision.Confirm
      }
    }

    return {
      originalResponse: firstResponse,
      decision: NarvalDecision.Permit,
      totalApprovalsRequired: [],
      approvalsSatisfied: [],
      approvalsMissing: []
    }
  }

  async runEvaluation({ request, authn, approvalSignatures }: AuthZRequestPayload) {
    /**
     * Actual Eval Flow
     */

    // Pre-Process - verify the signature/recover the address
    const verificationMessage = JSON.stringify(request.transactionRequest)
    const recoveredAddress = await recoverMessageAddress({
      message: verificationMessage,
      signature: authn.signature
    })
    console.log('Recovered Principal address', recoveredAddress)
    const principalUserId = await this.persistenceRepository.getUserForAddress(recoveredAddress);

    if (!principalUserId) throw new Error(`Could not find user for address ${recoveredAddress}`)
    // Populate any approval signatures with recovered address/user info
    const populatedApprovals = await this.#populateApprovals(approvalSignatures, verificationMessage)

    const input = this.#getRegoInputFromRequest(principalUserId, request, populatedApprovals)

    // Actual Rego Evaluation
    const resultSet: OpaResult[] = await this.opaService.evaluate(input)

    console.log('OPA Result Set', JSON.stringify(resultSet, null, 2))

    // Post-processing to evaluate multisigs
    const finalDecision = this.#finalizeDecision(resultSet)

    const authzResponse: AuthZResponse = {
      decision: finalDecision.decision,
      transactionRequest: request.transactionRequest,
      totalApprovalsRequired: finalDecision.totalApprovalsRequired,
      approvalsSatisfied: finalDecision.approvalsSatisfied,
      approvalsMissing: finalDecision.approvalsMissing
    }

    // If we are allowing, then the ENGINE signs the verification too
    if (finalDecision.decision === NarvalDecision.Permit) {
      const permitSignature = await privateKeyToAccount(ENGINE_PRIVATE_KEY).signMessage({
        message: verificationMessage
      })
      authzResponse.permitSignature = permitSignature
    }

    console.log('End')

    return authzResponse;
  }
}
