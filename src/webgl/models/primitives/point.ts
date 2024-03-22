import { Color } from "./color";

export class Point {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public color: Color = new Color(0, 0, 0, 1)
  ) {}

  toAffineTransform(): number[] {
    return [this.x, this.y, 1];
  }

  toArray(): number[] {
    return [this.x, this.y];
  }

  euclideanDistanceTo(other: Point) {
    return Math.sqrt(
      Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2)
    );
  }

  isEqualsTo(other: Point) {
    return this.x === other.x && this.y === other.y;
  }

  withinTolerance(other: Point, tolerance: number) {
    return (
      Math.abs(this.x - other.x) <= tolerance &&
      Math.abs(this.y - other.y) <= tolerance
    );
  }

  multiplyMatrix(matrix: number[][]): Point {
    // point * matrix
    const result = new Array(3).fill(0);
    const pointArr = this.toAffineTransform();

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        result[i] += pointArr[j] * matrix[j][i];
      }
    }

    return new Point(result[0], result[1]);
  }

  clone(): Point {
    return new Point(this.x, this.y, this.color.clone());
  }
}
