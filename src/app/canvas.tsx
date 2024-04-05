"use client";

import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
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
// @ts-ignore
import Modal from "react-modal";
import { Polygon } from "@/webgl/models/polygon";
import { Union } from "@/webgl/tools/union";

type Mode = "draw" | "select" | "translate" | "rotate" | "pointMover" | "scale" | "union";
type ModelType = "line" | "rectangle" | "square" | "polygon";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawer, setDrawer] = useState<Drawer | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentDrawingModel, setCurrentDrawingModel] = useState<Model | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enableAutoConvexHull, setEnableAutoConvexHull] = useState<Boolean>(true);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const [mode, setMode] = useState<Mode>("draw");
  const [objectToDraw, setObjectToDraw] = useState<ModelType>("line");
  const [color, setColor] = useState("#000000");

  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  const [selectedModelType, setSelectedModelType] = useState<ModelType | null>(
    null
  );

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
  const [pointMover, setPointMover] = useState<PointMover | null>(null);
  const [union, setUnion] = useState<Union | null>(null);

  // default colors
  const [colors, setColors] = useState<Color[]>([
    new Color(Math.random(), Math.random(), Math.random(), 1),
    new Color(Math.random(), Math.random(), Math.random(), 1),
    new Color(Math.random(), Math.random(), Math.random(), 1),
    new Color(Math.random(), Math.random(), Math.random(), 1),
  ]);

  useEffect(() => {
    setupWebGL();
  }, []);

  const mapModeToTool = {
    translate: translator,
    rotate: rotator,
    scale: scaler,
    pointMover: pointMover,
    union: union,
  };

  function randomizeColors() {
    return [
      new Color(Math.random(), Math.random(), Math.random(), 1),
      new Color(Math.random(), Math.random(), Math.random(), 1),
      new Color(Math.random(), Math.random(), Math.random(), 1),
      new Color(Math.random(), Math.random(), Math.random(), 1),
    ];
  }

  function setupWebGL() {
    console.log("Setting up WebGL");
    if (!canvasRef.current) {
      console.error("Canvas not found");
      return;
    }

    const drawer = new Drawer(canvasRef.current);
    setDrawer(drawer);
  }

  function getModel(
    e: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>,
    rect: DOMRect
  ): Model | null {
    switch (objectToDraw) {
      case "line":
        return new Line(
          new Point(e.clientX - rect.left, e.clientY - rect.top),
          new Point(e.clientX - rect.left, e.clientY - rect.top),
          {
            onWidthChange: (width: number) => setWidth(Math.round(width)),
          }
        );
      case "rectangle":
        return new Rectangle(
          new Point(e.clientX - rect.left, e.clientY - rect.top),
          new Point(e.clientX - rect.left, e.clientY - rect.top),
          {
            onWidthChange: (width: number) => setWidth(Math.round(width)),
            onHeightChange: (height: number) => setHeight(Math.round(height)),
          }
        );
      case "square":
        return new Square(
          new Point(e.clientX - rect.left, e.clientY - rect.top),
          new Point(e.clientX - rect.left, e.clientY - rect.top),
          {
            onSizeChange: (size: number) => setWidth(Math.round(size)),
          }
        );
      case "polygon":
        return null;
      default:
        toast.error("Model is not supported");
        return null;
    }
  }

  function handleDelete() {
    // If there is a selected model, delete it
    if (drawer?.getSelectedModel()) {
      const selectedModel = drawer.getSelectedModel() as Model;
      drawer?.unselect();
      setSelectedModelType(null);
      drawer?.removeModel(selectedModel);
      drawer.draw();
      toast.success("Model deleted successfully!");
    }
  }

  function instantiateModel(jsonString: string) {
    const parsedJSON = JSON.parse(jsonString);

    switch (parsedJSON.type) {
      case "line":
        return Line.fromJSON(parsedJSON);
      case "rectangle":
        return Rectangle.fromJSON(parsedJSON);
      case "square":
        return Square.fromJSON(parsedJSON);
      case "polygon":
        return Polygon.fromJSON(parsedJSON);
      default:
        toast.error("Invalid model selected!");
        return;
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

  function handleMouseDown(
    e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) {
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
        setSelectedModelType(selectedModel.getType() as ModelType);
      } else if (mode === "select") {
        drawer?.unselect();
        setSelectedModelType(null);
      }
      return;
    }

    if (mode !== "draw") {
      if (mode === "pointMover" && !drawer.getSelectedVertice()) {
        toast.error("Please select a point to move");
        return;
      }

      const tool = mapModeToTool[mode];
      if (tool && mode !== "union") {
        tool.start(
          drawer.getSelectedModel() as Model,
          new Point(e.clientX - rect.left, e.clientY - rect.top)
        );
        return;
      }
    }

    if (mode === "draw" && (objectToDraw === "polygon" || drawer.getSelectedModel()?.getType() === "polygon")){
      console.log("DRAWING POLYGON POINTS")
      if (drawer.getSelectedModel() === null){
        console.log("NULL")
        const model = new Polygon();
        model.addVertice(new Point(e.clientX - rect.left, e.clientY - rect.top));
        if (enableAutoConvexHull) model.doConvexHull();
        model.isDrawing = true;
        drawer.addModel(model);
        drawer.select(model);
      } else {
        const model = drawer.getSelectedModel() as Polygon;
        model.addVertice(new Point(e.clientX - rect.left, e.clientY - rect.top));
        if (enableAutoConvexHull) model.doConvexHull();
      }
      drawer.draw();
    }

    if (mode === "union" && union) {
      // If we want to only unify two models uncomment this part
      // if (union.getBufferSize() > 1) {
      //   toast.error("You have already selected two models.");
      //   return;
      // }

      const model = getModelAtPosition(e.clientX, e.clientY);
      if (model) {
        union?.addModelToUnion(model);
        toast.success("Model added to union operation.");
      }
    }

    const model = getModel(e, rect);

    if (!model) {
      console.error("Model not found");
      return;
    }

    model.isDrawing = true;
    drawer.addModel(model);

    setColors(randomizeColors());
    model.getVertices().forEach((point, index) => {
      point.color = colors[index];
    });

    setCurrentDrawingModel(model);
    setStartPoint(new Point(e.clientX - rect!.left, e.clientY - rect!.top));
  }

  function getModelAtPosition(x: number, y: number): Model | null {
    if (!drawer || !canvasRef.current) return null;

    const rect = canvasRef.current.getBoundingClientRect();
    const point = new Point(x - rect.left, y - rect.top);

    const models = drawer.getModels();

    for (let i = models.length - 1; i >= 0; i--) {
        const model = models[i];
        if (model.isPointInside(point, 10)) {
            return model;
        }
    }

    return null;
}

  function handleMouseMove(
    e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) {
    if (!drawer || !canvasRef.current) {
      return;
    }
    const gl = drawer.getGl();
    if (!gl) {
      console.error("WebGL not found");
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();

    if (mode !== "draw") {
      // @ts-ignore
      const tool = mapModeToTool[mode];
      if (tool) {
        tool.move(new Point(e.clientX - rect!.left, e.clientY - rect!.top));
        return;
      }
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

  function handleMouseUp(
    e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) {
    console.log("Mouse up", e.clientX, e.clientY);

    if (currentDrawingModel) {
      let model = currentDrawingModel as Model;
      model.isDrawing = false;
    }

    // if selected model, update dims
    if (drawer?.getSelectedModel()) {
      const selectedModel = drawer.getSelectedModel() as Model;
      if (selectedModel.getType() === "line") {
        const line = selectedModel as Line;
        setWidth(Math.round(line.getWidth()));
      } else if (selectedModel.getType() === "square") {
        const square = selectedModel as Square;
        setWidth(Math.round(square.getSize()));
      } else if (selectedModel.getType() === "rectangle") {
        const rectangle = selectedModel as Rectangle;
        setWidth(Math.round(rectangle.getWidth()));
        setHeight(Math.round(rectangle.getHeight()));
      }
    }

    if (mode !== "draw") {
      // @ts-ignore
      const tool = mapModeToTool[mode];
      if (tool) {
        tool.end();
      }
    }

    setCurrentDrawingModel(null);
    setStartPoint(null);
  }

  function handleDoubleClick(e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>) {
    drawer?.unselect();
  }

  function notifyChange(width?: number, height?: number) {
    if (!width || !height) {
      toast.error("Width and Height must be greater than 0");
      return;
    }

    if (!drawer) {
      return;
    }

    if (width < 10 || height < 10) {
      toast.error("Width and Height must be greater than 10");
      return;
    }
    console.log("NOTIFYING CHANGE" + width + " " + height);

    const selectedModel = drawer.getSelectedModel();
    switch (selectedModel?.getType()) {
      case "line":
        const line = selectedModel as Line;
        line.setWidth(width);
        break;
      case "square":
        const square = selectedModel as Square;
        square.setSize(width);
        break;
      case "rectangle":
        const rectangle = selectedModel as Rectangle;
        rectangle.setWidth(width);
        rectangle.setHeight(height);
        break;
      default:
        toast.error("Model is not supported for this operation.")
        break;
    }

    drawer.draw();
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

  function handleScale() {
    setMode("scale");
    clear();
    if (drawer) setScaler(new Scaler(drawer));
  }

  function handleUnion() {
    setMode("union");
    clear();
    if (drawer) setUnion(new Union(drawer));
  }

  function clear() {
    setStartPoint(null);
    setCurrentDrawingModel(null);
    setTranslator(null);
    setRotator(null);
  }

  const handleOperatorSelect = (selectedOption: Mode) => {
    // @ts-ignore
    if (selectedOption !== "animate") {
      drawer?.setAnimate(false);
    }
    switch (selectedOption) {
      // @ts-ignore
      case "animate":
        drawer?.unselect();
        drawer?.setAnimate(true);
        // @ts-ignore
        setMode("animate");
        break;
      case "select":
        handleSelect();
        break;
      case "pointMover":
        handlePointMover();
        break;
      case "translate":
        handleTranslate();
        break;
      case "rotate":
        handleRotate();
        break;
      case "scale":
        handleScale();
        break;
      case "draw":
        setMode("draw");
        clear();
        if (drawer?.getSelectedModel()?.getType() === "polygon") {
          break;
        }
        drawer?.unselect();
        break;
      case "union":
        handleUnion();
        break;
      default:
        break;
    }
  };

  function executeUnionOperation() {
    if (union && union.getBufferSize() < 2) {
      toast.error("You must select two models to unify.");
      return;
    }
    
    if (union) {
        union.executeUnion();
        toast.success("Union operation completed.");
    }
  }

  const renderModelOptions = () => {
    if (selectedModelType === "line" || selectedModelType === "square") {
      return (
        <div>
          <label htmlFor="lineWidth" className="text-md font-semibold">
            Width:{" "}
          </label>
          <input
            id="lineWidth"
            type="number"
            value={width}
            onChange={(e) => {
              setWidth(parseInt(e.target.value));
              notifyChange(parseInt(e.target.value), parseInt(e.target.value));
            }}
            className="p-1 border border-gray-300 rounded-md text-black"
          />
        </div>
      );
    } else if (selectedModelType === "rectangle") {
      return (
        <div>
          <label htmlFor="rectangleHeight" className="text-md font-semibold">
            Height:{" "}
          </label>
          <input
            id="rectangleHeight"
            type="number"
            value={height}
            onChange={(e) => {
              setHeight(parseInt(e.target.value));
              notifyChange(width, parseInt(e.target.value));
            }}
            className="p-1 border border-gray-300 rounded-md text-black"
          />
          <br />
          <label htmlFor="rectangleWidth" className="text-md font-semibold">
            Width:{" "}
          </label>
          <input
            id="rectangleWidth"
            type="number"
            value={width}
            onChange={(e) => {
              setWidth(parseInt(e.target.value));
              notifyChange(parseInt(e.target.value), height);
            }}
            className="p-1 border border-gray-300 rounded-md text-black"
          />
        </div>
      );
    } else if (selectedModelType === "polygon") {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button
            className="bg-blue-500 p-2 rounded-md text-white mt-2"
            onClick={() => {
              const selectedModel = drawer?.getSelectedModel() as Polygon;
              if (selectedModel) {
                selectedModel.doConvexHull();
                drawer?.draw();
                toast.success("Successfully created a convex hull")
              }
            }}
          >
            Convex Hull
          </button>
          <button
            className="bg-blue-500 p-2 rounded-md text-white mt-2"
            onClick={() => {
              if (!drawer?.getSelectedVertice()) {
                toast.error("Please select a vertice to delete");
                return;
              }
              const selectedModel = drawer?.getSelectedModel() as Polygon;
              const selectedVertice = drawer?.getSelectedVertice();
              if (selectedModel && selectedVertice) {
                selectedModel.deleteVertice(selectedVertice);
                drawer?.draw();
                toast.success("Point deleted successfully!");
              }
            }}
          >
            Delete Point
          </button>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        id="webgl-canvas"
        className="w-full h-full bg-gray-200"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />

      <div className="flex flex-col h-full rounded-md bg-gray-black p-4">
        <label
          htmlFor="objectToDraw"
          className="text-base font-semibold text-white mb-2"
        >
          Select Drawing Option:
        </label>
        <select
          id="objectToDraw"
          value={objectToDraw}
          onChange={(event) => {
            drawer?.unselect();
            setObjectToDraw(event.target.value as ModelType);
            setMode("draw");
          }}
          className="bg-blue-500 p-2 rounded-md text-white mb-2"
        >
          <option value="line">Draw Line</option>
          <option value="rectangle">Draw Rectangle</option>
          <option value="square">Draw Square</option>
          <option value="polygon">Draw Polygon</option>
        </select>

        { (objectToDraw === "polygon") &&
          (
            <button
              className={`${enableAutoConvexHull ? 'bg-red-500' : 'bg-green-500'} p-2 rounded-md text-white mb-2`}
              onClick={ (_) => {
                  setEnableAutoConvexHull(!enableAutoConvexHull)
                }
              }
              >
                {enableAutoConvexHull ? 'Disable Auto Convex Hull' : 'Enable Auto Convex Hull'}
            </button>
          )
        }

        <label
          htmlFor="mode"
          className="text-base font-semibold text-white mb-2"
        >
          Select Operation:
        </label>
        <select
          id="mode"
          value={mode}
          onChange={(event) => handleOperatorSelect(event.target.value as Mode)}
          className="bg-blue-500 p-2 rounded-md text-white mb-2"
        >
          <option value="draw">Draw Mode</option>
          <option value="select">Select Mode</option>
          <option value="pointMover">Point Mover Mode</option>
          <option value="translate">Translate Mode</option>
          <option value="rotate">Rotate Mode</option>
          <option value="scale">Scale Mode</option>
          <option value="union">Union Mode</option>
          <option value="animate">Animate!</option>
        </select>

        { (mode === "union") &&
          (
            <button
              className="bg-red-500 p-2 rounded-md text-white mb-2"
              onClick={() => {
                executeUnionOperation();
              }}
            >
              Merge/Unify Models
            </button>
          ) 
        } 

        <button
          className="bg-blue-500 p-2 rounded-md text-white mb-2"
          onClick={() => {
            drawer?.clearAllModels();
            toast.success("Canvas cleared!");
          }}
        >
          Reset Canvas
        </button>
        <button
          className="bg-blue-500 p-2 rounded-md text-white mb-2"
          onClick={handleSave}
        >
          Save Canvas
        </button>
        <div className="mb-2">
          <h1 className="text-base font-semibold text-white mb-1">
            Load Models from File
          </h1>
          <input type="file" accept=".txt" onChange={handleLoad} />
        </div>
        <label className="text-base font-semibold text-white mb-2">
          Color picker:
        </label>
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          className="rounded-md mb-1"
        />

        <button
          className="bg-blue-500 p-2 rounded-md text-white mb-2"
          onClick={openModal}
        >
          Help!
        </button>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Help Modal"
          ariaHideApp={false}
          style={{
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            content: {
              backgroundColor: "gray",
              color: "white",
              width: "500px",
              height: "500px",
              margin: "auto",
              padding: "20px",
              borderRadius: "8px",
            },
          }}
        >
          <h2 className="text-xl font-semibold mb-4">Tubes Grafkom 1 - GLHF</h2>
          <p className="mb-2">
            Here are some of the functionalities of the app:
          </p>
          <ul className="text-left mb-4">
            <li>
              Use the dropdowns to select the drawing option and operation mode.
            </li>
            <li>Draw shapes on the canvas by clicking and dragging.</li>
            <li>Select drawn objects by clicking on them.</li>
            <li>
              Perform operations like translate, rotate, or delete on selected
              objects.
            </li>
            <li>
              If a point is selected, it can be moved while preserving geometry
              (except for polygons).
            </li>
            <li>
              Change the color of selected models or points using the color
              picker.
            </li>
            <li>Save and reload models from files.</li>
            <li>
              Each selected object has its own properties like width/height that
              can be changed.
            </li>
          </ul>
          <button
            onClick={closeModal}
            className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4"
          >
            Got it!
          </button>
        </Modal>

        <label className="text-base font-semibold text-white mb-2">
          Selected model options:
        </label>
        {renderModelOptions()}
        {drawer?.getSelectedModel() && (
          <button
            className="bg-blue-500 p-2 rounded-md text-white mt-2"
            onClick={handleDelete}
          >
            Delete Model
          </button>
        )}
      </div>
    </>
  );
}
