import { TransformationMatrix3 } from "../utils/transformation";
import { Model } from "./model";
import { Point } from "./primitives/point";


export class Polygon extends Model {
    private vertices: Point[] = [
    ];

    constructor() {
        super();
    }

    addVertice(vertice: Point) {
        this.vertices.push(vertice);
        this.computeCenter();
    }

    // static constructor from JSON
    static fromJSON(json: any): Polygon {
        const polygon = new Polygon();
        const vertices = json.vertices;
        // vertices.forEach((vertice: string) => {
        //     polygon.addVertice(Point.fromJSON(vertice));
        // });
        return polygon;
    }

    protected computeCenter(): void {
        // sum all x in vertices and y
        let sumX = 0;
        let sumY = 0;
        this.vertices.forEach((vertice) => {
            sumX += vertice.x;
            sumY += vertice.y;
        });
        this.center.x = sumX / this.vertices.length;
        this.center.y = sumY / this.vertices.length;
    }

    clone(): Model {
        let polygon = new Polygon();
        polygon.vertices = this.vertices.map((vertice) => vertice.clone());
        polygon.rotateAngleInRadians = this.rotateAngleInRadians;
        polygon.computeCenter();
        return polygon;
    }

    setVertices(vertices: Point[]) {
        this.vertices = vertices;
        this.computeCenter();
    }

    protected setVerticeByIndex(vertice: Point, index: number) {
        this.vertices[index] = vertice;
    }


    setGeometry(gl: WebGL2RenderingContext) {
        let interleavedData: any = [];

        for (let i = 2; i < this.vertices.length; i++) {
            // traignel fan
            interleavedData.push(...this.vertices[0].toArray());
            interleavedData.push(...this.vertices[i - 1].toArray());
            interleavedData.push(...this.vertices[i].toArray());
        }
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(interleavedData),
            gl.STATIC_DRAW
        );
    }

    setColors(gl: WebGL2RenderingContext): void {
        let interleavedData: any = [];

        for (let i = 2; i < this.vertices.length; i++) {
            // traignel fan
            interleavedData.push(...this.vertices[0].color.toArray());
            interleavedData.push(...this.vertices[i - 1].color.toArray());
            interleavedData.push(...this.vertices[i].color.toArray());
        }
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(interleavedData),
            gl.STATIC_DRAW
        );
    }


    getType() {
        return "polygon";
    }

    getSpecialAttributes() {
        return [
        ];
    }

    getVertices(): Point[] {
        return this.vertices;
    }

    count() {
        return 3 * (this.vertices.length - 2);
    }

    drawMode(gl: WebGL2RenderingContext) {
        return gl.TRIANGLES;
    }

    isPointInside(point: Point, tolerance: number): boolean {
        const nonRotatedRect = this.clone();
        nonRotatedRect.rotate(-this.rotateAngleInRadians);

        const rotatedPoint = TransformationMatrix3.rotationPreserveCenter(
            -this.rotateAngleInRadians,
            this.getCenter()
        )
            .transpose()
            .multiplyPoint(point);

        // Check if the point is inside non rotated square
        nonRotatedRect.computeBoundingBox();

        return (
            rotatedPoint.x >= nonRotatedRect.minX - tolerance &&
            rotatedPoint.x <= nonRotatedRect.maxX + tolerance &&
            rotatedPoint.y >= nonRotatedRect.minY - tolerance &&
            rotatedPoint.y <= nonRotatedRect.maxY + tolerance
        );
    }

    deleteVertice(verticeIdx: number) {
        this.vertices.splice(verticeIdx, 1);
        this.computeCenter();
    }

    movePoint(verticeIdx: number, newPosition: Point) {
        const origRotate = this.rotateAngleInRadians;
        this.rotate(-this.rotateAngleInRadians);

        const rotatedPoint = TransformationMatrix3.rotationPreserveCenter(
            -origRotate,
            this.getCenter()
        )
            .transpose()
            .multiplyPoint(newPosition);
        newPosition = rotatedPoint;

        newPosition.color = this.vertices[verticeIdx].color;

        this.vertices[verticeIdx] = newPosition;

        this.rotate(origRotate);
        this.computeCenter();
    }

}
