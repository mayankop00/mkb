var gameArea = document.getElementById('gameArea');
var character = document.getElementById('character');
var fire = document.getElementById('fire');
var scoreDisplay = document.getElementById('score');
var livesDisplay = document.getElementById('lives');
var menuBtn = document.getElementById('menuBtn');
var menuOverlay = document.getElementById('menuOverlay');
var restartBtn = document.getElementById('restartBtn');
var soundToggle = document.getElementById('soundToggle');
var soundIcon = document.getElementById('soundIcon');
var soundStatus = document.getElementById('soundStatus');
var closeMenu = document.getElementById('closeMenu');
var audio = document.getElementById('audio');
var audioLoseLife = document.getElementById('audioLoseLife');
var audioGameOver = document.getElementById('audioGameOver');
var instructions = document.getElementById('instructions');
var gameOverScreen = document.getElementById('gameOver');
var finalScoreDisplay = document.getElementById('finalScore');
var playAgainBtn = document.getElementById('playAgainBtn');

var score = 0;
var lives = 3;
var soundEnabled = true;
var charX = 150;
var charY = 200;
var audioInitialized = false;
var gameActive = true;
var waterDrops = [];
var dropInterval;

var CHAR_SIZE = 60;
var ESCAPE_DISTANCE = 120;
var MOVE_SPEED = 8;
var DROP_SPEED = 3;
var DROP_INTERVAL = 2000;
var BASE_DROP_SPEED = 3;
var BASE_DROP_INTERVAL = 2000;

audio.volume = 0.3;
audioLoseLife.volume = 0.3;
audioGameOver.volume = 0.3;

function initAudio() {
    if (!audioInitialized) {
        audio.load();
        audioLoseLife.load();
        audioGameOver.load();
        audioInitialized = true;
    }
}

function playOneShotSound(soundElement) {
    initAudio(); 
    if (soundEnabled && soundElement) {
        
        audio.pause();
        
        try {
            soundElement.currentTime = 0;
            soundElement.play();
        } catch (err) {
            console.log('Audio error:', err);
        }
    }
}

function playSound() {
    initAudio();

    if (!audioLoseLife.paused || !audioGameOver.paused) {
        return;
    }

    if (soundEnabled && audio.paused && gameActive) {
        try {
            audio.currentTime = 0;
            audio.play();
        } catch (err) {
            console.log('Audio error');
        }
    }
}

// **** THIS IS THE FIRST UPDATED FUNCTION ****
function createWaterDrop() {
    if (!gameActive) return;

    // Helper function to spawn a single drop
    function spawnSingleDrop() {
        var drop = document.createElement('div');
        drop.className = 'water-drop';
        drop.textContent = '💧';
        drop.style.left = Math.random() * (gameArea.clientWidth - 40) + 'px';
        drop.style.top = '-40px';
        gameArea.appendChild(drop);
        
        var dropData = {
            element: drop,
            x: parseFloat(drop.style.left),
            y: -40
        };
        
        waterDrops.push(dropData);
    }

    spawnSingleDrop(); // Always spawn one drop

    // NEW: If score is 700 or more, spawn a second drop
    if (score >= 700) {
        spawnSingleDrop();
    }
}
// **** END OF FIRST UPDATED FUNCTION ****

function updateWaterDrops() {
    if (!gameActive) return;
    
    for (var i = waterDrops.length - 1; i >= 0; i--) {
        var drop = waterDrops[i];
        drop.y = drop.y + DROP_SPEED;
        drop.element.style.top = drop.y + 'px';
        
        var dropCenterX = drop.x + 20;
        var dropCenterY = drop.y + 20;
        var charCenterX = charX + CHAR_SIZE / 2;
        var charCenterY = charY + CHAR_SIZE / 2;
        
        var dx = dropCenterX - charCenterX;
        var dy = dropCenterY - charCenterY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 40) {
            lives = lives - 1;
            livesDisplay.textContent = lives;
            
            gameArea.removeChild(drop.element);
            waterDrops.splice(i, 1);
            
            if (lives <= 0) {
                gameActive = false;
                clearInterval(dropInterval);
                
                playOneShotSound(audioLoseLife);
                
                audioLoseLife.addEventListener('ended', endGame, { once: true });

            } else {
                playOneShotSound(audioLoseLife);
            }
            
            continue;
        }
        
        if (drop.y > gameArea.clientHeight) {
            gameArea.removeChild(drop.element);
            waterDrops.splice(i, 1);
        }
    }
}

// **** THIS IS THE SECOND UPDATED FUNCTION ****
function updateDifficulty() {
    if (score <= 50) {
        DROP_SPEED = BASE_DROP_SPEED; // 3
        DROP_INTERVAL = BASE_DROP_INTERVAL; // 2000
    } else if (score <= 109) {
        DROP_SPEED = BASE_DROP_SPEED + 1; // 4
        DROP_INTERVAL = 1600;
    } else if (score <= 199) {
        DROP_SPEED = BASE_DROP_SPEED + 2; // 5
        DROP_INTERVAL = 1200;
    } else if (score <= 299) { 
        DROP_SPEED = BASE_DROP_SPEED + 3.5; // 6.5
        DROP_INTERVAL = 800;
    } else if (score <= 399) { 
        DROP_SPEED = BASE_DROP_SPEED + 4.5; // 7.5
        DROP_INTERVAL = 700;
    } else if (score <= 499) { 
        DROP_SPEED = BASE_DROP_SPEED + 5.5; // 8.5
        DROP_INTERVAL = 600;
    } else if (score <= 699) { // 500-699
        DROP_SPEED = BASE_DROP_SPEED + 7; // 10
        DROP_INTERVAL = 450;
    } else if (score <= 799) { // 700-799 (Double drops start)
        DROP_SPEED = BASE_DROP_SPEED + 7.5; // 10.5
        DROP_INTERVAL = 420;
    } else if (score <= 899) { // 800-899
        DROP_SPEED = BASE_DROP_SPEED + 8; // 11
        DROP_INTERVAL = 400;
    } else if (score <= 999) { // 900-999
        DROP_SPEED = BASE_DROP_SPEED + 8.5; // 11.5
        DROP_INTERVAL = 380;
    } else { // 1000+
        DROP_SPEED = BASE_DROP_SPEED + 9; // 12
        DROP_INTERVAL = 350;
    }
    
    if (gameActive) {
        clearInterval(dropInterval);
        dropInterval = setInterval(createWaterDrop, DROP_INTERVAL);
    }
}
// **** END OF SECOND UPDATED FUNCTION ****

function endGame() {
    playOneShotSound(audioGameOver);

    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';
    
    for (var i = 0; i < waterDrops.length; i++) {
        gameArea.removeChild(waterDrops[i].element);
    }
    waterDrops = [];
}

function startGame() {
    audioLoseLife.removeEventListener('ended', endGame);
    
    gameActive = true;
    score = 0;
    lives = 3;
    
    charX = (gameArea.clientWidth / 2) - (CHAR_SIZE / 2);
    charY = (gameArea.clientHeight / 2) - (CHAR_SIZE / 2);
    
    DROP_SPEED = BASE_DROP_SPEED;
    DROP_INTERVAL = BASE_DROP_INTERVAL;
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    character.style.left = charX + 'px';
    character.style.top = charY + 'px';
    gameOverScreen.style.display = 'none';
    instructions.style.display = 'block';
    
    for (var i = 0; i < waterDrops.length; i++) {
        if (waterDrops[i] && waterDrops[i].element && waterDrops[i].element.parentNode) {
            gameArea.removeChild(waterDrops[i].element);
        }
    }
    waterDrops = [];
    
    clearInterval(dropInterval);
    dropInterval = setInterval(createWaterDrop, DROP_INTERVAL);
}

function getPosition(e) {
    var rect = gameArea.getBoundingClientRect();
    var clientX, clientY;

    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function moveCharacter(fireX, fireY) {
    if (!gameActive) return;
    
    instructions.style.display = 'none';
    
    var charCenterX = charX + CHAR_SIZE / 2;
    var charCenterY = charY + CHAR_SIZE / 2;

    var dx = fireX - charCenterX;
    var dy = fireY - charCenterY;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ESCAPE_DISTANCE) {
        var angle = Math.atan2(dy, dx); 
        charX = charX - Math.cos(angle) * MOVE_SPEED;
        charY = charY - Math.sin(angle) * MOVE_SPEED;

        var maxX = gameArea.clientWidth - CHAR_SIZE;
        var maxY = gameArea.clientHeight - CHAR_SIZE;
        charX = Math.max(0, Math.min(maxX, charX));
        charY = Math.max(0, Math.min(maxY, charY));

        character.style.left = charX + 'px';
        character.style.top = charY + 'px';

        score = score + 1;
        scoreDisplay.textContent = score;
        updateDifficulty(); 
        playSound(); 
    }
}

function handleMove(e) {
    if (!gameActive || menuOverlay.classList.contains('active')) return;
    
    e.preventDefault();
    initAudio();
    var pos = getPosition(e);
    
    fire.style.display = 'block';
    fire.style.left = (pos.x - 20) + 'px';
    fire.style.top = (pos.y - 40) + 'px';

    moveCharacter(pos.x, pos.y);
}

function handleEnd() {
    fire.style.display = 'none';
}

gameArea.addEventListener('touchmove', handleMove);
gameArea.addEventListener('touchend', handleEnd);
gameArea.addEventListener('mousemove', handleMove);
gameArea.addEventListener('mouseleave', handleEnd);

menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    menuOverlay.classList.add('active');
});

closeMenu.addEventListener('click', function() {
    menuOverlay.classList.remove('active');
});

restartBtn.addEventListener('click', function() {
    menuOverlay.classList.remove('active');
    startGame();
});

soundToggle.addEventListener('click', function() {
    soundEnabled = !soundEnabled;
    initAudio();
    if (soundEnabled) {
        soundIcon.textContent = '🔊';
        soundStatus.textContent = 'ON';
    } else {
        soundIcon.textContent = '🔇';
        soundStatus.textContent = 'OFF';
        audio.pause();
        audioLoseLife.pause();
        audioGameOver.pause();
    }
});

playAgainBtn.addEventListener('click', function() {
    startGame();
});

setInterval(updateWaterDrops, 30);

startGame();