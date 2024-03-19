import { Model } from "./model";
import { Point } from "./primitives/point";

export class Square extends Model {
  /**
   * vertices[0] is the center point
   *
   * vertices[1] is the end point
   */
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

  setSize(size: number) {
    throw new Error("Not implemented");
  }

  setGeometry(gl: WebGL2RenderingContext) {
    const x1 = this.vertices[0].x;
    const y1 = this.vertices[0].y;

    const x2 = this.vertices[2].x;
    const y2 = this.vertices[2].y;

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // First triangle
        x1,
        y1,
        x2,
        y1,
        x1,
        y2,

        // Second triangle
        x1,
        y2,
        x2,
        y1,
        x2,
        y2,
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
        setAttribute: (value: number) => {
          this.setSize(value);
        },
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
}
