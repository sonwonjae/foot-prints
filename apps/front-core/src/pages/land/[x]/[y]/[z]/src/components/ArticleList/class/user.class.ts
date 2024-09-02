import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { v4 as uuidv4 } from "uuid";

import {
  ArticleMap,
  CylinderLocation,
} from "@/pages/land/[x]/[y]/[z]/src/components/ArticleList/ArticleList.type";
import { locationToCameraPosition } from "@/three/utils/location";

import { easeInCubic, easeOutCubic } from "../ArticleList.utils";

/** NOTE: user event type declare */
declare global {
  interface GlobalEventHandlersEventMap {
    "user-fall-end": CustomEvent;
  }
}

type UserObject = THREE.Mesh<
  THREE.SphereGeometry,
  THREE.MeshToonMaterial,
  THREE.Object3DEventMap
>;

interface UserConstructorParam {
  $canvas: HTMLCanvasElement;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  scene: THREE.Scene;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;

  map: ArticleMap;
  location: CylinderLocation;
}

interface UserCreateAnimationTask {
  type: "user-create";
  duration: number;
  progress: number;
  isKill?: boolean;
}
interface UserFallAnimationTask {
  type: "user-fall";
  duration: number;
  progress: number;
  isKill?: boolean;
}
interface UserMoveAnimationTask {
  id: ReturnType<typeof uuidv4>;
  moveBy: "keyboard" | "pointer";
  type: "user-move";
  prevLocation: CylinderLocation;
  nextLocation: CylinderLocation;
  duration: number;
  progress: number;
  isKill?: boolean;
}

type AnimationTask =
  | UserCreateAnimationTask
  | UserFallAnimationTask
  | UserMoveAnimationTask;

/** NOTE: 떠있는 높이 height */
const FLOAT_HEIGHT = 50;

export class User {
  /** NOTE: canvas element */
  $canvas: HTMLCanvasElement;

  /** NOTE: THREE PerspectiveCamera */
  #camera: THREE.PerspectiveCamera;

  /** NOTE: THREE OrbitControls */
  #controls: OrbitControls;

  /** NOTE: THREE Scene */
  #scene: THREE.Scene;

  /** NOTE: THREE Raycaster */
  #raycaster: THREE.Raycaster;

  /** NOTE: THREE Raycaster */
  #pointer: THREE.Vector2;

  /** NOTE: float height */
  #floatHeight = 0.1 as const;

  /** NOTE: user가 모든 애니메이션까지 끝마치고 만들어졌는지 확인하는 boolean */
  isCreated: boolean = false;

  /** NOTE: user가 떠있는지 확인하는 boolean */
  isFloating: boolean = false;

  /** NOTE: user가 이동중인지 확인하는 boolean */
  isMoving: boolean = false;
  #currentMoveAnimationTaskId: Nullable<ReturnType<typeof uuidv4>> = null;

  #map: ArticleMap;

  location: CylinderLocation;

  object: UserObject;

  #animationMultiThread: Array<AnimationTask> = [];

  constructor({
    $canvas,
    camera,
    controls,
    scene,
    raycaster,
    pointer,

    map,
    location,
  }: UserConstructorParam) {
    this.$canvas = $canvas;
    this.#camera = camera;
    this.#controls = controls;
    this.#scene = scene;
    this.#raycaster = raycaster;
    this.#pointer = pointer;
    this.#map = map;
    this.location = location;

    this.onCameraMoveEnd = this.onCameraMoveEnd.bind(this);
    this.move = this.move.bind(this);
    this.getCurrentMoveAnimation = this.getCurrentMoveAnimation.bind(this);
    this.addUserEvents = this.addUserEvents.bind(this);
    this.removeUserEvents = this.removeUserEvents.bind(this);
    this.animate = this.animate.bind(this);
    this.create = this.create.bind(this);

    const bodySize = 0.5;
    // 몸체
    const objectGeometry = new THREE.SphereGeometry(bodySize, 32, 32);
    const objectMaterial = new THREE.MeshToonMaterial({
      color: "#F5F5FF",
    });
    const object = new THREE.Mesh(objectGeometry, objectMaterial);
    /** NOTE: 초기 생성때는 화면에서 안보이는 위치에 생성 */
    object.position.set(9999, 9999, 9999);
    this.#scene.add(object);
    this.object = object;

    this.create(this.location);
  }

  create({ x, z }: CylinderLocation) {
    this.location = { x, z };
    const bx = (x - (z % 2) / 2) * 2;
    /** NOTE: 안착할 cylinder가 없으면 하늘 위에 떠있음 */
    const by = this.#map[x]?.[z]?.cylinder.height ?? FLOAT_HEIGHT;
    const bz = z * Math.sqrt(Math.PI);
    const bodySize = 0.5;

    this.object.castShadow = true;
    this.object.position.set(bx, by + bodySize + this.#floatHeight, bz);

    if (this.#map[x]?.[z]?.cylinder) {
      /** NOTE: 안착할 cylinder가 있으면 등장 애니메이션 push */
      this.#animationMultiThread.push({
        type: "user-create",
        duration: 1.2,
        progress: 0,
      });
      this.isCreated = true;
    } else {
      /** NOTE: 안착할 cylinder가 없으면 controls 사용 불가 */
      this.#controls.enabled = false;
      /** NOTE: 안착할 cylinder가 없으면 떨어지는 애니메이션 push */
      this.#animationMultiThread.push({
        type: "user-fall",
        duration: 3.5,
        progress: 0,
      });
    }
  }

  reload({ x, z }: CylinderLocation) {
    this.#controls.enabled = true;
    this.#animationMultiThread = [];
    this.create({ x, z });
  }

  onCameraMoveEnd({
    detail: { location: nextLocation },
  }: CustomEvent<{ location: CylinderLocation }>) {
    /** NOTE: 유저가 생성되지 않았으면 method 실행 불가 */
    if (!this.isCreated) {
      return;
    }
    console.log("camera-move", nextLocation);
  }

  move(
    nextLocation: CylinderLocation,
    moveBy: UserMoveAnimationTask["moveBy"] = "pointer",
  ) {
    /** NOTE: 유저가 생성되지 않았으면 method 실행 불가 */
    if (!this.isCreated) {
      return;
    }
    if (
      this.location.x === nextLocation.x &&
      this.location.z === nextLocation.z
    ) {
      return;
    }
    const lastMoveAnimationTask = this.#animationMultiThread.findLast(
      (animationTask) => {
        return !!(
          animationTask.type === "user-move" && animationTask.nextLocation
        );
      },
    ) as UserMoveAnimationTask | undefined;

    /** NOTE: 이동 애니메이션 push */
    this.#animationMultiThread.push({
      id: uuidv4(),
      moveBy,
      type: "user-move",
      prevLocation: lastMoveAnimationTask
        ? lastMoveAnimationTask.nextLocation
        : this.location,
      nextLocation,
      /** NOTE: camera-move보다 작아지면 안됨 */
      duration: 0.55,
      progress: 0,
    });
  }

  getCurrentMoveAnimation() {
    return this.#animationMultiThread.find((animationTask) => {
      return !!(
        animationTask.type === "user-move" &&
        animationTask.id === this.#currentMoveAnimationTaskId
      );
    }) as UserCreateAnimationTask | undefined;
  }

  addUserEvents() {
    this.$canvas.addEventListener("camera-move-end", this.onCameraMoveEnd);
  }

  removeUserEvents() {
    this.$canvas.removeEventListener("camera-move-end", this.onCameraMoveEnd);
  }

  animate() {
    if (
      this.#animationMultiThread.filter(({ type }) => {
        return type === "user-create";
      }).length > 1
    ) {
      throw new Error("user는 두 번 이상 만들수 없습니다.");
    }

    const newAnimationMultiThread = this.#animationMultiThread
      .filter(({ isKill }) => {
        return !isKill;
      })
      .map((animationTask, _, animationMultiThread) => {
        const { type, duration, progress } = animationTask;

        const changeRate = 1 / duration / 1 / 60; // Rate of change per frame
        const nextprogress = Math.min(progress + changeRate, 1);

        if (type === "user-fall") {
          this.object.position.y =
            FLOAT_HEIGHT - FLOAT_HEIGHT * easeInCubic(nextprogress) * 3;
          return { ...animationTask, progress: nextprogress };
        }

        if (!this.#map[this.location.x]?.[this.location.z]?.cylinder) {
          return animationTask;
        }

        if (type === "user-create") {
          const magnification =
            this.isFloating &&
            animationMultiThread.find(({ type }) => {
              return type === "user-move";
            })
              ? 5
              : 1;
          const nextprogress = Math.min(
            progress + changeRate * magnification,
            1,
          );
          if (this.isMoving) {
            return animationTask;
          }
          const { x, z } = this.location;
          const { cylinder } = this.#map[x]![z]!;

          const next = easeOutCubic(
            nextprogress < 0.5 ? nextprogress : 1 - nextprogress,
          );

          this.object.position.y =
            cylinder.height * cylinder.object.scale.y + 0.5 + 0.1 + next;

          if (nextprogress >= 1) {
            this.isFloating = false;
            return { ...animationTask, progress: 0 };
          }
          this.isFloating = true;
          return { ...animationTask, progress: nextprogress };
        }

        if (type === "user-move") {
          if (!this.isCreated) {
            return animationTask;
          }
          if (
            this.#currentMoveAnimationTaskId &&
            animationTask.id !== this.#currentMoveAnimationTaskId
          ) {
            return animationTask;
          }
          if (this.isFloating) {
            return animationTask;
          }
          this.isMoving = true;
          this.#currentMoveAnimationTaskId = animationTask.id;

          const { prevLocation, nextLocation } = animationTask;

          if (!this.#map[nextLocation.x]?.[nextLocation.z]?.cylinder) {
            return animationTask;
          }

          const { nx: px, nz: pz } = locationToCameraPosition(prevLocation);
          const { cylinder: prevCylinder } =
            this.#map[prevLocation.x]![prevLocation.z]!;
          const py =
            prevCylinder.height * prevCylinder.object.scale.y + 0.5 + 0.1;

          const { nx, nz } = locationToCameraPosition(nextLocation);
          const { cylinder: nextCylinder } =
            this.#map[nextLocation.x]![nextLocation.z]!;
          const ny =
            nextCylinder.height * nextCylinder.object.scale.y + 0.5 + 0.1;

          this.object.position.x = px + (nx - px) * easeOutCubic(nextprogress);
          this.object.position.y =
            py +
            (ny - py) * easeOutCubic(nextprogress) +
            (easeOutCubic(nextprogress) < 0.5
              ? easeOutCubic(nextprogress) * 3
              : (1 - easeOutCubic(nextprogress)) * 3);
          this.object.position.z = pz + (nz - pz) * easeOutCubic(nextprogress);
        }

        return { ...animationTask, progress: nextprogress };
      })
      .filter((animationTask, index, animationMultiThread) => {
        const { type, progress } = animationTask;

        if (type === "user-fall" && progress >= 1) {
          const userFallEndEvent = new CustomEvent<{
            location: CylinderLocation;
          }>("user-fall-end");
          this.$canvas.dispatchEvent(userFallEndEvent);
        }

        /** NOTE: user가 다 만들어졌으면 this.isCreated 상태 업데이트 */
        if (type === "user-create" && progress >= 1) {
          this.isCreated = true;
        }

        if (type === "user-move" && progress >= 1) {
          const { nextLocation } = animationTask;
          /** NOTE: 위치 변경 */
          this.location = nextLocation;
          this.isMoving = !!animationMultiThread.find(
            (innerAnimationTask, innerIndex) => {
              if (innerIndex <= index) {
                return false;
              }

              return innerAnimationTask.type === "user-move";
            },
          );
          this.#currentMoveAnimationTaskId = null;
        }

        return progress < 1;
      });

    this.#animationMultiThread = newAnimationMultiThread;
  }
}
