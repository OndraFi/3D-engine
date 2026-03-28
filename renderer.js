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
        let z = point.z
        if (point.z <= 0) {
            z = 0.1
        }


        const x = point.x / z;
        const y = point.y / z;

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

    drawLine(pointA, pointB,color = "black") {
        const p1 = this.projectPoint(pointA);
        const p2 = this.projectPoint(pointB);

        if (!p1 || !p2) return;

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.strokeStyle = color;
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

    drawDebugInfo(game){
        const player = game.player;
        this.ctx.fillStyle = "black";
        this.ctx.strokeStyle = "black";
        this.ctx.textBaseline = "hanging";
        this.ctx.strokeText("PLAYER POSITION:", 10, 10);
        this.ctx.textBaseline = "middle";
        this.ctx.strokeText("x:" + player.position.x, 10, 30);
        this.ctx.strokeText("y:" + player.position.y, 10, 40);
        this.ctx.strokeText("z:" + player.position.z, 10, 50);
        this.ctx.textBaseline = "hanging";
        this.ctx.strokeText("WORLD", 10, 60);
        this.ctx.textBaseline = "middle";
        this.ctx.strokeText("chunk size: " + game.chunkSize, 10, 80);
        this.ctx.strokeText("world size: " + game.worldSize, 10, 90);

        //draw compas
        this.ctx.beginPath();
        this.ctx.arc(50, 150, 40, 0, 2 * Math.PI);
        this.ctx.stroke();
        //draw ručičku
        const rad = (-game.player.yaw * Math.PI / 180) - Math.PI / 2;
        const x = 50 + 40 * Math.cos(rad);
        const y = 150 + 40 * Math.sin(rad);
        this.ctx.moveTo(50, 150);
        this.ctx.lineTo(x,y);
        this.ctx.stroke();
        //sever
        this.ctx.beginPath();
        this.ctx.arc(50, 110, 4, 0, 2 * Math.PI);
        this.ctx.fillStyle = "red";
        this.ctx.fill();

    }

    getChunksToRender(game){
        const chunksToRender = [];
        const p = game.player.position;
        const fullChunkSize = game.chunkSize * game.cubeSize;
        // Zjistíme index chunku, ve kterém je hráč
        const currentChunkX = Math.floor(p.x / fullChunkSize);
        const currentChunkZ = Math.floor(p.z / fullChunkSize);
        const neighbours = game.controls.chunkAroundRenderDistance;
        for (let x = currentChunkX - neighbours; x <= currentChunkX + neighbours; x++) {
            for (let z = currentChunkZ - neighbours; z <= currentChunkZ + neighbours; z++) {
                // Kontrola, jestli chunk existuje (není mimo hranice světy)
                if (game.world[x] && game.world[x][z]) {
                    const chunk = game.world[x][z];
                    chunksToRender.push(chunk);
                }
            }
        }
        return chunksToRender;
    }

    getCubesToDrawFromChunks(chunksToRender,player) {
        const cubesToDraw = [];

        chunksToRender.forEach(chunk => {
            chunk.forEach((row,cubeZ)=>{
                row.forEach((cube,cubeX)=>{
                    if(cube !== "air"){
                        const dx = cube.centerPoint.x - player.position.x;
                        const dy = cube.centerPoint.y - player.position.y;
                        const dz = cube.centerPoint.z - player.position.z;
                        cube.dist = dx*dx + dy*dy + dz*dz;
                        cube.x = cubeX;
                        cube.z = cubeZ;
                        cube.chunk = chunk;
                        cubesToDraw.push(cube);
                    }
                })
            })
        })
        return cubesToDraw;
    }

    drawGame(game, debug = false){
        const chunksToRender = this.getChunksToRender(game);
        const cubesToDraw = this.getCubesToDrawFromChunks(chunksToRender,game.player);
        // SEŘAZENÍ: Od nejvzdálenější (největší dist) po nejbližší
        cubesToDraw.sort((a, b) => b.dist - a.dist);
        // Vykreslení už v dobrém pořadí
        cubesToDraw.forEach(cube => {
            // Tady zavoláš svou vykreslovací funkci
            this.drawGameCube(cube, game.player,cube.chunk,cube.x,cube.z,debug );
        });
        if(debug){
            this.drawDebugInfo(game);
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

    addFaceToVisible(face,visibleEdges, c){

        for (let i = 0; i < 4; i++) {
            const p1 = face[i], p2 = face[(i + 1) % 4];
            let key = p1 < p2 ? `${p1}-${p2}` : `${p2}-${p1}`;
            let color = "black";
            switch (c) {
                case 0: color = "red"; break;
                case 1: color = "green"; break;
                case 2: color = "yellow"; break;
                case 3: color = "blue"; break;
                case 4: color = "purple"; break;
                case 5: color = "cyan"; break;
            }
            key += ";"+color;
            visibleEdges.add(key);
        }
    }

    drawGameCube(cube, player,chunk, x,z,debug= false) {
        if(x === 5 && z === 2){
            console.log("air is in draw!!!")
        }
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
        const visibleFaces = new Set();



        cube.faces.forEach((face,i) => {

            if (this.isFaceVisible(viewPoints, face)) {
                //check if there is neigbor in that direction.
                // this.addFaceToVisible(face,visibleEdges)
                if(i === 0){
                    // console.log(typeof chunk[x][z+1])
                    if(chunk[z+1] === undefined || chunk[z+1][x] === undefined || chunk[z+1][x] === "air" ) {
                        this.addFaceToVisible(face,visibleEdges,i)
                        visibleFaces.add(i);
                    }
                }
                if(i === 1){
                    // console.log(typeof chunk[x][z-1])
                    if(chunk[z-1] === undefined || chunk[z-1][x] === undefined || chunk[z-1][x] === "air" ) {
                        this.addFaceToVisible(face,visibleEdges,i)
                        visibleFaces.add(i);
                    }
                }
                if(i === 2){
                    this.addFaceToVisible(face,visibleEdges,i); // zatí furt visible, nemáme y rozměr světa.
                    visibleFaces.add(i);
                }
                if(i === 3){
                    // není visible, nemáme y rozměr světa
                }
                if(i === 4){
                    if(chunk[z][x+1] === undefined || chunk[z][x+1] === "air" ) {
                        this.addFaceToVisible(face,visibleEdges,i)
                        visibleFaces.add(i);
                    }
                }
                if(i === 5){
                    if(chunk[z][x-1] === undefined || chunk[z][x-1] === "air" ) {
                        this.addFaceToVisible(face,visibleEdges,i)
                        visibleFaces.add(i);
                    }
                }
            }
        });

        visibleEdges.forEach(key => {
            let [rest,color] = key.split(";");
            const [i1, i2] = rest.split('-').map(Number);
            if(!debug)
                color = "black";
            this.drawLine(viewPoints[i1], viewPoints[i2],color);
        });
        visibleFaces.forEach(key=>{
            const[i1,i2,i3,i4] = cube.faces[key];
            this.drawCubeWall(viewPoints[i1],viewPoints[i2],viewPoints[i3],viewPoints[i4]);
        })
        if(debug){
            this.ctx.textBaseline = "middle";
            const center = this.projectPoint(viewPoints[0])
            if(center){
                this.ctx.fillStyle = "black";
                this.ctx.strokeStyle = "black";
                this.ctx.strokeText(`x:${x} z:${z}`,center.x,center.y -10);
            }
        }
    }

    drawCubeWall(viewPoint, viewPoint2, viewPoint3, viewPoint4) {
        viewPoint = this.projectPoint(viewPoint);
        viewPoint2 = this.projectPoint(viewPoint2);
        viewPoint3 = this.projectPoint(viewPoint3);
        viewPoint4 = this.projectPoint(viewPoint4);
        if(viewPoint && viewPoint2 && viewPoint3 && viewPoint4) {

            this.ctx.beginPath();
            this.ctx.moveTo(viewPoint.x,viewPoint.y);
            this.ctx.lineTo(viewPoint2.x, viewPoint2.y);
            this.ctx.lineTo(viewPoint3.x, viewPoint3.y);
            this.ctx.lineTo(viewPoint4.x, viewPoint4.y);
            this.ctx.closePath();
            this.ctx.fillStyle= "gray";
            this.ctx.fill();
        }
    }
}