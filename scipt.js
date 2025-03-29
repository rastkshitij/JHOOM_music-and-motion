const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Ensure canvas matches video dimensions
video.addEventListener("loadedmetadata", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
});

// Initialize MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 2,  // Detect up to 2 hands
    modelComplexity: 1,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.8
});

// Function to Start Camera (Mirrored)
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" }  // Front camera (Mirrored)
        });

        video.srcObject = stream;
        await video.play();

        // Initialize MediaPipe Camera Processing
        const camera = new Camera(video, {
            onFrame: async () => {
                requestAnimationFrame(async () => { // Optimized frame handling
                    if (video.readyState === 4) {
                        await hands.send({ image: video });
                    }
                });
            },
            width: 640,
            height: 480
        });

        camera.start();
    } catch (error) {
        console.error("Error starting camera:", error);
    }
}

// Store last palm positions for smooth transitions
let lastPalmPositions = [];

// Function to track hands and generate circles
hands.onResults(results => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Flip the camera horizontally
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        results.multiHandLandmarks.forEach((landmarks, index) => {
            let palmX = landmarks[9].x * canvas.width;
            let palmY = landmarks[9].y * canvas.height;

            // Flip X coordinates to match mirrored view
            palmX = canvas.width - palmX;

            // Smooth movement using exponential averaging
            if (lastPalmPositions[index]) {
                palmX = lastPalmPositions[index].x * 0.85 + palmX * 0.15;
                palmY = lastPalmPositions[index].y * 0.85 + palmY * 0.15;
            }

            lastPalmPositions[index] = { x: palmX, y: palmY };

            // Draw neon circles smoothly following the hand
            drawNeonCircles(palmX, palmY);
        });
    }
});

// Function to Draw Neon Circles
function drawNeonCircles(x, y) {
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(x, y, 20 + i * 10, 0, 2 * Math.PI);

        // Generate Smooth Gradient Colors
        const color = `hsl(${(x + y) % 360}, 100%, ${80 - i * 15}%)`;

        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
    }
}

// Start Camera When Page Loads
window.onload = startCamera;
