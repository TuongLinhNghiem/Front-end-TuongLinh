Hoai Niem - Ren'Py Visual Novel

A data-driven Visual Novel engine built in Ren'Py with embedded mini-game integration capabilities.

Project Overview

Hoai Niem is a Visual Novel that tells a heartfelt story with interactive gameplay elements. The engine features:

- JSON-driven story system for easy content creation

- Character selection at the start

- Embedded mini-games that play inside the VN window

- Complete save/load system

- Typewriter text effect with skip functionality

Requirements

- Ren'Py Launcher (version 8.0 or higher)

- Python 3.9+ (included with Ren'Py)

- Modern web browser (for web export)

Installation

-

Download Ren'Py Launcher

- Visit renpy.org

- Download the latest version for your OS

-

Install the Project

- Open Ren'Py Launcher

- Click "Create New Project" or copy this HoaiNiem folder to your Ren'Py projects directory

- The projects directory is typically:

- Windows: %USERPROFILE%\Documents\RenPy\

- macOS: ~/Documents/RenPy/

- Linux: ~/Documents/RenPy/

-

Launch the Game

- Select "HoaiNiem" in the project list

- Click "Launch Project"

Project Structure

HoaiNiem/
├── game/                        # Ren'Py project folder
│   ├── images/                  # Backgrounds, character sprites, UI
│   │   ├── backgrounds/         # Scene backgrounds
│   │   ├── characters/hoai/     # Hoai character sprites
│   │   └── characters/niem/     # Niem character sprites
│   ├── audio/                   # Music & SFX
│   ├── screens.rpy              # Custom UI & mini-game screens
│   ├── script.rpy               # Story labels, arcs
│   ├── options.rpy              # Configuration
│   ├── story/                   # JSON-based story arcs
│   │   └── prologue.json        # Sample prologue
│   └── minigames/               # Embedded minigame wrappers
│       ├── egg_catcher/
│       ├── memory_match/
│       ├── pvp/
│       ├── space_shooter/
│       ├── racing/
│       └── flyme2themoon/
└── README.md

Creating Story Content

Stories are defined in JSON files inside the game/story/ directory. Each JSON file represents a story arc.

Story Command Types

CommandDescriptionParameters

backgroundChange scene backgroundimage, transition

showDisplay a charactercharacter, expression, position

hideRemove a charactercharacter, transition

dialogueShow dialogue textspeaker, text

choicePresent player choicesoptions (array)

minigameLaunch a mini-gamegame, onComplete

setvarSet a story variablename, value

jumpJump to another arcarc

sceneClear screen with transitiontransition

Template Variables

Use curly braces in dialogue for dynamic text:

- {player_name} - Player's chosen name

- {target_name} - Target character's name

- {player_gender} - Player's gender (male/female)

- {target_gender} - Target's gender (male/female)

Example Story JSON

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "arc_name": "prologue",

  "scenes": [

    {

      "commands": [

        {

          "type": "background",

          "image": "school_morning",

          "transition": "fade"

        },

        {

          "type": "dialogue",

          "speaker": "{player_name}",

          "text": "A new day begins..."

        }

      ]

    }

  ]

}

Mini-Game Integration

The engine supports 6 mini-games that can be launched inline during story playback:

- Egg Catcher - Catch falling eggs in a basket

- Memory Match - Classic card matching game

- PvP - Player vs Player competitive game

- Space Shooter - Arcade-style space shooter

- Racing - Racing game

- FlyMe2TheMoon - Flying game

Launching a Mini-Game

In your story JSON:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "minigame",

  "game": "egg_catcher",

  "onComplete": "after_egg_catcher"

}

Mini-Game Results

After a mini-game completes, the following variables are available:

- last_minigame_score - The score achieved

- minigame_results['game_name'] - Stored result for specific game

Save/Load System

The game features a complete save/load system:

- Multiple save slots (10 slots available)

- Saves current position, variables, and mini-game results

- Auto-save on quit

- Quick save/load with keyboard shortcuts (F5/F9)

Adding New Story Arcs

- Create a new JSON file in game/story/ (e.g., chapter1.json)

- Define your story commands following the format

- Add a jump command to transition between arcs

- Register the arc in script.rpy if needed

Building for Distribution

Desktop (Windows/Mac/Linux)

- Open Ren'Py Launcher

- Select "HoaiNiem"

- Click "Build Distributions"

- Choose your target platforms

Web Export

- Click "Build Web" in Ren'Py Launcher

- Upload the generated files to your web server

Android

- Enable Android building in Ren'Py preferences

- Click "Build Android Package"

Keyboard Shortcuts

KeyAction

Space/EnterAdvance dialogue

CtrlSkip mode

F5Quick save

F9Quick load

EscGame menu

HHide dialogue box

SScreenshot

License

This project is proprietary. All rights reserved.

Credits

- Engine: Ren'Py

- Story System: Custom JSON-driven implementation

- Mini-games: Integrated HTML5 games