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
            // console.log(dot);
            if (dot > 0) {
                // stěna míří ke kameře
                // console.log("stěna míří ke kameře", face);
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

    drawGame(game){
        const p = game.player.position;
        const fullChunkSize = game.chunkSize * game.cubeSize;
        // Zjistíme index chunku, ve kterém je hráč
        const currentChunkX = Math.floor(p.x / fullChunkSize);
        const currentChunkZ = Math.floor(p.z / fullChunkSize);

        // Vykreslíme aktuální chunk a jeho sousedy (okruh 1 chunk)
        for (let x = currentChunkX - 1; x <= currentChunkX + 1; x++) {
            for (let z = currentChunkZ - 1; z <= currentChunkZ + 1; z++) {
                // Kontrola, jestli chunk existuje (není mimo hranice světy)
                if (game.world[x] && game.world[x][z]) {
                    const chunk = game.world[x][z];
                    chunk.forEach(row => {
                        row.forEach(cube => {
                            this.drawGameCube(cube, game.player);
                        });
                    });
                }
            }
        }
    }

    // drawGameCube(cube,player) {
    //     const cubePoints = JSON.parse(JSON.stringify(cube.points));
    //     cubePoints.forEach((point) => {
    //         point.x -= player.position.x;
    //         point.y -= player.position.y;
    //         point.z -= player.position.z;
    //     })
    //     const visibleEdges = new Set();
    //     cube.faces.forEach((face) => {
    //         const A = cubePoints[face[0]];
    //         const B = cubePoints[face[1]];
    //         const C = cubePoints[face[2]];
    //         // spočítám 2 vektory
    //         const u = {x: B.x - A.x, y: B.y - A.y, z: B.z - A.z};
    //         const v = {x: C.x - A.x, y: C.y - A.y, z: C.z - A.z};
    //         // normála
    //         const n = {
    //             x: u.y * v.z - u.z * v.y,
    //             y: u.z * v.x - u.x * v.z,
    //             z: u.x * v.y - u.y * v.x
    //         };
    //         const camera = {x: 0, y: 0, z: 0}
    //         const toCamera = {x: camera.x - A.x, y: camera.y - A.y, z: camera.z - A.z}
    //         //skalární součin
    //         const dot = n.x * toCamera.x + n.y * toCamera.y + n.z * toCamera.z;
    //         // console.log(dot);
    //         if (dot > 0) {
    //             // stěna míří ke kameře
    //             // console.log("stěna míří ke kameře", face);
    //             for (let i = 0; i < 4; i++) {
    //                 const p1 = face[i];
    //                 const p2 = face[(i + 1) % 4];
    //                 // Vytvoříme unikátní klíč (např. "0-1"),
    //                 // menší index dáme vždy dopředu
    //                 const edgeKey = p1 < p2 ? `${p1}-${p2}` : `${p2}-${p1}`;
    //                 visibleEdges.add(edgeKey);
    //             }
    //         } else if (dot < 0) {
    //             // stěna míří od kamery
    //         } else if (dot === 0) {
    //             // stěna je bokem
    //         }
    //
    //     })
    //     // Teď vykreslíme každou unikátní hranu jen jednou
    //     visibleEdges.forEach(edgeKey => {
    //         const [idx1, idx2] = edgeKey.split('-').map(Number);
    //         this.drawLine(cubePoints[idx1], cubePoints[idx2]);
    //     });
    // }

    // drawGameCube(cube, player) {
    //     // 1. Příprava úhlu (převod na radiány a otočení směru)
    //     const rad = -player.yaw * Math.PI / 180;
    //     const cos = Math.cos(rad);
    //     const sin = Math.sin(rad);
    //
    //     // 2. Transformace bodů: Nejdřív POSUN, pak ROTACE
    //     const transformedPoints = cube.points.map(p => {
    //         // Translace (relativně k hráči)
    //         let dx = p.x - player.position.x;
    //         let dy = p.y - player.position.y;
    //         let dz = p.z - player.position.z;
    //
    //         // Rotace kolem osy Y (Yaw)
    //         // x' = x*cos - z*sin
    //         // z' = x*sin + z*cos
    //         const rx = dx * cos - dz * sin;
    //         const rz = dx * sin + dz * cos;
    //
    //         return { x: rx, y: dy, z: rz };
    //     });
    //
    //     // 3. Kontrola: Pokud je celá kostka za námi, zahodíme ji
    //     if (transformedPoints.every(p => p.z <= 0.1)) return;
    //
    //     const visibleEdges = new Set();
    //
    //     // 4. Výpočet viditelných stěn (Back-face culling)
    //     cube.faces.forEach((face) => {
    //         const A = transformedPoints[face[0]];
    //         const B = transformedPoints[face[1]];
    //         const C = transformedPoints[face[2]];
    //
    //         // Vektory stěny v "relativním" prostoru
    //         const u = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
    //         const v = { x: C.x - A.x, y: C.y - A.y, z: C.z - A.z };
    //
    //         // Normála
    //         const n = {
    //             x: u.y * v.z - u.z * v.y,
    //             y: u.z * v.x - u.x * v.z,
    //             z: u.x * v.y - u.y * v.x
    //         };
    //
    //         // Vektor ke kameře (kamera je teď v bodě [0,0,0])
    //         const toCamera = { x: -A.x, y: -A.y, z: -A.z };
    //         const dot = n.x * toCamera.x + n.y * toCamera.y + n.z * toCamera.z;
    //
    //         if (dot > 0) {
    //             for (let i = 0; i < 4; i++) {
    //                 const p1 = face[i];
    //                 const p2 = face[(i + 1) % 4];
    //                 const edgeKey = p1 < p2 ? `${p1}-${p2}` : `${p2}-${p1}`;
    //                 visibleEdges.add(edgeKey);
    //             }
    //         }
    //     });
    //
    //     // 5. Vykreslení
    //     visibleEdges.forEach(edgeKey => {
    //         const [idx1, idx2] = edgeKey.split('-').map(Number);
    //         // Tady už voláš drawLine s už transformovanými body!
    //         this.drawLine(transformedPoints[idx1], transformedPoints[idx2]);
    //     });
    // }

    // drawGameCube(cube, player) {
    //     // Převod úhlů na radiány (mínus u obou, aby se svět točil PROTI kameře)
    //     const radYaw = -player.yaw * Math.PI / 180;
    //     const radPitch = -player.pitch * Math.PI / 180;
    //
    //     const cosY = Math.cos(radYaw);
    //     const sinY = Math.sin(radYaw);
    //     const cosP = Math.cos(radPitch);
    //     const sinP = Math.sin(radPitch);
    //
    //     const transformedPoints = cube.points.map(p => {
    //         // 1. Translace (posun k hráči)
    //         let dx = p.x - player.position.x;
    //         let dy = p.y - player.position.y;
    //         let dz = p.z - player.position.z;
    //
    //         // 2. Rotace Yaw (kolem osy Y - do stran)
    //         let rx = dx * cosY - dz * sinY;
    //         let rzTemp = dx * sinY + dz * cosY;
    //
    //         // 3. Rotace Pitch (kolem osy X - nahoru/dolů)
    //         // Osa X (rx) zůstává, mění se Y a Z
    //         let ry = dy * cosP - rzTemp * sinP;
    //         let rzFinal = dy * sinP + rzTemp * cosP;
    //
    //         return { x: rx, y: ry, z: rzFinal };
    //     });
    //
    //     // 4. Clipping (nekreslit, co je za námi)
    //     if (transformedPoints.every(p => p.z <= 0.1)) return;
    //
    //     const visibleEdges = new Set();
    //
    //     cube.faces.forEach((face) => {
    //         const A = transformedPoints[face[0]];
    //         const B = transformedPoints[face[1]];
    //         const C = transformedPoints[face[2]];
    //
    //         const u = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
    //         const v = { x: C.x - A.x, y: C.y - A.y, z: C.z - A.z };
    //
    //         const n = {
    //             x: u.y * v.z - u.z * v.y,
    //             y: u.z * v.x - u.x * v.z,
    //             z: u.x * v.y - u.y * v.x
    //         };
    //
    //         // Kamera je teď v [0,0,0]
    //         const toCamera = { x: -A.x, y: -A.y, z: -A.z };
    //         const dot = n.x * toCamera.x + n.y * toCamera.y + n.z * toCamera.z;
    //
    //         if (dot > 0) {
    //             for (let i = 0; i < 4; i++) {
    //                 const p1 = face[i];
    //                 const p2 = face[(i + 1) % 4];
    //                 const edgeKey = p1 < p2 ? `${p1}-${p2}` : `${p2}-${p1}`;
    //                 visibleEdges.add(edgeKey);
    //             }
    //         }
    //     });
    //
    //     visibleEdges.forEach(edgeKey => {
    //         const [idx1, idx2] = edgeKey.split('-').map(Number);
    //         this.drawLine(transformedPoints[idx1], transformedPoints[idx2]);
    //     });
    // }


    transformPoint(point, player, cosY, sinY, cosP, sinP) {
        // 1. Translace
        let dx = point.x - player.position.x;
        let dy = point.y - player.position.y;
        let dz = point.z - player.position.z;

        // 2. Rotace Yaw (Y)
        let rx = dx * cosY - dz * sinY;
        let rzTemp = dx * sinY + dz * cosY;

        // 3. Rotace Pitch (X)
        let ry = dy * cosP - rzTemp * sinP;
        let rzFinal = dy * sinP + rzTemp * cosP;

        return { x: rx, y: ry, z: rzFinal };
    }

    isFaceVisible(points, face) {
        const A = points[face[0]];
        const B = points[face[1]];
        const C = points[face[2]];

        const u = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
        const v = { x: C.x - A.x, y: C.y - A.y, z: C.z - A.z };

        // Normála přes křížový součin
        const n = {
            x: u.y * v.z - u.z * v.y,
            y: u.z * v.x - u.x * v.z,
            z: u.x * v.y - u.y * v.x
        };

        // Skalární součin s vektorem ke kameře [0,0,0]
        return (n.x * -A.x + n.y * -A.y + n.z * -A.z) > 0;
    }

    drawGameCube(cube, player) {
        const radYaw = -player.yaw * Math.PI / 180;
        const radPitch = -player.pitch * Math.PI / 180;
        const cosY = Math.cos(radYaw), sinY = Math.sin(radYaw);
        const cosP = Math.cos(radPitch), sinP = Math.sin(radPitch);

        // Transformace všech bodů
        const viewPoints = cube.points.map(p =>
            this.transformPoint(p, player, cosY, sinY, cosP, sinP)
        );

        // Rychlý clipping
        if (viewPoints.every(p => p.z <= 0.1)) return;

        const visibleEdges = new Set();

        cube.faces.forEach(face => {
            if (this.isFaceVisible(viewPoints, face)) {
                for (let i = 0; i < 4; i++) {
                    const p1 = face[i], p2 = face[(i + 1) % 4];
                    const key = p1 < p2 ? `${p1}-${p2}` : `${p2}-${p1}`;
                    visibleEdges.add(key);
                }
            }
        });

        visibleEdges.forEach(key => {
            const [i1, i2] = key.split('-').map(Number);
            this.drawLine(viewPoints[i1], viewPoints[i2]);
        });
    }
}