import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

import {
  ArticleMap,
  CylinderLocation,
} from "@/pages/land/[x]/[y]/[z]/src/components/ArticleList/ArticleList.type";
import { locationToCameraPosition } from "@/three/utils/location";

import { easeOutCubic } from "../ArticleList.utils";

type UserObject = THREE.Mesh<
  THREE.SphereGeometry,
  THREE.MeshToonMaterial,
  THREE.Object3DEventMap
>;

interface UserConstructorParam {
  $canvas: HTMLCanvasElement;
  camera: THREE.PerspectiveCamera;
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

type AnimationTask = UserCreateAnimationTask | UserMoveAnimationTask;

export class User {
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
    scene,
    raycaster,
    pointer,

    map,
    location,
  }: UserConstructorParam) {
    this.$canvas = $canvas;
    this.#camera = camera;
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

    const { x, z } = this.location;

    /** NOTE: map에 user가 안착할 cylinder가 없으면 return */
    if (!map[x]?.[z]?.cylinder) {
      throw new Error("안착할 cylinder가 업습니다,");
    }

    const bx = (x - (z % 2) / 2) * 2;
    const by = this.#map[x]![z]!.cylinder.height;
    const bz = z * Math.sqrt(Math.PI);
    const bodySize = 0.5;

    // 몸체
    const objectGeometry = new THREE.SphereGeometry(bodySize, 32, 32);
    const objectMaterial = new THREE.MeshToonMaterial({
      color: "#F5F5FF",
    });
    const object = new THREE.Mesh(objectGeometry, objectMaterial);
    object.castShadow = true;
    object.position.set(bx, by + bodySize + this.#floatHeight, bz);
    this.#scene.add(object);
    this.object = object;

    /** NOTE: 등장 애니메이션 push */
    this.#animationMultiThread.push({
      type: "user-create",
      duration: 2.4,
      progress: 0,
    });
  }

  onCameraMoveEnd({
    detail: { location: nextLocation },
  }: CustomEvent<{ location: CylinderLocation }>) {
    console.log("camera-move", nextLocation);
  }

  move(
    nextLocation: CylinderLocation,
    moveBy: UserMoveAnimationTask["moveBy"] = "pointer",
  ) {
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
    const newAnimationMultiThread = this.#animationMultiThread
      .filter(({ type, isKill }) => {
        /** NOTE: 이미 cylinder가 만들어져 있으면 kill */
        if (type === "user-create" && this.isCreated) {
          return false;
        }

        return !isKill;
      })
      .map((animationTask, _, animationMultiThread) => {
        const { type, duration, progress } = animationTask;

        if (!this.#map[this.location.x]?.[this.location.z]?.cylinder) {
          return animationTask;
        }

        const changeRate = 1 / duration / 1 / 60; // Rate of change per frame
        const nextprogress = Math.min(progress + changeRate, 1);

        if (type === "user-create") {
          const magnification =
            this.isFloating &&
            animationMultiThread.find(({ type }) => {
              return type === "user-move";
            })
              ? 10
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
