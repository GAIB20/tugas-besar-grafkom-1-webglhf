import { Model } from "../models/model";
import { Point } from "../models/primitives/point";
import { Tool } from "./tool";

// [!!] SCALER IS NOT WORKING FINE
export class Scaler extends Tool {
    private startPoint: Point | null = null;
    private currentModel: Model | null = null;
    private called: boolean = false;
    private originalModel: Model | null = null;

    start(model: Model, startPoint: Point) {
        this.currentModel = model;
        this.startPoint = startPoint;
        this.originalModel = model.clone();
    }

    move(point: Point) {
        if (this.startPoint && this.currentModel && !this.called) {
            this.currentModel.scale(
                1.1,
                1.1,
            );
            this.startPoint = point;
            this.drawer.draw();
            this.called = true;
        }
    }

    end() {
        this.startPoint = null;
        this.currentModel = null;
    }
}

