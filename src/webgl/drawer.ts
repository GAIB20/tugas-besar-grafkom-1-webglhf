import { Model } from "./models/model";
import { Color } from "./models/primitives/color";
import { Point } from "./models/primitives/point";
import { Square } from "./models/square";
import { fragmentShaderSource as defaultFragmentShaderSource } from "./shaders/fragment-shaders";
import { vertexShaderSource as defaultVertexShaderSource } from "./shaders/vertex-shaders";
import { createProgram } from "./utils/program";
import { createShader } from "./utils/shader";

interface SelectorConfig {
  size: number;
  color: Color;
}

export class Drawer {
  private models: Model[] = [];
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null | undefined = null;
  private attributes: {
    positionBuffer: WebGLBuffer;
    positionLocation: number;
    colorBuffer: WebGLBuffer;
    colorLocation: number;
    matrixLocation: WebGLUniformLocation;
  } | null = null;
  private animate = false;

  private selectedModel: Model | null = null;
  private selectedVertice: Point | null = null;
  public selector: SelectorConfig = {
    size: 8,
    color: new Color(0, 0, 0, 1),
  };
  public pointSelector: SelectorConfig = {
    size: 8,
    color: new Color(215, 0, 64, 1),
  };

  constructor(
    canvas: HTMLCanvasElement,
    vertexShaderSource: string = defaultVertexShaderSource,
    fragmentShaderSource: string = defaultFragmentShaderSource
  ) {
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }

    this.gl = canvas.getContext("webgl2");

    if (!this.gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShader = createShader(
      this.gl,
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );

    const fragmentShader = createShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    if (!vertexShader || !fragmentShader) {
      console.error("Failed to create shaders");
      return;
    }

    this.program = createProgram(this.gl, vertexShader, fragmentShader);

    if (!this.program) {
      console.error("Failed to create program");
      return;
    }

    const positionBuffer = this.gl.createBuffer();
    const positionLocation = this.gl.getAttribLocation(
      this.program,
      "a_position"
    );
    const colorBuffer = this.gl.createBuffer();
    const colorLocation = this.gl.getAttribLocation(this.program, "a_color");
    const matrixLocation = this.gl.getUniformLocation(this.program, "u_matrix");

    if (
      !positionBuffer ||
      positionLocation === -1 ||
      !colorLocation ||
      !matrixLocation ||
      !colorBuffer
    ) {
      console.error("Failed to create buffer or get location");
      return;
    }

    this.attributes = {
      positionBuffer: positionBuffer,
      positionLocation: positionLocation,
      colorBuffer: colorBuffer,
      colorLocation: colorLocation,
      matrixLocation: matrixLocation,
    };
  }

  toggleAnimate() {
    this.animate = !this.animate;
    console.log("Toggling animate" + this.animate)
    this.draw();
  }

  getGl() {
    return this.gl;
  }

  getProgram() {
    return this.program;
  }

  addModel(model: Model) {
    this.models.push(model);
    this.draw();
  }

  removeModel(model: Model) {
    const index = this.models.indexOf(model);
    if (index > -1) {
      this.models.splice(index, 1);
    }
    this.draw();
  }

  clearAllModels() {
    this.models = [];
    this.selectedModel = null;
    this.selectedVertice = null;
    this.draw();
  }

  getModels() {
    return this.models;
  }

  getSelectedModel() {
    return this.selectedModel;
  }

  getSelectedVertice() {
    return this.selectedVertice;
  }

  getSelectedVerticeIndex() {
    if (!this.selectedModel || !this.selectedVertice) {
      console.log("No model or vertice selected")
      return -1;
    }

    console.log("FINDING")

    return this.selectedModel.getVertices().findIndex((vertice) => {
      console.log("VERTICE", vertice, this.selectedVertice)
      console.log("WITHIN TOLERANCE", vertice.withinTolerance(this.selectedVertice!));
      // @ts-ignore
      return vertice.withinTolerance(this.selectedVertice)
    }
    );
  }

  draw() {
    if (!this.gl || !this.program || !this.attributes) {
      console.error("WebGL not supported");
      return;
    }
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.models.forEach((model) => {
      if (!this.gl || !this.program || !this.attributes) {
        return;
      }
      // if all vertices is equal, then don't add
      if (
        !model.isDrawing &&
        model
          .getVertices()
          .every((vertex) => vertex.isEqualsTo(model.getCenter()))
      ) {
        this.removeModel(model);
        return;
      }

      // console.log("Drawing model", model);
      model.draw(
        this.gl as WebGL2RenderingContext,
        this.program!!,
        this.attributes!!,
        this.animate
      );
    });

    this.drawSelectors();
    if (this.animate) {
      console.log("ANIMATING");
      setTimeout(() => {
        requestAnimationFrame(() => this.draw());
      }, 1000 / 10);
    }
  }

  private drawSelectors() {
    if (!this.gl || !this.program || !this.attributes || !this.selectedModel) {
      return;
    }

    this.selectedModel.getVertices().forEach((vertice) => {
      console.log("Drawing selector", vertice, this.selectedVertice);
      let colorToUse = this.selector.color;
      if (this.selectedVertice && vertice?.isEqualsTo(this.selectedVertice)) {
        colorToUse = this.pointSelector.color;
      }
      console.log("Drawing selector w/color", vertice, colorToUse);
      const halfSize = this.selector.size / 2;
      const startPoint = new Point(vertice.x + halfSize, vertice.y + halfSize);
      const endPoint = new Point(vertice.x - halfSize, vertice.y - halfSize);

      const selector = new Square(startPoint, endPoint);
      selector.setColorSolid(colorToUse);

      selector.draw(
        this.gl as WebGL2RenderingContext,
        this.program!!,
        this.attributes!!
      );
    });
  }

  getModelsByPosition(point: Point, tolerance: number = 8) {
    return this.models.filter((model) => model.isPointInside(point, tolerance));
  }

  getPointByPosition(point: Point) {
    const relatedModel = this.getModelsByPosition(point);
    return relatedModel[0]?.getVerticeByPosition(point);
  }

  select(model: Model, point: Point | null = null) {
    if (this.selectedModel) {
      this.unselect();
    }

    this.selectedModel = model;
    this.selectedVertice = point;

    this.draw();
  }

  unselect() {
    this.selectedModel = null;
    this.draw();
  }
}
