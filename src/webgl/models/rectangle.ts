import { TransformationMatrix3 } from "../utils/transformation";
import { Model } from "./model";
import { Point } from "./primitives/point";

export class Rectangle extends Model {
  private readonly vertices: [Point, Point, Point, Point] = [
    new Point(0, 0),
    new Point(0, 0),
    new Point(0, 0),
    new Point(0, 0),
  ];

  private width: number = 0;
  private height: number = 0;

  constructor(
    startPoint: Point,
    endPoint: Point,
    private observers?: {
      onWidthChange: Function;
      onHeightChange: Function;
    }
  ) {
    super();
    this.computeVertices(startPoint, endPoint);
  }

  // static constructor from JSON
  static fromJSON(json: any): Rectangle {
    const rect = new Rectangle(new Point(0, 0), new Point(0, 0));
    const vertices = [
      json.vertices[0],
      json.vertices[1],
      json.vertices[2],
      json.vertices[3],
    ];
    vertices.forEach((vertice: Point, index: number) => {
      rect.setVerticeByIndex(Point.fromJSON(vertice), index);
    });

    rect.rotateAngleInRadians = json.rotateAngleInRadians;
    rect.computeCenter();
    // rect.width = json.width;
    // rect.height = json.height;

    return rect;
  }

  private computeDimensions() {
    this.width = this.vertices[0].euclideanDistanceTo(this.vertices[1]);
    this.height = this.vertices[1].euclideanDistanceTo(this.vertices[2]);

    this.observers?.onWidthChange(this.width);
    this.observers?.onHeightChange(this.height);
  }

  private computeVertices(startPoint: Point, endPoint: Point) {
    this.width = Math.abs(startPoint.x - endPoint.x);
    this.height = Math.abs(startPoint.y - endPoint.y);

    this.vertices[0].x = startPoint.x;
    this.vertices[0].y = startPoint.y;

    this.vertices[1].x =
      startPoint.x >= endPoint.x
        ? startPoint.x - this.width
        : startPoint.x + this.width;
    this.vertices[1].y = startPoint.y;

    this.vertices[2].x =
      startPoint.x >= endPoint.x
        ? startPoint.x - this.width
        : startPoint.x + this.width;
    this.vertices[2].y =
      startPoint.y >= endPoint.y
        ? startPoint.y - this.height
        : startPoint.y + this.height;

    this.vertices[3].x = startPoint.x;
    this.vertices[3].y =
      startPoint.y >= endPoint.y
        ? startPoint.y - this.height
        : startPoint.y + this.height;

    this.computeCenter();
    this.observers?.onWidthChange(this.width);
    this.observers?.onHeightChange(this.height);
  }

  protected computeCenter(): void {
    this.center.x = (this.vertices[0].x + this.vertices[2].x) / 2;
    this.center.y = (this.vertices[0].y + this.vertices[2].y) / 2;
  }

  clone(): Model {
    const rect = new Rectangle(new Point(0, 0), new Point(0, 0));
    this.vertices.forEach((vertice, index) => {
      rect.setVerticeByIndex(vertice.clone(), index);
    });

    rect.rotateAngleInRadians = this.rotateAngleInRadians;
    rect.computeCenter();
    rect.width = this.width;
    rect.height = this.height;

    return rect;
  }

  setVertices(startPoint: Point, endPoint: Point) {
    this.computeVertices(startPoint, endPoint);
  }

  protected setVerticeByIndex(vertice: Point, index: number) {
    this.vertices[index] = vertice;
    this.computeDimensions();
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  setWidth(width: number): void {
    const sx = width / this.width;

    this.scale(sx, sx);

    this.computeDimensions();
    this.computeCenter();
  }

  setHeight(height: number): void {
    const sy = height / this.height;

    this.scale(sy, sy);
    this.computeDimensions();
  }

  // setWidth(size: number) {
  //   throw new Error("Not implemented");
  // }

  // setHeight(size: number) {
  //   throw new Error("Not implemented");
  // }

  setGeometry(gl: WebGL2RenderingContext) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // First triangle
        ...this.vertices[0].toArray(),
        ...this.vertices[1].toArray(),
        ...this.vertices[2].toArray(),

        // Second triangle
        ...this.vertices[0].toArray(),
        ...this.vertices[2].toArray(),
        ...this.vertices[3].toArray(),
      ]),
      gl.STATIC_DRAW
    );
  }

  getType() {
    return "rectangle";
  }

  getSpecialAttributes() {
    return [
      {
        name: "width",
        type: "number",
        setAttribute: (value: number) => {
          this.setWidth(value);
        },
        getAttribute: () => {
          return this.getWidth();
        },
      },
      {
        name: "height",
        type: "number",
        setAttribute: this.setHeight,
        getAttribute: this.getHeight,
      },
    ];
  }

  getVertices(): Point[] {
    return this.vertices;
  }

  count() {
    return 6;
  }

  drawMode(gl: WebGL2RenderingContext) {
    return gl.TRIANGLES;
  }

  setColors(gl: WebGL2RenderingContext): void {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        ...this.vertices[0].color.toArray(),
        ...this.vertices[1].color.toArray(),
        ...this.vertices[2].color.toArray(),

        ...this.vertices[0].color.toArray(),
        ...this.vertices[2].color.toArray(),
        ...this.vertices[3].color.toArray(),
      ]),
      gl.STATIC_DRAW
    );
  }

  isPointInside(point: Point, tolerance: number): boolean {
    const nonRotatedRect = this.clone();
    nonRotatedRect.rotate(-this.rotateAngleInRadians);

    const rotatedPoint = TransformationMatrix3.rotationPreserveCenter(
      -this.rotateAngleInRadians,
      this.getCenter()
    )
      .transpose()
      .multiplyPoint(point);

    // Check if the point is inside non rotated square
    nonRotatedRect.computeBoundingBox();

    return (
      rotatedPoint.x >= nonRotatedRect.minX - tolerance &&
      rotatedPoint.x <= nonRotatedRect.maxX + tolerance &&
      rotatedPoint.y >= nonRotatedRect.minY - tolerance &&
      rotatedPoint.y <= nonRotatedRect.maxY + tolerance
    );
  }

  movePoint(verticeIdx: number, newPosition: Point) {
    const origRotate = this.rotateAngleInRadians;
    this.rotate(-this.rotateAngleInRadians);

    const rotatedPoint = TransformationMatrix3.rotationPreserveCenter(
      -origRotate,
      this.getCenter()
    )
      .transpose()
      .multiplyPoint(newPosition);
    newPosition = rotatedPoint;

    newPosition.color = this.vertices[verticeIdx].color;

    // Preserve diagonal aspect ratio
    let opposingDiag = (verticeIdx + 2) % 4;

    let diagonalYXRatio =
      (this.vertices[verticeIdx].y - this.vertices[opposingDiag].y) /
      (this.vertices[verticeIdx].x - this.vertices[opposingDiag].x);
    // console.log("diagonalYXRatio", diagonalYXRatio)
    const xShift = newPosition.x - this.vertices[verticeIdx].x;
    // console.log("xShift", xShift)

    newPosition.x = newPosition.x;
    newPosition.y = this.vertices[verticeIdx].y + xShift * diagonalYXRatio;

    this.vertices[verticeIdx] = newPosition;

    const prevVerticeIdx = verticeIdx === 0 ? 3 : verticeIdx - 1;
    const nextVerticeIdx = verticeIdx === 3 ? 0 : verticeIdx + 1;

    // Make sure previous and next vertice Idx point is a rectangle
    const prevVertice = this.vertices[prevVerticeIdx];
    const nextVertice = this.vertices[nextVerticeIdx];

    if (verticeIdx % 2 !== 0) {
      // prevVertice Y has to be equal with current vertice Y
      prevVertice.y = newPosition.y;

      // nextVertice X has to be equal with current vertice X
      nextVertice.x = newPosition.x;
    } else {
      // prevVertice X has to be equal with current vertice X
      prevVertice.x = newPosition.x;

      // nextVertice Y has to be equal with current vertice Y
      nextVertice.y = newPosition.y;
    }
    this.rotate(origRotate);
    this.computeDimensions();
    this.computeCenter();
  }

  // movePoint(verticeIdx: number, newPosition: Point) {
  //   const origRotate = this.rotateAngleInRadians;
  //   this.rotate(-this.rotateAngleInRadians);

  //   const rotatedPoint = TransformationMatrix3.rotationPreserveCenter(
  //     -this.rotateAngleInRadians,
  //     this.getCenter()
  //   )
  //     .transpose()
  //     .multiplyPoint(newPosition);
  //   newPosition = rotatedPoint;
  //   newPosition.color = this.vertices[verticeIdx].color;
  //   this.vertices[verticeIdx] = newPosition;

  //   const prevVerticeIdx = verticeIdx === 0 ? 3 : verticeIdx - 1;
  //   const nextVerticeIdx = verticeIdx === 3 ? 0 : verticeIdx + 1;

  //   // Make sure previous and next vertice Idx point is a rectangle
  //   const prevVertice = this.vertices[prevVerticeIdx];
  //   const nextVertice = this.vertices[nextVerticeIdx];

  //   if (verticeIdx % 2 !== 0) {
  //     // prevVertice Y has to be equal with current vertice Y
  //     prevVertice.y = newPosition.y;

  //     // nextVertice X has to be equal with current vertice X
  //     nextVertice.x = newPosition.x;
  //   } else {
  //     // prevVertice X has to be equal with current vertice X
  //     prevVertice.x = newPosition.x;

  //     // nextVertice Y has to be equal with current vertice Y
  //     nextVertice.y = newPosition.y;

  //   }
  //   this.rotate(origRotate);
  //   this.computeDimensions();
  //   this.computeCenter();
  // }
}
