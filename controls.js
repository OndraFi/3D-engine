export class Controls{

    constructor(canvas){
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.sensitivity = 0.1;
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        }
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
        this.canvas.addEventListener("click", () => {
            this.canvas.requestPointerLock();
        });
    }

    keyDownHandler(e) {
        if(e.code === "KeyW"){
            this.keys.w = true;
        }
        if(e.code === "KeyA"){
            this.keys.a = true;
        }
        if(e.code=== "KeyD"){
            this.keys.d = true;
        }
        if(e.code === "KeyS"){
            this.keys.s = true;
        }
    }

    keyUpHandler(e) {
        if(e.code === "KeyW"){
            this.keys.w = false;
        }
        if(e.code === "KeyA"){
            this.keys.a = false;
        }
        if(e.code=== "KeyD"){
            this.keys.d = false;
        }
        if(e.code === "KeyS"){
            this.keys.s = false;
        }
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

        if (document.pointerLockElement === this.canvas) {
            this.deltaX += e.movementX;
            this.deltaY -= e.movementY;

            // // Omezení koukání nahoru/dolů (aby se hráč neotočil "vzhůru nohama")
            // if (this.pitch > 89) this.pitch = 89;
            // if (this.pitch < -89) this.pitch = -89;
        }
    }

    resetGameMouse() {
        this.deltaY = 0;
        this.deltaX = 0;
    }
}