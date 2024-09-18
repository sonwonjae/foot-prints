import { useSyncExternalStore } from "react";

import { Store } from "@/utils/store";

import {
  CylinderLocation,
  LandType,
} from "../../components/ArticleList/ArticleList.type";

interface SelectedLandStoreState {
  landType: LandType | "none";
  location: CylinderLocation;
}

class SelectedLand extends Store<SelectedLandStoreState> {
  #state: SelectedLandStoreState = {
    landType: "none",
    location: { x: Infinity, z: Infinity },
  };

  #privateState: {
    userLocation: CylinderLocation;
    selectedLocation: CylinderLocation | null;
  } = {
    userLocation: { x: 4, z: 3 },
    selectedLocation: null,
  };

  constructor() {
    super();
    this.updateSelectedLocation = this.updateSelectedLocation.bind(this);
    this.updateUserLocation = this.updateUserLocation.bind(this);
  }

  updateSelectedLocation({
    landType = "none",
    location = null,
  }: {
    landType?: LandType | "none";
    location: CylinderLocation | null;
  }) {
    this.#privateState.selectedLocation = location;

    console.log({ landType, location });

    /** NOTE: 선택된 장소를 해제한 경우는 user location 기준으로 location 설정 */
    if (!this.#privateState.selectedLocation) {
      this.#state = {
        ...this.#state,
        landType,
        location: this.#privateState.userLocation,
      };
      this.emitChange();
      return;
    }

    /** NOTE: 기존 location과 선택한 location이 같은 경우 무효화 */
    if (
      this.#privateState.selectedLocation.x === this.#state.location.x &&
      this.#privateState.selectedLocation.z === this.#state.location.z
    ) {
      return;
    }

    /** NOTE: 최종적으로는 현재 location을 선택한 location으로 업데이트 */
    this.#state = {
      ...this.#state,
      landType,
      location: this.#privateState.selectedLocation,
    };
    this.emitChange();
  }

  updateUserLocation({
    landType,
    location,
  }: {
    landType: LandType;
    location: CylinderLocation;
  }) {
    this.#privateState.userLocation = location;

    /** NOTE: 선택된 장소가 있는 경우는 user location만 업데이트하고 마무리 */
    if (this.#privateState.selectedLocation) {
      return;
    }

    /** NOTE: 기존 location과 user location이 같은 경우 무효화 */
    if (
      this.#privateState.userLocation.x === this.#state.location.x &&
      this.#privateState.userLocation.z === this.#state.location.z
    ) {
      return;
    }

    /** NOTE: 최종적으로는 현재 location을 user location으로 업데이트 */
    this.#state = {
      ...this.#state,
      landType,
      location: this.#privateState.userLocation,
    };
    this.emitChange();
  }

  getSnapshot() {
    return this.#state;
  }

  getServerSnapshot() {
    return this.#state;
  }
}

export const selectedLandStore = new SelectedLand();

export const useSelectedLand = () => {
  return useSyncExternalStore(
    selectedLandStore.subscribe,
    selectedLandStore.getSnapshot,
    selectedLandStore.getServerSnapshot,
  );
};
