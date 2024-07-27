import { Canvas } from "@/three/components";
import { cn } from "@/utils/tailwindcss";

export default function Home() {
  return (
    <main className={cn("w-screen", "h-screen")}>
      <Canvas></Canvas>
    </main>
  );
}
