import {Cube} from "./cube.js";
import {Point} from "./point.js";
import {Player} from "./player.js";

export class Game {
    constructor() {
        this.player = new Player();
        this.chunkSize = 10;
        this.worldSize = 10;
        this.cubeSize = 1;
        this.world = [];

        for (let cx = 0; cx < this.worldSize; cx++) {
            this.world[cx] = [];
            for (let cz = 0; cz < this.worldSize; cz++) {
                this.world[cx][cz] = this.createChunk(cx, cz);
            }
        }
    }

    createChunk(cx, cz) {
        const cubes = [];
        for (let i = 0; i < this.chunkSize; i++) {
            cubes[i] = [];
            for (let j = 0; j < this.chunkSize; j++) {
                // Výpočet pozice: (pozice chunku * velikost chunku) + (pozice kostky v chunku)
                const x = (cx * this.chunkSize * this.cubeSize) + (j * this.cubeSize);
                const z = (cz * this.chunkSize * this.cubeSize) + (i * this.cubeSize);
                cubes[i][j] = new Cube(new Point(x, -0.2, z), this.cubeSize);
            }
        }
        return cubes;
    }

    // updateMapView(controls){
    //     const keys = controls.keys;
    //     this.player.updatePosition(controls);
    //     const movement = {x:0,y:0,z:0}
    //     if(keys.w)
    //         movement.z -= this.player.speed;
    //     if(keys.s)
    //         movement.z += this.player.speed;
    //     if(keys.a)
    //         movement.x += this.player.speed;
    //     if(keys.d)
    //         movement.x -= this.player.speed;
    //
    //
    //
    //     this.map.forEach(row => {
    //         row.forEach(cube=> {
    //             cube.centerPoint.x += movement.x;
    //             cube.centerPoint.y += movement.y;
    //             cube.centerPoint.z += movement.z;
    //             cube.createPoints();
    //
    //             // cube.rotateBasedOnMousePlayer(controls,this.player);
    //         })
    //     })
    // }

}