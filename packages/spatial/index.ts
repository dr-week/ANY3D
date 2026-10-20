import * as THREE from 'three';
import { signal, effect, type Signal } from '../signals/index.js';

export interface SpatialBedConfig {
  width: number;
  depth: number;
  height: number;
  origin?: 'center' | 'front_left';
}

export class SpatialBedController {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public gridHelper: THREE.GridHelper;
  public bedMesh: THREE.Mesh;
  public boundsBox: THREE.LineSegments;
  public loadedModel: THREE.Object3D | null = null;
  public isOutsideBed: Signal<boolean> = signal(false);

  private container: HTMLElement;
  private animFrameId: number | null = null;
  private isDragging: boolean = false;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;
  private spherical: THREE.Spherical = new THREE.Spherical(350, Math.PI / 3, Math.PI / 4);
  private target: THREE.Vector3 = new THREE.Vector3(0, 40, 0);

  constructor(container: HTMLElement, config: SpatialBedConfig = { width: 220, depth: 220, height: 250 }) {
    this.container = container;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1117);

    // 2. Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
    this.updateCameraPosition();

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 0.8);
    dirLight1.position.set(200, 400, 200);
    dirLight1.castShadow = true;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffaa00, 0.4);
    dirLight2.position.set(-200, 200, -200);
    this.scene.add(dirLight2);

    // 5. Anycubic Kobra 2 Bed Plate (220 x 220 x 250 mm)
    // Spring steel textured PEI sheet look
    const bedGeo = new THREE.BoxGeometry(config.width, 3, config.depth);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.85,
      metalness: 0.2
    });
    this.bedMesh = new THREE.Mesh(bedGeo, bedMat);
    this.bedMesh.position.y = -1.5;
    this.bedMesh.receiveShadow = true;
    this.scene.add(this.bedMesh);

    // Bed Grid Lines (10mm intervals with subtle highlight)
    this.gridHelper = new THREE.GridHelper(config.width, 22, 0x00d2ff, 0x2a3649);
    this.gridHelper.position.y = 0.05;
    this.scene.add(this.gridHelper);

    // Bounding Box limits (220 x 220 x 250 mm volume)
    const boundsGeo = new THREE.BoxGeometry(config.width, config.height, config.depth);
    const edges = new THREE.EdgesGeometry(boundsGeo);
    this.boundsBox = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.18 })
    );
    this.boundsBox.position.y = config.height / 2;
    this.scene.add(this.boundsBox);

    // 6. Build volume orientation labels / coordinates
    this.setupAxes();

    // 7. Event listeners
    this.setupInteraction();

    // 8. Render loop
    this.animate = this.animate.bind(this);
    this.animate();

    window.addEventListener('resize', this.onResize);
  }

  private setupAxes(): void {
    const axes = new THREE.AxesHelper(30);
    axes.position.set(-110, 0.2, 110);
    this.scene.add(axes);
  }

  private setupInteraction(): void {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      if (e.buttons === 1) { // Left click: Orbit
        this.spherical.theta -= deltaX * 0.008;
        this.spherical.phi -= deltaY * 0.008;
        this.spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.02, this.spherical.phi));
        this.updateCameraPosition();
      } else if (e.buttons === 2) { // Right click: Pan
        const panSpeed = 0.4;
        const right = new THREE.Vector3().crossVectors(this.camera.up, new THREE.Vector3().subVectors(this.target, this.camera.position)).normalize();
        this.target.addScaledVector(right, deltaX * panSpeed);
        this.target.y += deltaY * panSpeed;
        this.updateCameraPosition();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    el.addEventListener('contextmenu', (e) => e.preventDefault());

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.spherical.radius += e.deltaY * 0.3;
      this.spherical.radius = Math.max(50, Math.min(800, this.spherical.radius));
      this.updateCameraPosition();
    }, { passive: false });
  }

  private updateCameraPosition(): void {
    const offset = new THREE.Vector3().setFromSpherical(this.spherical);
    this.camera.position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);
  }

  private onResize = (): void => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / (height || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate(): void {
    this.animFrameId = requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  }

  public setLoadedMesh(mesh: THREE.Object3D): void {
    if (this.loadedModel) {
      this.scene.remove(this.loadedModel);
    }
    this.loadedModel = mesh;
    this.scene.add(mesh);
    this.autoCenterAndDropToBed();
    this.validateBedBounds();
  }

  public autoCenterAndDropToBed(): void {
    if (!this.loadedModel) return;
    const box = new THREE.Box3().setFromObject(this.loadedModel);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Center on bed (X=0, Z=0) and lay flat at bottom (Y=0)
    this.loadedModel.position.x -= center.x;
    this.loadedModel.position.z -= center.z;
    this.loadedModel.position.y -= box.min.y;

    this.validateBedBounds();
  }

  public rotateModel(axis: 'x' | 'y' | 'z', degrees: number): void {
    if (!this.loadedModel) return;
    const rad = THREE.MathUtils.degToRad(degrees);
    if (axis === 'x') this.loadedModel.rotation.x += rad;
    if (axis === 'y') this.loadedModel.rotation.y += rad;
    if (axis === 'z') this.loadedModel.rotation.z += rad;
    this.autoCenterAndDropToBed();
  }

  public scaleModel(factor: number): void {
    if (!this.loadedModel) return;
    this.loadedModel.scale.multiplyScalar(factor);
    this.autoCenterAndDropToBed();
  }

  public layFlat(): void {
    if (!this.loadedModel) return;
    // Align bottom-most face to Z=0 plane
    this.loadedModel.rotation.set(0, 0, 0);
    this.autoCenterAndDropToBed();
  }

  public validateBedBounds(): boolean {
    if (!this.loadedModel) {
      this.isOutsideBed.value = false;
      return true;
    }
    const box = new THREE.Box3().setFromObject(this.loadedModel);
    const halfX = 110;
    const halfZ = 110;
    const maxY = 250;

    const out = (
      box.min.x < -halfX || box.max.x > halfX ||
      box.min.z < -halfZ || box.max.z > halfZ ||
      box.max.y > maxY || box.min.y < -0.5
    );
    this.isOutsideBed.value = out;
    return !out;
  }

  public dispose(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
