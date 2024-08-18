import * as THREE from "three";

export const parseGeometryName = (
  object: Nullable<THREE.Object3D<THREE.Object3DEventMap> | null>,
):
  | { type: "cylinder"; x: number; z: number }
  | {
      type: undefined;
      x: undefined;
      z: undefined;
    } => {
  if (!object) {
    return {
      type: undefined,
      x: undefined,
      z: undefined,
    };
  }

  const [type, x, z] = object.name.split(".").map((value, index) => {
    switch (index) {
      case 0:
        return value as "cylinder";
      case 1:
      case 2:
      default:
        return Number(value);
    }
  }) as ["cylinder", number, number];

  return {
    type,
    x,
    z,
  };
};
