export class Store<T extends object> {
  #state: T = {} as T;
  #onStoreChangeList: Array<() => void> = [];
  constructor() {
    this.emitChange = this.emitChange.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.getSnapshot = this.getSnapshot.bind(this);
    this.getServerSnapshot = this.getServerSnapshot.bind(this);
  }

  emitChange() {
    for (const onStoreChange of this.#onStoreChangeList) {
      onStoreChange();
    }
  }

  subscribe(onStoreChange: () => void) {
    this.#onStoreChangeList = [...this.#onStoreChangeList, onStoreChange];
    return () => {
      this.#onStoreChangeList = this.#onStoreChangeList.filter(
        (originOnStoreChange) => {
          return originOnStoreChange !== onStoreChange;
        },
      );
    };
  }

  getSnapshot() {
    return this.#state;
  }

  getServerSnapshot() {
    return this.#state;
  }
}
