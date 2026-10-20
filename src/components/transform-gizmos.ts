import { html, type TemplateResult } from '../../packages/core/index.js';
import { type SpatialBedController } from '../../packages/spatial/index.js';

export function renderTransformGizmoBar(
  spatialBed: SpatialBedController | null,
  activeViewMode: 'bed' | 'toolpath',
  onToggleViewMode: (mode: 'bed' | 'toolpath') => void
): TemplateResult {
  const isBed = activeViewMode === 'bed';

  return html`
    <div class="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-2xl">
      <!-- Mode View Toggle (3D Platter Bed vs Sliced Toolpath) -->
      <div class="flex p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
        <button
          class="px-3 py-1 rounded font-semibold transition-all ${
            isBed
              ? 'bg-cyan-500 text-black shadow'
              : 'text-slate-400 hover:text-slate-200'
          }"
          @click=${() => onToggleViewMode('bed')}
        >
          <span>🧊 3D Bed View</span>
        </button>
        <button
          class="px-3 py-1 rounded font-semibold transition-all ${
            !isBed
              ? 'bg-cyan-500 text-black shadow'
              : 'text-slate-400 hover:text-slate-200'
          }"
          @click=${() => onToggleViewMode('toolpath')}
        >
          <span>🌈 G-Code Toolpath</span>
        </button>
      </div>

      <div class="h-4 w-px bg-slate-800"></div>

      <!-- Spatial Transform Controls (Rotate, Scale, Center, Lay-Flat) -->
      ${isBed ? html`
        <div class="flex items-center gap-1">
          <button
            title="Auto-Center on Kobra 2 Bed"
            class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors text-xs font-medium flex items-center gap-1"
            @click=${() => spatialBed?.autoCenterAndDropToBed()}
          >
            <span>🎯 Center</span>
          </button>

          <button
            title="Lay Flat on Build Plate"
            class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors text-xs font-medium flex items-center gap-1"
            @click=${() => spatialBed?.layFlat()}
          >
            <span>📐 Lay Flat</span>
          </button>

          <button
            title="Rotate 90° Z"
            class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors text-xs font-medium flex items-center gap-1"
            @click=${() => spatialBed?.rotateModel('z', 90)}
          >
            <span>🔄 Rotate 90°</span>
          </button>

          <button
            title="Scale Up 1.1x"
            class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors text-xs font-medium flex items-center gap-1"
            @click=${() => spatialBed?.scaleModel(1.1)}
          >
            <span>➕ +10%</span>
          </button>

          <button
            title="Scale Down 0.9x"
            class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors text-xs font-medium flex items-center gap-1"
            @click=${() => spatialBed?.scaleModel(0.9)}
          >
            <span>➖ -10%</span>
          </button>
        </div>
      ` : html`
        <!-- Toolpath Color Legend -->
        <div class="flex items-center gap-3 text-[11px] px-2 text-slate-300">
          <span class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Outer Wall
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Infill
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Travel
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Retraction
          </span>
        </div>
      `}
    </div>
  `;
}
