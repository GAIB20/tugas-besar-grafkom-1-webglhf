import { Model } from "./models/model";
import { fragmentShaderSource as defaultFragmentShaderSource } from "./shaders/fragment-shaders";
import { vertexShaderSource as defaultVertexShaderSource } from "./shaders/vertex-shaders";
import { createProgram } from "./utils/program";
import { createShader } from "./utils/shader";

export class Drawer {
  private readonly objects: Model[] = [];
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null | undefined = null;
  private attributes: {
    positionBuffer: WebGLBuffer;
    positionLocation: number;
    colorLocation: WebGLUniformLocation;
    matrixLocation: WebGLUniformLocation;
  } | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
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
    const colorLocation = this.gl.getUniformLocation(this.program, "u_color");
    const matrixLocation = this.gl.getUniformLocation(this.program, "u_matrix");

    if (
      !positionBuffer ||
      positionLocation === -1 ||
      !colorLocation ||
      !matrixLocation
    ) {
      console.error("Failed to create buffer or get location");
      return;
    }

    this.attributes = {
      positionBuffer: positionBuffer,
      positionLocation: positionLocation,
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

  addObject(object: Model) {
    this.objects.push(object);
    this.draw();
  }

  removeObject(object: Model) {
    const index = this.objects.indexOf(object);
    if (index > -1) {
      this.objects.splice(index, 1);
    }
  }

  draw() {
    if (!this.gl || !this.program || !this.attributes) {
      console.error("WebGL not supported");
      return;
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.attributes.positionBuffer);
    this.objects.forEach((object) => {
      if (!this.gl || !this.program || !this.attributes) {
        return;
      }
      console.log("Drawing object", object);
      object.setGeometry(this.gl as WebGL2RenderingContext);
      object.draw(
        this.gl as WebGL2RenderingContext,
        this.program!!,
        this.attributes!!
      );
    });
  }
}
