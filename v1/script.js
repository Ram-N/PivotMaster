const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const moveCounter = document.getElementById('moveCounter');

let square = {
    x: 300,
    y: 200,
    size: 100,
    angle: 0,
};

let pivot = null;
let otherCorners = [];
let moves = 0;

function drawGrid() {
    ctx.strokeStyle = '#ddd';
    for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawSquare() {
    ctx.save();
    ctx.translate(square.x, square.y);
    ctx.rotate(square.angle);
    ctx.fillStyle = '#4287f5';
    ctx.fillRect(-square.size / 2, -square.size / 2, square.size, square.size);

    const corners = [
        [-square.size / 2, -square.size / 2],
        [square.size / 2, -square.size / 2],
        [square.size / 2, square.size / 2],
        [-square.size / 2, square.size / 2]
    ];
    ctx.fillStyle = 'red';
    corners.forEach(([x, y], index) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    });
    ctx.restore();
}

function drawPivotCircles() {
    if (!pivot) return;
    ctx.save();
    ctx.translate(pivot.x, pivot.y);
    ctx.strokeStyle = 'orange';
    [distanceToOtherCorner(0), distanceToOtherCorner(1), distanceToOtherCorner(2)].forEach(r => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 2 * Math.PI);
        ctx.stroke();
    });
    ctx.restore();
}

function distanceToOtherCorner(index) {
    const dx = otherCorners[index].x - pivot.x;
    const dy = otherCorners[index].y - pivot.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function getSquareCorners() {
    const half = square.size / 2;
    const corners = [
        { x: square.x - half, y: square.y - half },
        { x: square.x + half, y: square.y - half },
        { x: square.x + half, y: square.y + half },
        { x: square.x - half, y: square.y + half },
    ];
    const cosA = Math.cos(square.angle);
    const sinA = Math.sin(square.angle);
    return corners.map(c => {
        const dx = c.x - square.x;
        const dy = c.y - square.y;
        return {
            x: square.x + dx * cosA - dy * sinA,
            y: square.y + dx * sinA + dy * cosA,
        };
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawSquare();
    drawPivotCircles();
}

canvas.addEventListener('click', function (e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const corners = getSquareCorners();

    if (!pivot) {
        corners.forEach((c, index) => {
            const dx = clickX - c.x;
            const dy = clickY - c.y;
            if (dx * dx + dy * dy < 100) {
                pivot = c;
                otherCorners = corners.filter((_, i) => i !== index);
                draw();
            }
        });
    } else {
        const dx = clickX - pivot.x;
        const dy = clickY - pivot.y;
        const angle = Math.atan2(dy, dx);
        animateRotation(pivot, angle);
        pivot = null;
        moves++;
        moveCounter.textContent = moves;
    }
});

function animateRotation(pivotPoint, targetAngle) {
    let startAngle = square.angle;
    let endAngle = targetAngle;
    let duration = 500;
    let startTime = null;

    function animationStep(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = (timestamp - startTime) / duration;
        if (progress > 1) progress = 1;
        square.angle = startAngle + (endAngle - startAngle) * progress;
        draw();
        if (progress < 1) {
            requestAnimationFrame(animationStep);
        }
    }
    requestAnimationFrame(animationStep);
}

draw();
