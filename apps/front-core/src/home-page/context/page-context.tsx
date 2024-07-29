import type { PropsWithChildren } from "react";

import { createContext, useContext, useState, useMemo } from "react";

import { PageContextValue } from "./page-context.type";

const HomePageContext = createContext<PageContextValue>({
  currentArticle: null,
  changeCurrentArticle: () => {},
});

export const useHomePageContext = () => {
  return useContext(HomePageContext);
};

export function HomePageProvider({ children }: PropsWithChildren) {
  const [currentArticle, setCurrentArticle] =
    useState<PageContextValue["currentArticle"]>(null);
  const changeCurrentArticle = (
    selectedArticle: NonNullable<PageContextValue["currentArticle"]>,
  ) => {
    setCurrentArticle(selectedArticle);
  };

  const contextValue = useMemo(() => {
    return {
      currentArticle,
      changeCurrentArticle,
    };
  }, [currentArticle]);

  return (
    <HomePageContext.Provider value={contextValue}>
      {children}
    </HomePageContext.Provider>
  );
}
