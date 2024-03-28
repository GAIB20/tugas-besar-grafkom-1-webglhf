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
    // Calculate the original distance between the first and fourth points (opposite points of the square)
    const originalDistance = this.vertices[3].euclideanDistanceTo(this.vertices[0]);

    // Calculate the scaling factor based on the original distance and the new size
    const scaleFactor = size / originalDistance;

    // Calculate the new coordinates for the fourth point
    const newX = this.vertices[0].x + (this.vertices[3].x - this.vertices[0].x) * scaleFactor;
    const newY = this.vertices[0].y + (this.vertices[3].y - this.vertices[0].y) * scaleFactor;

    // Update the coordinates of the fourth point
    this.vertices[3].x = newX;
    this.vertices[3].y = newY;

    // Adjust the other points to maintain square shape
    const diffX = this.vertices[3].x - this.vertices[0].x;
    const diffY = this.vertices[3].y - this.vertices[0].y;

    this.vertices[1].x = this.vertices[0].x + diffY;
    this.vertices[1].y = this.vertices[0].y - diffX;

    this.vertices[2].x = this.vertices[1].x + diffX;
    this.vertices[2].y = this.vertices[1].y + diffY;

    this.computeDimensions(); 
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

  computeDimensions() {
    this.size = Math.max(
      Math.abs(this.vertices[0].x - this.vertices[1].x),
      Math.abs(this.vertices[0].y - this.vertices[3].y)
    );
  }

  clone(): Model {
    const square = new Square(new Point(0, 0), new Point(0, 0));
    this.vertices.forEach((vertice, index) => {
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
    const vertices = [
      json.vertices[0],
      json.vertices[1],
      json.vertices[2],
      json.vertices[3],
    ];
    vertices.forEach((vertice: Point, index: number) => {
      square.setVerticeByIndex(Point.fromJSON(vertice), index);
    });

    square.rotateAngleInRadians = json.rotateAngleInRadians;
    square.computeCenter();
    square.size = json.size;

    return square;
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

    let opposingDiag = (verticeIdx + 2) % 4;
    console.log(opposingDiag)
    const maxHeightWidthChange = Math.max(
      Math.abs(this.vertices[opposingDiag].x - newPosition.x),
      Math.abs(this.vertices[opposingDiag].y - newPosition.y)
    );
    newPosition.x = this.vertices[opposingDiag].x + (newPosition.x < this.vertices[opposingDiag].x ? -maxHeightWidthChange : maxHeightWidthChange);
    newPosition.y = this.vertices[opposingDiag].y + (newPosition.y < this.vertices[opposingDiag].y ? -maxHeightWidthChange : maxHeightWidthChange);

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
}
