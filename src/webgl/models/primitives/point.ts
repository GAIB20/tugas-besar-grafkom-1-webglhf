export class Point {
  constructor(public x: number = 0, public y: number = 0) {}

  toAffineTransform(): number[] {
    return [this.x, this.y, 1];
  }
}
