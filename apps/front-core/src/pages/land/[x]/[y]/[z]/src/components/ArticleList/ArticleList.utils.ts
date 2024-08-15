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
  const particleLight = new THREE.Mesh(
    new THREE.SphereGeometry(4, 8, 8),
    new THREE.MeshBasicMaterial({ color: "#ffffff" }),
  );
  const pointLight = new THREE.PointLight("#ffffff", 2, 800, 0);
  particleLight.add(pointLight);
  particleLight.position.x = -500;
  particleLight.position.y = -1000;
  particleLight.position.z = -500;

  const intensity = 1;
  const skyColor = 0xffffff;
  const groundColor = 0x000000;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);

  const ambientLight = new THREE.AmbientLight("#c1c1c1", 3);

  scene.add(particleLight);
  scene.add(light);
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
