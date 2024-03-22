import { TransformationMatrix3 } from "../utils/transformation";
import { Model } from "./model";
import { Color } from "./primitives/color";
import { Point } from "./primitives/point";

export class Square extends Model {
  private readonly vertices: [Point, Point, Point, Point] = [
    new Point(0, 0),
    new Point(0, 0),
    new Point(0, 0),
    new Point(0, 0),
  ];

  private size: number = 0;

  constructor(startPoint: Point, endPoint: Point) {
    super();
    this.computeVertices(startPoint, endPoint);
  }

  private computeVertices(startPoint: Point, endPoint: Point) {
    this.size = Math.max(
      Math.abs(startPoint.x - endPoint.x),
      Math.abs(startPoint.y - endPoint.y)
    );

    // p0 -- p1
    // |      |
    // p3 -- p2

    this.vertices[0].x = startPoint.x;
    this.vertices[0].y = startPoint.y;

    this.vertices[1].x =
      startPoint.x >= endPoint.x
        ? startPoint.x - this.size
        : startPoint.x + this.size;
    this.vertices[1].y = startPoint.y;

    this.vertices[2].x =
      startPoint.x >= endPoint.x
        ? startPoint.x - this.size
        : startPoint.x + this.size;
    this.vertices[2].y =
      startPoint.y >= endPoint.y
        ? startPoint.y - this.size
        : startPoint.y + this.size;

    this.vertices[3].x = startPoint.x;
    this.vertices[3].y =
      startPoint.y >= endPoint.y
        ? startPoint.y - this.size
        : startPoint.y + this.size;

    this.computeCenter();
  }

  protected computeCenter() {
    this.center.x = (this.vertices[0].x + this.vertices[2].x) / 2;
    this.center.y = (this.vertices[0].y + this.vertices[2].y) / 2;
  }

  setVertices(startPoint: Point, endPoint: Point) {
    this.computeVertices(startPoint, endPoint);
  }

  protected setVerticeByIndex(vertice: Point, index: number) {
    this.vertices[index] = vertice;
  }

  getSize() {
    return this.size;
  }

  setSize(size: number) {
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
    return "square";
  }

  getSpecialAttributes() {
    return [
      {
        name: "size",
        type: "number",
        setAttribute: this.setSize,
        getAttribute: this.getSize,
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

  clone(): Model {
    const square = new Square(new Point(0, 0), new Point(0, 0));
    this.getVertices().forEach((vertice, index) => {
      square.setVerticeByIndex(vertice.clone(), index);
    });

    square.rotateAngleInRadians = this.rotateAngleInRadians;
    square.computeCenter();
    square.size = this.size;

    return square;
  }

  isPointInside(point: Point, tolerance: number): boolean {
    const nonRotatedSquare = this.clone();
    nonRotatedSquare.rotate(-this.rotateAngleInRadians);

    const rotatedPoint = TransformationMatrix3.rotationPreserveCenter(
      -this.rotateAngleInRadians,
      this.getCenter()
    )
      .transpose()
      .multiplyPoint(point);

    // Check if the point is inside non rotated square
    nonRotatedSquare.computeBoundingBox();

    return (
      rotatedPoint.x >= nonRotatedSquare.minX - tolerance &&
      rotatedPoint.x <= nonRotatedSquare.maxX + tolerance &&
      rotatedPoint.y >= nonRotatedSquare.minY - tolerance &&
      rotatedPoint.y <= nonRotatedSquare.maxY + tolerance
    );
  }

  // static constructor from JSON
  static fromJSON(json: any): Square {
    const square = new Square(new Point(0, 0), new Point(0, 0));
    square.vertices[0] = new Point(json.vertices[0].x, json.vertices[0].y, new Color(json.vertices[0].color.r, json.vertices[0].color.g, json.vertices[0].color.b, json.vertices[0].color.a));
    square.vertices[1] = new Point(json.vertices[1].x, json.vertices[1].y, new Color(json.vertices[1].color.r, json.vertices[1].color.g, json.vertices[1].color.b, json.vertices[1].color.a));
    square.vertices[2] = new Point(json.vertices[2].x, json.vertices[2].y, new Color(json.vertices[2].color.r, json.vertices[2].color.g, json.vertices[2].color.b, json.vertices[2].color.a));
    square.vertices[3] = new Point(json.vertices[3].x, json.vertices[3].y, new Color(json.vertices[3].color.r, json.vertices[3].color.g, json.vertices[3].color.b, json.vertices[3].color.a));
    square.size = json.size;
    return square;
  }

}
