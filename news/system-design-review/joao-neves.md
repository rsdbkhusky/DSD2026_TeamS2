This review covers two documents: (1) the Interface Specification v2.0, focusing on the Sensor Interface contract and data format definition relevant to S2, and (2) the S2 System Design Draft, examining the three sub-process specifications and the asynchronous buffer design.

#### A. About Interface Specification v2.0

::: Omission / A-1
**No sampling rate or timing contract defined for collect.py output.**
The Interface Spec defines the output format of `collect.py` (45 comma-separated values per line) but never specifies the nominal sampling rate. Downstream consumers (V1's `predict` program) must make assumptions about how fast data arrives. If S2 sends data at 100 Hz but V1 expects 50 Hz, the buffer will overflow or inference will be unreliable.

**Recommendation:** Add a timing subsection to the Sensor Interface contract specifying: nominal sampling rate (Hz), whether samples are guaranteed to arrive in chronological order, and the time base definition (wall clock, sensor timestamp, or server-assigned).
:::

::: Ambiguity / A-2
**The 45-value CSV format lacks a column mapping and unit definitions.**
The spec states "45 comma-separated values" but nowhere defines what each of the 45 columns represents. The System Design correctly acknowledges this gap ("Each sample contains exactly 45 comma-separated floating-point values representing one time-step of sensor readings from multiple IMU nodes") but does not resolve it.

**Recommendation:** Add a data dictionary table mapping all 45 column indices. Without this, V1 cannot correctly interpret the data and S2-01 cannot generate plausible simulated values.
:::

::: Inconsistency / A-3
**Calibration data is mentioned but its relationship to collect.py output is undefined.**
The System Design states that "the same 45-value CSV format is used by collect.py, calibration data files, train program, and predict program." This implies calibration data is a prerequisite for correct inference, but the Interface Spec does not define how calibration data is produced or who produces it (S2 or V1), or whether collect.py output must be calibration-corrected before transmission.

**Recommendation:** Clarify in the Interface Spec whether collect.py outputs raw (uncalibrated) sensor values or calibration-adjusted values. If calibration is S2's responsibility, specify the calibration file format, and application procedure. If it is V1's responsibility, state this explicitly.
:::

#### B. About S2 System Design (Back-end)

::: Omission / B-1
**S2-01 trigger source is ambiguous and the data path is inconsistent.**
The S2-01 module specification states its trigger is a "Simulated data request from M2 App/frontend." However, the Level 1 DFD description states S2-01 outputs a "Simulated data request from M2" as an input, not a separate trigger. More importantly, it is unclear why M2 (the clinical dashboard) would be the source of a simulated data request for development testing.

**Recommendation:** Clarify who actually triggers S2-01: is it M2, a developer flag in collect.py, or an internal test harness? If M2 is correct, explain the use case.
:::

::: Omission / B-2
**S2-02 validation rules lack error handling and output behaviour on validation failure.**
The S2-02 module defines four validation rules (column count, numeric, range, continuity), but does not specify what S2-02 does when a sample fails validation. Without this, each implementation will handle validation failures differently, making cross-team testing impossible.

**Recommendation:** Add an error handling column to the validation rules table specifying the action for each failure type.
:::

::: Ambiguity / B-3
**"Physically plausible ranges" for the Range validation rule are undefined.**
The S2-02 validation table states that "values should fall within physically plausible ranges for IMU sensors" — but this range is never quantified. Without knowing the sensor model or the expected joint motion range, neither the S2 team nor reviewers can verify. This validation rule is currently untestable.

**Recommendation:** Either specify concrete range bounds per column, or reference the sensor datasheet and define the check as "within the sensor's rated measurement range.".
:::

**Summary:** The Interface Spec provides a workable structural contract for S2 but has gaps in timing (A-1) and data semantics (A-2) that will cause incompatible implementations between S2 and V1 if not resolved before Sprint 4. The calibration ambiguity (A-3) is a cross-team gap that needs explicit ownership assignment. The System Design correctly decomposes S2 into three sub-processes, but B-1 (S2-01 trigger source) may be worth verifying with the team, and B-2/B-3 leave the validation layer partially unimplementable.