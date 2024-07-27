import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import { convertStringToHexColor, darker } from "@/three/utils/color";
import { createCylinder } from "@/three/utils/cylinder";

import { AROUND_DIRECT } from "./Canvas.constants";
import { Cylinder, Nullable, CheckMap, CategoryMap } from "./Canvas.type";
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
} from "./Canvas.utils";

declare global {
  interface GlobalEventHandlersEventMap {
    "cylinder-enter": CustomEvent<{ cylinder: Cylinder }>;
    "cylinder-out": CustomEvent<{ cylinder: Cylinder }>;
  }
}

interface CylinderMapStore {
  currentSelectedCylinder: Nullable<Cylinder>;
  currentCategory: Nullable<string>;
  prevHoveredCylinder: Nullable<Cylinder>;
  map: CheckMap;
  categoryMap: CategoryMap;
  targetCylinderLocation: Nullable<{
    x: number;
    z: number;
    progress: number;
    cameraStartLocation: { x: number; z: number };
    controlsStartLocation: { x: number; z: number };
  }>;
}

interface CylinderMapConstructorParam<CylinderType> {
  $canvas: HTMLCanvasElement;
  cylinderList: Array<CylinderType>;
  bx?: number;
  bz?: number;
}

interface DefaultCylinderTyp {
  location: { x: number; z: number };
  category?: string;
  height: number;
}

export class CylinderMap<CylinderType extends DefaultCylinderTyp> {
  /** CylinderMap instance state */
  #store: CylinderMapStore = {
    currentSelectedCylinder: null,
    currentCategory: null,
    prevHoveredCylinder: null,
    map: {},
    categoryMap: {},
    targetCylinderLocation: null,
  };

  /** canvas element */
  $canvas: HTMLCanvasElement;

  cylinderList: Array<CylinderType>;

  /** THREE WebGLRenderer */
  #renderer: THREE.WebGLRenderer;

  /** THREE PerspectiveCamera */
  #camera: THREE.PerspectiveCamera;

  /** OrbitControls */
  #controls: OrbitControls;

  /** THREE Scene */
  #scene: THREE.Scene;

  /** THREE Raycaster */
  #raycaster: THREE.Raycaster;

  /** THREE Raycaster */
  #pointer: THREE.Vector2;

  /** base x 좌표 */
  #bx: number = 0;

  /** base z 좌표 */
  #bz: number = 0;

  constructor({
    $canvas,
    cylinderList,
    bx,
    bz,
  }: CylinderMapConstructorParam<CylinderType>) {
    /** NOTE: bind method this */
    this.updateState = this.updateState.bind(this);
    this.updateCylinderMap = this.updateCylinderMap.bind(this);
    this.updateCategoryMap = this.updateCategoryMap.bind(this);
    this.updateTargetCylinder = this.updateTargetCylinder.bind(this);
    this.resetTargetCylinder = this.resetTargetCylinder.bind(this);
    this.createEmptyCylinder = this.createEmptyCylinder.bind(this);
    this.createEmptyCylinderAround = this.createEmptyCylinderAround.bind(this);
    this.animateCategoryCylinderList =
      this.animateCategoryCylinderList.bind(this);
    this.animateMoveToTargetCylinder =
      this.animateMoveToTargetCylinder.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onCylinderEnter = this.onCylinderEnter.bind(this);
    this.onCylinderOut = this.onCylinderOut.bind(this);
    this.onPointerClick = this.onPointerClick.bind(this);
    this.render = this.render.bind(this);
    this.remove = this.remove.bind(this);

    /** NOTE: bind constructor param in property */
    this.$canvas = $canvas;
    this.cylinderList = cylinderList;
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
    this.#camera.lookAt(this.#scene.position);

    /** NOTE: create light * set light in scene */
    initLight({ scene: this.#scene });

    /** create raycaster & pointer */
    this.#raycaster = new THREE.Raycaster();
    this.#pointer = new THREE.Vector2();

    /** create fill cylinder list */
    cylinderList.forEach(
      ({ location = { x: 0, z: 0 }, category = "", height }) => {
        const { x, z } = location;
        const nx = this.#bx + x;
        const nz = this.#bz + z;
        const color = convertStringToHexColor(category);
        const minHeight = 0.4;
        const maxHeight = 3;
        const limitedHeight = Math.min(maxHeight, Math.max(minHeight, height));

        const cylinder = createCylinder(this.#scene, {
          x: nx,
          z: nz,
          color,
          height: limitedHeight,
        });

        this.updateCylinderMap({
          cylinder,
          x: nx,
          z: nz,
          color,
          category,
        });
        this.updateCategoryMap({
          cylinder,
          category,
          x: nx,
          z: nz,
          height: limitedHeight,
        });
      },
    );

    /** create empty cylinder list */
    cylinderList.forEach(({ location = { x: 0, z: 0 } }) => {
      const { x, z } = location;
      const nx = this.#bx + x;
      const nz = this.#bz + z;
      this.createEmptyCylinderAround({ x: nx, z: nz, length: 2 });
    });

    /** NOTE: set init target cylinder location  */
    this.updateTargetCylinder({
      x: this.#bx,
      z: this.#bz,
    });
  }

  /** store에 존재하는 state를 업데이트하는 메서드 */
  updateState(newState: Partial<CylinderMapStore>) {
    this.#store = {
      ...this.#store,
      ...newState,
    };
  }

  /** store에 존재하는 state 중 map의 특정 좌표에 cylinder를 업데이트하는 메서드 */
  updateCylinderMap({
    cylinder,
    x,
    z,
    color,
    category,
  }: {
    cylinder: Cylinder;
    x: number;
    z: number;
    color: `#${string}`;
    category?: string;
  }) {
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
      };
    }
  }

  /** store에 존재하는 state 중 category map의 특정 category에 cylinder를 업데이트하는 메서드 */
  updateCategoryMap({
    category,
    x,
    z,
    height,
    cylinder,
  }: {
    category: string;
    x: number;
    z: number;
    height: number;
    cylinder: Cylinder;
  }) {
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
    categoryMap[category].push({ x, z, cylinder, height, progress: 0 });
  }

  /** NOTE: target cylinder의 좌표를 progress와 함께 없데이트하는 메서드 */
  updateTargetCylinder({
    x,
    z,
    progress = 0,
    cameraStartLocation,
    controlsStartLocation,
  }: {
    x: number;
    z: number;
    progress?: number;
    cameraStartLocation?: { x: number; z: number };
    controlsStartLocation?: { x: number; z: number };
  }) {
    const { targetCylinderLocation } = this.#store;

    const finalCameraStartLocation = cameraStartLocation ??
      targetCylinderLocation?.cameraStartLocation ?? {
        x: this.#camera.position.x,
        z: this.#camera.position.z,
      };

    const finalControlsStartLocation = controlsStartLocation ??
      targetCylinderLocation?.controlsStartLocation ?? {
        x: this.#controls.target.x,
        z: this.#controls.target.z,
      };

    this.updateState({
      targetCylinderLocation: {
        x,
        z,
        progress,
        cameraStartLocation: finalCameraStartLocation,
        controlsStartLocation: finalControlsStartLocation,
      },
    });
  }

  /** NOTE: target cylinder를 reset하는 메서드 */
  resetTargetCylinder() {
    this.updateState({
      targetCylinderLocation: null,
    });
  }

  /** 파라미터로 전달받은 x, z 좌표에 empty cylinder 하나 만드는 method */
  createEmptyCylinder({ x, z }: { x: number; z: number }) {
    const { map } = this.#store;

    if (!map[x]) {
      map[x] = {};
    }
    if (!map[x][z]?.isExist) {
      const cylinder = createCylinder(this.#scene, {
        x: x,
        z: z,
        color: "#FFFFFF",
        height: 0.2,
      });
      map[x][z] = {
        isExist: true,
        cylinder,
        color: "#FFFFFF",
        category: null,
      };
    }
  }

  /** 파라미터로 전달받은 x, z 좌표 주변에 empty cylinder list를 만드는 method */
  createEmptyCylinderAround({
    x,
    z,
    length = 1,
  }: {
    x: number;
    z: number;
    length?: number;
  }) {
    AROUND_DIRECT.forEach(([dx, dz]) => {
      const [nx, nz] = [x + dx, z + dz];

      this.createEmptyCylinder({
        x: nx,
        z: nz,
      });

      if (length - 1 > 0) {
        this.createEmptyCylinderAround({
          x: nx,
          z: nz,
          length: length - 1,
        });
      }
    });
  }

  animateCategoryCylinderList() {
    const { categoryMap, currentCategory } = this.#store;

    /** NOTE: cylinder에 hover했을때 같은 카테고리의 높이를 변경하는 로직 */
    Object.entries(categoryMap).forEach(([category, cylinderList]) => {
      const isIncreasing = category === currentCategory;
      const second = 0.35;
      const changeRate = 1 / second / 1 / 60; // Rate of change per frame
      const easingFunction = isIncreasing ? easeOutCubic : easeInCubic;

      cylinderList.forEach(({ cylinder, progress, height }, index) => {
        const scale = (height + easingFunction(progress)) / height;
        cylinder.scale.set(1, scale, 1);
        cylinder.position.y = (height * scale) / 2;

        const nextprogress = isIncreasing
          ? Math.min(progress + changeRate, 1)
          : Math.max(progress - changeRate, 0);

        cylinderList[index]!.progress = nextprogress;
      });
    });
  }

  animateMoveToTargetCylinder() {
    const { targetCylinderLocation } = this.#store;

    if (!targetCylinderLocation) {
      return;
    }
    const { x, z, progress, cameraStartLocation, controlsStartLocation } =
      targetCylinderLocation;

    /** NOTE: set progress */
    const second = 0.5;
    const changeRate = 1 / second / 1 / 60; // Rate of change per frame
    const nextprogress = Math.min(progress + changeRate, 1);

    console.log(easeOutCubic(progress));

    const currentCameraX = cameraStartLocation.x;
    const currentCameraZ = cameraStartLocation.z;
    const currentControlsZ = controlsStartLocation.z;
    const currentControlsX = controlsStartLocation.x;

    const nx = (x - (z % 2) / 2) * 2;
    const nz = z * Math.sqrt(Math.PI);

    /** NOTE: set camera & controls */
    this.#camera.position.set(
      currentCameraX + (nx - currentCameraX) * progress,
      10 * Math.PI,
      currentCameraZ + (nz - currentCameraZ) * progress,
    );
    this.#controls.target.set(
      currentControlsX + (nx - currentControlsX) * progress,
      0,
      currentControlsZ + (nz - currentControlsZ) * progress,
    );

    if (progress >= 1) {
      this.resetTargetCylinder();
    } else {
      this.updateTargetCylinder({
        x,
        z,
        progress: nextprogress,
      });
    }
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

    /** set mouse style */
    updateMouseStyle({ $canvas: this.$canvas, cylinder });

    /** set cylinder enter & out event */
    dispatchCylinderMouseEvent({
      $canvas: this.$canvas,
      prevHoveredCylinder,
      currentHoveredCylinder: cylinder,
    });

    /** update cylinder state */
    this.updateState({
      prevHoveredCylinder: cylinder,
    });
  }

  onCylinderEnter(event: CustomEvent<{ cylinder: Cylinder }>) {
    const { map } = this.#store;
    const { cylinder } = event.detail;
    const [x, z] = cylinder.name.split(".").map(Number) as [number, number];
    const cylinderDetail = map[x]![z]!;
    if (!cylinderDetail) {
      return null;
    }

    cylinder.material.color.set(darker(cylinderDetail.color));

    this.updateState({
      currentCategory: cylinderDetail.category,
    });
  }

  onCylinderOut(event: CustomEvent<{ cylinder: Cylinder }>) {
    const { map } = this.#store;
    const { cylinder } = event.detail;
    const [x, z] = cylinder.name.split(".").map(Number) as [number, number];
    const cylinderDetail = map[x]![z]!;

    cylinder.material.color.set(cylinderDetail.color!);

    this.updateState({
      currentCategory: null,
    });
  }

  onPointerClick() {
    this.#raycaster.setFromCamera(this.#pointer, this.#camera);
    const intersects = this.#raycaster.intersectObjects(this.#scene.children);

    if (!intersects[0]) {
      return;
    }

    const cylinder = intersects[0].object as Cylinder;
    const [x, z] = cylinder.name.split(".").map(Number) as [number, number];

    this.updateState({
      currentSelectedCylinder: cylinder,
    });
    this.updateTargetCylinder({
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
    });
  }

  /** render method */
  render() {
    this.#camera.updateMatrix();
    this.#controls.update();
    resize({
      renderer: this.#renderer,
      camera: this.#camera,
    });

    this.animateCategoryCylinderList();
    this.animateMoveToTargetCylinder();

    this.#renderer.render(this.#scene, this.#camera);

    requestAnimationFrame(this.render);
  }

  /** remove method */
  remove() {
    this.#scene.remove();
  }
}
