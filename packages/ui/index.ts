import { html, type TemplateResult } from '../core/index.js';
import { type Signal, type ReadonlySignal } from '../signals/index.js';

export interface ZuariBadgeProps {
  label: string | Signal<string> | ReadonlySignal<string>;
  variant?: 'info' | 'success' | 'warning' | 'danger';
}

export function zuariBadge(props: ZuariBadgeProps): TemplateResult {
  const variant = props.variant || 'info';
  const colorMap = {
    info: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/80',
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
    warning: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
    danger: 'bg-rose-950/80 text-rose-400 border-rose-800/80'
  };

  return html`
    <span class="inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md border ${colorMap[variant]}">
      ${props.label}
    </span>
  `;
}

export interface ZuariCardProps {
  title: string;
  badge?: TemplateResult;
  content: TemplateResult;
}

export function zuariCard(props: ZuariCardProps): TemplateResult {
  return html`
    <div class="zuari-card p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl transition-all duration-200 hover:border-slate-700">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold tracking-wide text-slate-200">${props.title}</h3>
        ${props.badge || ''}
      </div>
      <div class="card-body">
        ${props.content}
      </div>
    </div>
  `;
}

export interface ZuariTabsProps {
  tabs: Array<{ id: string; label: string; icon?: string }>;
  activeTab: Signal<string>;
}

export function zuariTabs(props: ZuariTabsProps): TemplateResult {
  return html`
    <div class="flex border-b border-slate-800 bg-slate-950/80 p-1 gap-1">
      ${props.tabs.map(tab => {
        const isActive = props.activeTab.value === tab.id;
        const activeClass = isActive
          ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400 font-medium'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40';
        return html`
          <button
            class="flex-1 py-2 px-3 text-xs tracking-wide rounded-t transition-colors flex items-center justify-center gap-1.5 ${activeClass}"
            @click=${() => { props.activeTab.value = tab.id; }}
          >
            ${tab.icon ? html`<span>${tab.icon}</span>` : ''}
            <span>${tab.label}</span>
          </button>
        `;
      })}
    </div>
  `;
}
