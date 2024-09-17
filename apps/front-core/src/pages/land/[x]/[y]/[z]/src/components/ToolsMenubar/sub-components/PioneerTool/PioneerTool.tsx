import { useMutation, useQuery } from "@tanstack/react-query";
import {
  PickaxeIcon,
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
import { Skeleton } from "@/shad-cn/components/ui/skeleton";
import { apiAxios, makeGetQueryOptions } from "@/utils/react-query";
import { cn } from "@/utils/tailwindcss";

import { useArticleMap } from "../../../../stores/articleMap";
import { useUser } from "../../../../stores/user";
import { CylinderLocation } from "../../../ArticleList/ArticleList.type";
import { MENU_VALUE_LIST, useMenubarContext } from "../../contexts/menubar";

function PioneerTool() {
  const { articleMap } = useArticleMap();
  const { openedMenu, toggleOpendMenu } = useMenubarContext();

  const router = useRouter();
  const { location } = useUser();

  const { x: ux, z: uz } = location || { x: 0, z: 0 };
  const sx = Number(router.query.sx);
  const sz = Number(router.query.sz);
  const isOpenMenu = MENU_VALUE_LIST[0] === openedMenu;

  // const userLocationQuery = makeGetQueryOptions({
  //   url: `/api/locations/${ux}/${uz}`,
  // });
  // const { data: userLocationInfo, isLoading: isUserLocationInfoLoading } =
  //   useQuery(
  //     userLocationQuery.getQueryOptionsInClient({
  //       queryOptions: {
  //         enabled: isOpenMenu,
  //       },
  //     }),
  //   );

  // const seletedLocationQuery = makeGetQueryOptions({
  //   url: `/api/locations/${sx}/${sz}`,
  // });
  // const {
  //   data: selectedLocationInfo,
  //   isLoading: isSelectedLocationInfoLoading,
  // } = useQuery(
  //   seletedLocationQuery.getQueryOptionsInClient({
  //     queryOptions: {
  //       enabled: isOpenMenu,
  //     },
  //   }),
  // );

  const { mutateAsync: pioneerUnitByCameraLocation } = useMutation({
    mutationFn: async (targetLocation: CylinderLocation) => {
      await apiAxios.post("/api/locations", targetLocation);
    },
  });

  const pioneer = (targetLocation: CylinderLocation) => {
    return async () => {
      await pioneerUnitByCameraLocation(targetLocation);
      router.push(`/land/${targetLocation.x}/0/${targetLocation.z}/write`);
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
    toggleOpendMenu(MENU_VALUE_LIST[0]);
  };

  return (
    <MenubarMenu value={MENU_VALUE_LIST[0]}>
      <MenubarTrigger
        className={cn("cursor-pointer", "flex", "gap-1", "items-center")}
        onClick={toggle}
      >
        <PickaxeIcon size={14} />
        <span>정복하기</span>
      </MenubarTrigger>
      <MenubarContent align="end" loop onEscapeKeyDown={toggle}>
        <MenubarItem
          disabled={
            false
            // userLocationInfo?.type === "mine-location" ||
            // isUserLocationInfoLoading
          }
          className={cn("cursor-pointer")}
          onClick={pioneer({ x: ux, z: uz })}
          onPointerEnter={floatUp({ x: ux, z: uz })}
          onPointerLeave={floatDown({ x: ux, z: uz })}
        >
          {/* {isUserLocationInfoLoading && (
            <Skeleton className={cn("w-14", "h-5")} />
          )}
          {!isUserLocationInfoLoading && <span>나의 위치</span>} */}
          <span>나의 위치</span>
          <MenubarShortcut>
            <FootprintsIcon size={14} />
          </MenubarShortcut>
        </MenubarItem>
        <MenubarItem
          disabled={
            false
            // selectedLocationInfo?.type === "mine-location" ||
            // isSelectedLocationInfoLoading
          }
          className={cn("cursor-pointer")}
          onClick={pioneer({ x: sx, z: sz })}
          onPointerEnter={floatUp({ x: sx, z: sz })}
          onPointerLeave={floatDown({ x: sx, z: sz })}
        >
          {/* {isSelectedLocationInfoLoading && (
            <Skeleton className={cn("w-14", "h-5")} />
          )}
          {!isSelectedLocationInfoLoading && <span>선택한 위치</span>} */}
          <span>선택한 위치</span>
          <MenubarShortcut>
            <MousePointerClickIcon size={14} />
          </MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}

export default PioneerTool;
