import { ENTITIES } from '../../dev.fixture'
import { validate } from '../../util/entity.util'

describe('dev fixture', () => {
  it('defines valid entities', () => {
    const { success } = validate(ENTITIES)
    expect(success).toEqual(true)
  })
})
