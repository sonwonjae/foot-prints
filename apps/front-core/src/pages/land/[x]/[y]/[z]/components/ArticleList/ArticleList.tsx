import type { ComponentProps } from "react";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useRef, useEffect } from "react";

import { makeGetQueryOptions } from "@/utils/react-query";

import { CylinderMap } from "./ArticleList.class";

function ArticleList({
  ...props
}: Omit<ComponentProps<"canvas">, "width" | "height">) {
  const router = useRouter();
  const $canvasRef = useRef<HTMLCanvasElement>(null);

  const locationQuery = makeGetQueryOptions({
    url: `/api/locations/${Number(router.query.x)}/${Number(router.query.z)}`,
  });
  const { data: locationList } = useQuery(
    locationQuery.getQueryOptionsInClient(),
  );

  useEffect(() => {
    if (!$canvasRef.current) {
      return;
    }

    if (!locationList) {
      throw new Error("location list를 불러오는데에 실패했습니다.");
    }

    /** NOTE: initial three */
    const $canvas = $canvasRef.current;
    const cylinderMap = new CylinderMap({
      $canvas,
      cylinderList: locationList,
      bx: Number(router.query.x),
      bz: Number(router.query.z),
      onCylinderClick: ({ location }) => {
        const { x, z } = location;
        router.push(`/land/${x}/0/${z}`, undefined, {
          shallow: true,
        });
      },
    });

    /** NOTE: render three */
    requestAnimationFrame(cylinderMap.render);

    /** NOTE: bind event */
    window.addEventListener("resize", cylinderMap.render);
    window.addEventListener("pointermove", cylinderMap.onPointerMove);
    window.addEventListener("click", cylinderMap.onPointerClick);

    /** NOTE: bind custom event */
    $canvas.addEventListener("cylinder-enter", cylinderMap.onCylinderEnter);
    $canvas.addEventListener("cylinder-out", cylinderMap.onCylinderOut);

    return () => {
      /** NOTE: remove event */
      window.removeEventListener("resize", cylinderMap.render);
      window.removeEventListener("pointermove", cylinderMap.onPointerMove);
      window.removeEventListener("click", cylinderMap.onPointerClick);

      /** NOTE: remove custom event */
      $canvas.removeEventListener(
        "cylinder-enter",
        cylinderMap.onCylinderEnter,
      );
      $canvas.removeEventListener("cylinder-out", cylinderMap.onCylinderOut);

      /** NOTE: remove three */
      cylinderMap.remove();
    };
  }, []);

  return (
    <canvas ref={$canvasRef} className="w-full h-full" {...props}></canvas>
  );
}
export default ArticleList;
