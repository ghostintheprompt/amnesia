<div align="center">
<img width="500" height="500" alt="AmnesiaIcon" src="icon.png" />

# Amnesia

**Secure visual asset scrubbing and privacy remediation protocol.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Web/CLI](https://img.shields.io/badge/Platform-Web%2FCLI-blueviolet.svg)](#)
[![Release: v1.0.0](https://img.shields.io/badge/Release-v1.0.0-emerald.svg)](https://github.com/ghostintheprompt/amnesia/releases)

</div>

Amnesia identifies and remediates visual identifiers that link digital assets to physical locations. It uses high-inference scrubbing to wipe regional traces, landmarks, and boutique signatures that can be used for geolocation.

### Features

| Feature | Description |
| :--- | :--- |
| **Visual Scanning** | Scans URLs for images and videos containing potential privacy leaks. |
| **High-Inference Analysis** | Detects landmarks, street signs, reflections, and regional foliage via Gemini. |
| **Zero-Cloud Protocol** | Toggle local VLM mode to run scans entirely offline (requires Ollama/LLaVA). |
| **Sanitizer UI** | Interactive "Wipe & Download" redaction to apply heavy visual blurs before saving. |
| **Ghost Mode Extension** | Right-click any web image to send it directly to your local Amnesia instance. |
| **CLI Scrubber** | Batch metadata erasure for local visual assets. |

### Installation

**Build from Source**
```bash
git clone https://github.com/ghostintheprompt/amnesia.git
cd amnesia
npm install
```

### Usage

1. **Web Interface:**
   - Run `npm run dev` to start the local server.
   - Enter a target URL to scan for assets.
   - Run "Wipe Analysis" on individual assets to detect privacy risks, or use the "Zero-Cloud" local mode.
   - Click "Wipe & Download" to save a visually sanitized version of the image.

2. **Ghost Mode Browser Extension:**
   - Go to `chrome://extensions/` and load the unpacked `extension/` folder.
   - Right-click any image or page and select "Send to Amnesia Scrubber".

3. **Global CLI Scrubber:**
   - Install globally: `npm install -g .`
   - Run `amnesia-scrub <directory_path>` anywhere to strip all metadata from local assets.

### Privacy Statement
Amnesia is built by MDRN Corp. It operates 100% locally or via direct API calls to Google Gemini. No telemetry, no tracking, no bloat.

---
Built by [MDRN Corp](https://ghostintheprompt.com) — [mdrn.app](https://ghostintheprompt.com)
