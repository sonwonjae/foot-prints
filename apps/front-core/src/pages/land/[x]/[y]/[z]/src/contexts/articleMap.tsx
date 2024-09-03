import type { PropsWithChildren } from "react";

import { createContext, useContext, useMemo, useState } from "react";

import { CylinderMap } from "../components/ArticleList/ArticleList.class";
import { Article } from "../components/ArticleList/ArticleList.type";

interface ArticleMapContextValue {
  articleMap: Nullable<CylinderMap<Article>>;
  initArticleMap: (newArticleMap: CylinderMap<Article>) => void;
}

const ArticleMapContext = createContext<ArticleMapContextValue>({
  articleMap: null,
  initArticleMap: () => {},
});

export const useArticleMapContext = () => {
  return useContext(ArticleMapContext);
};

export function ArticleMapProvider({ children }: PropsWithChildren) {
  const [articleMap, setArticleMap] =
    useState<Nullable<CylinderMap<Article>>>(null);
  const initArticleMap = (newArticleMap: CylinderMap<Article>) => {
    if (articleMap) {
      throw new Error(
        "articleMap 초기세팅은 articleMap이 존재할때 호출할 수 없습니다!",
      );
    }

    setArticleMap(newArticleMap);
  };

  const contextValue = useMemo(() => {
    return { articleMap, initArticleMap };
  }, [!!articleMap]);
  return (
    <ArticleMapContext.Provider value={contextValue}>
      {children}
    </ArticleMapContext.Provider>
  );
}
