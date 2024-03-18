import { Matrix3 } from "../models/primitives/matrix";
import { Point } from "../models/primitives/point";
import { Vector } from "../models/primitives/vector";

export class TransformationMatrix3 {
  static projection(width: number, height: number): Matrix3 {
    return new Matrix3(
      new Vector(2 / width, 0),
      new Vector(0, -2 / height),
      new Point(-1, 1)
    );
  }

  static identity(): Matrix3 {
    return new Matrix3(new Vector(1, 0), new Vector(0, 1), new Point(0, 0));
  }

  static translation(tx: number, ty: number): Matrix3 {
    return new Matrix3(new Vector(1, 0), new Vector(0, 1), new Point(tx, ty));
  }

  static rotation(angle: number): Matrix3 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Matrix3(
      new Vector(cos, -sin),
      new Vector(sin, cos),
      new Point(0, 0)
    );
  }

  static scaling(sx: number, sy: number): Matrix3 {
    return new Matrix3(new Vector(sx, 0), new Vector(0, sy), new Point(0, 0));
  }
}
