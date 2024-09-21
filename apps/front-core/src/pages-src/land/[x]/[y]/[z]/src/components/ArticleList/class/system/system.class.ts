import * as THREE from "three";
import { MapControls } from "three/examples/jsm/Addons.js";

import { Camera } from "./camera.class";
import { Controls } from "./controls.class";
import { Renderer } from "./renderer.class";
import { Scene } from "./scene.class";

export class System {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  controls: MapControls;
  scene: THREE.Scene;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  constructor({ $canvas }: { $canvas: HTMLCanvasElement }) {
    /** NOTE: create renderer */
    const { renderer } = new Renderer({ $canvas });

    /** NOTE: create camera * set camera */
    const { camera } = new Camera({ $canvas });

    /** NOTE: create controls * set controls */
    const { controls } = new Controls({
      camera,
      $canvas,
    });

    /** NOTE: create scene * set scene in camera */
    const { scene } = new Scene({ camera });

    /** NOTE: create raycaster & pointer */
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    this.renderer = renderer;
    this.camera = camera;
    this.controls = controls;
    this.scene = scene;
    this.raycaster = raycaster;
    this.pointer = pointer;
  }
}
