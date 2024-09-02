import type * as THREE from "three";

import { Cylinder } from "./class/cylinder.class";

/** NOTE: cylinder event type declare */
declare global {
  interface GlobalEventHandlersEventMap {
    "cylinder-click": CustomEvent<{ cylinder: Cylinder }>;
    "cylinder-enter": CustomEvent<{ cylinder: Cylinder }>;
    "cylinder-out": CustomEvent<{ cylinder: Cylinder }>;
    "camera-move-end": CustomEvent<{ location: CylinderLocation }>;
  }
}

export type Cateogry = Nullable<string>;

export type UnitType = "mine-location" | "other-user-location" | "empty";

export interface Article {
  location: {
    x: number;
    z: number;
  };
  category?: Cateogry;
  height?: number /** FIXME: 이거 나중에 조회수로 바꿔야 함 */;
  type: UnitType;
}

export interface ArticleMap {
  [key: number]: {
    [key: number]: {
      cylinder: Cylinder;
    };
  };
}

export interface CategoryMap {
  [category: string]: Array<{
    cylinder: Cylinder;
  }>;
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
  categoryMap: CategoryMap;
  cylinderList: Array<CylinderType>;
  animationMultiThread: Array<AnimationTask>;
}

export interface DefaultCylinderType {
  location: { x: number; z: number };
  category?: Nullable<string>;
  height?: number;
  type: UnitType;
}

export interface CylinderMapConstructorParam<CylinderType> {
  $canvas: HTMLCanvasElement;
  cylinderList: Array<CylinderType>;
  bx?: number;
  bz?: number;
}

export interface UpdateCylinderMapParam {
  cylinder: Cylinder;
}

export interface UpdateCategoryMapParam {
  cylinder: Cylinder;
}
