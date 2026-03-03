Hoai Niem - Integration Guide

This guide explains how to add new content to the Hoai Niem Visual Novel engine.

Table of Contents

- Adding New Story Arcs

- Creating Scenes

- Using Commands

- Adding Characters

- Adding Backgrounds

- Integrating Mini-Games

- Working with Variables

- Best Practices

Adding New Story Arcs

Step 1: Create the Story File

Create a new JSON file in the story/ directory. Name it descriptively (e.g., arc6.json).

Step 2: Define the Arc Structure

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "title": "Arc 6",

  "description": "Description of this story arc",

  "scenes": {

    "scene_01": [

      // Commands go here

    ],

    "scene_02": [

      // Commands go here

    ]

  }

}

Step 3: Add Scenes

Each scene is an array of commands that execute in order:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "scenes": {

    "scene_01": [

      {

        "type": "background",

        "image": "assets/backgrounds/location.jpg"

      },

      {

        "type": "dialogue",

        "speaker": "Character",

        "text": "Dialogue text here"

      }

    ]

  }

}

Step 4: Link to the New Arc

Use the jump command to transition to your new arc:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "jump",

  "target": "arc6",

  "scene": "scene_01"

}

Creating Scenes

Scene Naming Convention

Use descriptive scene names:

- scene_01, scene_02 - Sequential scenes

- scene_meeting - Event-based naming

- scene_choice_a - Branch-specific naming

Scene Structure

A typical scene follows this pattern:

- Set the scene - Background and characters

- Dialogue - Conversation between characters

- Interaction - Choices or mini-games

- Transition - Jump to next scene

Example:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "scenes": {

    "scene_meeting": [

      // 1. Set the scene

      {

        "type": "background",

        "image": "assets/backgrounds/park.jpg"

      },

      {

        "type": "character",

        "action": "show",

        "name": "hoai",

        "sprite": "assets/characters/hoai/smile.png",

        "position": "left"

      },

      // 2. Dialogue

      {

        "type": "dialogue",

        "speaker": "Hoai",

        "text": "Hello there!"

      },

      {

        "type": "dialogue",

        "speaker": "Niem",

        "text": "Hi! Nice to meet you."

      },

      // 3. Interaction

      {

        "type": "choice",

Using Commands

Background Command

Sets the scene background:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "background",

  "image": "assets/backgrounds/location.jpg"

}

Tips:

- Use high-quality images (1920x1080 recommended)

- Preload backgrounds for smooth transitions

- Use consistent naming convention

Character Commands

Show Character

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "character",

  "action": "show",

  "name": "hoai",

  "sprite": "assets/characters/hoai/smile.png",

  "position": "left"

}

Positions: left, center, right

Hide Character

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "character",

  "action": "hide",

  "position": "left"

}

Update Character Expression

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "character",

  "action": "update",

  "name": "hoai",

  "sprite": "assets/characters/hoai/sad.png"

}

Move Character

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "character",

  "action": "move",

  "name": "hoai",

  "position": "center"

}

Dialogue Command

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "dialogue",

  "speaker": "Character Name",

  "text": "Dialogue text goes here"

}

Tips:

- Keep dialogue concise (2-3 sentences max)

- Use speaker names consistently

- Use variable substitution for dynamic content

Choice Command

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "choice",

  "prompt": "What do you want to do?",

  "options": [

    {

      "text": "Option 1",

      "jump": "scene_option1"

    },

    {

      "text": "Option 2",

      "jump": "scene_option2"

    }

  ]

}

Tips:

- Provide 2-4 meaningful choices

- Make choices clear and distinct

- Always include a jump target

Mini-Game Command

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "minigame",

  "game": "egg_catcher",

  "onComplete": "scene_after_game"

}

Available Games:

- egg_catcher

- memory_match

- pvp

- space_shooter

- racing

- flyme2themoon

Jump Command

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "jump",

  "target": "arc1",

  "scene": "scene_02"

}

Usage:

- Jump within same arc: omit target

- Jump to different arc: include both target and scene

Set Variable Command

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "setvar",

  "variable": "player_score",

  "value": 100

}

Tips:

- Use descriptive variable names

- Track player decisions for later branching

- Variables persist across saves

Effect Commands

Fade to Black

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "effect",

  "effect": "fade_to_black",

  "duration": 1000

}

Fade from Black

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "effect",

  "effect": "fade_from_black",

  "duration": 1000

}

Flash Screen

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "effect",

  "effect": "flash",

  "color": "white",

  "duration": 200

}

Shake Screen

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "effect",

  "effect": "shake",

  "intensity": 10,

  "duration": 500

}

Vignette

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "effect",

  "effect": "vignette",

  "opacity": 0.5

}

Clear Effects

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "effect",

  "effect": "clear_effects"

}

Wait Command

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "wait",

  "duration": 1000

}

Tips:

- Use for dramatic pauses

- Allow time for effects to complete

- Duration in milliseconds

Adding Characters

Step 1: Create Character Folder

Create a folder in assets/characters/:

assets/characters/newcharacter/

Step 2: Add Sprite Images

Add expression sprites with consistent naming:

assets/characters/newcharacter/
├── smile.png
├── sad.png
├── angry.png
├── neutral.png
└── happy.png

Recommended Size: 500x800 pixels (transparent PNG)

Step 3: Use in Story

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "character",

  "action": "show",

  "name": "newcharacter",

  "sprite": "assets/characters/newcharacter/smile.png",

  "position": "center"

}

Adding Backgrounds

Step 1: Add Image Files

Place background images in assets/backgrounds/:

assets/backgrounds/
├── school_hallway.jpg
├── classroom.jpg
├── park.jpg
└── cafe.jpg

Recommended Size: 1920x1080 pixels

Step 2: Use in Story

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "background",

  "image": "assets/backgrounds/new_location.jpg"

}

Integrating Mini-Games

Step 1: Prepare Mini-Game Folder

Ensure your mini-game is in the minigames/ directory:

minigames/
└── your_game/
    ├── index.html
    ├── script.js
    └── style.css

Step 2: Implement Communication API

Add this to your mini-game's JavaScript:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

// Send completion message

function completeGame(results) {

  window.parent.postMessage({

    type: 'game_complete',

    data: results

  }, '*');

}

// Send result without closing

function sendResult(data) {

  window.parent.postMessage({

    type: 'game_result',

    data: data

  }, '*');

}

// Listen for messages from VN engine

window.addEventListener('message', (event) => {

  const message = event.data;

  if (message.type === 'set_data') {

    // Handle data from VN engine

    console.log('Received data:', message.data);

  }

});

Step 3: Launch from Story

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "minigame",

  "game": "your_game",

  "onComplete": "scene_after_game"

}

Step 4: Access Game Results

Results are automatically stored as variables:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "dialogue",

  "speaker": "Narrator",

  "text": "Your score was {game_your_game_score}!"

}

See MINIGAME_API.md for detailed API documentation.

Working with Variables

Built-in Variables

- player_name - Selected character name

- player_gender - "male" or "female"

- target_name - Romance target name

- target_gender - Target's gender

Custom Variables

Create custom variables to track player choices:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "setvar",

  "variable": "met_character",

  "value": true

}

Using Variables in Dialogue

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "dialogue",

  "speaker": "{player_name}",

  "text": "Hello {target_name}!"

}

Conditional Branching (Advanced)

You can use variables to create conditional story paths:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "choice",

  "prompt": "What do you do?",

  "options": [

    {

      "text": "Go left",

      "jump": "scene_left"

    },

    {

      "text": "Go right",

      "jump": "scene_right"

    }

  ]

}

Then in the target scenes, check variables and branch accordingly.

Best Practices

Story Structure

- Keep scenes focused - One location or event per scene

- Use consistent naming - Follow naming conventions

- Plan your branches - Map out story paths before writing

- Test frequently - Verify each scene works as expected

Dialogue Writing

- Keep it concise - 2-3 sentences per dialogue box

- Show, don't tell - Use dialogue to reveal character

- Use natural language - Write how people actually speak

- Add variety - Mix short and long dialogue

Performance

- Optimize images - Compress backgrounds and sprites

- Preload assets - Load important assets early

- Limit concurrent characters - Max 3 on screen

- Use effects sparingly - Don't overuse animations

Testing

- Test all branches - Verify every choice works

- Test saves/loads - Ensure state persists correctly

- Test mini-games - Verify integration works

- Test on mobile - Check responsive design

Troubleshooting

Common Issues

Scene not loading:

- Check JSON syntax (use a JSON validator)

- Verify file path is correct

- Check browser console for errors

Characters not appearing:

- Verify sprite path is correct

- Check image file exists

- Ensure position is valid (left/center/right)

Mini-game not loading:

- Verify game folder exists in minigames/

- Check game has index.html

- Test game independently first

Variables not working:

- Check variable name spelling

- Ensure variable is set before use

- Use correct syntax {variable_name}

Getting Help

For more information:

- Check README.md for overview

- See MINIGAME_API.md for game integration

- Review sample story files in story/ directory

Happy storytelling! 🎮✨