/**
 * Utility functions for the game
 */

// Generate a random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if two elements are colliding
function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

// Get the distance between two elements
function getDistance(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;

    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Create an element with specified properties
function createElement(type, className, parent, styles = {}) {
    const element = document.createElement(type);
    element.className = className;

    Object.keys(styles).forEach(key => {
        element.style[key] = styles[key];
    });

    if (parent) {
        parent.appendChild(element);
    }

    return element;
}

// Convert grid coordinates to pixel position
function gridToPixel(col, row) {
    return {
        x: col * CONFIG.cellSize,
        y: row * CONFIG.cellSize
    };
}

// Convert pixel position to grid coordinates
function pixelToGrid(x, y) {
    return {
        col: Math.floor(x / CONFIG.cellSize),
        row: Math.floor(y / CONFIG.cellSize)
    };
}

// Play sound with volume control
function playSound(src, volume = 1.0, loop = false) {
    const sound = new Audio(src);
    sound.volume = volume;
    sound.loop = loop;

    // Check if music is muted
    if (window.gameMuted && loop) {
        sound.muted = true;
    }

    sound.play().catch(error => {
        console.warn("Audio play failed:", error);
    });

    return sound;
}

// Format time in MM:SS format
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Shake an element
function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

// Fade in an element
function fadeIn(element) {
    element.classList.add('fade-in');
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.remove('fade-in');
    }, 500);
}

// Fade out an element
function fadeOut(element, callback) {
    element.classList.add('fade-out');
    setTimeout(() => {
        element.classList.add('hidden');
        element.classList.remove('fade-out');
        if (callback) callback();
    }, 500);
}

// Show a message popup
function showMessage(message, duration = 3000) {
    const messageElement = document.getElementById('message-popup') || createElement('div', 'message-popup', document.body);
    messageElement.id = 'message-popup';
    messageElement.textContent = message;
    messageElement.style.position = 'absolute';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    messageElement.style.color = 'white';
    messageElement.style.padding = '20px';
    messageElement.style.borderRadius = '10px';
    messageElement.style.zIndex = '1000';
    messageElement.style.textAlign = 'center';

    fadeIn(messageElement);

    setTimeout(() => {
        fadeOut(messageElement);
    }, duration);
}
