import type {
  Cateogry,
  CylinderObject,
  CylinderLocation,
} from "@/pages/land/[x]/[y]/[z]/src/components/ArticleList/ArticleList.type";

import * as THREE from "three";

import { easeOutCubic } from "@/pages/land/[x]/[y]/[z]/src/components/ArticleList/ArticleList.utils";
import { convertStringToHexColor } from "@/three/utils/color";

interface CylinderConstructorParam {
  $canvas: HTMLCanvasElement;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;

  auth: "mine" | "others" | "none";
  location: CylinderLocation;
  category: Cateogry;
  views: number;
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
  color: `#${string}${string}${string}`;
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
    views,
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
    this.addCylinderEvents = this.addCylinderEvents.bind(this);
    this.removeCylinderEvents = this.removeCylinderEvents.bind(this);
    this.startUpAnimation = this.startUpAnimation.bind(this);
    this.startDownAnimation = this.startDownAnimation.bind(this);
    this.animate = this.animate.bind(this);

    this.height = (() => {
      switch (true) {
        case auth === "mine":
          /** FIXME: 어느정도 기능 마무리 된 후 mine unit UI 고도화 하기 */
          return 1.2 + views / 100;
        case auth === "others":
          /** FIXME: 어느정도 기능 마무리 된 후 others unit UI 고도화 하기 */
          return 0.8 + views / 100;
        case auth === "none":
        default:
          return 0.4 + views / 100;
      }
    })();
    this.color = (() => {
      switch (true) {
        case this.auth === "mine":
          /** FIXME: 어느정도 기능 마무리 된 후 mine unit UI 고도화 하기 */
          return "#E6E6FA";
        case auth === "others" && !this.category:
          /** FIXME: 어느정도 기능 마무리 된 후 others unit UI 고도화 하기 */
          return "#33FF57";
        case !!this.category:
          return convertStringToHexColor(this.category);
        case auth === "none":
        default:
          return "#FFFFFF";
      }
    })();

    /** NOTE: create cylinder object */
    const geometry = new THREE.CylinderGeometry(1, 1, this.height, 6, 1);

    /** FIXME: color 값 로직 수정 필요 */
    const material = new THREE.MeshToonMaterial({ color: this.color });

    const object = new THREE.Mesh(geometry, material);
    object.receiveShadow = true; // 바닥이 그림자를 받을 수 있도록 설정
    object.position.x = (location.x - (location.z % 2) / 2) * 2;
    object.position.y = this.height / 2;
    object.position.z = location.z * Math.sqrt(Math.PI);
    object.scale.set(1, 1, 1);
    this.#scene.add(object);
    this.object = object;

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

  addCylinderEvents() {
    this.$canvas.addEventListener("pointermove", this.onPointerMove);
    this.$canvas.addEventListener("pointerup", this.onPointerUp);
    this.$canvas.addEventListener("pointerdown", this.onPointerDown);
  }

  removeCylinderEvents() {
    this.$canvas.removeEventListener("pointermove", this.onPointerMove);
    this.$canvas.removeEventListener("pointerup", this.onPointerUp);
    this.$canvas.removeEventListener("pointerdown", this.onPointerDown);
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

        return { ...animationTask, progress: nextprogress };
      })
      .filter((animationTask) => {
        const { type, progress } = animationTask;
        if (type === "cylinder-down") {
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
