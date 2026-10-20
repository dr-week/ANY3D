import { html, type TemplateResult } from '../../packages/core/index.js';
import {
  activeSidebarTab,
  activeModelName,
  sdCardSuggestedFilename,
  onlineSearchQuery,
  onlinePlatformFilter
} from '../services/slicer-state.js';
import { VERIFIED_ONLINE_MODELS, type Online3DModel } from '../services/online-discovery.js';
import { addToCart, isInCart, isCartOpen, cartCount } from '../services/cart-service.js';
import { ICONS } from './icons.js';

export function renderSidebar(
  onLoadModelToBed: (model: Online3DModel | File | string) => void
): TemplateResult {
  const currentTab = activeSidebarTab.value;

  return html`
    <div class="h-full flex flex-col bg-[#1e2024] border-r border-[#2d3139] text-[#cfd3dc] select-none text-xs">
      <!-- 3-Way Tabs: Online Models | Local Files | SD Card Guide -->
      <div class="flex border-b border-[#2d3139] bg-[#18191c] p-1 gap-1">
        <button
          class="flex-1 py-1.5 px-1 text-xs rounded font-medium transition-colors flex items-center justify-center gap-1.5 ${
            currentTab === 'marketplace'
              ? 'bg-[#282c34] text-[#00ae42] border border-[#353b47] font-semibold'
              : 'text-[#9096a2] hover:text-white'
          }"
          @click=${() => { activeSidebarTab.value = 'marketplace'; }}
        >
          ${html([ICONS.globe] as any)}
          <span>Online</span>
        </button>

        <button
          class="flex-1 py-1.5 px-1 text-xs rounded font-medium transition-colors flex items-center justify-center gap-1.5 ${
            currentTab === 'explorer'
              ? 'bg-[#282c34] text-[#00ae42] border border-[#353b47] font-semibold'
              : 'text-[#9096a2] hover:text-white'
          }"
          @click=${() => { activeSidebarTab.value = 'explorer'; }}
        >
          ${html([ICONS.folder] as any)}
          <span>Local STL</span>
        </button>

        <button
          class="flex-1 py-1.5 px-1 text-xs rounded font-medium transition-colors flex items-center justify-center gap-1.5 ${
            currentTab === 'sdguide'
              ? 'bg-[#282c34] text-[#00ae42] border border-[#353b47] font-semibold'
              : 'text-[#9096a2] hover:text-white'
          }"
          @click=${() => { activeSidebarTab.value = 'sdguide'; }}
        >
          ${html([ICONS.sd] as any)}
          <span>SD Card</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
        ${currentTab === 'marketplace' ? renderMarketplaceTab(onLoadModelToBed) : ''}
        ${currentTab === 'explorer' ? renderLocalExplorerTab(onLoadModelToBed) : ''}
        ${currentTab === 'sdguide' ? renderSDCardGuideTab() : ''}
      </div>
    </div>
  `;
}

function renderMarketplaceTab(onLoadModelToBed: (model: Online3DModel) => void): TemplateResult {
  const query = onlineSearchQuery.value.toLowerCase().trim();
  const filter = onlinePlatformFilter.value;

  let models = VERIFIED_ONLINE_MODELS;
  if (filter !== 'all') {
    models = models.filter(m => m.source === filter);
  }
  if (query) {
    models = models.filter(m =>
      m.title.toLowerCase().includes(query) ||
      m.author.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query) ||
      m.tags.some(t => t.toLowerCase().includes(query))
    );
  }

  return html`
    <div class="space-y-2.5">
      <!-- Search Input -->
      <div class="relative">
        <input
          type="text"
          placeholder="Search 3D models..."
          value="${onlineSearchQuery.value}"
          class="w-full bg-[#18191c] border border-[#2d3139] rounded px-2.5 py-1 text-xs text-[#cfd3dc] placeholder-[#6c7280] focus:outline-none focus:border-[#00ae42] pl-7 font-mono"
          @input=${(e: Event) => {
            onlineSearchQuery.value = (e.target as HTMLInputElement).value;
          }}
        />
        <span class="absolute left-2 top-2 text-[#6c7280]">
          ${html([ICONS.search] as any)}
        </span>
      </div>

      <!-- Free Cart Trigger Bar -->
      <div
        class="px-2.5 py-1.5 rounded-lg bg-[#282c34] border border-[#353b47] flex items-center justify-between cursor-pointer hover:border-[#00ae42] transition-colors"
        @click=${() => { isCartOpen.value = true; }}
      >
        <div class="flex items-center gap-1.5">
          ${html([ICONS.cart] as any)}
          <span class="font-semibold text-white text-[11px]">Free 3D Print Cart</span>
          <span class="text-[10px] text-[#00ae42] font-mono">($0.00)</span>
        </div>
        <span class="px-1.5 py-0.2 rounded-full bg-[#00ae42] text-black font-bold text-[10px] font-mono">
          ${cartCount.value}
        </span>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-3 gap-1 text-[10px] font-mono">
        ${([
          { id: 'all', label: 'All' },
          { id: 'makerworld', label: 'MakerWorld' },
          { id: 'printables', label: 'Printables' },
          { id: 'thingiverse', label: 'Thingiverse' },
          { id: 'cults3d', label: 'Cults3D' },
          { id: 'myminifactory', label: 'MMF' }
        ] as const).map(p => html`
          <button
            class="py-0.5 px-1 rounded border transition-all text-center truncate ${
              filter === p.id
                ? 'bg-[#00ae42]/20 text-[#00ae42] border-[#00ae42]/50 font-bold'
                : 'bg-[#18191c] text-[#9096a2] border-[#2d3139] hover:text-white'
            }"
            @click=${() => { onlinePlatformFilter.value = p.id; }}
          >
            ${p.label}
          </button>
        `)}
      </div>

      <!-- Model Cards List -->
      <div class="space-y-2">
        ${models.map(model => {
          const inCart = isInCart(model.id);

          return html`
            <div class="group p-2 rounded-lg border border-[#2d3139] bg-[#18191c] hover:border-[#353b47] transition-all flex flex-col gap-1.5 shadow-sm">
              <!-- Thumbnail & Price tag -->
              <div class="relative aspect-video rounded overflow-hidden bg-black border border-[#2d3139]">
                <img
                  src="${model.thumbnail}"
                  alt="${model.title}"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div class="absolute top-1 left-1 flex gap-1">
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-black/80 backdrop-blur text-[#00ae42] border border-[#00ae42]/30">
                    ${model.source}
                  </span>
                </div>
                <!-- 100% Free Badge -->
                <div class="absolute top-1 right-1 bg-[#00ae42] text-black font-black text-[9px] px-1.5 py-0.2 rounded">
                  FREE
                </div>
                <div class="absolute bottom-1 right-1 bg-black/75 backdrop-blur px-1 py-0.2 rounded text-[9px] text-[#9096a2] font-mono">
                  ${model.estimatedPrintTime} | ${model.filamentGrams}g
                </div>
              </div>

              <div>
                <h4 class="text-xs font-semibold text-white line-clamp-1 group-hover:text-[#00ae42] transition-colors">
                  ${model.title}
                </h4>
                <div class="flex items-center justify-between text-[10px] text-[#9096a2] mt-0.5">
                  <span class="font-mono">${model.category} • ${model.author}</span>
                  <a
                    href="${model.sourceUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[#00ae42] hover:underline flex items-center gap-0.5"
                    title="View Original Repository"
                  >
                    <span>Source</span>
                    ${html([ICONS.externalLink] as any)}
                  </a>
                </div>
              </div>

              <!-- Cart & Platter Buttons -->
              <div class="flex items-center justify-between pt-1 border-t border-[#2d3139] gap-1.5">
                <button
                  class="flex-1 py-1 px-2 text-[10px] font-semibold rounded border transition-all flex items-center justify-center gap-1 ${
                    inCart
                      ? 'border-[#00ae42] bg-[#00ae42]/15 text-[#00ae42]'
                      : 'border-[#353b47] bg-[#282c34] text-[#cfd3dc] hover:text-white hover:border-[#00ae42]'
                  }"
                  @click=${() => addToCart(model)}
                >
                  ${html([ICONS.cart] as any)}
                  <span>${inCart ? 'Queued' : 'Add to Cart'}</span>
                </button>

                <button
                  class="py-1 px-2.5 text-[10px] font-bold rounded bg-[#00ae42] text-black hover:bg-[#009b3b] transition-all shadow-sm active:scale-95 flex items-center gap-1 shrink-0"
                  @click=${() => onLoadModelToBed(model)}
                  title="Direct Load to Kobra 2 Plate"
                >
                  ${html([ICONS.check] as any)}
                  <span>Platter</span>
                </button>
              </div>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}

function renderLocalExplorerTab(onLoadFileToBed: (file: File | string) => void): TemplateResult {
  return html`
    <div class="space-y-3">
      <div
        class="border border-dashed border-[#353b47] hover:border-[#00ae42] rounded-lg p-4 text-center bg-[#18191c] hover:bg-[#282c34]/40 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 group"
        @click=${() => {
          const input = document.getElementById('local-stl-file-input') as HTMLInputElement;
          input?.click();
        }}
      >
        <div class="p-2 rounded-full bg-[#282c34] text-[#00ae42] group-hover:scale-110 transition-transform">
          ${html([ICONS.download] as any)}
        </div>
        <div>
          <div class="text-xs font-semibold text-white">Import STL / 3MF</div>
          <div class="text-[10px] text-[#6c7280]">Select local file from laptop</div>
        </div>
        <input
          id="local-stl-file-input"
          type="file"
          accept=".stl,.3mf"
          class="hidden"
          @change=${(e: Event) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files[0]) {
              onLoadFileToBed(files[0]);
            }
          }}
        />
      </div>

      <div class="space-y-1.5">
        <div class="text-[11px] font-semibold text-white">Calibration Models:</div>
        <div class="space-y-1">
          ${[
            { id: 'benchy', name: '3D Benchy Hull Torture Test', desc: 'Overhangs & cooling' },
            { id: 'cube', name: '20mm XYZ Calibration Cube', desc: 'Flow & steps test' },
            { id: 'tower', name: 'Retraction Calibration Tower', desc: 'Direct-drive stringing' }
          ].map(cal => html`
            <div
              class="p-2 rounded border border-[#2d3139] bg-[#18191c] hover:border-[#00ae42] transition-all flex items-center justify-between text-xs cursor-pointer group"
              @click=${() => onLoadFileToBed(cal.id)}
            >
              <div>
                <div class="font-medium text-white group-hover:text-[#00ae42] flex items-center gap-1.5">
                  ${html([ICONS.cube] as any)}
                  <span>${cal.name}</span>
                </div>
                <div class="text-[10px] text-[#6c7280] pl-5">${cal.desc}</div>
              </div>
              <span class="text-[#00ae42] text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Load →</span>
            </div>
          `)}
        </div>
      </div>
    </div>
  `;
}

function renderSDCardGuideTab(): TemplateResult {
  return html`
    <div class="space-y-2.5 text-xs text-[#9096a2]">
      <div class="p-2.5 rounded-lg border border-[#2d3139] bg-[#18191c] space-y-1">
        <div class="flex items-center gap-1.5 font-bold text-white text-xs">
          ${html([ICONS.sd] as any)}
          <span>Kobra 2 MicroSD Guidelines</span>
        </div>
        <p class="text-[11px] text-[#9096a2]">
          Kobra 2 operates strictly offline (FAT32, 8GB–32GB, short alphanumeric names in card root).
        </p>
      </div>

      <div class="space-y-1 text-[11px]">
        <div class="p-2 rounded border border-[#2d3139] bg-[#18191c]">
          <strong class="text-white">Format:</strong> FAT32 with 4096 or 32KB allocation.
        </div>
        <div class="p-2 rounded border border-[#2d3139] bg-[#18191c]">
          <strong class="text-white">Capacity:</strong> 8GB to 32GB MicroSD/TF.
        </div>
        <div class="p-2 rounded border border-[#2d3139] bg-[#18191c]">
          <strong class="text-white">File:</strong> <span class="text-[#00ae42] font-mono">${sdCardSuggestedFilename.value}</span>
        </div>
      </div>
    </div>
  `;
}
