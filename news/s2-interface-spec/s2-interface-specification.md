# S2 Interface Specification

## 1. Overview

This document defines the interface specifications for all data exchanges that cross the S2 module boundary，Reference to [Team S2's System Design](https://rsdbkhusky.github.io/DSD2026_TeamS2/news/system-design-revision.html). These specifications are **language-agnostic and transport-agnostic**: they define *what data* is exchanged, and *how errors are handled*.

The transport mechanism (function call, HTTP etc.) depends on the final deployment architecture, which is discussed separately in Chapter 3.

S2 has exactly **four external interfaces**, identified from the Level 1 Data Flow Diagram:

| ID | Direction | From | To | Data Flow Name |
|----|-----------|------|----|----------------|
| IF-S1-S2 | Input | S1 (Sensor) | S2 | Raw IMU packet |
| IF-M1-S2 | Input | M1 (AppFrontend) | S2 | Start/Close session request |
| IF-S2-M1 | Output | S2 | M1 (AppFrontend) | Format data |
| IF-S2-V2 | Output | S2 | V2 (DB) | Format data |

## 2. Interface Specifications

### 2.1 IF-S1-S2: Raw IMU Packet

**Interface Attributes**

| Attribute | Value |
|-----------|-------|
| Dataflow direction | S1 -> S2 |
| Cross-device | No (S1 and S2 are on the same device) |
| Possible transport | Function call / HTTP REST API (Two options) |
| Service provider | S1 |
| Service user | S2 |

In practical use, methods such as function calls or inter-process communication can be adopted. The specific approach remains to be determined. The following takes function calls as an example.

#### 2.1.1 `s1.sensor.read()`

Read a batch of IMU samples collected over the specified duration.

**Parameters:**
- None

**Returns:**
- **List[SensorSample]**: A list of IMU samples collected during the time window. May be empty if the sensor produced no valid data during the period.

**Example:**
```
samples = s1.sensor.read()
for s in samples:
    print(s.timestamp, s.roll, s.pitch, s.yaw)
```

#### 2.1.2 `s1.sensor.status()`

Query the current status of the sensor hardware connection.

**Parameters:**
- None

**Returns:**
- **SensorStatus**: An object describing the current sensor state.

**Example:**
```
st = s1.sensor.status()
if not st.connected:
    print("Sensor error:", st.errorMessage)
```

#### 2.1.3 class `SensorSample`

A single IMU sensor reading at one point in time.

**Attributes:**
- **timestamp** (*int*): Unix timestamp in milliseconds at the time of sampling.
- **deviceId** (*str*): Unique sensor device identifier (e.g. `"1IYwPyBcytYa9htYB0LOJQ=="`).
- **deviceName** (*str*): Human-readable sensor name (e.g. `"WTL1"`).
- **accX** (*float*): Accelerometer X-axis, in g.
- **accY** (*float*): Accelerometer Y-axis, in g.
- **accZ** (*float*): Accelerometer Z-axis, in g.
- **gyroX** (*float*): Gyroscope X-axis, in deg/s.
- **gyroY** (*float*): Gyroscope Y-axis, in deg/s.
- **gyroZ** (*float*): Gyroscope Z-axis, in deg/s.
- **roll** (*float*): Roll angle, in degrees.
- **pitch** (*float*): Pitch angle, in degrees.
- **yaw** (*float*): Yaw angle, in degrees.

#### 2.1.4 class `SensorStatus`

Describes the current state of the sensor connection.

**Attributes:**
- **connected** (*bool*): `True` if the sensor is currently connected and producing data.
- **errorMessage** (*str or None*): Human-readable error description if the sensor is in an error state. Possible values: `"sensor_disconnected"`, `"data_corruption"`, `"timeout"`. `None` if no error.

### 2.2 IF-M1-S2: Start/Close Session Request

**Interface Attributes**

| Attribute | Value |
|-----------|-------|
| Dataflow direction | M1 -> S2 |
| Cross-device | No |
| Possible transport | Function call / HTTP REST API (Two options) |
| Service provider | S2 |
| Service user | M1 |

In practical use, methods such as function calls or inter-process communication can be adopted. The specific approach remains to be determined. The following takes function calls as an example.

#### 2.2.1 `s2.session.start(sessionId, patientId, sensorJointMapping, payloadStatus)`

Start a data acquisition session. S2 begins reading sensor data from S1, validating, buffering, and sending to V2.

**Parameters:**
- **sessionId** (*str*): Unique identifier for this session. MUST be non-empty.
- **patientId** (*str*): Identifier of the patient. MUST be non-empty.
- **sensorJointMapping** (*dict*): Mapping from sensor device ID to joint name. For example, `{"1IYwPyBcytYa9htYB0LOJQ==": "left_knee", "xR3fG...": "right_elbow"}`. This mapping is fixed for the entire session.
- **payloadStatus** (*str*): The exercise/task type for this session (e.g. `"bend_knee_10"`). Fixed for the entire session.

**Returns:**
- **StartResult**: An object indicating whether the session started successfully.

**Raises:**
- *ValueError*: If `sessionId` or `patientId` is empty, or `sensorJointMapping` is empty.

**Notes:**
- Only one session can be active at a time. Calling `start()` while a session is already running returns failure.
- If the sensor is not connected, returns failure with an error message.
- `sensorJointMapping` and `payloadStatus` are stored by S2 and included in every Format data output for the duration of the session.

**Example:**
```
result = s2.session.start(
    "session-001",
    "patient-001",
    {"1IYwPyBcytYa9htYB0LOJQ==": "left_knee", "xR3fG...": "right_elbow"},
    "bend_knee_10"
)
if result.success:
    print("Acquisition started")
else:
    print("Failed:", result.errorMessage)
```

#### 2.2.2 `s2.session.stop()`

Stop the current data acquisition session. S2 flushes remaining buffered data to V2, then enters idle state.

**Parameters:**
- None

**Returns:**
- **SessionSummary**: Summary of the completed session.

**Raises:**
- *RuntimeError*: If no session is currently active.

**Example:**
```
summary = s2.session.stop()
print(f"Collected {summary.sampleCount} samples in "
      f"{summary.endTime - summary.startTime} ms, "
      f"{summary.errorCount} errors")
```

#### 2.2.3 class `StartResult`

Result of a session start attempt.

**Attributes:**
- **success** (*bool*): `True` if the session started successfully, `False` otherwise.
- **errorMessage** (*str or None*): Reason for failure. `None` if success is `True`. Possible values: `"session_already_active"`, `"sensor_not_connected"`.

#### 2.2.4 class `SessionSummary`

Summary of a completed data acquisition session.

**Attributes:**
- **sessionId** (*str*): Identifier of the closed session.
- **sampleCount** (*int*): Total number of valid samples collected and sent.
- **errorCount** (*int*): Total number of samples that failed validation and were discarded.
- **startTime** (*int*): Unix timestamp in milliseconds when the session started.
- **endTime** (*int*): Unix timestamp in milliseconds when the session ended.

### 2.3 IF-S2-M1: Format Data

**Interface Attributes**

| Attribute | Value |
|-----------|-------|
| Dataflow direction | S2 -> M1 |
| Cross-device | No |
| Possible transport | Function call / HTTP REST API (Two options) |
| Service provider | S2 |
| Service user | M1 |

In practical use, methods such as function calls or inter-process communication can be adopted. The specific approach remains to be determined. The following takes function calls as an example.

#### 2.3.1 `s2.data.read()`

Read all Format data accumulated since the last call. Returns a `FormatData` object containing three asynchronous data lists (sensor readings, target angles, and error events), plus the session context that was set at session start.

**Parameters:**
- None

**Returns:**
- **FormatData**: An object containing all data accumulated since the last call. See 2.3.2.

**Notes:**
- This function only returns data while a session is active (between `s2.session.start()` and `s2.session.stop()`).
- The three lists inside `FormatData` are **asynchronous**: they may have different lengths on each call, because each sensor samples independently and target angle computation runs at its own rate.
- The data returned here is the same Format data that S2 sends to V2 via the network interface (2.4).

**Example:**
```
data = s2.data.read()
for s in data.sensorData:
    print(s.timestamp, s.sensorId, s.roll, s.pitch, s.yaw)
for t in data.targetAngles:
    print(t.timestamp, t.angle)
```

#### 2.3.2 class `FormatData`

The output data structure of S2. Contains three asynchronous data lists and a fixed session context. Used by both IF-S2-M1 (local function call) and IF-S2-V2 (network upload).

**Attributes:**
- **sessionContext** (*SessionContext*): Session-level information set at start, fixed for the entire session. See 2.3.3.
- **sensorData** (*List[SensorSample]*): Validated sensor readings from all sensors since the last read. Each sensor produces samples independently; the list may contain interleaved samples from different sensors. See 2.3.4.
- **targetAngles** (*List[TargetAngle]*): Target angles computed by S2 core since the last read. The number of entries is independent of `sensorData`. See 2.3.5.
- **errors** (*List[ErrorEvent]*): Error events that occurred since the last read (e.g. sensor disconnection, validation failure). See 2.3.6.

#### 2.3.3 class `SessionContext`

Session-level information, fixed for the entire session duration.

**Attributes:**
- **sessionId** (*str*): Unique session identifier.
- **patientId** (*str*): Patient identifier.
- **sensorJointMapping** (*dict*): Mapping from sensor device ID to joint name (e.g. `{"1IYwPyBcytYa9htYB0LOJQ==": "left_knee"}`).
- **payloadStatus** (*str*): Exercise/task type and payload for this session (e.g. `"bend_knee_10"`).

#### 2.3.4 class `TargetAngle`

A target angle computed by S2 core from sensor data.

**Attributes:**
- **timestamp** (*int*): Unix timestamp in milliseconds when the angle was computed.
- **angleID** (*str*): Angle indentifier.
- **angle** (*float*): The computed target angle, in degrees.

#### 2.3.6 class `ErrorEvent`

An error event that occurred during data acquisition.

**Attributes:**
- **timestamp** (*int*): Unix timestamp in milliseconds when the error occurred.
- **sensorId** (*str or None*): The sensor that caused the error, or `None` if not sensor-specific.
- **errorType** (*str*): Type of error. Possible values: `"sensor_disconnected"`, `"validation_failure"`, `"timeout"`.
- **message** (*str*): Human-readable error description.

### 2.4 IF-S2-V2: Format Data

**Interface Attributes**

| Attribute | Value |
|-----------|-------|
| Dataflow direction | S2 -> V2 -> V1 |
| Cross-device | Yes |
| Possible transport | HTTP REST API |

These data are temporarily passed to V1 through group V2, and V2 is not responsible for processing these data.

S2 sends Format data to V2 on the cloud server via HTTP REST API. The upload payload follows the `FormatData` structure defined in 2.3.2. V2 SHOULD provide the following endpoints.

#### 2.4.1 `POST /api/session`

Create a new session record on the cloud. Includes the session context that is fixed for the entire session.

The request SHOULD be of type `application/json`. For example,

```json
{
    "sessionId": "session-001",
    "patientId": "patient-001",
    "sensorJointMapping": {
        "1IYwPyBcytYa9htYB0LOJQ==": "left_knee",
        "xR3fG...": "right_elbow"
    },
    "payloadStatus": "bend_knee_10",
    "startTime": 1714456800000
}
```

Returns `200 OK` if created, `409 Conflict` if the sessionId already exists.

#### 2.4.2 `POST /api/session/<sessionId>/data`

Upload a batch of Format data to the cloud. The three data lists (sensorData, targetAngles, errors) are asynchronous and may have different lengths.

The request SHOULD be of type `application/json`. For example,

```json
{
    "sensorData": [
        {
            "timestamp": 1714456800000,
            "sensorId": "1IYwPyBcytYa9htYB0LOJQ==",
            "accX": 0.2266, "accY": 0.2915, "accZ": 0.9668,
            "gyroX": 0.0, "gyroY": 3.11, "gyroZ": -0.73,
            "roll": 15.57, "pitch": -13.78, "yaw": -144.01
        },
        {
            "timestamp": 1714456800030,
            "sensorId": "xR3fG...",
            "accX": 0.1102, "accY": 0.3301, "accZ": 0.9812,
            "gyroX": 0.45, "gyroY": -1.02, "gyroZ": 0.11,
            "roll": 8.23, "pitch": -5.41, "yaw": -72.55
        }
    ],
    "targetAngles": [
        {
            "timestamp": 1714456800020,
            "angleID": "angle01",
            "angle": 42.3
        }
    ],
    "errors": []
}
```

Returns `200 OK` if accepted, `400 Bad Request` if format is invalid, `401 Unauthorized` if authentication fails.

#### 2.4.3 `PUT /api/session/<sessionId>/end`

Mark a session as ended on the cloud.

The request SHOULD be of type `application/json`. For example,

```json
{
    "endTime": 1714456860000,
    "sampleCount": 1200,
    "errorCount": 3
}
```

Returns `200 OK` always.

**Error handling:**
- On network failure: S2 buffers data locally (in the asynchronous buffer) and retries.
- On repeated failure: S2 continues acquiring data to avoid data loss; buffer overflow policy applies.
- The `status` field in each batch allows V2 to distinguish clean data from degraded data.

## 3. Communication Methods

This project uses two communication methods depending on whether the components are on the same device or different devices.

### 3.1 Function Call (Same Device and Same Process)

When two components run on the same device (e.g. S1, S2, and M1 on the patient's phone), they communicate through **direct function calls**. One component provides a set of functions (like `s2.session.start()`), and the other component calls them directly.

This is the simplest and most efficient method: no network, no serialization, no latency. The function signature (name, parameters, return type) **is** the interface contract. If the components happen to run in different processes on the same device, the function signatures remain the same, but the underlying transport is replaced by an IPC mechanism (e.g. service binding on HarmonyOS) that serializes the parameters and return values automatically. The interface definition does not change.

In this project, the function call interfaces are:
- **S1 provides** `s1.sensor.read()` and `s1.sensor.status()` for S2 to call.
- **S2 provides** `s2.session.start()`, `s2.session.stop()`, and `s2.data.read()` for M1 to call.

### 3.2 HTTP REST API (Different Devices or Different Process)

When two components run on different devices connected by a network (e.g. S2 on the phone, V2 on the cloud server), they communicate through **HTTP REST API**. One component acts as the server (V2), exposing URL endpoints. The other component acts as the client (S2), sending HTTP requests.

Each request specifies:
- **Method**: `GET` (read), `POST` (create/send), `PUT` (update), `DELETE` (remove)
- **URL**: the endpoint path (e.g. `/api/session/<sessionId>/data`)
- **Body**: the data payload in JSON format
- **Response**: a status code (200, 400, 401, etc.) and optionally a JSON body

This method works across any network and any programming language. The trade-off is higher latency and the need for error handling (network failures, timeouts, retries).

In this project, the HTTP REST API interfaces are:
- **V2 provides** `POST /api/session`, `POST /api/session/<sessionId>/data`, `PUT /api/session/<sessionId>/end` for S2 to call.
