import { Decision, EvaluationResponse, FIXTURE, Request } from '@narval/policy-engine-shared'
import { Alg, Payload } from '@narval/signature'
import { ArmoryClientConfig, Htm } from '../../domain'
import { ForbiddenException, NarvalSdkException, NotImplementedException } from '../../exceptions'
import { buildJwsdHeader, buildPayloadFromRequest, checkDecision } from '../../utils'
import { generateSignTransactionRequest } from './mock'

describe('checkDecision', () => {
  const config: ArmoryClientConfig = {
    authHost: 'example.com',
    authClientId: '123456789',
    authSecret: 'secret',
    vaultHost: 'example.com',
    vaultClientId: '123456789',
    entityStoreHost: 'example.com',
    policyStoreHost: 'example.com',
    jwk: FIXTURE.CREDENTIAL.Alice.key,
    signer: async () => 'signature'
  }

  it('return SdkPermitResponse when decision is PERMIT and all required data is present', () => {
    const data: EvaluationResponse = {
      decision: Decision.PERMIT,
      accessToken: {
        value: 'token'
      }
    }

    const result = checkDecision(data, config)

    expect(result).toEqual(data)
  })

  it('throw NarvalSdkException when decision is PERMIT but accessToken or request is missing', () => {
    const data: EvaluationResponse = {
      decision: Decision.PERMIT,
      accessToken: undefined
    }

    expect(() => {
      checkDecision(data, config)
    }).toThrow(NarvalSdkException)
  })

  it('throw ForbiddenException when decision is FORBID', () => {
    const data: EvaluationResponse = {
      decision: Decision.FORBID,
      accessToken: undefined
    }

    expect(() => {
      checkDecision(data, config)
    }).toThrow(ForbiddenException)
  })

  it('throw NotImplementedException when decision is not implemented', () => {
    const data: EvaluationResponse = {
      decision: Decision.CONFIRM,
      accessToken: undefined
    }

    expect(() => {
      checkDecision(data, config)
    }).toThrow(NotImplementedException)
  })
})

describe('buildJwsdHeader', () => {
  it('build JwsdHeader correctly', () => {
    const args = {
      uri: 'https://example.com',
      htm: Htm.POST,
      alg: Alg.ES256K,
      jwk: {
        kid: '123',
        alg: Alg.ES256K
      },
      accessToken: {
        value: 'token'
      }
    }

    const result = buildJwsdHeader(args)

    expect(result).toEqual({
      alg: 'ES256K',
      kid: '123',
      typ: 'gnap-binding-jwsd',
      htm: 'POST',
      uri: 'https://example.com',
      created: expect.any(Number),
      ath: expect.any(String)
    })
  })

  it('throw NarvalSdkException when jwk.alg is missing', () => {
    const args = {
      uri: 'https://example.com',
      htm: Htm.POST,
      jwk: {
        kid: '123'
      },
      accessToken: {
        value: 'token'
      }
    }
    expect(() => {
      buildJwsdHeader(args)
    }).toThrow(NarvalSdkException)
  })

  it('throw NarvalSdkException when jwk.kid is missing', () => {
    const args = {
      uri: 'https://example.com',
      htm: Htm.POST,
      jwk: {
        alg: Alg.ES256K
      },
      accessToken: {
        value: 'token'
      }
    }
    expect(() => {
      buildJwsdHeader(args)
    }).toThrow(NarvalSdkException)
  })
})

describe('buildPayloadFromRequest', () => {
  const config: ArmoryClientConfig = {
    authHost: 'example.com',
    authClientId: '123456789',
    authSecret: 'secret',
    vaultHost: 'example.com',
    vaultClientId: '123456789',
    entityStoreHost: 'example.com',
    policyStoreHost: 'example.com',
    jwk: FIXTURE.CREDENTIAL.Alice.key,
    signer: async () => 'signature'
  }

  let request: Request

  beforeEach(async () => {
    request = (await generateSignTransactionRequest()).request
  })

  it('should return a payload object with the correct properties', () => {
    const expectedPayload: Payload = {
      requestHash: expect.any(String),
      sub: config.jwk.kid,
      iss: config.authClientId,
      iat: expect.any(Number)
    }

    const result = buildPayloadFromRequest(config, request)

    expect(result).toEqual(expectedPayload)
  })

  it('should set the sub property to the signer kid', () => {
    const result = buildPayloadFromRequest(config, request)

    expect(result.sub).toBe(config.jwk.kid)
  })

  it('should set the iss property to the authClientId', () => {
    const result = buildPayloadFromRequest(config, request)

    expect(result.iss).toBe(config.authClientId)
  })

  it('should set the iat property to the current timestamp', () => {
    const result = buildPayloadFromRequest(config, request)

    expect(result.iat).toBeCloseTo(new Date().getTime(), -2)
  })
})
