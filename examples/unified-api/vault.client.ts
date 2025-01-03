import { Hex, privateKeyToJwk, VaultClient } from '@narval-xyz/armory-sdk'
import { buildSignerEdDSA } from '@narval-xyz/armory-sdk/signature'
import dotenv from 'dotenv'
dotenv.config()

const CLIENT_ID = process.env.CLIENT_ID
const MASTER_PRIVATE_KEY_HEX = process.env.MASTER_PRIVATE_KEY
const BASE_URL = process.env.BASE_URL
const CONNECTION_ID = process.env.CONNECTION_ID

if (!CLIENT_ID || !MASTER_PRIVATE_KEY_HEX || !BASE_URL || !CONNECTION_ID) {
  throw new Error('Missing CLIENT_ID or MASTER_PRIVATE_KEY')
}

const masterPrivateKeyJwk = privateKeyToJwk(MASTER_PRIVATE_KEY_HEX as Hex, 'EDDSA')

export const vaultClient = new VaultClient({
  clientId: CLIENT_ID,
  signer: {
    sign: buildSignerEdDSA(MASTER_PRIVATE_KEY_HEX),
    jwk: masterPrivateKeyJwk,
    alg: 'EDDSA'
  },
  host: BASE_URL
})
