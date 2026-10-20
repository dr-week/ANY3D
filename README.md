<div align="center">

# ANY3D

### Precision Slicing & Additive Manufacturing Platform
**Engineered by Danger Labs**

[![Engine](https://img.shields.io/badge/Engine-Zuari_Signals_v1.0-00ae42?style=flat-square)](https://github.com/dr-week/ANY3D)
[![Target-Hardware](https://img.shields.io/badge/Target-Anycubic_Kobra_2-blue?style=flat-square)](https://github.com/dr-week/ANY3D)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--VDOM_Direct--DOM-black?style=flat-square)](https://github.com/dr-week/ANY3D)
[![License](https://img.shields.io/badge/License-Apache_2.0-lightgrey?style=flat-square)](LICENSE)

<br />

```
+---------------------------------------------------------------------------------------+
|  PREPARE  |  PREVIEW  |  DEVICE  |  PROJECT                      DANGER LABS [ANY3D]  |
+---------------------------------------------------------------------------------------+
|  CALIBRATED PROFILES  |  220 x 220 x 250 mm PEI SHEET  |  MULTI-REPOSITORY DISCOVERY  |
|  Direct-Drive Tuned   |  Real-Time Toolpath Inspector  |  MicroSD FAT32 Clean Export  |
+---------------------------------------------------------------------------------------+
```

</div>

---

## Executive Overview

**ANY3D** is an industrial-grade, client-side additive manufacturing engine and spatial toolpath visualizer engineered by **Danger Labs**. Built from first principles on the proprietary **Zuari Reactive Framework**, ANY3D eliminates heavy runtime dependencies, Virtual DOM overhead, and extraneous telemetry to deliver microsecond-latency slicing operations.

The platform combines a clean, parameter-dense interface modeled after tier-one industrial slicers (Bambu Studio, OrcaSlicer) with hardware-enforced mechanical guardrails tailored specifically for the **Anycubic Kobra 2** (Direct-Drive extruder architecture).

---

## Core Systems & Architecture

```
                  +------------------------------------------------+
                  |           DANGER LABS WORKBENCH UI             |
                  |     Zero-VDOM Tagged Templates (@zuari/core)   |
                  +-----------------------+------------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
    +-----------------+------------------+   +----------------+-----------------+
    |       REACTIVE STATE GRAPH         |   |      3D SPATIAL KINEMATICS       |
    |      TC39 Signals Primitive        |   |    Three.js PEI Build Volume     |
    |        (@zuari/signals)            |   |         (@zuari/spatial)         |
    +-----------------+------------------+   +----------------+-----------------+
                      |                                       |
    +-----------------+------------------+                    |
    |   HARDWARE SAFETY INTERLOCKS       |                    |
    | Direct-Drive Retraction Thresholds |                    |
    |  Volumetric Melt Rate Monitoring   |                    |
    +-----------------+------------------+                    |
                      |                                       |
                      +-------------------+-------------------+
                                          |
                  +-----------------------+------------------------+
                  |               G-CODE COMPILER                  |
                  |      M420 S1 Mesh Recovery & Dual Purge        |
                  |      FAT32 8.3 Compliant MicroSD Export        |
                  +------------------------------------------------+
```

### 1. Hardware Guardrails & Kinematics Engine
- **Direct-Drive Retraction Interlock**: Retraction distance is locked to a calibrated 1.0 mm nominal baseline at 40 mm/s. Hardware guardrails flag parameters exceeding 1.8 mm to eliminate heat creep and throat clogs inside all-metal hotends.
- **Volumetric Melt Flow Rate Guard**: Monitors Linear Velocity * Extrusion Width * Layer Height against a strict 15.0 mm3/s ceiling.
- **Z-Axis Acceleration Envelope**: Clamps lead-screw traversal to 500 mm/s2 to prevent missed steps during layer transitions.
- **Dynamic Bed Mesh Recall**: Injects deterministic `M420 S1` sequences following homing procedures (`G28`) to maintain full 25-point auto-bed leveling compensation.

### 2. Multi-Community Discovery & Model Queue
- Direct integration with verified repository endpoints:
  - **MakerWorld** (Bambu Lab 3MF ecosystems)
  - **Printables** (Prusa Research community standards)
  - **Thingiverse** (Open-source foundational libraries)
  - **Cults3D & MyMiniFactory** (Commercial and creator distribution networks)
- **Zero-Friction Print Queue**: Organize multiple geometries within an integrated queue with real-time aggregate filament mass calculations and instantaneous build-plate transfer.

### 3. Toolpath Visualizer & G-Code Inspector
- WebGL-accelerated layer analyzer with distinct extrusion classifications:
  - Outer Wall perimeters
  - Inner Wall boundaries
  - Sparse Infill paths
  - Rapid travel vectors
  - Retraction and priming coordinates

### 4. Zero-VDOM Reactive Foundation
ANY3D is powered by internal Danger Labs packages:
- `@zuari/signals`: Fine-grained reactive dependency tracking graph based on TC39 specifications.
- `@zuari/core`: Direct-to-DOM tagged template renderer bypassing Virtual DOM reconstruction.
- `@zuari/spatial`: Hardware-calibrated 220 x 220 x 250 mm PEI textured build volume with real-time bounding volume hierarchy (BVH) collision detection.

---

## Technical Specifications

| Parameter | Specification | Hardware Guardrail |
| :--- | :--- | :--- |
| **Print Volume** | 220 x 220 x 250 mm | Real-time boundary clipping |
| **Extruder Type** | Direct-Drive Integrated | Retraction clamp: 0.5 mm - 1.8 mm |
| **Nozzle Diameter** | 0.40 mm standard | Layer height ceiling: 0.28 mm |
| **Max Volumetric Speed** | 15.0 mm3/s | Velocity auto-derate |
| **Bed Leveling Mode** | Marlin ABL Mesh | `M420 S1` mesh recovery mandatory |
| **Storage Protocol** | MicroSD / TransFlash (FAT32) | 8.3 clean alphanumeric naming |
| **UI Rendering Engine** | Zuari Zero-VDOM Native | Under 16ms frame budgeting |

---

## Workspace Layout & Module Structure

```
ANY3D/
├── launcher/                      # Standalone zero-dependency runtime
│   ├── launch.bat                 # Windows one-click runtime launcher
│   ├── launch.ps1                 # PowerShell automated launcher
│   ├── launch.sh                  # Unix / macOS launch script
│   └── launcher.js                # Embedded HTTP distribution daemon
├── packages/
│   ├── core/                      # Zuari tagged template DOM compiler
│   ├── signals/                   # TC39 fine-grained reactive graph
│   ├── spatial/                   # Three.js 220x220x250mm kinematic bed
│   ├── profiles/                  # Hardware machine limits and profiles
│   └── ui/                        # High-density UI component primitives
├── src/
│   ├── components/                # Bambu Studio aligned UI modules
│   │   ├── bambu-header.ts        # Primary mode and action header
│   │   ├── bambu-panel.ts         # Numeric parameter drawer
│   │   ├── cart-modal.ts          # Free model print queue modal
│   │   ├── sidebar.ts             # Multi-repository model discovery
│   │   └── icons.ts               # Clean vector SVG icon definitions
│   ├── services/
│   │   ├── slicer-engine.ts       # Marlin G-code compiler
│   │   ├── slicer-state.ts        # Centralized signal registry
│   │   ├── online-discovery.ts    # Multi-platform model aggregator
│   │   ├── toolpath-viewer.ts     # WebGL layer-by-layer visualizer
│   │   └── sdcard-service.ts      # FAT32 compliant storage export
│   └── main.ts                    # Workbench entry orchestration
└── bambu_profiles/                # Exported native Bambu Studio configs
```

---

## Quick Start & Deployment

### Prerequisites
- Node.js runtime environment (v18.0.0 or higher)
- npm package manager (v9.0.0 or higher)

### Installation
Clone the repository and install project dependencies:

```bash
git clone https://github.com/dr-week/ANY3D.git
cd ANY3D
npm install
```

### Development Execution
Start the high-frequency local development server:

```bash
npm run dev
```
Navigate to `http://localhost:3000` to inspect the workbench.

### Production Compilation
Compile the zero-VDOM distribution assets:

```bash
npm run build
```
Optimized assets will be assembled in the `./dist` directory.

### One-Click Desktop Launcher
For offline production use without an active shell:
- **Windows**: Double-click `launcher/launch.bat`
- **PowerShell**: Execute `./launcher/launch.ps1`
- **Unix**: Execute `./launcher/launch.sh`

---

## Bambu Studio Integration

ANY3D includes pre-configured, calibrated profile definitions located in `bambu_profiles/`:
- `Anycubic_Kobra_2_0.4_nozzle.json` (Machine Kinematics)
- `Generic_PLA_Anycubic_Kobra_2.json` (Material Properties)

Profiles can be deployed directly into native Bambu Studio / OrcaSlicer user directories:
`%AppData%\Roaming\BambuStudio\user\<User_ID>\`

---

## Engineering & Governance

**ANY3D** is actively developed and maintained by **Danger Labs**. Contributions adhering to high-performance computing standards and strict hardware validation are welcome via pull requests.

Copyright (c) Danger Labs. All rights reserved.
Licensed under the Apache License, Version 2.0.
