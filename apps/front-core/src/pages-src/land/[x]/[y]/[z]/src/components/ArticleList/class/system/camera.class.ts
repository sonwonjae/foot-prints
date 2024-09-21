import * as THREE from "three";

export class Camera {
  camera: THREE.PerspectiveCamera;
  constructor({ $canvas }: { $canvas: HTMLCanvasElement }) {
    const fov = 50;
    const aspect = $canvas.clientWidth / $canvas.clientHeight;
    const near = 1;
    const far = 1000;

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  }
}
