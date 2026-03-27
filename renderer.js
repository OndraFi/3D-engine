export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    clear() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    projectPoint(point) {
        // jednoduchá ochrana proti dělení nulou a bodům za kamerou
        if (point.z <= 0) {
            return null;
        }

        const x = point.x / point.z;
        const y = point.y / point.z;

        const canvasX = ((x + 1) / 2) * this.canvas.width;
        const canvasY = ((-y + 1) / 2) * this.canvas.height;

        return {
            x: canvasX,
            y: canvasY,
        };
    }

    drawPoint(point) {
        const projected = this.projectPoint(point);
        if (!projected) return;

        this.ctx.fillStyle = "green";
        this.ctx.fillRect(projected.x - 5, projected.y - 5, 10, 10);
    }

    drawLine(pointA, pointB) {
        const p1 = this.projectPoint(pointA);
        const p2 = this.projectPoint(pointB);

        if (!p1 || !p2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
    }

    drawCube(cube) {
        for (const [a, b] of cube.edges) {
            this.drawLine(cube.points[a], cube.points[b]);
        }
    }

    drawPoints(points) {
        for (const point of points) {
            this.drawPoint(point);
        }
    }
}