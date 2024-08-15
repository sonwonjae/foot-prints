import type * as THREE from "three";

/** NOTE: cylinder event type declare */
declare global {
  interface GlobalEventHandlersEventMap {
    "cylinder-enter": CustomEvent<{ cylinder: Cylinder }>;
    "cylinder-out": CustomEvent<{ cylinder: Cylinder }>;
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
      isExist: boolean;
      cylinder: THREE.Mesh<
        THREE.CylinderGeometry,
        THREE.MeshToonMaterial,
        THREE.Object3DEventMap
      >;
      color: `#${string}`;
      category: Cateogry;
      height: number;
    };
  };
}

export interface CategoryMap {
  [category: string]: Array<{
    x: number;
    z: number;
    cylinder: Cylinder;
    height: number;
    // progress: number;
  }>;
}

export type Cylinder = THREE.Mesh<
  THREE.CylinderGeometry,
  THREE.MeshToonMaterial,
  THREE.Object3DEventMap
>;

export interface CylinderLocation {
  x: number;
  z: number;
}

interface TargetCylinderLocation extends CylinderLocation {
  // progress: number;
  cameraStartLocation: CylinderLocation;
  controlsStartLocation: CylinderLocation;
}

type EasingFunctionType = "easy-in" | "easy-out";

type AnimationTask =
  | {
      type: "camera-move";
      location: { x: number; y?: number; z: number };
      duration: number;
      progress: number;
      easingFuncionType: EasingFunctionType;
      isKill?: boolean;
      cameraStartLocation: CylinderLocation;
      controlsStartLocation: CylinderLocation;
    }
  | {
      type: "cylinder-category-hover";
      direct: "up" | "down";
      targetCategory: string;
      location: CylinderLocation;
      duration: number;
      progress: number;
      isKill?: boolean;
      easingFuncionType?: undefined;
    }
  | {
      type: "cylinder-create";
      location: CylinderLocation;
      duration: number;
      progress: number;
      easingFuncionType: EasingFunctionType;
      isKill?: boolean;
    };

export interface CylinderMapStore<CylinderType> {
  currentSelectedCylinder: Nullable<Cylinder>;
  currentCategory: Nullable<string>;
  prevHoveredCylinder: Nullable<Cylinder>;
  map: ArticleMap;
  categoryMap: CategoryMap;
  targetCylinderLocation: Nullable<TargetCylinderLocation>;
  cylinderList: Array<CylinderType>;
  animationMultiThread: Array<AnimationTask>;
}

export interface OnCylinderClick {
  (param: {
    object: Cylinder;
    location: CylinderLocation;
    category: Nullable<string>;
  }): void;
}

export interface OnCameraMoveEnd {
  (param: { location: CylinderLocation }): void;
}

export interface CylinderMapEvent {
  onCylinderClick: OnCylinderClick;
  onCameraMoveEnd: OnCameraMoveEnd;
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
  onCylinderClick?: OnCylinderClick;
  onCameraMoveEnd?: OnCameraMoveEnd;
}

export interface UpdateCylinderMapParam {
  cylinder: Cylinder;
  x: number;
  z: number;
  color: `#${string}`;
  category?: Cateogry;
  height: number;
}

export interface UpdateCategoryMapParam {
  category: NonNullable<Cateogry>;
  x: number;
  z: number;
  height: number;
  cylinder: Cylinder;
}
