import * as THREE from "three";

export class Light {
  hemisphereLight: THREE.HemisphereLight;
  ambientLight: THREE.AmbientLight;
  shadowLight: THREE.DirectionalLight;
  backgroundLight: THREE.DirectionalLight;
  constructor() {
    this.hemisphereLight = new THREE.HemisphereLight("#FFFFFF", "#ADD8E6", 0.8);

    this.ambientLight = new THREE.AmbientLight("#FFFFFF", 1);

    this.backgroundLight = new THREE.DirectionalLight("#FFFFFF", 0.5);
    this.backgroundLight.position.set(15, 35, 35);
    this.backgroundLight.shadow.camera.left = -100;
    this.backgroundLight.shadow.camera.right = 100;
    this.backgroundLight.shadow.camera.top = 100;
    this.backgroundLight.shadow.camera.bottom = -100;
    this.backgroundLight.shadow.camera.near = 1;
    this.backgroundLight.shadow.camera.far = 500;
    this.backgroundLight.shadow.mapSize.width = 1080;
    this.backgroundLight.shadow.mapSize.height = 1080;

    this.shadowLight = new THREE.DirectionalLight("#FFFFFF", 1);
    this.shadowLight.position.set(0, 50, 0);
    this.shadowLight.castShadow = true;
    this.shadowLight.shadow.camera.left = -100;
    this.shadowLight.shadow.camera.right = 100;
    this.shadowLight.shadow.camera.top = 100;
    this.shadowLight.shadow.camera.bottom = -100;
    this.shadowLight.shadow.camera.near = 1;
    this.shadowLight.shadow.camera.far = 500;
    this.shadowLight.shadow.mapSize.width = 1080;
    this.shadowLight.shadow.mapSize.height = 1080;
  }
}
