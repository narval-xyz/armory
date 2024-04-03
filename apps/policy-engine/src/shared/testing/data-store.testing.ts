import { Entities, EntityStore, Policy, PolicyStore } from '@narval/policy-engine-shared'
import { Jwk, hash, signJwt } from '@narval/signature'
import { getUnixTime } from 'date-fns'

export const signData = (data: Entities | Policy[], jwk: Jwk) =>
  signJwt(
    {
      data: hash(data),
      iat: getUnixTime(new Date())
    },
    jwk
  )

export const getEntityStore = async (entities: Entities, jwk: Jwk): Promise<EntityStore> => {
  return {
    data: entities,
    signature: await signData(entities, jwk)
  }
}

export const getPolicyStore = async (policies: Policy[], jwk: Jwk): Promise<PolicyStore> => {
  return {
    data: policies,
    signature: await signData(policies, jwk)
  }
}
