Hoai Niem - Quick Start Guide

Get your Visual Novel engine up and running in minutes!

Setup Instructions

1. Install Prerequisites

- Visual Studio Code - Download from code.visualstudio.com

- Live Server Extension - Install in VS Code:

- Open VS Code

- Go to Extensions (Ctrl+Shift+X)

- Search for "Live Server"

- Click "Install"

2. Open the Project

- Download or clone the Hoai Niem project

- Open the project folder in Visual Studio Code

- Right-click on index.html in the file explorer

- Select "Open with Live Server"

3. Start Playing

The game will open in your default browser. You can now:

- Choose your character (Hoai or Niem)

- Follow the prologue story

- Make choices to branch the story

- Launch mini-games

- Save and load your progress

Testing the Engine

Test Scenario 1: Basic Story Flow

- Select "Play as Hoai"

- Read through the dialogue

- Click to advance

- Make a choice

- Observe the story branch

Test Scenario 2: Mini-Game Integration

- Select "Play as Niem"

- Choose "Play a game together"

- Click "Complete Game" in the mini-game

- Return to the story

- Observe the story continues

Test Scenario 3: Save/Load System

- Play through some dialogue

- Click the menu button (☰)

- Select "Save Game"

- Choose a save slot

- Refresh the page

- Click the menu button

- Select "Load Game"

- Load your save

- Verify you're at the same point

Customizing Your Story

Quick Edit: Change Dialogue

- Open story/prologue.json

- Find a dialogue command

- Change the text field

- Save the file

- Refresh your browser

- See your changes!

Example:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "dialogue",

  "speaker": "Hoai",

  "text": "Your custom dialogue here!"

}

Quick Edit: Add a Choice

- Open story/prologue.json

- Find a choice command

- Add a new option

- Save and refresh

Example:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "choice",

  "prompt": "What do you want to do?",

  "options": [

    {"text": "Option 1", "jump": "scene_01"},

    {"text": "Option 2", "jump": "scene_02"},

    {"text": "Your new option", "jump": "scene_03"}

  ]

}

Adding Your Own Assets

Add a Background

- Place your image in assets/backgrounds/

- Name it (e.g., my_background.jpg)

- Reference it in story JSON:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "background",

  "image": "assets/backgrounds/my_background.jpg"

}

Add a Character Sprite

- Create folder in assets/characters/ (e.g., mycharacter/)

- Add sprite images (e.g., smile.png)

- Reference in story JSON:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "character",

  "action": "show",

  "name": "mycharacter",

  "sprite": "assets/characters/mycharacter/smile.png",

  "position": "center"

}

Common Tasks

Create a New Story Arc

- Copy story/prologue.json

- Rename to story/my_arc.json

- Edit the content

- Jump to it from another arc:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "jump",

  "target": "my_arc",

  "scene": "scene_01"

}

Integrate Your Mini-Game

- Create folder in minigames/ (e.g., my_game/)

- Add your index.html and game files

- Add communication code (see MINIGAME_API.md)

- Launch from story:

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

{

  "type": "minigame",

  "game": "my_game",

  "onComplete": "scene_after_game"

}

Troubleshooting

Game Won't Start

- Ensure you're using Live Server (not just opening the file)

- Check browser console for errors (F12)

- Verify all files are in the correct folders

Images Not Showing

- Check file paths in JSON files

- Ensure images exist in the assets folder

- Verify image formats (JPG, PNG)

Mini-Game Not Loading

- Check mini-game folder name matches JSON reference

- Ensure index.html exists in the mini-game folder

- Test mini-game independently first

Save/Load Not Working

- Check browser supports LocalStorage

- Try a different browser

- Clear browser cache and try again

Next Steps

- Read README.md for full documentation

- Check INTEGRATION_GUIDE.md for detailed customization

- See MINIGAME_API.md for game integration

- Start writing your story!

Support

For detailed information:

- README.md - Complete engine overview

- INTEGRATION_GUIDE.md - Adding content

- MINIGAME_API.md - Game integration

- story/prologue.json - Example story with all commands

Happy storytelling! 🎮✨