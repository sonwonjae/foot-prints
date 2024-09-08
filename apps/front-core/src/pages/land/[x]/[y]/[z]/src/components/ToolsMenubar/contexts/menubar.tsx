import type { PropsWithChildren } from "react";

import { createContext, useContext, useMemo, useState } from "react";

export const MENU_VALUE_LIST = ["pioneer", "move", "visit", "manage"] as const;

type OpenedMenuType = (typeof MENU_VALUE_LIST)[number] | "";

const MenubarContext = createContext<{
  openedMenu: OpenedMenuType;
  toggleOpendMenu: (targetMenu: (typeof MENU_VALUE_LIST)[number]) => void;
}>({ openedMenu: "", toggleOpendMenu: () => {} });

export const useMenubarContext = () => {
  return useContext(MenubarContext);
};

export function MenubarProvider({ children }: PropsWithChildren) {
  const [openedMenu, changeOpenedMenu] = useState<OpenedMenuType>("");
  const toggleOpendMenu = (targetMenu: Exclude<OpenedMenuType, "">) => {
    if (openedMenu === targetMenu) {
      changeOpenedMenu("");
    } else {
      changeOpenedMenu(targetMenu);
    }
  };

  const contextValue = useMemo(() => {
    return { openedMenu, toggleOpendMenu };
  }, [openedMenu]);

  return (
    <MenubarContext.Provider value={contextValue}>
      {children}
    </MenubarContext.Provider>
  );
}
