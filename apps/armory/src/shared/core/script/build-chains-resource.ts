import { ApplicationException } from '../../../shared/exception/application.exception'
import { extractChain } from 'viem'
import * as chainObject from 'viem/chains'
import { registeredCoinTypes } from 'slip44';
import { HttpStatus } from '@nestjs/common';
import { ChainRegistry } from '@narval/transaction-request-intent';

export const buildNativeSlip44 = (): ChainRegistry => {
  const chains = Object.values(chainObject);

  const chainRegistry: ChainRegistry = new Map();
  chains.forEach((chain) => {
    const tokenSlip44 = registeredCoinTypes.find(([
      _coinType,
      _derivationPathComponent,
      symbol,
      _name,
    ]) => {
      return symbol === chain.nativeCurrency.symbol;
    });
    if (tokenSlip44) {
      chainRegistry.set(chain.id, {
        nativeSlip44: tokenSlip44[0],
      });
    } else {
      console.warn(`Slip44 not found for native token: ${chain.nativeCurrency.symbol}`);
    }
  });

  return chainRegistry;
}

const main = () => {
  const registry = buildNativeSlip44();
  console.log(registry);
};

main();