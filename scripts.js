// Responsive Navbar Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
    hamburger.classList.toggle('toggle'); // Toggle the 'toggle' class for animation
});

// Matrix Rain Effect
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

setCanvasSize();

// Characters used in Matrix rain (Japanese characters and symbols)
const matrixChars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポ';
const fontSize = 16;
const columns = Math.floor(canvas.width / fontSize);
const drops = [];

// Initialize drops
for (let x = 0; x < columns; x++) {
    drops[x] = Math.random() * canvas.height;
}

// Draw function
function draw() {
    // Fade the canvas to create trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set the color and font
    ctx.fillStyle = '#0F0'; // Green text
    ctx.font = `${fontSize}px monospace`;

    // Loop over drops
    for (let i = 0; i < drops.length; i++) {
        const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top with a random chance
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        // Increment y coordinate
        drops[i]++;
    }
}

// Interval to refresh canvas
const matrixInterval = setInterval(draw, 60);

// Resize canvas on window resize with debounce
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        setCanvasSize();
        // Reinitialize drops on resize
        for (let x = 0; x < columns; x++) {
            drops[x] = Math.random() * canvas.height;
        }
    }, 200);
});
