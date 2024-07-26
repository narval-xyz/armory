import { Decision, EvaluationResponse, FIXTURE, Request } from '@narval/policy-engine-shared'
import { Alg, Payload } from '@narval/signature'
import { ArmoryClientConfig, Htm } from '../../domain'
import { ArmorySdkException, ForbiddenException, NotImplementedException } from '../../exceptions'
import { buildJwsdHeader, buildRequestPayload, checkDecision } from '../../utils'
import { generateSignTransactionRequest } from './mock'

describe('checkDecision', () => {
  const config: ArmoryClientConfig = {
    authHost: 'example.com',
    authClientId: '123456789',
    authClientSecret: 'secret',
    vaultHost: 'example.com',
    vaultClientId: '123456789',
    dataStoreClientId: '123456789',
    dataStoreClientSecret: 'secret',
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
    }).toThrow(ArmorySdkException)
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
    }).toThrow(ArmorySdkException)
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
    }).toThrow(ArmorySdkException)
  })
})

describe('buildPayloadFromRequest', () => {
  const config: ArmoryClientConfig = {
    authHost: 'example.com',
    authClientId: '123456789',
    authClientSecret: 'secret',
    vaultHost: 'example.com',
    vaultClientId: '123456789',
    dataStoreClientId: '123456789',
    dataStoreClientSecret: 'secret',
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

    const result = buildRequestPayload(request, {
      iss: config.authClientId,
      sub: config.jwk.kid
    })

    expect(result).toEqual(expectedPayload)
  })

  it('should set the sub property to the signer kid', () => {
    const result = buildRequestPayload(request, {
      iss: config.authClientId,
      sub: config.jwk.kid
    })

    expect(result.sub).toBe(config.jwk.kid)
  })

  it('should set the iss property to the authClientId', () => {
    const result = buildRequestPayload(request, {
      iss: config.authClientId,
      sub: config.jwk.kid
    })

    expect(result.iss).toBe(config.authClientId)
  })

  it('should set the iat property to the current timestamp', () => {
    const result = buildRequestPayload(request, {
      iss: config.authClientId,
      sub: config.jwk.kid
    })

    expect(result.iat).toBeCloseTo(new Date().getTime(), -2)
  })
})
