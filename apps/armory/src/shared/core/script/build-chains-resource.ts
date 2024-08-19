import { ApplicationException } from '../../../shared/exception/application.exception'
import { extractChain } from 'viem'
import * as chainObject from 'viem/chains'
import { registeredCoinTypes } from 'slip44';
import { HttpStatus } from '@nestjs/common';
import { ChainRegistry } from '@narval/transaction-request-intent';
import * as fs from 'fs';
import * as path from 'path';

export const buildNativeSlip44 = (): ChainRegistry => {
  const chains = Object.values(chainObject);

  let count = 0;
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
      console.error(`Slip44 not found for native token: ${chain.nativeCurrency.symbol}`);
      count++;
    }
  });

  console.log(`Slip44 not found for ${count} native tokens`);
  return chainRegistry;
}

const main = () => {
  const fileName = 'chain-registry.json';
  const relativePath = '../resource';
  const filePath = path.resolve(__dirname, relativePath, fileName);

  const registry = buildNativeSlip44();
  const obj = Object.fromEntries(registry);
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
  console.log(`JSON written to ${filePath}`);
};

main();