import { EvaluationRequest, EvaluationResponse } from './domain.type'
import { Entities } from './entity.type'
import { Policy } from './policy.type'

export interface Engine<Implementation> {
  evaluate(request: EvaluationRequest): Promise<EvaluationResponse>
  setPolicies(policies: Policy[]): Engine<Implementation>
  getPolicies(): Policy[]
  setEntities(entities: Entities): Engine<Implementation>
  getEntities(): Entities
  load(): Promise<Implementation>
}
