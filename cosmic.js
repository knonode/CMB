const canvas = document.getElementById('cmbCanvas');

const backgroundCanvas = document.getElementById('cmbCanvas');
const ctx = backgroundCanvas.getContext('2d');

// Create a new canvas for the needle
const needleCanvas = document.createElement('canvas');
needleCanvas.width = backgroundCanvas.width;
needleCanvas.height = backgroundCanvas.height;
needleCanvas.style.position = 'absolute';
needleCanvas.style.left = backgroundCanvas.offsetLeft + 'px';
needleCanvas.style.top = backgroundCanvas.offsetTop + 'px';
backgroundCanvas.parentNode.insertBefore(needleCanvas, backgroundCanvas.nextSibling);

const needleCtx = needleCanvas.getContext('2d');

// Add this line to set a background color for the canvas
canvas.style.backgroundColor = '#0b0d0f'; // You can change this to any color

const image = new Image();
image.src = 'Planck_CMB.png'; // Use your new transparent image

image.onload = function() {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    startAnimation();
};

function startAnimation() {
    const centerX = needleCanvas.width / 2;
    const centerY = needleCanvas.height / 2;
    const maxRadius = Math.min(centerX, centerY);

    // Adjust this value to skip empty pixels at the edge
    const edgeBuffer = 5; // Adjust this number as needed

    let angle = Math.PI / 2;
    let radius = maxRadius - edgeBuffer; // Start the radius inside the edge
    let x, y;

    const angleStep = 0.01;
    const radiusStep = 1;

    function drawNeedle() {
        // Clear only the needle canvas
        needleCtx.clearRect(0, 0, needleCanvas.width, needleCanvas.height);

        x = centerX + radius * Math.cos(angle);
        y = centerY - radius * Math.sin(angle);

        needleCtx.beginPath();
        needleCtx.arc(x, y, 7.5, 0, 2 * Math.PI);
        needleCtx.fillStyle = 'yellow';
        needleCtx.fill();
        needleCtx.strokeStyle = 'red';
        needleCtx.lineWidth = 2;
        needleCtx.stroke();

        angle -= angleStep;
        if (angle <= -3 * Math.PI / 2) {
            angle = Math.PI / 2;
            radius -= radiusStep;
        }

        // Reset radius when it reaches the center
        if (radius <= 0) {
            radius = maxRadius - edgeBuffer;
            angle = Math.PI / 2;
        }

        requestAnimationFrame(drawNeedle);
    }

    drawNeedle();
}

image.onerror = function() {
    console.error('Error loading image');
    ctx.font = '20px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('Error loading image', 10, 50);
};