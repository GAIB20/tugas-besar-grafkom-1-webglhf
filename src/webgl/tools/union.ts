import { Model } from "../models/model";
import { Polygon } from "../models/polygon";
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
        if (this.modelsToUnion.length !== 2) {
            return;
        }

        const [firstModel, secondModel] = this.modelsToUnion;
        const firstModelVertices = firstModel.getVertices();
        const secondModelVertices = secondModel.getVertices();

        const firstPolygon = new Polygon();
        firstPolygon.setVertices(firstModelVertices);

        const secondPolygon = new Polygon();
        secondPolygon.setVertices(secondModelVertices);

        const newPolygon = firstPolygon.clone() as Polygon;
        newPolygon.doUnion(secondPolygon);
        this.drawer.addModel(newPolygon);

        this.drawer.draw();
        this.resetUnion();
    }
}
