import { Model } from "../models/model";
import { Point } from "../models/primitives/point";
import { Tool } from "./tool";

export class Scaler extends Tool {
    private startPoint: Point | null = null;
    private currentModel: Model | null = null;

    start(model: Model, startPoint: Point) {
        this.currentModel = model;
        this.startPoint = startPoint;
    }

    move(point: Point) {
        if (this.startPoint && this.currentModel) {
            let pointXFromCenter = point.euclideanDistanceTo(this.currentModel.getCenter());
            let startPointXFromCenter = this.startPoint.euclideanDistanceTo(this.currentModel.getCenter());

            let scaleFactor = pointXFromCenter / startPointXFromCenter;
            if (scaleFactor < 0) {
                scaleFactor = 1;
            }

            this.currentModel.scale(scaleFactor, scaleFactor);
            this.startPoint = point;
            this.drawer.draw();
        }
    }

    end() {
        this.startPoint = null;
        this.currentModel = null;
    }
}

