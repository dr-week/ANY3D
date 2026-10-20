# How to Import Anycubic Kobra 2 Profiles into Bambu Studio / OrcaSlicer

These JSON profile presets are calibrated specifically for the **Anycubic Kobra 2** (Direct-Drive extruder, 220x220x250mm) to resolve the dangerous 300 mm/s retraction grinding, missing bed leveling mesh, and Z-wobble acceleration issues.

---

## Files Included in this Folder:
1. `Anycubic_Kobra_2_0.4_nozzle.json` — **Machine Preset** (Motion limits, direct-drive extruder settings, and calibrated start/end G-code).
2. `Generic_PLA_Anycubic_Kobra_2.json` — **Filament Preset** (Tuned temperatures, 14.5 mm³/s volumetric melt speed, and 1.0mm retraction).

---

## Step-by-Step Import Instructions:

### Method 1: Via Slicer Menu (Easiest)
1. Open **Bambu Studio** or **OrcaSlicer**.
2. Click **File** in the top-left menu bar.
3. Select **Import** > **Import Configs...** (or *Import Presets...*).
4. Navigate to this folder (`bambu_profiles`) and select:
   - `Anycubic_Kobra_2_0.4_nozzle.json`
   - `Generic_PLA_Anycubic_Kobra_2.json`
5. Click **Open**. The slicer will notify you that the presets have been loaded.
6. In your **Printer** dropdown on the left panel, select **Anycubic Kobra 2 0.4 nozzle**.
7. In the **Filament** dropdown, select **Generic PLA @Anycubic Kobra 2**.

---

### Method 2: Direct Folder Placement (If Import Configs is Hidden)
* **Windows**: Copy the files to:
  `%AppData%\Roaming\BambuStudio\user\default\machine\` (for machine profile)
  `%AppData%\Roaming\BambuStudio\user\default\filament\` (for filament profile)
* Restart Bambu Studio.
