import Canvas from "./canvas";
import { Toaster } from "react-hot-toast";

export default function Home() {
  return (
    <main className="flex w-screen min-h-screen flex-row items-center justify-between">
      <div><Toaster /></div>
      <Canvas />
    </main>
  );
}
