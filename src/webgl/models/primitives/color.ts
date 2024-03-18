export class Color {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number
  ) {}

  public setColor(r: number, g: number, b: number, a: number): void {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public toFloat32Array(): Float32Array {
    return new Float32Array([this.r, this.g, this.b, this.a]);
  }

  public toUint8Array(): Uint8Array {
    return new Uint8Array([
      this.r * 255,
      this.g * 255,
      this.b * 255,
      this.a * 255,
    ]);
  }

  public toArray(): number[] {
    return [this.r, this.g, this.b, this.a];
  }
}
