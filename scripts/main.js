import * as cd from './CORDIC.js';


// Settings
const REFRESH_RATE = 16; // Refresh rate in milliseconds
console.log(1000 / REFRESH_RATE + "FPS"); // Log the refresh rate in seconds
const CIRCLE_RAD_SIZE = 0.45; // Circle radius size as a fraction of the canvas size
const GRID_FREQUENCY = 10; // How many lines per unit in the grid
const DEFAULT_ANIM_SPEED = 1; // Speed of animation (avoid multiples of 2 for high numbers)
const ANIM_ANGLE_INC = Math.PI / 128; // Angle increment for animation in radians
const DEFAULT_LINE_THICKNESS = 2; // Default line thickness for drawing

// Global canvas variables (used for testing and loop only)
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

// Rectangle drawn from centre of canvas
function drawRectAtCentre(canv, coord, dimensions, color = 'black') {
    let ctx = canv.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(coord[0] - (dimensions[0] / 2), coord[1] - (dimensions[1] / 2), dimensions[0], dimensions[1]);
}

// CIRCLES

function drawCircleAtCentre(canv, color = 'black', lineWidth = DEFAULT_LINE_THICKNESS, startAngle = 0, targetAngle = 2 * Math.PI, size = 1, anticlockwise = true) {
    const canvCtx = canv.getContext('2d');
    let canvWidth = canv.width;
    let canvHeight = canv.height;
    let radius = Math.min(canvWidth, canvHeight) * CIRCLE_RAD_SIZE * size;
    canvCtx.strokeStyle = color;
    canvCtx.lineWidth = lineWidth;
    
    canvCtx.beginPath();
    // Angles are negative so circle is drawn anticlockwise, and top quadrants are positive
    canvCtx.arc(canvWidth / 2, canvHeight / 2, radius, -startAngle, -targetAngle, anticlockwise);
    canvCtx.stroke();
}

// Draw radius form centre of canvas to circumference of circle of set size at a speicificd angle
function drawRadius(canv, angle, color = 'red', lineWidth = DEFAULT_LINE_THICKNESS) {
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

// Draws radius using point instead of angle. Point is an array [x, y]
function drawRadiusToPoint(canv, point, color = 'red', lineWidth = DEFAULT_LINE_THICKNESS) {
    let angle = Math.atan(point[1]/point[0]);

    drawRadius(canv, angle, color, lineWidth);
}

// END CIRCLES

// Draws a grid centred at the canvas centre
// Grid frequency is number of lines per unit
// Where unit is default radius length 
function drawGrid(canv, gridFrequency = 1, color = 'lightgray') {
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


// TESTING RECTANGLES
// DELETE AFTERWARDS
function test() {
    canvWidth = canvas.width;
    canvHeight = canvas.height;
    
    let squareLength = Math.min(canvWidth, canvHeight) * 0.9;

    ctx.fillStyle = 'black';

    drawRectAtCentre(canvas, [canvWidth / 2, canvHeight / 2], [squareLength, squareLength]);

}

// ******** STATIC DRAWINGS ********

class Radius {
    angle;
    color;
    lineWidth;

    constructor(angle, color = 'black', lineWidth = 2) {
        this.angle = angle;
        this.color = color;
        this.lineWidth = lineWidth;
    }

    draw(canv) {
        drawRadius(canv, this.angle, this.color, this.lineWidth);
    }
}

class StaticDrawing {
    drawings = [];

    constructor(drawings = []) {
        this.drawings = drawings; // Array of functions that draw on the canvas
    }

    draw(canv) {
        for (let i = 0; i < this.drawings.length; i++) {
            this.drawings[i].draw(canv);
        }
    }

    addDrawing(drawing) {
        this.drawings.push(drawing);
    }

    clearDrawings() {
        this.drawings = [];
    }
}

// *********** ANIMATION ***********

function animSmoothingFunction(progress) {
    return progress * (2 - progress);
}

// Have this animation extend a base animation class
class RadiusAnimation {
    canv;
    startAngle;
    targetAngle;
    animProgress = 0;
    animCompleted = false;

    constructor(canv, startAngle, targetAngle, color = 'black') {
        this.canv = canv;
        this.startAngle = startAngle;
        this.targetAngle = targetAngle;
        this.color = color;
    }

    getCurAngle() {
        return ((this.targetAngle - this.startAngle) * animSmoothingFunction(this.animProgress)) + this.startAngle;
    }

    loop(speed = DEFAULT_ANIM_SPEED) {
        if (this.animProgress >= 1) {
            this.animCompleted = true;
        }
        else {
            this.animProgress += speed * ANIM_ANGLE_INC;
            let curAngle = this.getCurAngle();
            drawRadius(this.canv, curAngle, this.color, 2);
        }
    }

    draw() {
        let curAngle = this.getCurAngle();
        drawRadius(this.canv, curAngle, this.color, 2);
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

    constructor(canv, startAngle, targetAngle, color = "black", size = 1, anticlockwise = true) {
        super(canv, startAngle, targetAngle, color);
        this.size = size;
        this.anticlockwise = anticlockwise;
        if (this.anticlockwise == false) {
            let temp = this.startAngle;
            this.startAngle = this.targetAngle;
            this.targetAngle = temp; 
        }
    }

    loop(speed = DEFAULT_ANIM_SPEED) {
        if (this.animProgress >= 1) {
            this.animCompleted = true;
        } 
        else {
            this.animProgress += speed * ANIM_ANGLE_INC;
            let curAngle = this.getCurAngle();
            drawCircleAtCentre(this.canv, this.color, 2, this.startAngle, curAngle, this.size);
        }
    }

    draw() {
        let curAngle = this.getCurAngle();
        drawCircleAtCentre(this.canv, this.color, 2, this.startAngle, curAngle, this.size);
    }
}

// Group of animations that are completed simultaneously
class AnimGroup {
    animations = [];
    animCompleted = false;

    constructor(animations) {
        this.animations = animations;
    }

    loop(speed = DEFAULT_ANIM_SPEED) {
        let completedFlag = true;

        if (this.animations.length === 0) {
            this.animCompleted = true; 
            return;
        }
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].loop(speed);
            if (!this.animations[i].animCompleted) {
                completedFlag = false; 
            }
        }
        if (completedFlag) {
            this.animCompleted = true; 
        }
    }

    draw() {
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].draw();
        }
    }

    resetAnim() {
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].resetAnim();
        }
        this.animCompleted = false; 
    }
}

// Processes animations in a queue
class AnimManager {
    queuedAnims = [];

    loopManager(speed = DEFAULT_ANIM_SPEED) {
        if (this.queuedAnims.length > 0) {
            this.queuedAnims[0].loop(speed);
            if (this.queuedAnims[0].animCompleted) {
                this.queuedAnims.splice(0, 1);
            }
        }
    }

    drawManager() {
        if (this.queuedAnims.length > 0) {
            this.queuedAnims[0].draw();
        }
    }

    addAnim(anim) {
        anim.resetAnim(); 
        this.queuedAnims.push(anim);
    }

    clearAnims() {
        this.queuedAnims = [];
    }
}
// *********** END ANIMATIONS ***********


// ********* BUTTONS AND EVENTS *********

function beginAnim(event) {
    event.preventDefault(); // Prevent form submission
    let anim = new RadiusAnimation(canvas, initAngle, targetAngle);
    animManager.queuedAnims.push(anim);
}

function pauseAnim(event) {
    event.preventDefault(); 
    paused = !paused;
    document.getElementById("pauseBtn").innerText = paused ? "Resume" : "Pause";
}

function stopAnim(event) {
    event.preventDefault(); 
    animManager.clearAnims();
    paused = false;
    document.getElementById("pauseBtn").innerText = "Pause";
}

function queueAnim(event) {
    event.preventDefault();
    const INIT_ANGLE = 0;
    let angle = parseFloat(document.getElementById("angleInput").value);
    console.log(angle);
    let iterations = parseInt(document.getElementById("iterations").value);
    let angles = cd.getSinCosUsedAngles(angle, iterations);
    let result = cd.getSinCosDegrees(angle, iterations);
    let sinOutput = document.getElementById("sinValue");
    let cosOutput = document.getElementById("cosValue");
    sinOutput.innerText = result[1].toFixed(4);
    cosOutput.innerText = result[0].toFixed(4);

    // Initial anim (starting from 0)
    let outerCircleAnim = new CircleAnimation(canvas, INIT_ANGLE, angles[0], 'red');
    let radiusAnim = new RadiusAnimation(canvas, INIT_ANGLE, angles[0], 'red');
    let innerCircleAnim = new CircleAnimation(canvas, INIT_ANGLE, angles[0], 'red', 0.1);
    let staticRadiusAnim;
    let animGroup = new AnimGroup([outerCircleAnim, radiusAnim, innerCircleAnim]);
    animManager.addAnim(animGroup);
    
    for (let i = 1; i < angles.length; i++) {
        let anticlockwise = true;
        let initAngle = angles[i - 1];
        let targetAngle = angles[i];
        
        if (angles[i] < angles[i - 1]) {
            anticlockwise = false;
            /*
            let temp = initAngle;
            initAngle = targetAngle;
            targetAngle = temp;
            */
        }

        console.log("Iteration: ", i, initAngle, targetAngle, anticlockwise);
            


        outerCircleAnim = new CircleAnimation(canvas, initAngle, targetAngle, 'red', anticlockwise);
        radiusAnim = new RadiusAnimation(canvas, initAngle, targetAngle, 'red');
        innerCircleAnim = new CircleAnimation(canvas, initAngle, targetAngle, 'red', 0.1, anticlockwise);
        staticRadiusAnim = new RadiusAnimation(canvas, angles[i - 1], angles[i - 1], 'black');
        animGroup = new AnimGroup([outerCircleAnim, innerCircleAnim, staticRadiusAnim, radiusAnim]);
        animManager.addAnim(animGroup);
    }
}

document.getElementById("startAnimBtn").addEventListener("click", queueAnim);
document.getElementById("pauseBtn").addEventListener("click", pauseAnim);
document.getElementById("resetBtn").addEventListener("click", stopAnim);

// ************* END BUTTONS ***************

// ********* OTHER FUNCTIONALITY *********

function setInputValues() {
    document.getElementById("angleValue").innerText = parseFloat(document.getElementById("angleInput").value).toFixed(1);
    document.getElementById("speedValue").innerText = parseFloat(document.getElementById("speedInput").value).toFixed(2);
    document.getElementById("iterationsValue").innerText = document.getElementById("iterations").value;
}

// Main loop

let staticDrawer = new StaticDrawing([]);
let animManager = new AnimManager();
let paused = false;

// TESTING
let angle = 0; //TESTING ONLY
let startAnim = false;
let animTestProgress = 0; // from 0 to 1
let initAngle = 0;
let targetAngle = Math.PI * 0.75;

// END TESTING

function mainLoop() {
    ctx.clearRect(0, 0, canvWidth, canvHeight); // Clear the canvas
    resizeCanvas();
    setInputValues(); // Update input values

    let animSpeed = document.getElementById("speedInput").value; // Get the speed from the input
    drawGrid(canvas, GRID_FREQUENCY, 'lightgray'); // Draw the grid
    drawGrid(canvas, 0, 'black'); // Draw the main grid lines
    staticDrawer.draw(canvas); // Draw static elements
    drawRadius(canvas, document.getElementById("angleInput").value * (Math.PI / 180), 'lightblue'); // Draw the radius at the specified angle
    drawCircleAtCentre(canvas, 'darkgreen', 2, 0, Math.PI * 2); // Draw the circle with the current angle

    /* TES ANIMATION
    if (startAnim) {
        animTestProgress += animSpeed * ANIM_ANGLE_INC;
        if (animTestProgress >= 1) {
            animTestProgress = 0;
            startAnim = false;
        }    
        curAngle = (targetAngle * animSmoothingFunction(animTestProgress)) + initAngle;
        drawRadius(canvas, curAngle, 'red', 2);

    }
        */

    //drawRadius(canvas, angle, 'red', 2); 
    //drawCircleAtCentre(canvas, 'blue', 2, 0, angle % (2 * Math.PI)); // Draw the circle with the current angle

    if (!paused) {
        angle += animSpeed * ANIM_ANGLE_INC; // Animation angle
        animManager.loopManager(animSpeed);
    }
    else {
        animManager.drawManager(animSpeed);
    }
    
}

// ************** TESTING **************
/*
let testInitAngle = 0;
let testTargetAngle = Math.PI * 1.5;
let testAnim1 = new CircleAnimation(canvas, testInitAngle, testTargetAngle, "red");
let testAnim2 = new RadiusAnimation(canvas, testInitAngle, testTargetAngle, "red");
let testAnim3 = new CircleAnimation(canvas, testInitAngle, testTargetAngle, "red", 0.1);

let testRadiusAnim = new RadiusAnimation(canvas, 0, testTargetAngle, "lightblue");
animManager.addAnim(testRadiusAnim);
let testAnimGroup = new AnimGroup([testAnim1, testAnim2, testAnim3]);
animManager.addAnim(testAnimGroup);


let testAngle = 25;
let testIterations = 20;
// console.log(cd.getSinCosUsedAngles(testAngle, testIterations)); 
console.log(cd.angleArrayToDegrees(cd.getSinCosUsedAngles(testAngle, testIterations)));
*/

// ************** END TESTING ***************

setInterval(mainLoop, REFRESH_RATE);