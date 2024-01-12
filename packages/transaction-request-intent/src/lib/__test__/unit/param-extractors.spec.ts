
import { extractErc20TransferAmount } from '../../../utils/standard-functions/param-extractors';

jest.mock('viem', () => ({
  decodeAbiParameters: jest.fn()
  .mockResolvedValueOnce([])
  .mockReturnValueOnce(['0x031d8C0cA142921c459bCB28104c0FF37928F9eD', BigInt('428406414311469998210669')])
}));

const invalidData = '0xInvalidData';
const validData = '0xa9059cbb000000000000000000000000031d8c0ca142921c459bcb28104c0ff37928f9ed000000000000000000000000000000000000000000005ab7f55035d1e7b4fe6d';
describe('extractErc20TransferAmount', () => {
  it('throws on incorrect data', () => {
    expect(() => extractErc20TransferAmount(invalidData)).toThrow('Malformed transaction request');
  });

  it('successfully extract amount on valid data', () => {
    expect(extractErc20TransferAmount(validData)).toEqual('428406414311469998210669');
  });
});
