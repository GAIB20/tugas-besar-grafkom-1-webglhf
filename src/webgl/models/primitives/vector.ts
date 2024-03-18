import { Point } from "./point";

export class Vector {
  constructor(public x: number = 0, public y: number = 0) {}

  public static fromPoints(p1: Point, p2: Point): Vector {
    return new Vector(p2.x - p1.x, p2.y - p1.y);
  }

  toAffineTransform(): number[] {
    return [this.x, this.y, 0];
  }
}
