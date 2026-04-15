This review focuses on requirement-level gaps in the S2 System Design v0.1 that would otherwise be decided implicitly during implementation.

#### A. Structural and Content Gaps

::: Omission / A-1
**The “45-value CSV” payload is treated as a label, not a contract.**
The design references “45 comma-separated floating-point values” repeatedly, but never defines column semantics (meaning, order, units, coordinate frame) nor whether a timestamp is included. Validation rules like “physically plausible ranges” and “continuity” are not actionable without concrete thresholds.

**Recommendation:** Add a data dictionary for all 45 fields (name, unit, expected range) and define whether sampling time is encoded (either as an extra field or via an external session-clock contract).
:::

#### B. Specific Content Issues

::: Omission / B-1
**S2-03 → V1 delivery behaviour is unspecified (protocol, framing, retry, and ordering).**
“Formal data to V1 AI” is the main output of S2-03, but the design does not state how data is transported (stdin pipe vs socket vs HTTP), how records are framed (newline-delimited CSV, length-prefixed, etc.), what happens on transient network failure, or whether in-order delivery is required.

**Recommendation:** Specify the transport and message framing, plus minimal delivery semantics: retry/backoff, reconnection, ordering guarantees (or lack of them), and what metadata V1 needs per session (session id, patient id, exercise id).
:::

::: Ambiguity / B-2
**The asynchronous buffer is described as “never blocked” but has no resource limits or persistence story.**
The buffer is “in-memory FIFO” and “ensures sensor sampling is never blocked”, which is incompatible with finite RAM on an embedded target unless a drop/block policy is defined. The design also claims it “prevents data loss during transient network delays” but does not define what “transient” means (seconds? minutes?) or whether overflow is acceptable.

**Recommendation:** Define a maximum buffer size (in samples or seconds), an overflow policy (drop oldest/newest or block acquisition), and whether any spill-to-disk is allowed on the target platform.
:::

**Summary:** The module breakdown is clear, but the current draft leaves three key contracts underdefined: payload semantics (45 fields), delivery semantics to V1, and bounded buffering on embedded hardware.

