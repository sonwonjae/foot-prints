import { RedoIcon, CameraIcon, MousePointerClickIcon } from "lucide-react";
import { useRouter } from "next/router";
import qs from "query-string";

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

function MoveTool() {
  const { toggleOpendMenu } = useMenubarContext();

  const router = useRouter();
  const { articleMap } = useArticleMap();
  const { user, location } = useUser();

  const queryString = `?${qs.stringify({
    range: router.query.range,
    sx: router.query.sx,
    sz: router.query.sz,
  })}`;

  const { x: ux, z: uz } = location || { x: 0, z: 0 };
  const cx = Number(router.query.x);
  const cz = Number(router.query.z);
  const sx = Number(router.query.sx);
  const sz = Number(router.query.sz);

  const move = (targetLocation: CylinderLocation) => {
    return () => {
      if (!articleMap) {
        return;
      }

      if (!user) {
        return;
      }

      const isExistCylinder = !!articleMap.checkCylinder(targetLocation);

      if (!isExistCylinder) {
        user.vibrate();
        return;
      }

      if (isExistCylinder) {
        router.push(
          `/land/${targetLocation.x}/0/${targetLocation.z}${queryString}`,
          undefined,
          {
            shallow: true,
          },
        );

        articleMap.moveCameraAnimation(targetLocation);

        user.move(targetLocation, "keyboard");
      } else {
        user.vibrate();
      }
    };
  };

  return (
    <MenubarMenu value={MENU_VALUE_LIST[1]}>
      <MenubarTrigger
        className={cn("cursor-pointer", "flex", "gap-1", "items-center")}
        onClick={() => {
          toggleOpendMenu(MENU_VALUE_LIST[1]);
        }}
      >
        <RedoIcon size={14} />
        <span>이동하기</span>
      </MenubarTrigger>
      <MenubarContent align="end" loop>
        <MenubarItem
          disabled={
            (ux === cx && uz === cz) ||
            !articleMap?.checkCylinder({ x: cx, z: cz })
          }
          className={cn("cursor-pointer")}
          onClick={move({ x: cx, z: cz })}
          onPointerEnter={() => {}}
          onPointerOut={() => {}}
        >
          <span>카메라 위치</span>
          <MenubarShortcut>
            <CameraIcon size={14} />
          </MenubarShortcut>
        </MenubarItem>
        <MenubarItem
          disabled={
            (ux === sx && uz === sz) ||
            !articleMap?.checkCylinder({ x: sx, z: sz })
          }
          className={cn("cursor-pointer")}
          onClick={move({ x: sx, z: sz })}
          onPointerEnter={() => {}}
          onPointerOut={() => {}}
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

export default MoveTool;
