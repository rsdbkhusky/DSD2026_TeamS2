This review covers the same two artefacts as the team review page: (1) the Interface Specification v2.0 (April 9, 2026 draft), with emphasis on anything that affects how `collect.py` is invoked and how bytes move on the wire, and (2) the S2 System Design Draft (Back-end, April 13, 2026). I co-authored the System Design with the PM, so this note is deliberately written as a **self-inspection**: it does **not** repeat Zhiqi ZHANG’s findings line-by-line (see `zhiqi-zhang.md` and the consolidated review news page for A-1–A-3 and B-1–B-2), but **extends** them with architect-level gaps that still block implementation or integration testing.

#### A. About Interface Specification v2.0

::: Omission / A-4
**No clear separation between the sensor data plane and human-readable diagnostics for `collect.py`.**
If stdout is reserved exclusively for the 45-value CSV stream—as implied by downstream “stdin of predict” usage—then logging, calibration hints, and ad-hoc `print()` debugging cannot be multiplexed without corrupting consumers. The spec does not state whether stderr is reserved for diagnostics, whether log lines must be structured, or whether any side channel exists.

**Recommendation:** State an invariant: stdout = one sample per line (45 fields) only; stderr = JSON-lines or prefixed log records; forbid non-CSV stdout. Add one worked example showing a sensor fault without breaking the CSV stream.
:::

::: Ambiguity / A-5
**How simulation and “M2 requests synthetic data” map onto the single `collect.py` deliverable is undefined at the IF boundary.**
The System Design shows S2-01 fed by M2 while IF1 is framed around `collect.py`. The Interface Spec does not say whether simulation is a flag (`--fixture`), a second helper script, IPC, or a build-time stub, which leaves Team M2/S2 boundary ownership unclear.

**Recommendation:** Add a short “Test & simulation profile” subsection: allowed entry points, which team ships them, and how the Server must spawn or compose processes so that the CSV contract on stdout is unchanged in dev vs prod.
:::

::: Omission / A-6
**Concurrency and lifecycle when the Server (or V1) restarts mid-session are not specified.**
Beyond graceful SIGTERM (already raised in the PM review), teams still need rules for: duplicate `collect.py` invocations, partial line writes, and what happens if stdout is closed while the sensor thread is still sampling.

**Recommendation:** Specify single-writer semantics (at most one active collector per device id), partial-line handling (discard vs buffer until newline), and exit codes when the pipe consumer disappears.
:::

#### B. About S2 System Design (Back-end)

::: Inconsistency / B-3
**“Flush the output buffer after each sample” conflicts with the stated purpose of the asynchronous FIFO.**
S2-02 claims the FIFO decouples acquisition from network I/O, yet the buffering row says the output buffer *should* be flushed after each sample for real-time delivery. Readers cannot tell whether “flush” refers to an internal staging buffer, a forced synchronous push to S2-03, or a filesystem flush—each implies different blocking behaviour.

**Recommendation:** Replace “flush” with precise verbs: e.g. “enqueue one validated sample into the FIFO without waiting for TCP ACK” and “on session close, S2-03 drains the FIFO with a bounded-time tail flush policy (see B-1 in PM review).”
:::

::: Omission / B-4
**Validation rules (“physically plausible ranges”, “sudden jumps”) are not quantified.**
Continuity and range checks sound good in a table but are not implementable as written: two developers will pick incompatible thresholds, and unit tests cannot be grounded.

**Recommendation:** Add an appendix table: per-field or per-node bounds, maximum sample-to-sample delta, and whether violations mark the sample bad, clamp it, or trigger a session fault event on a side channel agreed with V1.
:::

::: Omission / B-5
**Downstream path names only V1 while the architecture lists V1 and V2.**
S2-03 is described as sending “formal data to V1 AI” only. It is unclear whether V2 ever consumes the same stream via the Server, or whether S2’s obligation ends at a single Server-facing pipe.

**Recommendation:** Add one sentence under §1 or §3.3 clarifying the consumer set: e.g. “S2 exposes one IF1 stream to the Server process; the Server fans out to V1/V2 as per its design,” or explicitly scope V2 out with a traceability note.
:::

::: Ambiguity / B-6
**The 45-float CSV line still lacks explicit time or sequence semantics inside the format.**
The design states the values represent one timestep but does not say whether implicit order equals wall-clock order, whether dropped samples are visible, or how to align with M1 session boundaries when bursts occur.

**Recommendation:** Either (i) document that strict monotonic sampling is guaranteed by S2-02 and any gap is surfaced as an empty line / sentinel row agreed in IF1, or (ii) extend the contract with an explicit sample counter or timestamp field in a versioned layout (coordinated with the PM’s data-dictionary action A-2).
:::

**Summary:** I agree with the PM review that we must nail process lifecycle, CSV semantics, document taxonomy, FIFO overflow, and session choreography before Sprint 4 coding. From an architect’s pass, the highest-risk *additional* gaps are mixed stdout/diagnostics (A-4), undefined simulation composition (A-5), unspecified pipe/partial-line behaviour (A-6), contradictory buffering language (B-3), non-testable validation thresholds (B-4), an unclear V1-vs-V2 consumer story (B-5), and missing temporal alignment rules for the bare CSV stream (B-6). Addressing these together will make IF1 implementable without hidden assumptions between S2, Server, and AI teams.
