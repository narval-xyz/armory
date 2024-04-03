---
title: Idempotency Key vs Nonce
---

# Idempotency Key vs Nonce — they are DIFFERENT concepts actually

## TL;DR

We need to use both nonce and idempotency key in our requests, because they serve
different purposes.

The nonce is on the request that is being signed by the clients. This prevents
replay attacks ensuring each authorization can only be used once.
idempotency key is on the API request itself, used to handle errors & ensure we
don’t duplicate process.

## Idempotency Key

- Purpose: An idempotency key is used to ensure that a specific operation is
  executed only once, even if the request is sent multiple times. It’s typically
  used in scenarios where network uncertainty might cause a client to send the
  same request multiple times (like processing payments).
- How It Works: The client generates a unique key and includes it with a
  request. The server then checks if it has already processed a request with that
  key. If it has, the server does not re-execute the operation but may return the
  result of the original operation.
- Usage: Common in financial transactions, RESTful APIs, and any operation where
  duplicate requests could lead to unintended consequences (like charging a credit
  card multiple times).
- Example: A client submits a payment request with an idempotency key. If the
  network fails and the client resends the request, the server recognizes the key
  and doesn’t process the payment again.

## Nonce

- Purpose: A nonce (“number used once”) is a unique value that is used to ensure
  freshness of a request. It’s primarily used to prevent replay attacks, where an
  attacker could intercept a request and attempt to re-send it.
- How It Works: The server typically keeps track of nonces used in recent
  requests. When a client sends a request with a nonce, the server checks if it
  has seen that nonce before. If not, it processes the request; otherwise, it
  rejects it.
- Usage: Common in cryptographic operations, authentication protocols, and APIs
  where the timing and uniqueness of each request are critical for security.
- Example: In an authentication system, each login attempt might include a nonce
  to ensure that an intercepted login request cannot be reused by an attacker.

## Differences and when to use each

- Uniqueness vs. Freshness: Idempotency keys ensure an operation is not
  performed more than once, while nonces ensure a request is not processed more
  than once by confirming its freshness.
- Scope: Idempotency keys are more about the business logic and operation level
  (e.g., preventing duplicate transactions), whereas nonces are about the security
  and protocol level (e.g., preventing replay attacks).
- Lifetime: Nonces generally have a short lifespan and are closely tied to the
  timing of requests. Idempotency keys may have a longer lifespan, depending on
  how long the server needs to recognize duplicate operations.

## Conclusion

- Use Idempotency Keys for operations where duplicate requests could lead to
  unintended business consequences, like processing payments or creating
  resources.
- Use Nonces for security-sensitive operations where you need to ensure that
  each request is unique and cannot be replayed, like in authentication or
  cryptographic signatures.

In some cases, an API might use both mechanisms, leveraging idempotency keys for
operational integrity and nonces for security against replay attacks.
