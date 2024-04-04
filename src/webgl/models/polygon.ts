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
        vertices.forEach((vertice: Point) => {
            polygon.addVertice(Point.fromJSON(vertice));
        });
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

    deleteVerticeIdx(verticeIdx: number) {
        this.vertices.splice(verticeIdx, 1);
        this.computeCenter();
    }

    deleteVertice(vertice: Point) {
        this.vertices = this.vertices.filter((v) => !v.withinTolerance(vertice, 0.1));
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

    doConvexHull() {
        if (this.vertices.length < 3) return;
    
        const minYPoint = this.getMinYVertex(this.vertices);    
        const sortedPoints = this.sortByAngle(this.vertices, minYPoint);
        const stack: Point[] = [];
    
        stack.push(sortedPoints[0], sortedPoints[1]);
    
        for (let i = 2; i < sortedPoints.length; i++) {
            while (stack.length >= 2) {
                const top = stack.pop();
                const nextToTop = stack[stack.length - 1];
    
                if (top && nextToTop && this.ccw(nextToTop, top, sortedPoints[i]) !== 1) {
                } else {
                    if (top) {
                        stack.push(top);
                    }
                    break;
                }
            }
            stack.push(sortedPoints[i]);
        }
    
        this.vertices = stack;
    }  
    
    doUnion(otherPolygon: Polygon) {
        console.log("IMPLEMENT THIS");
    }    

    sortByAngle(points: Point[], minYPoint: Point): Point[] {
        return points.sort((a, b) => this.angle(minYPoint, a) - this.angle(minYPoint, b));
    }

    getMinYVertex(vertices: Point[]): Point {
        return vertices.reduce((min, p) => p.y < min.y ? p : min, vertices[0]);
    }
    
    angle(o: Point, a: Point): number {
        return Math.atan2(a.y - o.y, a.x - o.x);
    }

    ccw(a: Point, b: Point, c: Point) {
        const area = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
        if (area < 0) return -1; // cw
        if (area > 0) return 1; // ccw
        return 0; // colinear
    }    
}
