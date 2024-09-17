let imageData;
const canvasWidth = 3000;  // Adjust these to match your image dimensions
const canvasHeight = 3000;

function loadImage() {
    const image = new Image();
    image.src = 'Planck_CMB.png'; // Make sure this matches your image file name

    image.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
        imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        startVirtualTraversal();
    };

    image.onerror = function() {
        console.error('Error loading image');
    };
}

function startVirtualTraversal() {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const maxRadius = Math.min(centerX, centerY);

    // Adjust this value to skip empty pixels at the edge
    const edgeBuffer = 5; // Adjust this number as needed

    let angle = Math.PI / 2;
    let radius = maxRadius - edgeBuffer;

    const angleStep = 0.01;
    const radiusStep = 1;

    function traverseStep() {
        const x = Math.round(centerX + radius * Math.cos(angle));
        const y = Math.round(centerY - radius * Math.sin(angle));

        // Get pixel data at the current position
        const pixelIndex = (y * imageData.width + x) * 4;
        const r = imageData.data[pixelIndex];
        const g = imageData.data[pixelIndex + 1];
        const b = imageData.data[pixelIndex + 2];

        // Process pixel data (sonification)
        processPixelData(x, y, r, g, b);

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

        // Schedule next step
        setTimeout(traverseStep, 16); // Approximately 60 fps
    }

    traverseStep();
}

// Initialize audio context
let audioContext;

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('Audio context initialized');
}

function processPixelData(x, y, r, g, b) {
    const frequency = pixelToTone(r, g, b);
    playTone(frequency);
    console.log(`Pixel at (${x}, ${y}): R=${r}, G=${g}, B=${b}, Frequency=${frequency.toFixed(2)} Hz`);
}

function pixelToTone(r, g, b) {
    const coldHot = (r - b + 255) / 2;  // Range 0-255, 0 being coldest, 255 hottest
    const baseFrequency = 220;  // A3 note
    const maxFrequency = 880;   // A5 note
    return baseFrequency + (coldHot / 255) * (maxFrequency - baseFrequency);
}

function playTone(frequency, duration = 0.1) {
    if (!audioContext) {
        console.error('Audio context not initialized. Call initAudio() first.');
        return;
    }

    // Check if frequency is a valid, finite number
    if (!Number.isFinite(frequency) || frequency <= 0) {
        console.warn(`Invalid frequency: ${frequency}. Skipping this tone.`);
        return;
    }

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);

    console.log(`Playing tone at ${frequency.toFixed(2)} Hz`);
}

// Start the process
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, initializing audio and loading image');
    initAudio();
    loadImage();
});

// Add this function to test audio
function testAudio() {
    console.log('Testing audio...');
    playTone(440, 0.5); // Play a 440 Hz tone for 0.5 seconds
}

// Expose test function globally
window.testAudio = testAudio;