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
  private readonly models: Model[] = [];
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null | undefined = null;
  private attributes: {
    positionBuffer: WebGLBuffer;
    positionLocation: number;
    colorBuffer: WebGLBuffer;
    colorLocation: number;
    matrixLocation: WebGLUniformLocation;
  } | null = null;

  private selectedModel: Model | null = null;
  public selector: SelectorConfig = {
    size: 8,
    color: new Color(0, 0, 0, 1),
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
  }

  getModels() {
    return this.models;
  }

  getSelectedModel() {
    return this.selectedModel;
  }

  draw() {
    if (!this.gl || !this.program || !this.attributes) {
      console.error("WebGL not supported");
      return;
    }

    console.log("Drawing", this.models);

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
        this.attributes!!
      );
    });

    this.drawSelectors();
  }

  private drawSelectors() {
    if (!this.gl || !this.program || !this.attributes || !this.selectedModel) {
      return;
    }

    this.selectedModel.getVertices().forEach((vertice) => {
      const halfSize = this.selector.size / 2;
      const startPoint = new Point(
        vertice.x + halfSize,
        vertice.y + halfSize,
        this.selector.color
      );
      const endPoint = new Point(
        vertice.x - halfSize,
        vertice.y - halfSize,
        this.selector.color
      );

      const selector = new Square(startPoint, endPoint);

      selector.draw(
        this.gl as WebGL2RenderingContext,
        this.program!!,
        this.attributes!!
      );
    });
  }

  getModelsByPosition(point: Point) {
    return this.models.filter((model) => model.isPointInside(point));
  }

  select(model: Model) {
    if (this.selectedModel) {
      this.unselect();
    }

    this.selectedModel = model;

    this.draw();
  }

  unselect() {
    this.selectedModel = null;
    this.draw();
  }
}
