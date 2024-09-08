import { useQuery } from "@tanstack/react-query";
import {
  FilePenLineIcon,
  FootprintsIcon,
  MousePointerClickIcon,
} from "lucide-react";
import { useRouter } from "next/router";

import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "@/shad-cn/components/ui/menubar";
import { Skeleton } from "@/shad-cn/components/ui/skeleton";
import { makeGetQueryOptions } from "@/utils/react-query";
import { cn } from "@/utils/tailwindcss";

import { useUser } from "../../../../stores/user";
import { CylinderLocation } from "../../../ArticleList/ArticleList.type";
import { MENU_VALUE_LIST, useMenubarContext } from "../../contexts/menubar";

function ManageTool() {
  const { openedMenu, toggleOpendMenu } = useMenubarContext();

  const router = useRouter();
  const { location } = useUser();

  const { x: ux, z: uz } = location || { x: 0, z: 0 };
  const sx = Number(router.query.sx);
  const sz = Number(router.query.sz);
  const isOpenMenu = MENU_VALUE_LIST[3] === openedMenu;

  const userLocationQuery = makeGetQueryOptions({
    url: `/api/locations/${ux}/${uz}`,
  });
  const { data: userLocationInfo, isLoading: isUserLocationInfoLoading } =
    useQuery(
      userLocationQuery.getQueryOptionsInClient({
        queryOptions: {
          enabled: isOpenMenu,
        },
      }),
    );

  const seletedLocationQuery = makeGetQueryOptions({
    url: `/api/locations/${sx}/${sz}`,
  });
  const {
    data: selectedLocationInfo,
    isLoading: isSelectedLocationInfoLoading,
  } = useQuery(
    seletedLocationQuery.getQueryOptionsInClient({
      queryOptions: {
        enabled: isOpenMenu,
      },
    }),
  );

  const manage = (targetLocation: CylinderLocation) => {
    return () => {
      router.push(`/land/${targetLocation.x}/0/${targetLocation.z}/write`);
    };
  };

  return (
    <MenubarMenu value={MENU_VALUE_LIST[3]}>
      <MenubarTrigger
        className={cn("cursor-pointer", "flex", "gap-1", "items-center")}
        onClick={() => {
          toggleOpendMenu(MENU_VALUE_LIST[3]);
        }}
      >
        <FilePenLineIcon size={14} />
        <span>관리하기</span>
      </MenubarTrigger>
      <MenubarContent align="end" loop>
        <MenubarItem
          disabled={
            userLocationInfo?.type !== "mine-location" ||
            isUserLocationInfoLoading
          }
          className={cn("cursor-pointer")}
          onClick={manage({ x: ux, z: uz })}
          onPointerEnter={() => {}}
          onPointerOut={() => {}}
        >
          {isUserLocationInfoLoading && (
            <Skeleton className={cn("w-14", "h-5")} />
          )}
          {!isUserLocationInfoLoading && <span>나의 위치</span>}
          <MenubarShortcut>
            <FootprintsIcon size={14} />
          </MenubarShortcut>
        </MenubarItem>
        <MenubarItem
          disabled={
            selectedLocationInfo?.type !== "mine-location" ||
            isSelectedLocationInfoLoading
          }
          className={cn("cursor-pointer")}
          onClick={manage({ x: sx, z: sz })}
          onPointerEnter={() => {}}
          onPointerOut={() => {}}
        >
          {isSelectedLocationInfoLoading && (
            <Skeleton className={cn("w-14", "h-5")} />
          )}
          {!isSelectedLocationInfoLoading && <span>선택한 위치</span>}
          <MenubarShortcut>
            <MousePointerClickIcon size={14} />
          </MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}

export default ManageTool;
