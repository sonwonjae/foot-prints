import { useMutation, useQuery } from "@tanstack/react-query";
import {
  FootprintsIcon,
  DoorOpenIcon,
  RedoIcon,
  CameraIcon,
  MousePointerClickIcon,
  PickaxeIcon,
  FilePenLineIcon,
} from "lucide-react";
import { useRouter } from "next/router";
import QueryString from "query-string";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "@/shad-cn/components/ui/menubar";
import { apiAxios, makeGetQueryOptions } from "@/utils/react-query";
import { cn } from "@/utils/tailwindcss";

import { useArticleMapContext } from "../../contexts/articleMap";

const USER_OPTION = {
  optionType: "user",
  children: "나의 위치",
  Icon: FootprintsIcon,
} as const;

const CAMERA_OPTION = {
  optionType: "camera",
  children: "카메라 위치",
  Icon: CameraIcon,
} as const;

const SELECTION_OPTION = {
  optionType: "selection",
  children: "선택한 위치",
  Icon: MousePointerClickIcon,
} as const;

const MENUS = [
  {
    menuType: "pioneer",
    children: "정복하기",
    Icon: PickaxeIcon,
    options: [USER_OPTION, SELECTION_OPTION],
  },
  {
    menuType: "move",
    children: "이동하기",
    Icon: RedoIcon,
    options: [USER_OPTION, CAMERA_OPTION, SELECTION_OPTION],
  },
  {
    menuType: "visit",
    children: "방문하기",
    Icon: DoorOpenIcon,
    options: [USER_OPTION, SELECTION_OPTION],
  },
  {
    menuType: "manage",
    children: "관리하기",
    Icon: FilePenLineIcon,
    options: [USER_OPTION, SELECTION_OPTION],
  },
] as const;

type OptionTypes = (typeof MENUS)[number]["options"][number]["optionType"];

function LandInformationPanel() {
  const router = useRouter();
  const { articleMap } = useArticleMapContext();

  const queryString = `?${QueryString.stringify({
    range: router.query.range,
    sx: router.query.sx,
    sz: router.query.sz,
  })}`;

  const x = Number(router.query.x);
  const z = Number(router.query.z);
  const sx = Number(router.query.sx);
  const sz = Number(router.query.sz);
  const showPanel = !Number.isNaN(Number(sx)) && !Number.isNaN(Number(sz));

  const isSameLocation = x === sx && z === sz;

  const cameraLocationQuery = makeGetQueryOptions({
    url: `/api/locations/${x}/${z}`,
  });

  const { data: cameraLocation, isLoading: isCameraLocationLoading } = useQuery(
    cameraLocationQuery.getQueryOptionsInClient({
      queryOptions: {
        enabled: showPanel,
      },
    }),
  );
  const seletedLocationQuery = makeGetQueryOptions({
    url: `/api/locations/${sx}/${sz}`,
  });

  const { data: selectedLocation, isLoading: isSelectedLocationLoading } =
    useQuery(
      seletedLocationQuery.getQueryOptionsInClient({
        queryOptions: {
          enabled: showPanel,
        },
      }),
    );

  const { mutateAsync: pioneerUnitByCameraLocation } = useMutation({
    mutationFn: async () => {
      await apiAxios.post("/api/locations", {
        x: Number(router.query.x),
        z: Number(router.query.z),
      });
    },
  });

  if (!showPanel) {
    return null;
  }

  const pioneer = (optionType: OptionTypes) => {
    return async () => {
      if (isSelectedLocationLoading) {
        return;
      }
      if (selectedLocation?.type !== "empty") {
        return;
      }

      await pioneerUnitByCameraLocation();
      router.push(`${window.location.pathname}/write`);
    };
  };

  const move = (optionType: OptionTypes) => {
    return () => {
      if (!articleMap) {
        return;
      }

      const location = { x: sx, z: sz };
      const isExistCylinder = !!articleMap.checkCylinder({ x: sx, z: sz });

      if (!isExistCylinder) {
        return;
      }

      if (isExistCylinder) {
        router.push(`/land/${sx}/0/${sz}${queryString}`, undefined, {
          shallow: true,
        });

        articleMap.moveCameraAnimation(location);

        articleMap.user.move(location, "keyboard");
      } else {
        articleMap.user.vibrate();
      }
    };
  };

  const visit = (optionType: OptionTypes) => {
    return () => {
      if (isSelectedLocationLoading) {
        return;
      }
      if (selectedLocation?.type !== "other-user-location") {
        return;
      }
      router.push(`${window.location.pathname}/read`);
    };
  };

  const manage = (optionType: OptionTypes) => {
    return () => {
      router.push(`${window.location.pathname}/write`);
    };
  };

  const actions = {
    pioneer,
    move,
    visit,
    manage,
  } as const;

  const getLocation = (optionType: OptionTypes) => {
    if (optionType === "user") {
      if (!articleMap) {
        throw new Error(
          "articleMap이 존재할때만 getLocation 함수를 사용할 수 있습니다.",
        );
      }
      return articleMap.user.location;
    }

    if (optionType === "camera") {
      return { x, z };
    }

    if (optionType === "selection") {
      return { x: sx, z: sz };
    }
    return { x: sx, z: sz };
  };

  return (
    <div className={cn("absolute", "bottom-4", "right-4")}>
      <div className={cn("relative")}>
        <Menubar loop>
          {MENUS.map(({ menuType, children, Icon, options }) => {
            return (
              <MenubarMenu key={menuType}>
                <MenubarTrigger
                  className={cn(
                    "cursor-pointer",
                    "flex",
                    "gap-1",
                    "items-center",
                  )}
                >
                  <Icon size={14} />
                  {children}
                </MenubarTrigger>
                <MenubarContent align="end" loop>
                  {options.map(({ optionType, children, Icon }) => {
                    return (
                      <MenubarItem
                        key={`${menuType}-${optionType}`}
                        className={cn("cursor-pointer")}
                        onClick={actions[menuType](optionType)}
                        onPointerEnter={() => {
                          const { x, z } = getLocation(optionType);
                          console.log(`in ${menuType} ${optionType} ${x}.${z}`);
                        }}
                        onPointerOut={() => {
                          const { x, z } = getLocation(optionType);
                          console.log(
                            `out ${menuType} ${optionType} ${x}.${z}`,
                          );
                        }}
                      >
                        {children}
                        <MenubarShortcut>
                          <Icon size={14} />
                        </MenubarShortcut>
                      </MenubarItem>
                    );
                  })}
                </MenubarContent>
              </MenubarMenu>
            );
          })}
        </Menubar>
      </div>
    </div>
  );
}

export default LandInformationPanel;
