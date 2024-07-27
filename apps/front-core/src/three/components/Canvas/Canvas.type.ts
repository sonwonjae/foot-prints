import type * as THREE from "three";

/** FIXME: 임시로 여기에 모든 타입 선언, 추후 이동 필요 */

/** FIXME: 이 utility type은 declare 파일로 이동하기 */
export type Nullable<T> = T | null;

export interface Article {
  location: {
    x: number;
    z: number;
  };
  category: string;
  height: number;
  checked: boolean;
}

export interface CheckMap {
  [key: number]: {
    [key: number]: {
      isExist: boolean;
      cylinder: THREE.Mesh<
        THREE.CylinderGeometry,
        THREE.MeshToonMaterial,
        THREE.Object3DEventMap
      >;
      color: `#${string}`;
      category: string | null;
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

interface AddCategoryParameter {
  category: string;
  x: number;
  z: number;
  height: number;
  cylinder: Cylinder;
}

export interface AddCategory {
  (param: AddCategoryParameter): void;
}

interface CheckerOptions {
  x: number;
  z: number;
  color: `#${string}`;
  category: string;
}

export interface Checker {
  (cylinder: Cylinder, param: CheckerOptions): void;
}
