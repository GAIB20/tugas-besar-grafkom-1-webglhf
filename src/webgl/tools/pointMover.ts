import { Model } from "../models/model";
import { Point } from "../models/primitives/point";
import { Tool } from "./tool";

export class PointMover extends Tool{
    private startPoint: Point | null = null;
    private currentModel: Model | null = null;
    private selectedVerticeIndex: number | null = null;

    start(model: Model, startPoint: Point) {
        this.currentModel = model;
        this.startPoint = startPoint;
        this.selectedVerticeIndex = this.drawer.getSelectedVerticeIndex();
    }

    move(point: Point) {
        if (this.startPoint && this.currentModel && this.selectedVerticeIndex !== null && this.selectedVerticeIndex !== -1) {
            this.currentModel.movePoint(this.selectedVerticeIndex, point);
            this.drawer.draw();
        }
    }

    end() {
        this.startPoint = null;
        this.currentModel = null;
    }
}
