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
    this.updateTargetCylinder = this.updateTargetCylinder.bind(this);
    this.resetTargetCylinder = this.resetTargetCylinder.bind(this);
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
    this.updateTargetCylinder({
      x: this.#bx,
      z: this.#bz,
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
    const { x, z } = location;

    const finalColor = (() => {
      switch (true) {
        case type === "mine-location":
          /** FIXME: 어느정도 기능 마무리 된 후 mine-location unit UI 고도화 하기 */
          return "#E6E6FA";
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
      category,
    });
    if (category) {
      this.updateCategoryMap({
        cylinder,
        category,
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
      if (!this.#store.map?.[x]?.[z]?.isExist) {
        this.addCylinderInScene(cylinderInfo);
        return;
      }
      // const info = this.#store.map[x][z];
      // this.#scene.remove(info.cylinder);
      console.log(`come in [${x}.${z}]`, this.#store.map?.[x]?.[z]);
    });
  }

  /** NOTE: store에 존재하는 state 중 map의 특정 좌표에 cylinder를 업데이트하는 메서드 */
  updateCylinderMap({
    cylinder,
    x,
    z,
    color,
    category,
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
        progress: 0,
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

  animateCategoryCylinderList() {
    const { categoryMap, currentCategory } = this.#store;

    /** NOTE: cylinder에 hover했을때 같은 카테고리의 높이를 변경하는 로직 */
    Object.entries(categoryMap).forEach(([category, cylinderList]) => {
      const isIncreasing = category === currentCategory;
      const second = 1;
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
    const second = 0.35;
    const changeRate = 1 / second / 1 / 60; // Rate of change per frame
    const nextprogress = Math.min(progress + changeRate, 1);

    const currentCameraX = cameraStartLocation.x;
    const currentCameraZ = cameraStartLocation.z;
    const currentControlsZ = controlsStartLocation.z;
    const currentControlsX = controlsStartLocation.x;

    const nx = (x - (z % 2) / 2) * 2;
    const nz = z * Math.sqrt(Math.PI);

    const angleX = Math.PI * 3;
    const angleZ = 6 * Math.PI;

    /** NOTE: set camera & controls */
    this.#camera.position.set(
      currentCameraX + (nx - currentCameraX + angleX) * easeOutCubic(progress),
      8 * Math.PI,
      currentCameraZ + (nz - currentCameraZ + angleZ) * easeOutCubic(progress),
    );
    this.#controls.target.set(
      currentControlsX + (nx - currentControlsX) * easeOutCubic(progress),
      0,
      currentControlsZ + (nz - currentControlsZ) * easeOutCubic(progress),
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
    const { map } = this.#store;

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

    this.animateCategoryCylinderList();
    this.animateMoveToTargetCylinder();

    this.#renderer.render(this.#scene, this.#camera);

    requestAnimationFrame(this.render);
  }

  /** NOTE: remove method */
  remove() {
    this.#scene.remove();
  }
}
