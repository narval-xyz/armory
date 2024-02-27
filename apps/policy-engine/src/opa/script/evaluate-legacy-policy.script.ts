// eslint-disable @typescript-eslint/no-explicit-any
import { Action, Request, UserRole } from '@narval/policy-engine-shared'
import { InputType, safeDecode } from '@narval/transaction-request-intent'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { readFileSync } from 'fs'
import path from 'path'
import { OpaResult, RegoInput } from '../../shared/types/domain.type'
import users from './data/users.json'
import wallets from './data/wallets.json'
import legacyRequests from './requests/legacy-requests.json'

export const run = async () => {
  const entities: { [key: string]: any } = { users: {}, wallets: {} }

  for (const user of users as any[]) {
    let role = user.guildUserRole
    if (['SCHOLAR'].includes(role)) {
      role = UserRole.MEMBER
    } else if (['ADMIN', 'API'].includes(role)) {
      role = UserRole.ADMIN
    }
    entities.users[user.id] = { uid: user.id, role }
  }

  for (const wallet of wallets as any[]) {
    const uid = `eip155:${wallet.accountType}:${wallet.address}`
    entities.wallets[uid] = {
      uid,
      address: wallet.address,
      accountType: wallet.accountType,
      assignees: wallet.assignees?.map((assignee: any) => assignee.userId) || []
    }
  }

  const requests = legacyRequests.filter(
    ({ initiator_user_id }) => undefined !== entities.users[initiator_user_id]
  ) as {
    status: string
    initiator_user_id: string
    request: Request
  }[]

  for (const { status, initiator_user_id, request } of requests) {
    let input = {} as RegoInput

    if (request.action === Action.SIGN_TRANSACTION) {
      const intentResult = safeDecode({
        input: {
          type: InputType.TRANSACTION_REQUEST,
          txRequest: request.transactionRequest
        }
      })

      if (intentResult?.success === false) {
        console.log(
          `Could not decode intent: ${intentResult.error.message}`,
          JSON.stringify(request.transactionRequest, null, 2)
        )
        continue
      }

      input = {
        action: request.action,
        intent: intentResult?.intent,
        transactionRequest: request.transactionRequest,
        principal: {
          uid: initiator_user_id,
          userId: initiator_user_id,
          alg: 'ES256K',
          pubKey: ''
        },
        resource: request.resourceId ? { uid: request.resourceId } : undefined,
        approvals: []
      }
    }

    if (request.action === Action.SIGN_MESSAGE) {
      const intentResult = safeDecode({
        input: {
          type: InputType.MESSAGE,
          payload: request.message
        }
      })

      if (intentResult?.success === false) {
        console.log(`Could not decode intent: ${intentResult.error.message}`, JSON.stringify(request.message, null, 2))
        continue
      }

      input = {
        action: request.action,
        intent: intentResult?.intent,
        principal: {
          uid: initiator_user_id,
          userId: initiator_user_id,
          alg: 'ES256K',
          pubKey: ''
        },
        resource: request.resourceId ? { uid: request.resourceId } : undefined,
        approvals: []
      }
    }

    if (request.action === Action.SIGN_TYPED_DATA) {
      const intentResult = safeDecode({
        input: {
          type: InputType.TYPED_DATA,
          typedData: JSON.parse(request.typedData)
        }
      })

      if (intentResult?.success === false) {
        console.log(
          `Could not decode intent: ${intentResult.error.message}`,
          JSON.stringify(request.typedData, null, 2)
        )
        continue
      }

      input = {
        action: request.action,
        intent: intentResult?.intent,
        principal: {
          uid: initiator_user_id,
          userId: initiator_user_id,
          alg: 'ES256K',
          pubKey: ''
        },
        resource: request.resourceId ? { uid: request.resourceId } : undefined,
        approvals: []
      }
    }

    const OPA_WASM_PATH = path.join(process.cwd(), './rego-build/policy.wasm')
    const policyWasm = readFileSync(OPA_WASM_PATH)
    const opaEngine = await loadPolicy(policyWasm, undefined, { 'time.now_ns': () => new Date().getTime() * 1000000 })
    opaEngine.setData({ entities })

    const evalResult: { result: OpaResult }[] = await opaEngine.evaluate(input, 'main/evaluate')
    const results = evalResult.map(({ result }) => result)

    // if (status == 'denied' && results[0].permit) {
    //   // console.log({ id: results[0].reasons.map((reason) => reason.policyName), status, result: results[0].permit })
    //   if ((input.intent as any).type.includes('transfer')) {
    //     console.log({ intent: input.intent, initiator_user_id, status, result: results[0].permit })
    //   }
    // }

    if (status == 'completed' && !results[0].permit) {
      console.log({ id: results[0].reasons.map((reason) => reason.policyName), status, result: results[0].permit })
    }
  }
}

run()
  .then(() => console.log('done'))
  .catch((error) => console.log('error', error))
