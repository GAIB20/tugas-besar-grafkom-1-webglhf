import { Model } from "../models/model";
import { Point } from "../models/primitives/point";
import { Tool } from "./tool";

export class Shear extends Tool {
  private startPoint: Point | null = null;
  private currentModel: Model | null = null;
  private selectedVeritce: Point | null = null;

  start(model: Model, startPoint: Point) {
    this.currentModel = model;
    this.startPoint = startPoint;
    this.selectedVeritce = this.drawer.getSelectedVertice();
  }

  move(point: Point) {
    if (this.startPoint && this.currentModel && this.selectedVeritce) {
      let shx = Math.min(
        Math.max((point.x - this.startPoint.x) / this.startPoint.y, -1),
        1
      );

      let shy = Math.min(
        Math.max((point.y - this.startPoint.y) / this.startPoint.x, -1),
        1
      );

      this.currentModel.shear(-shx, -shy);
      this.startPoint = point;
      this.drawer.draw();
    }
  }

  end() {
    this.startPoint = null;
    this.currentModel = null;
  }
}
