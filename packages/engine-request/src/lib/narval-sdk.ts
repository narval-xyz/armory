import { Jwk } from '@narval/signature'
import EvaluationRequestBuilder from './builders/evaluation-request'
import { NarvalSdkConfig } from './domain'

export class NarvalSdk {
  private _config: NarvalSdkConfig
  evaluationRequest: EvaluationRequestBuilder

  constructor(config: NarvalSdkConfig, evaluationRequest?: EvaluationRequestBuilder) {
    this.evaluationRequest = evaluationRequest || new EvaluationRequestBuilder()
    this._config = config
  }

  set clientCredential(credential: Jwk) {
    this._config.client.credential = credential
  }
}
