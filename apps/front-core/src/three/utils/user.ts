import * as THREE from "three";

export const createUser = (
  scene: THREE.Scene,
  {
    x = 0,
    height = 0,
    z = 0,
    // color,
  }: {
    x: number;
    height: number;
    z: number;
    // color?: THREE.MeshBasicMaterialParameters["color"];
  },
) => {
  const bx = (x - (z % 2) / 2) * 2;
  const by = height;
  const bz = z * Math.sqrt(Math.PI);
  const bodySize = 0.5;
  const floatHeight = 0.1;

  // 몸체
  const bodyGeometry = new THREE.SphereGeometry(bodySize, 32, 32);
  const bodyMaterial = new THREE.MeshToonMaterial({
    color: "#C19A6B",
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.position.set(bx, by + bodySize + floatHeight, bz);
  scene.add(body);

  // 머리
  const headGeometry = new THREE.SphereGeometry(0.7, 32, 32);
  const headMaterial = new THREE.MeshToonMaterial({ color: "#7B4B3A" });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 2; // 머리 위치 조정
  //   scene.add(head);

  // 눈
  const eyeGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const eyeMaterial = new THREE.MeshToonMaterial({ color: "#000000" });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.2, 2.1 + 1, 0.5); // 왼쪽 눈 위치
  rightEye.position.set(0.2, 2.1 + 1, 0.5); // 오른쪽 눈 위치
  //   scene.add(leftEye);
  //   scene.add(rightEye);

  // 코
  const noseGeometry = new THREE.SphereGeometry(0.15, 32, 32);
  const noseMaterial = new THREE.MeshToonMaterial({ color: "#000000" });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0, 2, 0.6); // 코 위치
  //   scene.add(nose);

  // 귀
  const earGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const earMaterial = new THREE.MeshToonMaterial({ color: "#7B4B3A" });
  const leftEar = new THREE.Mesh(earGeometry, earMaterial);
  const rightEar = new THREE.Mesh(earGeometry, earMaterial);
  leftEar.position.set(-0.7, 2.5, 0); // 왼쪽 귀 위치
  rightEar.position.set(0.7, 2.5, 0); // 오른쪽 귀 위치
  //   scene.add(leftEar);
  //   scene.add(rightEar);

  return {
    body,
  };
};
