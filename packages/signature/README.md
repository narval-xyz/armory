# Signature Library

The Signature library is designed to decode and verify JWTs, providing robust support for various cryptographic operations, including signature verification and JWT decoding without signature validation. It's built with flexibility in mind, supporting Ethereum's EOA signatures and traditional JWT signing algorithms.

## Features

- Decode JWTs without verifying their signature.
- Verify JWT signatures with support for Ethereum EOA and traditional algorithms.
- Generate SHA256 hashes for arbitrary objects, with support for BigInt primitives.
- Sign requests using private keys and predefined algorithms.

## Usage

### Signing

```
import { Alg, sign } from '@narval/signature';

const signingInput = {
  request: {
    message: 'stuff'
  }, // this can be anything
  privateKey: 'your-private-key-pem-or-hex',
  algorithm: Alg.ES256K, // Example algorithm
  kid: 'your-key-id',
  iat: new Date(),
  exp: new Date(new Date().getTime() + 60 * 60 * 1000), // Expires in 1 hour
};

sign(signingInput)
  .then(signedJwt => console.log(signedJwt))
  .catch(error => console.error(error));
```

### Decoding

```
import { decode } from '@narval/signature';

const jwt = 'your.jwt.string';
try {
  const decodedJwt = decode(jwt);
  console.log(decodedJwt);
} catch (error) {
  console.error(error);
}
```

### Verifying

```
import { sign } from '@narval/signature';

const verificationInput = {
  rawToken: 'your.jwt.string',
  publicKey: 'your-public-key-in-pem-or-hex', // !! PubKey NOT eoa address
};

verify(verificationInput)
  .then(decodedJwt => console.log(decodedJwt))
  .catch(error => console.error(error));
```

## Testing

```bash
 make signature/test/unit
 make signature/test/unit/watch
```

## Formatting

```bash
make signature/format
make signature/lint

make signature/format/check
make signature/lint/check
```
