import { ENTITIES as ENTITIESV2 } from '../../dev.fixture.v2'
import { validate } from '../../util/entity.util'

describe('dev fixture', () => {
  it('defines valid entities for v1', () => {
    expect(validate(ENTITIESV2)).toEqual({ success: true })
  })

  it('defines valid entities for v2', () => {
    expect(validate(ENTITIESV2)).toEqual({ success: true })
  })
})
