---
name: Offline builder AI
description: Product constraint and behavior for SWARM-BUILDER-ZERO's prompt planning.
---

The builder must remain usable without paid APIs, API keys, or cloud credits. Its prompt intelligence is deterministic and on-device: classify the request, report confidence, ask focused questions when uncertain, then pass the decisions into the generator.

**Why:** The product is explicitly intended to be 100% free and must not silently introduce metered AI usage.

**How to apply:** Prefer local heuristics and offline Android templates. If a future cloud model is offered, make it optional and never required for generation.