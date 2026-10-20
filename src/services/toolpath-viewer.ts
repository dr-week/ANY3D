import * as THREE from 'three';
import { init } from 'gcode-preview';

export class ToolpathVisualizer {
  private container: HTMLElement;
  private previewInstance: any = null;
  private currentLayer: number = 0;
  private maxLayers: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public renderGcode(gcodeText: string): void {
    this.container.innerHTML = '';

    // Create canvas for gcode-preview
    const canvas = document.createElement('canvas');
    canvas.className = 'w-full h-full';
    this.container.appendChild(canvas);

    try {
      if (typeof init === 'function') {
        this.previewInstance = init({
          canvas: canvas,
          targetId: this.container.id || undefined,
          topLayerColor: new THREE.Color(0x00f0ff).getHex(),
          lastSegmentColor: new THREE.Color(0xff0055).getHex(),
          buildVolume: { x: 220, y: 220, z: 250 },
          initialCameraPosition: [0, 400, 450],
          allowDragging: true,
          renderTravel: true,
          travelColor: new THREE.Color(0x1a8cff).getHex(),
          extrusionColor: new THREE.Color(0x00e676).getHex(),
          retractionColor: new THREE.Color(0xff3d00).getHex()
        });

        this.previewInstance.processGCode(gcodeText);
        this.maxLayers = this.previewInstance.layers?.length || 100;
        this.currentLayer = this.maxLayers;
      } else {
        this.renderFallbackThreePreview(gcodeText, canvas);
      }
    } catch (err) {
      console.warn('gcode-preview init fallback to internal toolpath parser:', err);
      this.renderFallbackThreePreview(gcodeText, canvas);
    }
  }

  public setLayer(layerIndex: number): void {
    if (this.previewInstance && typeof this.previewInstance.render === 'function') {
      this.previewInstance.endLayer = layerIndex;
      this.previewInstance.render();
    }
  }

  private renderFallbackThreePreview(gcodeText: string, canvas: HTMLCanvasElement): void {
    // Custom High-Performance Three.js Toolpath Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e14);

    const aspect = this.container.clientWidth / (this.container.clientHeight || 1);
    const camera = new THREE.PerspectiveCamera(45, aspect, 1, 2000);
    camera.position.set(110, 280, 360);
    camera.lookAt(110, 20, 110);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(this.container.clientWidth, this.container.clientHeight);

    // Kobra 2 Bed grid (220 x 220)
    const grid = new THREE.GridHelper(220, 22, 0x00e5ff, 0x1f293d);
    grid.position.set(110, 0, 110);
    scene.add(grid);

    // Ambient and point light
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));

    // Parse GCode Lines into colored line segments
    const lines = gcodeText.split('\n');
    const perimeterPoints: number[] = [];
    const infillPoints: number[] = [];
    const travelPoints: number[] = [];

    let curX = 0, curY = 0, curZ = 0;
    let isExtruding = false;
    let currentType = 'WALL-OUTER';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith(';TYPE:')) {
        currentType = line.slice(6);
      }
      if (line.startsWith('G0') || line.startsWith('G1')) {
        const xMatch = line.match(/X([0-9.]+)/);
        const yMatch = line.match(/Y([0-9.]+)/);
        const zMatch = line.match(/Z([0-9.]+)/);
        const eMatch = line.match(/E([0-9.]+)/);

        const nextX = xMatch ? parseFloat(xMatch[1]) : curX;
        const nextY = yMatch ? parseFloat(yMatch[1]) : curY;
        const nextZ = zMatch ? parseFloat(zMatch[1]) : curZ;
        isExtruding = eMatch !== null && parseFloat(eMatch[1]) > 0;

        if (nextX !== curX || nextY !== curY || nextZ !== curZ) {
          if (line.startsWith('G0') || !isExtruding) {
            travelPoints.push(curX, curZ, curY, nextX, nextZ, nextY);
          } else if (currentType.includes('FILL')) {
            infillPoints.push(curX, curZ, curY, nextX, nextZ, nextY);
          } else {
            perimeterPoints.push(curX, curZ, curY, nextX, nextZ, nextY);
          }
          curX = nextX;
          curY = nextY;
          curZ = nextZ;
        }
      }
    }

    // Add Outer Wall Mesh (Cyan / Emerald)
    if (perimeterPoints.length > 0) {
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.Float32BufferAttribute(perimeterPoints, 3));
      const pMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
      scene.add(new THREE.LineSegments(pGeo, pMat));
    }

    // Add Infill Mesh (Amber / Yellow)
    if (infillPoints.length > 0) {
      const iGeo = new THREE.BufferGeometry();
      iGeo.setAttribute('position', new THREE.Float32BufferAttribute(infillPoints, 3));
      const iMat = new THREE.LineBasicMaterial({ color: 0xffb703, linewidth: 1.5 });
      scene.add(new THREE.LineSegments(iGeo, iMat));
    }

    // Add Travel Moves (Subtle Blue)
    if (travelPoints.length > 0) {
      const tGeo = new THREE.BufferGeometry();
      tGeo.setAttribute('position', new THREE.Float32BufferAttribute(travelPoints, 3));
      const tMat = new THREE.LineBasicMaterial({ color: 0x3a86ff, opacity: 0.25, transparent: true });
      scene.add(new THREE.LineSegments(tGeo, tMat));
    }

    const renderLoop = () => {
      renderer.render(scene, camera);
    };
    renderLoop();
  }

  public dispose(): void {
    if (this.previewInstance?.dispose) {
      this.previewInstance.dispose();
    }
  }
}
