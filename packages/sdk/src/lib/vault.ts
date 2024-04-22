import { JwtString } from '@narval-xyz/policy-engine-domain'
import axios from 'axios'
import { VaultConfig } from './domain'

export class VaultRequestManager {
  #config: VaultConfig

  constructor(config: VaultConfig) {
    this.#config = config
  }

  async sign(accessToken: JwtString): Promise<unknown> {
    const res = await axios.post(this.#config.url, accessToken)
    return res.data
  }
}
