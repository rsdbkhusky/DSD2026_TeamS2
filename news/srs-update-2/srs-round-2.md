# Requirements Analysis S2 second-round

---

## Part 1 Introduction

### 1. Revision History

| Date | Authors | Description |
|------|---------|-------------|
| Apr 29, 2026 | Zhiqi ZHANG | SRS update for Team S2; approved by requirements analysis coordinator |
| Jun 2, 2026 | Zhiqi ZHANG | Post-iteration-2 update: aligned IUC-S2-02-01 with IS architecture (S2 does not communicate with V2 directly; M1 is the intermediary); removed Token from S2 start interface; fixed subject/object errors in IUC-S2-03-02 and IUC-S2-03-03 |

### 2. Scope

None.

### 3. Glossary

| Term | Definition | Abbreviation/Alias | Remarks |
|------|------------|-------------------|---------|
| Raw Sensor Data | Sensor data collected by S1. | | The data collected by S1. |
| Formal Sensor Data | Sensor data processed by S2. | | The data collected by S1 is called raw sensor data, and S2 processes the raw sensor data to obtain the Formal sensor data |
| Rehabilitation Session | A discrete period of training during which sensor data is actively collected, processed, and streamed. | Session | Core unit of a patient's training activity. |
| Rehabilitation Session Meta Data | Meta information determined and fixed at the start of a session, including the rehabilitation training category, etc. | Session Meta Data | Key information of a session. |
| Token | A digital credential returned by V2 upon successful authentication, used by M1 to maintain the patient's logged-in state. | Login Token | Used in Register and Log In use cases. |

### 4. References

| No. | Document Name | Source/Author | Description |
|-----|---------------|---------------|-------------|
| 1 | Requirements_Analysis_Sample_EN.md | Wang Yiding | SRS format specification |
| 2 | 2026-4-27-SRS_v1.2(No rendering).md | Wang Yiding, Enhe Zhang, Diogo Pinhel | S2 Software Requirements Analysis |

---

## Part 2 External Use Cases

None.

---

## Part 3 Internal Use Cases

### 1. Actor Table

| Actor | Description |
|-------|-------------|
| S1 | Sensor team, a part of the application, responsible for basic sensor operations. |
| S2 | Sensor data processing team, a part of the application, responsible for processing formal sensor data from S1. |
| V2 | Backend server team, serving as a data transfer station between devices. |
| M1 | Mobile application group, the main body of the application. |

### 2. Use Case Table

| Use Case ID | Use Case Name | Primary Actors | Brief Description |
|-------------|---------------|----------------|-------------------|
| IUC-S2-01-01 | Start Session's Data Processing Work | M1, S2 | M1 calls S2's session start method. S2 completes initialization and returns a confirmation signal to M1; otherwise returns an error signal. |
| IUC-S2-01-02 | End Session's Data Processing Work | M1, S2 | M1 calls S2's session end method. S2 completes finalization and returns a confirmation signal to M1; otherwise returns an error signal. |
| IUC-S2-02-01 | Deliver Formal Sensor Data | M1, S2 | M1 sends a data delivery request to S2. S2 returns the data accumulated since the last delivery to M1 via the return value. M1 is then responsible for transmitting the data to V2 over the network. |
| IUC-S2-03-01 | Start Session's Raw Data Collecting Work | S1, S2 | S2 calls S1's session start method. S1 completes initialization and returns a confirmation signal to S2; otherwise returns an error signal. |
| IUC-S2-03-02 | End Session's Raw Data Collecting Work | S1, S2 | S2 calls S1's session end method. S1 completes initialization and returns a confirmation signal to S2; otherwise returns an error signal. |
| IUC-S2-03-03 | Deliver Raw Sensor Data | S1, S2 | S2 calls S1's deliver raw sensor data method. S2 completes finalization and returns a confirmation signal to M1; otherwise returns an error signal. |

### 3. Detailed Use Cases

#### IUC-S2-01-01 Start Session's Data Processing Work

| Element | Description |
|---------|-------------|
| **Reference** | IUC-S2-01-01 |
| **Actors** | M1, S2 |
| **Goal** | Allow M1 AppFrontend to start a session's data processing work. |
| **Summary** | M1 calls S2's session data processing start method. S2 completes initialization and returns a confirmation signal to M1; otherwise returns an error signal. |
| **Trigger** | M1 calls S2's session data processing start method. |
| **Precondition** | The patient is logged in. |
| **Postconditions** | The session's data processing work has started. |

**Basic Flow**

| Step | M1 | S2 |
|------|----|----|
| 1 | M1 calls S2's session data processing start method, passing the session meta data (session ID, user ID, sensor-joint mapping, and exercise type). | |
| 2 | | Initializes the program. |
| 3 | | Returns a confirmation signal. |
| 4 | Receives the confirmation signal, displays the status on screen, and proceeds with subsequent steps. | |

**Alternative Flow**

| Occurrence Step | Condition | System Response |
|----------------|-----------|-----------------|
| 2 | Initialization fails. | M1 displays an error message on screen. The step is terminated. |
| 4 | S2 method does not finish normally / times out. | M1 displays an error/timeout message on screen. The step is terminated. |

#### IUC-S2-01-02 End Session's Data Processing Work

| Element | Description |
|---------|-------------|
| **Reference** | IUC-S2-01-02 |
| **Actors** | M1, S2 |
| **Goal** | Allow M1 AppFrontend to end a session's data processing work. |
| **Summary** | M1 calls S2's session data processing end method. S2 completes finalization and returns a confirmation signal to M1; otherwise returns an error signal. |
| **Trigger** | M1 calls S2's session data processing end method. |
| **Precondition** | The session's data processing work has already started. |
| **Postconditions** | The session's data processing work has ended. |

**Basic Flow**

| Step | M1 | S2 |
|------|----|----|
| 1 | M1 calls S2's session data processing end method. | |
| 2 | | Completes the finalization work. |
| 3 | | Returns a confirmation signal. |
| 4 | Receives the confirmation signal, displays the status on screen, and proceeds with subsequent steps. | |

**Alternative Flow**

| Occurrence Step | Condition | System Response |
|----------------|-----------|-----------------|
| 2 | Finalization fails. | M1 displays an error message on screen. The step is terminated. The user may choose to forcefully terminate S2 or retry. |
| 4 | S2 method does not finish normally / times out. | M1 displays an error/timeout message on screen. The step is terminated. The user may choose to forcefully terminate S2 or retry. |

#### IUC-S2-02-01 Deliver Formal Sensor Data

| Element | Description |
|---------|-------------|
| **Reference** | IUC-S2-02-01 |
| **Actors** | M1, S2 |
| **Goal** | Allow M1 AppFrontend to obtain formal sensor data. |
| **Summary** | M1 sends a data delivery request to S2. S2 returns the data accumulated since the last delivery to M1 via the return value. M1 is then responsible for transmitting the data to V2 over the network (S2 does not communicate with V2 directly; M1 acts as the intermediary between the App side and the Server side). |
| **Trigger** | Periodically called by M1's internal logic. |
| **Precondition** | The session's data processing work has already started. |
| **Postconditions** | None |

**Basic Flow**

| Step | M1 | S2 |
|------|----|----|
| 1 | M1 calls S2's data delivery method. | |
| 2 | | Packages the data accumulated since the last delivery into Formal Sensor Data. |
| 3 | | Returns the Formal Sensor Data. |
| 4 | Receives the Formal Sensor Data. Transmits it to V2 over the network using the user Token for authentication. Proceeds with subsequent steps (e.g. displaying the data on screen). | |

**Alternative Flow**

| Occurrence Step | Condition | System Response |
|----------------|-----------|-----------------|
| 3 | S2 method does not finish normally / times out. | M1 displays an error/timeout message on screen. The step is terminated. |
| 4 | Network transmission to V2 fails. | M1 displays an error message on screen. The local data is still available; only the server sync is affected. |

#### IUC-S2-03-01 Start Session's Raw Data Collecting Work

| Element | Description |
|---------|-------------|
| **Reference** | IUC-S2-03-01 |
| **Actors** | S1, S2 |
| **Goal** | Allow S2 to start a session's raw data collecting work. |
| **Summary** | S2 calls S1's session start method. S1 completes initialization and returns a confirmation signal to S2; otherwise returns an error signal. |
| **Trigger** | S2 calls S1's session raw data collecting start method. |
| **Precondition** | The patient is logged in. |
| **Postconditions** | The session's raw data collecting work has started. |

**Basic Flow**

| Step | S2 | S1 |
|------|----|----|
| 1 | S2 calls S1's raw data collecting start method, passing the session meta data. | |
| 2 | | Initializes the program. |
| 3 | | Returns a confirmation signal. |
| 4 | Receives the confirmation signal and proceeds with subsequent steps. | |

**Alternative Flow**

| Occurrence Step | Condition | System Response |
|----------------|-----------|-----------------|
| 2 | Initialization fails. | S2 terminates its step and returns an error signal. |
| 4 | S1 method does not finish normally / times out. | S2 terminates its step and returns an error signal. |

#### IUC-S2-03-02 End Session's Raw Data Collecting Work

| Element | Description |
|---------|-------------|
| **Reference** | IUC-S2-03-02 |
| **Actors** | S1, S2 |
| **Goal** | Allow S2 to end a session's raw data processing work. |
| **Summary** | S2 calls S1's session end method. S1 completes initialization and returns a confirmation signal to S2; otherwise returns an error signal. |
| **Trigger** | S2 calls S1's session raw data collecting end method. |
| **Precondition** | The session's raw data collecting work has already started. |
| **Postconditions** | The session's raw data collecting work has ended. |

**Basic Flow**

| Step | S2 | S1 |
|------|----|----|
| 1 | S2 calls S1's raw data collecting end method. | |
| 2 | | Completes the finalization work. |
| 3 | | Returns a confirmation signal. |
| 4 | Receives the confirmation signal and proceeds with subsequent steps. | |

**Alternative Flow**

| Occurrence Step | Condition | System Response |
|----------------|-----------|-----------------|
| 2 | Finalization fails. | S2 terminates its step and returns an error signal. |
| 4 | S2 method does not finish normally / times out. | S2 terminates its step and returns an error signal. |

#### IUC-S2-03-03 Deliver Raw Sensor Data

| Element | Description |
|---------|-------------|
| **Reference** | IUC-S2-03-03 |
| **Actors** | S1, S2 |
| **Goal** | Allow S2 to obtain raw sensor data from S1. |
| **Summary** | S2 calls S1's deliver raw sensor data method. S1 returns the data accumulated since the last delivery to S2; otherwise returns an error signal. |
| **Trigger** | Periodically called by S2's internal logic. |
| **Precondition** | The session's raw data collecting work has already started. |
| **Postconditions** | None |

**Basic Flow**

| Step | S2 | S1 |
|------|----|----|
| 1 | S2 calls S1's deliver raw sensor data method. | |
| 2 | | Packages the data accumulated since the last delivery. |
| 3 | | Returns the raw sensor data. |
| 4 | Receives the raw sensor data; the subprocess continues. | |

**Alternative Flow**

| Occurrence Step | Condition | System Response |
|----------------|-----------|-----------------|
| 4 | S1 method does not finish normally / times out. | S2 method is interrupted and returns an error. |

---

*Posted by Team S2 · DSD 2025–2026 · UTAD × Jilin University*
