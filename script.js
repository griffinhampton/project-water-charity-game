
const canvas = document.getElementById("gameWindow");
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;

let mx = canvas.width / 2;
let my = canvas.height / 2;

let wx = 0;
let wy = 0;
let dropletSpeed = 0;
const gravity = 0.03;
let isEvilDroplet = false; // Track if current droplet is evil 

let gameStarted = false;
let gameOver = false;
let score = 0;
let litresSaved = 0;
let gameTime = 0;
let missedDroplets = 0; 
const maxMisses = 10; 

const mouseImg = new Image();
const waterImg = new Image();
waterImg.src = 'img/water drop.png';
mouseImg.src = 'img/water-can-transparent.png';
let imagesLoaded = 0;

mouseImg.onload = function() {
    imagesLoaded = imagesLoaded + 1;
    console.log("Water can image loaded!");
}

waterImg.onload = function() {
    imagesLoaded = imagesLoaded + 1;
    console.log("Water droplet image loaded!");
}

const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const livesDisplay = document.getElementById('lives');
const startBtn = document.getElementById('start-btn');

document.onmousemove = function(e) {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
}

startBtn.onclick = function() {
    if (!gameStarted || gameOver) {
        startGame();
    } else {
        restartGame();
    }
}

function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    litresSaved = 0;
    gameTime = 0;
    missedDroplets = 0;

    spawnDroplet();
    
    startBtn.textContent = 'Restart Game';
    

    scoreDisplay.textContent = score;
    timeDisplay.textContent = litresSaved.toFixed(2);
    livesDisplay.textContent = maxMisses - missedDroplets;
    
    console.log("Game started!");
}


function restartGame() {
    gameOver = false;
    score = 0;
    litresSaved = 0;
    gameTime = 0;
    missedDroplets = 0;
    
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
    
    // 20% chance to spawn an evil droplet (1 in 5)
    isEvilDroplet = Math.random() < 0.2;
    
    if (isEvilDroplet) {
        console.log("Evil droplet spawned!");
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
        
        // Check if it's an evil droplet
        if (isEvilDroplet) {
            // Evil droplet caught - reduce score!
            score = score - 25;
            litresSaved = litresSaved - 0.15;
            
            // Don't let score or litres go negative
            if (score < 0) score = 0;
            if (litresSaved < 0) litresSaved = 0;
            
            console.log("Caught an EVIL droplet! Score reduced: " + score);
        } else {
            // Good droplet caught - increase score
            score = score + 15;
            litresSaved = litresSaved + .1;
            
            console.log("Caught a droplet! Score: " + score);
        }
        
        scoreDisplay.textContent = score;
        timeDisplay.textContent = litresSaved.toFixed(2);
        
        spawnDroplet();
    }
}

function handleWindowResize() {
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2;
}

window.addEventListener('resize', handleWindowResize);

function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && !gameOver) {
        dropletSpeed = dropletSpeed + gravity;
        
        wy = wy + dropletSpeed;
        
        if (wy > canvas.height) {
            missedDroplets = missedDroplets + 1;
            
            livesDisplay.textContent = maxMisses - missedDroplets;
            
            console.log("Missed a droplet! Misses: " + missedDroplets);

            if (missedDroplets >= maxMisses) {
                gameOver = true;
                console.log("Game Over! Final Score: " + score);
            } else {
                spawnDroplet();
            }
        }
        
        checkCollision();
    }

    if (imagesLoaded >= 2 && !gameOver) {
        // Draw the water droplet (grayscale if evil)
        if (isEvilDroplet) {
            // Apply grayscale filter for evil droplets
            ctx.filter = 'grayscale(100%)';
            ctx.drawImage(waterImg, wx, wy);
            ctx.filter = 'none'; // Reset filter
        } else {
            // Draw normal colored droplet
            ctx.drawImage(waterImg, wx, wy);
        }
        
        // Draw the water can following the mouse
        ctx.drawImage(mouseImg, mx - 20, my - 20, 40, 40);
    }
    
    if (gameOver) {
        drawGameOverScreen();
    }
}

function drawGameOverScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFC907"; 
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "24px Arial";
    ctx.fillText("Final Score: " + score, canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText("Litres Saved: " + litresSaved.toFixed(2), canvas.width / 2, canvas.height / 2 + 30);

    ctx.fillStyle = "#2E9DF7";
    ctx.font = "20px Arial";
    ctx.fillText("Click 'Restart Game' to play again!", canvas.width / 2, canvas.height / 2 + 80);
}

animate();