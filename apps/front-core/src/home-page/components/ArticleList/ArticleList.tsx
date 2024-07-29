import type { ComponentProps } from "react";

import { useRouter } from "next/router";
import { useRef, useEffect } from "react";

import { CylinderMap } from "./ArticleList.class";
import { MOCK_ARTICLE_LIST } from "./ArticleList.constants";

function ArticleList({
  ...props
}: Omit<ComponentProps<"canvas">, "width" | "height">) {
  const router = useRouter();
  const $canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!$canvasRef.current) {
      return;
    }

    /** NOTE: initial three */
    const $canvas = $canvasRef.current;
    const cylinderMap = new CylinderMap({
      $canvas,
      cylinderList: MOCK_ARTICLE_LIST,
      bx: Number(router.query.x),
      bz: Number(router.query.z),
      onCylinderClick: ({ location, category }) => {
        const { x, z } = location;
        if (!category) {
          router.push(`/empty/${x}/0/${z}`, undefined, {
            shallow: true,
          });
          return;
        }

        router.push(`/article/${x}/0/${z}`, undefined, {
          shallow: true,
        });
      },
    });

    /** NOTE: render three */
    requestAnimationFrame(cylinderMap.render);

    /** NOTE: bind event */
    window.addEventListener("resize", cylinderMap.render);
    window.addEventListener("pointermove", cylinderMap.onPointerMove);
    window.addEventListener("pointerdown", cylinderMap.onPointerClick);

    /** NOTE: bind custom event */
    $canvas.addEventListener("cylinder-enter", cylinderMap.onCylinderEnter);
    $canvas.addEventListener("cylinder-out", cylinderMap.onCylinderOut);

    return () => {
      /** NOTE: remove event */
      window.removeEventListener("resize", cylinderMap.render);
      window.removeEventListener("pointermove", cylinderMap.onPointerMove);
      window.removeEventListener("pointerdown", cylinderMap.onPointerClick);

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
