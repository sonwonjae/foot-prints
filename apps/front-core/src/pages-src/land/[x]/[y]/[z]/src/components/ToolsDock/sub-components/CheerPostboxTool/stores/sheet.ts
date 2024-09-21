import { useSyncExternalStore } from "react";

import { Store } from "@/utils/store";

type Open = Nullable<"read" | "write">;

interface CheerPostboxSheetStoreState {
  open: Open;
}

class CheerPostboxSheetStore extends Store<CheerPostboxSheetStoreState> {
  #state: CheerPostboxSheetStoreState = { open: null };

  constructor() {
    super();
    this.getSnapshot = this.getSnapshot.bind(this);
    this.getServerSnapshot = this.getServerSnapshot.bind(this);
    this.toggleWithOpen = this.toggleWithOpen.bind(this);
  }

  toggleWithOpen(open: Open) {
    this.#state = {
      ...this.#state,
      open: this.#state.open === open ? null : open,
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

export const cheerPostboxSheetStore = new CheerPostboxSheetStore();

export const useCheerPostboxSheet = () => {
  return useSyncExternalStore(
    cheerPostboxSheetStore.subscribe,
    cheerPostboxSheetStore.getSnapshot,
    cheerPostboxSheetStore.getServerSnapshot,
  );
};
