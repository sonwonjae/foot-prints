import type * as THREE from "three";

/** NOTE: cylinder event type declare */
declare global {
  interface GlobalEventHandlersEventMap {
    "cylinder-enter": CustomEvent<{ cylinder: Cylinder }>;
    "cylinder-out": CustomEvent<{ cylinder: Cylinder }>;
  }
}

export type Cateogry = Nullable<string>;

export interface Article {
  location: {
    x: number;
    z: number;
  };
  category?: Cateogry;
  height?: number /** FIXME: 이거 나중에 조회수로 바꿔야 함 */;
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
    };
  };
}

export interface CategoryMap {
  [category: string]: Array<{
    x: number;
    z: number;
    cylinder: Cylinder;
    height: number;
    progress: number;
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
  progress: number;
  cameraStartLocation: CylinderLocation;
  controlsStartLocation: CylinderLocation;
}

export interface CylinderMapStore {
  currentSelectedCylinder: Nullable<Cylinder>;
  currentCategory: Nullable<string>;
  prevHoveredCylinder: Nullable<Cylinder>;
  map: ArticleMap;
  categoryMap: CategoryMap;
  targetCylinderLocation: Nullable<TargetCylinderLocation>;
}

export interface OnCylinderClick {
  (param: {
    object: Cylinder;
    location: { x: number; z: number };
    category: Nullable<string>;
  }): void;
}

export interface DefaultCylinderType {
  location: { x: number; z: number };
  category?: Nullable<string>;
  height?: number;
}

export interface CylinderMapConstructorParam<CylinderType> {
  $canvas: HTMLCanvasElement;
  cylinderList: Array<CylinderType>;
  bx?: number;
  bz?: number;
  onCylinderClick?: OnCylinderClick;
}

export interface UpdateCylinderMapParam {
  cylinder: Cylinder;
  x: number;
  z: number;
  color: `#${string}`;
  category?: Cateogry;
}

export interface UpdateCategoryMapParam {
  category: NonNullable<Cateogry>;
  x: number;
  z: number;
  height: number;
  cylinder: Cylinder;
}
