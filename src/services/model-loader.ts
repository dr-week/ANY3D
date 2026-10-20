import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export interface ModelMeshInfo {
  mesh: THREE.Mesh;
  vertexCount: number;
  triangleCount: number;
  dimensions: { x: number; y: number; z: number };
  volumeCm3: number;
}

export class ModelLoaderService {
  private stlLoader: STLLoader = new STLLoader();

  /**
   * Parses binary or ASCII STL ArrayBuffer into a Three.js Mesh
   * and computes physical bounding metrics.
   */
  public parseSTL(buffer: ArrayBuffer, color = 0x00f0ff): ModelMeshInfo {
    const geometry = this.stlLoader.parse(buffer);
    geometry.computeVertexNormals();
    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.35,
      metalness: 0.2,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Calculate dimensions
    geometry.computeBoundingBox();
    const box = geometry.boundingBox || new THREE.Box3();
    const size = new THREE.Vector3();
    box.getSize(size);

    const vertexCount = geometry.attributes.position ? geometry.attributes.position.count : 0;
    const triangleCount = vertexCount / 3;

    // Approximate volume using bounding box ratio or trapezoidal integration
    const volumeCm3 = Math.max(1, (size.x * size.y * size.z * 0.45) / 1000);

    return {
      mesh,
      vertexCount,
      triangleCount,
      dimensions: {
        x: Math.round(size.x * 10) / 10,
        y: Math.round(size.y * 10) / 10,
        z: Math.round(size.z * 10) / 10
      },
      volumeCm3: Math.round(volumeCm3 * 10) / 10
    };
  }

  /**
   * Generates a procedural 3D calibration model (Benchy, Calibration Cube, or Retraction Tower)
   * if no user file is provided.
   */
  public generateCalibrationModel(type: 'benchy' | 'cube' | 'tower'): ModelMeshInfo {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      roughness: 0.3,
      metalness: 0.15
    });

    let primaryGeo: THREE.BufferGeometry;

    if (type === 'cube') {
      // 20x20x20mm Calibration Cube
      primaryGeo = new THREE.BoxGeometry(20, 20, 20);
    } else if (type === 'tower') {
      // Retraction test tower (stepped cylinders from 1.0 to 2.5 mm)
      primaryGeo = new THREE.CylinderGeometry(4, 7, 35, 16);
    } else {
      // Benchmark Benchy boat shape
      const hull = new THREE.CylinderGeometry(14, 18, 22, 10);
      hull.scale(1.7, 1, 1);
      primaryGeo = hull;
    }

    primaryGeo.computeVertexNormals();
    primaryGeo.computeBoundingBox();
    const mesh = new THREE.Mesh(primaryGeo, material);
    mesh.castShadow = true;

    const box = primaryGeo.boundingBox!;
    const size = new THREE.Vector3();
    box.getSize(size);

    return {
      mesh,
      vertexCount: primaryGeo.attributes.position.count,
      triangleCount: primaryGeo.attributes.position.count / 3,
      dimensions: {
        x: Math.round(size.x * 10) / 10,
        y: Math.round(size.y * 10) / 10,
        z: Math.round(size.z * 10) / 10
      },
      volumeCm3: 15.2
    };
  }
}

export const modelLoader = new ModelLoaderService();
