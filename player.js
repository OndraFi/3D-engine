import {Point} from "./point.js";

export class Player{
    constructor(){
        this.position = new Point(0,1,0);
        this.speed = 0.05;
        this.yaw = 0;
        this.pitch = 0;
    }

    updatePosition(controls){
        // if(controls.keys.w)
        //     this.position.z += this.speed;
        // if(controls.keys.s)
        //     this.position.z -= this.speed;
        // if(controls.keys.a)
        //     this.position.x -= this.speed;
        // if(controls.keys.d)
        //     this.position.x += this.speed;

        this.yaw -= controls.deltaX * controls.sensitivity;
        this.pitch -= controls.deltaY * controls.sensitivity;

        // Omezení pro pitch (nekoukat "za sebe" horem)
        if (this.pitch > 89) this.pitch = 89;
        if (this.pitch < -89) this.pitch = -89;

        const rad = this.yaw * Math.PI / 180;

        if (controls.keys.w) {
            // Prohodil jsem sin a cos, aby to sedělo na tvou rotaci v Rendereru
            this.position.x -= Math.sin(rad) * this.speed; // Tady je MÍNUS
            this.position.z += Math.cos(rad) * this.speed; // Tady je PLUS
        }
        if (controls.keys.s) {
            this.position.x += Math.sin(rad) * this.speed;
            this.position.z -= Math.cos(rad) * this.speed;
        }
        if (controls.keys.a) {
            // Úkrok doleva (otočeno o 90 stupňů vůči W)
            this.position.x -= Math.cos(rad) * this.speed;
            this.position.z -= Math.sin(rad) * this.speed;
        }
        if (controls.keys.d) {
            // Úkrok doprava
            this.position.x += Math.cos(rad) * this.speed;
            this.position.z += Math.sin(rad) * this.speed;
        }
    }
}