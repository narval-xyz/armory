# Open Telemetry

Armory Stack shared Open Telemetry (OTEL) instrumentation configuration.

## Why?

OTEL registration is kept in a separate package because:

- OTEL modifies Node.js runtime behavior by patching core modules. If
  we import any dependencies before registering OTEL, those imports
  will use the unpatched runtime and won't be instrumented correctly.

- Having it separate ensures OTELis registered first, before any
  other code runs, guaranteeing proper instrumentation of all dependencies.
