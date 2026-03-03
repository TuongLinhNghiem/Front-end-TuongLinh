
/**
 * ========================================
 * Hoai Niem Visual Novel Engine
 * Character Manager
 * ========================================
 * 
 * Handles character sprite display, positioning,
 * and animations on the character layer
 */

class CharacterManager {
    constructor() {
        this.characters = {
            left: null,
            center: null,
            right: null
        };
        
        this.positions = {
            left: '20%',
            center: '50%',
            right: '80%'
        };
        
        this.transitionDuration = 500; // ms
    }

    /**
     * Show character at specified position
     * @param {string} name - Character name
     * @param {string} sprite - Path to sprite image
     * @param {string} position - 'left', 'center', or 'right'
     * @param {boolean} animate - Whether to animate entrance
     */
    showCharacter(name, sprite, position = 'center', animate = true) {
        const slot = document.getElementById(`char-${position}`);
        
        if (!slot) {
            console.error('Invalid character position:', position);
            return;
        }

        // Clear existing character in this slot
        slot.innerHTML = '';
        
        // Create character image element
        const img = document.createElement('img');
        img.src = sprite;
        img.alt = name;
        img.className = 'character-sprite';
        
        // Handle image load error
        img.onerror = () => {
            console.error('Failed to load character sprite:', sprite);
            img.src = this.createPlaceholderSprite(name);
        };
        
        slot.appendChild(img);
        
        // Store character info
        this.characters[position] = {
            name: name,
            sprite: sprite
        };
        
        // Animate entrance
        if (animate) {
            slot.classList.remove('active');
            // Force reflow
            void slot.offsetWidth;
            slot.classList.add('active');
        } else {
            slot.classList.add('active');
        }
    }

    /**
     * Hide character at specified position
     * @param {string} position - 'left', 'center', or 'right'
     * @param {boolean} animate - Whether to animate exit
     */
    hideCharacter(position, animate = true) {
        const slot = document.getElementById(`char-${position}`);
        
        if (!slot) {
            console.error('Invalid character position:', position);
            return;
        }

        if (animate) {
            slot.classList.remove('active');
            
            // Clear after animation completes
            setTimeout(() => {
                slot.innerHTML = '';
            }, this.transitionDuration);
        } else {
            slot.classList.remove('active');
            slot.innerHTML = '';
        }
        
        this.characters[position] = null;
    }

    /**
     * Hide all characters
     * @param {boolean} animate - Whether to animate exit
     */
    hideAllCharacters(animate = true) {
        ['left', 'center', 'right'].forEach(position => {
            this.hideCharacter(position, animate);
        });
    }

    /**
     * Update character sprite (change expression)
     * @param {string} name - Character name
     * @param {string} newSprite - Path to new sprite image
     */
    updateCharacterSprite(name, newSprite) {
        // Find character by name
        const position = Object.keys(this.characters).find(pos => 
            this.characters[pos] && this.characters[pos].name === name
        );
        
        if (!position) {
            console.error('Character not found:', name);
            return;
        }

        const slot = document.getElementById(`char-${position}`);
        const img = slot.querySelector('img');
        
        if (img) {
            img.src = newSprite;
            this.characters[position].sprite = newSprite;
            
            // Handle image load error
            img.onerror = () => {
                console.error('Failed to load character sprite:', newSprite);
                img.src = this.createPlaceholderSprite(name);
            };
        }
    }

    /**
     * Move character to different position
     * @param {string} name - Character name
     * @param {string} newPosition - 'left', 'center', or 'right'
     */
    moveCharacter(name, newPosition) {
        const currentPosition = Object.keys(this.characters).find(pos => 
            this.characters[pos] && this.characters[pos].name === name
        );
        
        if (!currentPosition) {
            console.error('Character not found:', name);
            return;
        }

        const characterData = this.characters[currentPosition];
        
        // Hide from current position
        this.hideCharacter(currentPosition, false);
        
        // Show at new position
        this.showCharacter(
            characterData.name,
            characterData.sprite,
            newPosition,
            true
        );
    }

    /**
     * Get character at position
     * @param {string} position - 'left', 'center', or 'right'
     * @returns {object|null} Character data or null
     */
    getCharacterAt(position) {
        return this.characters[position] || null;
    }

    /**
     * Check if character is on screen
     * @param {string} name - Character name
     * @returns {boolean} True if character is visible
     */
    isCharacterVisible(name) {
        return Object.values(this.characters).some(char => 
            char && char.name === name
        );
    }

    /**
     * Create placeholder sprite for missing images
     * @param {string} name - Character name
     * @returns {string} Data URI for placeholder
     */
    createPlaceholderSprite(name) {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        
        // Draw placeholder
        ctx.fillStyle = '#667eea';
        ctx.fillRect(0, 0, 300, 500);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(name, 150, 250);
        
        ctx.font = '16px Arial';
        ctx.fillText('Sprite Not Found', 150, 280);
        
        return canvas.toDataURL();
    }

    /**
     * Set character opacity (for effects)
     * @param {string} name - Character name
     * @param {number} opacity - Opacity value (0-1)
     */
    setCharacterOpacity(name, opacity) {
        const position = Object.keys(this.characters).find(pos => 
            this.characters[pos] && this.characters[pos].name === name
        );
        
        if (!position) {
            console.error('Character not found:', name);
            return;
        }

        const slot = document.getElementById(`char-${position}`);
        const img = slot.querySelector('img');
        
        if (img) {
            img.style.opacity = opacity;
        }
    }

    /**
     * Shake character animation
     * @param {string} name - Character name
     * @param {number} duration - Duration in ms
     */
    shakeCharacter(name, duration = 500) {
        const position = Object.keys(this.characters).find(pos => 
            this.characters[pos] && this.characters[pos].name === name
        );
        
        if (!position) {
            console.error('Character not found:', name);
            return;
        }

        const slot = document.getElementById(`char-${position}`);
        const img = slot.querySelector('img');
        
        if (img) {
            img.style.animation = 'shake 0.1s ease-in-out';
            
            const shakeCount = Math.floor(duration / 100);
            let count = 0;
            
            const shakeInterval = setInterval(() => {
                const offset = Math.random() * 10 - 5;
                img.style.transform = `translateX(${offset}px)`;
                count++;
                
                if (count >= shakeCount) {
                    clearInterval(shakeInterval);
                    img.style.transform = '';
                    img.style.animation = '';
                }
            }, 100);
        }
    }

    /**
     * Clear all character data
     */
    clear() {
        this.hideAllCharacters(false);
        this.characters = {
            left: null,
            center: null,
            right: null
        };
    }
}

// Create global instance
const characterManager = new CharacterManager();
