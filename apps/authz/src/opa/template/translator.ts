import { EntityType, FiatCurrency, ValueOperators } from '@narval/authz-shared'
import axios from 'axios'
import { omit } from 'lodash'
import { Address } from 'viem'
import {
  ApprovalCondition,
  Criterion,
  Policy,
  PolicyCriterion,
  SignTypedDataDomainCondition,
  Then
} from '../../shared/types/policy.type'
import data from './policy_rule_202402141519_policy_rules_ngg_prod_v_161.json'

type NewPolicy = Policy & { id: string }

type OldPolicy = { [key: string]: string | null }

const translatePolicy = (oldPolicy: OldPolicy): NewPolicy => {
  const result: NewPolicy = {
    id: oldPolicy.id as string,
    name: oldPolicy.id as string,
    when: [
      {
        criterion: Criterion.CHECK_RESOURCE_INTEGRITY,
        args: null
      },
      {
        criterion: Criterion.CHECK_NONCE_EXISTS,
        args: null
      }
    ],
    then: ['approve', 'confirm'].includes(oldPolicy.result as string) ? Then.PERMIT : Then.FORBID
  }

  for (const [key, value] of Object.entries(oldPolicy)) {
    if (value === null || value === undefined || value === '*') {
      continue
    }

    if (key === 'user_id') {
      result.when.push({
        criterion: Criterion.CHECK_PRINCIPAL_ID,
        args: [value]
      })
    }

    if (key === 'guild_user_role') {
      const role = ['root', 'admin', 'member', 'manager'].includes(value) ? value : 'member'

      result.when.push({
        criterion: Criterion.CHECK_PRINCIPAL_ROLE,
        args: [role]
      } as PolicyCriterion)
    }

    if (key === 'user_group') {
      result.when.push({
        criterion: Criterion.CHECK_PRINCIPAL_GROUP,
        args: [value]
      })
    }

    if (key === 'chain_id') {
      result.when.push({
        criterion: Criterion.CHECK_CHAIN_ID,
        args: [value]
      })
    }

    if (key === 'source_address') {
      result.when.push({
        criterion: Criterion.CHECK_WALLET_ADDRESS,
        args: [value]
      })
    }

    if (key === 'destination_address') {
      result.when.push({
        criterion: Criterion.CHECK_DESTINATION_ADDRESS,
        args: [value]
      })
    }

    if (key === 'contract_hex_signature') {
      result.when.push({
        criterion: Criterion.CHECK_INTENT_HEX_SIGNATURE,
        args: [value]
      } as PolicyCriterion)
    }

    if (key === 'activity_type') {
      let action = ''
      let intent = ''
      let token = ''
      let contract = ''
      let spender = ''
      let tokenId = ''

      const when: PolicyCriterion[] = []

      const chainId = oldPolicy.chain_id !== '*' && oldPolicy.chain_id !== null ? oldPolicy.chain_id : '137'

      if (value === 'fungibleAssetTransfer') {
        action = 'signTransaction'

        if (oldPolicy.assetType === 'erc20') {
          intent = 'transferErc20'
          token = `eip155:${chainId}/${oldPolicy.assetType}:${oldPolicy.asset_contract_address}`
        }
        if (oldPolicy.assetType === 'native') {
          intent = 'transferNative'
          if (chainId === '1') {
            token = `eip155:${chainId}/slip44:60`
          }
          if (chainId === '137') {
            token = `eip155:${chainId}/slip44:966`
          }
        }
      }
      if (value === 'nftAssetTransfer') {
        action = 'signTransaction'

        if (oldPolicy.asset_contract_address !== null && oldPolicy.asset_contract_address !== '*') {
          contract = `eip155:${chainId}/${oldPolicy.asset_contract_address}`
          if (
            oldPolicy.assetType !== null &&
            oldPolicy.assetType !== '*' &&
            oldPolicy.asset_token_id !== null &&
            oldPolicy.asset_token_id !== '*'
          ) {
            tokenId = `eip155:${chainId}/${oldPolicy.assetType}:${oldPolicy.asset_contract_address}/${oldPolicy.asset_token_id}`
          }
        }
        if (oldPolicy.assetType === 'erc721') {
          intent = 'transferErc721'
        }
        if (oldPolicy.assetType === 'erc1155') {
          intent = 'transferERC1155'
        }
      }
      if (value === 'contractCall') {
        action = 'signTransaction'
        intent = 'callContract'

        if (oldPolicy.destination_account_type === 'contract' && oldPolicy.destination_address !== '*') {
          contract = `eip155:${chainId}/${oldPolicy.destination_address}`
        }
      }
      if (value === 'tokenApproval') {
        action = 'signTransaction'
        intent = 'approveTokenAllowance'
        token = `eip155:${chainId}/${oldPolicy.assetType || 'erc20'}:${oldPolicy.asset_contract_address}`

        if ((oldPolicy.destination_account_type === 'contract', oldPolicy.destination_address !== '*')) {
          spender = `eip155:${chainId}/${oldPolicy.destination_address}`
        }
      }
      if (value === 'signMessage') {
        action = 'signMessage'

        if (oldPolicy.signing_type === 'personalSign') {
          intent = 'signMessage'
        }

        if (oldPolicy.signing_type === 'signTypedData') {
          intent = 'signTypedData'
        }
      }

      if (action) {
        when.push({
          criterion: Criterion.CHECK_ACTION,
          args: [action]
        } as PolicyCriterion)
      }
      if (intent) {
        when.push({
          criterion: Criterion.CHECK_INTENT_TYPE,
          args: [intent]
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
        if (intent === 'transferErc721') {
          when.push({
            criterion: Criterion.CHECK_ERC721_TOKEN_ID,
            args: [tokenId]
          } as PolicyCriterion)
        }
        if (intent === 'transferErc1155') {
          when.push({
            criterion: Criterion.CHECK_ERC1155_TOKEN_ID,
            args: [tokenId]
          } as PolicyCriterion)
        }
      }

      result.when = result.when.concat(when)
    }

    if (key === 'amount') {
      const currency = oldPolicy.usd_amount ? FiatCurrency.USD : '*'
      let operator: ValueOperators = ValueOperators.LESS_THAN

      if (oldPolicy.comparison_operator === '>') {
        operator = ValueOperators.GREATER_THAN
      } else if (oldPolicy.comparison_operator === '<') {
        operator = ValueOperators.LESS_THAN
      } else if (oldPolicy.comparison_operator === '=') {
        operator = ValueOperators.EQUAL
      }

      result.when.push({
        criterion: Criterion.CHECK_INTENT_AMOUNT,
        args: { currency, operator, value: `${value}` }
      })
    }

    if (['domain_version', 'domain_name', 'domain_verifying_contract'].includes(key)) {
      const args: SignTypedDataDomainCondition = {}

      if (oldPolicy.domain_version !== null && oldPolicy.domain_version !== '*') {
        args['version'] = [oldPolicy.domain_version]
      }

      if (oldPolicy.domain_name !== null && oldPolicy.domain_name !== '*') {
        args['name'] = [oldPolicy.domain_name]
      }

      if (oldPolicy.domain_verifying_contract !== null && oldPolicy.domain_verifying_contract !== '*') {
        args['verifyingContract'] = [oldPolicy.domain_verifying_contract as Address]
      }

      if (Object.keys(args).length > 0) {
        result.when.push({
          criterion: Criterion.CHECK_INTENT_DOMAIN,
          args
        })
      }
    }
  }

  if (result.then === Then.PERMIT) {
    const approval: ApprovalCondition = {
      approvalCount: 2,
      countPrincipal: false,
      approvalEntityType: EntityType.UserRole,
      entityIds: ['root', 'admin']
    }
    if (oldPolicy.approval_threshold !== null && oldPolicy.approval_threshold !== '*') {
      approval.approvalCount = Number(oldPolicy.approval_threshold)
    }
    if (oldPolicy.approval_user_id !== null && oldPolicy.approval_user_id !== '*') {
      approval.approvalEntityType = EntityType.User
      approval.entityIds = [oldPolicy.approval_user_id]
    }
    if (oldPolicy.approval_user_role !== null && oldPolicy.approval_user_role !== '*') {
      approval.approvalEntityType = EntityType.UserRole
      approval.entityIds = [oldPolicy.approval_user_role]
    }
    if (oldPolicy.approval_user_group !== null && oldPolicy.approval_user_group !== '*') {
      approval.approvalEntityType = EntityType.UserGroup
      approval.entityIds = [oldPolicy.approval_user_group]
    }
    result.when.push({
      criterion: Criterion.CHECK_APPROVALS,
      args: [approval]
    })
  }

  //   if (
  //     oldPolicy.source_assignee_user_id ||
  //     oldPolicy.source_assignee_user_role ||
  //     oldPolicy.source_assignee_user_group
  //   ) {
  //     console.log(JSON.stringify(oldPolicy, null, 4))
  //   }

  //   if (
  //     oldPolicy.destination_assignee_user_id ||
  //     oldPolicy.destination_assignee_user_role ||
  //     oldPolicy.destination_assignee_user_group
  //   ) {
  //     console.log(JSON.stringify(oldPolicy, null, 4))
  //   }

  //   if (oldPolicy.chain_id === '*' || oldPolicy.chain_id === null) {
  //     if (oldPolicy.destination_address !== null && oldPolicy.destination_address !== '*') {
  //       console.log(JSON.stringify(oldPolicy, null, 4))
  //     }
  //     if (oldPolicy.asset_contract_address !== null && oldPolicy.asset_contract_address !== '*') {
  //       console.log(JSON.stringify(oldPolicy, null, 4))
  //     }
  //   }

  return result
}

const main = async () => {
  try {
    console.log(data.policies.length)

    const res = await axios.post('http://localhost:3010/admin/policies', {
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
        data: data.policies.map((policy) => {
          const copy: OldPolicy = omit(policy, ['guild_id', 'sequence', 'version', 'amount'])
          copy.amount = `${policy.amount}`
          const res = translatePolicy(copy)
          return res
        })
      }
    })

    console.log(res.data)
  } catch (error) {
    console.error(error.response.data)
  }
}

main()
