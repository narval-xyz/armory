# Transaction Request Intent

[![Transaction Request Intent CI](https://github.com/narval-xyz/narval/actions/workflows/transaction_request_intent_ci.yml/badge.svg?branch=main)](https://github.com/narval-xyz/narval/actions/workflows/transaction_request_intent_ci.yml)

Library to decode a
[TransactionRequest](https://viem.sh/docs/glossary/types#transactionrequest)
into an object with granular information.

## Testing

```bash
 make signature-verifier/test/unit
 make signature-verifier/test/unit/watch
```

## Formatting

```bash
make signature-verifier/format
make signature-verifier/lint

make signature-verifier/format/check
make signature-verifier/lint/check
```
