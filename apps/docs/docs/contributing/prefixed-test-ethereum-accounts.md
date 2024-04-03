# Prefixed test Ethereum accounts

To simplify user identification in the code, we're using a naming convention
where the first three characters of their addresses correspond to the first
letter of their names. For example, Alice's address starts with `0xaaa`, Bob's
with `0xbbb``, and so on.

See Alice's address below:

```text
0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43
--^^^
```

> These are testing accounts ment for signing transactions in local & test
> environments. **DO NOT USE THEM IN PRODUCTION**.

## Test accounts

- Root
  - Address: `0x000c0d191308a336356bee3813cc17f6868972c4`
  - Public key: `0x04a9f3bcf6505059597f6f27ad8c0f03a3bd7a1763520b0bfec204488b8e58407ee92845ab1c35a784b05fdfa567715c53bb2f29949b27714e3c1760e3709009a6`
  - Private key: `0xa95b097938cc1d1a800d2b10d2a175f979613c940868460fd66830059fc1e418`
- Alice
  - Address: `0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43`
  - Public key: `0x04cdbf8bc251c3b69e6c57c137de4dc7d930a6f8b3531887058ce0cd588e201d16e8f6ede9dc3101e4bbc87a7b615d866d7b3f3f1d2d5ab4df793bfd7ab8c2ef3b`
  - Private key: `0x454c9f13f6591f6482b17bdb6a671a7294500c7dd126111ce1643b03b6aeb354`
- Bob
  - Address: `0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23`
  - Public key: `0x049b9ce3f6ff08fd4bc1fb5e72eeded19905e6c8d98fbaf0103c3754ef52d19140033e51ecf1896e629d3e92b6fa399487bc72b9a399942205354e08f37c72e655`
  - Private key: `0x569a6614716a76fdb9cf21b842d012add85e680b51fd4fb773109a93c6c4f307`
- Carol
  - Address: `0xccc1472fce4ec74a1e3f9653776acfc790cd0743`
  - Public key: `0x04380e29e588c1d17054cccb84eaa852c1c4822c3bbec9ff557a4c1c137db47d6c9cb2b942bfd51ea643f6b5422cc1d3a17bdd13d2ae4e7eb0fbe3c9f637297545`
  - Private key: `0x33be709d0e3ffcd9ffa3d983d3fe3a55c34ab4eb4db2577847667262094f1786`
- Dave
  - Address: `0xddd26a02e7c54e8dc373b9d2DCb309ECdeCA815D`
  - Public key: `0x0407c5c9cfa9a4b62bce2638326f7b1195249a2d0e257d6d1f8a51dd2d4cdfdfb45945dcb35c84bbc7fda8192c2f4cb6a6c437c850c9b6345126d357f61190a656`
  - Private key: `0x82a0cf4f0fdfd42d93ff328b73bfdbc9c8b4f95f5aedfae82059753fc08a180f`

## Generate new prefixed accounts

To generate new prefixed accounts, you can use the snippet below. It depends on
[viem](https://viem.sh/) API, so make sure you have it installed.

```typescript
import { PrivateKeyAccount, generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

const MAX_ATTEMPTS = 1_000_000
const DESIRED_PREFIX = '0xbbb'

let account: PrivateKeyAccount
let attempts = 0

while (attempts <= MAX_ATTEMPTS) {
  const privateKey = generatePrivateKey()
  account = privateKeyToAccount(privateKey)
  const prefix = account.address.toLowerCase().substring(0, 5)
  attempts++

  if (prefix === DESIRED_PREFIX) {
    console.log({
      address: account.address,
      publicKey: account.publicKey,
      privateKey: privateKey
    })
  }
}
```
