import { html, type TemplateResult } from '../../packages/core/index.js';
import { activeTopTab, activeModelName } from '../services/slicer-state.js';
import { cartCount } from '../services/cart-service.js';
import { ICONS } from './icons.js';

export function renderBambuTopHeader(
  onSlicePlate: () => void,
  onSaveToSDCard: () => void,
  isSlicing: boolean
): TemplateResult {
  const currentTab = activeTopTab.value;

  return html`
    <header class="h-9 bg-[#1e2024] border-b border-[#2d3139] px-2.5 flex items-center justify-between text-xs select-none">
      <!-- Left: Brand Icon, Menu, Workflow Tabs -->
      <div class="flex items-center gap-3">
        <!-- Brand Glyph -->
        <div class="flex items-center gap-1.5 font-bold text-white tracking-wide pr-1">
          <span class="w-5 h-5 rounded bg-[#00ae42] flex items-center justify-center font-black text-black text-[11px] shadow-sm">
            A3
          </span>
          <span class="text-xs font-semibold text-white">ANY3D</span>
        </div>

        <div class="h-3.5 w-px bg-[#2d3139]"></div>

        <!-- Workflow Tabs (Prepare / Preview / Device / Project) -->
        <div class="flex items-center gap-0.5">
          <button
            class="px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-all ${
              currentTab === 'prepare'
                ? 'bg-[#282c34] text-white font-medium shadow-sm'
                : 'text-[#9096a2] hover:text-[#cfd3dc]'
            }"
            @click=${() => { activeTopTab.value = 'prepare'; }}
          >
            ${html([ICONS.cube] as any)}
            <span>Prepare</span>
          </button>

          <button
            class="px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-all ${
              currentTab === 'preview'
                ? 'bg-[#00ae42] text-white font-semibold shadow'
                : 'text-[#9096a2] hover:text-[#cfd3dc]'
            }"
            @click=${() => { activeTopTab.value = 'preview'; }}
          >
            ${html([ICONS.layers] as any)}
            <span>Preview</span>
          </button>

          <button
            class="px-2.5 py-1 rounded text-xs flex items-center gap-1 text-[#9096a2] hover:text-[#cfd3dc] transition-all ${
              currentTab === 'device' ? 'bg-[#282c34] text-white' : ''
            }"
            @click=${() => { activeTopTab.value = 'device'; }}
          >
            ${html([ICONS.printer] as any)}
            <span>Device</span>
          </button>
        </div>
      </div>

      <!-- Center: Active Model Name -->
      <div class="text-[11px] font-mono text-[#9096a2] truncate max-w-xs px-2 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00ae42]"></span>
        <span class="text-[#cfd3dc] truncate">${activeModelName.value}</span>
      </div>

      <!-- Right: Cart Pill, Settings, Slice & SD Export Actions -->
      <div class="flex items-center gap-2">
        <!-- Free Cart Button with Live Count Pill -->
        <button
          class="px-2 py-0.5 rounded bg-[#282c34] hover:bg-[#353b47] border border-[#353b47] hover:border-[#00ae42] text-white flex items-center gap-1.5 transition-all text-xs"
          id="btn-header-cart"
          title="Free 3D Print Cart"
        >
          ${html([ICONS.cart] as any)}
          <span class="text-[10px] font-bold px-1 rounded-full bg-[#00ae42] text-black">
            ${cartCount.value}
          </span>
        </button>

        <!-- Separate Profile & Settings Icons -->
        <button class="p-1 rounded hover:bg-[#282c34] text-[#9096a2] hover:text-white" title="Account / Community Profile">
          ${html([ICONS.user] as any)}
        </button>
        <button class="p-1 rounded hover:bg-[#282c34] text-[#9096a2] hover:text-white" title="Application Preferences">
          ${html([ICONS.settings] as any)}
        </button>

        <div class="h-3.5 w-px bg-[#2d3139]"></div>

        <!-- Slice Plate Button (Bambu Green Pill) -->
        <button
          class="px-3 py-1 rounded-md bg-[#00ae42] hover:bg-[#009b3b] text-white font-semibold text-xs flex items-center gap-1 shadow transition-all active:scale-95 disabled:opacity-50"
          @click=${onSlicePlate}
          ${isSlicing ? 'disabled' : ''}
        >
          <span class="text-xs">${isSlicing ? '⚙' : '✓'}</span>
          <span>${isSlicing ? 'Slicing...' : 'Slice'}</span>
        </button>

        <!-- Save to SD Card Button -->
        <button
          class="px-3 py-1 rounded-md bg-[#282c34] hover:bg-[#353b47] border border-[#353b47] text-white font-medium text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
          @click=${onSaveToSDCard}
          title="Save to MicroSD Card"
        >
          ${html([ICONS.sd] as any)}
          <span>Export SD</span>
        </button>
      </div>
    </header>
  `;
}
