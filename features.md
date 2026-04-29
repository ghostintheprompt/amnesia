# Amnesia: Source of Truth (Ghost-Protocol Tier)

This document defines the official scenarios, alerts, and guardrails for the Amnesia Cybersecurity Integrity Protocol.

## 1. Scenarios (Offensive)
| ID | Name | Description | Logic Implementation |
| :--- | :--- | :--- | :--- |
| **s1** | Meta-Exfil | Covert exfiltration of GPS and device metadata via WebSocket. | `src/scenarios/exfil.ts` |
| **s2** | Ghost-Persistence | Persistence mechanism via extension-based DOM injection. | `extension/ghost.js` |
| **s3** | Side-Channel-VLM | Timing analysis of Gemini/Ollama inference to detect model version. | `src/scenarios/sidechannel.ts` |
| **s4** | Parse-Overflow | Simulated buffer overflow in the binary asset parser. | `src/utils/parser.ts` |
| **s5** | Stego-Trojan | Embedding of encrypted payloads within scrubbed image pixels. | `src/utils/stego.ts` |

## 2. SOC Alerts (Defensive)
| ID | Name | Trigger Condition | Response Protocol |
| :--- | :--- | :--- | :--- |
| **INC-001** | LEAK_DETECTED | Gemini/VLM identifies a high-probability location leak. | Immediate UI Red-Alert |
| **INC-002** | AUTH_BYPASS | Detected attempt to access API without valid session keys. | IP Nullification |
| **INC-003** | LOCAL_VLM_FAIL | Local VLM (Ollama) fails or returns inconsistent results. | Fallback to Zero-Cloud |
| **INC-004** | STEGO_SIG_FOUND | Pixel-variance analysis detects possible steganography. | Quarantine Asset |
| **INC-005** | BATCH_ANOMALY | Processing volume exceeds 1000 assets/min. | Rate-Limit Trigger |

## 3. Guardrails (Policy)
| ID | Name | Description | Enforcement |
| :--- | :--- | :--- | :--- |
| **POL-001** | ZERO_CLOUD_MANDATE | Forbidden use of external APIs for sensitive regions. | Hard-coded Blocklist |
| **POL-002** | AUDIT_IMMUTABILITY | Every scrub event must be logged to an immutable file. | Signed `scrub.log` |
| **POL-003** | REDACTION_INTEGRITY | Minimum blur radius of 50px for detected landmarks. | Programmatic Verification |
