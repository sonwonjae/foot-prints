import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import { convertStringToHexColor, darker } from "@/three/utils/color";
import { createCylinder } from "@/three/utils/cylinder";

import {
  Cylinder,
  CylinderMapStore,
  DefaultCylinderType,
  CylinderMapEvent,
  CylinderMapConstructorParam,
  UpdateCylinderMapParam,
  UpdateCategoryMapParam,
} from "./ArticleList.type";
import {
  createRenderer,
  dispatchCylinderMouseEvent,
  easeInCubic,
  easeOutCubic,
  initCamera,
  initControls,
  initLight,
  resize,
  updateMouseStyle,
} from "./ArticleList.utils";

export class CylinderMap<CylinderType extends DefaultCylinderType> {
  /** NOTE: CylinderMap instance state */
  #store: CylinderMapStore<CylinderType> = {
    currentSelectedCylinder: null,
    currentCategory: null,
    prevHoveredCylinder: null,
    map: {},
    categoryMap: {},
    targetCylinderLocation: null,
    cylinderList: [],
    animationMultiThread: [],
  };

  /** NOTE: bind event handler */
  #event: CylinderMapEvent = {
    onCylinderClick: () => {},
  };

  /** NOTE: canvas element */
  $canvas: HTMLCanvasElement;

  /** NOTE: THREE WebGLRenderer */
  #renderer: THREE.WebGLRenderer;

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

  constructor({
    $canvas,
    cylinderList,
    bx,
    bz,
    onCylinderClick = () => {},
  }: CylinderMapConstructorParam<CylinderType>) {
    /** NOTE: bind method this */
    this.updateState = this.updateState.bind(this);
    this.updateEvent = this.updateEvent.bind(this);
    this.addCylinderInScene = this.addCylinderInScene.bind(this);
    this.drawCylinderList = this.drawCylinderList.bind(this);
    this.updateCylinderMap = this.updateCylinderMap.bind(this);
    this.updateCategoryMap = this.updateCategoryMap.bind(this);
    this.resetTargetCylinder = this.resetTargetCylinder.bind(this);
    this.animate = this.animate.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onCylinderEnter = this.onCylinderEnter.bind(this);
    this.onCylinderOut = this.onCylinderOut.bind(this);
    this.onPointerClick = this.onPointerClick.bind(this);
    this.render = this.render.bind(this);
    this.remove = this.remove.bind(this);

    /** NOTE: bind constructor param in property */
    this.$canvas = $canvas;
    this.#store = { ...this.#store, cylinderList };
    this.#bx = bx ?? 0;
    this.#bz = bz ?? 0;

    /** NOTE: bind constructor param in property */
    this.#event = {
      onCylinderClick,
    };

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
    this.#store.animationMultiThread.push({
      type: "camera-move",
      duration: 1,
      easingFuncionType: "easy-out",
      progress: 0,
      location: { x: this.#bx, z: this.#bz },
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

  /** NOTE: store에 존재하는 state를 업데이트하는 메서드 */
  updateState(newState: Partial<CylinderMapStore<CylinderType>>) {
    this.#store = {
      ...this.#store,
      ...newState,
    };
  }

  /** NOTE: event에 존재하는 handler를 업데이트하는 메서드 */
  updateEvent(newEvent: Partial<CylinderMapEvent>) {
    this.#event = {
      ...this.#event,
      ...newEvent,
    };
  }

  addCylinderInScene({ location, category, height, type }: CylinderType) {
    const { animationMultiThread } = this.#store;
    const { x, z } = location;

    const finalColor = (() => {
      switch (true) {
        case type === "mine-location":
          /** FIXME: 어느정도 기능 마무리 된 후 mine-location unit UI 고도화 하기 */
          return "#E6E6FA";
        case type === "other-user-location" && !category:
          /** FIXME: 어느정도 기능 마무리 된 후 mine-location unit UI 고도화 하기 */
          return "#33FF57";
        case !!category:
          return convertStringToHexColor(category);
        case type === "empty":
        default:
          return "#FFFFFF";
      }
    })();

    const finalHeight = (() => {
      switch (true) {
        case type === "mine-location":
          /** FIXME: 어느정도 기능 마무리 된 후 mine-location unit UI 고도화 하기 */
          return 1.2;
        case type === "other-user-location":
          /** FIXME: 어느정도 기능 마무리 된 후 mine-location unit UI 고도화 하기 */
          return 0.8;
        case type === "empty":
          return 0.4;
        default:
          return height;
      }
    })();

    const minHeight = 0.4;
    const maxHeight = 3;

    const limitedHeight = Math.min(
      maxHeight,
      Math.max(minHeight, finalHeight ?? 0),
    );

    const cylinder = createCylinder(this.#scene, {
      x,
      z,
      color: finalColor,
      height: limitedHeight,
    });

    this.updateCylinderMap({
      cylinder,
      x,
      z,
      color: finalColor,
      category:
        type === "mine-location"
          ? type
          : type === "other-user-location" && !category
            ? type
            : category,
      height: limitedHeight,
    });

    animationMultiThread.push({
      type: "cylinder-create",
      location: { x, z },
      duration: 2,
      progress: 0,
      easingFuncionType: "easy-out",
    });

    if (
      category ||
      type === "mine-location" ||
      (type === "other-user-location" && !category)
    ) {
      this.updateCategoryMap({
        cylinder,
        category: category ?? type,
        x,
        z,
        height: limitedHeight,
      });
    }
  }

  /** NOTE: cylinder list를 canvas에 그리는 메서드 */
  drawCylinderList() {
    // this.#scene.clear();
    this.#store.cylinderList.forEach((cylinderInfo) => {
      const { location } = cylinderInfo;
      const { x, z } = location;

      /** NOTE: map의 x.z 좌표에 cylinder가 존재하지 않으면 추가 */
      if (this.#store.map?.[x]?.[z]?.isExist) {
        return;
      }
      this.addCylinderInScene(cylinderInfo);
    });
  }

  /** NOTE: store에 존재하는 state 중 map의 특정 좌표에 cylinder를 업데이트하는 메서드 */
  updateCylinderMap({
    cylinder,
    x,
    z,
    color,
    category,
    height,
  }: UpdateCylinderMapParam) {
    const { map } = this.#store;

    if (!map[x]) {
      map[x] = {};
    }
    if (!map[x][z]?.isExist) {
      map[x][z] = {
        isExist: true,
        cylinder,
        color,
        category: category ?? null,
        height,
      };
    }
  }

  /** NOTE: store에 존재하는 state 중 category map의 특정 category에 cylinder를 업데이트하는 메서드 */
  updateCategoryMap({
    category,
    x,
    z,
    height,
    cylinder,
  }: UpdateCategoryMapParam) {
    const { categoryMap } = this.#store;
    if (!categoryMap[category]) {
      categoryMap[category] = [];
    }
    if (
      categoryMap[category].find(({ x: ox, z: oz }) => {
        return ox === x && oz === z;
      })
    ) {
      return;
    }
    categoryMap[category].push({ x, z, cylinder, height });
  }

  /** NOTE: target cylinder를 reset하는 메서드 */
  resetTargetCylinder() {
    this.updateState({
      targetCylinderLocation: null,
    });
  }

  animate() {
    const { map, categoryMap, animationMultiThread } = this.#store;

    const newAnimationQueue = animationMultiThread
      .filter((animationTask) => {
        const { type, progress, isKill } = animationTask;
        if (isKill) {
          return false;
        }

        if (type === "cylinder-category-hover") {
          const { direct } = animationTask;
          if (direct === "down") {
            return progress > 0;
          }
        }

        return progress < 1;
      })
      .map((animationTask) => {
        const { type, location, duration, progress, easingFuncionType } =
          animationTask;
        const { x, z } = location;
        if (!map[x]?.[z]) {
          return { ...animationTask, isKill: true };
        }
        const { cylinder } = map[x]![z];

        const changeRate = 1 / duration / 1 / 60; // Rate of change per frame
        const nextprogress = Math.min(progress + changeRate, 1);

        const easingFunction = (() => {
          switch (easingFuncionType) {
            case "easy-in":
              return easeInCubic;
            case "easy-out":
              return easeOutCubic;
            default:
              return () => {
                return progress;
              };
          }
        })();

        if (type === "cylinder-create") {
          cylinder.scale.set(1, easingFunction(progress), 1);
          cylinder.position.y = easingFunction(progress) / 2;
        }

        if (type === "cylinder-category-hover") {
          const { targetCategory, direct } = animationTask;

          Object.entries(categoryMap).forEach(([category, cylinderList]) => {
            if (category !== targetCategory) {
              return;
            }
            cylinderList.forEach(({ cylinder, height }) => {
              const scale = (height + easeOutCubic(progress)) / height;

              cylinder.scale.set(1, scale, 1);
              cylinder.position.y = (height * scale) / 2;

              cylinder.scale.set(1, scale, 1);
              cylinder.position.y = (height * scale) / 2;
            });
          });

          if (direct === "down") {
            const nextprogress = Math.max(progress - changeRate, 0);
            return { ...animationTask, progress: nextprogress };
          }
        }

        if (type === "camera-move") {
          const { location, cameraStartLocation, controlsStartLocation } =
            animationTask;
          const { x, z } = location;

          const currentCameraX = cameraStartLocation.x;
          const currentCameraZ = cameraStartLocation.z;
          const currentControlsZ = controlsStartLocation.z;
          const currentControlsX = controlsStartLocation.x;

          const nx = (x - (z % 2) / 2) * 2;
          const nz = z * Math.sqrt(Math.PI);

          const angleX = Math.PI * 3;
          const angleZ = 6 * Math.PI;

          // /** NOTE: set camera & controls */
          this.#camera.position.set(
            currentCameraX +
              (nx - currentCameraX + angleX) * easeOutCubic(progress),
            8 * Math.PI,
            currentCameraZ +
              (nz - currentCameraZ + angleZ) * easeOutCubic(progress),
          );
          this.#controls.target.set(
            currentControlsX + (nx - currentControlsX) * easeOutCubic(progress),
            0,
            currentControlsZ + (nz - currentControlsZ) * easeOutCubic(progress),
          );
        }

        return { ...animationTask, progress: nextprogress };
      });

    this.updateState({
      animationMultiThread: newAnimationQueue,
    });
  }

  onPointerMove(event: PointerEvent) {
    const { prevHoveredCylinder } = this.#store;

    this.#pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.#pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.#raycaster.setFromCamera(this.#pointer, this.#camera);
    const cylinder = (this.#raycaster.intersectObjects(
      this.#scene.children,
      false,
    )?.[0]?.object ?? null) as Nullable<Cylinder>;

    /** NOTE: set mouse style */
    updateMouseStyle({ $canvas: this.$canvas, cylinder });

    /** NOTE: set cylinder enter & out event */
    dispatchCylinderMouseEvent({
      $canvas: this.$canvas,
      prevHoveredCylinder,
      currentHoveredCylinder: cylinder,
    });

    /** NOTE: update cylinder state */
    this.updateState({
      prevHoveredCylinder: cylinder,
    });
  }

  onCylinderEnter(event: CustomEvent<{ cylinder: Cylinder }>) {
    const { map, animationMultiThread } = this.#store;
    const { cylinder } = event.detail;
    const [x, z] = cylinder.name.split(".").map(Number) as [number, number];
    const cylinderDetail = map[x]![z]!;
    if (!cylinderDetail) {
      return null;
    }

    cylinder.material.color.set(darker(cylinderDetail.color));
    const hasAnimation = animationMultiThread.find(({ type }) => {
      return type === "cylinder-category-hover";
    });

    if (hasAnimation) {
      const newAnimationMultiThread = animationMultiThread.map(
        (animationTask) => {
          if (animationTask.type === "cylinder-category-hover") {
            const { targetCategory } = animationTask;
            if (cylinderDetail.category === targetCategory) {
              return {
                ...animationTask,
                direct: "up" as const,
              };
            } else {
              return {
                ...animationTask,
                direct: "down" as const,
              };
            }
          }

          return animationTask;
        },
      );

      this.updateState({
        animationMultiThread: newAnimationMultiThread,
      });
    } else {
      if (cylinderDetail.category) {
        animationMultiThread.push({
          type: "cylinder-category-hover",
          targetCategory: cylinderDetail.category,
          location: { x, z },
          duration: 1,
          progress: 0,
          direct: "up",
        });
      }
    }

    this.updateState({
      currentCategory: cylinderDetail.category,
    });
  }

  onCylinderOut(event: CustomEvent<{ cylinder: Cylinder }>) {
    const { map, animationMultiThread } = this.#store;
    const { cylinder } = event.detail;
    const [x, z] = cylinder.name.split(".").map(Number) as [number, number];
    const cylinderDetail = map[x]![z]!;

    cylinder.material.color.set(cylinderDetail.color!);

    const hasAnimation = animationMultiThread.find(({ type }) => {
      return type === "cylinder-category-hover";
    });

    if (hasAnimation) {
      const newAnimationMultiThread = animationMultiThread.map(
        (animationTask) => {
          if (animationTask.type === "cylinder-category-hover") {
            return {
              ...animationTask,
              direct: "down" as const,
            };
          }

          return animationTask;
        },
      );

      this.updateState({
        animationMultiThread: newAnimationMultiThread,
      });
    } else {
      if (cylinderDetail.category) {
        animationMultiThread.push({
          type: "cylinder-category-hover",
          targetCategory: cylinderDetail.category,
          location: { x, z },
          duration: 1,
          progress: 1,
          direct: "down",
        });
      }
    }
    this.updateState({
      currentCategory: null,
    });
  }

  onPointerClick() {
    const { map, animationMultiThread } = this.#store;

    this.#raycaster.setFromCamera(this.#pointer, this.#camera);
    const intersects = this.#raycaster.intersectObjects(this.#scene.children);

    if (!intersects[0]) {
      return;
    }

    const cylinder = intersects[0].object as Cylinder;
    const [x, z] = cylinder.name.split(".").map(Number) as [number, number];
    const { category } = map[x]![z]!;

    this.updateState({
      currentSelectedCylinder: cylinder,
    });

    const hasAnimation = animationMultiThread.find(({ type }) => {
      return type === "camera-move";
    });

    if (hasAnimation) {
      const newAnimationMultiThread = animationMultiThread.map(
        (animationTask) => {
          if (animationTask.type === "camera-move") {
            return {
              ...animationTask,
              progress: 0,
              x,
              z,
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
        duration: 1,
        easingFuncionType: "easy-out",
        progress: 0,
        location: { x, z },
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

    if (typeof this.#event.onCylinderClick === "function") {
      this.#event.onCylinderClick({
        object: cylinder,
        location: { x, z },
        category,
      });
    }
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

    requestAnimationFrame(this.render);
  }

  /** NOTE: remove method */
  remove() {
    this.#scene.remove();
  }
}
