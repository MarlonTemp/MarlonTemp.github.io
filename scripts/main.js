//import * as cd from './CORDIC.js';


// Settings
const REFRESH_RATE = 16; // Refresh rate in milliseconds
console.log(1000 / REFRESH_RATE + "FPS"); // Log the refresh rate in seconds
const CIRCLE_RAD_SIZE = 0.45; // Circle radius size as a fraction of the canvas size
const GRID_FREQUENCY = 10; // How many lines per unit in the grid
const ANIM_SPEED = 1; // Speed of animation (avoid multiples of 2 for high numbers)
const ANIM_ANGLE_INC = Math.PI / 128; // Angle increment for animation in radians


// Global canvas variables (used mainly for testing and loop only)
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); 
let canvasDimensions = canvas.getBoundingClientRect(); 
let canvWidth = canvasDimensions.width;
let canvHeight = canvasDimensions.height;

// **************** CANVAS FUNCTIONS ****************

// Makes canvas responsive
function resizeCanvas() {
    let canvasContainer = getComputedStyle(canvas.parentElement);
    canvas.width = parseInt(canvasContainer.width) - parseInt(getComputedStyle(canvas).borderWidth);
    
    let canvasDimensions = canvas.getBoundingClientRect();
    canvWidth = canvasDimensions.width;
    canvHeight = canvasDimensions.height;
}

function drawRectAtCentre(canv, coord, dimensions, color = 'black') {
    let ctx = canv.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(coord[0] - (dimensions[0] / 2), coord[1] - (dimensions[1] / 2), dimensions[0], dimensions[1]);
}

// CIRCLES

function drawCircleAtCentre(canv, color = 'black', lineWidth = 1, startAngle = 0, targetAngle = 2 * Math.PI, size = 1, anticlockwise = true) {
    const canvCtx = canv.getContext('2d');
    let canvWidth = canv.width;
    let canvHeight = canv.height;
    let radius = Math.min(canvWidth, canvHeight) * CIRCLE_RAD_SIZE * size;
    canvCtx.strokeStyle = color;
    canvCtx.lineWidth = lineWidth;
    
    canvCtx.beginPath();
    canvCtx.arc(canvWidth / 2, canvHeight / 2, radius, -startAngle, -targetAngle, anticlockwise);
    canvCtx.stroke();
}

function drawRadius(canv, angle, color = 'red', lineWidth = 2) {
    const canvCtx = canv.getContext('2d');
    let canvWidth = canv.width;
    let canvHeight = canv.height;
    let radius = Math.min(canvWidth, canvHeight) * CIRCLE_RAD_SIZE;

    canvCtx.strokeStyle = color;
    canvCtx.lineWidth = lineWidth;

    canvCtx.beginPath();
    canvCtx.moveTo(canvWidth / 2, canvHeight / 2);


    canvCtx.lineTo(
        (canvWidth / 2) + (radius * Math.cos(angle)),
        (canvHeight / 2) - (radius * Math.sin(angle))
    );
    canvCtx.stroke();
}

function drawRadiusToPoint(canv, point, color = 'red', lineWidth = 2) {
    let angle = Math.atan(point[1]/point[0]);

    drawRadius(canv, angle, color, lineWidth);
}

// END CIRCLES

// Draws a grid centred at the canvas centre
function drawGrid(canv, gridFrequency = 1 /* How many lines per unit */, color = 'lightgray') {
    let canvCtx = canv.getContext('2d');
    let canvWidth = canv.width;
    let canvHeight = canv.height;
    let centreX = canvWidth / 2;
    let centreY = canvHeight / 2;
    let radius = Math.min(canvWidth, canvHeight) * CIRCLE_RAD_SIZE;
    let distance = radius / gridFrequency;
    canvCtx.strokeStyle = color;
    canvCtx.lineWidth = 2;

    canvCtx.beginPath();
    
    for (let i = centreX; i < canvWidth; i += distance) {
        canvCtx.moveTo(i, 0);
        canvCtx.lineTo(i, canvHeight);
    }

    for (let i = centreX; i > 0; i -= distance) {
        canvCtx.moveTo(i, 0);
        canvCtx.lineTo(i, canvHeight);
    }

    for (let i = centreY; i < canvHeight; i += distance) {
        canvCtx.moveTo(0, i);
        canvCtx.lineTo(canvWidth, i);
    }

    for (let i = centreY; i > 0; i -= distance) {
        canvCtx.moveTo(0, i);
        canvCtx.lineTo(canvWidth, i);
    }

    canvCtx.stroke();
}

function test() {
    canvWidth = canvas.width;
    canvHeight = canvas.height;
    
    let squareLength = Math.min(canvWidth, canvHeight) * 0.9;

    ctx.fillStyle = 'black';

    drawRectAtCentre(canvas, [canvWidth / 2, canvHeight / 2], [squareLength, squareLength]);

}

// ANIMATION

function animSmoothingFunction(progress) {
    return progress * (2 - progress);
}


// Have this animation extend a base animation class
class RadiusAnimation {
    canv;
    startAngle;
    targetAngle;
    speed;
    animProgress = 0;
    animCompleted = false;

    constructor(canv, startAngle, targetAngle, speed, color = 'black') {
        this.canv = canv;
        this.startAngle = startAngle;
        this.targetAngle = targetAngle;
        this.speed = speed;
        this.color = color;
    }

    loop() {
        if (this.animProgress >= 1) {
            this.animCompleted = true;
        }
        else {
            this.animProgress += this.speed * ANIM_ANGLE_INC;
            let curAngle = (this.targetAngle * animSmoothingFunction(this.animProgress)) + this.startAngle;
            drawRadius(this.canv, curAngle, this.color, 2);
        }
    }

    resetAnim() {
        this.animProgress = 0; 
        this.animCompleted = false; 
    }
}

// Have this class extend a base animation class
class CircleAnimation extends RadiusAnimation {
    size;
    anticlockwise;

    constructor(canv, startAngle, targetAngle, speed, color = "black", size = 1, anticlockwise = true) {
        super(canv, startAngle, targetAngle, speed, color);
        this.size = size;
        this.anticlockwise = anticlockwise;
        if (this.anticlockwise == false) {
            this.targetAngle = -this.targetAngle; 
        }
    }

    loop() {
        if (this.animProgress >= 1) {
            this.animCompleted = true;
        } else {
            this.animProgress += this.speed * ANIM_ANGLE_INC;
            let curAngle = ((this.targetAngle - this.startAngle) * animSmoothingFunction(this.animProgress)) + this.startAngle;
            drawCircleAtCentre(this.canv, this.color, 2, this.startAngle, curAngle, this.size, this.anticlockwise);
        }
    }
}

// Group of animations that are completed simultaneously
class AnimGroup {
    animations = [];
    animCompleted = false;

    constructor(animations) {
        this.animations = animations;
    }

    loop() {
        let completedFlag = true; // Flag to check if all animations are completed
        
        if (this.animations.length === 0) {
            this.animCompleted = true; // Mark the group as completed if no animations are left
            return;
        }
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].loop();
            if (!this.animations[i].animCompleted) {
                completedFlag = false; // If any animation is not completed, set the flag to false
            }
        }
        if (completedFlag) {
            this.animCompleted = true; // If all animations are completed, mark the group as completed
        }
    }

    resetAnim() {
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].resetAnim();
        }
        this.animCompleted = false; // Reset the group completion status
    }
}

class AnimManager {
    static queuedAnims = [];
    static loopManager() {
        
        if (this.queuedAnims.length > 0) {
            console.log(this.queuedAnims);
            this.queuedAnims[0].loop();
            if (this.queuedAnims[0].animCompleted) {
                this.queuedAnims.splice(0, 1); // Remove the completed animation
                
            }
        }
    }

    static addAnim(anim) {
        anim.resetAnim(); 
        this.queuedAnims.push(anim);
        console.log(this.queuedAnims[0]);
    }
}

// Button and event listeners

function beginAnim(event) {
    event.preventDefault(); // Prevent form submission
    let anim = new RadiusAnimation(canvas, initAngle, targetAngle, ANIM_SPEED);
    AnimManager.queuedAnims.push(anim);
}

document.getElementById("startAnimBtn").addEventListener("click", beginAnim);

// END BUTTONS

// Main loop
let angle = 0;
let startAnim = false;
let animProgress = 0; // from 0 to 1
let initAngle = 0;
let targetAngle = 3;

function loop() {
    ctx.clearRect(0, 0, canvWidth, canvHeight); // Clear the canvas
    resizeCanvas();
    drawGrid(canvas, GRID_FREQUENCY, 'lightgray'); // Draw the grid
    drawGrid(canvas, 0, 'black'); // Draw the main grid lines
    drawRadius(canvas, angle, 'red', 2); 
    
    if (startAnim) {
        animProgress += ANIM_SPEED * ANIM_ANGLE_INC;
        if (animProgress >= 1) {
            animProgress = 0;
            startAnim = false;
        }

        curAngle = (targetAngle * animSmoothingFunction(animProgress)) + initAngle; 
        drawRadius(canvas, curAngle, 'red', 2);
    }

    

    drawCircleAtCentre(canvas, 'darkgreen', 2, 0, Math.PI * 2); // Draw the circle with the current angle
    drawCircleAtCentre(canvas, 'blue', 2, 0, angle % (2 * Math.PI)); // Draw the circle with the current angle
    angle += ANIM_SPEED * ANIM_ANGLE_INC; // Animation angle

    AnimManager.loopManager();
}

let testInitAngle = 0;
let testTargetAngle = Math.PI * 1.5;
let testSpeed = 0.5;
let testAnim1 = new CircleAnimation(canvas, testInitAngle, testTargetAngle, testSpeed, "yellow");
let testAnim2 = new RadiusAnimation(canvas, testInitAngle, testTargetAngle, testSpeed, "yellow");
let testAnim3 = new CircleAnimation(canvas, testInitAngle, testTargetAngle, testSpeed, "yellow", 0.1);

let testAnimGroup = new AnimGroup([testAnim1, testAnim2, testAnim3]);
let testAnimGroup2 = new AnimGroup([testAnim1, testAnim2, testAnim3]);
AnimManager.addAnim(testAnimGroup);

setInterval(loop, REFRESH_RATE);