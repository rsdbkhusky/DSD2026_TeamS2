#### A. Structural and Security Gaps

::: Omission · A-1
**No role separation in the registration flow.**
UC-01 treats Patient and Medical Professional registration as a single identical flow. The actor merely selects a role from a dropdown. A Medical Professional account grants access to all patients private health records therefore it must carry a higher trust level than a patient account. The SRS does not describe any institutional credential check, staff ID validation, or admin approval step for Medical Professional registration. If implemented as written, anyone could self-register as a clinician and access patient data.

**Recommendation:** Add a branching alternative flow for Medical Professional registration that requires verification of institutional affiliation (e.g. staff ID, hospital domain email, or admin approval before account activation). Specify who holds the admin role and how approval is communicated.
:::

::: Omission · A-2
**No session management, token lifetime, or logout use case.**
UC-02 states that the system "issues an authentication token" upon successful login, but the SRS never specifies the token's lifetime, refresh policy, or revocation mechanism. There is no logout use case anywhere in the document. For a system handling protected health data, this is a critical security omission: a stolen token with no expiry grants permanent access. This also has direct compliance implications under regulations such as GDPR.

**Recommendation:** Specify the authentication token lifetime (e.g. 8 hours for clinical sessions, 30 days with a refresh token for home use). Add a UC-08 "Logout" use case covering both manual logout and automatic session expiry. Reference the applicable data protection regulation.
:::

#### B. Specific Content Issues

::: Inconsistency · B-1
**UC-02 requires online connectivity; UC-04 supports offline — login is unaddressed.**
UC-02's precondition states "system is online". UC-04 explicitly supports a home-setting offline buffering mode, including the scenario where network connectivity drops mid-session. However, there is no coverage of the scenario where a home patient loses connectivity *before* they have logged in. If the patient cannot authenticate without a network connection, they cannot start a session at all, a usability failure for the home-use deployment context.

**Recommendation:** Add an alternative flow to UC-02 (or a precondition clause to UC-04) addressing offline login: specify whether locally cached credentials are accepted when the network is unavailable, and under what conditions. If offline login is not supported, document this as a known limitation.
:::

::: Ambiguity · B-2
**Multi-sensor support is undefined throughout the SRS.**
The Background section describes "wearable IMU sensors" (plural) on limbs, implying that a patient may wear more than one sensor simultaneously. UC-03 "Sensor Connection", however, describes the pairing and calibration of a single sensor with no mention of how additional sensors are identified, sequenced, or distinguished by limb. The data pipeline (S2) and inference engine (V1) behaviour will differ fundamentally between single and multi-sensor configurations, yet this dimension is left completely unspecified.

**Recommendation:** Explicitly state the supported sensor count range (e.g. 1 to 4 sensors). Specify how each sensor is identified (device ID, limb assignment label), and whether the UC-03 pairing and calibration flow repeats for each sensor. If multi-sensor support is deferred to a later version, document it as an explicit out-of-scope decision.
:::

::: Ambiguity · B-3
**UC-04 references a "default plan" that is never defined.**
The precondition for UC-04 states: "an exercise plan has been prescribed (UC-07) *or a default plan exists*." No other part of the SRS defines what a default plan is. Because V1's inference compares live sensor data against the plan's target angles, an undefined default plan means V1 cannot correctly initialise a session for a new patient who has not yet seen a Medical Professional.

**Recommendation:** Define the default plan explicitly: list its contents (exercises, target angles, repetitions), specify who creates and maintains it, and state the business rule for when it applies (e.g. "if no prescribed plan exists for the patient at session start time").
:::

::: Inconsistency · B-4
**The real-time feedback data path is contradictory between UC-04 and UC-05.**
UC-04's basic flow describes the live data pipeline as S2 to V1 to V2 to M1 (sensor to inference to API gateway to mobile app). UC-05's precondition lists the same path. However, UC-05's basic flow describes V1 producing inference results and M1 rendering them directly, V2 does not appear as an intermediary in the step-by-step flow. It is unclear whether real-time feedback bypasses V2 (a direct V1 to M1 push) or always routes through V2. This ambiguity directly affects the interface contracts between the V1, V2, and M1 teams.

**Recommendation:** Clarify the canonical real-time feedback path in UC-05. If the path is V1 to V2 to M1, show V2 as an explicit step in the basic flow. If real-time feedback uses a direct V1 to M1 push, state this as a separate interface and explain how it coexists with the V2 REST API path used for session storage.
:::

::: Omission · B-5
**Safety alert threshold in UC-05 is unquantified.**
The UC-05 alternative flow triggers a full posture alert and session pause when "joint angle deviation exceeds the safety threshold." This threshold is never defined in the SRS, it is unclear whether it is a fixed system-wide constant, an exercise-specific parameter, a patient-specific value, or a configurable field within the exercise plan defined in UC-07. Without this, V1 cannot implement the alert condition and the threshold cannot be validated by the Medical Professional or tested by the M1 team.

**Recommendation:** Define the safety threshold as an attribute of the exercise plan (UC-07). The Medical Professional should be able to set a per-exercise maximum deviation angle when prescribing a plan. Document the system default for cases where no explicit threshold is set.
:::

::: Omission · B-6
**UC-06 has no access control — any Medical Professional can view any patient.**
UC-06 "Review Patient Progress" allows a Medical Professional to select "a patient from their patient list in M2." The phrase "their patient list" implies an assignment relationship, but the SRS never defines a patient–professional assignment model, how assignments are created, or what happens if a Medical Professional attempts to access a patient not assigned to them. In a multi-clinician deployment, unrestricted cross-access to all patient records is a data privacy violation.

**Recommendation:** Define the patient assignment model (1-to-1 or many-to-many). Add a precondition to UC-06 stating the patient must be assigned to the requesting Medical Professional. Add an alternative flow covering unauthorised access attempts, and specify whether cross-professional visibility is possible for on-call or emergency scenarios.
:::

::: Ambiguity · B-7
**UC-03 Bluetooth disconnection during calibration is not handled.**
The only failure alternative flow in UC-03 covers "Sensor Not Found" at scan time. There is no alternative flow for the case where the Bluetooth connection drops *after* pairing but *before* calibration completes, a common real-world failure on mobile devices, particularly in the home setting where background apps may interfere with Bluetooth. Without this coverage, the M1 implementation has no specified behaviour and teams may handle it inconsistently.

**Recommendation:** Add an alternative flow: "Bluetooth connection drops during calibration, system detects connection loss, notifies the user with a clear message, rolls state back to the scan step, and allows the patient to retry without restarting the app."
:::

**Summary of findings:** The SRS Draft v0.1 provides a solid foundation for the seven core use cases, but has critical gaps in two areas: security and session management (A-1, A-2, B-1 — essential for a medical platform handling protected health data), and cross-use-case consistency in data flows and undefined references (B-3, B-4, B-5 — which will cause divergent implementations across the V1, V2, M1, and S2 teams if not resolved before interface contracts are finalised). The access control gap in UC-06 (B-6) and the Bluetooth failure coverage in UC-03 (B-7) are additional omissions that should be addressed before the document advances to v0.2. All findings fall within the error categories identified in Fact 4 — omission, inconsistency, and ambiguity — and are best corrected now.
