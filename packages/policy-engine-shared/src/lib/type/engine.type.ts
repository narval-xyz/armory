import { EvaluationRequest, EvaluationResponse } from './domain.type'
import { Policy } from './policy.type'
import { Entities } from '../schema/entity.schema.shared'

export interface Engine<Implementation> {
  evaluate(request: EvaluationRequest): Promise<EvaluationResponse>
  setPolicies(policies: Policy[]): Engine<Implementation>
  getPolicies(): Policy[]
  setEntities(entities: Entities): Engine<Implementation>
  getEntities(): Entities
  load(): Promise<Implementation>
}
