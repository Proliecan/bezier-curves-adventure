var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
offset = {x: 100, y: 600};
let t = .5;

// on reload
window.onload = function() {
    resetT();
}

// Function to draw a circle
function drawCircle(x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x + offset.x, y + offset.y, radius, 0, 2 * Math.PI);
    context.fill();
}

// Function to draw a point with label corrected for offset
function drawPoint(x, y, label, color) {
    // if no color is given use red
    if (color == null) {
        color = "red";
    }
    drawCircle(x, y, 5, color);
    context.fillStyle = "white";
    context.font = "bold 12px sans-serif";
    context.fillText(label, x + offset.x + 10, y + offset.y - 10);
}

// Function to draw points
function drawPoints(points, color) {
    for (var i = 0; i < points.length; i++) {
        drawPoint(points[i].x, points[i].y, points[i].label, color);
    }
}

// Function to draw a line
function drawLine(x1, y1, x2, y2, color) {
    context.strokeStyle = color;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(x1 + offset.x, y1 + offset.y);
    context.lineTo(x2 + offset.x, y2 + offset.y);
    context.stroke();
}

// Function to draw background
function drawBackground(color) {
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to draw a grid
function drawGrid(color, stepx, stepy) {
    context.strokeStyle = color;
    context.lineWidth = 1;
    for (var i = stepx + context.lineWidth; i < canvas.width; i += stepx) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
        context.stroke();
    }
    for (var i = stepy + context.lineWidth; i < canvas.height; i += stepy) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(canvas.width, i);
        context.stroke();
    }
}


// Function to draw axis with an offset in x and y, arrows and scale
function drawAxis(color, offsetX, offsetY, step) {
    // draw axis
    drawLine(0, 0 - offset.y, 0, canvas.height, color);
    drawLine(0 - offset.x, 0, canvas.width, 0, color);

    // draw arrows
    drawLine(0, 0 - offset.y, 10, 10 - offset.y, color);
    drawLine(0, 0 - offset.y, -10, 10 - offset.y, color);
    drawLine(canvas.width - offset.x, 0, canvas.width - 10 - offset.x, -10, color);
    drawLine(canvas.width - offset.x, 0, canvas.width - 10 - offset.x, 10, color);


    // draw scale
    context.fillStyle = color;
    context.font = "bold 12px sans-serif";
    for (var i = offsetX + step; i < canvas.width; i += step) {
        context.fillText((i - offsetX), i, offsetY + 15);
    }
    for (var i = offsetX - step; i > 0; i -= step) {
        context.fillText((i - offsetX), i, offsetY + 15);
    }
    for (var i = offsetY + step; i < canvas.height; i += step) {
        context.fillText((offsetY - i), offsetX + 5, i);
    }
    for (var i = offsetY - step; i > 0; i -= step) {
        context.fillText((offsetY - i), offsetX + 5, i);
    }
}

// Function to draw a coordinate system with an offset in x and y
function drawCoordinateSystem(axisColor, gridColor, smallGridColor, offsetX, offsetY, step) {
    drawGrid(smallGridColor, step / 10, step / 10);
    drawGrid(gridColor, step, step);
    drawAxis(axisColor, offsetX, offsetY, step);
}

// Function to initialize the canvas
function initCanvas() {
    // draw background
    drawBackground("#000000");

    // draw coordinate system
    drawCoordinateSystem("#ffffff", "#555555", "#222222", offset.x, offset.y, 100);
}

let count = 0;
let points = [];
points[0] = [];
// mouse position
function addPoint(e)
{
    var mouseX, mouseY;

    if(e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if(e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }

    /* do something with mouseX/mouseY */
    // new point object correcting for offset
    var point = {x: mouseX - offset.x, y: mouseY - offset.y, label: "A"+count};
    points[0].push(point);
    // draw point corrected for offset
    drawPoint(point.x + offset.x, point.y + offset.y, point.label);
    count++;

    // update canvas
    updateCanvas();
}
// draw lines
function drawLinesBetween(p) {
    // for each point except the last one draw a line to the next point
    for (var i = 0; i < p.length - 1; i++) {
        drawLine(p[i].x, p[i].y, p[i+1].x, p[i+1].y, "grey");
    }
}

// lerp between two points
function lerp(p1, p2, t) {
    return {x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t, label: ""};
}

// lerp between multiple points at the same t value
function lerpMultiple(p, t) {
    let lerpset = [];
    for (var i = 0; i < p.length - 1; i++) {
        lerpset.push(lerp(p[i], p[i+1], t));
    }
    return lerpset;
}

// color from integer
function color(i) {
    switch (i) {
        case 0: return "red";
        default: return "lightgrey";
    }
}

// get the t value adjusted for the slider
function updateT() {
    t = document.getElementById("t-value-slider").value / 1000;
    updateCanvas();
}

// reset t value slider
function resetT() {
    document.getElementById("t-value-slider").value = 500;
    updateT();
}

// Update canvas
function updateCanvas() {
    initCanvas();

    // for every set of points in points
    for (var i = 0; i < points.length; i++) {
        // draw lines between points
        drawLinesBetween(points[i]);
        // draw points
        drawPoints(points[i], color(i));
        // lerp between points
        points[i+1] = lerpMultiple(points[i], t);
        // break if there are no more points to lerp
        if (points[i+1].length <= 1) {
            drawPoints(points[i+1], "yellow");
            break;
        }
    }
}

