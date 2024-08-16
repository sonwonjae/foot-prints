import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";

import { resizeRendererToDisplaySize } from "@/three/utils/resize";

import { Cylinder } from "./ArticleList.type";

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

export const createRenderer = ({ $canvas }: { $canvas: HTMLCanvasElement }) => {
  return new THREE.WebGLRenderer({
    antialias: true,
    canvas: $canvas,
    alpha: true,
    premultipliedAlpha: false,
  });
};

export const initCamera = ({ $canvas }: { $canvas: HTMLCanvasElement }) => {
  const fov = 50;
  const aspect = $canvas.clientWidth / $canvas.clientHeight;
  const near = 1;
  const far = 1000;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  return camera;
};

export const initControls = ({
  camera,
  $canvas,
}: {
  camera: THREE.PerspectiveCamera;
  $canvas: HTMLCanvasElement;
}) => {
  const controls = new MapControls(camera, $canvas);

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 15;
  controls.maxDistance = 75;

  controls.enableRotate = false;

  controls.maxPolarAngle = Math.PI / 2;
  // controls.enableZoom = false;

  return controls;
};

export const initLight = ({ scene }: { scene: THREE.Scene }) => {
  const hemisphereLight = new THREE.HemisphereLight("#FFFFFF", "#ADD8E6", 0.8);

  const ambientLight = new THREE.AmbientLight("#FFFFFF", 1);

  const shadowLight = new THREE.DirectionalLight("#FFFFFF", 1);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 4096;
  shadowLight.shadow.mapSize.height = 4096;

  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);
};

export const updateMouseStyle = ({
  $canvas,
  cylinder,
}: {
  $canvas: HTMLCanvasElement;
  cylinder: Nullable<Cylinder>;
}) => {
  if (cylinder) {
    $canvas.style.cursor = "pointer";
  } else {
    $canvas.style.cursor = "default";
  }
};

export const dispatchCylinderMouseEvent = ({
  $canvas,
  prevHoveredCylinder,
  currentHoveredCylinder,
}: {
  $canvas: HTMLCanvasElement;
  prevHoveredCylinder: Nullable<Cylinder>;
  currentHoveredCylinder: Nullable<Cylinder>;
}) => {
  if (!prevHoveredCylinder) {
    if (currentHoveredCylinder) {
      const cylinderEnterEvent = new CustomEvent<{ cylinder: Cylinder }>(
        "cylinder-enter",
        {
          detail: {
            cylinder: currentHoveredCylinder,
          },
        },
      );
      $canvas.dispatchEvent(cylinderEnterEvent);
    }
  }

  if (!currentHoveredCylinder) {
    if (prevHoveredCylinder) {
      const cylinderOutEvent = new CustomEvent<{ cylinder: Cylinder }>(
        "cylinder-out",
        {
          detail: { cylinder: prevHoveredCylinder },
        },
      );
      $canvas.dispatchEvent(cylinderOutEvent);
    }
  }
  if (prevHoveredCylinder && currentHoveredCylinder) {
    if (prevHoveredCylinder?.name !== currentHoveredCylinder?.name) {
      const cylinderEnterEvent = new CustomEvent<{ cylinder: Cylinder }>(
        "cylinder-enter",
        {
          detail: {
            cylinder: currentHoveredCylinder,
          },
        },
      );
      const cylinderOutEvent = new CustomEvent<{ cylinder: Cylinder }>(
        "cylinder-out",
        {
          detail: {
            cylinder: prevHoveredCylinder,
          },
        },
      );

      $canvas.dispatchEvent(cylinderOutEvent);
      $canvas.dispatchEvent(cylinderEnterEvent);
    }
  }
};

export const easeOutCubic = (progress: number): number => {
  return 1 - Math.pow(1 - progress, 2);
};
export const easeInCubic = (progress: number): number => {
  return progress * progress;
};
