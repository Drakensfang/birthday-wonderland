// Constants
const OBSTACLE_SIZE = 150;
const CHASE_DURATION = 8000;

// Shooting Star Effect
function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';

    // Random starting position at top or left edge
    const startTop = Math.random() * 30; // Top 30% of screen
    const startLeft = Math.random() * 60; // Left 60% of screen

    star.style.top = startTop + '%';
    star.style.left = startLeft + '%';

    // Pick a random travel vector and angle using CSS variables for smooth GPU animations
    const vw = Math.max(window.innerWidth, 800);
    const vh = Math.max(window.innerHeight, 600);
    const dx = Math.round((80 + Math.random() * 60)) + 'vw';
    const dy = Math.round((80 + Math.random() * 60)) + 'vh';
    const angle = Math.round(-60 + Math.random() * 40) + 'deg';
    const duration = (1.6 + Math.random() * 1.4).toFixed(2) + 's';

    star.style.setProperty('--dx', dx);
    star.style.setProperty('--dy', dy);
    star.style.setProperty('--angle', angle);
    star.style.animation = `shootingStar ${duration} cubic-bezier(.2,.9,.2,1) forwards`;
    star.style.willChange = 'transform, opacity';

    document.body.appendChild(star);

    // Remove after animation completes
    setTimeout(() => star.remove(), parseFloat(duration) * 1000 + 200);
}

// Floating Hearts Effect
function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.textContent = ['💖', '💝', '💗', '💓', '💕'][Math.floor(Math.random() * 5)];
    heart.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        bottom: -50px;
        font-size: ${20 + Math.random() * 30}px;
        opacity: ${0.4 + Math.random() * 0.4};
        pointer-events: none;
        z-index: 1;
        animation: floatUp ${8 + Math.random() * 4}s linear forwards;
    `;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 12000);
}

// Twinkling Stars Background
function createTwinkleStar() {
    const star = document.createElement('div');
    star.textContent = '✨';
    star.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        font-size: ${10 + Math.random() * 20}px;
        opacity: 0;
        pointer-events: none;
        z-index: 1;
        animation: twinkleFade ${2 + Math.random() * 2}s ease-in-out;
    `;
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 4000);
}

// Start background effects
setInterval(createFloatingHeart, 5000);
setTimeout(createFloatingHeart, 1000);

setInterval(createTwinkleStar, 3000);
setTimeout(createTwinkleStar, 500);

// Cached DOM elements
let doorContainer, door, keyhole, sparklesContainer, hint, obstacles;
let titleElement;
let key = null;
let keyRevealed = false;
let isDragging = false;
let keyPosition = { x: 0, y: 0 };
let audioContext = null;

// Initialize DOM cache
function initDOM() {
    doorContainer = document.getElementById('doorContainer');
    door = document.getElementById('door');
    keyhole = document.getElementById('keyhole');
    sparklesContainer = document.getElementById('sparkles');
    hint = document.getElementById('hint');
    obstacles = document.querySelectorAll('.obstacle');
    titleElement = document.getElementById('animatedTitle');
    
    console.log('DOM initialized. Found', obstacles.length, 'obstacles');
    console.log('Door container:', doorContainer);
    console.log('Hint:', hint);
}

// Get or create AudioContext (reuse for performance)
function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// Animate title letters
function animateTitle() {
    if (!titleElement) return;
    
    const titleText = 'Welcome to Ham Ham Land...';
    const fragment = document.createDocumentFragment();
    
    titleText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = char;
        span.style.animationDelay = `${index * 0.05}s`;
        fragment.appendChild(span);
    });
    
    titleElement.appendChild(fragment);
}

// Randomly assign the key to one obstacle on page load
function randomizeKeyLocation() {
    if (!obstacles || obstacles.length === 0) {
        console.error('No obstacles found');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * obstacles.length);
    const keyObstacle = obstacles[randomIndex];
    
    const keyElement = document.createElement('div');
    keyElement.className = 'key';
    keyElement.id = 'key';
    keyElement.draggable = true;
    keyElement.textContent = '🔑';
    
    const obstacleBack = keyObstacle.querySelector('.obstacle-back');
    if (!obstacleBack) {
        console.error('Obstacle back not found');
        return;
    }
    obstacleBack.appendChild(keyElement);
    
    keyObstacle.classList.add('key-location');
}

// Add mouse avoidance behavior to key obstacle
let keyObstacle = null;
let chaseStartTime = null;
let soundPlayed = false;
let scene = null;
let sceneRect = null;

function setupMouseAvoidance() {
    keyObstacle = document.querySelector('.key-location');
    if (!keyObstacle) return;
    
    scene = document.querySelector('.scene');
    sceneRect = scene.getBoundingClientRect();
    
    let isAvoiding = false;
    const MIN_DISTANCE = 100;
    const MAX_ATTEMPTS = 10;
    const COOLDOWN = 300;
    
    const handleMouseEnter = function() {
        if (this.classList.contains('flipped') || isAvoiding) return;
        
        if (!chaseStartTime) {
            chaseStartTime = Date.now();
            setTimeout(() => {
                keyObstacle.removeEventListener('mouseenter', handleMouseEnter);
            }, CHASE_DURATION);
        }
        
        if (Date.now() - chaseStartTime > CHASE_DURATION) return;
        
        isAvoiding = true;
        
        const style = this.style;
        const currentLeft = parseInt(style.left) || 0;
        const currentTop = parseInt(style.top) || 0;
        
        let newLeft, newTop, attempts = 0;
        const maxLeft = sceneRect.width - OBSTACLE_SIZE;
        const maxTop = sceneRect.height - OBSTACLE_SIZE;
        
        do {
            newLeft = Math.random() * maxLeft;
            newTop = Math.random() * maxTop;
            attempts++;
        } while (
            Math.abs(newLeft - currentLeft) < MIN_DISTANCE && 
            Math.abs(newTop - currentTop) < MIN_DISTANCE && 
            attempts < MAX_ATTEMPTS
        );
        
        style.left = newLeft + 'px';
        style.top = newTop + 'px';
        
        setTimeout(() => { isAvoiding = false; }, COOLDOWN);
    };
    
    keyObstacle.addEventListener('mouseenter', handleMouseEnter);
}

function setupKeyListeners() {
    if (!key) {
        console.error('Key not found in setupKeyListeners');
        return;
    }
    if (!keyhole) {
        console.error('Keyhole not found in setupKeyListeners');
        return;
    }
    if (!hint) {
        console.error('Hint not found in setupKeyListeners');
        return;
    }
    
    // Key drag start
    key.addEventListener('dragstart', (e) => {
        isDragging = true;
        key.style.cursor = 'grabbing';
        e.dataTransfer.effectAllowed = 'move';
        
        const rect = key.getBoundingClientRect();
        keyPosition.x = e.clientX - rect.left;
        keyPosition.y = e.clientY - rect.top;
    });

    // Key drag end
    key.addEventListener('dragend', (e) => {
        isDragging = false;
        key.style.cursor = 'grab';
    });

    // Alternative: Click on key then click on door
    let keySelected = false;

    key.addEventListener('click', (e) => {
        if (!keySelected) {
            keySelected = true;
            key.style.transform = 'scale(1.2)';
            hint.textContent = '✨ Now click on the keyhole! ✨';
        }
    });

    keyhole.addEventListener('click', () => {
        if (keySelected) {
            unlockDoor();
        }
    });

    // Mobile touch support
    let touchStartX, touchStartY;

    key.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        key.style.transform = 'scale(1.2)';
    });

    key.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        
        key.style.position = 'fixed';
        key.style.left = touch.clientX - 40 + 'px';
        key.style.top = touch.clientY - 40 + 'px';
    });

    key.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const keyholeRect = keyhole.getBoundingClientRect();
        
        const distance = Math.sqrt(
            Math.pow(keyholeRect.left + keyholeRect.width/2 - touch.clientX, 2) + 
            Math.pow(keyholeRect.top + keyholeRect.height/2 - touch.clientY, 2)
        );
        
        if (distance < 100) {
            unlockDoor();
        } else {
            // Reset key position
            key.style.position = 'relative';
            key.style.left = 'auto';
            key.style.top = 'auto';
            key.style.transform = 'scale(1)';
        }
    });
}

function playPopSound() {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
}

function playChimeSound() {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99];
    
    notes.forEach((note, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = note;
        oscillator.type = 'sine';
        
        const startTime = ctx.currentTime + (i * 0.15);
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
    });
}

function unlockDoor() {
    if (!keyRevealed || !key) return;
    
    playUnlockSound();
    
    keyhole.textContent = '🔓';
    keyhole.classList.add('unlocked');
    
    key.style.opacity = '0';
    key.style.transform = 'scale(0)';
    
    createSparklesBurst();
    
    setTimeout(() => {
        door.classList.add('opening');
        
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = '🎉 Welcome to the Challenge! 🎉';
        document.body.appendChild(successMsg);
        
        // Create transition animation
        setTimeout(() => {
            createTransitionTunnel();
        }, 1000);
    }, 500);
}

function createTransitionTunnel() {
    const tunnel = document.createElement('div');
    tunnel.className = 'coraline-tunnel';
    tunnel.innerHTML = `
        <div class="tunnel-inner">
            <img src="https://i.pinimg.com/originals/b5/bf/a8/b5bfa83df9f0afaec032bca0d4741003.gif" alt="tunnel" class="tunnel-gif">
        </div>
    `;
    document.body.appendChild(tunnel);
    
    // Trigger animation
    setTimeout(() => {
        tunnel.classList.add('active');
    }, 50);
    
    // Navigate to snake game
    setTimeout(() => {
        const currentPath = window.location.pathname;
        const directory = currentPath.substring(0, currentPath.lastIndexOf('/'));
        const newPath = directory ? directory + '/snake-game.html' : './snake-game.html';
        window.location.href = newPath;
    }, 3000);
}



function createSparklesBurst() {
    const keyholeRect = keyhole.getBoundingClientRect();
    const centerX = keyholeRect.left + keyholeRect.width / 2;
    const centerY = keyholeRect.top + keyholeRect.height / 2;
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = centerX + 'px';
            sparkle.style.top = centerY + 'px';
            
            const angle = (Math.PI * 2 * i) / 30;
            const distance = 100 + Math.random() * 100;
            
            sparkle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            sparkle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            
            sparklesContainer.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }, i * 20);
    }
}

function playUnlockSound() {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((note, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = note;
        oscillator.type = 'sine';
        
        const startTime = ctx.currentTime + (i * 0.15);
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
    });
}

// Add random floating particles
function createFloatingParticles() {
    setInterval(() => {
        if (Math.random() > 0.7) {
            const particle = document.createElement('div');
            Object.assign(particle.style, {
                position: 'fixed',
                left: Math.random() * 100 + '%',
                top: '100%',
                width: '3px',
                height: '3px',
                background: '#ffd700',
                borderRadius: '50%',
                opacity: '0.6',
                animation: `floatUp ${3 + Math.random() * 2}s linear forwards`,
                pointerEvents: 'none'
            });
            
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 5000);
        }
    }, 300);
}

// Add random floating particles
function createFloatingParticles() {
    setInterval(() => {
        if (Math.random() > 0.7) {
            const particle = document.createElement('div');
            Object.assign(particle.style, {
                position: 'fixed',
                left: Math.random() * 100 + '%',
                top: '100%',
                width: '3px',
                height: '3px',
                background: '#ffd700',
                borderRadius: '50%',
                opacity: '0.6',
                animation: `floatUp ${3 + Math.random() * 2}s linear forwards`,
                pointerEvents: 'none'
            });
            
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 5000);
        }
    }, 300);
}

// Inject CSS animations once
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            to {
                transform: translateY(-100vh);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize everything when DOM is ready
function init() {
    console.log('Init function called');
    initDOM();
    injectStyles();
    animateTitle();
    randomizeKeyLocation();
    setupObstacleListeners();
    setupDoorListeners();
    setupBackgroundMusic();
    createFloatingParticles();
    setTimeout(setupMouseAvoidance, 100);
    console.log('Init complete');
}

// Setup background music controls
function setupBackgroundMusic() {
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    
    if (!bgMusic || !musicToggle) return;
    
    // Set volume
    bgMusic.volume = 0.7;
    
    // Try to play music immediately
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('Music playing automatically');
            musicToggle.textContent = '🎵';
        }).catch(() => {
            console.log('Autoplay blocked, will play on first interaction');
            // Play on any user interaction
            const playOnInteraction = () => {
                bgMusic.play().then(() => {
                    musicToggle.textContent = '🎵';
                    console.log('Music started after user interaction');
                });
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
            };
            document.addEventListener('click', playOnInteraction, { once: true });
            document.addEventListener('touchstart', playOnInteraction, { once: true });
        });
    }
    
    // Toggle music on button click
    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.textContent = '🎵';
            musicToggle.classList.remove('paused');
        } else {
            bgMusic.pause();
            musicToggle.textContent = '🔇';
            musicToggle.classList.add('paused');
        }
    });
}

// Add obstacle listeners
function setupObstacleListeners() {
    if (!obstacles || obstacles.length === 0) {
        console.error('No obstacles found for listeners');
        return;
    }
    
    console.log('Setting up listeners for', obstacles.length, 'obstacles');
    
    obstacles.forEach((obstacle, index) => {
        obstacle.addEventListener('click', function(e) {
            console.log('Obstacle clicked:', index, 'Already flipped:', this.classList.contains('flipped'));
            
            if (this.classList.contains('flipped')) return;
            
            this.classList.add('flipped');
            playPopSound();
            
            if (this.classList.contains('key-location')) {
                console.log('This is the key obstacle!');
                setTimeout(() => {
                    key = document.getElementById('key');
                    if (key) {
                        key.classList.add('revealed');
                        keyRevealed = true;
                        hint.textContent = '✨ You found the key! Now drag it to the keyhole to unlock the door! ✨';
                        hint.style.color = '#ffd700';
                        hint.style.animation = 'pulse 1s ease-in-out infinite';
                        setupKeyListeners();
                        playChimeSound();
                    } else {
                        console.error('Key element not found!');
                    }
                }, 300);
            }
        });
    });
}

// Add door listeners
function setupDoorListeners() {
    if (!doorContainer) {
        console.error('Door container not found');
        return;
    }
    
    doorContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        doorContainer.classList.add('drag-over');
    });

    doorContainer.addEventListener('dragleave', () => {
        doorContainer.classList.remove('drag-over');
    });

    doorContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        doorContainer.classList.remove('drag-over');
        
        if (!keyRevealed || !key) return;
        
        const keyholeRect = keyhole.getBoundingClientRect();
        const distance = Math.hypot(
            keyholeRect.left + keyholeRect.width/2 - e.clientX,
            keyholeRect.top + keyholeRect.height/2 - e.clientY
        );
        
        if (distance < 150) unlockDoor();
    });
}

// Start when ready
console.log('Script loaded, readyState:', document.readyState);
if (document.readyState === 'loading') {
    console.log('Waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', init);
} else {
    console.log('DOM already ready, calling init immediately');
    init();
}