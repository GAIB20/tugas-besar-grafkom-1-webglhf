export class Point {
  constructor(public x: number = 0, public y: number = 0) {}

  toAffineTransform(): number[] {
    return [this.x, this.y, 1];
  }

  euclideanDistanceTo(other: Point) {
    return Math.sqrt(
      Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2)
    );
  }

  isEqualsTo(other: Point) {
    return this.x === other.x && this.y === other.y;
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
}
