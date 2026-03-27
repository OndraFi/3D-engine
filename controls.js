export class Controls{

    constructor(canvas){
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        document.addEventListener("mousemove", this.mouseMoveHandler);
    }

    mouseMoveHandler(e) {
        const relativeX = e.clientX - this.canvas.offsetLeft;
        if (relativeX > 0 && relativeX < this.canvas.width) {
            // console.log("X: ", relativeX);
            this.mouseX = relativeX;
        }
        const relativeY = e.clientY - this.canvas.offsetTop;
        if (relativeY > 0 && relativeY < this.canvas.height) {
            // console.log("Y: ", relativeY);
            this.mouseY = relativeY;
        }
    }
}