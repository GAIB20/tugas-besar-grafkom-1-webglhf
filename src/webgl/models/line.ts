import { Model, SpecialAttribute } from "./model";
import { Color } from "./primitives/color";
import { Point } from "./primitives/point";

export class Line extends Model {
  private readonly vertices: [Point, Point] = [
    new Point(0, 0),
    new Point(0, 0),
  ];

  private width: number = 0;

  constructor(
    startPoint: Point,
    endPoint: Point,
    private observers?: {
      onWidthChange: Function;
    }
  ) {
    super();

    this.setVertices(startPoint, endPoint);
  }

  setGeometry(gl: WebGLRenderingContext): void {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        ...this.vertices[0].toArray(),

        ...this.vertices[1].toArray(),
      ]),
      gl.STATIC_DRAW
    );
  }

  setColors(gl: WebGLRenderingContext): void {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        ...this.vertices[0].color.toArray(),

        ...this.vertices[1].color.toArray(),
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
    this.observers?.onWidthChange(this.width);
  }

  setWidth(width: number): void {
    if (width < 10) {
      return;
    }
    console.log("CHANGING WIDTH");
    // Calculate the original length between the points
    const originalLength = this.vertices[1].euclideanDistanceTo(
      this.vertices[0]
    );

    // Calculate the scaling factor to maintain the original length
    const scaleFactor = width / originalLength;

    // Calculate new coordinates for the second point
    const newX =
      this.vertices[0].x +
      (this.vertices[1].x - this.vertices[0].x) * scaleFactor;
    const newY =
      this.vertices[0].y +
      (this.vertices[1].y - this.vertices[0].y) * scaleFactor;

    // Update the second point with new coordinates
    this.vertices[1].x = newX;
    this.vertices[1].y = newY;

    this.computeWidth();
    this.computeCenter();
  }

  getVertices(): Point[] {
    return this.vertices;
  }

  protected setVerticeByIndex(vertice: Point, index: number): void {
    this.vertices[index] = vertice;
    this.computeWidth();
  }

  setVertices(startPoint: Point, endPoint: Point): void {
    this.vertices[0] = startPoint;
    this.vertices[1] = endPoint;

    this.computeWidth();
    this.computeCenter();
  }

  drawMode(gl: WebGLRenderingContext): number {
    return gl.LINES;
  }

  count(): number {
    return 2;
  }

  isPointInside(point: Point, tolerance: number): boolean {
    const x = point.x;
    const y = point.y;

    const x1 = this.vertices[0].x;
    const y1 = this.vertices[0].y;

    const x2 = this.vertices[1].x;
    const y2 = this.vertices[1].y;

    // find if point lies on line
    const dx = x2 - x1;
    const dy = y2 - y1;

    const d = Math.sqrt(dx * dx + dy * dy);

    const a = Math.abs((x - x1) * dy - (y - y1) * dx) / d;

    return a < tolerance;
  }

  protected computeCenter(): void {
    this.center.x = (this.vertices[0].x + this.vertices[1].x) / 2;
    this.center.y = (this.vertices[0].y + this.vertices[1].y) / 2;
  }

  clone(): Model {
    return new Line(this.vertices[0].clone(), this.vertices[1].clone());
  }

  static fromJSON(json: any): Line {
    const line = new Line(
      new Point(
        json.vertices[0].x,
        json.vertices[0].y,
        new Color(
          json.vertices[0].color.r,
          json.vertices[0].color.g,
          json.vertices[0].color.b,
          json.vertices[0].color.a
        )
      ),
      new Point(
        json.vertices[1].x,
        json.vertices[1].y,
        new Color(
          json.vertices[1].color.r,
          json.vertices[1].color.g,
          json.vertices[1].color.b,
          json.vertices[1].color.a
        )
      )
    );

    return line;
  }

  movePoint(verticeIdx: number, newPosition: Point): void {
    console.log(newPosition.color);
    console.log("VERTICE INDEX: ", verticeIdx);
    // console.log(this.vertices[verticeIdx])
    newPosition.color = this.vertices[verticeIdx].color;
    this.vertices[verticeIdx] = newPosition;
    this.computeWidth();
    this.computeCenter();
  }
}
