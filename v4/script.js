const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const moveCounter = document.getElementById('moveCounter');

let square = { x: 300, y: 200, size: 100, angle: 0 };
let pivot = null;
let selectedPivotIndex = null;
let otherCorners = [];
let moves = 0;
let hoverAngle = null;
let hoverTargetCornerIndex = null;
let lastGhostSquare = null;
let squareHistory = [];  // Stores all previous positions

function drawGrid() {
    ctx.strokeStyle = '#ddd';
    for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
}

function drawSquare(sq, highlightPivot = false, pivotIndex = null, color = '#4287f5', alpha = 1.0, outlineOnly = false) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(sq.x, sq.y);
    ctx.rotate(sq.angle);

    if (!outlineOnly) {
        ctx.fillStyle = color;
        ctx.fillRect(-sq.size / 2, -sq.size / 2, sq.size, sq.size);
    } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(-sq.size / 2, -sq.size / 2, sq.size, sq.size);
    }

    const corners = [
        [-sq.size / 2, -sq.size / 2],
        [sq.size / 2, -sq.size / 2],
        [sq.size / 2, sq.size / 2],
        [-sq.size / 2, sq.size / 2]
    ];
    corners.forEach(([x, y], index) => {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        if (highlightPivot && index === pivotIndex) {
            ctx.fillStyle = 'green';
        } else {
            ctx.fillStyle = 'red';
        }
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
        ctx.beginPath(); ctx.arc(0, 0, r, 0, 2 * Math.PI); ctx.stroke();
    });
    ctx.restore();
}

function distanceToOtherCorner(index) {
    const dx = otherCorners[index].x - pivot.x;
    const dy = otherCorners[index].y - pivot.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function getSquareCorners(sq = square) {
    const half = sq.size / 2;
    const corners = [
        { x: sq.x - half, y: sq.y - half },
        { x: sq.x + half, y: sq.y - half },
        { x: sq.x + half, y: sq.y + half },
        { x: sq.x - half, y: sq.y + half },
    ];
    const cosA = Math.cos(sq.angle);
    const sinA = Math.sin(sq.angle);
    return corners.map(c => {
        const dx = c.x - sq.x;
        const dy = c.y - sq.y;
        return {
            x: sq.x + dx * cosA - dy * sinA,
            y: sq.y + dx * sinA + dy * cosA,
        };
    });
}


let targetSquare = null;

function setDifficulty() {
    const selected = document.querySelector('input[name="difficulty"]:checked').value;

    if (selected === 'leftRight') {
        square.x = 150;
        square.y = canvas.height / 2;
        square.angle = 0;
        targetSquare = { x: 650, y: canvas.height / 2, size: square.size };
    }
    else if (selected === 'topBottom') {
        square.x = canvas.width / 2;
        square.y = 100;
        square.angle = 0;
        targetSquare = { x: canvas.width / 2, y: 500, size: square.size };
    }
    else if (selected === 'diagonal') {
        square.x = 150;
        square.y = 100;
        square.angle = 0;
        targetSquare = { x: 650, y: 500, size: square.size };
    }

    // Reset move counter and history
    moves = 0;
    moveCounter.textContent = moves;
    squareHistory = [];
    pivot = null;
    selectedPivotIndex = null;
    hoverAngle = null;
    hoverTargetCornerIndex = null;
    draw();
}

// Modify your draw() function to also draw the target
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    // Draw previous positions
    squareHistory.forEach(oldSq => {
        drawSquare(oldSq, false, null, 'black', 0.3, true);
    });

    // Draw target square
    if (targetSquare) {
        drawSquare(targetSquare, false, null, 'gold', 0.5, true);
    }

    // Draw current main square
    drawSquare(square, true, selectedPivotIndex);

    // Draw ghost preview
    if (pivot && hoverAngle !== null && hoverTargetCornerIndex !== null) {
        let ghost = computeRotatedSquare(hoverAngle);
        drawSquare(ghost, false, null, 'gray', 0.5);
    }

    drawPivotCircles();
}

function checkWinCondition() {
    if (!targetSquare) return false;

    const dx = square.x - targetSquare.x;
    const dy = square.y - targetSquare.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const tolerance = 10; // Pixels

    return distance <= tolerance;
}


function computeRotatedSquare(angle) {
    let dx = square.x - pivot.x;
    let dy = square.y - pivot.y;
    let cosA = Math.cos(angle);
    let sinA = Math.sin(angle);
    let newX = pivot.x + dx * cosA - dy * sinA;
    let newY = pivot.y + dx * sinA + dy * cosA;
    return { x: newX, y: newY, size: square.size, angle: square.angle + angle };
}

canvas.addEventListener('mousemove', function (e) {
    if (!pivot) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hoverAngle = null;
    hoverTargetCornerIndex = null;
    otherCorners.forEach((corner, index) => {
        const dxClick = x - pivot.x;
        const dyClick = y - pivot.y;
        const targetAngle = Math.atan2(dyClick, dxClick);
        const dxCorner = corner.x - pivot.x;
        const dyCorner = corner.y - pivot.y;
        const currentAngle = Math.atan2(dyCorner, dxCorner);
        const dist = Math.sqrt(dxCorner * dxCorner + dyCorner * dyCorner);
        const clickDist = Math.sqrt(dxClick * dxClick + dyClick * dyClick);
        if (Math.abs(clickDist - dist) < 10) {
            hoverAngle = targetAngle - currentAngle;
            hoverTargetCornerIndex = index;
        }
    });
    draw();
});

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
                selectedPivotIndex = index;
                otherCorners = corners.filter((_, i) => i !== index);
                draw();
            }
        });
    } else if (hoverAngle !== null) {
        lastGhostSquare = computeRotatedSquare(hoverAngle);
        squareHistory.push({ ...square });  // Save current square to history

        // Save pivot before clearing it
        let pivotPoint = { ...pivot };
        let targetSquare = { ...lastGhostSquare };

        // Clear ghost and hover info before rotation
        lastGhostSquare = null;
        hoverAngle = null;
        hoverTargetCornerIndex = null;
        pivot = null;
        selectedPivotIndex = null;

        // Start rotation
        animateRotation(pivotPoint, targetSquare.angle - square.angle, () => {
            square = { ...targetSquare };
            moves++;
            moveCounter.textContent = moves;
            draw();
                if (checkWinCondition()) {
                setTimeout(() => {
                    alert('Congratulations! You reached the target!');
                }, 100);
            }
        });
    }
});

function animateRotation(pivotPoint, rotationAmount, onComplete) {
    let startAngle = square.angle;
    let endAngle = startAngle + rotationAmount;
    let startX = square.x;
    let startY = square.y;
    let dx = startX - pivotPoint.x;
    let dy = startY - pivotPoint.y;
    let duration = 500;
    let startTime = null;

    function animationStep(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = (timestamp - startTime) / duration;
        if (progress > 1) progress = 1;
        let currentAngle = startAngle + (endAngle - startAngle) * progress;
        let cosA = Math.cos(currentAngle - startAngle);
        let sinA = Math.sin(currentAngle - startAngle);
        square.x = pivotPoint.x + dx * cosA - dy * sinA;
        square.y = pivotPoint.y + dx * sinA + dy * cosA;
        square.angle = currentAngle;
        draw();
        if (progress < 1) {
            requestAnimationFrame(animationStep);
        } else if (onComplete) {
            onComplete();
        }
    }
    requestAnimationFrame(animationStep);
}


draw();
