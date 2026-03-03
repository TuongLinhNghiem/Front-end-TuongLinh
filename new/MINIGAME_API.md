Hoai Niem - Mini-Game Communication API

This document explains how mini-games can communicate with the Hoai Niem Visual Novel engine using the postMessage API.

Overview

Mini-games are loaded in an iframe and communicate with the parent VN engine through the window.parent.postMessage() API. This allows for:

- Sending game results to the VN engine

- Receiving data from the VN engine

- Signaling game completion

- Reporting errors

Message Format

All messages follow this structure:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  type: 'message_type',

  data: { /* optional data object */ }

}

Sending Messages to VN Engine

Use window.parent.postMessage() to send messages:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

window.parent.postMessage(message, '*');

Message Types

1. Game Complete

Signal that the mini-game has finished and should close.

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

window.parent.postMessage({

  type: 'game_complete',

  data: {

    score: 100,

    won: true,

    time: 60,

    level: 1

  }

}, '*');

Data Fields (optional):

- score - Player's score

- won - Whether the player won (boolean)

- time - Time taken (seconds)

- level - Level reached

- Any custom fields you need

Behavior:

- Game results are stored as variables: game_{game_name}_{field}

- Mini-game closes automatically

- VN engine jumps to onComplete scene

2. Game Result

Send results without closing the game.

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

window.parent.postMessage({

  type: 'game_result',

  data: {

    score: 50,

    health: 75,

    coins: 10

  }

}, '*');

Behavior:

- Results are stored as variables

- Mini-game continues running

- Useful for progress updates

3. Game Error

Report an error to the VN engine.

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

window.parent.postMessage({

  type: 'game_error',

  data: {

    message: 'Failed to load resources',

    code: 'RESOURCE_ERROR'

  }

}, '*');

Behavior:

- Error is logged to console

- Notification shown to player

- Game continues running

4. Game Ready

Signal that the mini-game is ready to receive data.

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

window.parent.postMessage({

  type: 'game_ready'

}, '*');

Behavior:

- Logged to console

- No automatic action taken

Receiving Messages from VN Engine

Listen for messages from the VN engine:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

window.addEventListener('message', (event) => {

  const message = event.data;

  switch (message.type) {

    case 'set_data':

      // Handle data from VN engine

      break;

    case 'get_data':

      // Respond with requested data

      break;

  }

});

Message Types Received

1. Set Data

VN engine sends data to the mini-game.

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  type: 'set_data',

  data: {

    player_name: 'Hoai',

    player_gender: 'male',

    difficulty: 'easy',

    custom_param: 'value'

  }

}

Common Data Fields:

- player_name - Selected character name

- player_gender - "male" or "female"

- target_name - Romance target name

- target_gender - Target's gender

- Custom fields from story

2. Get Data

VN engine requests specific data from the mini-game.

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  type: 'get_data',

  key: 'score'

}

Response:
Send back the requested data using game_result:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

window.parent.postMessage({

  type: 'game_result',

  data: {

    score: currentScore

  }

}, '*');

Complete Integration Example

Here's a complete example of a mini-game integrated with the VN engine:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

// Game state

let gameState = {

  score: 0,

  isPlaying: false,

  playerData: {}

};

// Initialize game

function initGame() {

  // Signal ready

  window.parent.postMessage({

    type: 'game_ready'

  }, '*');

  // Listen for messages from VN engine

  window.addEventListener('message', handleMessage);

}

// Handle messages from VN engine

function handleMessage(event) {

  const message = event.data;

  switch (message.type) {

    case 'set_data':

      // Store player data

      gameState.playerData = message.data;

      console.log('Received player data:', gameState.playerData);

      // Customize game based on player

Accessing Game Results in Story

After a mini-game completes, results are automatically stored as variables with the pattern game_{game_name}_{field}.

Example

If your game sends:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  type: 'game_complete',

  data: {

    score: 100,

    won: true,

    time: 60

  }

}

You can access these in your story:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "dialogue",

  "speaker": "Narrator",

  "text": "Your score was {game_egg_catcher_score}!"

},

{

  "type": "dialogue",

  "speaker": "Narrator",

  "text": "You won: {game_egg_catcher_won}"

},

{

  "type": "dialogue",

  "speaker": "Narrator",

  "text": "Time: {game_egg_catcher_time} seconds"

}

Conditional Branching Based on Results

Use game results to create branching stories:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "choice",

  "prompt": "How did you do?",

  "options": [

    {

      "text": "I won!",

      "jump": "scene_victory"

    },

    {

      "text": "I lost...",

      "jump": "scene_defeat"

    }

  ]

}

Then in the target scenes, check the results:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "dialogue",

  "speaker": "Narrator",

  "text": "Your final score was {game_egg_catcher_score} points."

}

Best Practices

1. Always Send Completion Message

Ensure your game always sends a game_complete message when finished:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

// Good

function endGame() {

  window.parent.postMessage({

    type: 'game_complete',

    data: { score: finalScore }

  }, '*');

}

// Bad - Player gets stuck

function endGame() {

  // No message sent

}

2. Handle Player Data

Use player data to customize the game experience:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

function customizeGame(playerData) {

  // Use player name in game

  document.getElementById('player-name').textContent = playerData.player_name;

  // Adjust difficulty

  if (playerData.difficulty === 'hard') {

    increaseDifficulty();

  }

}

3. Send Progress Updates

Keep the VN engine informed of progress:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

function onLevelComplete(level, score) {

  window.parent.postMessage({

    type: 'game_result',

    data: {

      level: level,

      score: score

    }

  }, '*');

}

4. Handle Errors Gracefully

Report errors to help with debugging:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

try {

  loadResources();

} catch (error) {

  window.parent.postMessage({

    type: 'game_error',

    data: {

      message: error.message,

      stack: error.stack

    }

  }, '*');

}

5. Test Communication

Test message sending and receiving:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

// Test message

function testCommunication() {

  console.log('Testing communication...');

  window.parent.postMessage({

    type: 'game_result',

    data: { test: 'success' }

  }, '*');

}

Security Considerations

Message Origin

In production, you should verify the message origin:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

window.addEventListener('message', (event) => {

  // Verify origin (optional for development)

  // if (event.origin !== window.location.origin) {

  //   return;

  // }

  const message = event.data;

  // Process message

});

Data Validation

Always validate received data:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

function handleMessage(event) {

  const message = event.data;

  // Validate message structure

  if (!message || typeof message !== 'object') {

    return;

  }

  // Validate message type

  if (!message.type || typeof message.type !== 'string') {

    return;

  }

  // Process message

  switch (message.type) {

    case 'set_data':

      if (message.data && typeof message.data === 'object') {

        // Safe to use

        gameState.playerData = message.data;

      }

      break;

  }

}

Troubleshooting

Messages Not Received

Problem: VN engine not receiving messages

Solutions:

- Check browser console for errors

- Verify window.parent.postMessage() is called

- Ensure message format is correct

- Test with simple message first

Game Not Closing

Problem: Mini-game doesn't close after completion

Solutions:

- Ensure game_complete message is sent

- Check message type spelling

- Verify data object is included

- Test with minimal data

Data Not Available

Problem: Game results not accessible in story

Solutions:

- Check variable naming: game_{game_name}_{field}

- Ensure data is sent in data object

- Verify game name matches folder name

- Test with simple data first

Example Mini-Games

Simple Score Game

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

let score = 0;

function addPoints(points) {

  score += points;

  // Send progress update

  window.parent.postMessage({

    type: 'game_result',

    data: { score: score }

  }, '*');

}

function finishGame() {

  window.parent.postMessage({

    type: 'game_complete',

    data: {

      score: score,

      won: score >= 100

    }

  }, '*');

}

Timed Challenge

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

let startTime = Date.now();

let completed = false;

function completeChallenge() {

  if (completed) return;

  completed = true;

  const time = Math.floor((Date.now() - startTime) / 1000);

  window.parent.postMessage({

    type: 'game_complete',

    data: {

      time: time,

      completed: true

    }

  }, '*');

}

Multi-Level Game

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

let currentLevel = 1;

let totalScore = 0;

function completeLevel(levelScore) {

  totalScore += levelScore;

  window.parent.postMessage({

    type: 'game_result',

    data: {

      level: currentLevel,

      score: totalScore

    }

  }, '*');

  currentLevel++;

}

function finishGame() {

  window.parent.postMessage({

    type: 'game_complete',

    data: {

      finalLevel: currentLevel - 1,

      totalScore: totalScore

    }

  }, '*');

}

Additional Resources

- MDN: Window.postMessage()

- HTML5 iframe Communication

- See INTEGRATION_GUIDE.md for story integration

- See README.md for engine overview

Support

For issues or questions:

- Check browser console for errors

- Verify message format matches documentation

- Test with minimal example first

- Review example mini-games in minigames/ directory

Happy game development! 🎮✨