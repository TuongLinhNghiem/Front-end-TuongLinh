Hoai Niem - Visual Novel Engine

A web-based Visual Novel engine with mini-game integration capabilities, built with pure HTML5, CSS3, and JavaScript.

Features

- Data-Driven Story System: All story content stored in JSON files

- Character System: Multiple characters with expressions and positioning

- Dialogue System: Typewriter effect with click-to-continue

- Player Choices: Branching story paths based on player decisions

- Mini-Game Integration: Seamless iframe-based mini-game loading

- Save/Load System: LocalStorage-based game state persistence

- Visual Effects: Screen transitions, flashes, shakes, and overlays

- Mobile Responsive: Designed for web and future Android export

Project Structure

HoaiNiem/
├── index.html                    # Main entry point
├── styles/
│   ├── main.css                  # Core VN styling
│   └── ui.css                    # UI components
├── engine/
│   ├── vn_engine.js              # Core engine initialization
│   ├── dialogue_manager.js       # Text display & typing effect
│   ├── scene_manager.js          # Scene rendering & transitions
│   ├── character_manager.js      # Character sprite handling
│   ├── minigame_loader.js        # Mini-game iframe integration
│   └── save_system.js            # LocalStorage save/load
├── story/
│   ├── prologue.json             # Story arc files
│   ├── arc1.json
│   ├── arc2.json
│   ├── arc3.json
│   ├── arc4.json
│   └── arc5.json
├── assets/
│   ├── backgrounds/              # Scene backgrounds
│   ├── characters/               # Character sprites
│   │   ├── hoai/
│   │   └── niem/
│   ├── ui/                       # UI elements
│   └── audio/                    # Music & SFX
└── minigames/                    # Mini-games
    ├── egg_catcher/
    ├── memory_match/
    ├── pvp/
    ├── space_shooter/
    ├── racing/
    └── flyme2themoon/

Quick Start

Prerequisites

- Visual Studio Code with Live Server extension

- Modern web browser (Chrome, Firefox, Safari, Edge)

Installation

- Clone or download this project

- Open the project folder in Visual Studio Code

- Right-click on index.html and select "Open with Live Server"

- The game will open in your default browser

First Run

- Select your character (Hoai or Niem)

- Follow the prologue story

- Make choices to branch the story

- Launch mini-games when prompted

- Use the menu (☰) to save/load your progress

Story Commands

The engine supports the following JSON command types:

Background Change

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "background",

  "image": "assets/backgrounds/school_hallway.jpg"

}

Character Display

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "character",

  "action": "show",

  "name": "hoai",

  "sprite": "assets/characters/hoai/smile.png",

  "position": "left"

}

Dialogue

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "dialogue",

  "speaker": "Hoai",

  "text": "Hello! Welcome to our story."

}

Player Choice

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "choice",

  "prompt": "What do you want to do?",

  "options": [

    {"text": "Play a game", "jump": "scene_game"},

    {"text": "Continue talking", "jump": "scene_talk"}

  ]

}

Mini-Game Launch

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "minigame",

  "game": "egg_catcher",

  "onComplete": "scene_after_game"

}

Scene Jump

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "jump",

  "target": "arc1",

  "scene": "scene_02"

}

Variable Set

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "setvar",

  "variable": "player_score",

  "value": 100

}

Effects

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "effect",

  "effect": "fade_to_black",

  "duration": 1000

}

Supported effects:

- fade_to_black

- fade_from_black

- flash

- shake

- vignette

- clear_effects

Wait

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "wait",

  "duration": 1000

}

Variable Substitution

Use variables in dialogue with {variable_name} syntax:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "dialogue",

  "speaker": "{player_name}",

  "text": "I wonder what {target_name} is doing today..."

}

Built-in variables:

- player_name - Selected character name

- player_gender - "male" or "female"

- target_name - Romance target name

- target_gender - Target's gender

Mini-Game Integration

Mini-games are loaded via iframe and can communicate with the VN engine using the postMessage API.

See MINIGAME_API.md for detailed integration instructions.

Save/Load System

The engine supports 3 save slots using LocalStorage:

- Press the menu button (☰) to open the game menu

- Select "Save Game" to save current progress

- Select "Load Game" to load a previous save

- Save data includes: current arc, scene, dialogue index, and all variables

Customization

Adding New Story Arcs

- Create a new JSON file in the story/ directory

- Follow the structure in prologue.json

- Add scenes with command arrays

- Reference the new arc using the jump command

See INTEGRATION_GUIDE.md for detailed instructions.

Adding Characters

- Create character folder in assets/characters/

- Add sprite images for different expressions

- Reference sprites in story JSON files

Adding Backgrounds

- Place background images in assets/backgrounds/

- Reference in story JSON using background command

Browser Compatibility

- Chrome/Edge: ✅ Full support

- Firefox: ✅ Full support

- Safari: ✅ Full support

- Mobile browsers: ✅ Full support

Future Development

- Android export via Cordova/Capacitor

- Audio system (music and SFX)

- Dialogue history log

- Auto-advance option

- More visual effects

- Achievement system

License

This project is created for the Hoai Niem visual novel project.

Credits

Developed for Hoai Niem Visual Novel Project