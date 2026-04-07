This review examines the SRS Draft v0.1 from two perspectives: structural completeness of the document as a whole, and fine-grained correctness of individual sections. Issues are ordered from structural to specific.

#### A. Structural and Content Gaps

::: Omission · A-1
**Missing Use Case Diagram.**
The SRS provides a textual use case index (Section 2) but no visual Use Case Diagram. A UML use case diagram is a standard SRS component that shows actor–use-case relationships, system boundaries, and include/extend dependencies at a glance. Without it, readers must mentally reconstruct these relationships from seven separate text blocks, which increases the risk of overlooking missing coverage or misunderstood actor–use-case assignments.

**Recommendation:** Add a UML Use Case Diagram after Section 2 showing all actors (Patient, Medical Professional) on the left, the system boundary in the centre, and all seven use cases inside it, with connecting lines indicating which actors participate in which use cases.
:::

::: Omission · A-2
**Sequence Diagrams are overly simplified.**
Each use case currently presents interaction flows as a two-column Actor/System table. While this captures the turn-taking between user and system, it collapses all internal system components (S1, S2, V1, V2, M1, M2) into a single "System" column. This means the cross-team data flow — which is the defining architectural feature of this project — is invisible in the flow tables.

For example, UC-04 "Start Rehabilitation Session" mentions "opens data stream from S2 pipeline to V1" and "forwards sensor packets through S2 → V1 → V2 → M1", but this multi-component handoff is embedded in a single System cell. A proper UML Sequence Diagram with separate lifelines for Patient, M1, S2, V1, V2 would make the inter-team contract dependencies explicit and reviewable.

**Recommendation:** For at least UC-03, UC-04, and UC-05 (the use cases that span multiple system layers), supplement the Actor/System tables with UML Sequence Diagrams that show individual component lifelines.
:::

#### B. Specific Content Issues

::: Inconsistency · B-1
**Section 1 "Actors" incorrectly includes System as an actor.**
The current structure lists Patient, Medical Professional, and System as three co-equal "Actors" in Chapter 1. In UML and standard SRS practice, an *actor* is an entity external to the system that interacts with it. The System itself — including S1, S2, V1, V2, M1, M2 — is not an actor but the subject of the specification. Patient and Medical Professional are genuine actors; the six development teams and their components belong to the "System" side of every interaction.

**Recommendation:** Rename Section 1 to "Actors and System Components" or split it into two subsections: "1.1 Actors" (Patient, Medical Professional) and "1.2 System Components" (S2 pipeline, V1 AI engine, V2 API, M1 app, M2 dashboard). This makes the system boundary explicit and aligns with UML conventions.
:::

::: Ambiguity · B-2
**Actor naming is inconsistent across the document.**
The Medical Professional actor is defined in Section 1 as "A doctor or physiotherapist who reviews recovery data". This phrasing is problematic on two levels:

First, "doctor" and "physiotherapist" are not parallel categories — a physiotherapist is a specific type of healthcare professional, and if the intent is to enumerate subcategories, "doctor" should be replaced with a peer-level term (e.g. "orthopaedic surgeon" or "rehabilitation physician") rather than a generic label that logically encompasses physiotherapist.

Second, once the actor name "Medical Professional" is established, the document should use it consistently. However, UC-07 contains the notification text "Your physiotherapist has updated your exercise plan" — using a specific sub-role instead of the defined actor name. This inconsistency can mislead implementers into assuming only physiotherapists use this feature.

**Recommendation:** Define the actor once with a clear scope (e.g. "Medical Professional — any licensed clinician responsible for the patient's rehabilitation, including but not limited to physiotherapists, orthopaedic specialists, and rehabilitation physicians"). Then use "Medical Professional" exclusively in all subsequent use case text.
:::

::: Omission · B-3
**UC-03 covers only Bluetooth connectivity; WiFi is not addressed.**
The project background states that two sensor connection methods must be supported: Bluetooth to mobile phone and WiFi to server. However, UC-03 "Sensor Connection" exclusively describes Bluetooth pairing flows (clinical and home settings). There is no mention of a WiFi-based connection path, its setup procedure, fallback behaviour, or how the system decides which transport to use.

**Recommendation:** Add a WiFi connection flow to UC-03, or create a separate use case (UC-03b) for WiFi-based sensor connection. Specify how the system selects between Bluetooth and WiFi, and whether both can operate simultaneously.
:::

::: Inconsistency · B-4
**Inconsistent treatment of "System" as an actor across use cases.**
UC-04 lists its actors as "Patient, System", explicitly including System. However, UC-05 lists "Patient, System (V1 AI engine, M1 mobile app)" with component-level detail, while UC-01, UC-02, UC-06, and UC-07 do not list System as an actor at all, even though the system is equally involved in those interactions. This inconsistency makes it unclear whether "System" is being treated as an actor or not.

**Recommendation:** Adopt a uniform convention: either list System as an actor in every use case (if following a non-standard convention), or remove it from all actor lists and let the System column in the flow tables represent the system side (which is the standard UML approach).
:::

::: Omission · B-5
**UC-01 does not specify email format validation or confirmation flow.**
The registration use case validates whether an email is already registered and whether the password meets complexity rules, but it does not mention validation of the email address format itself (e.g. RFC 5322 compliance). Additionally, Step 5 states "Sends confirmation email to the registered address", but the flow ends without specifying whether the user must click a confirmation link before the account becomes active, or whether they can log in immediately.

**Recommendation:** Add an email format validation step. Clarify whether account activation requires email confirmation (click-through link) or if the account is immediately active upon registration.
:::

::: Omission · B-6
**No non-functional requirements.**
The SRS exclusively defines functional requirements through use cases. There is no section covering non-functional requirements such as performance constraints (e.g. maximum acceptable latency for real-time feedback in UC-05), security requirements (e.g. encryption of sensor data in transit, authentication token expiry policy), reliability targets (e.g. system availability, data loss tolerance during offline buffering), or usability requirements (e.g. maximum setup time for home patients).

**Recommendation:** Add a dedicated non-functional requirements section covering at minimum: performance (latency, throughput), security (data encryption, authentication), reliability (availability, offline resilience), and usability (setup time, accessibility).
:::

::: Ambiguity · B-7
**UC-03 trigger is misleading.**
The trigger for UC-03 "Sensor Connection" is defined as "Patient selects 'Start Session' in the mobile app". However, the use case is about sensor connection, not session start. UC-04 "Start Rehabilitation Session" has its own trigger ("patient taps 'Begin Exercise'") that logically follows UC-03. Using "Start Session" as the trigger for sensor connection conflates two distinct user actions and creates ambiguity about when sensor connection actually occurs.

**Recommendation:** Change the UC-03 trigger to "Patient selects 'Connect Sensor' in the mobile app" to clearly distinguish the sensor connection action from the session start action.
:::

::: Omission · B-8
**No error handling or timeout specifications for sensor calibration.**
UC-03 describes a calibration routine where the patient holds still for 3 seconds, but does not specify what happens if calibration fails (e.g. patient moves during countdown, sensor data is noisy). There is no maximum retry count, no timeout for the overall connection process, and no fallback if calibration repeatedly fails.

**Recommendation:** Add an alternative flow for calibration failure, including retry limits and a graceful degradation path (e.g. "after 3 failed calibration attempts, suggest repositioning the sensor and display troubleshooting guidance").
:::

**Summary of findings:** The SRS Draft v0.1 covers the core functional scenarios adequately, but has significant structural gaps (missing Use Case Diagram and proper Sequence Diagrams) and multiple instances of inconsistency and ambiguity in actor definitions, naming conventions, and connectivity coverage. These issues are characteristic of the error types identified in Fact 4 — omission, inconsistency, and ambiguity — and are best caught now, in the requirements phase, before they propagate into design and implementation. A revised v0.2 should address all eight issues identified above.
