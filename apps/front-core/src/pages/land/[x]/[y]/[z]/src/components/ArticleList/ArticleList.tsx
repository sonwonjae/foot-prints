import type { ComponentProps } from "react";

import { useQuery } from "@tanstack/react-query";
import { throttle } from "es-toolkit";
import { useRouter } from "next/router";
import QueryString from "query-string";
import { useRef, useEffect, useState, useCallback } from "react";

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

import { useArticleMapContext } from "../../contexts/articleMap";

import { CylinderMap } from "./ArticleList.class";
import { CylinderLocation } from "./ArticleList.type";
import { Cylinder } from "./class/cylinder.class";

function ArticleList({
  ...props
}: Omit<ComponentProps<"canvas">, "width" | "height">) {
  const { articleMap, initArticleMap } = useArticleMapContext();

  console.log({ articleMap });

  const [isOpenUserFallEndModal, setIsOpenUserFallEndModal] = useState(false);

  const router = useRouter();
  /** FIXME: ref는 dependency 배열에 넣어도 소용없으므로 다 빼주는 작업해주기 */
  const $canvasRef = useRef<HTMLCanvasElement>(null);

  const queryString = `?${QueryString.stringify({
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
      `${window.location.pathname}${`?${QueryString.stringify({
        ...QueryString.parse(queryString),
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

      const isExistCylinder = !!articleMap.checkCylinder({ x: nx, z: nz });

      if (isExistCylinder) {
        router.push(`/land/${nx}/0/${nz}${queryString}`, undefined, {
          shallow: true,
        });

        articleMap.moveCameraAnimation({
          x: nx,
          z: nz,
        });

        articleMap.user.move(
          {
            x: nx,
            z: nz,
          },
          "keyboard",
        );
      } else {
        articleMap.user.vibrate();
      }
    }, 350),
    [!!articleMap],
  );

  const moveCameraWithArrowKey = (e: KeyboardEvent) => {
    const key = e.key.toUpperCase();

    if (!articleMap) {
      return;
    }
    const x = Number(router.query.x);
    const z = Number(router.query.z);

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
      cylinderList: locationList,
      bx: Number(router.query.x),
      bz: Number(router.query.z),
    });
    initArticleMap(cylinderMap);

    /** NOTE: render three */
    requestAnimationFrame(cylinderMap.render);
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
    window.addEventListener("keydown", moveCameraWithArrowKey);

    return () => {
      window.removeEventListener("keydown", moveCameraWithArrowKey);
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
                articleMap.user.reload({ x, z });
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
