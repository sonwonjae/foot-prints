import type {
  Cateogry,
  CylinderObject,
  CylinderLocation,
  LandType,
} from "@/pages/land/[x]/[y]/[z]/src/components/ArticleList/ArticleList.type";

import { random, round } from "es-toolkit";
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

  landType: LandType;
  variation: number;
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

/** FIXME: land로 이름 변경한거 전체 다 적용하기 */
export class Land {
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

  landType: LandType;
  variation: number = 0;

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

    landType,
    variation,
    auth,
    location,
    category,
  }: CylinderConstructorParam) {
    this.$canvas = $canvas;
    this.#camera = camera;
    this.#scene = scene;
    this.#raycaster = raycaster;
    this.#pointer = pointer;
    this.landType = landType;
    this.variation = variation;
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

    this.height = 0.6;
    this.color = (() => {
      switch (this.landType) {
        case "cheer-postbox":
        case "grass":
          return lighter("#A5B78F", 50);
        case "wasteland":
        default:
          return lighter("#CFB9A2", 50);
      }
    })();

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

    const gltfLoader = new GLTFLoader();
    const fbxLoader = new FBXLoader();

    if (this.landType === "fence") {
      const fenceNumber = this.variation;

      fbxLoader.load("/fence/1.fbx", (fbx) => {
        const originFence = fbx.children[0] as THREE.Mesh | undefined;

        if (!originFence) {
          return;
        }
        const DEGREE_ARRAY = [
          [
            {
              degree: 0,
              angle: 0,
              adjustment: {
                x: 0,
                z: 0,
              },
            },
            {
              degree: 180,
              angle: 0,
              adjustment: {
                x: 0,
                z: 0,
              },
            },
          ],
          [
            {
              degree: 0,
              angle: 30,
              adjustment: {
                x: -0.75 * Math.cos(360),
                z: -0.75 * Math.sin(360),
              },
            },
            {
              degree: 180,
              angle: 330,
              adjustment: {
                x: -0.75 * Math.cos(360),
                z: -0.75 * Math.sin(360),
              },
            },
          ],
        ];

        const GROUP_ROTATION_ARRAY = [
          0, 330, 300, 270, 240, 210, 180, 150, 120, 90, 60, 30,
        ];

        const fenceGroup = new THREE.Group();

        for (const { degree, angle, adjustment } of DEGREE_ARRAY[
          fenceNumber % 2
        ]!) {
          const fence = originFence.clone();
          fence.material = new THREE.MeshToonMaterial({
            color: darker("#CFB9A2", -20),
          });
          const angleInRadians = degree * (Math.PI / 180);
          fence.castShadow = true;
          fence.position.x =
            object.geometry.parameters.radiusTop *
            0.35 *
            Math.cos(angleInRadians);
          fence.position.y = object.geometry.parameters.height;
          fence.position.z =
            object.geometry.parameters.radiusTop *
            0.35 *
            Math.sin(angleInRadians);
          fence.scale.set(0.005, 0.005, 0.005);

          fence.position.x = fence.position.x + adjustment.x;
          fence.position.z = fence.position.z + adjustment.z;
          fence.rotation.set(0, Math.PI * 2 * (angle / 360), 0);
          fenceGroup.add(fence);
        }
        fenceGroup.rotation.set(
          0,
          Math.PI * 2 * (GROUP_ROTATION_ARRAY[fenceNumber]! / 360),
          0,
        );
        object.add(fenceGroup);
      });
    }

    if (this.landType === "grass") {
      /** NOTE: 수풀 */
      for (let variation = 1; variation <= 7; variation += 1) {
        fbxLoader.load(`/grass/${variation}.fbx`, (fbx) => {
          const originGrass = fbx.children[0] as THREE.Mesh | undefined;

          if (!originGrass) {
            return;
          }
          originGrass.material = new THREE.MeshToonMaterial({
            color: lighter("#A5B78F", 30),
          });

          const ARRAY = Array.from({ length: round(random(5, 10)) }, () => {
            return {
              radian: random(120, 420) * (Math.PI / 180),
              radius: random(0.2, 0.75),
            };
          });

          for (const { radian, radius } of ARRAY) {
            const grass = originGrass.clone();
            grass.position.x =
              object.geometry.parameters.radiusTop * radius * Math.cos(radian);
            grass.position.y = object.geometry.parameters.height - 0.15;
            grass.position.z =
              object.geometry.parameters.radiusTop * radius * Math.sin(radian);
            grass.scale.set(0.75, 0.75, 0.75);

            object.add(grass);
          }
        });
      }
    }
    if (this.landType === "guest-book") {
      fbxLoader.load("/sign/1.fbx", (fbx) => {
        const sign = fbx.children[0] as THREE.Mesh | undefined;

        if (!sign) {
          return;
        }
        sign.material = new THREE.MeshToonMaterial({
          color: darker("#CFB9A2", -20),
        });

        const angleInRadians = -60 * (Math.PI / 180);

        sign.castShadow = true;
        sign.position.x =
          object.geometry.parameters.radiusTop * 0.5 * Math.cos(angleInRadians);
        sign.position.y = object.geometry.parameters.height + 2.2;
        sign.position.z =
          object.geometry.parameters.radiusTop * 0.5 * Math.sin(angleInRadians);
        sign.scale.set(0.006, 0.006, 0.006);

        object.add(sign);
      });
    }

    if (this.landType === "cheer-postbox") {
      /** NOTE: 수풀 */
      for (let variation = 1; variation <= 7; variation += 1) {
        fbxLoader.load(`/grass/${variation}.fbx`, (fbx) => {
          const originGrass = fbx.children[0] as THREE.Mesh | undefined;

          if (!originGrass) {
            return;
          }
          originGrass.material = new THREE.MeshToonMaterial({
            color: lighter("#A5B78F", 30),
          });

          const ARRAY = Array.from({ length: Math.round(random(3, 7)) }, () => {
            return {
              radian: random(120, 420) * (Math.PI / 180),
              radius: random(0.4, 0.75),
            };
          }).filter(({ radian }) => {
            const min = 240;
            const max = 330;
            return !(
              min < radian / (Math.PI / 180) && radian / (Math.PI / 180) < max
            );
          });

          for (const { radian, radius } of ARRAY) {
            const grass = originGrass.clone();
            grass.position.x =
              object.geometry.parameters.radiusTop * radius * Math.cos(radian);
            grass.position.y = object.geometry.parameters.height - 0.15;
            grass.position.z =
              object.geometry.parameters.radiusTop * radius * Math.sin(radian);
            grass.scale.set(0.75, 0.75, 0.75);

            object.add(grass);
          }
        });
      }

      /** NOTE: tree */
      gltfLoader.load(
        "/tree/base.glb",
        async (gltf) => {
          const tree = gltf.scene;
          // 각도를 라디안으로 변환
          const angleInRadians = -60 * (Math.PI / 180);

          const children =
            (tree.children[0]?.children as Array<THREE.Mesh>) || [];

          const treeTrunk = children[0];
          const leaveBunch1 = children[1];
          const leaveBunch2 = children[2];

          if (treeTrunk?.material) {
            treeTrunk.castShadow = true;
            treeTrunk.material = new THREE.MeshToonMaterial({
              color: darker("#CFB9A2", -20),
            });
          }

          if (leaveBunch1?.material) {
            leaveBunch1.castShadow = true;
            leaveBunch1.material = new THREE.MeshToonMaterial({
              color: lighter("#A5B78F", 30),
            });
          }

          if (leaveBunch2?.material) {
            leaveBunch2.castShadow = true;
            leaveBunch2.material = new THREE.MeshToonMaterial({
              color: lighter("#A5B78F", 30),
            });
          }

          tree.castShadow = true;
          tree.position.x =
            object.geometry.parameters.radiusTop *
            0.5 *
            Math.cos(angleInRadians);
          tree.position.y = object.geometry.parameters.height;
          tree.position.z =
            object.geometry.parameters.radiusTop *
            0.5 *
            Math.sin(angleInRadians);

          tree.scale.set(0.55, 0.55, 0.55);
          tree.rotation.set(0, Math.PI * 2 * (12 / 360), 0);
          object.add(tree);
        },
        undefined,
        (error) => {
          console.error(error);
        },
      );

      /** NOTE: postbox */
      fbxLoader.load(`/postbox/1.fbx`, (fbx) => {
        const postboxGroup = fbx.children[0] as THREE.Group;

        const postboxBody = postboxGroup.children[0] as THREE.Mesh | undefined;
        const postboxStickParts1 = postboxGroup.children[1] as
          | THREE.Mesh
          | undefined;
        const postboxHandleParts1 = postboxGroup.children[2] as
          | THREE.Mesh
          | undefined;
        const postboxHinges = postboxGroup.children[3] as
          | THREE.Mesh
          | undefined;
        const postboxCover = postboxGroup.children[4] as THREE.Mesh | undefined;
        const postboxStickParts2 = postboxGroup.children[5] as
          | THREE.Mesh
          | undefined;
        const postboxStickParts3 = postboxGroup.children[6] as
          | THREE.Mesh
          | undefined;
        const postboxHandle = postboxGroup.children[7] as
          | THREE.Mesh
          | undefined;
        const postboxStickHinges = postboxGroup.children[8] as
          | THREE.Mesh
          | undefined;

        if (
          !postboxBody ||
          !postboxStickParts1 ||
          !postboxHandleParts1 ||
          !postboxHinges ||
          !postboxCover ||
          !postboxStickParts2 ||
          !postboxStickParts3 ||
          !postboxHandle ||
          !postboxStickHinges
        ) {
          return;
        }

        const postboxWhite = darker("#FFFFFF", -25);
        const postboxRed = darker("#FF6347", -10);
        const tree = darker("#CFB9A2", -20);
        const silver = darker("#FFFFFF", -40);

        postboxBody.material = new THREE.MeshToonMaterial({
          color: postboxRed,
        });
        postboxBody.castShadow = true;

        postboxStickParts1.material = new THREE.MeshToonMaterial({
          color: tree,
        });
        postboxStickParts1.castShadow = true;
        postboxStickParts1.scale.set(1, 1.25, 1);

        postboxHandleParts1.material = new THREE.MeshToonMaterial({
          color: silver,
        });

        postboxHinges.material = new THREE.MeshToonMaterial({
          color: silver,
        });

        postboxCover.material = new THREE.MeshToonMaterial({
          color: postboxRed,
        });
        postboxCover.castShadow = true;

        postboxStickParts2.material = new THREE.MeshToonMaterial({
          color: tree,
        });

        postboxStickParts3.material = new THREE.MeshToonMaterial({
          color: tree,
        });

        postboxHandle.material = new THREE.MeshToonMaterial({
          color: postboxWhite,
        });

        postboxStickHinges.material = new THREE.MeshToonMaterial({
          color: silver,
        });

        postboxGroup.castShadow = true;
        postboxGroup.position.y = object.geometry.parameters.height + 1.3;
        postboxGroup.scale.set(0.08, 0.08, 0.08);
        object.add(postboxGroup);
      });
    }

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

    const cylinderOutEvent = new CustomEvent<{ cylinder: Land }>(
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
        const cylinderOutEvent = new CustomEvent<{ cylinder: Land }>(
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
      const cylinderEnterEvent = new CustomEvent<{ cylinder: Land }>(
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

  onCylinderEnter(event: CustomEvent<{ cylinder: Land }>) {
    const { cylinder } = event.detail;
    if (
      cylinder.location.x !== this.location.x ||
      cylinder.location.z !== this.location.z
    ) {
      return;
    }
    this.floatUp();
  }

  onCylinderOut(event: CustomEvent<{ cylinder: Land }>) {
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
