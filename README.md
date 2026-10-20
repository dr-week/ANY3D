# ANY3D Slicer (Anycubic Kobra 2 Calibrated)

**ANY3D** is an open-source, modular, lightweight 3D slicer desktop application pairing an embedded community 3D model marketplace with an instant-slice canvas specifically fine-tuned for the **Anycubic Kobra 2** (Direct-Drive extruder, 220x220x250mm).

The UI and reactive state graph are powered strictly by the **Zuari Framework** (`@zuari/core`, `@zuari/signals`, `@zuari/spatial`, `@zuari/ui`) with direct-to-DOM updates and zero Virtual DOM overhead.

---

## 🛠️ Architecture & Core Components

1. **Direct-Drive Hardware Guardrails (`packages/profiles/anycubic_kobra_2.json`)**:
   - **Retraction Distance**: 1.0 mm nominal. Reactive interlock triggers a hard hazard alarm if $> 1.8$ mm to prevent heat creep and throat clogs.
   - **Retraction Speed**: 40 mm/s. Clamped with reactive interlock to prevent filament grinding and "hover printing" without extrusion.
   - **Volumetric Melt Flow Rate**: 15 mm³/s hard hotend ceiling; alerts if Linear Speed $\times$ Extrusion Width $\times$ Layer Height exceeds the melt capacity.
   - **Start G-Code**: Automatically loads calibrated bed mesh leveling (`M420 S1`) + dual purge wipe line.
   - **Speeds**: First Layer 40 mm/s, Outer Wall 80 mm/s, Infill 180 mm/s, Travel 250 mm/s.

2. **Zuari Reactive Core & UI (`packages/core`, `packages/signals`, `packages/ui`)**:
   - Ultra-lightweight reactive dependency graph based on TC39 Signals.
   - Direct DOM part interpolation without Virtual DOM diffing.
   - Reactive validator alarms responding instantly to slider changes.

3. **3D Spatial Bed & Mesh Manipulator (`packages/spatial`)**:
   - Real-scale 220x220x250 mm Kobra 2 build plate with textured PEI sheet.
   - Spatial controls: Auto-center on bed, lay-flat on build plate, 90° rotation, uniform scaling.
   - Real-time out-of-bounds bed detection.

4. **G-Code Toolpath Visualizer (`src/services/toolpath-viewer.ts`)**:
   - WebGL toolpath preview with color coding:
     - Outer walls (Cyan)
     - Infill paths (Amber)
     - Rapid travel moves (Blue)
     - Direct-drive retractions (Orange / Red)

5. **Community Discovery Client (`src/services/community-client.ts`)**:
   - Thingiverse REST and Printables GraphQL client adapter.
   - One-click "Load to Bed" for community benchmark models and Kobra 2 upgrades.
   - Local STL / 3MF file import.

---

## 🚀 Getting Started

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
```
Build output is generated in `./dist`.
