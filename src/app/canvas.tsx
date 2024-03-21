"use client";

import { useEffect, useRef, useState } from "react";
import { Drawer } from "@/webgl/drawer";
import { Square } from "@/webgl/models/square";
import { Point } from "@/webgl/models/primitives/point";
import { Model } from "@/webgl/models/model";
import { Color } from "@/webgl/models/primitives/color";
import { Translator } from "@/webgl/tools/translator";
import { Rotator } from "@/webgl/tools/rotator";
import { Line } from "@/webgl/models/line";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawer, setDrawer] = useState<Drawer | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const [mode, setMode] = useState<"draw" | "select" | "translate" | "rotate">(
    "draw"
  );

  // Tools
  const [translator, setTranslator] = useState<Translator | null>(null);
  const [rotator, setRotator] = useState<Rotator | null>(null);

  const colors = [
    new Color(Math.random(), Math.random(), Math.random(), 1),
    new Color(Math.random(), Math.random(), Math.random(), 1),
    new Color(Math.random(), Math.random(), Math.random(), 1),
    new Color(Math.random(), Math.random(), Math.random(), 1),
  ];

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
    setDrawer(drawer);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    console.log("Mouse down", e.clientX, e.clientY);
    if (canvasRef.current === null || !drawer) {
      return;
    }
    const gl = drawer.getGl();
    if (!gl) {
      console.error("WebGL not found");
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    if (mode === "select") {
      const models = drawer?.getModelsByPosition(
        new Point(e.clientX - rect.left, e.clientY - rect.top)
      );

      const selectedModel = models?.[models.length - 1];

      if (selectedModel) {
        drawer.select(selectedModel);
      } else if (mode === "select") {
        drawer?.unselect();
      }
      return;
    }

    if (mode === "translate" && translator && drawer.getSelectedModel()) {
      translator.start(
        drawer.getSelectedModel() as Model,
        new Point(e.clientX - rect.left, e.clientY - rect.top)
      );
      return;
    }

    if (mode === "rotate" && rotator && drawer.getSelectedModel()) {
      rotator.start(
        drawer.getSelectedModel() as Model,
        new Point(e.clientX - rect.left, e.clientY - rect.top)
      );
      return;
    }

    const model = new Line(
      new Point(e.clientX - rect.left, e.clientY - rect.top),
      new Point(e.clientX - rect.left, e.clientY - rect.top)
    );
    model.isDrawing = true;
    drawer.addModel(model);

    model.getVertices().forEach((point, index) => {
      point.color = colors[index];
    });

    setCurrentModel(model);
    setStartPoint(new Point(e.clientX - rect!.left, e.clientY - rect!.top));
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!drawer || !canvasRef.current) {
      return;
    }
    const gl = drawer.getGl();
    if (!gl) {
      console.error("WebGL not found");
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();

    if (mode === "translate" && translator) {
      translator.move(new Point(e.clientX - rect!.left, e.clientY - rect!.top));
      return;
    }

    if (mode === "rotate" && rotator) {
      rotator.move(new Point(e.clientX - rect!.left, e.clientY - rect!.top));
      return;
    }

    if (!startPoint || !currentModel) {
      return;
    }
    let model = currentModel as Line;
    model.setVertices(
      startPoint,
      new Point(e.clientX - rect!.left, e.clientY - rect!.top)
    );

    model.getVertices().forEach((point, index) => {
      point.color = colors[index];
    });

    drawer.draw();
  }

  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    console.log("Mouse up", e.clientX, e.clientY);

    if (currentModel) {
      let model = currentModel as Line;
      model.isDrawing = false;
    }

    if (mode === "translate" && translator) {
      translator.end();
    }

    if (mode === "rotate" && rotator) {
      rotator.end();
    }

    setCurrentModel(null);
    setStartPoint(null);
  }

  function handleSelect() {
    setMode("select");
    clear();
  }

  function handleTranslate() {
    setMode("translate");
    clear();
    if (drawer) setTranslator(new Translator(drawer));
  }

  function handleRotate() {
    setMode("rotate");
    clear();
    if (drawer) setRotator(new Rotator(drawer));
  }

  function clear() {
    setStartPoint(null);
    setCurrentModel(null);
    setTranslator(null);
    setRotator(null);
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        id="webgl-canvas"
        className="w-full h-full bg-gray-400"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div className="flex flex-row gap-5">
        <button className="bg-blue-500 p-2" onClick={handleSelect}>
          Select
        </button>
        <button className="bg-blue-500 p-2" onClick={handleTranslate}>
          Translate
        </button>
        <button className="bg-blue-500 p-2" onClick={handleRotate}>
          Rotate
        </button>
        <button
          className="bg-blue-500 p-2"
          onClick={() => {
            setMode("draw");
            clear();
            drawer?.unselect();
          }}
        >
          Draw
        </button>
      </div>
    </>
  );
}