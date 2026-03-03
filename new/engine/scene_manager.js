
/**
 * ========================================
 * Hoai Niem Visual Novel Engine
 * Scene Manager
 * ========================================
 * 
 * Handles background rendering, transitions,
 * and visual effects
 */

class SceneManager {
    constructor() {
        this.backgroundLayer = document.getElementById('background-layer');
        this.effectsLayer = document.getElementById('effects-layer');
        this.currentBackground = null;
        this.transitionDuration = 500; // ms
    }

    /**
     * Set background image with transition
     * @param {string} imagePath - Path to background image
     * @param {boolean} animate - Whether to animate transition
     */
    setBackground(imagePath, animate = true) {
        if (!imagePath) {
            console.error('No image path provided');
            return;
        }

        // Create new image element to preload
        const img = new Image();
        
        img.onload = () => {
            if (animate) {
                // Fade out current background
                this.backgroundLayer.style.opacity = '0';
                
                setTimeout(() => {
                    this.backgroundLayer.style.backgroundImage = `url('${imagePath}')`;
                    this.backgroundLayer.style.opacity = '1';
                    this.currentBackground = imagePath;
                }, this.transitionDuration);
            } else {
                this.backgroundLayer.style.backgroundImage = `url('${imagePath}')`;
                this.currentBackground = imagePath;
            }
        };
        
        img.onerror = () => {
            console.error('Failed to load background:', imagePath);
            this.setPlaceholderBackground();
        };
        
        img.src = imagePath;
    }

    /**
     * Set placeholder background for missing images
     */
    setPlaceholderBackground() {
        const gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        this.backgroundLayer.style.backgroundImage = gradient;
        this.currentBackground = gradient;
    }

    /**
     * Fade to black
     * @param {number} duration - Duration in ms
     * @returns {Promise} Resolves when fade completes
     */
    fadeToBlack(duration = 500) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'fade-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: black;
                opacity: 0;
                transition: opacity ${duration}ms ease-in-out;
                z-index: 100;
            `;
            
            this.effectsLayer.appendChild(overlay);
            
            // Trigger reflow
            void overlay.offsetWidth;
            
            overlay.style.opacity = '1';
            
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    /**
     * Fade from black
     * @param {number} duration - Duration in ms
     * @returns {Promise} Resolves when fade completes
     */
    fadeFromBlack(duration = 500) {
        return new Promise((resolve) => {
            const overlay = this.effectsLayer.querySelector('.fade-overlay');
            
            if (overlay) {
                overlay.style.opacity = '0';
                
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, duration);
            } else {
                resolve();
            }
        });
    }

    /**
     * Flash screen effect
     * @param {string} color - Flash color (e.g., 'white', 'red')
     * @param {number} duration - Duration in ms
     */
    flashScreen(color = 'white', duration = 200) {
        const flash = document.createElement('div');
        flash.className = 'flash-effect';
        flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${color};
            opacity: 0;
            transition: opacity ${duration}ms ease-in-out;
            z-index: 100;
            pointer-events: none;
        `;
        
        this.effectsLayer.appendChild(flash);
        
        // Flash in
        setTimeout(() => {
            flash.style.opacity = '0.8';
        }, 10);
        
        // Flash out
        setTimeout(() => {
            flash.style.opacity = '0';
        }, duration);
        
        // Remove
        setTimeout(() => {
            flash.remove();
        }, duration * 2);
    }

    /**
     * Screen shake effect
     * @param {number} intensity - Shake intensity
     * @param {number} duration - Duration in ms
     */
    shakeScreen(intensity = 10, duration = 500) {
        const gameScreen = document.getElementById('game-screen');
        const shakeCount = Math.floor(duration / 50);
        let count = 0;
        
        const shakeInterval = setInterval(() => {
            const x = Math.random() * intensity * 2 - intensity;
            const y = Math.random() * intensity * 2 - intensity;
            gameScreen.style.transform = `translate(${x}px, ${y}px)`;
            count++;
            
            if (count >= shakeCount) {
                clearInterval(shakeInterval);
                gameScreen.style.transform = '';
            }
        }, 50);
    }

    /**
     * Add vignette effect
     * @param {number} opacity - Vignette opacity (0-1)
     */
    setVignette(opacity = 0.5) {
        let vignette = this.effectsLayer.querySelector('.vignette');
        
        if (!vignette) {
            vignette = document.createElement('div');
            vignette.className = 'vignette';
            vignette.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, transparent 50%, rgba(0,0,0,${opacity}) 100%);
                pointer-events: none;
                z-index: 50;
                transition: background 0.5s ease;
            `;
            this.effectsLayer.appendChild(vignette);
        } else {
            vignette.style.background = `radial-gradient(circle, transparent 50%, rgba(0,0,0,${opacity}) 100%)`;
        }
    }

    /**
     * Remove vignette effect
     */
    removeVignette() {
        const vignette = this.effectsLayer.querySelector('.vignette');
        if (vignette) {
            vignette.remove();
        }
    }

    /**
     * Add color overlay
     * @param {string} color - Color in hex or rgba
     * @param {number} opacity - Opacity (0-1)
     */
    setColorOverlay(color, opacity = 0.3) {
        let overlay = this.effectsLayer.querySelector('.color-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'color-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: ${color};
                opacity: ${opacity};
                pointer-events: none;
                z-index: 50;
                transition: all 0.5s ease;
            `;
            this.effectsLayer.appendChild(overlay);
        } else {
            overlay.style.background = color;
            overlay.style.opacity = opacity;
        }
    }

    /**
     * Remove color overlay
     */
    removeColorOverlay() {
        const overlay = this.effectsLayer.querySelector('.color-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Clear all effects
     */
    clearEffects() {
        this.effectsLayer.innerHTML = '';
    }

    /**
     * Get current background
     * @returns {string|null} Current background path
     */
    getCurrentBackground() {
        return this.currentBackground;
    }

    /**
     * Preload background image
     * @param {string} imagePath - Path to background image
     * @returns {Promise} Resolves when loaded
     */
    preloadBackground(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load: ${imagePath}`));
            img.src = imagePath;
        });
    }

    /**
     * Preload multiple backgrounds
     * @param {Array} imagePaths - Array of image paths
     * @returns {Promise} Resolves when all loaded
     */
    preloadBackgrounds(imagePaths) {
        const promises = imagePaths.map(path => this.preloadBackground(path));
        return Promise.all(promises);
    }
}

// Create global instance
const sceneManager = new SceneManager();
