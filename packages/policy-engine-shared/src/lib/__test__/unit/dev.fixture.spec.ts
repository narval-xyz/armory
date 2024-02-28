import { ENTITIES } from '../../dev.fixture'
import { validate } from '../../util/entity.util'

describe('dev fixture', () => {
  it('defines valid entities', () => {
    expect(validate(ENTITIES)).toEqual({ success: true })
  })
})
