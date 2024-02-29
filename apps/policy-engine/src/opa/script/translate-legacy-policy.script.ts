import {
  Action,
  AssetType,
  EntityType,
  FiatCurrency,
  UserRole,
  ValueOperators,
  toAccountId,
  toAssetId
} from '@narval/policy-engine-shared'
import { Intents } from '@narval/transaction-request-intent'
import axios from 'axios'
import { Address, Hex } from 'viem'
import {
  ActionCriterion,
  ApprovalCondition,
  ApprovalsCriterion,
  Criterion,
  DestinationAddressCriterion,
  ERC1155TokenIdCriterion,
  ERC721TokenIdCriterion,
  IntentAmountCriterion,
  IntentContractCriterion,
  IntentDomainCriterion,
  IntentHexSignatureCriterion,
  IntentSpenderCriterion,
  IntentTokenCriterion,
  IntentTypeCriterion,
  Policy,
  PolicyCriterion,
  Then
} from '../../shared/types/policy.type'

type LegacyPolicy = { [key: string]: string | null }

type NewPolicy = Policy & { id: string }

const translateActivityType = (policy: LegacyPolicy): PolicyCriterion[] => {
  const {
    activity_type,
    chain_id,
    assetType,
    asset_contract_address: assetAddress,
    asset_token_id: assetTokenId,
    destination_address,
    destination_account_type,
    contract_hex_signature,
    signing_type,
    domain_name,
    domain_version,
    domain_verifying_contract
  } = policy

  const actionCriteria: ActionCriterion = {
    criterion: Criterion.CHECK_ACTION,
    args: []
  }

  const intentCriteria: IntentTypeCriterion = {
    criterion: Criterion.CHECK_INTENT_TYPE,
    args: []
  }

  const intentContract: IntentContractCriterion = {
    criterion: Criterion.CHECK_INTENT_CONTRACT,
    args: []
  }

  const intentToken: IntentTokenCriterion = {
    criterion: Criterion.CHECK_INTENT_TOKEN,
    args: []
  }

  const intentSpender: IntentSpenderCriterion = {
    criterion: Criterion.CHECK_INTENT_SPENDER,
    args: []
  }

  const intentErc721TokenId: ERC721TokenIdCriterion = {
    criterion: Criterion.CHECK_ERC721_TOKEN_ID,
    args: []
  }

  const intentErc1155TokenId: ERC1155TokenIdCriterion = {
    criterion: Criterion.CHECK_ERC1155_TOKEN_ID,
    args: []
  }

  const intentHexSignature: IntentHexSignatureCriterion = {
    criterion: Criterion.CHECK_INTENT_HEX_SIGNATURE,
    args: []
  }

  const destinationAddress: DestinationAddressCriterion = {
    criterion: Criterion.CHECK_DESTINATION_ADDRESS,
    args: []
  }

  const intentDomain: IntentDomainCriterion = {
    criterion: Criterion.CHECK_INTENT_DOMAIN,
    args: {}
  }

  switch (activity_type) {
    case 'signMessage':
      if (signing_type === '*') {
        actionCriteria.args = [...actionCriteria.args, Action.SIGN_MESSAGE, Action.SIGN_TYPED_DATA]
        intentCriteria.args = [...intentCriteria.args, Intents.SIGN_MESSAGE, Intents.SIGN_TYPED_DATA]
      }
      if (signing_type === 'personalSign') {
        actionCriteria.args = [...actionCriteria.args, Action.SIGN_MESSAGE]
        intentCriteria.args = [...intentCriteria.args, Intents.SIGN_MESSAGE]
      }
      if (signing_type === 'typedData') {
        actionCriteria.args = [...actionCriteria.args, Action.SIGN_TYPED_DATA]
        intentCriteria.args = [...intentCriteria.args, Intents.SIGN_TYPED_DATA]

        if (chain_id && chain_id !== '*') {
          intentDomain.args['chainId'] = [chain_id]
        }

        if (domain_name && domain_name !== '*') {
          intentDomain.args['name'] = [domain_name]
        }

        if (domain_version && domain_version !== '*') {
          intentDomain.args['version'] = [domain_version]
        }

        if (domain_verifying_contract && domain_verifying_contract !== '*') {
          intentDomain.args['verifyingContract'] = [domain_verifying_contract as Address]
        }
      }
      return [actionCriteria, intentCriteria, ...(Object.keys(intentDomain.args).length > 0 ? [intentDomain] : [])]

    case 'fungibleAssetTransfer':
      actionCriteria.args = [...actionCriteria.args, Action.SIGN_TRANSACTION]
      if (assetType === '*') {
        intentCriteria.args = [...intentCriteria.args, Intents.TRANSFER_ERC20, Intents.TRANSFER_NATIVE]
      }
      if (assetType === 'erc20') {
        intentCriteria.args = [...intentCriteria.args, Intents.TRANSFER_ERC20]
        if (chain_id && chain_id !== '*' && assetAddress && assetAddress !== '*') {
          intentToken.args = [
            ...intentToken.args,
            toAccountId({ chainId: Number(chain_id), address: assetAddress as Address })
          ]
        }
      }
      if (assetType === 'native') {
        intentCriteria.args = [...intentCriteria.args, Intents.TRANSFER_NATIVE]
        if (chain_id && chain_id === '1') {
          intentToken.args = [
            ...intentToken.args,
            toAssetId({ assetType: AssetType.SLIP44, chainId: Number(chain_id), coinType: 60 })
          ]
        }
        if (chain_id && chain_id === '137') {
          intentToken.args = [
            ...intentToken.args,
            toAssetId({ assetType: AssetType.SLIP44, chainId: Number(chain_id), coinType: 966 })
          ]
        }
      }
      if (destination_address && destination_address !== '*') {
        destinationAddress.args = [...destinationAddress.args, destination_address]
      }

      return [
        actionCriteria,
        intentCriteria,
        ...(intentToken.args.length > 0 ? [intentToken] : []),
        ...(destinationAddress.args.length > 0 ? [destinationAddress] : [])
      ]

    case 'nftAssetTransfer':
      actionCriteria.args = [...actionCriteria.args, Action.SIGN_TRANSACTION]
      if (assetType === '*') {
        intentCriteria.args = [...intentCriteria.args, Intents.TRANSFER_ERC721, Intents.TRANSFER_ERC1155]
      }
      if (assetType === 'erc721') {
        intentCriteria.args = [...intentCriteria.args, Intents.TRANSFER_ERC721]
        if (chain_id && chain_id !== '*' && assetAddress && assetAddress !== '*') {
          intentContract.args = [
            ...intentContract.args,
            toAccountId({ chainId: Number(chain_id), address: assetAddress as Address })
          ]
          if (assetTokenId && assetTokenId !== '*') {
            intentErc721TokenId.args = [
              ...intentErc721TokenId.args,
              toAssetId({
                chainId: Number(chain_id),
                assetType: AssetType.ERC721,
                address: assetAddress as Address,
                assetId: assetTokenId
              })
            ]
          }
        }
      }
      if (assetType === 'erc1155') {
        intentCriteria.args = [...intentCriteria.args, Intents.TRANSFER_ERC1155]
        if (chain_id && chain_id !== '*' && assetAddress && assetAddress !== '*') {
          intentContract.args = [
            ...intentContract.args,
            toAccountId({ chainId: Number(chain_id), address: assetAddress as Address })
          ]
          if (assetTokenId && assetTokenId !== '*') {
            intentErc1155TokenId.args = [
              ...intentErc1155TokenId.args,
              toAssetId({
                chainId: Number(chain_id),
                assetType: AssetType.ERC1155,
                address: assetAddress as Address,
                assetId: assetTokenId
              })
            ]
          }
        }
      }
      if (destination_address && destination_address !== '*') {
        destinationAddress.args = [...destinationAddress.args, destination_address]
      }

      return [
        actionCriteria,
        intentCriteria,
        ...(intentContract.args.length > 0 ? [intentContract] : []),
        ...(intentErc721TokenId.args.length > 0 ? [intentErc721TokenId] : []),
        ...(intentErc1155TokenId.args.length > 0 ? [intentErc1155TokenId] : []),
        ...(destinationAddress.args.length > 0 ? [destinationAddress] : [])
      ]

    case 'contractCall':
      actionCriteria.args = [...actionCriteria.args, Action.SIGN_TRANSACTION]
      intentCriteria.args = [...intentCriteria.args, Intents.CALL_CONTRACT]

      if (
        destination_account_type === 'contract' &&
        chain_id &&
        chain_id != '*' &&
        destination_address &&
        destination_address !== '*'
      ) {
        intentContract.args = [
          ...intentContract.args,
          toAccountId({ chainId: Number(chain_id), address: destination_address as Address })
        ]
      }

      if (contract_hex_signature && contract_hex_signature !== '*') {
        intentHexSignature.args = [...intentHexSignature.args, contract_hex_signature as Hex]
      }

      return [
        actionCriteria,
        intentCriteria,
        ...(intentContract.args.length > 0 ? [intentContract] : []),
        ...(intentHexSignature.args.length > 0 ? [intentHexSignature] : [])
      ]

    case 'tokenApproval':
      actionCriteria.args = [...actionCriteria.args, Action.SIGN_TRANSACTION]
      intentCriteria.args = [...intentCriteria.args, Intents.APPROVE_TOKEN_ALLOWANCE]

      if (chain_id && chain_id !== '*') {
        if (assetAddress && assetAddress !== '*') {
          intentToken.args = [
            ...intentToken.args,
            toAccountId({ chainId: Number(chain_id), address: assetAddress as Address })
          ]
        }
        if (destination_account_type === 'contract' && destination_address && destination_address !== '*') {
          intentSpender.args = [
            ...intentSpender.args,
            toAccountId({ chainId: Number(chain_id), address: destination_address as Address })
          ]
        }
      }

      return [
        actionCriteria,
        intentCriteria,
        ...(intentToken.args.length > 0 ? [intentToken] : []),
        ...(intentSpender.args.length > 0 ? [intentSpender] : [])
      ]

    default:
      return []
  }
}

const translateAmount = (policy: LegacyPolicy): IntentAmountCriterion[] => {
  const { usd_amount, comparison_operator, amount } = policy

  const amountDefined = amount && amount !== '*'
  const usdAmountDefined = usd_amount && usd_amount !== '*'

  if (!amountDefined && !usdAmountDefined) {
    return []
  }

  const currency = usdAmountDefined ? FiatCurrency.USD : '*'
  const value = usdAmountDefined ? `${usd_amount}` : `${amount}`

  const intentAmount: IntentAmountCriterion = {
    criterion: Criterion.CHECK_INTENT_AMOUNT,
    args: { currency, operator: ValueOperators.LESS_THAN, value }
  }

  switch (comparison_operator) {
    case '>':
      intentAmount.args.operator = ValueOperators.GREATER_THAN
      break
    case '<':
      intentAmount.args.operator = ValueOperators.LESS_THAN
      break
    case '=':
      intentAmount.args.operator = ValueOperators.EQUAL
      break
    default:
      break
  }

  return [intentAmount]
}

const translateApproval = (policy: LegacyPolicy): ApprovalsCriterion[] => {
  const { approval_threshold, approval_user_id, approval_user_role, approval_user_group } = policy

  const approval: ApprovalCondition = {
    approvalCount: 1,
    countPrincipal: false,
    approvalEntityType: EntityType.User,
    entityIds: []
  }

  if (approval_threshold && approval_threshold !== '*') {
    approval.approvalCount = Number(approval_threshold)
  }
  if (approval_user_id && approval_user_id !== '*') {
    approval.approvalEntityType = EntityType.User
    approval.entityIds = [approval_user_id]
  }
  if (approval_user_role && approval_user_role !== '*') {
    approval.approvalEntityType = EntityType.UserRole
    approval.entityIds = [approval_user_role]
  }
  if (approval_user_group && approval_user_group !== '*') {
    approval.approvalEntityType = EntityType.UserGroup
    approval.entityIds = [approval_user_group]
  }

  if (approval.entityIds.length > 0) {
    return [
      {
        criterion: Criterion.CHECK_APPROVALS,
        args: [approval]
      }
    ]
  }

  return []
}

const translateLegacyPolicy = (policy: LegacyPolicy): NewPolicy | null => {
  const { id, result, user_id, guild_user_role, user_group, source_address, activity_type } = policy

  if (!id || !result) {
    return null
  }

  const res: NewPolicy = {
    id,
    name: id,
    when: [],
    then: ['approve', 'confirm'].includes(result) ? Then.PERMIT : Then.FORBID
  }

  if (user_id && user_id !== '*') {
    res.when.push({
      criterion: Criterion.CHECK_PRINCIPAL_ID,
      args: [user_id]
    })
  }

  if (guild_user_role && guild_user_role !== '*') {
    const role = ['root', 'admin', 'member', 'manager'].includes(guild_user_role)
      ? (guild_user_role as UserRole)
      : UserRole.MEMBER

    res.when.push({
      criterion: Criterion.CHECK_PRINCIPAL_ROLE,
      args: [role]
    })
  }

  if (user_group && user_group !== '*') {
    res.when.push({
      criterion: Criterion.CHECK_PRINCIPAL_GROUP,
      args: [user_group]
    })
  }

  if (source_address && source_address !== '*') {
    res.when.push({
      criterion: Criterion.CHECK_WALLET_ADDRESS,
      args: [source_address]
    })
  }

  if (activity_type && activity_type !== '*') {
    res.when = res.when.concat(translateActivityType(policy))
  }

  res.when = res.when.concat(translateAmount(policy))

  if (res.then === Then.PERMIT) {
    res.when = res.when.concat(translateApproval(policy))
  }

  return res
}

export const translate = (policies: LegacyPolicy[]) => {
  const data = policies.map(translateLegacyPolicy).filter(Boolean)

  console.log(`number of policies to translate: ${data.length}.`)

  return axios.post('http://localhost:3010/admin/policies', {
    authentication: {
      sig: '0x746ed2e4bf7311da76bc157c7fe8c0520b6e4c27ab96abf5a8d16fecbaac98b669418b2db9da8e6d3cbd4e1eaff1a9d9e765f0470e9b86c6694145778a8d46f81c',
      alg: 'ES256K',
      pubKey: '0xd75D626a116D4a1959fE3bB938B2e7c116A05890'
    },
    approvals: [
      {
        sig: '0xe86dffd265b7a76a9de0ee9078137271cbe32bb2bb8ee28a2935cc37f023193a51cd608701b9c40fc42be69eeb45c0bb375b5898828f1af4bf12e37ff1fe697f1c',
        alg: 'ES256K',
        pubKey: '0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06'
      },
      {
        sig: '0xaffbddca4f16079f86a56d58f9ebb151c353e73c11a09791eb97f01ea0046c545ea0bd765ab1dc844ee0369f9123476b6f84b00b42b7ac1a16676b9a11e1a4031c',
        alg: 'ES256K',
        pubKey: '0xab88c8785D0C00082dE75D801Fcb1d5066a6311e'
      }
    ],
    request: {
      action: 'setPolicyRules',
      nonce: 'random-nonce-111',
      data
    }
  })
}

// translate(
//   policies.map((policy) => {
//     const res: LegacyPolicy = omit(policy, ['guild_id', 'sequence', 'version', 'amount'])
//     res.amount = policy.amount ? `${policy.amount}` : null
//     return res
//   })
// )
//   .then(() => console.log('done'))
//   .catch((error) => console.log('error', error))
