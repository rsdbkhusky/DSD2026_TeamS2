This review covers two documents: (1) the Interface Specification v2.0, focusing on sections relevant to S2, and (2) the S2 System Design Draft (Back-end section).

#### A. About Interface Specification v2.0

::: Omission / A-1
**collect.py lacks specification for error and termination behaviour.**
The spec states collect.py outputs sensor data to stdout, but does not specify what happens when the sensor disconnects mid-stream, whether collect.py runs indefinitely until killed, or what signal the server uses to stop collection.

**Recommendation:** Add a termination subsection: collect.py runs until SIGTERM, exits 0 on graceful shutdown, non-zero on sensor error.
:::

::: Ambiguity / A-2
**The 45-value CSV format is not fully defined.**
The spec says "45 comma-separated values" but does not define the meaning or order of the 45 columns, numeric precision, whitespace rules, or line ending convention.

**Recommendation:** Add a data dictionary mapping all 45 columns to sensor axes/nodes. Specify no whitespace padding and LF line endings.
:::

::: Inconsistency / A-3
**collect.py is placed under "Server calls Database" but is not a database operation.**
The Sensor Interface is nested alongside the `db` package, which is misleading about module ownership.

**Recommendation:** Move Sensor Interface to a dedicated section separate from the database module.
:::

#### B. About S2 System Design (Back-end)

::: Omission / B-1
**Asynchronous buffer overflow behaviour is not specified.**
The System Design describes an asynchronous buffer between S2-02 and S2-03 but does not define what happens when the buffer is full (e.g. if V1 stops consuming data). Should S2-02 block, drop oldest samples, or drop newest?

**Recommendation:** Specify a maximum buffer size and an overflow policy (e.g. drop oldest samples and log a warning).
:::

::: Ambiguity / B-2
**Session start/close request handling is unclear across S2-02 and S2-03.**
Both S2-02 and S2-03 receive the Start/Close session request from M1, but the design does not clarify what each module does on session close. Should S2-02 stop writing to buffer immediately? Should S2-03 flush remaining buffer contents before stopping?

**Recommendation:** Define the session lifecycle: on Start, S2-02 begins accepting data and S2-03 begins transmitting. On Close, S2-02 stops accepting, S2-03 flushes remaining buffered data, then both enter idle state.
:::

**Summary:** The Interface Spec provides a workable contract for S2 but needs clarification on process lifecycle (A-1), data format semantics (A-2), and document organisation (A-3). The System Design correctly decomposes S2 into three sub-processes with an asynchronous buffer, but needs to specify buffer overflow policy (B-1) and session state management across modules (B-2).
