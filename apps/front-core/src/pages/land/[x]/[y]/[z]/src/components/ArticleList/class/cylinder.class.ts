import type {
  Cateogry,
  CylinderObject,
  CylinderLocation,
} from "@/pages/land/[x]/[y]/[z]/src/components/ArticleList/ArticleList.type";

import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import {
  easeInCubic,
  easeOutCubic,
} from "@/pages/land/[x]/[y]/[z]/src/components/ArticleList/ArticleList.utils";
import { darker, lighter } from "@/three/utils/color";
import {
  DEFAULT_MAGNIFICATION,
  locationToCameraPosition,
} from "@/three/utils/location";

interface CylinderConstructorParam {
  $canvas: HTMLCanvasElement;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;

  auth: "mine" | "others" | "none";
  location: CylinderLocation;
  category: Cateogry;
}

type AnimationTask =
  | {
      type: "cylinder-create";
      duration: number;
      progress: number;
      isKill?: boolean;
    }
  | {
      type: "cylinder-up";
      duration: number;
      progress: number;
      isKill?: boolean;
    }
  | {
      type: "cylinder-down";
      duration: number;
      progress: number;
      isKill?: boolean;
    }
  | {
      type: "cylinder-float-up";
      duration: number;
      progress: number;
      isKill?: boolean;
    }
  | {
      type: "cylinder-float-down";
      duration: number;
      progress: number;
      isKill?: boolean;
    };

export class Cylinder {
  /** NOTE: canvas element */
  $canvas: HTMLCanvasElement;

  /** NOTE: THREE PerspectiveCamera */
  #camera: THREE.PerspectiveCamera;

  /** NOTE: THREE Scene */
  #scene: THREE.Scene;

  /** NOTE: THREE Raycaster */
  #raycaster: THREE.Raycaster;

  /** NOTE: THREE Raycaster */
  #pointer: THREE.Vector2;

  /** NOTE: cylinder가 모든 애니메이션까지 끝마치고 만들어졌는지 확인하는 boolean */
  #isCreated: boolean = false;

  /** NOTE: mouse가 cylinder에 enter인지 out인지 hover하고 있지 않은지 상태를 관리하는 state */
  #enterState: "enter" | "out" | null = null;

  #prevCameraPosition: Nullable<{ x: number; y: number; z: number }> = null;

  #animationMultiThread: Array<AnimationTask> = [];

  object: CylinderObject;
  height: number;
  color: `#${string}`;
  category: Cateogry = null;
  auth: "mine" | "others" | "none";
  location: CylinderLocation;

  constructor({
    $canvas,
    camera,
    scene,
    raycaster,
    pointer,

    auth,
    location,
    category,
  }: CylinderConstructorParam) {
    this.$canvas = $canvas;
    this.#camera = camera;
    this.#scene = scene;
    this.#raycaster = raycaster;
    this.#pointer = pointer;
    this.auth = auth;
    this.category = category;
    this.location = location;

    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onCylinderEnter = this.onCylinderEnter.bind(this);
    this.floatUp = this.floatUp.bind(this);
    this.floatDown = this.floatDown.bind(this);
    this.onCylinderOut = this.onCylinderOut.bind(this);
    this.addCylinderEvents = this.addCylinderEvents.bind(this);
    this.removeCylinderEvents = this.removeCylinderEvents.bind(this);
    this.startUpAnimation = this.startUpAnimation.bind(this);
    this.startDownAnimation = this.startDownAnimation.bind(this);
    this.animate = this.animate.bind(this);

    this.height = 0.3;
    this.color = lighter("#96BF00", 50);

    /** NOTE: create cylinder object */
    const geometry = new THREE.CylinderGeometry(
      1 * DEFAULT_MAGNIFICATION + 0.05 * DEFAULT_MAGNIFICATION,
      1 * DEFAULT_MAGNIFICATION + 0.05 * DEFAULT_MAGNIFICATION,
      this.height,
      6,
      1,
    );

    /** FIXME: color 값 로직 수정 필요 */
    const material = new THREE.MeshToonMaterial({
      color: this.color,
    });

    const object = new THREE.Mesh(geometry, material);
    const { nx, nz } = locationToCameraPosition(location);

    object.receiveShadow = true; // 바닥이 그림자를 받을 수 있도록 설정
    object.position.x = nx;
    object.position.y = this.height / 2;
    object.position.z = nz;
    object.scale.set(1, 1, 1);
    object.castShadow = true;
    this.#scene.add(object);
    this.object = object;

    /** FIXME: 구조물 테스트임 */
    const gltfLoader = new GLTFLoader();

    /** NOTE: tree */
    gltfLoader.load(
      "/tree/base.glb",
      async (gltf) => {
        // 각도를 라디안으로 변환
        const angleInRadians = -60 * (Math.PI / 180);

        gltf.scene.castShadow = true;
        gltf.scene.position.x =
          object.geometry.parameters.radiusTop * 0.5 * Math.cos(angleInRadians);
        gltf.scene.position.y = object.geometry.parameters.height;
        gltf.scene.position.z =
          object.geometry.parameters.radiusTop * 0.5 * Math.sin(angleInRadians);

        const children =
          (gltf.scene.children[0]?.children as Array<THREE.Mesh>) || [];

        const treeTrunk = children[0];
        const leaveBunch1 = children[1];
        const leaveBunch2 = children[2];

        if (treeTrunk?.material) {
          treeTrunk.material = new THREE.MeshToonMaterial({
            color: lighter("#8B4513"),
          });
        }

        if (leaveBunch1?.material) {
          leaveBunch1.material = new THREE.MeshToonMaterial({
            color: lighter("#96BF00", 30),
          });
        }

        if (leaveBunch2?.material) {
          leaveBunch2.material = new THREE.MeshToonMaterial({
            color: lighter("#96BF00", 30),
          });
        }

        gltf.scene.position.y = object.geometry.parameters.height;
        gltf.scene.scale.set(0.25, 0.25, 0.25);
        object.add(gltf.scene);
      },
      undefined,
      (error) => {
        console.error(error);
      },
    );
    const baseAngleInRadians = -60 * (Math.PI / 180);

    const fbxLoader = new FBXLoader();

    /** NOTE: flat한 rock */
    fbxLoader.load("/rock/flat_1.fbx", (fbx) => {
      // 각도를 라디안으로 변환

      const flatRock = fbx.children[0] as THREE.Mesh | undefined;

      if (!flatRock) {
        return;
      }

      flatRock.castShadow = true;
      flatRock.position.x =
        object.geometry.parameters.radiusTop *
        0.25 *
        Math.cos(baseAngleInRadians);
      flatRock.position.y = object.geometry.parameters.height - 0.125;
      flatRock.position.z =
        object.geometry.parameters.radiusTop *
        0.25 *
        Math.sin(baseAngleInRadians);

      flatRock.scale.set(0.0025, 0.0025, 0.0025);

      flatRock.material = new THREE.MeshToonMaterial({
        color: lighter("#8B4513", 99),
      });

      object.add(flatRock);
    });

    fbxLoader.load("/rock/small_1.fbx", (fbx) => {
      // 각도를 라디안으로 변환

      const smallRock = fbx.children[0] as THREE.Mesh | undefined;

      if (!smallRock) {
        return;
      }

      const count = 6;
      for (let i = 1; i <= count; i += 1) {
        const clonedSmallRock = smallRock.clone();

        const angleInRadians = i * (360 / count) * (Math.PI / 180);
        const bx =
          object.geometry.parameters.radiusTop *
          0.25 *
          Math.cos(baseAngleInRadians);
        const bz =
          object.geometry.parameters.radiusTop *
          0.25 *
          Math.sin(baseAngleInRadians);

        const radius = 0.4;

        const fx = bx + radius * Math.cos(angleInRadians);
        const fz = bz + radius * Math.sin(angleInRadians);

        clonedSmallRock.castShadow = true;
        clonedSmallRock.position.x = fx;
        clonedSmallRock.position.y = object.geometry.parameters.height;
        clonedSmallRock.position.z = fz;

        clonedSmallRock.scale.set(0.0025, 0.0025, 0.0025);

        clonedSmallRock.material = new THREE.MeshToonMaterial({
          color: lighter("#8B4513", 90),
        });

        object.add(clonedSmallRock);
      }
    });

    /** NOTE: capsule */
    const radius = 3;
    const length = 8;
    const segment = 6;
    const capsule = new THREE.Group();

    const capsuleTop = new THREE.Mesh(
      new THREE.SphereGeometry(
        radius,
        segment,
        360,
        0,
        Math.PI * 2,
        Math.PI / 2,
        Math.PI,
      ),
      new THREE.MeshToonMaterial({
        color: lighter("#A4C8E1", 50),
      }),
    );
    capsuleTop.position.y = -(length / 2);

    const capsuleTopBody = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius,
        radius,
        length / 2,
        segment,
        segment,
        true,
      ),

      new THREE.MeshToonMaterial({
        color: lighter("#A4C8E1", 50),
      }),
    );
    capsuleTopBody.position.y = -((length / 4) * 2) + length / 4;

    const capsuleBottom = new THREE.Mesh(
      new THREE.SphereGeometry(
        radius,
        segment,
        360,
        0,
        Math.PI * 2,
        Math.PI + Math.PI / 2,
        Math.PI,
      ),
      new THREE.MeshToonMaterial({
        color: lighter("#FF0000", 50),
      }),
    );
    capsuleBottom.position.y = length / 2;
    const capsuleBottonBody = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius,
        radius,
        length / 2,
        segment,
        segment,
        true,
      ),

      new THREE.MeshToonMaterial({
        color: lighter("#FF0000", 50),
      }),
    );
    capsuleBottonBody.position.y = (length / 4) * 2 - length / 4;

    capsule.add(capsuleTop);
    capsule.add(capsuleTopBody);
    capsule.add(capsuleBottom);
    capsule.add(capsuleBottonBody);

    capsule.castShadow = true;
    capsule.position.x =
      object.geometry.parameters.radiusTop *
      0.25 *
      Math.cos(baseAngleInRadians);
    capsule.position.y = object.geometry.parameters.height;
    capsule.position.z =
      object.geometry.parameters.radiusTop *
      0.25 *
      Math.sin(baseAngleInRadians);

    capsule.rotateX(15);

    capsule.scale.set(0.065, 0.065, 0.065);

    object.add(capsule);

    /** NOTE: 등장 애니메이션 push */
    this.#animationMultiThread.push({
      type: "cylinder-create",
      duration: 0.5,
      progress: 0,
    });
  }

  onPointerUp() {
    /** NOTE: 클릭이 아닌 드래그 중이라는 뜻 */
    if (
      this.#prevCameraPosition &&
      this.#camera.position.distanceTo(this.#prevCameraPosition) > 0.1
    ) {
      return;
    }

    const object =
      this.#raycaster.intersectObjects(this.#scene.children, false)?.[0]
        ?.object ?? null;
    if (!object || object.id !== this.object.id) {
      return;
    }

    const cylinderOutEvent = new CustomEvent<{ cylinder: Cylinder }>(
      "cylinder-click",
      {
        detail: { cylinder: this },
      },
    );
    this.$canvas.dispatchEvent(cylinderOutEvent);
  }

  onPointerDown() {
    this.#prevCameraPosition = {
      x: this.#camera.position.x,
      y: this.#camera.position.y,
      z: this.#camera.position.z,
    };
  }

  onPointerMove(event: PointerEvent) {
    this.#pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.#pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.#raycaster.setFromCamera(this.#pointer, this.#camera);
    const object =
      this.#raycaster.intersectObjects(this.#scene.children, false)?.[0]
        ?.object ?? null;

    /** NOTE: set mouse style */
    this.$canvas.style.cursor = object ? "pointer" : "default";
    if (!object || object.id !== this.object.id) {
      if (this.#enterState === "out") {
        this.#enterState = null;
        return;
      }

      if (this.#enterState === "enter") {
        const cylinderOutEvent = new CustomEvent<{ cylinder: Cylinder }>(
          "cylinder-out",
          {
            detail: { cylinder: this },
          },
        );
        this.$canvas.dispatchEvent(cylinderOutEvent);
        this.#enterState = "out";
        return;
      }
      return;
    }

    if (this.#enterState === "enter") {
      return;
    }
    if (this.#enterState === "out" || this.#enterState === null) {
      const cylinderEnterEvent = new CustomEvent<{ cylinder: Cylinder }>(
        "cylinder-enter",
        {
          detail: { cylinder: this },
        },
      );
      this.$canvas.dispatchEvent(cylinderEnterEvent);
      this.#enterState = "enter";
      return;
    }
  }

  floatUp() {
    const hasFloatUpAnimation = !!this.#animationMultiThread.find(
      ({ type }) => {
        return type === "cylinder-float-up";
      },
    );

    if (hasFloatUpAnimation) {
      return;
    }

    let currentProgress = 0;

    const newAnimationMultiThread = this.#animationMultiThread.filter(
      (animationTask) => {
        if (animationTask.type === "cylinder-float-down") {
          const { progress } = animationTask;
          currentProgress = progress;
        }
        return animationTask.type !== "cylinder-float-down";
      },
    );
    this.#animationMultiThread = newAnimationMultiThread;

    this.#animationMultiThread.push({
      type: "cylinder-float-up",
      duration: 0.5,
      progress: currentProgress,
    });
  }
  floatDown() {
    const hasFloatDownAnimation = !!this.#animationMultiThread.find(
      ({ type }) => {
        return type === "cylinder-float-down";
      },
    );

    if (hasFloatDownAnimation) {
      return;
    }

    let currentProgress = 1;

    const newAnimationMultiThread = this.#animationMultiThread.filter(
      (animationTask) => {
        if (animationTask.type === "cylinder-float-up") {
          const { progress } = animationTask;
          currentProgress = progress;
        }
        return animationTask.type !== "cylinder-float-up";
      },
    );
    this.#animationMultiThread = newAnimationMultiThread;

    this.#animationMultiThread.push({
      type: "cylinder-float-down",
      duration: 1,
      progress: currentProgress,
    });
  }

  onCylinderEnter(event: CustomEvent<{ cylinder: Cylinder }>) {
    const { cylinder } = event.detail;
    if (
      cylinder.location.x !== this.location.x ||
      cylinder.location.z !== this.location.z
    ) {
      return;
    }
    this.floatUp();
  }

  onCylinderOut(event: CustomEvent<{ cylinder: Cylinder }>) {
    const { cylinder } = event.detail;
    if (
      cylinder.location.x !== this.location.x ||
      cylinder.location.z !== this.location.z
    ) {
      return;
    }
    this.floatDown();
  }

  addCylinderEvents() {
    this.$canvas.addEventListener("pointermove", this.onPointerMove);
    this.$canvas.addEventListener("pointerup", this.onPointerUp);
    this.$canvas.addEventListener("pointerdown", this.onPointerDown);
    this.$canvas.addEventListener("cylinder-enter", this.onCylinderEnter);
    this.$canvas.addEventListener("cylinder-out", this.onCylinderOut);
  }

  removeCylinderEvents() {
    this.$canvas.removeEventListener("pointermove", this.onPointerMove);
    this.$canvas.removeEventListener("pointerup", this.onPointerUp);
    this.$canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.$canvas.removeEventListener("cylinder-enter", this.onCylinderEnter);
    this.$canvas.removeEventListener("cylinder-out", this.onCylinderOut);
  }

  startUpAnimation() {
    const hasUpAnimation = this.#animationMultiThread.find(({ type }) => {
      return type === "cylinder-up";
    });
    if (hasUpAnimation) {
      return;
    }

    const hasDownAnimation = this.#animationMultiThread.find(({ type }) => {
      return type === "cylinder-down";
    });

    if (hasDownAnimation) {
      const newAnimationMultiThread = this.#animationMultiThread.map(
        (animationTask) => {
          if (animationTask.type === "cylinder-down") {
            return {
              ...animationTask,
              type: "cylinder-up" as const,
            };
          }

          return animationTask;
        },
      );
      this.#animationMultiThread = newAnimationMultiThread;
      return;
    }
    this.#animationMultiThread.push({
      type: "cylinder-up",
      duration: 1,
      progress: 0,
    });
  }

  startDownAnimation() {
    const hasDownAnimation = this.#animationMultiThread.find(({ type }) => {
      return type === "cylinder-down";
    });

    if (hasDownAnimation) {
      return;
    }
    const hasUpAnimation = this.#animationMultiThread.find(({ type }) => {
      return type === "cylinder-up";
    });

    if (hasUpAnimation) {
      const newAnimationMultiThread = this.#animationMultiThread.map(
        (animationTask) => {
          if (animationTask.type === "cylinder-up") {
            return {
              ...animationTask,
              type: "cylinder-down" as const,
            };
          }

          return animationTask;
        },
      );
      this.#animationMultiThread = newAnimationMultiThread;
      return;
    }

    this.#animationMultiThread.push({
      type: "cylinder-down",
      duration: 1,
      progress: 1,
    });
  }

  animate() {
    const newAnimationMultiThread = this.#animationMultiThread
      .filter(({ type, isKill }) => {
        /** NOTE: 이미 cylinder가 만들어져 있으면 kill */
        if (type === "cylinder-create" && this.#isCreated) {
          return false;
        }
        return !isKill;
      })
      .map((animationTask) => {
        const { type, duration, progress } = animationTask;
        const changeRate = 1 / duration / 1 / 60; // Rate of change per frame
        const nextprogress = Math.min(progress + changeRate, 1);
        /** NOTE: cylinder 만들때 애니메이션 로직 */
        if (type === "cylinder-create") {
          const height =
            (this.object.geometry.parameters.height *
              easeOutCubic(nextprogress)) /
            2;
          this.object.scale.set(1, easeOutCubic(nextprogress), 1);
          this.object.position.y = height;
        }
        /** NOTE: cylinder를 up 시키는 로직 */
        if (type === "cylinder-up") {
          const nextprogress = Math.min(progress + changeRate, 1);
          const scale = (1 + easeOutCubic(nextprogress)) / 1;
          this.object.scale.set(1, scale, 1);
          this.object.position.y = (this.height * scale) / 2;
        }
        /** NOTE: cylinder를 down 시키는 로직 */
        if (type === "cylinder-down") {
          const nextprogress = Math.max(progress - changeRate, 0);
          const scale = (1 + easeOutCubic(nextprogress)) / 1;
          this.object.scale.set(1, scale, 1);
          this.object.position.y = (this.height * scale) / 2;
          return { ...animationTask, progress: nextprogress };
        }
        /** NOTE: cylinder를 float 시키는 로직 */
        if (type === "cylinder-float-up") {
          const nextprogress = Math.min(progress + changeRate, 1);
          this.object.position.y =
            this.height / 2 + easeInCubic(nextprogress) / 2;
          this.object.material.color.set(
            darker(this.color, -30 * nextprogress),
          );
          return { ...animationTask, progress: nextprogress };
        }
        /** NOTE: cylinder를 float 시키는 로직 */
        if (type === "cylinder-float-down") {
          const nextprogress = Math.max(progress - changeRate, 0);
          this.object.position.y =
            this.height / 2 + easeInCubic(nextprogress) / 2;
          this.object.material.color.set(
            darker(this.color, -30 * nextprogress),
          );
          return { ...animationTask, progress: nextprogress };
        }
        return { ...animationTask, progress: nextprogress };
      })
      .filter((animationTask) => {
        const { type, progress } = animationTask;
        if (type === "cylinder-down" || type === "cylinder-float-down") {
          return progress > 0;
        }
        /** NOTE: cylinder가 다 만들어졌으면 this.#isCreated 상태 업데이트 */
        if (type === "cylinder-create" && progress >= 1) {
          this.#isCreated = true;
        }
        return progress < 1;
      });
    this.#animationMultiThread = newAnimationMultiThread;
  }
}
