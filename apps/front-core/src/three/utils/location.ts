import { round } from "es-toolkit";

import { CylinderLocation } from "@/pages/land/[x]/[y]/[z]/src/components/ArticleList/ArticleList.type";

interface LocationFunctionParam extends CylinderLocation {
  magnification?: number;
}

export const DEFAULT_MAGNIFICATION = 4;

/** NOTE: 좌표를 camera position으로 계산하는 로직 */
export const locationToCameraPosition = ({
  x,
  z,
  magnification = DEFAULT_MAGNIFICATION,
}: LocationFunctionParam) => {
  const nx = (x - (z % 2) / 2) * 2 * magnification;
  const nz = z * Math.sqrt(Math.PI) * magnification;
  return {
    nx,
    nz,
  };
};

/** NOTE: camera position을 좌표로 계산하는 로직 */
export const cameraPositionToLocation = ({
  x,
  z,
  magnification = DEFAULT_MAGNIFICATION,
}: LocationFunctionParam) => {
  const angleX = Math.PI ** 2;
  const angleZ = 18;

  const nz = round((z - angleZ) / magnification / Math.sqrt(Math.PI));
  const nx = round((x - angleX) / magnification / 2 + (nz % 2) / 2);
  return {
    nx,
    nz,
  };
};
