
/**
 * ========================================
 * Hoai Niem Visual Novel Engine
 * Dialogue Manager
 * ========================================
 * 
 * Handles dialogue text display, typing effects,
 * and player choices
 */

class DialogueManager {
    constructor() {
        this.dialogueBox = document.getElementById('dialogue-box');
        this.speakerName = document.getElementById('speaker-name');
        this.dialogueText = document.getElementById('dialogue-text');
        this.continueIndicator = document.getElementById('continue-indicator');
        this.choiceContainer = document.getElementById('choice-container');
        
        this.typingSpeed = 50; // ms per character
        this.isTyping = false;
        this.typingTimeout = null;
        this.currentText = '';
        this.displayedText = '';
        this.isHolding = false;
        
        this.onDialogueComplete = null;
        this.onChoiceSelected = null;
        
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for dialogue interaction
     */
    setupEventListeners() {
        // Click to continue or skip typing
        this.dialogueBox.addEventListener('click', () => this.handleClick());
        
        // Hold to skip typing
        this.dialogueBox.addEventListener('mousedown', () => {
            this.isHolding = true;
            if (this.isTyping) {
                this.skipTyping();
            }
        });
        
        this.dialogueBox.addEventListener('mouseup', () => {
            this.isHolding = false;
        });
        
        this.dialogueBox.addEventListener('mouseleave', () => {
            this.isHolding = false;
        });
        
        // Touch events for mobile
        this.dialogueBox.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isHolding = true;
            if (this.isTyping) {
                this.skipTyping();
            }
        });
        
        this.dialogueBox.addEventListener('touchend', () => {
            this.isHolding = false;
        });
    }

    /**
     * Handle click on dialogue box
     */
    handleClick() {
        if (this.isTyping) {
            // Skip typing animation
            this.skipTyping();
        } else {
            // Signal dialogue complete
            if (this.onDialogueComplete) {
                this.onDialogueComplete();
            }
        }
    }

    /**
     * Display dialogue with typing effect
     * @param {string} speaker - Speaker name
     * @param {string} text - Dialogue text
     * @param {object} variables - Game variables for template substitution
     */
    showDialogue(speaker, text, variables = {}) {
        // Clear any ongoing typing
        this.clearTyping();
        
        // Set speaker name
        this.speakerName.textContent = this.substituteVariables(speaker, variables);
        
        // Store full text
        this.currentText = this.substituteVariables(text, variables);
        this.displayedText = '';
        
        // Hide continue indicator
        this.continueIndicator.style.display = 'none';
        
        // Start typing effect
        this.isTyping = true;
        this.typeText();
    }

    /**
     * Type text character by character
     */
    typeText() {
        if (this.displayedText.length < this.currentText.length) {
            // Add next character
            this.displayedText += this.currentText[this.displayedText.length];
            this.dialogueText.textContent = this.displayedText;
            
            // Schedule next character
            this.typingTimeout = setTimeout(() => {
                this.typeText();
            }, this.typingSpeed);
        } else {
            // Typing complete
            this.isTyping = false;
            this.continueIndicator.style.display = 'block';
        }
    }

    /**
     * Skip typing animation and show full text
     */
    skipTyping() {
        if (this.isTyping) {
            this.clearTyping();
            this.displayedText = this.currentText;
            this.dialogueText.textContent = this.displayedText;
            this.isTyping = false;
            this.continueIndicator.style.display = 'block';
        }
    }

    /**
     * Clear typing timeout
     */
    clearTyping() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
    }

    /**
     * Substitute variables in text
     * @param {string} text - Text with variable placeholders
     * @param {object} variables - Variable values
     * @returns {string} Text with variables substituted
     */
    substituteVariables(text, variables) {
        if (!text) return '';
        
        return text.replace(/\{(\w+)\}/g, (match, varName) => {
            return variables[varName] !== undefined ? variables[varName] : match;
        });
    }

    /**
     * Display player choices
     * @param {string} prompt - Choice prompt text
     * @param {Array} options - Array of choice objects {text, jump}
     * @param {object} variables - Game variables for template substitution
     */
    showChoices(prompt, options, variables = {}) {
        // Clear dialogue
        this.clearTyping();
        this.dialogueText.textContent = '';
        this.speakerName.textContent = '';
        this.continueIndicator.style.display = 'none';
        
        // Clear previous choices
        this.choiceContainer.innerHTML = '';
        
        // Create prompt
        const promptElement = document.createElement('div');
        promptElement.className = 'choice-prompt';
        promptElement.textContent = this.substituteVariables(prompt, variables);
        this.choiceContainer.appendChild(promptElement);
        
        // Create choice buttons
        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'choice-option';
            button.textContent = this.substituteVariables(option.text, variables);
            button.dataset.jump = option.jump;
            button.dataset.index = index;
            
            button.addEventListener('click', () => {
                if (this.onChoiceSelected) {
                    this.onChoiceSelected(option);
                }
            });
            
            this.choiceContainer.appendChild(button);
        });
        
        // Show choice container
        this.choiceContainer.classList.remove('hidden');
    }

    /**
     * Hide choices
     */
    hideChoices() {
        this.choiceContainer.classList.add('hidden');
        this.choiceContainer.innerHTML = '';
    }

    /**
     * Clear dialogue box
     */
    clearDialogue() {
        this.clearTyping();
        this.speakerName.textContent = '';
        this.dialogueText.textContent = '';
        this.continueIndicator.style.display = 'none';
        this.hideChoices();
    }

    /**
     * Set typing speed
     * @param {number} speed - Speed in ms per character
     */
    setTypingSpeed(speed) {
        this.typingSpeed = speed;
    }

    /**
     * Get typing speed
     * @returns {number} Current typing speed
     */
    getTypingSpeed() {
        return this.typingSpeed;
    }

    /**
     * Check if currently typing
     * @returns {boolean} True if typing
     */
    isCurrentlyTyping() {
        return this.isTyping;
    }

    /**
     * Set callback for dialogue completion
     * @param {function} callback - Callback function
     */
    setOnDialogueComplete(callback) {
        this.onDialogueComplete = callback;
    }

    /**
     * Set callback for choice selection
     * @param {function} callback - Callback function
     */
    setOnChoiceSelected(callback) {
        this.onChoiceSelected = callback;
    }

    /**
     * Show/hide dialogue box
     * @param {boolean} visible - Visibility state
     */
    setVisible(visible) {
        if (visible) {
            this.dialogueBox.classList.remove('hidden');
        } else {
            this.dialogueBox.classList.add('hidden');
        }
    }

    /**
     * Reset dialogue manager state
     */
    reset() {
        this.clearTyping();
        this.clearDialogue();
        this.currentText = '';
        this.displayedText = '';
        this.isHolding = false;
    }
}

// Create global instance
const dialogueManager = new DialogueManager();
