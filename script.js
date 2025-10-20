const canvas = document.getElementById("gameWindow");
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;

let mx = canvas.width / 2;
let my = canvas.height / 2;

let wx = 0;
let wy = 0;
let dropletSpeed = 0;
let gravity = 0.01; // Will change based on difficulty
let isEvilDroplet = false; 

let gameStarted = false;
let gameOver = false;
let gameWon = false;
let countdown = 0; // Countdown number (3, 2, 1)
let showCountdown = false; // Whether to show countdown
let score = 0;
let litresSaved = 0;
let gameTime = 0;
let missedDroplets = 0; 
let maxMisses = 10; // Will change based on difficulty
let winScore = 300; // Will change based on difficulty
let evilChance = 0.2; // Will change based on difficulty
let currentDifficulty = 'normal';

// Popup text variables
let showPopup = false;
let popupText = '';
let popupX = 0;
let popupY = 0;
let popupOpacity = 1;
let popupColor = '#4FCB53'; // Green for positive, red for negative
let popupTimer = 0; // Timer to control how long popup stays visible
let isMilestonePopup = false; // Track if current popup is a milestone

// Milestone variables
let lastMilestone = 0; // Track the last milestone achieved

// Array of milestone messages with their score thresholds
const milestones = [
    { score: 50, message: "Great start!" },
    { score: 100, message: "Keep going!" },
    { score: 150, message: "Half-way there!" },
    { score: 200, message: "Amazing!" },
    { score: 250, message: "Almost there!" },
    { score: 300, message: "Fantastic!" },
    { score: 400, message: "Incredible!" },
    { score: 450, message: "Nearly done!" }
];

// Difficulty settings
const difficulties = {
    easy: {
        gravity: 0.01,
        maxMisses: 15,
        winScore: 150,
        evilChance: 0.1,
        name: 'Easy'
    },
    normal: {
        gravity: 0.015,
        maxMisses: 10,
        winScore: 300,
        evilChance: 0.2,
        name: 'Normal'
    },
    hard: {
        gravity: 0.025,
        maxMisses: 7,
        winScore: 500,
        evilChance: 0.3,
        name: 'Hard'
    }
};

const mouseImg = new Image();
const waterImg = new Image();
waterImg.src = 'img/water drop.png';
mouseImg.src = 'img/water-can-transparent.png';
let imagesLoaded = 0;

// Create audio element for coin sound effect
const coinSound = new Audio('img/Picked Coin Echo.wav');

// Add error handling for audio loading
coinSound.addEventListener('error', function() {
    console.log("Error loading coin sound! Check if 'picked coin echo.wav' exists in the correct folder.");
});

coinSound.addEventListener('canplaythrough', function() {
    console.log("Coin sound loaded successfully!");
});

// Set volume (0.0 to 1.0)
coinSound.volume = 0.5;

mouseImg.onload = function() {
    imagesLoaded = imagesLoaded + 1;
    console.log("Water can image loaded!");
}

waterImg.onload = function() {
    imagesLoaded = imagesLoaded + 1;
    console.log("Water droplet image loaded!");
}

// Get DOM elements
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const livesDisplay = document.getElementById('lives');
const goalDisplay = document.getElementById('goal');
const startBtn = document.getElementById('start-btn');
const difficultyPanel = document.getElementById('difficulty-panel');
const scorePanel = document.getElementById('score-panel');

// Get overlay elements
const startMessage = document.getElementById('start-message');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const gameoverOverlay = document.getElementById('gameover-overlay');
const winOverlay = document.getElementById('win-overlay');

// Difficulty button click handlers
const easyBtn = document.getElementById('easy-btn');
const normalBtn = document.getElementById('normal-btn');
const hardBtn = document.getElementById('hard-btn');

easyBtn.onclick = function(e) {
    e.preventDefault(); // Prevent any default behavior
    selectDifficulty('easy');
}

normalBtn.onclick = function(e) {
    e.preventDefault(); // Prevent any default behavior
    selectDifficulty('normal');
}

hardBtn.onclick = function(e) {
    e.preventDefault(); // Prevent any default behavior
    selectDifficulty('hard');
}

// Select difficulty and start the game
function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    const settings = difficulties[difficulty];
    
    // Apply difficulty settings
    gravity = settings.gravity;
    maxMisses = settings.maxMisses;
    winScore = settings.winScore;
    evilChance = settings.evilChance;
    
    // Hide difficulty panel and show score panel (DOM manipulation)
    difficultyPanel.style.display = 'none';
    scorePanel.style.display = 'flex';
    
    // Hide start message
    startMessage.style.display = 'none';
    
    // Update goal display
    goalDisplay.textContent = winScore;
    
    console.log(`Difficulty selected: ${settings.name}`);
    
    // Start countdown instead of starting game immediately
    startCountdown();
}

// Countdown from 3, 2, 1 before game starts
function startCountdown() {
    countdown = 3;
    showCountdown = true;
    
    // Show countdown overlay
    countdownOverlay.style.display = 'flex';
    countdownNumber.textContent = countdown;
    
    // Use setInterval to count down every second
    const countdownInterval = setInterval(function() {
        countdown = countdown - 1;
        
        // Update the countdown number in HTML
        if (countdown > 0) {
            countdownNumber.textContent = countdown;
        }
        
        // When countdown reaches 0, start the game
        if (countdown <= 0) {
            clearInterval(countdownInterval); // Stop the countdown
            showCountdown = false;
            countdownOverlay.style.display = 'none'; // Hide countdown
            startGame();
        }
    }, 1000); // 1000 milliseconds = 1 second
}

document.onmousemove = function(e) {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
}

startBtn.onclick = function() {
    // Always stop the game and show difficulty panel
    // Show difficulty panel again (DOM manipulation)
    difficultyPanel.style.display = 'block';
    scorePanel.style.display = 'none';
    
    // Show start message again
    startMessage.style.display = 'flex';
    
    // Hide game over/win overlays
    gameoverOverlay.style.display = 'none';
    winOverlay.style.display = 'none';
    
    // Reset game state
    gameStarted = false;
    gameOver = false;
    gameWon = false;
    showPopup = false; // Hide any active popups
    
    console.log("Returning to difficulty selection...");
    
    return false; // Prevent any default behavior
}

function startGame() {
    gameStarted = true;
    gameOver = false;
    gameWon = false;
    score = 0;
    litresSaved = 0;
    gameTime = 0;
    missedDroplets = 0;
    lastMilestone = 0; // Reset milestone tracking

    spawnDroplet();
    
    startBtn.textContent = 'Change Difficulty';

    scoreDisplay.textContent = score;
    timeDisplay.textContent = litresSaved.toFixed(2);
    livesDisplay.textContent = maxMisses - missedDroplets;
    
    console.log("Game started!");
}
function restartGame() {
    gameOver = false;
    gameWon = false;
    score = 0;
    litresSaved = 0;
    gameTime = 0;
    missedDroplets = 0;
    lastMilestone = 0; // Reset milestone tracking
    
    spawnDroplet();
    
    scoreDisplay.textContent = score;
    timeDisplay.textContent = litresSaved.toFixed(2);
    livesDisplay.textContent = maxMisses - missedDroplets;
    
    console.log("Game restarted!");
}

function spawnDroplet() {
    wx = Math.random() * (canvas.width - 40) + 20;
    wy = 0;
    dropletSpeed = 0;
    
    // Evil droplet chance based on difficulty
    isEvilDroplet = Math.random() < evilChance;
    
    if (isEvilDroplet) {
        console.log("Evil droplet spawned!");
    }
}

// Function to show popup text with score change
function showScorePopup(points, x, y) {
    showPopup = true;
    popupText = points > 0 ? `+${points}` : `${points}`;
    popupX = x;
    popupY = y;
    popupOpacity = 1;
    popupColor = points > 0 ? '#4FCB53' : '#F5402C'; // Green for positive, red for negative
    popupTimer = 0; // Reset timer
    isMilestonePopup = false; // Not a milestone
}

// Function to show milestone message popup
function showMilestonePopup(message) {
    showPopup = true;
    popupText = message;
    popupX = canvas.width / 2; // Center of canvas
    popupY = canvas.height / 2; // Middle of canvas
    popupOpacity = 1;
    popupColor = '#FFC907'; // Yellow for milestones
    popupTimer = 0; // Reset timer
    isMilestonePopup = true; // This is a milestone
    
    console.log(`Milestone reached: ${message}`);
}

// Function to check if player reached a new milestone
function checkMilestones() {
    // Calculate halfway point based on current win score
    const halfwayScore = Math.floor(winScore / 2);
    
    // Check for halfway milestone
    if (score >= halfwayScore && lastMilestone < halfwayScore && score < winScore) {
        lastMilestone = halfwayScore;
        showMilestonePopup("Half-way there!");
        return; // Exit early so we don't check other milestones
    }
    
    // Loop through all other milestones
    for (let i = 0; i < milestones.length; i = i + 1) {
        const milestone = milestones[i];
        
        // Skip the 150 milestone since we handle halfway dynamically
        if (milestone.score === 150) {
            continue; // Skip this one
        }
        
        // Check if player reached this milestone and hasn't seen it yet
        if (score >= milestone.score && lastMilestone < milestone.score) {
            lastMilestone = milestone.score;
            showMilestonePopup(milestone.message);
            break; // Only show one milestone at a time
        }
    }
}

function checkCollision() {

    const canX = mx - 20;
    const canY = my - 20;
    const canWidth = 40;
    const canHeight = 40;
    

    const dropWidth = 30;
    const dropHeight = 30;
    

    if (wx < canX + canWidth &&
        wx + dropWidth > canX &&
        wy < canY + canHeight &&
        wy + dropHeight > canY) {
        
        if (isEvilDroplet) {
            score = score - 25;
            litresSaved = litresSaved - 0.15;
            
            if (score < 0) score = 0;
            if (litresSaved < 0) litresSaved = 0;
            
            // Show popup for evil droplet
            showScorePopup(-25, wx + 15, wy);
            
            console.log("Caught an EVIL droplet! Score reduced: " + score);
        } else {
            score = score + 15;
            litresSaved = litresSaved + .1;
            
            // Play coin sound when collecting a good droplet
            coinSound.currentTime = 0; // Reset sound to start
            coinSound.play().catch(function(error) {
                console.log("Error playing sound:", error);
            });
            
            // Show popup for good droplet
            showScorePopup(15, wx + 15, wy);
            
            console.log("Caught a droplet! Score: " + score);
        }
        
        scoreDisplay.textContent = score;
        timeDisplay.textContent = litresSaved.toFixed(2);
        
        // Check for milestones after updating score
        checkMilestones();
        
        // Check if player won!
        if (score >= winScore) {
            gameWon = true;
            gameStarted = false;
            
            // Show win overlay with stats
            document.getElementById('win-score').textContent = score;
            document.getElementById('win-litres').textContent = litresSaved.toFixed(2);
            document.getElementById('win-difficulty').textContent = difficulties[currentDifficulty].name;
            winOverlay.style.display = 'flex';
            
            console.log("YOU WON! Score: " + score);
        } else {
            spawnDroplet();
        }
    }
}

function handleWindowResize() {
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2;
}

window.addEventListener('resize', handleWindowResize);

function animate() {
    requestAnimationFrame(animate);

    // Clear canvas with transparency to show gradient background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && !gameOver && !gameWon) {
        dropletSpeed = dropletSpeed + gravity;
        
        wy = wy + dropletSpeed;
        
        if (wy > canvas.height) {
            // Only count missed droplets if it's NOT an evil droplet
            if (!isEvilDroplet) {
                missedDroplets = missedDroplets + 1;
                livesDisplay.textContent = maxMisses - missedDroplets;
                console.log("Missed a droplet! Misses: " + missedDroplets);
            } else {
                console.log("Evil droplet missed - no life lost!");
            }

            if (missedDroplets >= maxMisses) {
                gameOver = true;
                
                // Show game over overlay with stats
                document.getElementById('final-score').textContent = score;
                document.getElementById('final-litres').textContent = litresSaved.toFixed(2);
                gameoverOverlay.style.display = 'flex';
                
                console.log("Game Over! Final Score: " + score);
            } else {
                spawnDroplet();
            }
        }
        
        checkCollision();
    }

    if (imagesLoaded >= 2 && !gameOver && !gameWon) {
        if (isEvilDroplet) {
            ctx.filter = 'grayscale(100%)';
            ctx.drawImage(waterImg, wx, wy);
            ctx.filter = 'none'; 
        } else {
            ctx.drawImage(waterImg, wx, wy);
        }
        
        ctx.drawImage(mouseImg, mx - 20, my - 20, 40, 40);
    }
    
    // Draw popup text if active
    if (showPopup && popupOpacity > 0) {
        ctx.fillStyle = popupColor;
        ctx.globalAlpha = popupOpacity;
        ctx.font = 'bold 28px "Cormorant Garamond", serif'; // Larger font for milestones
        ctx.textAlign = 'center';
        ctx.fillText(popupText, popupX, popupY);
        ctx.globalAlpha = 1; // Reset alpha
        
        // Increment timer
        popupTimer = popupTimer + 1;
        
        // For milestone popups, wait 5 seconds (300 frames at 60fps) before fading
        // For score popups, fade immediately
        if (isMilestonePopup) {
            // Keep milestone visible for 5 seconds (about 300 frames)
            if (popupTimer > 300) {
                popupOpacity = popupOpacity - 0.02;
            }
        } else {
            // Regular score popups move up and fade right away
            popupY = popupY - 2;
            popupOpacity = popupOpacity - 0.02;
        }
        
        // Hide popup when fully faded
        if (popupOpacity <= 0) {
            showPopup = false;
            popupTimer = 0;
        }
    }
}

animate();