import { Matrix3 } from "../models/primitives/matrix";
import { Point } from "../models/primitives/point";

export class TransformationMatrix3 {
  static projection(width: number, height: number): Matrix3 {
    return new Matrix3([
      [2 / width, 0, 0],
      [0, -2 / height, 0],
      [-1, 1, 1],
    ]);
  }

  static identity(): Matrix3 {
    return new Matrix3([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  }

  static translation(tx: number, ty: number): Matrix3 {
    return new Matrix3([
      [1, 0, 0],
      [0, 1, 0],
      [tx, ty, 1],
    ]);
  }

  static rotation(angle: number): Matrix3 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Matrix3([
      [cos, -sin, 0],
      [sin, cos, 0],
      [0, 0, 1],
    ]);
  }

  static scaling(sx: number, sy: number): Matrix3 {
    return new Matrix3([
      [sx, 0, 0],
      [0, sy, 0],
      [0, 0, 1],
    ]);
  }

  static rotationPreserveCenter(
    angleInRadians: number,
    center: Point
  ): Matrix3 {
    return TransformationMatrix3.translation(-center.x, -center.y).multiply(
      TransformationMatrix3.rotation(angleInRadians).multiply(
        TransformationMatrix3.translation(center.x, center.y)
      )
    );
  }
}
