import { Model } from "./model";
import { Color } from "./primitives/color";
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
    const rectangle = new Rectangle(new Point(0, 0), new Point(0, 0));
    rectangle.vertices[0] = new Point(json.vertices[0].x, json.vertices[0].y, new Color(json.vertices[0].color.r, json.vertices[0].color.g, json.vertices[0].color.b, json.vertices[0].color.a));
    rectangle.vertices[1] = new Point(json.vertices[1].x, json.vertices[1].y, new Color(json.vertices[1].color.r, json.vertices[1].color.g, json.vertices[1].color.b, json.vertices[1].color.a));
    rectangle.vertices[2] = new Point(json.vertices[2].x, json.vertices[2].y, new Color(json.vertices[2].color.r, json.vertices[2].color.g, json.vertices[2].color.b, json.vertices[2].color.a));
    rectangle.vertices[3] = new Point(json.vertices[3].x, json.vertices[3].y, new Color(json.vertices[3].color.r, json.vertices[3].color.g, json.vertices[3].color.b, json.vertices[3].color.a));
    rectangle.width = json.width;
    rectangle.height = json.height;
    return rectangle;
  }

  private computeVertices(startPoint: Point, endPoint: Point) {
    this.width = Math.abs(startPoint.x - endPoint.x);
    this.height = Math.abs(startPoint.y - endPoint.y);

    this.vertices[0].x = startPoint.x;
    this.vertices[0].y = startPoint.y;

    // start point top right of end point
    if (startPoint.x >= endPoint.x && startPoint.y >= endPoint.y) {
      this.vertices[1].x = startPoint.x - this.width;
      this.vertices[1].y = startPoint.y;

      this.vertices[2].x = startPoint.x - this.width;
      this.vertices[2].y = startPoint.y - this.height;

      this.vertices[3].x = startPoint.x;
      this.vertices[3].y = startPoint.y - this.height;
      return;
    }
    // start point top left of end point
    else if (startPoint.x < endPoint.x && startPoint.y > endPoint.y) {
      this.vertices[1].x = startPoint.x + this.width;
      this.vertices[1].y = startPoint.y;

      this.vertices[2].x = startPoint.x + this.width;
      this.vertices[2].y = startPoint.y - this.height;

      this.vertices[3].x = startPoint.x;
      this.vertices[3].y = startPoint.y - this.height;
      return;
    }
    // start point bottom left of end point
    else if (startPoint.x < endPoint.x && startPoint.y < endPoint.y) {
      this.vertices[1].x = startPoint.x + this.width;
      this.vertices[1].y = startPoint.y;

      this.vertices[2].x = startPoint.x + this.width;
      this.vertices[2].y = startPoint.y + this.height;

      this.vertices[3].x = startPoint.x;
      this.vertices[3].y = startPoint.y + this.height;
      return;
    } else {
      // start point bottom right of end point
      this.vertices[1].x = startPoint.x - this.width;
      this.vertices[1].y = startPoint.y;

      this.vertices[2].x = startPoint.x - this.width;
      this.vertices[2].y = startPoint.y + this.height;

      this.vertices[3].x = startPoint.x;
      this.vertices[3].y = startPoint.y + this.height;
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

  isPointInside(point: Point): boolean {
    this.computeBoundingBox();
    // due to complexities when dealing with rotated vertices, isPointInside will
    // simply check if the point is within the bounding box of the square
    return (
      point.x >= this.minX &&
      point.x <= this.maxX &&
      point.y >= this.minY &&
      point.y <= this.maxY
    );
  }
}
