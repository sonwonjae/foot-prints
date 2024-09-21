import { useSyncExternalStore } from "react";

import { Store } from "@/utils/store";

/** FIXME: type 이동 필요 */
import { CylinderMap } from "../../components/ArticleList/ArticleList.class";
import { Article } from "../../components/ArticleList/ArticleList.type";

interface ArticleMapStoreState {
  articleMap: Nullable<CylinderMap<Article>>;
}

class ArticleMapStore extends Store<ArticleMapStoreState> {
  #state: ArticleMapStoreState = { articleMap: null };
  articleMap: Nullable<CylinderMap<Article>> = null;
  constructor() {
    super();
    this.getSnapshot = this.getSnapshot.bind(this);
    this.getServerSnapshot = this.getServerSnapshot.bind(this);
    this.initArticleMap = this.initArticleMap.bind(this);
  }

  initArticleMap(newArticleMap: CylinderMap<Article>) {
    this.articleMap = newArticleMap;
    this.#state = {
      ...this.#state,
      articleMap: newArticleMap,
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

export const articleMapStore = new ArticleMapStore();

export const useArticleMap = () => {
  return useSyncExternalStore(
    articleMapStore.subscribe,
    articleMapStore.getSnapshot,
    articleMapStore.getServerSnapshot,
  );
};
