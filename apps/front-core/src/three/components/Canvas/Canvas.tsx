import type { ComponentProps } from "react";

import { useRef, useEffect, useState } from "react";

import { MOCK_ARTICLE_LIST } from "./Canvas.constants";
import { CylinderMap } from "./Canvas.events";

function Canvas({
  ...props
}: Omit<ComponentProps<"canvas">, "width" | "height">) {
  const $canvasRef = useRef<HTMLCanvasElement>(null);
  const [
    articleList,
    // setArticleList
  ] = useState(MOCK_ARTICLE_LIST);

  useEffect(() => {
    if (!$canvasRef.current) {
      return;
    }

    /** NOTE: initial three */
    const $canvas = $canvasRef.current;
    const cylinderMap = new CylinderMap({
      $canvas,
      cylinderList: articleList,
      bx: 0,
      bz: 0,
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
  }, [$canvasRef.current]);

  return (
    <canvas ref={$canvasRef} className="w-full h-full" {...props}></canvas>
  );
}
export default Canvas;
