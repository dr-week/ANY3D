import { html, type TemplateResult } from '../../packages/core/index.js';
import {
  selectedPrinter,
  filamentPresetName,
  printProfileName,
  activeProcessTab,
  processScope,
  advancedMode,
  layerHeight,
  firstLayerHeight,
  wallLoops,
  topShellLayers,
  bottomShellLayers,
  sparseInfillDensity,
  sparseInfillPattern,
  initialLayerSpeed,
  initialLayerInfillSpeed,
  outerWallSpeed,
  innerWallSpeed,
  smallPerimetersSpeed,
  sparseInfillSpeed,
  internalSolidInfillSpeed,
  topSurfaceSpeed,
  travelSpeed,
  slowDownOverhangs,
  enableSupport,
  supportType,
  supportThresholdAngle,
  retractionDistance,
  retractionSpeed,
  isRetractionSafe
} from '../services/slicer-state.js';
import { ICONS } from './icons.js';

export function renderBambuLeftPanel(): TemplateResult {
  return html`
    <div class="h-full flex flex-col bg-[#1e2024] text-[#cfd3dc] select-none text-xs border-r border-[#2d3139]">
      
      <!-- 1. Printer Section -->
      <div class="p-2 border-b border-[#2d3139]">
        <div class="flex items-center justify-between text-[11px] text-[#9096a2] mb-1 font-medium">
          <div class="flex items-center gap-1.5">
            ${html([ICONS.printer] as any)}
            <span>Printer</span>
          </div>
          <button class="hover:text-white p-0.5 rounded hover:bg-[#282c34]" title="Machine Settings">
            ${html([ICONS.settings] as any)}
          </button>
        </div>

        <div class="flex items-center gap-2 bg-[#282c34] px-2 py-1.5 rounded border border-[#353b47]">
          <div class="w-6 h-6 rounded bg-[#1e2024] flex items-center justify-center font-bold text-[10px] text-[#00ae42]">
            K2
          </div>
          <div class="flex-1 flex items-center justify-between">
            <span class="font-medium text-white">${selectedPrinter.value}</span>
            <span class="text-[#00ae42] text-[10px] font-mono" title="MicroSD FAT32 Mode">SD</span>
          </div>
        </div>
      </div>

      <!-- 2. Filament Section -->
      <div class="p-2 border-b border-[#2d3139]">
        <div class="flex items-center justify-between text-[11px] text-[#9096a2] mb-1 font-medium">
          <div class="flex items-center gap-1.5">
            ${html([ICONS.spool] as any)}
            <span>Filament</span>
          </div>
          <button class="hover:text-white p-0.5 rounded hover:bg-[#282c34]" title="Filament Presets">
            ${html([ICONS.settings] as any)}
          </button>
        </div>

        <div class="flex items-center gap-2 bg-[#282c34] px-2 py-1.5 rounded border border-[#353b47]">
          <div class="w-5 h-5 rounded bg-black flex items-center justify-center font-bold text-[10px] text-white">
            1
          </div>
          <div class="flex-1 flex items-center gap-1.5 overflow-hidden">
            <span class="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0"></span>
            <span class="truncate text-[11px] text-[#e4e7ec]">${filamentPresetName.value}</span>
          </div>
        </div>
      </div>

      <!-- 3. Process Section -->
      <div class="p-2 pb-0 border-b border-[#2d3139] space-y-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <div class="flex items-center gap-1.5">
            ${html([ICONS.slider] as any)}
            <span class="font-medium text-[#9096a2]">Process</span>
            <div class="flex bg-[#282c34] rounded p-0.5 border border-[#353b47]">
              <button
                class="px-2 py-0.5 text-[10px] rounded ${processScope.value === 'global' ? 'bg-[#00ae42] text-white font-semibold' : 'text-[#9096a2]'}"
                @click=${() => { processScope.value = 'global'; }}
              >
                Global
              </button>
              <button
                class="px-2 py-0.5 text-[10px] rounded ${processScope.value === 'objects' ? 'bg-[#00ae42] text-white font-semibold' : 'text-[#9096a2]'}"
                @click=${() => { processScope.value = 'objects'; }}
              >
                Objects
              </button>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-[#9096a2]">Adv</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked="${advancedMode.value}"
                class="sr-only peer"
                @change=${(e: Event) => {
                  advancedMode.value = (e.target as HTMLInputElement).checked;
                }}
              />
              <div class="w-6 h-3.5 bg-[#353b47] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00ae42]"></div>
            </label>
          </div>
        </div>

        <!-- Print Profile Preset Row -->
        <div class="flex items-center justify-between bg-[#282c34] px-2 py-1.5 rounded border border-[#353b47] text-xs">
          <span class="truncate text-[11px] text-[#e4e7ec] font-mono">${printProfileName.value}</span>
          <span class="text-[#9096a2] text-xs">⌄</span>
        </div>

        <!-- Tabs: Quality | Strength | Speed | Support | Others -->
        <div class="flex border-b border-[#2d3139] pt-1 text-xs">
          ${(['quality', 'strength', 'speed', 'support', 'others'] as const).map(tab => {
            const isActive = activeProcessTab.value === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            return html`
              <button
                class="flex-1 pb-1.5 text-center transition-colors capitalize ${
                  isActive
                    ? 'text-[#00ae42] font-semibold border-b-2 border-[#00ae42]'
                    : 'text-[#9096a2] hover:text-[#cfd3dc]'
                }"
                @click=${() => { activeProcessTab.value = tab; }}
              >
                ${label}
              </button>
            `;
          })}
        </div>
      </div>

      <!-- 4. Tab Parameters Body (Numbers & Clean Inputs) -->
      <div class="flex-1 overflow-y-auto p-2.5 space-y-3.5 custom-scrollbar text-xs">
        ${renderActiveTabBody()}
      </div>
    </div>
  `;
}

function renderActiveTabBody(): TemplateResult {
  const currentTab = activeProcessTab.value;
  switch (currentTab) {
    case 'speed':
      return renderSpeedTab();
    case 'strength':
      return renderStrengthTab();
    case 'quality':
      return renderQualityTab();
    case 'support':
      return renderSupportTab();
    case 'others':
      return renderOthersTab();
  }
}

function renderSpeedTab(): TemplateResult {
  return html`
    <div class="space-y-3">
      <!-- Initial Layer -->
      <div class="space-y-1.5">
        <div class="flex items-center gap-1 text-[#00ae42] font-semibold text-xs">
          ${html([ICONS.gauge] as any)}
          <span>Initial Layer</span>
        </div>
        <div class="space-y-1 pl-1">
          ${renderParamRow('Initial layer', initialLayerSpeed.value, 'mm/s', (v) => { initialLayerSpeed.value = v; })}
          ${renderParamRow('Initial infill', initialLayerInfillSpeed.value, 'mm/s', (v) => { initialLayerInfillSpeed.value = v; })}
        </div>
      </div>

      <!-- Other Layers -->
      <div class="space-y-1.5 pt-1.5 border-t border-[#2d3139]">
        <div class="flex items-center gap-1 text-[#00ae42] font-semibold text-xs">
          ${html([ICONS.gauge] as any)}
          <span>Other Layers</span>
        </div>
        <div class="space-y-1 pl-1">
          ${renderParamRow('Outer wall', outerWallSpeed.value, 'mm/s', (v) => { outerWallSpeed.value = v; })}
          ${renderParamRow('Inner wall', innerWallSpeed.value, 'mm/s', (v) => { innerWallSpeed.value = v; })}
          ${renderParamRow('Small perimeters', smallPerimetersSpeed.value, '%', (v) => { smallPerimetersSpeed.value = v; })}
          ${renderParamRow('Sparse infill', sparseInfillSpeed.value, 'mm/s', (v) => { sparseInfillSpeed.value = v; })}
          ${renderParamRow('Internal solid infill', internalSolidInfillSpeed.value, 'mm/s', (v) => { internalSolidInfillSpeed.value = v; })}
          ${renderParamRow('Top surface', topSurfaceSpeed.value, 'mm/s', (v) => { topSurfaceSpeed.value = v; })}
          ${renderParamRow('Travel speed', travelSpeed.value, 'mm/s', (v) => { travelSpeed.value = v; })}
        </div>

        <div class="flex items-center justify-between pt-1 pl-1 text-xs">
          <span class="text-[#9096a2]">Slow down for overhangs</span>
          <input
            type="checkbox"
            checked="${slowDownOverhangs.value}"
            class="w-3.5 h-3.5 rounded text-[#00ae42] bg-[#282c34] border-[#353b47] cursor-pointer"
            @change=${(e: Event) => {
              slowDownOverhangs.value = (e.target as HTMLInputElement).checked;
            }}
          />
        </div>
      </div>
    </div>
  `;
}

function renderStrengthTab(): TemplateResult {
  return html`
    <div class="space-y-3">
      <div class="space-y-1.5">
        <div class="flex items-center gap-1 text-[#00ae42] font-semibold text-xs">
          ${html([ICONS.shield] as any)}
          <span>Walls</span>
        </div>
        <div class="space-y-1 pl-1">
          ${renderParamRow('Wall loops', wallLoops.value, 'loops', (v) => { wallLoops.value = v; })}
          ${renderParamRow('Top shell layers', topShellLayers.value, 'layers', (v) => { topShellLayers.value = v; })}
          ${renderParamRow('Bottom shell layers', bottomShellLayers.value, 'layers', (v) => { bottomShellLayers.value = v; })}
        </div>
      </div>

      <div class="space-y-1.5 pt-1.5 border-t border-[#2d3139]">
        <div class="flex items-center gap-1 text-[#00ae42] font-semibold text-xs">
          ${html([ICONS.shield] as any)}
          <span>Infill</span>
        </div>
        <div class="space-y-1 pl-1">
          ${renderParamRow('Density', sparseInfillDensity.value, '%', (v) => { sparseInfillDensity.value = v; })}
          <div class="flex items-center justify-between text-xs">
            <span class="text-[#9096a2]">Pattern</span>
            <select
              class="w-20 bg-[#282c34] border border-[#353b47] rounded px-1 py-0.5 text-xs text-right text-[#e4e7ec]"
              @change=${(e: Event) => {
                sparseInfillPattern.value = (e.target as HTMLSelectElement).value;
              }}
            >
              <option value="grid" selected="${sparseInfillPattern.value === 'grid'}">Grid</option>
              <option value="gyroid" selected="${sparseInfillPattern.value === 'gyroid'}">Gyroid</option>
              <option value="honeycomb" selected="${sparseInfillPattern.value === 'honeycomb'}">Honeycomb</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderQualityTab(): TemplateResult {
  return html`
    <div class="space-y-3">
      <div class="space-y-1.5">
        <div class="flex items-center gap-1 text-[#00ae42] font-semibold text-xs">
          ${html([ICONS.layers] as any)}
          <span>Layer Height</span>
        </div>
        <div class="space-y-1 pl-1">
          ${renderParamRow('Layer height', layerHeight.value, 'mm', (v) => { layerHeight.value = v; })}
          ${renderParamRow('First layer', firstLayerHeight.value, 'mm', (v) => { firstLayerHeight.value = v; })}
        </div>
      </div>
    </div>
  `;
}

function renderSupportTab(): TemplateResult {
  return html`
    <div class="space-y-3">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-[#00ae42] font-semibold">Enable support</span>
          <input
            type="checkbox"
            checked="${enableSupport.value}"
            class="w-3.5 h-3.5 rounded text-[#00ae42] bg-[#282c34] border-[#353b47] cursor-pointer"
            @change=${(e: Event) => {
              enableSupport.value = (e.target as HTMLInputElement).checked;
            }}
          />
        </div>
        ${enableSupport.value ? html`
          <div class="space-y-1 pl-1 pt-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-[#9096a2]">Type</span>
              <select
                class="w-20 bg-[#282c34] border border-[#353b47] rounded px-1 py-0.5 text-xs text-right text-[#e4e7ec]"
                @change=${(e: Event) => {
                  supportType.value = (e.target as HTMLSelectElement).value as any;
                }}
              >
                <option value="tree" selected="${supportType.value === 'tree'}">Tree</option>
                <option value="normal" selected="${supportType.value === 'normal'}">Normal</option>
              </select>
            </div>
            ${renderParamRow('Threshold', supportThresholdAngle.value, '°', (v) => { supportThresholdAngle.value = v; })}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderOthersTab(): TemplateResult {
  return html`
    <div class="space-y-3">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-[#00ae42] font-semibold">Retraction</span>
          <span class="text-[10px] text-[#00ae42] font-mono">1.0mm/40mms</span>
        </div>
        <div class="space-y-1 pl-1">
          ${renderParamRow('Length', retractionDistance.value, 'mm', (v) => { retractionDistance.value = v; })}
          ${renderParamRow('Speed', retractionSpeed.value, 'mm/s', (v) => { retractionSpeed.value = v; })}
        </div>
      </div>
    </div>
  `;
}

function renderParamRow(label: string, value: number, unit: string, onChange: (val: number) => void): TemplateResult {
  return html`
    <div class="flex items-center justify-between text-xs">
      <span class="text-[#9096a2] text-[11px]">${label}</span>
      <div class="flex items-center gap-1">
        <input
          type="number"
          step="any"
          value="${value}"
          class="w-14 bg-[#282c34] border border-[#353b47] rounded px-1.5 py-0.5 text-[11px] text-right text-[#e4e7ec] font-mono focus:outline-none focus:border-[#00ae42]"
          @change=${(e: Event) => {
            const num = parseFloat((e.target as HTMLInputElement).value);
            if (!isNaN(num)) onChange(num);
          }}
        />
        <span class="text-[10px] text-[#6c7280] w-10 text-left font-mono">${unit}</span>
      </div>
    </div>
  `;
}
