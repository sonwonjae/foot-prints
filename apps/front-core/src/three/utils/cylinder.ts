import * as THREE from "three";

export const createCylinder = (
  scene: THREE.Scene,
  {
    x = 0,
    z = 0,
    radiusTop = 1,
    radiusBottom = 1,
    height,
    radialSegments = 6,
    color,
  }: {
    x?: number;
    z?: number;
    radiusTop?: number;
    radiusBottom?: number;
    height: number;
    radialSegments?: number;
    color?: THREE.MeshBasicMaterialParameters["color"];
  },
) => {
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    1,
  );

  const material = new THREE.MeshToonMaterial({
    color,
  });

  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.x = (x - (z % 2) / 2) * 2;
  cylinder.position.y = height / 2;
  cylinder.position.z = z * Math.sqrt(Math.PI);
  cylinder.scale.set(1, 0, 1);

  cylinder.name = `${x}.${z}`;

  scene.add(cylinder);

  return cylinder;
};
