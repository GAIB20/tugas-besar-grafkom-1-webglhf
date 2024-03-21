import { Model } from "../models/model";
import { Point } from "../models/primitives/point";
import { Tool } from "./tool";

export class Rotator extends Tool {
    private startPoint: Point | null = null;
    private currentModel: Model | null = null;

    start(model: Model, startPoint: Point) {
        this.currentModel = model;
        this.startPoint = startPoint;
    }

    move(point: Point) {
        if (this.startPoint && this.currentModel) {
            const center = this.currentModel.getCenter();
            const angle =
                Math.atan2(this.startPoint.y - center.y, this.startPoint.x - center.x) -
                Math.atan2(point.y - center.y, point.x - center.x);
            this.currentModel.rotate(angle);
            this.startPoint = point;
            this.drawer.draw();
        }
    }

    end() {
        this.startPoint = null;
        this.currentModel = null;
    }
}
