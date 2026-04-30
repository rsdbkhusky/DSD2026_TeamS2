This review focuses on issues that impact cross-team implementation readiness, especially the IF1 contract (Sensor → Server) that S2 co-owns with V1. Findings are ordered from “project-level maintainability” to “SRS-level correctness and testability”.

#### A. Project / Website Quality (maintainability, consistency, accessibility)

::: Inconsistency · A-1
**Mixed language and inconsistent UX copy (EN pages, CN aria-label).**
Most pages are written in English, but the theme toggle uses Chinese `aria-label`/`title` strings (and toggles between CN phrases). This is not just cosmetic: screen readers will announce mixed-language UI labels, and it makes the UI feel less coherent for external reviewers.

**Recommendation:** Pick one language for UI strings (prefer English across the site) and keep `aria-label`, `title`, and visible labels consistent. If bilingual is required, add a language switch and set correct `lang` attributes per section.
:::

::: Maintainability · A-2
**Repeated inline `<script>` and per-page `<style>` blocks increase drift risk.**
`index.html`, `progress.html`, `news.html`, `member.html`, and news subpages repeat the same “dynamic base tag” script and embed sizable per-page CSS in `<style>` blocks. This will drift over time (fixes won’t propagate) and makes review harder.

**Recommendation:** Move shared logic into a single JS module (e.g., `base-init.js`) and migrate page-specific CSS blocks into `style.css` under clearly named sections. Keep HTML mostly semantic + class names.
:::

::: Accessibility · A-3
**Mobile menu toggle lacks expanded-state semantics and keyboard handling expectations.**
Current JS toggles `.open`, but the button does not update `aria-expanded`, and the menu does not expose an accessible state machine (escape-to-close, focus management).

**Recommendation:** Update `menuToggle` to manage `aria-expanded`, add ESC close, and ensure focus can reach the menu links predictably on mobile.
:::

#### B. SRS Draft v0.1 (requirements correctness + implementability)

::: Inconsistency · B-1
**Actor/System boundary is blurred (“System” listed as an actor).**
In the SRS draft, “System” is defined as an actor in Section 1, and sometimes appears in use-case actor lists (UC-04, UC-05). In standard UML/SRS practice, actors are external entities; “System” should be the subject, not a peer actor. This ambiguity propagates into flows and complicates traceability.

**Recommendation:** Split Section 1 into **Actors** (Patient, Medical Professional) and **System Components** (S1/S2/V1/V2/M1/M2). Then adopt one consistent convention: do not list “System” as an actor; represent system responsibilities in the System column / component lifelines.
:::

::: Omission · B-2
**IF1 is referenced but not specified as a testable contract (schema + transport + QoS).**
The project repeatedly states IF1 includes “JSON schema, sampling rate, error codes, MQTT structure”, but SRSv0.1 does not define these as concrete, verifiable requirements. Without this, Sprint 1 “freeze IF1” is not actionable: downstream teams cannot build stubs, mocks, or validation tests.

**Recommendation:** Add an **IF1 Contract** section (or appendix) that includes at minimum:
- **Message schema**: required fields, types, units, coordinate frames, timestamps, device/session identifiers, optional fields, versioning.
- **Sampling / timing**: nominal rate, allowed jitter, ordering guarantees, clock-sync assumptions, time base definition.
- **Transport**: BLE→M1 vs WiFi/MQTT→Server path; MQTT topic naming, payload size limits, retain/duplicate behavior, QoS level, reconnect semantics.
- **Error model**: error codes, malformed packet handling, partial data handling, retry/backoff, “calibration failed” signaling.
- **Validation rules**: what S2 must reject vs accept-with-warnings (range checks, NaNs, saturation, missing fields).
:::

::: Omission · B-3
**Connectivity requirement says “Bluetooth + WiFi”, but UC-03 specifies only Bluetooth.**
Background explicitly mentions two connection methods, yet UC-03 details BLE pairing flows only. This is a high-risk omission because it affects architecture decisions (where S2 runs, what “sensor → server” actually means, and how IF1 is delivered).

**Recommendation:** Either (a) extend UC-03 to include the WiFi/MQTT path with setup + fallback, or (b) split into UC-03A (BLE to M1) and UC-03B (WiFi/MQTT to Server). Explicitly define selection logic and failure handling.
:::

::: Ambiguity · B-4
**Cross-team flow “S2 → V1 → V2 → M1” is stated but not decomposed into component responsibilities.**
UC-04/UC-05 mention pipeline handoffs, but the flow tables collapse everything into “System”. This hides contract boundaries and makes it hard to review omissions/inconsistencies (e.g., who timestamps? who buffers? who validates?).

**Recommendation:** For UC-03/UC-04/UC-05, add at least one sequence diagram (or a structured component-step list) with lifelines for Patient, M1, S2, V1, V2, and clearly marked IF1/IF2 boundaries.
:::

::: Omission · B-5
**Non-functional requirements missing for real-time feedback and data integrity.**
UC-05 is “real-time”, but there is no latency budget, buffering policy, packet loss tolerance, or minimum viable update frequency. These are critical to define “done” for IF1/S2 and to avoid incompatible assumptions across teams.

**Recommendation:** Add NFRs with concrete targets, e.g. end-to-end feedback latency \(p95\), acceptable packet loss, offline buffering size/duration, reconnection recovery time, and security/privacy constraints for patient data in transit.
:::

::: Ambiguity · B-6
**Terminology and role naming drift (“Medical Professional” vs “physiotherapist”).**
UC-07 uses “physiotherapist” in user-facing text, while the actor is “Medical Professional”. This seems minor, but it can imply unintended authorization scope and feature ownership.

**Recommendation:** Define the actor scope once and use the same term consistently. If you need sub-roles, define them explicitly in a glossary + permissions model.
:::

**Summary of findings:** The website is strong in presentation and structure, but has avoidable maintainability and accessibility drift risks due to duplicated inline code and mixed-language UI strings. For the SRS, the highest-leverage fix for Sprint 1 is to turn IF1 from a “mentioned idea” into a **verifiable contract**: specify schema/transport/timing/errors/validation so S2 and V1 can freeze IF1 and unblock the rest of the teams with mocks and tests.
