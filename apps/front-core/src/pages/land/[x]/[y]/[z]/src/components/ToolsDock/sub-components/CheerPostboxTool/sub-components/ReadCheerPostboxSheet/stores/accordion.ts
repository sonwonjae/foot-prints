import { useSyncExternalStore } from "react";

import { Store } from "@/utils/store";

interface CheerMailAccordionStoreState {
  value: string;
}

class CheerMailAccordionStore extends Store<CheerMailAccordionStoreState> {
  #state: CheerMailAccordionStoreState = { value: "" };

  constructor() {
    super();
    this.getSnapshot = this.getSnapshot.bind(this);
    this.getServerSnapshot = this.getServerSnapshot.bind(this);
    this.toggleWithValue = this.toggleWithValue.bind(this);
  }

  toggleWithValue(value: string) {
    this.#state = {
      ...this.#state,
      value: this.#state.value === value ? "" : value,
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

export const cheerMailAccordionStore = new CheerMailAccordionStore();

export const useCheerMailAccordion = () => {
  return useSyncExternalStore(
    cheerMailAccordionStore.subscribe,
    cheerMailAccordionStore.getSnapshot,
    cheerMailAccordionStore.getServerSnapshot,
  );
};
