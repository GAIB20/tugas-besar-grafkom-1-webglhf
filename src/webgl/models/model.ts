import { resizeCanvasToDisplaySize } from "../utils";
import { TransformationMatrix3 } from "../utils/transformation";
import { Color } from "./primitives/color";
import { Point } from "./primitives/point";

export type SpecialAttribute = {
  name: string;
  type: string;
  setAttribute: (value: any) => void;
  getAttribute: () => any;
};

export abstract class Model {
  public isDrawing = false;
  public minX = 0;
  public minY = 0;
  public maxX = 0;
  public maxY = 0;
  public counter = 0;

  protected rotateAngleInRadians = 0;

  protected shearFactor = { x: 0, y: 0 };

  protected readonly center: Point = new Point(0, 0);
  abstract getType(): string;

  abstract setVertices(object: any, object2: any): void;

  abstract getSpecialAttributes(): SpecialAttribute[];

  abstract setGeometry(gl: WebGL2RenderingContext): void;

  abstract setColors(gl: WebGL2RenderingContext): void;

  abstract getVertices(): Point[];

  protected abstract setVerticeByIndex(vertice: Point, index: number): void;

  abstract count(): number;

  abstract drawMode(gl: WebGL2RenderingContext): number;

  abstract isPointInside(point: Point, tolerance: number): boolean;

  protected abstract computeCenter(): void;

  abstract clone(): Model;

  abstract movePoint(verticeIdx: number, newPosition: Point): void;

  getCenter(): Point {
    return this.center;
  }

  computeBoundingBox() {
    this.minX = Math.min(...this.getVertices().map((vertice) => vertice.x));
    this.minY = Math.min(...this.getVertices().map((vertice) => vertice.y));
    this.maxX = Math.max(...this.getVertices().map((vertice) => vertice.x));
    this.maxY = Math.max(...this.getVertices().map((vertice) => vertice.y));
  }

  // Draw the scene.
  draw(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    attributes: {
      positionBuffer: WebGLBuffer;
      positionLocation: number;
      colorBuffer: WebGLBuffer;
      colorLocation: number;
      matrixLocation: WebGLUniformLocation;
    },
    animate = false,
    options: {
      color: Color;
      translation: number[];
      angleInRadians: number;
      scale: number[];
    } = {
      color: new Color(0, 0, 0, 1),
      translation: [0, 0],
      angleInRadians: 0,
      scale: [1, 1],
      }    
  ) {
    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(attributes.positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, attributes.positionBuffer);
    // Set the geometry
    this.setGeometry(gl);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2; // 2 components per iteration
    var type = gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      attributes.positionLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Turn on the color attribute
    gl.enableVertexAttribArray(attributes.colorLocation);

    // Bind the color buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, attributes.colorBuffer);
    // Set the colors
    this.setColors(gl);

    // Tell the color attribute how to get data out of colorBuffer (ARRAY_BUFFER)
    var size = 4; // 4 components per iteration
    var type = gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      attributes.colorLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Compute the matrices
    let center = this.getCenter();
    let projectionMatrix = TransformationMatrix3.projection(
      gl.canvas.width,
      gl.canvas.height
    );
    let translationMatrix = TransformationMatrix3.translation(
      options.translation[0],
      options.translation[1]
    );
    let angleRotation = options.angleInRadians
    if (animate) {
      angleRotation += this.counter;
      this.counter += 0.05;
    }
    let rotationMatrix = TransformationMatrix3.rotation(angleRotation);
    let scaleMatrix = TransformationMatrix3.scaling(
      options.scale[0],
      options.scale[1]
    );

    // p' = Tp
    let matrix = scaleMatrix.multiply(rotationMatrix);

    matrix = TransformationMatrix3.translation(-center.x, -center.y)
      .multiply(
        matrix.multiply(TransformationMatrix3.translation(center.x, center.y))
      )
      .multiply(translationMatrix)
      .multiply(projectionMatrix)
      .transpose();

    // Set the matrix.
    gl.uniformMatrix3fv(attributes.matrixLocation, false, matrix.flatten());

    // Render the geometry.
    gl.drawArrays(this.drawMode(gl), 0, this.count());
  }

  setColorSolid(color: Color) {
    this.getVertices().forEach((vertice) => (vertice.color = color));
  }

  getVerticeByPosition(
    position: Point,
    tolerance: number = 10
  ): Point | undefined {
    return this.getVertices().find((vertice) =>
      vertice.withinTolerance(position, tolerance)
    );
  }

  getRotationAngleInRadians() {
    return this.rotateAngleInRadians;
  }

  translate(tx: number, ty: number) {
    const transformationMatrix = TransformationMatrix3.translation(
      tx,
      ty
    ).transpose();
    this.getVertices().forEach((vertice, index) => {
      const newVertice = transformationMatrix.multiplyPoint(vertice);
      newVertice.color = vertice.color;

      this.setVerticeByIndex(newVertice, index);
    });

    this.computeCenter();
  }

  rotate(angleInRadians: number) {
    this.rotateAngleInRadians += angleInRadians;
    const center = this.getCenter();
    const transformationMatrix = TransformationMatrix3.rotationPreserveCenter(
      angleInRadians,
      center
    ).transpose();

    this.getVertices().forEach((vertice, index) => {
      const newVertice = transformationMatrix.multiplyPoint(vertice);
      newVertice.color = vertice.color;

      this.setVerticeByIndex(newVertice, index);
    });
  }

  scale(sx: number, sy: number) {
    const transformationMatrix = TransformationMatrix3.scalingPreserveCenter(
      sx,
      sy,
      this.getCenter()
    ).transpose();

    this.getVertices().forEach((vertice, index) => {
      const newVertice = transformationMatrix.multiplyPoint(vertice);
      newVertice.color = vertice.color;

      this.setVerticeByIndex(newVertice, index);
    });
  }

  serialize() {
    const json = JSON.parse(JSON.stringify(this));
    json["type"] = this.getType();
    return json;
  }

  shear(shx: number, shy: number) {
    this.shearFactor = { x: shx, y: shy };
    const transformationMatrix = TransformationMatrix3.shearPreserveCenter(
      shx,
      shy,
      this.getCenter()
    ).transpose();

    this.getVertices().forEach((vertice, index) => {
      const newVertice = transformationMatrix.multiplyPoint(vertice);
      newVertice.color = vertice.color;

      this.setVerticeByIndex(newVertice, index);
    });
  }
}
