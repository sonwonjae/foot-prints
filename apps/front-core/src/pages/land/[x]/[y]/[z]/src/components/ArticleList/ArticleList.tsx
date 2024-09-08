import type { ComponentProps } from "react";

import { useQuery } from "@tanstack/react-query";
import { throttle } from "es-toolkit";
import { useRouter } from "next/router";
import qs from "query-string";
import { useRef, useEffect, useState, useCallback, useId } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shad-cn/components/ui/alert-dialog";
import { makeGetQueryOptions } from "@/utils/react-query";

import { articleMapStore, useArticleMap } from "../../stores/articleMap";
import { useUser } from "../../stores/user";

import { CylinderMap } from "./ArticleList.class";
import { CylinderLocation } from "./ArticleList.type";
import { Cylinder } from "./class/cylinder.class";

function ArticleList({
  ...props
}: Omit<ComponentProps<"canvas">, "width" | "height">) {
  const id = useId();
  const { articleMap } = useArticleMap();
  const { user } = useUser();

  const [isOpenUserFallEndModal, setIsOpenUserFallEndModal] = useState(false);

  const router = useRouter();
  /** FIXME: ref는 dependency 배열에 넣어도 소용없으므로 다 빼주는 작업해주기 */
  const $canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!$canvasRef.current) {
      return;
    }

    if (!articleMap) {
      return;
    }

    /** remove prev articleMap */
    articleMap.cancelRender();

    /** NOTE: reset three */
    const $canvas = $canvasRef.current;
    const cylinderMap = new CylinderMap({
      $canvas,
      cylinderList: locationList || [],
      bx: Number(router.query.x),
      bz: Number(router.query.z),
    });

    articleMapStore.initArticleMap(cylinderMap);

    /** NOTE: render three */
    cylinderMap.render();
  }, [id]);

  const queryString = `?${qs.stringify({
    range: router.query.range,
    sx: router.query.sx,
    sz: router.query.sz,
  })}`;

  const locationListQuery = makeGetQueryOptions({
    url: `/api/locations/list/${Number(router.query.x)}/${Number(router.query.z)}${queryString}`,
  });
  const { data: locationList } = useQuery(
    locationListQuery.getQueryOptionsInClient(),
  );

  const onCylinderClick = ({
    detail: { cylinder },
  }: CustomEvent<{ cylinder: Cylinder }>) => {
    const { location } = cylinder;
    const { x, z } = location;

    router.push(
      `${window.location.pathname}${`?${qs.stringify({
        ...qs.parse(queryString),
        sx: x,
        sz: z,
      })}`}`,
      undefined,
      {
        shallow: true,
      },
    );
  };

  const onCameraMoveEnd = ({
    detail: { location },
  }: CustomEvent<{ location: CylinderLocation }>) => {
    const { x, z } = location;
    router.push(`/land/${x}/0/${z}${queryString}`, undefined, {
      shallow: true,
    });
  };

  const onUserFallEnd = () => {
    setIsOpenUserFallEndModal(true);
  };

  const throttleMoveLocation = useCallback(
    throttle(({ nx, nz }: { nx: number; nz: number }) => {
      if (!articleMap) {
        return;
      }

      if (user?.isMoving) {
        return;
      }

      const nextLocation = { x: nx, z: nz };
      const isExistCylinder = !!articleMap.checkCylinder(nextLocation);

      if (isExistCylinder) {
        router.push(`/land/${nx}/0/${nz}${queryString}`, undefined, {
          shallow: true,
        });

        articleMap.moveCameraAnimation(nextLocation);

        user?.move(nextLocation, "keyboard");
      } else {
        user?.vibrate();
        toast.error("이동할 땅이 없습니다!");
      }
    }, 550),
    [articleMap],
  );

  const moveUserWithArrowKey = (e: KeyboardEvent) => {
    if (e.currentTarget !== e.target) {
      return;
    }
    const key = e.key.toUpperCase();

    if (!articleMap) {
      return;
    }
    if (!user) {
      return;
    }

    const { x, z } = user.location;

    switch (key) {
      case "ARROWUP":
        throttleMoveLocation({ nx: x - Number(!!(z % 2)), nz: z - 1 });
        break;
      case "ARROWDOWN":
        throttleMoveLocation({ nx: x + Number(!(z % 2)), nz: z + 1 });
        break;
      case "ARROWLEFT":
        throttleMoveLocation({ nx: x - 1, nz: z });
        break;
      case "ARROWRIGHT":
        throttleMoveLocation({ nx: x + 1, nz: z });
        break;
      default:
        break;
    }
  };

  /** NOTE: set article list canvas */
  useEffect(() => {
    if (!$canvasRef.current) {
      return;
    }

    if (articleMap) {
      return;
    }

    if (!locationList) {
      return;
    }

    /** NOTE: initial three */
    const $canvas = $canvasRef.current;
    const cylinderMap = new CylinderMap({
      $canvas,
      cylinderList: locationList || [],
      bx: Number(router.query.x),
      bz: Number(router.query.z),
    });
    articleMapStore.initArticleMap(cylinderMap);

    /** NOTE: render three */
    cylinderMap.render();
  }, [!!articleMap, $canvasRef.current, !!locationList]);

  /** NOTE: articleMap store update */
  useEffect(() => {
    if (!articleMap) {
      return;
    }
    if (!locationList) {
      return;
    }
    articleMap.updateState({
      cylinderList: locationList,
    });
    articleMap.drawCylinderList();
    articleMap.addEvents();

    return () => {
      articleMap.removeEvents();
    };
  }, [
    $canvasRef.current,
    !!articleMap,
    locationListQuery.baseKey,
    router.query.x,
    router.query.z,
    router.query.range,
    router.query.sx,
    router.query.sz,
  ]);

  /** NOTE: articleMap event update */
  useEffect(() => {
    if (!$canvasRef.current) {
      return;
    }

    const $canvas = $canvasRef.current;

    $canvas.addEventListener("cylinder-click", onCylinderClick);
    $canvas.addEventListener("camera-move-end", onCameraMoveEnd);
    $canvas.addEventListener("user-fall-end", onUserFallEnd);
    return () => {
      $canvas.removeEventListener("cylinder-click", onCylinderClick);
      $canvas.removeEventListener("camera-move-end", onCameraMoveEnd);
      $canvas.removeEventListener("user-fall-end", onUserFallEnd);
    };
  }, [
    $canvasRef.current,
    !!articleMap,
    locationListQuery.baseKey,
    router.query.range,
    router.query.sx,
    router.query.sz,
  ]);

  /** NOTE: bind keyboard event */
  useEffect(() => {
    document.body.addEventListener("keydown", moveUserWithArrowKey);

    return () => {
      document.body.removeEventListener("keydown", moveUserWithArrowKey);
    };
  }, [$canvasRef.current, !!articleMap, router.query.x, router.query.z]);

  return (
    <>
      <canvas ref={$canvasRef} className="w-full h-full" {...props}></canvas>
      <AlertDialog open={isOpenUserFallEndModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>안착할 땅이 없습니다.</AlertDialogTitle>
            <AlertDialogDescription>
              가까운 땅으로 이동하시겠어요?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                if (!articleMap) {
                  return;
                }

                if (!locationList?.[0]?.location) {
                  /** NOTE
                   * 이동할 땅이 없으면 어차피 모두 리셋해야되기 때문에
                   * router 사용하지 않고 깔끔하게 { x: 0, z: 0 } 좌표로 페이지 이동
                   */
                  window.location.replace(`/land/${0}/0/${0}${queryString}`);
                  return;
                }

                const { x = 0, z = 0 } = locationList[0].location;
                router.push(`/land/${x}/0/${z}${queryString}`, undefined, {
                  shallow: true,
                });
                articleMap.moveCameraAnimation({
                  x,
                  z,
                });
                user?.reload({ x, z });
                setIsOpenUserFallEndModal(false);
              }}
            >
              이동하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
export default ArticleList;
