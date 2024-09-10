import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";

export class Controls {
  controls: MapControls;
  constructor({
    camera,
    $canvas,
  }: {
    camera: THREE.PerspectiveCamera;
    $canvas: HTMLCanvasElement;
  }) {
    this.tick = this.tick.bind(this);
    this.controls = new MapControls(camera, $canvas);

    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;

    this.controls.screenSpacePanning = false;

    this.controls.minDistance = 15;
    this.controls.maxDistance = 75;

    this.controls.enableRotate = false;

    this.controls.maxPolarAngle = Math.PI / 2;
  }

  tick() {
    return this.controls.update();
  }
}
