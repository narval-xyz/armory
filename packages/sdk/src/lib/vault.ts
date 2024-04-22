import { JwtString } from '@narval-xyz/policy-engine-domain'
import axios from 'axios'
import { ClientConfig } from './domain'

export class VaultRequestManager {
  #config: ClientConfig

  constructor(config: ClientConfig) {
    this.#config = config
  }

  async sign(accessToken: JwtString): Promise<unknown> {
    const res = await axios.post(this.#config.url, accessToken)
    return res.data
  }
}
