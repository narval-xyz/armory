import { REDACT_REPLACE } from '../../logger.constant'
import { redact } from '../../logger.util'

const SENSITIVE_KEYS = ['mnemonic', 'privateKey', 'password', 'pass', 'pw', 'secret', 'token', 'apiKey', 'adminApiKey']

describe('redact', () => {
  const testRedaction = (key: string) =>
    it(`deep redacts ${key}`, () => {
      const obj = {
        [key]: 'senstive information',
        nested: {
          [key]: 'senstive information'
        },
        caseInsensitive: {
          upper: {
            [key.toUpperCase()]: 'senstive information'
          },
          lower: {
            [key.toLowerCase()]: 'senstive information'
          }
        },
        array: [{ [key]: 'senstive information' }]
      }

      expect(redact(obj)).toEqual({
        [key]: REDACT_REPLACE,
        nested: {
          [key]: REDACT_REPLACE
        },
        caseInsensitive: {
          upper: {
            [key.toUpperCase()]: REDACT_REPLACE
          },
          lower: {
            [key.toLowerCase()]: REDACT_REPLACE
          }
        },
        array: [{ [key]: REDACT_REPLACE }]
      })
    })

  SENSITIVE_KEYS.forEach(testRedaction)

  it('does not mutate the given object', () => {
    const obj = {
      "approvals": [],
      "authentication": "eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDc2MEE2MkYzMjIyOUM3Y2EyN0JFNDZFOTUwZTQzOEFiZTE3MjZkYzEiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3MjIzNTA4MDE2ODIsImlzcyI6IjgxMWViYWYxLTczMjktNDg1ZC04ZGI2LThhY2MwZWFkNGZiNyIsInJlcXVlc3RIYXNoIjoiMHhkZDgyZjgzMGQ0YTZmYzczMDMxMDc0NmJiOGI2NTM5ODhkNTkwNGFiZTU0YTFiZDc5YTllYTc3NDg4ZmQ4YzIzIiwic3ViIjoiMHg3NjBBNjJGMzIyMjlDN2NhMjdCRTQ2RTk1MGU0MzhBYmUxNzI2ZGMxIn0.xIn6xt-zKF1tA77t-qpPPoPVDN3kkDaIukfVUZ_d6xJ8mJRmzpZvZ83av607GERdtXoeLjVy1bRa-tEgRr38RRw",
      "clientId": "811ebaf1-7329-485d-8db6-8acc0ead4fb7",
      "createdAt": "2024-07-30T14:46:43.384Z",
      "errors": [
        {
          "context": {
            "data": {
              "feeds": [
                {
                  "sig": "eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDBjNjIwZjRiYzhlOTMxMTBiZDljZDc5ZTVkNjM3YTI0MGQ1NWUwZjI3MzNmZDdlOTViNzM0N2QzYjA2MjMxZmMiLCJ0eXAiOiJKV1QifQ.eyJkYXRhIjoiMHg0NDEzNmZhMzU1YjM2NzhhMTE0NmFkMTZmN2U4NjQ5ZTk0ZmI0ZmMyMWZlNzdlODMxMGMwNjBmNjFjYWFmZjhhIiwiaWF0IjoxNzIyMzUwODA4LCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6Iiwic3ViIjoiMHg2OTY2MzEzNDAwMTZGY2FFMmJCYmEyREQ3QmYxZjFBMkY4ZTJBNTRmIn0.fMvqRJhm_sH6QuYalz1J4iFT2D0IT72lC84eC6k3xhMn48uPW1P2bncxhO_ofigDvutTGlV9OYtFqTuAc8j7-xs",
                  "data": {},
                  "source": "armory/price-feed"
                },
                {
                  "sig": "eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDY2YTY3YWI1ODI2OWY0NGFhYmE2NDUxNzZmNGI5M2Y1ZTY3MTU2N2I0NTQ0MjkwZTE5OGU5ODYxYzM0OTNkMmQiLCJ0eXAiOiJKV1QifQ.eyJkYXRhIjoiMHg0ZjUzY2RhMThjMmJhYTBjMDM1NGJiNWY5YTNlY2JlNWVkMTJhYjRkOGUxMWJhODczYzJmMTExNjEyMDJiOTQ1IiwiaWF0IjoxNzIyMzUwODA4LCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6Iiwic3ViIjoiMHhkOWYzYjNhMDY3ZmU0NmI2M0U0YjBkZUZlQjJBMGI3YWU2N2E4MjIxIn0.sAYS88tXduXHzSiNbiaKwUi0GNkkHsCFa5eCiHgCRYRdy28YGd0Ax2Z_7vs7e8zYRKYVLEEBwa9N15tj-QM1xhw",
                  "data": [
                    {
                      "token": "[THIS_SHOULD_NOT_BE_REDACTED]"
                    },
                    {
                      "token": "[THIS_SHOULD_NOT_BE_REDACTED]"
                    }
                  ],
                  "source": "armory/historical-transfer-feed"
                }
              ],
              "request": {
                "nonce": "cd0cf10c-6139-4779-b754-66689b016a0e",
                "action": "grantPermission",
                "resourceId": "vault",
                "permissions": [
                  "wallet:create",
                  "wallet:read",
                  "wallet:import"
                ],
                "token": "[THIS_SHOULD_NOT_BE_REDACTED]"
              },
              "metadata": {
                "issuer": "811ebaf1-7329-485d-8db6-8acc0ead4fb7.armory.narval.xyz",
                "issuedAt": 1722350803,
                "expiresIn": 600
              },
              "approvals": [],
              "sessionId": "7dd1caff-40df-4a3c-8575-a430e4053da1",
              "authentication": "eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDc2MEE2MkYzMjIyOUM3Y2EyN0JFNDZFOTUwZTQzOEFiZTE3MjZkYzEiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3MjIzNTA4MDE2ODIsImlzcyI6IjgxMWViYWYxLTczMjktNDg1ZC04ZGI2LThhY2MwZWFkNGZiNyIsInJlcXVlc3RIYXNoIjoiMHhkZDgyZjgzMGQ0YTZmYzczMDMxMDc0NmJiOGI2NTM5ODhkNTkwNGFiZTU0YTFiZDc5YTllYTc3NDg4ZmQ4YzIzIiwic3ViIjoiMHg3NjBBNjJGMzIyMjlDN2NhMjdCRTQ2RTk1MGU0MzhBYmUxNzI2ZGMxIn0.xIn6xt-zKF1tA77t-qpPPoPVDN3kkDaIukfVUZ_d6xJ8mJRmzpZvZ83av607GERdtXoeLjVy1bRa-tEgRr38RRw"
            },
            "host": "http://policy-engine-node-2",
            "clientId": "811ebaf1-7329-485d-8db6-8acc0ead4fb7",
            "clientSecret": "[THIS_SHOULD_NOT_BE_REDACTED]"
          },
          "id": "acdff6bf-4dcd-4541-9db1-786f53cb3e9c",
          "message": "Evaluation request failed",
          "name": "PolicyEngineClientException"
        }
      ],
      "evaluations": [],
      "id": "9a3920d8-f9ef-4400-bced-e9cf2a2810f0",
      "idempotencyKey": null,
      "metadata": {
        "expiresIn": 600
      },
      "request": {
        "action": "grantPermission",
        "nonce": "cd0cf10c-6139-4779-b754-66689b016a0e",
        "resourceId": "vault",
        "permissions": [
          "wallet:create",
          "wallet:read",
          "wallet:import"
        ]
      },
      "status": "FAILED",
      "updatedAt": "2024-07-30T14:46:48.713Z"
    }

    redact(obj)

    expect(obj.errors[0].context.data.request.token).toEqual('[THIS_SHOULD_NOT_BE_REDACTED]')
    expect(obj.errors[0].context.clientSecret).toEqual('[THIS_SHOULD_NOT_BE_REDACTED]')
    expect((obj.errors[0].context.data.feeds[1].data as {token: string}[])[0].token).toEqual('[THIS_SHOULD_NOT_BE_REDACTED]')
    expect((obj.errors[0].context.data.feeds[1].data as {token: string}[])[1].token).toEqual('[THIS_SHOULD_NOT_BE_REDACTED]')
  })
  it('does not mutate the given object with a class extending Error', () => {
    class TestClass extends Error {
      constructor(public config: { host: string; clientId: string; clientSecret: string }) {
        super('TestClass')
      }
    }

    const obj = {
      foo: 'DO NOT REDACT THIS',
      bar: new TestClass({
        host: 'http://policy-engine-node-2',
        clientId: '811ebaf1-7329-485d-8db6-8acc0ead4fb7',
        clientSecret: '[THIS_SHOULD_NOT_BE_REDACTED]'
      })
    };

    redact(obj);

    expect(obj.bar.config.clientSecret).toEqual('[THIS_SHOULD_NOT_BE_REDACTED]');
  })
})
