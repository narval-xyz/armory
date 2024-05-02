import { armorySdk } from '../../api-call'

describe('armorySdk', () => {
  it('should work', () => {
    expect(armorySdk()).toEqual('armory-sdk')
  })
})
