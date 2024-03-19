import { Drawer } from "../drawer";
import { Model } from "../models/model";
import { Point } from "../models/primitives/point";

export abstract class Tool {
  constructor(public readonly drawer: Drawer) {}
  abstract start(model: Model, startPoint: Point): void;
  abstract move(point: Point): void;
  abstract end(): void;
}
