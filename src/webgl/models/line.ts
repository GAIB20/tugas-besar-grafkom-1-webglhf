import { Model, SpecialAttribute } from "./model";
import { Point } from "./primitives/point";

export class Line extends Model {
  private readonly vertices: [Point, Point] = [
    new Point(0, 0),
    new Point(0, 0),
  ];

  private width: number = 0;

  constructor(startPoint: Point, endPoint: Point) {
    super();

    this.vertices[0] = startPoint;
    this.vertices[1] = endPoint;

    this.computeWidth();
  }

  setGeometry(gl: WebGL2RenderingContext): void {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        this.vertices[0].x,
        this.vertices[0].y,

        this.vertices[1].x,
        this.vertices[1].y,
      ]),
      gl.STATIC_DRAW
    );
  }

  getType(): string {
    return "line";
  }

  getSpecialAttributes(): SpecialAttribute[] {
    return [];
  }

  getWidth(): number {
    return this.width;
  }

  private computeWidth(): void {
    this.width = this.vertices[0].euclideanDistanceTo(this.vertices[1]);
  }

  setWidth(width: number): void {
    throw new Error("Method not implemented.");
  }

  getVertices(): Point[] {
    return this.vertices;
  }

  protected setVerticeByIndex(vertice: Point, index: number): void {
    this.vertices[index] = vertice;
  }

  getCenter(): Point {
    return new Point(
      (this.vertices[0].x + this.vertices[1].x) / 2,
      (this.vertices[0].y + this.vertices[1].y) / 2
    );
  }

  setVertices(startPoint: Point, endPoint: Point): void {
    this.vertices[0] = startPoint;
    this.vertices[1] = endPoint;
  }

  drawMode(gl: WebGL2RenderingContext): number {
    return gl.LINES;
  }

  count(): number {
    return 2;
  }
}
