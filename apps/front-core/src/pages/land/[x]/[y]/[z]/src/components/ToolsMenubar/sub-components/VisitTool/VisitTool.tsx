import {
  DoorOpenIcon,
  FootprintsIcon,
  MousePointerClickIcon,
} from "lucide-react";
import { useRouter } from "next/router";
import { PointerEvent } from "react";

import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "@/shad-cn/components/ui/menubar";
import { cn } from "@/utils/tailwindcss";

import { useArticleMap } from "../../../../stores/articleMap";
import { useUser } from "../../../../stores/user";
import { CylinderLocation } from "../../../ArticleList/ArticleList.type";
import { MENU_VALUE_LIST, useMenubarContext } from "../../contexts/menubar";

function VisitTool() {
  const { articleMap } = useArticleMap();
  const { toggleOpendMenu } = useMenubarContext();

  const router = useRouter();
  const { location } = useUser();

  const { x: ux, z: uz } = location || { x: 0, z: 0 };
  const sx = Number(router.query.sx);
  const sz = Number(router.query.sz);

  const visit = (targetLocation: CylinderLocation) => {
    return () => {
      router.push(`/land/${targetLocation.x}/0/${targetLocation.z}/read`);
    };
  };

  const floatUp = (targetLocation: CylinderLocation) => {
    return (e: PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!articleMap) {
        return;
      }
      const cylinder = articleMap.checkCylinder(targetLocation);
      if (!cylinder) {
        return;
      }
      cylinder.floatUp();
    };
  };

  const floatDown = (targetLocation: CylinderLocation) => {
    return (e: PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!articleMap) {
        return;
      }
      const cylinder = articleMap.checkCylinder(targetLocation);
      if (!cylinder) {
        return;
      }
      cylinder.floatDown();
    };
  };

  const toggle = () => {
    toggleOpendMenu(MENU_VALUE_LIST[2]);
  };

  return (
    <MenubarMenu value={MENU_VALUE_LIST[2]}>
      <MenubarTrigger
        className={cn("cursor-pointer", "flex", "gap-1", "items-center")}
        onClick={toggle}
      >
        <DoorOpenIcon size={14} />
        <span>방문하기</span>
      </MenubarTrigger>
      <MenubarContent align="end" loop onEscapeKeyDown={toggle}>
        <MenubarItem
          className={cn("cursor-pointer")}
          onClick={visit({ x: ux, z: uz })}
          onPointerEnter={floatUp({ x: ux, z: uz })}
          onPointerLeave={floatDown({ x: ux, z: uz })}
        >
          <span>나의 위치</span>
          <MenubarShortcut>
            <FootprintsIcon size={14} />
          </MenubarShortcut>
        </MenubarItem>
        <MenubarItem
          className={cn("cursor-pointer")}
          onClick={visit({ x: sx, z: sz })}
          onPointerEnter={floatUp({ x: sx, z: sz })}
          onPointerLeave={floatDown({ x: sx, z: sz })}
        >
          <span>선택한 위치</span>
          <MenubarShortcut>
            <MousePointerClickIcon size={14} />
          </MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}

export default VisitTool;
