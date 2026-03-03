// Imports (nothing as of yet)





// Settings
const REFRESH_RATE = 16; // Refresh rate in milliseconds
console.log(1000 / REFRESH_RATE + "FPS"); // Log the refresh rate in seconds


// *********** PROGRAM ***************


// Global canvas variables (used for testing and loop only)
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); 
let canvasDimensions = canvas.getBoundingClientRect(); 
let canvWidth = canvasDimensions.width;
let canvHeight = canvasDimensions.height;
console.log(canvas);


// Makes canvas responsive
function resizeCanvas() {
    let canvasContainer = getComputedStyle(canvas.parentElement);
    canvas.width = parseInt(canvasContainer.width) - parseInt(getComputedStyle(canvas).borderWidth);
    
    let canvasDimensions = canvas.getBoundingClientRect();
    canvWidth = canvasDimensions.width;
    canvHeight = canvasDimensions.height;
}



// Refreshes canvas
function mainLoop() {
    ctx.clearRect(0, 0, canvWidth, canvHeight); // Clear the canvas
    resizeCanvas();
}

// Start loop
setInterval(mainLoop, REFRESH_RATE);