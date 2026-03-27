import { Point } from "./point.js";

export class Cube {
    constructor(centerPoint, size) {
        this.centerPoint = centerPoint;
        this.size = size;
        this.points = [];
        this.faces = [
            [0, 2, 3, 1], // přední (z+) - opraveno pořadí
            [4, 5, 7, 6], // zadní (z-)
            [0, 4, 6, 2], // horní (y+) - opraveno pořadí
            [1, 3, 7, 5], // dolní (y-)
            [0, 1, 5, 4], // pravá (x+)
            [2, 6, 7, 3], // levá (x-) - opraveno pořadí
        ];
        this.edges = [
            [0, 1],
            [1, 3],
            [3, 2],
            [2, 0],

            [4, 5],
            [5, 7],
            [7, 6],
            [6, 4],

            [0, 4],
            [1, 5],
            [2, 6],
            [3, 7],
        ];
        this.maxRotationSpeed = 3;
        this.angles = {
            x: 0,
            y: 0,
            z: 0,
        }

        this.createPoints();
    }

    createPoints() {
        const h = this.size / 2;
        const cx = this.centerPoint.x;
        const cy = this.centerPoint.y;
        const cz = this.centerPoint.z;

        this.points = [
            new Point(cx + h, cy + h, cz + h), // 0
            new Point(cx + h, cy - h, cz + h), // 1
            new Point(cx - h, cy + h, cz + h), // 2
            new Point(cx - h, cy - h, cz + h), // 3

            new Point(cx + h, cy + h, cz - h), // 4
            new Point(cx + h, cy - h, cz - h), // 5
            new Point(cx - h, cy + h, cz - h), // 6
            new Point(cx - h, cy - h, cz - h), // 7
        ];
    }

    rotete(angle){
        const rad = angle * Math.PI / 180;
        this.rotateX(rad);
        this.rotateY(rad);
        this.rotateZ(rad);
    }

    rotateBasedOnMouseMove(x,y, canvasSize){
        x = x-canvasSize/2;
        y = y-canvasSize/2;

        const xPercent = x / (canvasSize/2);
        const yPercent = y / (canvasSize/2);

        this.angles.x = this.maxRotationSpeed * xPercent;
        this.angles.y = this.maxRotationSpeed * yPercent;

        if(this.angles.x > 360){
            this.angles.x -= 360;
        }
        if(this.angles.x < 0){
            this.angles.x += 360;
        }
        if(this.angles.y > 360){
            this.angles.y -= 360;
        }
        if(this.angles.y < 0){
            this.angles.y += 360;
        }


        const radX = this.angles.x * Math.PI / 180;
        const radY = this.angles.y * Math.PI / 180;
        this.rotateX(-radY);
        this.rotateY(-radX);
    }

    rotateX(rad){
        this.points.forEach(point => {
            this.rotatePointX(point, rad);
        })
    }

    rotateY(rad){
        this.points.forEach(point => {
            this.rotatePointY(point, rad);
        })
    }

    rotateZ(rad){
        this.points.forEach(point => {
            this.rotatePointZ(point, rad);
        })
    }

    rotatePointX(p,rad){
        let rz = p.z - this.centerPoint.z;
        let ry = p.y - this.centerPoint.y;

        const newRy = ry * Math.cos(rad) - rz * Math.sin(rad);
        const newRz = ry * Math.sin(rad) + rz * Math.cos(rad);
        p.y = newRy + this.centerPoint.y;
        p.z = newRz + this.centerPoint.z;
    }

    rotatePointY(p,rad){
        let rz = p.z - this.centerPoint.z;
        let rx = p.x - this.centerPoint.x;

        let newRx = rx  * Math.cos(rad) + rz * Math.sin(rad)
        let newRz = -rx * Math.sin(rad) + rz * Math.cos(rad)

        p.x = newRx + this.centerPoint.x;
        p.z = newRz + this.centerPoint.z;
    }

    rotatePointZ(p,rad){
        let rx = p.x - this.centerPoint.x;
        let ry = p.y - this.centerPoint.y;

        let newRx = rx * Math.cos(rad) - ry * Math.sin(rad)
        let newRy = rx * Math.sin(rad) + ry * Math.cos(rad)

        p.x = newRx + this.centerPoint.x;
        p.y = newRy + this.centerPoint.y;
    }
}