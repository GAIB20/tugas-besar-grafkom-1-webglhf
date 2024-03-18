import { Point } from "./point";
import { Vector } from "./vector";

export class Matrix3 {
  private matrix: number[][];
  constructor(
    public readonly v1: Vector,
    public readonly v2: Vector,
    public readonly pivot: Point
  ) {
    this.matrix = [
      v1.toAffineTransform(),
      v2.toAffineTransform(),
      pivot.toAffineTransform(),
    ];
  }

  multiply(other: Matrix3): Matrix3 {
    const result = new Array(3).fill(0).map(() => new Array(3).fill(0));

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          result[i][j] += this.matrix[i][k] * other.matrix[k][j];
        }
      }
    }

    return new Matrix3(
      new Vector(result[0][0], result[0][1]),
      new Vector(result[1][0], result[1][1]),
      new Point(result[2][0], result[2][1])
    );
  }

  flatten(): number[] {
    return this.matrix.flat();
  }
}
