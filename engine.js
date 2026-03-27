import {Point} from "./point.js";
import {Cube} from "./cube.js";
import {Renderer} from "./renderer.js";
import {Controls} from "./controls.js";
import {Game} from "./game.js";
const CANVAS_SIZE = 600;
const canvas = document.querySelector('#canvas');
const automaticRotation = document.querySelector('#automaticRotation');
const mouseRotation = document.querySelector('#mouseRotation');
const gameSelected = document.querySelector('#game');
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
const ctx = canvas.getContext("2d");

const renderer = new Renderer(canvas);
const controls = new Controls(canvas);
const game = new Game();

function pxSizeToObjectSize(px){
    return px / CANVAS_SIZE;
}

let angle = 0;

const p= new Point(0,0,1);
const cube = new Cube(p, pxSizeToObjectSize(400));

function step(){
    renderer.clear();
    // p.draw(canvas);
    // drawCanvasPoint(getCanvasPointFrom3dPoint(p));
    if(mouseRotation.checked){
        cube.rotateBasedOnMouseMove(controls.mouseX, controls.mouseY, CANVAS_SIZE);
        renderer.drawCube(cube);
    }else if(automaticRotation.checked){
        cube.rotate(1);
        renderer.drawCube(cube);
    }else if(gameSelected.checked){
        game.player.updatePosition(controls)
        console.log(game.player.position.z)
        renderer.drawGame(game);
        controls.resetGameMouse()
    }
    // cube.draw(canvas);
    requestAnimationFrame(step);
}

requestAnimationFrame(step);
