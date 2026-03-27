import {Point} from "./point.js";
import {Cube} from "./cube.js";
import {Renderer} from "./renderer.js";
import {Controls} from "./controls.js";
const CANVAS_SIZE = 600;
const canvas = document.querySelector('#canvas');
const automaticRotation = document.querySelector('#automaticRotation');
const mouseRotation = document.querySelector('#mouseRotation');
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
const ctx = canvas.getContext("2d");

const renderer = new Renderer(canvas);
const controls = new Controls(canvas);

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
    }else if(automaticRotation.checked){
        cube.rotete(1);

    }
    renderer.drawCube(cube);
    // cube.draw(canvas);
    requestAnimationFrame(step);
}

requestAnimationFrame(step);
