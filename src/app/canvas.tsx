"use client";

import { useEffect, useRef } from "react";
import { Rectangle } from "@/webgl/models/rectangle";
import { Drawer } from "@/webgl/drawer";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setupWebGL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setupWebGL() {
    console.log("Setting up WebGL");
    if (!canvasRef.current) {
      console.error("Canvas not found");
      return;
    }

    const drawer = new Drawer(canvasRef.current);
    const canvas = canvasRef.current;
    canvas.addEventListener("click", (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      drawGeometry(drawer, x, y, 50, 50);
    });

    console.log("WebGL setup complete");
  }

  function drawGeometry(
    drawer: Drawer,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const rectangle = new Rectangle(x, y, width, height);
    drawer.addObject(rectangle);
    drawer.draw();
  }

  return (
    <canvas
      ref={canvasRef}
      id="webgl-canvas"
      className="w-full h-full bg-white"
    />
  );
}
