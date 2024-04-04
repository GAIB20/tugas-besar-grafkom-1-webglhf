import { Model } from "../models/model";
import { Polygon } from "../models/polygon";
import { Point } from "../models/primitives/point";
import { Tool } from "./tool";

export class Union extends Tool {
    private modelsToUnion: Model[] = [];
    start() {
        return;
    }

    move() {
        return;
    }

    end() {
        return;
    }

    getBufferSize() {
        return this.modelsToUnion.length;
    }

    addModelToUnion(model: Model) {
        this.modelsToUnion.push(model);
    }

    resetUnion() {
        this.modelsToUnion = [];
    }

    executeUnion() {
        const vertices: Point[] = [];
        this.modelsToUnion.forEach(model => {
            vertices.push(...model.getVertices());
        });

        const newPolygon = new Polygon();
        newPolygon.setVertices(vertices);
        newPolygon.doConvexHull();
        this.drawer.addModel(newPolygon);

        this.drawer.draw();
        this.resetUnion();
    }
}
