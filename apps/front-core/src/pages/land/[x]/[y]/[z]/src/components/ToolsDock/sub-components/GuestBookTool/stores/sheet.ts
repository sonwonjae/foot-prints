import { useSyncExternalStore } from "react";

import { Store } from "@/utils/store";

type Open = Nullable<"read" | "write">;

interface GuestBookSheetStoreState {
  open: Open;
}

class GuestBookSheetStore extends Store<GuestBookSheetStoreState> {
  #state: GuestBookSheetStoreState = { open: null };

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

export const guestBookSheetStore = new GuestBookSheetStore();

export const useGuestBookSheet = () => {
  return useSyncExternalStore(
    guestBookSheetStore.subscribe,
    guestBookSheetStore.getSnapshot,
    guestBookSheetStore.getServerSnapshot,
  );
};
