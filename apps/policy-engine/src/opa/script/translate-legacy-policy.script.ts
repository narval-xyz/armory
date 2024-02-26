import { EntityType, FiatCurrency, UserRole, ValueOperators } from '@narval/policy-engine-shared'
import axios from 'axios'
import { omit } from 'lodash'
import { Address, Hex } from 'viem'
import {
  ApprovalCondition,
  Criterion,
  Policy,
  PolicyCriterion,
  SignTypedDataDomainCondition,
  Then
} from '../../shared/types/policy.type'
import data from './policies/policy_rules_ngg_prod.json'

type OldPolicy = { [key: string]: string | null }

type NewPolicy = Policy & { id: string }

export const translateLegacyPolicy = (oldPolicy: OldPolicy): NewPolicy | null => {
  const {
    id,
    result,
    chain_id,
    assetType,
    asset_contract_address: assetAddress,
    asset_token_id: assetTokenId,
    destination_account_type,
    destination_address,
    signing_type,
    usd_amount,
    comparison_operator,
    domain_version,
    domain_name,
    domain_verifying_contract,
    approval_threshold,
    approval_user_id,
    approval_user_role,
    approval_user_group
  } = oldPolicy

  if (!id || !result) {
    return null
  }

  const res: NewPolicy = {
    id,
    name: id,
    when: [
      {
        criterion: Criterion.CHECK_RESOURCE_INTEGRITY,
        args: null
      }
    ],
    then: ['approve', 'confirm'].includes(result) ? Then.PERMIT : Then.FORBID
  }

  const chainId = chain_id && chain_id !== '*' ? chain_id : '137'

  const currency = usd_amount ? FiatCurrency.USD : '*'

  for (const [key, value] of Object.entries(oldPolicy)) {
    if (value === null || value === undefined || value === '*') {
      continue
    }

    if (key === 'user_id') {
      res.when.push({
        criterion: Criterion.CHECK_PRINCIPAL_ID,
        args: [value]
      })
    }

    if (key === 'guild_user_role') {
      const role = ['root', 'admin', 'member', 'manager'].includes(value) ? (value as UserRole) : UserRole.MEMBER

      res.when.push({
        criterion: Criterion.CHECK_PRINCIPAL_ROLE,
        args: [role]
      })
    }

    if (key === 'user_group') {
      res.when.push({
        criterion: Criterion.CHECK_PRINCIPAL_GROUP,
        args: [value]
      })
    }

    if (key === 'chain_id') {
      res.when.push({
        criterion: Criterion.CHECK_CHAIN_ID,
        args: [value]
      })
    }

    if (key === 'source_address') {
      res.when.push({
        criterion: Criterion.CHECK_WALLET_ADDRESS,
        args: [value]
      })
    }

    if (key === 'contract_hex_signature') {
      res.when.push({
        criterion: Criterion.CHECK_INTENT_HEX_SIGNATURE,
        args: [value as Hex]
      })
    }

    if (key === 'activity_type') {
      let action = ''
      let intent: string[] = []
      let token = ''
      let contract = ''
      let spender = ''
      let tokenId = ''

      const when: PolicyCriterion[] = []

      if (value === 'fungibleAssetTransfer') {
        action = 'signTransaction'
        if (assetType === '*') {
          intent = ['transferErc20', 'transferNative']
        }
        if (assetType === 'erc20') {
          intent = ['transferErc20']
          token = `eip155:${chainId}:${assetAddress}`
        }
        if (assetType === 'native') {
          intent = ['transferNative']
          if (chainId === '1') {
            token = `eip155:${chainId}/slip44:60`
          }
          if (chainId === '137') {
            token = `eip155:${chainId}/slip44:966`
          }
        }
        if (destination_address && destination_address !== '*') {
          res.when.push({
            criterion: Criterion.CHECK_DESTINATION_ADDRESS,
            args: [value]
          })
        }
      }
      if (value === 'nftAssetTransfer') {
        action = 'signTransaction'
        if (assetType === '*') {
          intent = ['transferErc721', 'transferErc1155']
        }
        if (assetType === 'erc721') {
          intent = ['transferErc721']
        }
        if (assetType === 'erc1155') {
          intent = ['transferErc1155']
        }
        if (assetAddress && assetAddress !== '*') {
          contract = `eip155:${chainId}:${assetAddress}`
          if (assetType && assetType !== '*' && assetTokenId && assetTokenId !== '*') {
            tokenId = `eip155:${chainId}/${assetType}:${assetAddress}/${assetTokenId}`
          }
        }
        if (destination_address && destination_address !== '*') {
          res.when.push({
            criterion: Criterion.CHECK_DESTINATION_ADDRESS,
            args: [value]
          })
        }
      }
      if (value === 'contractCall') {
        action = 'signTransaction'
        intent = ['callContract']
        if (destination_account_type === 'contract' && destination_address !== '*') {
          contract = `eip155:${chainId}:${destination_address}`
        }
      }
      if (value === 'tokenApproval') {
        action = 'signTransaction'
        intent = ['approveTokenAllowance']
        token = `eip155:${chainId}/${assetType || 'erc20'}:${assetAddress}`
        if (destination_account_type === 'contract' && destination_address !== '*') {
          spender = `eip155:${chainId}:${destination_address}`
        }
      }
      if (value === 'signMessage') {
        action = 'signMessage'
        if (signing_type === 'personalSign') {
          intent = ['signMessage']
        }
        if (signing_type === 'signTypedData') {
          intent = ['signTypedData']
        }
      }

      if (action) {
        when.push({
          criterion: Criterion.CHECK_ACTION,
          args: [action]
        } as PolicyCriterion)
      }
      if (intent.length > 0) {
        when.push({
          criterion: Criterion.CHECK_INTENT_TYPE,
          args: intent
        } as PolicyCriterion)
      }
      if (token) {
        when.push({
          criterion: Criterion.CHECK_INTENT_TOKEN,
          args: [token]
        } as PolicyCriterion)
      }
      if (contract) {
        when.push({
          criterion: Criterion.CHECK_INTENT_CONTRACT,
          args: [contract]
        } as PolicyCriterion)
      }
      if (spender) {
        when.push({
          criterion: Criterion.CHECK_INTENT_SPENDER,
          args: [spender]
        } as PolicyCriterion)
      }
      if (tokenId) {
        if (intent.includes('transferErc721')) {
          when.push({
            criterion: Criterion.CHECK_ERC721_TOKEN_ID,
            args: [tokenId]
          } as PolicyCriterion)
        }
        if (intent.includes('transferErc1155')) {
          when.push({
            criterion: Criterion.CHECK_ERC1155_TOKEN_ID,
            args: [tokenId]
          } as PolicyCriterion)
        }
      }

      res.when = res.when.concat(when)
    }

    if (key === 'amount') {
      let operator = ValueOperators.LESS_THAN

      if (comparison_operator === '>') {
        operator = ValueOperators.GREATER_THAN
      } else if (comparison_operator === '<') {
        operator = ValueOperators.LESS_THAN
      } else if (comparison_operator === '=') {
        operator = ValueOperators.EQUAL
      }

      res.when.push({
        criterion: Criterion.CHECK_INTENT_AMOUNT,
        args: { currency, operator, value: `${value}` }
      })
    }

    if (key === 'domain_version') {
      const args: SignTypedDataDomainCondition = {}

      if (domain_version && domain_version !== '*') {
        args['version'] = [domain_version]
      }

      if (domain_name && domain_name !== '*') {
        args['name'] = [domain_name]
      }

      if (domain_verifying_contract && domain_verifying_contract !== '*') {
        args['verifyingContract'] = [domain_verifying_contract as Address]
      }

      if (Object.keys(args).length > 0) {
        res.when.push({
          criterion: Criterion.CHECK_INTENT_DOMAIN,
          args
        })
      }
    }
  }

  if (res.then === Then.PERMIT) {
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
      res.when.push({
        criterion: Criterion.CHECK_APPROVALS,
        args: [approval]
      })
    }
  }

  return res
}

export const run = () => {
  const policies = data.policies.map((policy) => {
    const copy = omit(policy, ['guild_id', 'sequence', 'version', 'amount']) as OldPolicy
    copy.amount = policy.amount ? `${policy.amount}` : null
    return copy
  })
  const requestData = policies.map(translateLegacyPolicy).filter(Boolean) as NewPolicy[]
  console.log(`number of policies to translate: ${requestData.length}.`)
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
      data: requestData
    }
  })
}

run()
  .then(() => console.log('done'))
  .catch((error) => console.log('error', error))
