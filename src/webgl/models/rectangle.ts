import { Model } from "./model";
import { Matrix3 } from "./primitives/matrix";
import { Point } from "./primitives/point";
import { Vector } from "./primitives/vector";

export class Rectangle extends Model {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {
    super();
  }

  getCount(): number {
    return 6;
  }

  toMatrix3(): Matrix3 {
    const x2 = this.x + this.width;
    const y2 = this.y + this.height;

    return new Matrix3(
      new Vector(this.x, x2),
      new Vector(this.y, y2),
      new Point(0, 0)
    );
  }

  setGeometry(gl: WebGL2RenderingContext): void {
    const x2 = this.x + this.width;
    const y2 = this.y + this.height;

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // First triangle
        this.x,
        this.y,
        x2,
        this.y,
        this.x,
        y2,

        // Second triangle
        this.x,
        y2,
        x2,
        this.y,
        x2,
        y2,
      ]),
      gl.STATIC_DRAW
    );
  }

  getType(): string {
    return "Rectangle";
  }
}
