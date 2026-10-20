import { html, type TemplateResult } from '../../packages/core/index.js';
import {
  slicingStatus,
  slicingProgress,
  estimatedTimeSeconds,
  filamentMassGrams,
  generatedGcode,
  activeModelName,
  sdCardSuggestedFilename
} from '../services/slicer-state.js';
import { zuariBadge } from '../../packages/ui/index.js';

export function renderBottomBar(
  onSliceClick: () => void,
  onExportToSDCard: () => void,
  onInspectGcode: () => void
): TemplateResult {
  const status = slicingStatus.value;
  const isBusy = status === 'slicing';
  const hasGcode = generatedGcode.value.length > 0;

  // Format time
  const totalSec = estimatedTimeSeconds.value;
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const timeFormatted = totalSec > 0 ? (hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`) : '--';

  return html`
    <footer class="h-14 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between text-slate-200 select-none z-20">
      <!-- Left: Active Model, Kobra 2 SD Target Name & Slicing Status -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="text-cyan-400 text-sm">🧊</span>
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-slate-200 max-w-[180px] truncate" title="${activeModelName.value}">
              ${activeModelName.value}
            </span>
            <span class="text-[10px] text-slate-400 font-mono">
              SD: <span class="text-emerald-400">${sdCardSuggestedFilename.value}</span>
            </span>
          </div>
        </div>

        <div class="h-5 w-px bg-slate-800"></div>

        <!-- Status Badge & Progress -->
        <div class="flex items-center gap-2">
          ${renderStatusBadge(status)}
          ${isBusy ? html`
            <div class="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div class="bg-cyan-400 h-full transition-all duration-300" style="width: ${slicingProgress.value}%"></div>
            </div>
            <span class="text-[10px] text-cyan-400 font-mono">${slicingProgress.value}%</span>
          ` : ''}
        </div>
      </div>

      <!-- Center: Stats (Print Time, Filament Mass & Cost) -->
      <div class="flex items-center gap-6 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-slate-400">Est. Time:</span>
          <span class="font-bold font-mono text-cyan-400">${timeFormatted}</span>
        </div>
        <div class="h-4 w-px bg-slate-800"></div>
        <div class="flex items-center gap-2">
          <span class="text-slate-400">Filament:</span>
          <span class="font-bold font-mono text-cyan-400">${filamentMassGrams.value > 0 ? `${filamentMassGrams.value.toFixed(1)}g` : '--'}</span>
        </div>
      </div>

      <!-- Right: Actions tuned for SD Card & 3D Print Workflow -->
      <div class="flex items-center gap-2">
        <!-- Instant Slice Action -->
        <button
          class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
            isBusy
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-cyan-500/25'
          }"
          @click=${onSliceClick}
          ${isBusy ? 'disabled' : ''}
        >
          <span>${isBusy ? '⚙️' : '⚡'}</span>
          <span>${isBusy ? 'Slicing...' : 'Slice Now'}</span>
        </button>

        <!-- Primary Action: Save to SD / TF Card -->
        <button
          class="px-4 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
            hasGcode
              ? 'border-emerald-500 bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-500/20'
              : 'border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed'
          }"
          @click=${onExportToSDCard}
          ${!hasGcode ? 'disabled' : ''}
          title="Save sanitized G-Code to SD / TF card for direct Anycubic Kobra 2 insertion"
        >
          <span>💾</span>
          <span>Save to SD Card</span>
        </button>

        <!-- Inspect G-Code Raw Modal / Preview -->
        <button
          class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white transition-all flex items-center gap-1"
          @click=${onInspectGcode}
          ${!hasGcode ? 'disabled' : ''}
        >
          <span>📄</span>
          <span>View G-Code</span>
        </button>
      </div>
    </footer>
  `;
}

function renderStatusBadge(status: 'idle' | 'slicing' | 'sliced' | 'error'): TemplateResult {
  switch (status) {
    case 'idle':
      return zuariBadge({ label: 'READY', variant: 'info' });
    case 'slicing':
      return zuariBadge({ label: 'SLICING...', variant: 'warning' });
    case 'sliced':
      return zuariBadge({ label: 'SLICED (KOBRA 2)', variant: 'success' });
    case 'error':
      return zuariBadge({ label: 'SAFETY VIOLATION', variant: 'danger' });
  }
}
