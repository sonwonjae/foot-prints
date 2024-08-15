import type { ComponentProps } from "react";

import { useQuery } from "@tanstack/react-query";
import { throttle } from "es-toolkit";
import { useRouter } from "next/router";
import QueryString from "query-string";
import { useRef, useEffect, useState, useCallback } from "react";

import { makeGetQueryOptions } from "@/utils/react-query";

import { CylinderMap } from "./ArticleList.class";
import { Article, OnCameraMoveEnd, OnCylinderClick } from "./ArticleList.type";

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

  const onCylinderClick: OnCylinderClick = ({ location }) => {
    const { x, z } = location;
    console.log({ x, z });
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

  const onCameraMoveEnd: OnCameraMoveEnd = ({ location }) => {
    const { x, z } = location;
    router.push(`/land/${x}/0/${z}${queryString}`, undefined, {
      shallow: true,
    });
  };

  const throttleMoveLocation = useCallback(
    throttle(({ nx, nz }: { nx: number; nz: number }) => {
      router.push(`/land/${nx}/0/${nz}${queryString}`, undefined, {
        shallow: true,
      });
    }, 350),
    [],
  );

  const moveCameraWithArrowKey = (e: KeyboardEvent) => {
    const key = e.key.toUpperCase();

    if (!articleMap) {
      return;
    }
    const x = Number(router.query.x);
    const z = Number(router.query.z);

    const move = ({ nx, nz }: { nx: number; nz: number }) => {
      throttleMoveLocation({ nx, nz });
      articleMap.moveCamera({
        x: nx,
        z: nz,
      });
    };

    switch (key) {
      case "ARROWUP":
        move({ nx: x - Number(!!(z % 2)), nz: z - 1 });
        break;
      case "ARROWDOWN":
        move({ nx: x + Number(!(z % 2)), nz: z + 1 });
        break;
      case "ARROWLEFT":
        move({ nx: x - 1, nz: z });
        break;
      case "ARROWRIGHT":
        move({ nx: x + 1, nz: z });
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
      onCylinderClick,
      onCameraMoveEnd,
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
    if (!articleMap) {
      return;
    }
    articleMap.updateEvent({
      onCylinderClick,
      onCameraMoveEnd,
    });
  }, [
    $canvasRef.current,
    !!articleMap,
    locationListQuery.baseKey,
    router.query.range,
    router.query.sx,
    router.query.sz,
  ]);

  /** NOTE: articleMap event binding */
  useEffect(() => {
    if (!$canvasRef.current) {
      return;
    }
    if (!articleMap) {
      return;
    }
    const $canvas = $canvasRef.current;

    /** NOTE: bind event */
    window.addEventListener("resize", articleMap.render);
    window.addEventListener("pointermove", articleMap.onPointerMove);
    window.addEventListener("pointerup", articleMap.onPointerClick);
    window.addEventListener("pointerdown", articleMap.savePrevCameraPosition);

    /** NOTE: bind custom event */
    $canvas.addEventListener("cylinder-enter", articleMap.onCylinderEnter);
    $canvas.addEventListener("cylinder-out", articleMap.onCylinderOut);

    return () => {
      /** NOTE: remove event */
      window.removeEventListener("resize", articleMap.render);
      window.removeEventListener("pointermove", articleMap.onPointerMove);
      window.removeEventListener("pointerup", articleMap.onPointerClick);
      window.removeEventListener(
        "pointerdown",
        articleMap.savePrevCameraPosition,
      );

      /** NOTE: remove custom event */
      $canvas.removeEventListener("cylinder-enter", articleMap.onCylinderEnter);
      $canvas.removeEventListener("cylinder-out", articleMap.onCylinderOut);

      /** NOTE: remove three */
      articleMap.remove();
    };
  }, [$canvasRef.current, !!articleMap]);

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
