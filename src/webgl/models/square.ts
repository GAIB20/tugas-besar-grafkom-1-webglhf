import { Model } from "./model";
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

    this.vertices[0].x = startPoint.x;
    this.vertices[0].y = startPoint.y;
    // start point top right of end point
    if (startPoint.x >= endPoint.x && startPoint.y >= endPoint.y) {
      this.vertices[1].x = startPoint.x - this.size;
      this.vertices[1].y = startPoint.y;

      this.vertices[2].x = startPoint.x - this.size;
      this.vertices[2].y = startPoint.y - this.size;

      this.vertices[3].x = startPoint.x;
      this.vertices[3].y = startPoint.y - this.size;
      return;
    }
    // start point top left of end point
    else if (startPoint.x < endPoint.x && startPoint.y > endPoint.y) {
      this.vertices[1].x = startPoint.x + this.size;
      this.vertices[1].y = startPoint.y;

      this.vertices[2].x = startPoint.x + this.size;
      this.vertices[2].y = startPoint.y - this.size;

      this.vertices[3].x = startPoint.x;
      this.vertices[3].y = startPoint.y - this.size;
      return;
    }
    // start point bottom left of end point
    else if (startPoint.x < endPoint.x && startPoint.y < endPoint.y) {
      this.vertices[1].x = startPoint.x + this.size;
      this.vertices[1].y = startPoint.y;

      this.vertices[2].x = startPoint.x + this.size;
      this.vertices[2].y = startPoint.y + this.size;

      this.vertices[3].x = startPoint.x;
      this.vertices[3].y = startPoint.y + this.size;
      return;
    } else {
      // start point bottom right of end point
      this.vertices[1].x = startPoint.x - this.size;
      this.vertices[1].y = startPoint.y;

      this.vertices[2].x = startPoint.x - this.size;
      this.vertices[2].y = startPoint.y + this.size;

      this.vertices[3].x = startPoint.x;
      this.vertices[3].y = startPoint.y + this.size;
    }
  }

  getCenter(): Point {
    const x = (this.vertices[0].x + this.vertices[2].x) / 2;
    const y = (this.vertices[0].y + this.vertices[2].y) / 2;

    return new Point(x, y);
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

  isPointInside(point: Point): boolean {
    const x = point.x;
    const y = point.y;

    const x1 = this.vertices[0].x;
    const y1 = this.vertices[0].y;

    const x2 = this.vertices[2].x;
    const y2 = this.vertices[2].y;

    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }
}
