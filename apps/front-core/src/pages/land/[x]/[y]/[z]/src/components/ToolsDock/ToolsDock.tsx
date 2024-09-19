import { cn } from "@/utils/tailwindcss";

import { useArticleMap } from "../../stores/articleMap";
import { useSelectedLand } from "../../stores/selectedLand";
import { useUser } from "../../stores/user";

import {
  TimeCapsuleTool,
  GuestBookTool,
  WastelandTool,
  FenceTool,
  GrassTool,
} from "./sub-components";

function ToolsDockComponent() {
  const { articleMap } = useArticleMap();
  const { user } = useUser();
  const { landType } = useSelectedLand();

  if (!articleMap || !user) {
    /** FIXME: loading view 고안 필요 */
    return null;
  }
  const land = articleMap?.checkCylinder(user.location);

  if (!land) {
    return null;
  }

  return (
    <div className={cn("absolute", "bottom-4", "left-0", "right-0")}>
      {landType === "time-capsule" && <TimeCapsuleTool />}
      {landType === "guest-book" && <GuestBookTool />}
      {landType === "wasteland" && <WastelandTool />}
      {landType === "fence" && <FenceTool />}
      {landType === "grass" && <GrassTool />}
    </div>
  );
}

function ToolsDock() {
  return <ToolsDockComponent />;
}

export default ToolsDock;
