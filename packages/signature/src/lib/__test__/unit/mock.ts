import { hash } from '../../hash'
import { Alg } from '../../types'

export const ALGORITHM = Alg.ES256
export const KID = 'test-kid'
export const IAT = new Date('2024-12-11T00:00:00Z').getTime() / 1000
export const EXP = new Date('2024-12-12T00:00:00Z').getTime() / 1000
export const REQUEST = {
  action: 'CREATE_ORGANIZATION',
  nonce: 'random-nonce-111',
  organization: {
    uid: 'test-org-uid',
    credential: {
      uid: 'test-credential-uid',
      pubKey: 'test-pub-key',
      alg: Alg.ES256,
      userId: 'test-user-id'
    }
  }
}
export const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE+ByvT640j9s+bBVc1PjTlOiZa9ox
yuesKMatcDb0gIeCWbWDuEiyVmkgfGFA93Gl6oB94EiB2EFpvhGNoeJwHA==
-----END PUBLIC KEY-----`
export const PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUDs3iCP93sknEZ+c
DcdsS+UdaUgKK0XVajrBWZbQYWehRANCAAT4HK9PrjSP2z5sFVzU+NOU6Jlr2jHK
56woxq1wNvSAh4JZtYO4SLJWaSB8YUD3caXqgH3gSIHYQWm+EY2h4nAc
-----END PRIVATE KEY-----`
export const HASH = hash(REQUEST)
export const HEADER_PART = 'eyJhbGciOiJFUzI1NiIsImtpZCI6InRlc3Qta2lkIn0'
export const PAYLOAD_PART =
  'eyJyZXF1ZXN0SGFzaCI6IjY4NjMxYmIyMmIxNzFkMjk2YTUyMmJiNmMzMjQ4MDU1NTk3YmY2M2VhYzJiYTk1ZjFmZDAyYTQ4YWUxZWRmOGMiLCJpYXQiOjE3MzM4NzUyMDAsImV4cCI6MTczMzk2MTYwMH0'
export const SIGNATURE_PART = '0D_W3jtdBCAIht39FvPTtC6o9TywEQ_i1TL4BTDQIdndL1X2eoFawoczhWqhEQeP3MUs3XnLeBhtfbf25U3EsQ'
