import * as THREE from 'three';
import { render, html } from '../packages/core/index.js';
import { effect, signal } from '../packages/signals/index.js';
import { SpatialBedController } from '../packages/spatial/index.js';
import { renderBambuTopHeader } from './components/bambu-header.js';
import { renderBambuLeftPanel } from './components/bambu-panel.js';
import { renderSidebar } from './components/sidebar.js';
import { renderCartModal } from './components/cart-modal.js';
import { isCartOpen } from './services/cart-service.js';
import { ICONS } from './components/icons.js';
import { slicerEngine } from './services/slicer-engine.js';
import { ToolpathVisualizer } from './services/toolpath-viewer.js';
import { modelLoader } from './services/model-loader.js';
import { exportToSDCard } from './services/sdcard-service.js';
import {
  activeTopTab,
  activeModelName,
  generatedGcode,
  slicingStatus,
  slicingProgress,
  estimatedTimeSeconds,
  filamentMassGrams,
  modelDimensions,
  triangleCount
} from './services/slicer-state.js';
import type { Online3DModel } from './services/online-discovery.js';

class Any3DApplication {
  private appRoot: HTMLElement;
  private spatialBed: SpatialBedController | null = null;
  private toolpathVisualizer: ToolpathVisualizer | null = null;
  private showCommunityDrawer = signal<boolean>(false);

  constructor(appRoot: HTMLElement) {
    this.appRoot = appRoot;
    this.init();
  }

  private init(): void {
    this.renderLayout();
    this.setupViewports();
    this.loadCalibrationModel('benchy');

    // Switch viewports based on Prepare vs Preview tab
    effect(() => {
      const tab = activeTopTab.value;
      const bedEl = document.getElementById('spatial-bed-container');
      const toolpathEl = document.getElementById('toolpath-viewport-container');

      if (tab === 'preview') {
        bedEl?.classList.add('hidden');
        toolpathEl?.classList.remove('hidden');
        if (generatedGcode.value && this.toolpathVisualizer) {
          this.toolpathVisualizer.renderGcode(generatedGcode.value);
        }
      } else {
        bedEl?.classList.remove('hidden');
        toolpathEl?.classList.add('hidden');
      }
    });
  }

  private renderLayout(): void {
    this.appRoot.innerHTML = `
      <div class="h-screen w-screen flex flex-col overflow-hidden bg-[#18191c] font-sans select-none text-[#cfd3dc]">
        <!-- 1. Top Bambu Header Bar -->
        <div id="bambu-header-container"></div>

        <!-- 2. Main Workbench -->
        <div class="flex-1 flex overflow-hidden relative">
          <!-- Left Slicer Parameters Panel (Exact Bambu Studio layout: 320px) -->
          <aside id="bambu-panel-container" class="w-80 shrink-0 h-full overflow-hidden"></aside>

          <!-- Center Canvas: Build Plate & Sliced Toolpath -->
          <main class="flex-1 h-full relative overflow-hidden bg-[#121316]">
            <!-- Quick Viewport Toolbar (Icons only, minimal) -->
            <div class="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-[#1e2024]/90 backdrop-blur border border-[#2d3139] p-0.5 rounded shadow-lg text-xs">
              <div class="w-5 h-5 rounded bg-[#282c34] flex items-center justify-center font-bold text-[10px] text-[#00ae42] border border-[#353b47]" title="Plate 1">
                1
              </div>
              <button
                class="p-1 hover:bg-[#282c34] rounded text-[#9096a2] hover:text-white"
                title="Center on plate"
                id="btn-auto-center"
              >
                ${html([ICONS.center] as any)}
              </button>
              <button
                class="p-1 hover:bg-[#282c34] rounded text-[#9096a2] hover:text-white"
                title="Lay flat"
                id="btn-lay-flat"
              >
                ${html([ICONS.flat] as any)}
              </button>
              <button
                class="p-1 hover:bg-[#282c34] rounded text-[#9096a2] hover:text-white"
                title="Rotate 90°"
                id="btn-rotate-90"
              >
                ${html([ICONS.rotate] as any)}
              </button>

              <div class="h-3 w-px bg-[#2d3139]"></div>

              <!-- Community Models Drawer Trigger -->
              <button
                class="px-2 py-0.5 hover:bg-[#282c34] rounded text-[#00ae42] font-medium flex items-center gap-1 text-[11px]"
                id="btn-toggle-community"
                title="Online 3D Model Discovery"
              >
                ${html([ICONS.globe] as any)}
                <span>Online</span>
              </button>
            </div>

            <!-- 3D Spatial Bed Viewport Container -->
            <div id="spatial-bed-container" class="w-full h-full absolute inset-0"></div>

            <!-- G-Code Toolpath Visualizer Container -->
            <div id="toolpath-viewport-container" class="w-full h-full absolute inset-0 hidden"></div>

            <!-- Bottom Left Stats overlay (clean numbers, no text noise) -->
            <div class="absolute bottom-3 left-3 z-10 flex items-center gap-3 bg-[#1e2024]/90 backdrop-blur border border-[#2d3139] px-3 py-1.5 rounded shadow text-xs font-mono">
              <span class="text-[#9096a2]">Time: <strong id="stats-time" class="text-[#00ae42]">--</strong></span>
              <span class="text-[#9096a2]">Filament: <strong id="stats-mass" class="text-[#00ae42]">--</strong></span>
              <span class="text-[#9096a2]">Size: <strong id="stats-dims" class="text-white">--</strong></span>
            </div>
          </main>

          <!-- Slide-out Community Discovery Drawer -->
          <div id="community-drawer-container" class="hidden absolute top-0 right-0 w-80 h-full z-30 shadow-2xl"></div>

          <!-- Free 3D Shopping Cart Modal Container -->
          <div id="cart-modal-container"></div>
        </div>
      </div>
    `;

    this.mountComponents();
    this.setupGizmoListeners();
  }

  private mountComponents(): void {
    // Cart Modal Container
    const cartEl = document.getElementById('cart-modal-container')!;
    effect(() => {
      cartEl.innerHTML = '';
      if (isCartOpen.value) {
        const { fragment } = render(renderCartModal(this.handleLoadModel.bind(this)));
        cartEl.appendChild(fragment);
      }
    });
    // Top Header
    const headerEl = document.getElementById('bambu-header-container')!;
    effect(() => {
      headerEl.innerHTML = '';
      const isSlicing = slicingStatus.value === 'slicing';
      const { fragment } = render(renderBambuTopHeader(
        this.handleSlicePlate.bind(this),
        this.handleExportToSD.bind(this),
        isSlicing
      ));
      headerEl.appendChild(fragment);
    });

    // Left Parameter Panel
    const panelEl = document.getElementById('bambu-panel-container')!;
    effect(() => {
      panelEl.innerHTML = '';
      const { fragment } = render(renderBambuLeftPanel());
      panelEl.appendChild(fragment);
    });

    // Community Drawer
    const drawerEl = document.getElementById('community-drawer-container')!;
    effect(() => {
      drawerEl.innerHTML = '';
      if (this.showCommunityDrawer.value) {
        drawerEl.classList.remove('hidden');
        const { fragment } = render(renderSidebar(this.handleLoadModel.bind(this)));
        drawerEl.appendChild(fragment);
      } else {
        drawerEl.classList.add('hidden');
      }
    });

    // Reactive Stats overlay
    effect(() => {
      const timeEl = document.getElementById('stats-time');
      const massEl = document.getElementById('stats-mass');
      const dimsEl = document.getElementById('stats-dims');
      const sec = estimatedTimeSeconds.value;
      const mass = filamentMassGrams.value;
      const dims = modelDimensions.value;

      if (timeEl) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        timeEl.textContent = sec > 0 ? (h > 0 ? `${h}h ${m}m` : `${m}m`) : '--';
      }
      if (massEl) {
        massEl.textContent = mass > 0 ? `${mass.toFixed(1)}g` : '--';
      }
      if (dimsEl) {
        dimsEl.textContent = `${dims.x}×${dims.y}×${dims.z}mm`;
      }
    });
  }

  private setupGizmoListeners(): void {
    document.getElementById('btn-auto-center')?.addEventListener('click', () => {
      this.spatialBed?.autoCenterAndDropToBed();
    });
    document.getElementById('btn-lay-flat')?.addEventListener('click', () => {
      this.spatialBed?.layFlat();
    });
    document.getElementById('btn-rotate-90')?.addEventListener('click', () => {
      this.spatialBed?.rotateModel('z', 90);
    });
    document.getElementById('btn-toggle-community')?.addEventListener('click', () => {
      this.showCommunityDrawer.value = !this.showCommunityDrawer.value;
    });
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('#btn-header-cart')) {
        isCartOpen.value = true;
      }
    });
  }

  private setupViewports(): void {
    const bedContainer = document.getElementById('spatial-bed-container')!;
    this.spatialBed = new SpatialBedController(bedContainer, {
      width: 220,
      depth: 220,
      height: 250
    });

    const toolpathContainer = document.getElementById('toolpath-viewport-container')!;
    this.toolpathVisualizer = new ToolpathVisualizer(toolpathContainer);
  }

  private loadCalibrationModel(type: 'benchy' | 'cube' | 'tower'): void {
    const info = modelLoader.generateCalibrationModel(type);
    if (type === 'benchy') activeModelName.value = 'night_5_ams(2).stl';
    if (type === 'cube') activeModelName.value = 'Cube_20mm.stl';
    if (type === 'tower') activeModelName.value = 'Retract_Tower.stl';

    modelDimensions.value = info.dimensions;
    triangleCount.value = info.triangleCount;

    this.spatialBed?.setLoadedMesh(info.mesh);
  }

  private async handleLoadModel(modelOrFile: Online3DModel | File | string): Promise<void> {
    if (typeof modelOrFile === 'string') {
      this.loadCalibrationModel(modelOrFile as 'benchy' | 'cube' | 'tower');
      return;
    }

    if ('title' in modelOrFile) {
      activeModelName.value = `${modelOrFile.id}.stl`;
      const info = modelLoader.generateCalibrationModel(
        modelOrFile.tags.includes('cube') ? 'cube' : modelOrFile.tags.includes('tower') ? 'tower' : 'benchy'
      );
      modelDimensions.value = info.dimensions;
      triangleCount.value = info.triangleCount;
      this.spatialBed?.setLoadedMesh(info.mesh);
    } else {
      activeModelName.value = modelOrFile.name;
      try {
        const buffer = await modelOrFile.arrayBuffer();
        const info = modelLoader.parseSTL(buffer);
        modelDimensions.value = info.dimensions;
        triangleCount.value = info.triangleCount;
        this.spatialBed?.setLoadedMesh(info.mesh);
      } catch (err) {
        console.error('Failed to parse STL file:', err);
      }
    }

    activeTopTab.value = 'prepare';
  }

  private async handleSlicePlate(): Promise<void> {
    try {
      await slicerEngine.sliceModel(activeModelName.value);
      // Auto-switch to Preview tab like Bambu Studio
      activeTopTab.value = 'preview';
    } catch (err) {
      console.error('Slice error:', err);
      slicingStatus.value = 'error';
    }
  }

  private async handleExportToSD(): Promise<void> {
    const gcode = generatedGcode.value;
    if (!gcode) {
      await this.handleSlicePlate();
    }
    const readyGcode = generatedGcode.value;
    if (!readyGcode) return;

    try {
      const res = await exportToSDCard(readyGcode, activeModelName.value);
      if (res.method === 'picker') {
        alert(`Saved ${res.filename} directly to SD Card.`);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error saving to SD card:', err);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (root) {
    new Any3DApplication(root);
  }
});
