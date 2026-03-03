
/**
 * ========================================
 * Hoai Niem Visual Novel Engine
 * Save/Load System
 * ========================================
 * 
 * Handles game state persistence using localStorage
 * Supports multiple save slots with metadata
 */

class SaveSystem {
    constructor() {
        this.SAVE_KEY_PREFIX = 'hoai_niem_save_';
        this.MAX_SLOTS = 3;
        this.currentSaveData = null;
    }

    /**
     * Save current game state to specified slot
     * @param {number} slotNumber - Save slot (1-3)
     * @param {object} gameState - Current game state from engine
     * @returns {boolean} Success status
     */
    saveGame(slotNumber, gameState) {
        try {
            if (slotNumber < 1 || slotNumber > this.MAX_SLOTS) {
                console.error('Invalid save slot:', slotNumber);
                return false;
            }

            const saveData = {
                saveSlot: slotNumber,
                timestamp: new Date().toISOString(),
                currentArc: gameState.currentArc,
                currentScene: gameState.currentScene,
                dialogueIndex: gameState.dialogueIndex,
                variables: { ...gameState.variables }
            };

            const saveKey = this.SAVE_KEY_PREFIX + slotNumber;
            localStorage.setItem(saveKey, JSON.stringify(saveData));
            
            console.log('Game saved to slot', slotNumber);
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    }

    /**
     * Load game state from specified slot
     * @param {number} slotNumber - Save slot (1-3)
     * @returns {object|null} Save data or null if not found
     */
    loadGame(slotNumber) {
        try {
            if (slotNumber < 1 || slotNumber > this.MAX_SLOTS) {
                console.error('Invalid save slot:', slotNumber);
                return null;
            }

            const saveKey = this.SAVE_KEY_PREFIX + slotNumber;
            const saveDataJSON = localStorage.getItem(saveKey);

            if (!saveDataJSON) {
                console.log('No save found in slot', slotNumber);
                return null;
            }

            const saveData = JSON.parse(saveDataJSON);
            console.log('Game loaded from slot', slotNumber);
            return saveData;
        } catch (error) {
            console.error('Error loading game:', error);
            return null;
        }
    }

    /**
     * Get all save slots with metadata
     * @returns {Array} Array of save slot information
     */
    getSaveSlots() {
        const slots = [];
        
        for (let i = 1; i <= this.MAX_SLOTS; i++) {
            const saveKey = this.SAVE_KEY_PREFIX + i;
            const saveDataJSON = localStorage.getItem(saveKey);
            
            if (saveDataJSON) {
                const saveData = JSON.parse(saveDataJSON);
                const date = new Date(saveData.timestamp);
                
                slots.push({
                    slot: i,
                    hasSave: true,
                    timestamp: saveData.timestamp,
                    formattedDate: this.formatDate(date),
                    currentArc: saveData.currentArc,
                    currentScene: saveData.currentScene,
                    playerName: saveData.variables.player_name || 'Unknown'
                });
            } else {
                slots.push({
                    slot: i,
                    hasSave: false,
                    timestamp: null,
                    formattedDate: 'Empty',
                    currentArc: null,
                    currentScene: null,
                    playerName: null
                });
            }
        }
        
        return slots;
    }

    /**
     * Delete save from specified slot
     * @param {number} slotNumber - Save slot (1-3)
     * @returns {boolean} Success status
     */
    deleteSave(slotNumber) {
        try {
            if (slotNumber < 1 || slotNumber > this.MAX_SLOTS) {
                console.error('Invalid save slot:', slotNumber);
                return false;
            }

            const saveKey = this.SAVE_KEY_PREFIX + slotNumber;
            localStorage.removeItem(saveKey);
            
            console.log('Save deleted from slot', slotNumber);
            return true;
        } catch (error) {
            console.error('Error deleting save:', error);
            return false;
        }
    }

    /**
     * Check if slot has a save
     * @param {number} slotNumber - Save slot (1-3)
     * @returns {boolean} True if save exists
     */
    hasSave(slotNumber) {
        const saveKey = this.SAVE_KEY_PREFIX + slotNumber;
        return localStorage.getItem(saveKey) !== null;
    }

    /**
     * Format date for display
     * @param {Date} date - Date object
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Clear all save data (for testing/reset)
     */
    clearAllSaves() {
        for (let i = 1; i <= this.MAX_SLOTS; i++) {
            const saveKey = this.SAVE_KEY_PREFIX + i;
            localStorage.removeItem(saveKey);
        }
        console.log('All saves cleared');
    }

    /**
     * Export save data as JSON string (for backup)
     * @param {number} slotNumber - Save slot (1-3)
     * @returns {string|null} JSON string or null
     */
    exportSave(slotNumber) {
        const saveKey = this.SAVE_KEY_PREFIX + slotNumber;
        return localStorage.getItem(saveKey);
    }

    /**
     * Import save data from JSON string
     * @param {number} slotNumber - Save slot (1-3)
     * @param {string} saveDataJSON - JSON string of save data
     * @returns {boolean} Success status
     */
    importSave(slotNumber, saveDataJSON) {
        try {
            const saveData = JSON.parse(saveDataJSON);
            
            if (saveData.saveSlot !== slotNumber) {
                console.error('Save slot mismatch');
                return false;
            }

            const saveKey = this.SAVE_KEY_PREFIX + slotNumber;
            localStorage.setItem(saveKey, saveDataJSON);
            
            console.log('Save imported to slot', slotNumber);
            return true;
        } catch (error) {
            console.error('Error importing save:', error);
            return false;
        }
    }
}

// Create global instance
const saveSystem = new SaveSystem();
