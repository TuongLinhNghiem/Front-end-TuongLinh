
/**
 * ========================================
 * Hoai Niem Visual Novel Engine
 * Main Engine
 * ========================================
 * 
 * Core engine that coordinates all systems,
 * loads story data, and executes commands
 */

export class VNEngine {
    constructor() {
        // Game state
        this.state = {
            currentArc: 'prologue',
            currentScene: null,
            dialogueIndex: 0,
            variables: {},
            isPaused: false,
            isMinigameActive: false
        };
        
        // Story data
        this.storyData = null;
        this.currentCommands = [];
        
        // Player selection
        this.playerSelected = false;
        
        // DOM elements
        this.elements = {
            playerSelection: document.getElementById('player-selection'),
            gameScreen: document.getElementById('game-screen'),
            loadingScreen: document.getElementById('loading-screen'),
            menuBtn: document.getElementById('menu-btn'),
            gameMenu: document.getElementById('game-menu'),
            saveLoadMenu: document.getElementById('save-load-menu'),
            menuResume: document.getElementById('menu-resume'),
            menuSave: document.getElementById('menu-save'),
            menuLoad: document.getElementById('menu-load'),
            menuTitle: document.getElementById('menu-title'),
            saveLoadTitle: document.getElementById('save-load-title'),
            saveLoadBack: document.getElementById('save-load-back'),
            saveSlots: document.getElementById('save-slots')
        };
        
        // Menu mode
        this.menuMode = null; // 'save' or 'load'
        
        this.initialize();
    }

    /**
     * Initialize the engine
     */
    initialize() {
        console.log('Initializing Hoai Niem VN Engine...');
        
        // Setup dialogue callbacks
        dialogueManager.setOnDialogueComplete(() => this.advanceDialogue());
        dialogueManager.setOnChoiceSelected((choice) => this.handleChoice(choice));
        
        // Setup menu event listeners
        this.setupMenuListeners();
        
        // Setup player selection
        this.setupPlayerSelection();
        
        // Setup mini-game event listeners
        this.setupMinigameListeners();
        
        console.log('Engine initialized successfully');
    }

    /**
     * Setup player selection screen
     */
    setupPlayerSelection() {
        const choiceButtons = document.querySelectorAll('.choice-btn');
        
        choiceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const character = button.dataset.character;
                this.selectPlayer(character);
            });
        });
    }

    /**
     * Handle player character selection
     * @param {string} character - 'hoai' or 'niem'
     */
    selectPlayer(character) {
        console.log('Player selected:', character);
        
        // Set game variables based on selection
        if (character === 'hoai') {
            this.state.variables = {
                player_name: 'Hoai',
                player_gender: 'male',
                target_name: 'Niem',
                target_gender: 'female'
            };
        } else {
            this.state.variables = {
                player_name: 'Niem',
                player_gender: 'female',
                target_name: 'Hoai',
                target_gender: 'male'
            };
        };
        
        this.playerSelected = true;
        
        // Transition to game screen
        this.startGame();
    }

    /**
     * Start the game
     */
    async startGame() {
        // Show loading screen
        this.elements.loadingScreen.classList.remove('hidden');
        
        // Hide player selection
        this.elements.playerSelection.classList.add('hidden');
        
        // Load prologue
        await this.loadStoryArc('prologue');
        
        // Start first scene
        if (this.storyData && this.storyData.scenes) {
            const firstScene = Object.keys(this.storyData.scenes)[0];
            await this.loadScene(firstScene);
        }
        
        // Hide loading screen and show game screen
        this.elements.loadingScreen.classList.add('hidden');
        this.elements.gameScreen.classList.remove('hidden');
    }

    /**
     * Load story arc from JSON file
     * @param {string} arcName - Name of the arc file
     */
    async loadStoryArc(arcName) {
        console.log('Loading story arc:', arcName);
        
        try {
            const response = await fetch(`story/${arcName}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to load story arc: ${arcName}`);
            }
            
            this.storyData = await response.json();
            this.state.currentArc = arcName;
            
            console.log('Story arc loaded successfully');
        } catch (error) {
            console.error('Error loading story arc:', error);
            this.showNotification('Failed to load story: ' + error.message, 'error');
        }
    }

    /**
     * Load a specific scene
     * @param {string} sceneName - Name of the scene
     */
    async loadScene(sceneName) {
        console.log('Loading scene:', sceneName);
        
        if (!this.storyData || !this.storyData.scenes || !this.storyData.scenes[sceneName]) {
            console.error('Scene not found:', sceneName);
            return;
        }
        
        this.state.currentScene = sceneName;
        this.state.dialogueIndex = 0;
        this.currentCommands = this.storyData.scenes[sceneName];
        
        // Execute first command
        await this.executeNextCommand();
    }

    /**
     * Execute the next command in the current scene
     */
    async executeNextCommand() {
        if (this.state.isPaused || this.state.isMinigameActive) {
            return;
        }
        
        if (this.state.dialogueIndex >= this.currentCommands.length) {
            console.log('Scene completed');
            return;
        }
        
        const command = this.currentCommands[this.state.dialogueIndex];
        console.log('Executing command:', command.type, command);
        
        await this.executeCommand(command);
    }

    /**
     * Execute a single command
     * @param {object} command - Command object
     */
    async executeCommand(command) {
        switch (command.type) {
            case 'background':
                await this.handleBackground(command);
                break;
                
            case 'character':
                await this.handleCharacter(command);
                break;
                
            case 'dialogue':
                await this.handleDialogue(command);
                break;
                
            case 'choice':
                await this.handleChoiceCommand(command);
                break;
                
            case 'minigame':
                await this.handleMinigame(command);
                break;
                
            case 'jump':
                await this.handleJump(command);
                break;
                
            case 'setvar':
                await this.handleSetVar(command);
                break;
                
            case 'wait':
                await this.handleWait(command);
                break;
                
            case 'effect':
                await this.handleEffect(command);
                break;
                
            default:
                console.warn('Unknown command type:', command.type);
                this.state.dialogueIndex++;
                await this.executeNextCommand();
        }
    }

    /**
     * Handle background command
     * @param {object} command - Background command
     */
    async handleBackground(command) {
        sceneManager.setBackground(command.image, true);
        this.state.dialogueIndex++;
        await this.executeNextCommand();
    }

    /**
     * Handle character command
     * @param {object} command - Character command
     */
    async handleCharacter(command) {
        if (command.action === 'show') {
            characterManager.showCharacter(
                command.name,
                command.sprite,
                command.position || 'center',
                true
            );
        } else if (command.action === 'hide') {
            characterManager.hideCharacter(command.position || 'center', true);
        } else if (command.action === 'update') {
            characterManager.updateCharacterSprite(command.name, command.sprite);
        } else if (command.action === 'move') {
            characterManager.moveCharacter(command.name, command.position);
        }
        
        this.state.dialogueIndex++;
        await this.executeNextCommand();
    }

    /**
     * Handle dialogue command
     * @param {object} command - Dialogue command
     */
    async handleDialogue(command) {
        dialogueManager.showDialogue(
            command.speaker,
            command.text,
            this.state.variables
        );
        // Don't increment index - wait for user to click
    }

    /**
     * Handle choice command
     * @param {object} command - Choice command
     */
    async handleChoiceCommand(command) {
        dialogueManager.showChoices(
            command.prompt,
            command.options,
            this.state.variables
        );
        // Don't increment index - wait for user to choose
    }

    /**
     * Handle mini-game command
     * @param {object} command - Mini-game command
     */
    async handleMinigame(command) {
        this.state.isMinigameActive = true;
        
        minigameLoader.launchMinigame(
            command.game,
            (results) => {
                // On complete
                console.log('Mini-game completed:', results);
                
                // Store results in variables
                if (results) {
                    Object.keys(results).forEach(key => {
                        this.state.variables[`game_${command.game}_${key}`] = results[key];
                    });
                }
                
                // Jump to specified scene or continue
                if (command.onComplete) {
                    this.jumpToScene(command.onComplete);
                } else {
                    this.state.dialogueIndex++;
                    this.executeNextCommand();
                }
            }
        );
    }

    /**
     * Handle jump command
     * @param {object} command - Jump command
     */
    async handleJump(command) {
        if (command.target && command.target !== this.state.currentArc) {
            // Jump to different arc
            await this.loadStoryArc(command.target);
        }
        
        if (command.scene) {
            await this.loadScene(command.scene);
        } else {
            this.state.dialogueIndex++;
            await this.executeNextCommand();
        }
    }

    /**
     * Handle setvar command
     * @param {object} command - Set variable command
     */
    async handleSetVar(command) {
        this.state.variables[command.variable] = command.value;
        this.state.dialogueIndex++;
        await this.executeNextCommand();
    }

    /**
     * Handle wait command
     * @param {object} command - Wait command
     */
    async handleWait(command) {
        const duration = command.duration || 1000;
        await new Promise(resolve => setTimeout(resolve, duration));
        this.state.dialogueIndex++;
        await this.executeNextCommand();
    }

    /**
     * Handle effect command
     * @param {object} command - Effect command
     */
    async handleEffect(command) {
        switch (command.effect) {
            case 'fade_to_black':
                await sceneManager.fadeToBlack(command.duration);
                break;
            case 'fade_from_black':
                await sceneManager.fadeFromBlack(command.duration);
                break;
            case 'flash':
                sceneManager.flashScreen(command.color, command.duration);
                break;
            case 'shake':
                sceneManager.shakeScreen(command.intensity, command.duration);
                break;
            case 'vignette':
                sceneManager.setVignette(command.opacity);
                break;
            case 'clear_effects':
                sceneManager.clearEffects();
                break;
        }
        
        this.state.dialogueIndex++;
        await this.executeNextCommand();
    }

    /**
     * Advance to next dialogue
     */
    advanceDialogue() {
        this.state.dialogueIndex++;
        this.executeNextCommand();
    }

    /**
     * Handle player choice selection
     * @param {object} choice - Selected choice
     */
    handleChoice(choice) {
        console.log('Choice selected:', choice);
        
        // Hide choices
        dialogueManager.hideChoices();
        
        // Jump to target scene
        if (choice.jump) {
            this.jumpToScene(choice.jump);
        } else {
            this.state.dialogueIndex++;
            this.executeNextCommand();
        }
    }

    /**
     * Jump to specific scene
     * @param {string} sceneName - Scene name
     */
    async jumpToScene(sceneName) {
        await this.loadScene(sceneName);
    }

    /**
     * Setup mini-game event listeners
     */
    setupMinigameListeners() {
        window.addEventListener('minigameStarted', () => {
            this.state.isMinigameActive = true;
        });
        
        window.addEventListener('minigameEnded', () => {
            this.state.isMinigameActive = false;
        });
    }

    /**
     * Setup menu event listeners
     */
    setupMenuListeners() {
        // Menu button
        this.elements.menuBtn.addEventListener('click', () => {
            this.toggleMenu();
        });
        
        // Menu items
        this.elements.menuResume.addEventListener('click', () => {
            this.closeMenu();
        });
        
        this.elements.menuSave.addEventListener('click', () => {
            this.openSaveMenu();
        });
        
        this.elements.menuLoad.addEventListener('click', () => {
            this.openLoadMenu();
        });
        
        this.elements.menuTitle.addEventListener('click', () => {
            this.returnToTitle();
        });
        
        // Save/Load menu
        this.elements.saveLoadBack.addEventListener('click', () => {
            this.closeSaveLoadMenu();
        });
    }

    /**
     * Toggle game menu
     */
    toggleMenu() {
        const isHidden = this.elements.gameMenu.classList.contains('hidden');
        
        if (isHidden) {
            this.elements.gameMenu.classList.remove('hidden');
            this.state.isPaused = true;
        } else {
            this.closeMenu();
        }
    }

    /**
     * Close game menu
     */
    closeMenu() {
        this.elements.gameMenu.classList.add('hidden');
        this.state.isPaused = false;
    }

    /**
     * Open save menu
     */
    openSaveMenu() {
        this.menuMode = 'save';
        this.elements.saveLoadTitle.textContent = 'Save Game';
        this.elements.gameMenu.classList.add('hidden');
        this.elements.saveLoadMenu.classList.remove('hidden');
        this.updateSaveSlots();
    }

    /**
     * Open load menu
     */
    openLoadMenu() {
        this.menuMode = 'load';
        this.elements.saveLoadTitle.textContent = 'Load Game';
        this.elements.gameMenu.classList.add('hidden');
        this.elements.saveLoadMenu.classList.remove('hidden');
        this.updateSaveSlots();
    }

    /**
     * Close save/load menu
     */
    closeSaveLoadMenu() {
        this.elements.saveLoadMenu.classList.add('hidden');
        this.elements.gameMenu.classList.remove('hidden');
        this.menuMode = null;
    }

    /**
     * Update save slots display
     */
    updateSaveSlots() {
        const slots = saveSystem.getSaveSlots();
        this.elements.saveSlots.innerHTML = '';
        
        slots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = `save-slot ${slot.hasSave ? 'has-save' : ''}`;
            slotElement.dataset.slot = slot.slot;
            
            const slotNumber = document.createElement('span');
            slotNumber.className = 'slot-number';
            slotNumber.textContent = `Slot ${slot.slot}`;
            
            const slotInfo = document.createElement('span');
            slotInfo.className = `slot-info ${slot.hasSave ? '' : 'empty'}`;
            
            if (slot.hasSave) {
                slotInfo.textContent = `${slot.formattedDate} - ${slot.currentArc}/${slot.currentScene}`;
            } else {
                slotInfo.textContent = 'Empty';
            }
            
            slotElement.appendChild(slotNumber);
            slotElement.appendChild(slotInfo);
            
            slotElement.addEventListener('click', () => {
                this.handleSlotClick(slot.slot);
            });
            
            this.elements.saveSlots.appendChild(slotElement);
        });
    }

    /**
     * Handle save/load slot click
     * @param {number} slotNumber - Slot number
     */
    handleSlotClick(slotNumber) {
        if (this.menuMode === 'save') {
            this.saveToSlot(slotNumber);
        } else if (this.menuMode === 'load') {
            this.loadFromSlot(slotNumber);
        }
    }

    /**
     * Save game to slot
     * @param {number} slotNumber - Slot number
     */
    saveToSlot(slotNumber) {
        const success = saveSystem.saveGame(slotNumber, this.state);
        
        if (success) {
            this.showNotification('Game saved to slot ' + slotNumber, 'success');
            this.updateSaveSlots();
        } else {
            this.showNotification('Failed to save game', 'error');
        }
    }

    /**
     * Load game from slot
     * @param {number} slotNumber - Slot number
     */
    async loadFromSlot(slotNumber) {
        const saveData = saveSystem.loadGame(slotNumber);
        
        if (saveData) {
            // Restore state
            this.state = {
                ...this.state,
                currentArc: saveData.currentArc,
                currentScene: saveData.currentScene,
                dialogueIndex: saveData.dialogueIndex,
                variables: { ...saveData.variables }
            };
            
            // Load the story arc
            await this.loadStoryArc(this.state.currentArc);
            
            // Load the scene
            await this.loadScene(this.state.currentScene);
            
            // Close menu
            this.closeSaveLoadMenu();
            this.closeMenu();
            
            this.showNotification('Game loaded from slot ' + slotNumber, 'success');
        } else {
            this.showNotification('No save found in slot ' + slotNumber, 'error');
        }
    }

    /**
     * Return to title screen
     */
    returnToTitle() {
        // Clear state
        this.state = {
            currentArc: 'prologue',
            currentScene: null,
            dialogueIndex: 0,
            variables: {},
            isPaused: false,
            isMinigameActive: false
        };
        
        // Clear managers
        characterManager.clear();
        sceneManager.clearEffects();
        dialogueManager.reset();
        
        // Close menus
        this.elements.gameMenu.classList.add('hidden');
        this.elements.saveLoadMenu.classList.add('hidden');
        
        // Show player selection
        this.elements.gameScreen.classList.add('hidden');
        this.elements.playerSelection.classList.remove('hidden');
        
        this.playerSelected = false;
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Get current game state
     * @returns {object} Current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Set game state
     * @param {object} state - New state
     */
    setState(state) {
        this.state = { ...state };
    }
}

// Create global engine instance
window.vnEngine = new VNEngine();

window.addEventListener('DOMContentLoaded', () => {
    console.log('Hoai Niem VN Engine ready');
    window.vnEngine = new VNEngine();
});
