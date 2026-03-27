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
        // for (const [a, b] of cube.edges) {
        //     this.drawLine(cube.points[a], cube.points[b]);
        // }
        const visibleEdges = new Set();
        cube.faces.forEach((face) => {
            const A = cube.points[face[0]];
            const B = cube.points[face[1]];
            const C = cube.points[face[2]];
            // spočítám 2 vektory
            const u = {x: B.x - A.x, y: B.y - A.y, z: B.z - A.z};
            const v = {x: C.x - A.x, y: C.y - A.y, z: C.z - A.z};
            // normála
            const n = {
                x: u.y * v.z - u.z * v.y,
                y: u.z * v.x - u.x * v.z,
                z: u.x * v.y - u.y * v.x
            };
            const camera = {x: 0, y: 0, z: 0}
            const toCamera = {x: camera.x - A.x, y: camera.y - A.y, z: camera.z - A.z}
            //skalární součin
            const dot = n.x * toCamera.x + n.y * toCamera.y + n.z * toCamera.z;
            console.log(dot);
            if (dot > 0) {
                // stěna míří ke kameře
                console.log("stěna míří ke kameře", face);
                for (let i = 0; i < 4; i++) {
                    const p1 = face[i];
                    const p2 = face[(i + 1) % 4];
                    // Vytvoříme unikátní klíč (např. "0-1"),
                    // menší index dáme vždy dopředu
                    const edgeKey = p1 < p2 ? `${p1}-${p2}` : `${p2}-${p1}`;
                    visibleEdges.add(edgeKey);
                }
            } else if (dot < 0) {
                // stěna míří od kamery
            } else if (dot === 0) {
                // stěna je bokem
            }

        })
        // Teď vykreslíme každou unikátní hranu jen jednou
        visibleEdges.forEach(edgeKey => {
            const [idx1, idx2] = edgeKey.split('-').map(Number);
            this.drawLine(cube.points[idx1], cube.points[idx2]);
        });
    }

    drawPoints(points) {
        for (const point of points) {
            this.drawPoint(point);
        }
    }
}