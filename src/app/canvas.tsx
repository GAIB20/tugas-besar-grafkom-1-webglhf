"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Drawer } from "@/webgl/drawer";
import { Square } from "@/webgl/models/square";
import { Point } from "@/webgl/models/primitives/point";
import { Model } from "@/webgl/models/model";
import { Color } from "@/webgl/models/primitives/color";
import { Translator } from "@/webgl/tools/translator";
import { Scaler } from "@/webgl/tools/scaler";
import { Rotator } from "@/webgl/tools/rotator";
import { Line } from "@/webgl/models/line";
import { Rectangle } from "@/webgl/models/rectangle";
import toast from "react-hot-toast";
import { PointMover } from "@/webgl/tools/pointMover";

type Mode = "draw" | "select" | "translate" | "rotate" | "scale" | "pointMover";
type ModelType = "line" | "rectangle" | "square" | "polygon";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawer, setDrawer] = useState<Drawer | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentDrawingModel, setCurrentDrawingModel] = useState<Model | null>(
    null
  );
  const [mode, setMode] = useState<Mode>("draw");
  const [objectToDraw, setObjectToDraw] = useState<ModelType>("line");
  const [color, setColor] = useState("#000000");

  const handleColorChange = (event: any) => {
    setColor(event.target.value);
    const { r, g, b } = hexToRGBA(event.target.value);

    const currentSelectedModel = drawer?.getSelectedModel();
    const currentSelectedVertice = drawer?.getSelectedVertice();

    if (currentSelectedModel && !currentSelectedVertice) {
      currentSelectedModel.setColorSolid(
        new Color(r / 255, g / 255, b / 255, 1)
      );
      drawer?.draw();
      return;
    }
    if (currentSelectedModel && currentSelectedVertice) {
      currentSelectedVertice.color = new Color(r / 255, g / 255, b / 255, 1);
      drawer?.draw();
      return;
    }
  };

  // Function to convert hexadecimal color to RGBA
  const hexToRGBA = (hex: any) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  // Tools
  const [translator, setTranslator] = useState<Translator | null>(null);
  const [rotator, setRotator] = useState<Rotator | null>(null);
  const [scaler, setScaler] = useState<Scaler | null>(null);
  const [pointMover, setPointMover] = useState<PointMover| null>(null);

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

  // @ts-ignore
  function getModel(e, rect): Model {
    if (objectToDraw === "line") {
      return new Line(
        new Point(e.clientX - rect.left, e.clientY - rect.top),
        new Point(e.clientX - rect.left, e.clientY - rect.top)
      );
    }

    if (objectToDraw === "rectangle") {
      return new Rectangle(
        new Point(e.clientX - rect.left, e.clientY - rect.top),
        new Point(e.clientX - rect.left, e.clientY - rect.top)
      );
    }

    if (objectToDraw === "square") {
      return new Square(
        new Point(e.clientX - rect.left, e.clientY - rect.top),
        new Point(e.clientX - rect.left, e.clientY - rect.top)
      );
    }
  }

  function handleDelete() {
    // If there is a selected model, delete it
    if (drawer?.getSelectedModel()) {
      const selectedModel = drawer.getSelectedModel() as Model;
      drawer?.unselect();
      drawer?.removeModel(selectedModel);
      drawer.draw();
      toast.success("Model deleted successfully!");
    }
  }

  function instantiateModel(jsonString: string) {
    const parsedJSON = JSON.parse(jsonString);

    if (parsedJSON.type === "line") {
      return Line.fromJSON(parsedJSON);
    } else if (parsedJSON.type === "rectangle") {
      return Rectangle.fromJSON(parsedJSON);
    } else if (parsedJSON.type === "square") {
      return Square.fromJSON(parsedJSON);
    }
  }

  function handleSave() {
    // Get all Models
    const models = drawer?.getModels();
    const modelsJSON = models?.map((model) => model.serialize());

    // Turn modelsJSON into a txt file
    const data = JSON.stringify(modelsJSON);
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "models.txt";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Models downloaded successfully!");
  }

  function handleLoad(event: ChangeEvent<HTMLInputElement>) {
    drawer?.clearAllModels();
    if (!event.target.files) {
      return;
    }

    const file = event.target.files[0]; // Get the first file from the list of uploaded files
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target?.result; // Read the contents of the file

      try {
        const modelsParsed = JSON.parse(data as string);

        for (const model of modelsParsed) {
          const loadedModel = instantiateModel(JSON.stringify(model));
          if (loadedModel) drawer?.addModel(loadedModel);
        }

        console.log(drawer?.getModels());
        toast.success("Models loaded successfully!");
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("Error loading models");
      }
    };

    reader.readAsText(file); // Read file as text
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

      const pointSelected = drawer?.getPointByPosition(
        new Point(e.clientX - rect.left, e.clientY - rect.top)
      );

      const selectedModel = models?.[models.length - 1];

      if (selectedModel) {
        drawer.select(selectedModel, pointSelected);
      } else if (mode === "select") {
        drawer?.unselect();
      }
      return;
    }

    if (mode === "pointMover" && pointMover && drawer.getSelectedVertice()) {
      pointMover.start(
        drawer.getSelectedModel() as Model,
        new Point(e.clientX - rect.left, e.clientY - rect.top)
      )
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

    if (mode === "scale" && scaler && drawer.getSelectedModel()) {
      console.log("MODE SCALER");
      scaler.start(
        drawer.getSelectedModel() as Model,
        new Point(e.clientX - rect.left, e.clientY - rect.top)
      );
      return;
    }

    const model = getModel(e, rect);

    model.isDrawing = true;
    drawer.addModel(model);

    model.getVertices().forEach((point, index) => {
      point.color = colors[index];
    });

    setCurrentDrawingModel(model);
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

    if (mode === "scale" && scaler) {
      console.log("MOVING SCALER");
      scaler.move(new Point(e.clientX - rect!.left, e.clientY - rect!.top));
      return;
    }

    if (mode === "pointMover" && pointMover) {
      pointMover.move(new Point(e.clientX - rect!.left, e.clientY - rect!.top));
      return;
    }

    if (!startPoint || !currentDrawingModel) {
      return;
    }

    console.log("ON MOUSE MOVE" + mode);
    let model = currentDrawingModel as Model;
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

    if (currentDrawingModel) {
      let model = currentDrawingModel as Model;
      model.isDrawing = false;
    }

    if (mode === "translate" && translator) {
      translator.end();
    }

    if (mode === "rotate" && rotator) {
      rotator.end();
    }

    if (mode === "scale" && scaler) {
      console.log("ENDING SCALER");
      scaler.end();
    }

    if (mode === "pointMover" && pointMover) {
      pointMover.end();
    }

    setCurrentDrawingModel(null);
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

  function handleScale() {
    setMode("scale");
    clear();
    if (drawer) setScaler(new Scaler(drawer));
  }

  function handlePointMover() {
    if (drawer?.getSelectedVertice() === null) {
      toast.error("Please select a point to move");
      return;
    }
    setMode("pointMover");
    clear();
    if (drawer) setPointMover(new PointMover(drawer));
  }

  function handleRotate() {
    setMode("rotate");
    clear();
    if (drawer) setRotator(new Rotator(drawer));
  }

  function clear() {
    setStartPoint(null);
    setCurrentDrawingModel(null);
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
        <label htmlFor="objectToDraw">Select Drawing Option:</label>
        <select
          id="objectToDraw"
          value={objectToDraw}
          onChange={(event) => setObjectToDraw(event.target.value as ModelType)}
          className="bg-blue-500 p-2"
        >
          <option value="line">Line</option>
          <option value="rectangle">Rectangle</option>
          <option value="square">Square</option>
          <option value="polygon">Polygon [WIP]</option>
        </select>
        <button className="bg-blue-500 p-2" onClick={handleSelect}>
          Select
        </button>
        <button className="bg-blue-500 p-2" onClick={handlePointMover}>
          Point Mover
        </button>
        <button className="bg-blue-500 p-2" onClick={handleTranslate}>
          Translate
        </button>
        <button className="bg-blue-500 p-2" onClick={handleScale}>
          Scaler [WIP]
        </button>
        <button className="bg-blue-500 p-2" onClick={handleRotate}>
          Rotate
        </button>
        <button className="bg-blue-500 p-2" onClick={handleDelete}>
          Delete
        </button>
        <button
          className="bg-blue-500 p-2"
          onClick={() => {
            drawer?.clearAllModels();
            toast.success("Canvas cleared!");
          }}
        >
          Reset Canvas
        </button>
        <button className="bg-blue-500 p-2" onClick={handleSave}>
          Save
        </button>
        <div>
          <h1>Load Models</h1>
          <input type="file" accept=".txt" onChange={handleLoad} />
        </div>
        <input type="color" value={color} onChange={handleColorChange} />
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
