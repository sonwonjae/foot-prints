import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import {
  cameraPositionToLocation,
  locationToCameraPosition,
} from "@/three/utils/location";

import { userStore } from "../../stores/user";

import {
  CylinderMapStore,
  DefaultCylinderType,
  CylinderMapConstructorParam,
  UpdateCylinderMapParam,
  UpdateCategoryMapParam,
  ArticleMap,
  CylinderLocation,
} from "./ArticleList.type";
import {
  createRenderer,
  easeOutCubic,
  initCamera,
  initControls,
  initLight,
  resize,
} from "./ArticleList.utils";
import { Cylinder } from "./class/cylinder.class";
import { User } from "./class/user.class";

export class CylinderMap<CylinderType extends DefaultCylinderType> {
  /** NOTE: CylinderMap instance state */
  #store: CylinderMapStore<CylinderType> = {
    map: {},
    categoryMap: {},
    cylinderList: [],
    animationMultiThread: [],
  };

  /** NOTE: canvas element */
  $canvas: HTMLCanvasElement;

  /** NOTE: THREE WebGLRenderer */
  #renderer: THREE.WebGLRenderer;

  /** NOTE: requestAnimationFrame에서 return 받은 id 값 */
  #animationFrameId: number = 0;

  /** NOTE: THREE PerspectiveCamera */
  #camera: THREE.PerspectiveCamera;

  /** NOTE: OrbitControls */
  #controls: OrbitControls;

  /** NOTE: THREE Scene */
  #scene: THREE.Scene;

  /** NOTE: THREE Raycaster */
  #raycaster: THREE.Raycaster;

  /** NOTE: THREE Raycaster */
  #pointer: THREE.Vector2;

  /** NOTE: base x 좌표 */
  #bx: number = 0;

  /** NOTE: base z 좌표 */
  #bz: number = 0;

  #prevCameraPosition: Nullable<{ x: number; y: number; z: number }> = null;

  constructor({
    $canvas,
    cylinderList,
    bx,
    bz,
  }: CylinderMapConstructorParam<CylinderType>) {
    /** NOTE: bind method this */
    this.updateState = this.updateState.bind(this);
    this.drawCylinderList = this.drawCylinderList.bind(this);
    this.checkCylinder = this.checkCylinder.bind(this);
    this.updateCylinderMap = this.updateCylinderMap.bind(this);
    this.updateCategoryMap = this.updateCategoryMap.bind(this);
    this.animate = this.animate.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onCylinderEnter = this.onCylinderEnter.bind(this);
    this.onCylinderOut = this.onCylinderOut.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.render = this.render.bind(this);
    this.cancelRender = this.cancelRender.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.moveCameraAnimation = this.moveCameraAnimation.bind(this);
    this.addEvents = this.addEvents.bind(this);
    this.removeEvents = this.removeEvents.bind(this);

    /** NOTE: bind constructor param in property */
    this.$canvas = $canvas;
    this.#store = { ...this.#store, cylinderList };
    this.#bx = bx ?? 0;
    this.#bz = bz ?? 0;

    /** NOTE: create renderer */
    this.#renderer = createRenderer({ $canvas: this.$canvas });

    /** NOTE: create camera * set camera */
    this.#camera = initCamera({ $canvas: this.$canvas });

    /** NOTE: create controls * set controls */
    this.#controls = initControls({
      camera: this.#camera,
      $canvas: this.$canvas,
    });

    /** NOTE: create scene * set scene in camera */
    this.#scene = new THREE.Scene();
    // this.#scene.fog = new THREE.FogExp2("#FFFFFF", 0.02);
    this.#scene.background = new THREE.Color("#FFFFFF");

    this.#camera.lookAt(this.#scene.position);

    /** NOTE: create light * set light in scene */
    initLight({ scene: this.#scene });

    /** NOTE: create raycaster & pointer */
    this.#raycaster = new THREE.Raycaster();
    this.#pointer = new THREE.Vector2();

    /** NOTE: create fill cylinder list */
    this.drawCylinderList();

    /** NOTE: set init target cylinder location  */
    this.moveCameraAnimation({ x: this.#bx, y: 8 * Math.PI, z: this.#bz });

    /** NOTE: create user */
    const user = new User({
      $canvas: this.$canvas,
      camera: this.#camera,
      controls: this.#controls,
      scene: this.#scene,
      raycaster: this.#raycaster,
      pointer: this.#pointer,

      map: this.#store.map,
      location: { x: this.#bx, z: this.#bz },
    });
    userStore.initUser(user);
  }

  /** NOTE: store에 존재하는 state를 업데이트하는 메서드 */
  updateState(newState: Partial<CylinderMapStore<CylinderType>>) {
    this.#store = {
      ...this.#store,
      ...newState,
    };
  }

  /** NOTE: cylinder list를 canvas에 그리는 메서드 */
  drawCylinderList() {
    this.#store.cylinderList.forEach((cylinderInfo) => {
      const { location, category = null, type } = cylinderInfo;
      const { x, z } = location;

      const finalCategory =
        type === "mine-location"
          ? "mine"
          : type === "other-user-location"
            ? "others"
            : category;

      /** NOTE: map의 x.z 좌표에 cylinder가 존재하지 않으면 추가 */
      if (this.#store.map?.[x]?.[z]) {
        return;
      }
      /** FIXME: auth 값 수정 필요 */
      const auth =
        type === "mine-location"
          ? "mine"
          : type === "other-user-location"
            ? "others"
            : "none";

      const cylinder = new Cylinder({
        $canvas: this.$canvas,
        camera: this.#camera,
        scene: this.#scene,
        raycaster: this.#raycaster,
        pointer: this.#pointer,

        auth,
        location: { x, z },
        category: finalCategory,
        views: 0,
      });
      this.updateCylinderMap({ cylinder });

      if (finalCategory) {
        this.updateCategoryMap({ cylinder });
      }
    });
  }

  checkCylinder({ x, z }: CylinderLocation) {
    const { map } = this.#store;

    if (!map[x]?.[z]?.cylinder) {
      return false;
    }

    return map[x][z].cylinder;
  }

  /** NOTE: store에 존재하는 state 중 map의 특정 좌표에 cylinder를 업데이트하는 메서드 */
  updateCylinderMap({ cylinder }: UpdateCylinderMapParam) {
    const { map } = this.#store;
    const { x, z } = cylinder.location;

    if (!map[x]) {
      map[x] = {};
    }
    if (!map[x][z]) {
      map[x][z] = { cylinder };
    }
  }

  /** NOTE: store에 존재하는 state 중 category map의 특정 category에 cylinder를 업데이트하는 메서드 */
  updateCategoryMap({ cylinder }: UpdateCategoryMapParam) {
    if (!cylinder?.category) {
      return;
    }
    const { categoryMap } = this.#store;
    const { category, location } = cylinder;
    const { x, z } = location;
    if (!categoryMap[category]) {
      categoryMap[category] = [];
    }
    if (
      categoryMap[category].find(
        ({
          cylinder: {
            location: { x: ox, z: oz },
          },
        }) => {
          return ox === x && oz === z;
        },
      )
    ) {
      return;
    }
    categoryMap[category].push({ cylinder });
  }

  animate() {
    const { animationMultiThread } = this.#store;

    const newAnimationMultiThread = animationMultiThread
      .filter((animationTask) => {
        const { isKill } = animationTask;
        if (isKill) {
          return false;
        }

        return true;
      })
      .map((animationTask) => {
        const { type, duration, progress } = animationTask;

        const changeRate = 1 / duration / 1 / 60; // Rate of change per frame
        const nextprogress = Math.min(progress + changeRate, 1);

        /** NOTE: 카메라를 움직이는 로직 */
        if (type === "camera-move") {
          const { location, cameraStartLocation, controlsStartLocation } =
            animationTask;
          const { x, y, z } = location;

          const currentCameraX = cameraStartLocation.x;
          const currentCameraZ = cameraStartLocation.z;
          const currentControlsZ = controlsStartLocation.z;
          const currentControlsX = controlsStartLocation.x;

          const { nx, nz } = locationToCameraPosition({ x, z });

          const angleX = Math.PI * 3;
          const angleZ = 6 * Math.PI;

          // /** NOTE: set camera & controls */
          this.#camera.position.set(
            currentCameraX +
              (nx - currentCameraX + angleX) * easeOutCubic(nextprogress),
            y || this.#camera.position.y,
            currentCameraZ +
              (nz - currentCameraZ + angleZ) * easeOutCubic(nextprogress),
          );
          this.#controls.target.set(
            currentControlsX +
              (nx - currentControlsX) * easeOutCubic(nextprogress),
            0,
            currentControlsZ +
              (nz - currentControlsZ) * easeOutCubic(nextprogress),
          );
        }

        return { ...animationTask, progress: nextprogress };
      })
      .filter((animationTask) => {
        const { type, progress, location } = animationTask;
        if (type === "camera-move" && progress >= 1) {
          const cameraMoveEndEvent = new CustomEvent<{
            location: CylinderLocation;
          }>("camera-move-end", {
            detail: { location },
          });
          if (!userStore.user?.getCurrentMoveAnimation()) {
            this.$canvas.dispatchEvent(cameraMoveEndEvent);
          }
        }

        return progress < 1;
      });

    this.updateState({
      animationMultiThread: newAnimationMultiThread,
    });

    Object.values(this.#store.map).forEach((xMap: ArticleMap[number]) => {
      Object.values(xMap).forEach(({ cylinder }) => {
        cylinder.animate();
      });
    });

    userStore.user?.animate();
  }

  onPointerMove(event: PointerEvent) {
    this.#pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.#pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.#raycaster.setFromCamera(this.#pointer, this.#camera);
    const object =
      this.#raycaster.intersectObjects(this.#scene.children, false)?.[0]
        ?.object ?? null;

    if (!object) {
      return;
    }
  }

  onCylinderEnter(event: CustomEvent<{ cylinder: Cylinder }>) {
    const { cylinder } = event.detail;
    const { categoryMap } = this.#store;

    Object.entries(categoryMap).forEach(([category, cylinderList]) => {
      if (!cylinder.category || !category) {
        return;
      }
      if (cylinder.category === category) {
        cylinderList.forEach(({ cylinder }) => {
          cylinder.startUpAnimation();
        });
      }
    });
  }

  onCylinderOut(event: CustomEvent<{ cylinder: Cylinder }>) {
    const { cylinder } = event.detail;
    const { categoryMap } = this.#store;

    Object.entries(categoryMap).forEach(([category, cylinderList]) => {
      if (!cylinder.category || !category) {
        return;
      }

      if (cylinder.category === category) {
        cylinderList.forEach(({ cylinder }) => {
          cylinder.startDownAnimation();
        });
      }
    });
  }

  onPointerUp() {
    if (
      this.#prevCameraPosition &&
      this.#camera.position.distanceTo(this.#prevCameraPosition) > 0.1
    ) {
      /** NOTE: camera position을 좌표로 계산하는 로직 */
      const { nx, nz } = cameraPositionToLocation(this.#camera.position);

      this.moveCameraAnimation({ x: nx, z: nz });
      return;
    }
  }

  /** NOTE: bind to pointerdown event */
  onPointerDown() {
    this.#prevCameraPosition = {
      x: this.#camera.position.x,
      y: this.#camera.position.y,
      z: this.#camera.position.z,
    };
  }

  moveCameraAnimation({ x, y, z }: { x: number; y?: number; z: number }) {
    const { animationMultiThread } = this.#store;

    const hasAnimation = !!animationMultiThread.find(({ type }) => {
      return type === "camera-move";
    });

    if (hasAnimation) {
      const newAnimationMultiThread = animationMultiThread.map(
        (animationTask) => {
          if (animationTask.type === "camera-move") {
            return {
              ...animationTask,
              progress: 0,
              location: { x, y, z },
              cameraStartLocation: {
                x: this.#camera.position.x,
                z: this.#camera.position.z,
              },
              controlsStartLocation: {
                x: this.#controls.target.x,
                z: this.#controls.target.z,
              },
            };
          }
          return animationTask;
        },
      );

      this.updateState({
        animationMultiThread: newAnimationMultiThread,
      });
    } else {
      animationMultiThread.push({
        type: "camera-move",
        /** NOTE: user-move보다 커지면 안됨 */
        duration: 0.5,
        easingFuncionType: "easy-out",
        progress: 0,
        location: { x, y, z },
        cameraStartLocation: {
          x: this.#camera.position.x,
          z: this.#camera.position.z,
        },
        controlsStartLocation: {
          x: this.#controls.target.x,
          z: this.#controls.target.z,
        },
      });
    }
    return;
  }

  /** NOTE: render method */
  render() {
    this.#camera.updateMatrix();
    this.#controls.update();
    resize({
      renderer: this.#renderer,
      camera: this.#camera,
    });

    this.animate();

    this.#renderer.render(this.#scene, this.#camera);

    this.#animationFrameId = requestAnimationFrame(this.render);
  }

  cancelRender() {
    window.cancelAnimationFrame(this.#animationFrameId);
  }

  addEvents() {
    /** NOTE: bind event */
    window.addEventListener("resize", this.render);
    this.$canvas.addEventListener("pointermove", this.onPointerMove);
    this.$canvas.addEventListener("pointerup", this.onPointerUp);
    this.$canvas.addEventListener("pointerdown", this.onPointerDown);

    /** NOTE: bind custom event */
    this.$canvas.addEventListener("cylinder-enter", this.onCylinderEnter);
    this.$canvas.addEventListener("cylinder-out", this.onCylinderOut);

    /** NOTE: bind cylinder event */
    Object.values(this.#store.map).forEach((xMap: ArticleMap[number]) => {
      Object.values(xMap).forEach(({ cylinder }) => {
        cylinder.addCylinderEvents();
      });
    });

    /** NOTE: bind user event */
    userStore.user?.addUserEvents();
  }

  removeEvents() {
    /** NOTE: remove event */
    window.removeEventListener("resize", this.render);
    this.$canvas.removeEventListener("pointermove", this.onPointerMove);
    this.$canvas.removeEventListener("pointerup", this.onPointerUp);
    this.$canvas.removeEventListener("pointerdown", this.onPointerDown);

    /** NOTE: remove custom event */
    this.$canvas.removeEventListener("cylinder-enter", this.onCylinderEnter);
    this.$canvas.removeEventListener("cylinder-out", this.onCylinderOut);

    /** NOTE: remove cylinder event */
    Object.values(this.#store.map).forEach((xMap: ArticleMap[number]) => {
      Object.values(xMap).forEach(({ cylinder }) => {
        cylinder.removeCylinderEvents();
      });
    });

    /** NOTE: remove user event */
    userStore.user?.removeUserEvents();
  }
}
