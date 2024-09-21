import * as THREE from "three";

export class Renderer {
  renderer: THREE.WebGLRenderer;
  constructor({ $canvas }: { $canvas: HTMLCanvasElement }) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: $canvas,
      alpha: true,
      premultipliedAlpha: false,
    });
    this.renderer.shadowMap.enabled = true; // 그림자 맵 활성화
  }
}
