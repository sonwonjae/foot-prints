import type { ComponentProps } from "react";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import QueryString from "qs";
import { useRef, useEffect, useState } from "react";

import { makeGetQueryOptions } from "@/utils/react-query";

import { CylinderMap } from "./ArticleList.class";
import { Article, OnCylinderClick } from "./ArticleList.type";

function ArticleList({
  ...props
}: Omit<ComponentProps<"canvas">, "width" | "height">) {
  const [articleMap, setArticleMap] =
    useState<Nullable<CylinderMap<Article>>>(null);
  const router = useRouter();
  const $canvasRef = useRef<HTMLCanvasElement>(null);

  const queryString = `?${QueryString.stringify({
    range: router.query.range,
  })}`;

  const locationListQuery = makeGetQueryOptions({
    url: `/api/locations/list/${Number(router.query.x)}/${Number(router.query.z)}${queryString}`,
  });
  const { data: locationList } = useQuery(
    locationListQuery.getQueryOptionsInClient(),
  );

  const onCylinderClick: OnCylinderClick = ({ location }) => {
    const { x, z } = location;
    router.push(`/land/${x}/0/${z}${queryString}`, undefined, {
      shallow: true,
    });
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
    // articleMap.drawCylinderList();
  }, [
    $canvasRef.current,
    !!articleMap,
    locationListQuery.baseKey,
    router.query.range,
  ]);

  /** NOTE: articleMap event update */
  useEffect(() => {
    if (!articleMap) {
      return;
    }
    articleMap.updateEvent({
      onCylinderClick,
    });
  }, [
    $canvasRef.current,
    !!articleMap,
    locationListQuery.baseKey,
    router.query.range,
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
    window.addEventListener("click", articleMap.onPointerClick);

    /** NOTE: bind custom event */
    $canvas.addEventListener("cylinder-enter", articleMap.onCylinderEnter);
    $canvas.addEventListener("cylinder-out", articleMap.onCylinderOut);

    return () => {
      /** NOTE: remove event */
      window.removeEventListener("resize", articleMap.render);
      window.removeEventListener("pointermove", articleMap.onPointerMove);
      window.removeEventListener("click", articleMap.onPointerClick);

      /** NOTE: remove custom event */
      $canvas.removeEventListener("cylinder-enter", articleMap.onCylinderEnter);
      $canvas.removeEventListener("cylinder-out", articleMap.onCylinderOut);

      /** NOTE: remove three */
      articleMap.remove();
    };
  }, [$canvasRef.current, !!articleMap]);

  return (
    <canvas ref={$canvasRef} className="w-full h-full" {...props}></canvas>
  );
}
export default ArticleList;
