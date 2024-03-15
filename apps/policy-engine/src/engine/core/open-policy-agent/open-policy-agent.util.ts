import { Action, EvaluationRequest, Policy } from '@narval/policy-engine-shared'
import { Alg } from '@narval/signature'
import { InputType, safeDecode } from '@narval/transaction-request-intent'
import { HttpStatus } from '@nestjs/common'
import { cp, mkdir, readFile, rm, writeFile } from 'fs/promises'
import Handlebars from 'handlebars'
// TODO: (@wcalderipe, 14/03/2024) move these templating logic to the
// open-policy-agent.
import { exec as execCommand } from 'child_process'
import { resolve } from 'path'
import { promisify } from 'util'
import { v4 as uuid } from 'uuid'
import { criterionToString, reasonToString } from '../../../shared/utils/opa.utils'
import { OpenPolicyAgentException } from './open-policy-agent.exception'
import { Input } from './open-policy-agent.type'

// export const toData = (entities: Entities) => {}

const exec = promisify(execCommand)

const REGO_RULES_TEMPLATE_PATH = resolve(__dirname, '../../../opa/template/template.hbs')

export const toInput = (evaluation: EvaluationRequest): Input => {
  const { action } = evaluation.request

  if (action === Action.SIGN_TRANSACTION) {
    const result = safeDecode({
      input: {
        type: InputType.TRANSACTION_REQUEST,
        txRequest: evaluation.request.transactionRequest
      }
    })

    if (result.success) {
      return {
        action,
        intent: result.intent,
        transactionRequest: evaluation.request.transactionRequest,
        principal: {
          id: 'test-cred-id',
          pubKey: 'test-pub-key',
          address: 'test-address',
          alg: Alg.ES256K,
          userId: 'test-user-id'
        },
        approvals: [
          {
            id: 'test-cred-id',
            pubKey: 'test-pub-key',
            address: 'test-address',
            alg: Alg.ES256K,
            userId: 'test-user-id'
          }
        ],
        transfers: evaluation.transfers
      }
    }

    throw new OpenPolicyAgentException({
      message: 'Invalid transaction request intent',
      suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
      context: {
        error: result.error,
        txRequest: evaluation.request.transactionRequest
      }
    })
  }

  throw new OpenPolicyAgentException({
    message: 'Unsupported evaluation request action',
    suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    context: { action }
  })
}

export const buildWebAssembly = async (input: {
  output: string
  lib: string
  policies: Policy[]
  cleanAfter?: boolean
}): Promise<Buffer> => {
  const cleanAfter = input.cleanAfter ?? true

  try {
    await mkdir(input.output, { recursive: true })

    const regoSourceDirectory = `${input.output}/rego`
    const generatedRegoDirectory = `${regoSourceDirectory}/generated`
    const distDirectory = `${input.output}/dist`
    const bundleTarball = `${distDirectory}/bundle.tar.gz`

    await mkdir(generatedRegoDirectory, { recursive: true })
    await mkdir(distDirectory)

    const policies = await toRego(input.policies)
    const policiesFile = `${generatedRegoDirectory}/policies.rego`

    await writeFile(policiesFile, policies, 'utf-8')

    await cp(input.lib, regoSourceDirectory, {
      recursive: true,
      filter: (source) => {
        if (source.includes('__test__/') || source.includes('policies/')) {
          return false
        }

        return true
      }
    })

    const cmd = [
      'opa',
      'build',
      '--target wasm',
      '--entrypoint main/evaluate',
      `--bundle ${regoSourceDirectory}`,
      `--output ${bundleTarball}`
    ]

    await exec(cmd.join(' '))
    await exec(`tar -xzf ${bundleTarball} -C ${distDirectory}`)

    console.log(await exec(`tree ${input.output}`))

    return readFile(`${distDirectory}/policy.wasm`)
  } finally {
    if (cleanAfter) {
      await rm(input.output, { recursive: true, force: true })
    }
  }
}

export const toRego = async (policies: Policy[]): Promise<string> => {
  Handlebars.registerHelper('criterion', criterionToString)
  Handlebars.registerHelper('reason', reasonToString)

  const template = Handlebars.compile(await readFile(REGO_RULES_TEMPLATE_PATH, 'utf-8'))

  return template({
    // TODO: Here the policy must have an ID already.
    policies: policies.map((policy) => ({ ...policy, id: uuid() }))
  })
}
