// Throttle sparkle creation for better performance
let lastSparkleTime = 0;
const SPARKLE_THROTTLE = 100; // ms

document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (Math.random() > 0.97 && now - lastSparkleTime > SPARKLE_THROTTLE) {
        lastSparkleTime = now;
        createSparkle(e.clientX, e.clientY);
    }
}, { passive: true });

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-effect';
    sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #fff;
        pointer-events: none;
        z-index: 9999;
        animation: sparkleAnimation 1s ease-out forwards;
    `;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
}

// Add sparkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkleAnimation {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: scale(2) rotate(180deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Optimized confetti on page load
window.addEventListener('load', () => {
    requestAnimationFrame(() => setTimeout(createConfetti, 500));
});

const CONFETTI_COLORS = ['#ff6b9d', '#c06c84', '#6c5ce7', '#a29bfe', '#fd79a8'];

function createConfetti() {
    const confettiCount = 50;
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: -10px;
                width: 10px;
                height: 10px;
                background-color: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
                pointer-events: none;
                z-index: 9999;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: fall ${2 + Math.random() * 2}s linear forwards;
            `;
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// Add fall animation
const fallStyle = document.createElement('style');
fallStyle.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(fallStyle);

console.log('🎂 Happy Birthday! Welcome to Ham Ham Land! ✨');

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

// Create floating hearts every 5 seconds
setInterval(createFloatingHeart, 5000);
setTimeout(createFloatingHeart, 1000);

// Create twinkling stars every 3 seconds
setInterval(createTwinkleStar, 3000);
setTimeout(createTwinkleStar, 500);

// Optimized scroll reveal animation with enhanced pop effect
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -150px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, observerOptions);

    // Observe all scroll-reveal elements
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    console.log('Found', scrollElements.length, 'scroll-reveal elements');
    scrollElements.forEach(el => {
        observer.observe(el);
        console.log('Observing:', el.className);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
    initScrollReveal();
}

// Background Music Control
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let isMusicPlaying = false;

musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicToggle.textContent = '🎵';
        musicToggle.classList.remove('playing');
        musicToggle.classList.add('paused');
        isMusicPlaying = false;
    } else {
        bgMusic.play().catch(e => console.log('Audio play failed:', e));
        musicToggle.textContent = '🎶';
        musicToggle.classList.add('playing');
        musicToggle.classList.remove('paused');
        isMusicPlaying = true;
    }
});

// Auto-play attempt (will work after user interaction)
window.addEventListener('click', () => {
    if (!isMusicPlaying) {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            musicToggle.textContent = '🎶';
            musicToggle.classList.add('playing');
        }).catch(e => {});
    }
}, { once: true });

// Sound Effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playChime() {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((note, i) => {
        setTimeout(() => playSound(note, 0.3, 'sine'), i * 100);
    });
}

function playMagicSound() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            playSound(800 + Math.random() * 400, 0.2, 'sine');
        }, i * 80);
    }
}

function playPop() {
    playSound(800, 0.1, 'square');
    setTimeout(() => playSound(400, 0.1, 'square'), 50);
}

function playTwinkle() {
    const notes = [1046.50, 1174.66, 1318.51, 1567.98]; // C6, D6, E6, G6
    notes.forEach((note, i) => {
        setTimeout(() => playSound(note, 0.15, 'triangle'), i * 60);
    });
}

function playBoing() {
    playSound(200, 0.3, 'sawtooth');
}

function playDing() {
    playSound(1200, 0.4, 'sine');
}

function playWhoosh() {
    const startFreq = 1000;
    const endFreq = 200;
    for (let i = 0; i < 10; i++) {
        const freq = startFreq - (i * (startFreq - endFreq) / 10);
        setTimeout(() => playSound(freq, 0.05, 'sawtooth'), i * 20);
    }
}

// Add sound effects to wish cards
document.querySelectorAll('.wish-card').forEach(card => {
    card.addEventListener('click', function() {
        const soundType = this.getAttribute('data-sound');
        
        switch(soundType) {
            case 'rabbit':
                playBoing();
                break;
            case 'hatter':
                playChime();
                break;
            case 'rose':
                playMagicSound();
                break;
            case 'sparkle':
                playTwinkle();
                break;
            case 'butterfly':
                playMagicSound();
                playTwinkle();
                break;
            case 'heart':
                playChime();
                playMagicSound();
                break;
        }
        
        this.style.animation = 'spin 0.5s ease-in-out';
        setTimeout(() => {
            this.style.animation = '';
        }, 500);
    });
});

// Add sound effects and flip to timeline cards
document.querySelectorAll('.timeline-card').forEach(card => {
    card.addEventListener('click', function() {
        const soundType = this.getAttribute('data-sound');
        
        // Toggle flip
        this.classList.toggle('flipped');
        
        // Play sound
        switch(soundType) {
            case 'rabbit':
                playBoing();
                break;
            case 'hatter':
                playChime();
                break;
            case 'rose':
                playMagicSound();
                break;
            case 'sparkle':
                playTwinkle();
                break;
            case 'butterfly':
                playMagicSound();
                playTwinkle();
                break;
            case 'heart':
                playChime();
                playMagicSound();
                break;
        }
    });
});

// Add sound effects to tea items
document.querySelectorAll('.tea-item').forEach(item => {
    item.addEventListener('click', function() {
        const soundType = this.getAttribute('data-sound');
        
        // Toggle flip
        this.classList.toggle('flipped');
        
        // Play sound
        switch(soundType) {
            case 'eat':
                playPop();
                break;
            case 'drink':
                playWhoosh();
                break;
            case 'teacup':
                playDing();
                break;
            case 'cookie':
                playChime();
                break;
        }
    });
});