import { html, type TemplateResult } from '../../packages/core/index.js';
import {
  materialPreset,
  layerHeight,
  infillDensity,
  enableSupports,
  retractionDistance,
  retractionSpeed,
  outerWallSpeed,
  infillSpeed,
  firstLayerSpeed,
  travelSpeed,
  nozzleTemp,
  bedTemp,
  startGcode,
  endGcode,
  settingsMode,
  validationAlarms,
  modelDimensions,
  triangleCount
} from '../services/slicer-state.js';
import { zuariBadge } from '../../packages/ui/index.js';
import kobraProfile from '../../packages/profiles/anycubic_kobra_2.json';

export function renderParameterDrawer(): TemplateResult {
  const isSimple = settingsMode.value === 'simple';
  const dims = modelDimensions.value;

  return html`
    <div class="h-full flex flex-col bg-slate-900/95 backdrop-blur-md border-l border-slate-800 text-slate-100 select-none">
      <!-- Header with Mode Selector -->
      <div class="p-3 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-200">Print Parameters</span>
        </div>

        <div class="flex p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <button
            class="px-2.5 py-1 rounded-md font-medium transition-all ${isSimple ? 'bg-cyan-500/20 text-cyan-300 shadow' : 'text-slate-400 hover:text-slate-200'}"
            @click=${() => { settingsMode.value = 'simple'; }}
          >
            Simple
          </button>
          <button
            class="px-2.5 py-1 rounded-md font-medium transition-all ${!isSimple ? 'bg-cyan-500/20 text-cyan-300 shadow' : 'text-slate-400 hover:text-slate-200'}"
            @click=${() => { settingsMode.value = 'expert'; }}
          >
            Expert
          </button>
        </div>
      </div>

      <!-- Real-Time Hardware Validator Alarms Banner -->
      ${renderValidatorBanners()}

      <!-- Drawer Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <!-- Target Machine & Model Geometry Card -->
        <div class="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 text-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-200">${kobraProfile.name}</span>
            ${zuariBadge({ label: 'DIRECT-DRIVE', variant: 'info' })}
          </div>
          <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <div>Bed: <span class="text-slate-200">220×220×250mm</span></div>
            <div>Nozzle: <span class="text-slate-200">0.40 mm</span></div>
            <div>Size: <span class="text-cyan-300 font-mono">${dims.x}×${dims.y}×${dims.z}mm</span></div>
            <div>Faces: <span class="text-cyan-300 font-mono">${(triangleCount.value / 1000).toFixed(1)}k</span></div>
          </div>
        </div>

        ${isSimple ? renderSimpleControls() : renderExpertControls()}
      </div>
    </div>
  `;
}

function renderValidatorBanners(): TemplateResult {
  const alarms = validationAlarms.value;
  if (!alarms || alarms.length === 0) {
    return html`
      <div class="px-3 py-1.5 bg-emerald-950/40 border-b border-emerald-900/40 text-[11px] text-emerald-300 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        <span>Parameters calibrated for Anycubic Kobra 2 direct-drive hotend.</span>
      </div>
    `;
  }

  return html`
    <div class="space-y-1 p-2 bg-slate-950/80 border-b border-rose-900/50">
      ${alarms.map(alarm => {
        const isDanger = alarm.level === 'danger';
        const bg = isDanger ? 'bg-rose-950/70 border-rose-800/80 text-rose-200' : 'bg-amber-950/70 border-amber-800/80 text-amber-200';
        return html`
          <div class="p-2 rounded border text-xs leading-relaxed ${bg} flex flex-col gap-1">
            <div class="flex items-start gap-1.5 font-medium">
              <span class="shrink-0 text-base leading-none">${isDanger ? '⚠️' : '⚡'}</span>
              <span>${alarm.message}</span>
            </div>
            ${alarm.recommendation ? html`
              <span class="text-[11px] opacity-90 pl-5 text-cyan-300">Fix: ${alarm.recommendation}</span>
            ` : ''}
          </div>
        `;
      })}
    </div>
  `;
}

function renderSimpleControls(): TemplateResult {
  return html`
    <div class="space-y-4">
      <!-- Material Preset -->
      <div class="space-y-1.5">
        <label class="text-xs font-semibold text-slate-300 flex justify-between">
          <span>Filament Type</span>
          <span class="text-cyan-400 text-[11px] uppercase">${materialPreset.value} (${nozzleTemp.value}°C / ${bedTemp.value}°C)</span>
        </label>
        <div class="grid grid-cols-3 gap-2">
          ${(['pla', 'petg', 'tpu'] as const).map(mat => {
            const isSelected = materialPreset.value === mat;
            const profileMat = kobraProfile.materials[mat] || kobraProfile.materials.pla;
            return html`
              <button
                class="py-2 px-1 text-xs font-medium rounded-lg border transition-all text-center ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300 font-bold shadow-sm'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }"
                @click=${() => {
                  materialPreset.value = mat;
                  nozzleTemp.value = profileMat.nozzle_temp_c;
                  bedTemp.value = profileMat.bed_temp_c;
                  if (mat === 'tpu') {
                    retractionDistance.value = 0.8;
                    infillSpeed.value = 80;
                  } else {
                    retractionDistance.value = 1.0;
                    infillSpeed.value = 180;
                  }
                }}
              >
                ${mat.toUpperCase()}
              </button>
            `;
          })}
        </div>
      </div>

      <!-- Layer Quality Preset -->
      <div class="space-y-1.5">
        <div class="flex justify-between items-center text-xs">
          <label class="font-semibold text-slate-300">Layer Quality</label>
          <span class="text-cyan-400 font-mono">${layerHeight.value.toFixed(2)} mm</span>
        </div>
        <input
          type="range"
          min="0.12"
          max="0.28"
          step="0.04"
          value="${layerHeight.value}"
          class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          @input=${(e: Event) => {
            layerHeight.value = parseFloat((e.target as HTMLInputElement).value);
          }}
        />
        <div class="flex justify-between text-[10px] text-slate-500">
          <span>0.12 (Ultra Fine)</span>
          <span>0.20 (Standard)</span>
          <span>0.28 (Fast Draft)</span>
        </div>
      </div>

      <!-- Infill Density -->
      <div class="space-y-1.5">
        <div class="flex justify-between items-center text-xs">
          <label class="font-semibold text-slate-300">Infill Density</label>
          <span class="text-cyan-400 font-mono">${infillDensity.value}% (Grid)</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value="${infillDensity.value}"
          class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          @input=${(e: Event) => {
            infillDensity.value = parseInt((e.target as HTMLInputElement).value, 10);
          }}
        />
      </div>

      <!-- Support Structures Toggle -->
      <div class="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950/40">
        <div>
          <div class="text-xs font-semibold text-slate-200">Tree Supports</div>
          <div class="text-[10px] text-slate-500">Auto-branching for overhangs > 45°</div>
        </div>
        <input
          type="checkbox"
          checked="${enableSupports.value}"
          class="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 cursor-pointer"
          @change=${(e: Event) => {
            enableSupports.value = (e.target as HTMLInputElement).checked;
          }}
        />
      </div>
    </div>
  `;
}

function renderExpertControls(): TemplateResult {
  return html`
    <div class="space-y-4">
      <!-- Direct-Drive Extruder Calibration -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400">Direct-Drive Hotend Limits</h4>
          <span class="text-[10px] text-slate-400">Max Safe: 1.8mm / 50mm/s</span>
        </div>

        <!-- Retraction Distance -->
        <div class="space-y-1">
          <div class="flex justify-between items-center text-xs">
            <span class="text-slate-300">Retraction Distance</span>
            <span class="font-mono text-cyan-400 font-bold">${retractionDistance.value.toFixed(1)} mm</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value="${retractionDistance.value}"
            class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            @input=${(e: Event) => {
              retractionDistance.value = parseFloat((e.target as HTMLInputElement).value);
            }}
          />
        </div>

        <!-- Retraction Speed -->
        <div class="space-y-1">
          <div class="flex justify-between items-center text-xs">
            <span class="text-slate-300">Retraction Speed</span>
            <span class="font-mono text-cyan-400 font-bold">${retractionSpeed.value} mm/s</span>
          </div>
          <input
            type="range"
            min="20"
            max="80"
            step="5"
            value="${retractionSpeed.value}"
            class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            @input=${(e: Event) => {
              retractionSpeed.value = parseInt((e.target as HTMLInputElement).value, 10);
            }}
          />
        </div>
      </div>

      <!-- Speeds -->
      <div class="space-y-2 pt-2 border-t border-slate-800">
        <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400">Kobra 2 Speeds (mm/s)</h4>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label class="text-[10px] text-slate-400">Outer Wall</label>
            <input
              type="number"
              value="${outerWallSpeed.value}"
              class="w-full mt-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
              @change=${(e: Event) => {
                outerWallSpeed.value = parseInt((e.target as HTMLInputElement).value, 10) || 80;
              }}
            />
          </div>
          <div>
            <label class="text-[10px] text-slate-400">Infill Speed</label>
            <input
              type="number"
              value="${infillSpeed.value}"
              class="w-full mt-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
              @change=${(e: Event) => {
                infillSpeed.value = parseInt((e.target as HTMLInputElement).value, 10) || 180;
              }}
            />
          </div>
          <div>
            <label class="text-[10px] text-slate-400">First Layer</label>
            <input
              type="number"
              value="${firstLayerSpeed.value}"
              class="w-full mt-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
              @change=${(e: Event) => {
                firstLayerSpeed.value = parseInt((e.target as HTMLInputElement).value, 10) || 40;
              }}
            />
          </div>
          <div>
            <label class="text-[10px] text-slate-400">Travel Speed</label>
            <input
              type="number"
              value="${travelSpeed.value}"
              class="w-full mt-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
              @change=${(e: Event) => {
                travelSpeed.value = parseInt((e.target as HTMLInputElement).value, 10) || 250;
              }}
            />
          </div>
        </div>
      </div>

      <!-- Start G-Code (M420 S1 & Dual Purge Line) -->
      <div class="space-y-1.5 pt-2 border-t border-slate-800">
        <label class="text-xs font-bold uppercase tracking-wider text-cyan-400 flex justify-between">
          <span>Start G-Code</span>
          <span class="text-[10px] text-emerald-400 font-mono">M420 S1 Mesh</span>
        </label>
        <textarea
          rows="5"
          class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[10px] font-mono text-slate-300 leading-tight focus:outline-none focus:border-cyan-500 custom-scrollbar"
          @change=${(e: Event) => {
            startGcode.value = (e.target as HTMLTextAreaElement).value;
          }}
        >${startGcode.value}</textarea>
      </div>

      <!-- End G-Code -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold uppercase tracking-wider text-cyan-400">End G-Code</label>
        <textarea
          rows="4"
          class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[10px] font-mono text-slate-300 leading-tight focus:outline-none focus:border-cyan-500 custom-scrollbar"
          @change=${(e: Event) => {
            endGcode.value = (e.target as HTMLTextAreaElement).value;
          }}
        >${endGcode.value}</textarea>
      </div>
    </div>
  `;
}
