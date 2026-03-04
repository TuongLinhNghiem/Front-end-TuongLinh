
/**
 * ========================================
 * Hoai Niem Visual Novel Engine
 * Mini-Game Loader
 * ========================================
 * 
 * Handles mini-game integration via iframe,
 * communication between VN engine and games,
 * and game state management
 */

class MinigameLoader {
    constructor() {
        this.overlay = document.getElementById('minigame-overlay');
        this.iframe = document.getElementById('minigame-frame');
        this.closeButton = document.getElementById('minigame-close');

        if (!this.overlay || !this.iframe || !this.closeButton) {
            console.error('MinigameLoader: overlay, iframe or close button not found!');
        }
        
        this.currentGame = null;
        this.onCompleteCallback = null;
        this.onResultCallback = null;
        this.gameResults = null;
        
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for mini-game interactions
     */
    setupEventListeners() {
        // Close button
        this.closeButton.addEventListener('click', () => {
            this.closeMinigame();
        });
        
        // Listen for messages from mini-games
        window.addEventListener('message', (event) => {
            this.handleGameMessage(event);
        });
    }

    /**
     * Launch a mini-game
     * @param {string} gameName - Name of the game folder
     * @param {function} onComplete - Callback when game completes
     * @param {function} onResult - Callback for game results
     */
    launchMinigame(gameName, onComplete = null, onResult = null) {
        console.log('Launching mini-game:', gameName);
        
        this.currentGame = gameName;
        this.onCompleteCallback = onComplete;
        this.onResultCallback = onResult;
        this.gameResults = null;
        
        // Build game URL
        const gameUrl = `minigames/${gameName}/index.html`;
        
        // Show overlay
        this.overlay.classList.remove('hidden');
        
        // Load game in iframe
        this.iframe.src = gameUrl;
        
        // Pause VN engine (signal to engine)
        this.notifyEnginePaused();
    }

    /**
     * Close the mini-game and return to story
     */
    closeMinigame() {

        if (!this.currentGame) {
            console.warn("No minigame running — ignore close");
            return;
        }

        console.log('Closing mini-game:', this.currentGame);
        
        // Clear iframe
        this.iframe.src = 'about:blank';
        
        // Hide overlay
        this.overlay.classList.add('hidden');
        
        // Call completion callback
        if (this.onCompleteCallback) {
            this.onCompleteCallback(this.gameResults);
        }
        
        // Resume VN engine (signal to engine)
        this.notifyEngineResumed();
        
        // Reset state
        this.currentGame = null;
        this.onCompleteCallback = null;
        this.onResultCallback = null;
        this.gameResults = null;
    }

    /**
     * Handle messages from mini-games
     * @param {MessageEvent} event - Message event
     */
    handleGameMessage(event) {
        // Verify message is from our iframe
        if (event.source !== this.iframe.contentWindow) {
            return;
        }
        
        const message = event.data;
        
        console.log('Received message from mini-game:', message);
        
        // Handle different message types
        switch (message.type) {
            case 'game_complete':
                this.handleGameComplete(message.data);
                break;
                
            case 'game_result':
                this.handleGameResult(message.data);
                break;
                
            case 'game_error':
                this.handleGameError(message.data);
                break;
                
            case 'game_ready':
                console.log('Mini-game is ready');
                break;
                
            default:
                console.log('Unknown message type:', message.type);
        }
    }

    /**
     * Handle game completion
     * @param {object} data - Completion data
     */
    handleGameComplete(data) {
        console.log('Game completed:', data);
        this.gameResults = data;
        
        // Auto-close after short delay
        setTimeout(() => {
            this.closeMinigame();
        }, 500);
    }

    /**
     * Handle game result (without closing)
     * @param {object} data - Result data
     */
    handleGameResult(data) {
        console.log('Game result:', data);
        this.gameResults = data;
        
        // Call result callback
        if (this.onResultCallback) {
            this.onResultCallback(data);
        }
    }

    /**
     * Handle game error
     * @param {object} data - Error data
     */
    handleGameError(data) {
        console.error('Mini-game error:', data);
        
        // Show error notification
        this.showNotification('Game Error: ' + (data.message || 'Unknown error'), 'error');
    }

    /**
     * Send message to mini-game
     * @param {object} message - Message object
     */
    sendToGame(message) {
        if (this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage(message, '*');
        }
    }

    /**
     * Notify VN engine that game is paused
     */
    notifyEnginePaused() {
        // This will be handled by the main engine
        const event = new CustomEvent('minigameStarted', {
            detail: { game: this.currentGame }
        });
        window.dispatchEvent(event);
    }

    /**
     * Notify VN engine that game is resumed
     */
    notifyEngineResumed() {
        // This will be handled by the main engine
        const event = new CustomEvent('minigameEnded', {
            detail: { 
                game: this.currentGame,
                results: this.gameResults
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Get current game name
     * @returns {string|null} Current game name
     */
    getCurrentGame() {
        return this.currentGame;
    }

    /**
     * Check if a game is currently running
     * @returns {boolean} True if game is running
     */
    isGameRunning() {
        return this.currentGame !== null;
    }

    /**
     * Get game results
     * @returns {object|null} Game results
     */
    getGameResults() {
        return this.gameResults;
    }

    /**
     * Set game data for mini-game
     * @param {object} data - Data to send to game
     */
    setGameData(data) {
        this.sendToGame({
            type: 'set_data',
            data: data
        });
    }

    /**
     * Get game data from mini-game
     * @param {string} key - Data key
     */
    getGameData(key) {
        this.sendToGame({
            type: 'get_data',
            key: key
        });
    }
}

// Create global instance
const minigameLoader = new MinigameLoader();

/**
 * ========================================
 * Mini-Game Communication API
 * ========================================
 * 
 * This section documents the API that mini-games
 * should use to communicate with the VN engine.
 * 
 * Mini-games should send messages using:
 * window.parent.postMessage(message, '*');
 * 
 * Message format:
 * {
 *   type: 'message_type',
 *   data: { ... }
 * }
 * 
 * Supported message types:
 * 
 * 1. game_complete - Signal game completion
 *    {
 *      type: 'game_complete',
 *      data: {
 *        score: 100,
 *        won: true,
 *        time: 60
 *      }
 *    }
 * 
 * 2. game_result - Send result without closing
 *    {
 *      type: 'game_result',
 *      data: {
 *        score: 50,
 *        level: 2
 *      }
 *    }
 * 
 * 3. game_error - Report error
 *    {
 *      type: 'game_error',
 *      data: {
 *        message: 'Error description'
 *      }
 *    }
 * 
 * 4. game_ready - Signal game is ready
 *    {
 *      type: 'game_ready'
 *    }
 * 
 * Mini-games can receive messages from VN engine:
 * 
 * 1. set_data - Set game data
 *    {
 *      type: 'set_data',
 *      data: {
 *        player_name: 'Hoai',
 *        difficulty: 'easy'
 *      }
 *    }
 * 
 * 2. get_data - Request game data
 *    {
 *      type: 'get_data',
 *      key: 'score'
 *    }
 * 
 * Example usage in mini-game:
 * 
 * // Send completion message
 * function completeGame(score, won) {
 *   window.parent.postMessage({
 *     type: 'game_complete',
 *     data: { score: score, won: won }
 *   }, '*');
 * }
 * 
 * // Listen for messages from VN engine
 * window.addEventListener('message', (event) => {
 *   const message = event.data;
 *   if (message.type === 'set_data') {
 *     // Handle data
 *   }
 * });
 */
