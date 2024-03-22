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

  constructor(startPoint: Point, endPoint: Point) {
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
    rect.width = json.width;
    rect.height = json.height;

    return rect;
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
  }

  getWidth(): number {
    return this.width;
  }

  setWidth(size: number) {
    throw new Error("Not implemented");
  }

  getHeight(): number {
    return this.height;
  }

  setHeight(size: number) {
    throw new Error("Not implemented");
  }

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
}
