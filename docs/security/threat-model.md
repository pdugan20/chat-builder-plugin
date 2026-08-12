# Figma chat builder threat model

Protected assets are the user's Anthropic credential, conversation prompts and generated
content, Figma document data, plugin storage, and document integrity. UI messages, model
output, selected nodes, component structure, fonts, and remote responses are untrusted.

Required controls:

- Store the provider credential only in the intended Figma client storage and never place
  it in document nodes, console output, debug panels, fixtures, exports, or errors.
- Validate both sides of the typed UI/plugin message boundary and reject unknown commands
  or oversized values.
- Resolve required components, layers, fonts, and inputs before document mutation; make
  failure cleanup remove or roll back partially assembled content.
- Treat model output as content, never code or an instruction to invoke another capability.
- Keep test-data mode independent of provider network calls.

Update this model when credential storage, network destinations, message contracts,
document mutation, exports, or telemetry changes.
