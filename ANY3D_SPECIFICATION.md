# ANY3D Architecture & Technical Specification

> **Target Hardware:** Anycubic Kobra 2 (Direct-Drive, Cartesian Bed-slinger)  
> **UI Engine:** Zuari High-Velocity Framework (`@zuari/core`, `@zuari/signals`, `@zuari/wasm`, `@zuari/spatial`, `@zuari/ui`)  
> **Slicing Core:** `cura-wasm` (WebAssembly port of CuraEngine)  
> **Toolpath Visualizer:** `gcode-preview` (Three.js WebGL G-code engine)

---

## 1. Off-the-Shelf Open-Source Accelerator Stack

| Functionality | Recommended GitHub Repository | License | Integration Method |
| :--- | :--- | :--- | :--- |
| **Slicing Engine** | [`Cloud-CNC/cura-wasm`](https://github.com/Cloud-CNC/cura-wasm) | LGPL-3.0 | Zero-install WebAssembly engine; takes `.stl` and JSON profile params, outputs `.gcode`. |
| **G-Code Toolpath Visualizer** | [`xyz-tools/gcode-preview`](https://github.com/xyz-tools/gcode-preview) | MIT | Real-time multi-color toolpath preview (travel, retraction, walls, infill) on WebGL canvas. |
| **3D Bed & Transform Controls** | Three.js + `@zuari/spatial` | MIT | Model placement, rotation, uniform scale, and bounding box validation against Kobra 2 bed. |
| **Community 3D Models** | Open Thingiverse API (`thingiverse-client`) & Printables GraphQL | MIT | REST/GraphQL client fetching metadata, thumbnails, and direct `.stl` streams. |

---

## 2. Hardware Calibration: Anycubic Kobra 2 Profile

The root cause of "printer hovering without extruding" is **filament stripping and heat creep** caused by treating a direct-drive printer like a Bowden printer (retraction speed 80-300 mm/s or distance > 2mm). 

### Enforced Calibration Parameters
```json
{
  "$schema": "./schemas/printer-profile.schema.json",
  "id": "anycubic_kobra_2",
  "name": "Anycubic Kobra 2",
  "bed": {
    "width_x_mm": 220,
    "depth_y_mm": 220,
    "height_z_mm": 250,
    "origin": "front_left",
    "shape": "rectangular"
  },
  "extruder": {
    "type": "direct_drive",
    "nozzle_diameter_mm": 0.4,
    "filament_diameter_mm": 1.75,
    "max_volumetric_speed_mm3s": 15.0,
    "retraction": {
      "distance_mm": 1.0,
      "max_safe_distance_mm": 1.8,
      "retract_speed_mms": 40.0,
      "prime_speed_mms": 40.0,
      "max_safe_speed_mms": 50.0,
      "z_hop_mm": 0.2
    }
  },
  "motion_limits": {
    "outer_wall_speed_mms": 80,
    "inner_wall_speed_mms": 150,
    "infill_speed_mms": 180,
    "first_layer_speed_mms": 40,
    "travel_speed_mms": 250
  },
  "materials": {
    "pla": {
      "nozzle_temp_c": 210,
      "bed_temp_c": 60,
      "fan_speed_pct": 100
    },
    "petg": {
      "nozzle_temp_c": 235,
      "bed_temp_c": 75,
      "fan_speed_pct": 40
    }
  },
  "custom_gcode": {
    "start": "G28 ; Home all axes\nM420 S1 ; Load bed mesh leveling\nG1 Z2.0 F3000 ; Move Z up\nG1 X0.1 Y20 Z0.3 F5000.0 ; Move to start position\nG1 X0.1 Y200.0 Z0.3 F1500.0 E15 ; Draw purge line 1\nG1 X0.4 Y200.0 Z0.3 F5000.0 ; Move side\nG1 X0.4 Y20 Z0.3 F1500.0 E30 ; Draw purge line 2\nG92 E0 ; Reset Extruder\nG1 Z2.0 F3000 ; Move Z up",
    "end": "M104 S0 ; Turn off nozzle\nM140 S0 ; Turn off bed\nG91 ; Relative positioning\nG1 E-1 F1800 ; Retract 1mm\nG1 Z10 F3000 ; Raise head\nG90 ; Absolute positioning\nG1 X0 Y220 F3000 ; Present print\nM84 ; Disable motors"
  }
}
```

---

## 3. UI/UX Architecture Powered by Zuari

Zuari’s zero-Virtual-DOM architecture eliminates UI lag when adjusting slicing sliders or switching layers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ANY3D [Top Bar: Model Name | Kobra 2 [Active] | Material: PLA | Slicing Status] │
├───────────────┬──────────────────────────────────────────────┬──────────────┤
│ 1. MARKETPLACE│ 2. 3D PLATTER & LAYER VIEW (WebGPU / Three)   │ 3. ZUARI     │
│ (Printables / │                                              │    SETTINGS  │
│  Thingiverse) │  - 220x220mm Kobra 2 Grid                    │  [Simple]    │
│               │  - Transform Gizmos (Scale, Rotate, Layflat) │  Quality: 0.2│
│ [Search Bar]  │  - Interactive Layer Slider (Z-axis scrub)   │  Infill: 15% │
│ [Model Cards] │  - Feature colors:                           │  Support: [x]│
│  - Thumbnail  │     ■ Outer Wall  ■ Infill  ■ Travel moves   │  ─────────── │
│  - License    │                                              │  [Expert]    │
│  - "Load to   │                                              │  Retraction  │
│    Bed" Btn   │                                              │  Speed: 40   │
│               │                                              │  Dist: 1.0   │
├───────────────┴──────────────────────────────────────────────┴──────────────┤
│ [Bottom Bar: Stats] Print Time: 1h 24m | Weight: 42g | [SLICED] -> [SAVE GCODE]│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Safety Interlock Mechanism
Whenever a parameter is adjusted via `@zuari/signals`:
- If `retraction.distance_mm > 1.8`, display warning: *"Direct-drive extruder risk: excess retraction causes heat-creep clogs."*
- If `retraction.retract_speed_mms > 50`, clamp value and warn: *"Excess speed will grind filament and cause motor hover failure."*
- If $\text{Linear Speed} \times \text{Layer Height} \times \text{Nozzle Width} > 15\text{ mm}^3/\text{s}$, trigger high-flow alarm.
