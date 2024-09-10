import * as THREE from "three";

import { lighter } from "@/three/utils/color";

import { Light } from "./light.class";

export class Scene {
  scene: THREE.Scene;
  constructor({ camera }: { camera: THREE.PerspectiveCamera }) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(lighter("#93EBF9", 80));

    camera.lookAt(this.scene.position);

    const { hemisphereLight, ambientLight, shadowLight, backgroundLight } =
      new Light();

    this.scene.add(hemisphereLight);
    this.scene.add(ambientLight);
    this.scene.add(shadowLight);
    this.scene.add(backgroundLight);
  }
}
