import type { ComponentProps } from "react";

import { useQuery } from "@tanstack/react-query";
import { throttle } from "es-toolkit";
import { useRouter } from "next/router";
import QueryString from "query-string";
import { useRef, useEffect, useState, useCallback } from "react";

import { makeGetQueryOptions } from "@/utils/react-query";

import { CylinderMap } from "./ArticleList.class";
import { Article, CylinderLocation } from "./ArticleList.type";
import { Cylinder } from "./class/cylinder.class";

function ArticleList({
  ...props
}: Omit<ComponentProps<"canvas">, "width" | "height">) {
  const [articleMap, setArticleMap] =
    useState<Nullable<CylinderMap<Article>>>(null);
  const router = useRouter();
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
    console.log("cylinder click");
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
    if (articleMap?.user) {
      articleMap.user.move({ x, z });
    }
  };

  const throttleMoveLocation = useCallback(
    throttle(({ nx, nz }: { nx: number; nz: number }) => {
      router.push(`/land/${nx}/0/${nz}${queryString}`, undefined, {
        shallow: true,
      });
      if (!articleMap) {
        return;
      }



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
      // throw new Error("location list를 불러오는데에 실패했습니다.");
    }

    /** NOTE: initial three */
    const $canvas = $canvasRef.current;
    const cylinderMap = new CylinderMap({
      $canvas,
      cylinderList: locationList,
      bx: Number(router.query.x),
      bz: Number(router.query.z),
    });
    setArticleMap(cylinderMap);

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

      /** NOTE: remove three */
      // articleMap.remove();
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
    return () => {
      $canvas.removeEventListener("cylinder-click", onCylinderClick);
      $canvas.removeEventListener("camera-move-end", onCameraMoveEnd);
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
    <canvas ref={$canvasRef} className="w-full h-full" {...props}></canvas>
  );
}
export default ArticleList;
