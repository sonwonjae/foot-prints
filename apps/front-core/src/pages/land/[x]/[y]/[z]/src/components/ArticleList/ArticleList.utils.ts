import * as THREE from "three";

import { resizeRendererToDisplaySize } from "@/three/utils/resize";

export const resize = ({
  renderer,
  camera,
}: {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
}) => {
  if (resizeRendererToDisplaySize(renderer)) {
    const $canvas = renderer.domElement;
    camera.aspect = $canvas.clientWidth / $canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
};

export const easeOutCubic = (progress: number): number => {
  return 1 - Math.pow(1 - progress, 2);
};
export const easeInCubic = (progress: number): number => {
  return progress * progress;
};
