import { Model } from "../models/model";
import { Point } from "../models/primitives/point";
import { Tool } from "./tool";

export class Translator extends Tool {
    private startPoint: Point | null = null;
    private currentModel: Model | null = null;

    start(model: Model, startPoint: Point) {
        this.currentModel = model;
        this.startPoint = startPoint;
    }

    move(point: Point) {
        if (this.startPoint && this.currentModel) {
            this.currentModel.translate(
                point.x - this.startPoint.x,
                point.y - this.startPoint.y
            );
            this.startPoint = point;
            this.drawer.draw();
        }
    }

    end() {
        this.startPoint = null;
        this.currentModel = null;
    }
}
