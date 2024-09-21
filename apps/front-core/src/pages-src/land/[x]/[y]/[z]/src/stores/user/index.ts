import { useSyncExternalStore } from "react";

import { Store } from "@/utils/store";

/** FIXME: type 이동 필요 */
import { CylinderLocation } from "../../components/ArticleList/ArticleList.type";
import { User } from "../../components/ArticleList/class/user.class";

interface UserStoreState {
  user: Nullable<User>;
  location: Nullable<CylinderLocation>;
}

class UserStore extends Store<UserStoreState> {
  #state: UserStoreState = { user: null, location: null };
  user: Nullable<User> = null;
  location: Nullable<CylinderLocation> = null;

  constructor() {
    super();
    this.getSnapshot = this.getSnapshot.bind(this);
    this.getServerSnapshot = this.getServerSnapshot.bind(this);
    this.initUser = this.initUser.bind(this);
    this.changeUserLocation = this.changeUserLocation.bind(this);
  }

  getSnapshot() {
    return this.#state;
  }

  getServerSnapshot() {
    return this.#state;
  }

  initUser(newUser: User) {
    this.user = newUser;
    this.#state = {
      ...this.#state,
      location: newUser.location,
      user: newUser,
    };
    this.emitChange();
  }

  changeUserLocation(newUserLocation: CylinderLocation) {
    if (!this.user) {
      return;
    }

    this.user.location = newUserLocation;
    this.location = newUserLocation;

    this.#state = {
      ...this.#state,
      location: newUserLocation,
    };
    this.emitChange();
  }
}

export const userStore = new UserStore();

export const useUser = () => {
  return useSyncExternalStore(
    userStore.subscribe,
    userStore.getSnapshot,
    userStore.getServerSnapshot,
  );
};
