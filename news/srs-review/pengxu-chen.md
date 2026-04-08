This review highlights three high-impact requirement gaps in the SRS Draft v0.1 that are likely to cause cross-team implementation drift.

#### A. Structural and Content Gaps

::: Omission · A-1
**No non-functional requirements or acceptance targets.**
The SRS describes end-to-end flows but provides no measurable constraints (e.g. feedback latency for UC-05, expected sampling throughput, availability, data-loss tolerance for buffering, or baseline security/privacy controls for clinical data). Without targets, “real-time”, “safe”, and “reliable” remain untestable claims.

**Recommendation:** Add a dedicated Non-Functional Requirements section with quantified acceptance criteria (latency budget, offline buffer duration/data-loss limits, security controls such as encryption in transit/at rest, token expiry, audit logging, and availability targets).
:::

#### B. Specific Content Issues

::: Inconsistency · B-1
**Offline buffering conflicts with the real-time feedback contract.**
UC-03/UC-04 allow sessions to continue while offline via local buffering, but UC-05 assumes the S2 → V1 → V2 → M1 pipeline is operational and inference results are returned per packet. The SRS does not state what M1 must do when V1/V2 are unreachable (pause the session, disable feedback, degraded guidance, or on-device inference).

**Recommendation:** Specify offline behaviour explicitly: whether real-time feedback is disabled/delayed/local, what exactly is buffered (raw IMU vs derived features), maximum buffer size/time, and reconciliation rules when uploading a completed session.
:::

::: Omission · B-2
**Feedback thresholds and scoring are underspecified.**
UC-05 relies on “within tolerance”, “safety threshold”, and an “accuracy score”, but defines none of them (units, per-joint tolerance bands, severity levels, or how accuracy is computed). This leaves V1/M1/M2 free to implement incompatible metrics and UI states.

**Recommendation:** Add a requirements table for UC-05 defining tolerances and alert thresholds per exercise/joint, plus the exact V1 output schema (fields, units, and update rate) that M1 and M2 must consume.
:::

**Summary of findings:** The draft captures the main scenarios, but it is missing testable quality targets and leaves key cross-layer contracts (offline handling and feedback metrics) too loose for independent implementation.
