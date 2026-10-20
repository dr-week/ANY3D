import { html, type TemplateResult } from '../../packages/core/index.js';
import { cartItems, isCartOpen, removeFromCart, clearCart, type CartItem } from '../services/cart-service.js';
import type { Online3DModel } from '../services/online-discovery.js';
import { ICONS } from './icons.js';

export function renderCartModal(onLoadToPlatter: (model: Online3DModel) => void): TemplateResult {
  const items = cartItems.value;
  const totalFilamentGrams = items.reduce((sum, item) => sum + (item.model.filamentGrams || 0), 0);

  return html`
    <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e2024] border border-[#2d3139] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-[#cfd3dc] text-xs">
        
        <!-- Cart Header -->
        <div class="p-3 border-b border-[#2d3139] flex items-center justify-between bg-[#18191c]">
          <div class="flex items-center gap-2">
            ${html([ICONS.cart] as any)}
            <span class="font-bold text-sm text-white">3D Print Cart</span>
            <span class="px-2 py-0.5 rounded-full bg-[#00ae42]/15 border border-[#00ae42]/40 text-[#00ae42] text-[10px] font-bold">
              ${items.length} FREE DESIGNS
            </span>
          </div>
          <button
            class="p-1 rounded hover:bg-[#282c34] text-[#9096a2] hover:text-white"
            @click=${() => { isCartOpen.value = false; }}
            title="Close"
          >
            ${html([ICONS.cross] as any)}
          </button>
        </div>

        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[#121316]">
          ${items.length === 0 ? html`
            <div class="p-10 text-center text-[#9096a2] flex flex-col items-center justify-center gap-2">
              <div class="p-3 rounded-full bg-[#1e2024] border border-[#2d3139] text-[#00ae42]">
                ${html([ICONS.cart] as any)}
              </div>
              <span class="text-xs text-white font-semibold">Your 3D Print Cart is Empty</span>
              <p class="text-[11px] max-w-xs text-[#6c7280]">
                Explore community designs from MakerWorld, Printables, and Thingiverse to queue models onto your Kobra 2 platter.
              </p>
            </div>
          ` : items.map((item: CartItem) => html`
            <div class="flex items-center gap-3 p-2 rounded-lg border border-[#2d3139] bg-[#1e2024] hover:border-[#353b47] transition-all">
              <img
                src="${item.model.thumbnail}"
                alt="${item.model.title}"
                class="w-12 h-12 rounded object-cover border border-[#2d3139] shrink-0"
              />

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#282c34] text-[#00ae42] border border-[#353b47]">
                    ${item.model.category}
                  </span>
                  <span class="text-[10px] text-[#6c7280] font-mono">${item.model.source.toUpperCase()}</span>
                </div>
                <h4 class="text-xs font-semibold text-white truncate mt-0.5">${item.model.title}</h4>
                <div class="flex items-center gap-3 text-[10px] text-[#9096a2] mt-0.5 font-mono">
                  <span>${item.model.estimatedPrintTime}</span>
                  <span>${item.model.filamentGrams}g</span>
                  <span class="text-[#00ae42] font-bold">FREE</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  class="px-2.5 py-1 rounded bg-[#00ae42] hover:bg-[#009b3b] text-white font-semibold text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1"
                  @click=${() => {
                    onLoadToPlatter(item.model);
                    isCartOpen.value = false;
                  }}
                  title="Send to build plate"
                >
                  ${html([ICONS.check] as any)}
                  <span>Platter</span>
                </button>
                <button
                  class="p-1 rounded hover:bg-[#282c34] text-[#9096a2] hover:text-[#ff4d4f] transition-colors"
                  @click=${() => removeFromCart(item.model.id)}
                  title="Remove from cart"
                >
                  ${html([ICONS.trash] as any)}
                </button>
              </div>
            </div>
          `)}
        </div>

        <!-- Footer -->
        ${items.length > 0 ? html`
          <div class="p-3 border-t border-[#2d3139] flex items-center justify-between bg-[#18191c]">
            <div class="flex items-center gap-4 text-xs font-mono">
              <span class="text-[#9096a2]">Weight: <strong class="text-white">${totalFilamentGrams.toFixed(1)}g</strong></span>
              <span class="text-[#9096a2]">Cost: <strong class="text-[#00ae42]">FREE ($0.00)</strong></span>
            </div>

            <div class="flex items-center gap-2">
              <button
                class="px-2.5 py-1 rounded text-[#9096a2] hover:text-white hover:bg-[#282c34] transition-colors text-xs"
                @click=${() => clearCart()}
              >
                Clear
              </button>
              <button
                class="px-3.5 py-1 rounded bg-[#00ae42] hover:bg-[#009b3b] text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1"
                @click=${() => {
                  if (items[0]) {
                    onLoadToPlatter(items[0].model);
                    isCartOpen.value = false;
                  }
                }}
              >
                ${html([ICONS.bolt] as any)}
                <span>Send to Slicer</span>
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
