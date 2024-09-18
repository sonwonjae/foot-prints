import type * as THREE from "three";

import { Land } from "./class/land.class";

/** NOTE: cylinder event type declare */
declare global {
  interface GlobalEventHandlersEventMap {
    "cylinder-click": CustomEvent<{ cylinder: Land }>;
    "cylinder-enter": CustomEvent<{ cylinder: Land }>;
    "cylinder-out": CustomEvent<{ cylinder: Land }>;
    "camera-move-end": CustomEvent<{ location: CylinderLocation }>;
  }
}

export type Cateogry = Nullable<string>;

export type LandType =
  | "time-capsule"
  | "guest-book"
  | "wasteland"
  | "fence"
  | "grass";

export interface Article {
  location: {
    x: number;
    z: number;
  };
  category?: Cateogry;
  height?: number /** FIXME: 이거 나중에 조회수로 바꿔야 함 */;
  landType: LandType;
  variation: number;
}

export interface ArticleMap {
  [key: number]: {
    [key: number]: {
      cylinder: Land;
    };
  };
}

export type CylinderObject = THREE.Mesh<
  THREE.CylinderGeometry,
  THREE.MeshToonMaterial,
  THREE.Object3DEventMap
>;

export interface CylinderLocation {
  x: number;
  z: number;
}

type EasingFunctionType = "easy-in" | "easy-out";

type AnimationTask = {
  type: "camera-move";
  location: { x: number; y?: number; z: number };
  duration: number;
  progress: number;
  easingFuncionType?: EasingFunctionType;
  isKill?: boolean;
  cameraStartLocation: CylinderLocation;
  controlsStartLocation: CylinderLocation;
};

export interface CylinderMapStore<CylinderType> {
  map: ArticleMap;
  cylinderList: Array<CylinderType>;
  animationMultiThread: Array<AnimationTask>;
}

export interface DefaultCylinderType {
  location: { x: number; z: number };
  category?: Nullable<string>;
  height?: number;
  landType: LandType;
  variation: number;
}

export interface CylinderMapConstructorParam<CylinderType> {
  $canvas: HTMLCanvasElement;
  cylinderList: Array<CylinderType>;
  bx?: number;
  bz?: number;
}

export interface UpdateCylinderMapParam {
  cylinder: Land;
}
