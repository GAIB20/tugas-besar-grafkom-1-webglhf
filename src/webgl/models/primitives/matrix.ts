import { Point } from "./point";

export class Matrix3 {
  constructor(private matrix: number[][]) {}

  multiply(other: Matrix3): Matrix3 {
    const result = new Array(3).fill(0).map(() => new Array(3).fill(0));

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          result[i][j] += this.matrix[i][k] * other.matrix[k][j];
        }
      }
    }

    return new Matrix3(result);
  }

  multiplyPoint(point: Point): Point {
    const pointArr = point.toAffineTransform();
    const result = new Array(3).fill(0);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        result[i] += this.matrix[i][j] * pointArr[j];
      }
    }

    return new Point(result[0], result[1]);
  }

  transpose() {
    const result = new Array(3).fill(0).map(() => new Array(3).fill(0));

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        result[i][j] = this.matrix[j][i];
      }
    }

    this.matrix = result;
    return this;
  }

  flatten(): number[] {
    return this.matrix.flat();
  }
}
