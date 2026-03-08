# Hoai Niem - Main Script (Updated)
# Story labels, arc loader, and command execution system

init python:
    import json
    import os

    # Story JSON loader
    def load_story_json(arc_name):
        file_path = os.path.join(config.basedir, "game", "story", arc_name + ".json")
        if not os.path.exists(file_path):
            renpy.log("Story file not found: " + file_path)
            return None
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                story_data = json.load(f)
            return story_data
        except Exception as e:
            renpy.log("Error loading story JSON: " + str(e))
            return None

    # -----------------------------
    # Process a single story command
    # -----------------------------
    old_process_command = None  # placeholder for override

    def process_command(command):
        global old_process_command
        if old_process_command is None:
            old_process_command = _process_command_inner
        return _process_command_inner(command)

    def _process_command_inner(command):
        cmd_type = command.get("type", "")

        # Background change
        if cmd_type == "background":
            image = command.get("image", "black")
            renpy.scene()
            renpy.show(image)

        # Show character
        elif cmd_type == "show":
            character = command.get("character", "")
            expression = command.get("expression", "neutral")
            position = command.get("position", "center")
            image_name = f"characters/{character}/{character}_{expression}"
            renpy.show(image_name)

        # Hide character
        elif cmd_type == "hide":
            character = command.get("character", "")
            renpy.hide(f"characters/{character}")

        # Dialogue
        elif cmd_type == "dialogue":
            speaker = command.get("speaker", "")
            text = command.get("text", "")
            renpy.say(None if speaker == "" else speaker, text)

        # Choice
        elif cmd_type == "choice":
            options = command.get("options", [])
            # Redirect Egg Catcher choice to correct label
            for opt in options:
                jump_to = opt.get("jump", "")
                if jump_to == "egg_catcher_menu":
                    opt["jump"] = "play_egg_catcher_game"
            choice_items = [(opt.get("text", ""), opt.get("jump", "")) for opt in options]
            choice_result = renpy.display_menu(choice_items)
            return choice_result

        # Mini-game
        elif cmd_type == "minigame":
            game_name = command.get("game", "")
            on_complete = command.get("onComplete", None)

        # Call the integration screen
            result = renpy.call_screen("minigame_screen", game_name)

            if result == "play":
        # Call the actual Egg Catcher game
                renpy.call("play_egg_catcher_game")
        # After finishing, jump to onComplete if specified
                if on_complete:
                    return on_complete
            return None

        # Set variable
        elif cmd_type == "setvar":
            name = command.get("name", "")
            value = command.get("value", "")
            setattr(store, name, value)

        # Jump to another arc
        elif cmd_type == "jump":
            arc = command.get("arc", "")
            return arc

        # Scene clear
        elif cmd_type == "scene":
            renpy.scene()

        return None

    # -----------------------------
    # Run a story arc
    # -----------------------------
    def run_story_arc(arc_name, start_scene=0):
        story_data = load_story_json(arc_name)
        if story_data is None:
            renpy.log("Failed to load story arc: " + arc_name)
            return

        store.current_arc = arc_name
        scenes = story_data.get("scenes", [])

        for scene_idx in range(start_scene, len(scenes)):
            store.current_scene = scene_idx
            scene = scenes[scene_idx]
            commands = scene.get("commands", [])
            for cmd_idx, command in enumerate(commands):
                store.current_dialogue = cmd_idx
                jump_label = process_command(command)
                if jump_label:
                    run_story_arc(jump_label)
                    return

        renpy.log("Story arc completed: " + arc_name)


# -----------------------------
# Story Labels
# -----------------------------
label start:
    call screen character_selection
    return

label prologue:
    $ run_story_arc("prologue")
    return

label chapter1:
    $ run_story_arc("chapter1")
    return

label chapter2:
    $ run_story_arc("chapter2")
    return

label epilogue:
    $ run_story_arc("epilogue")
    return


# -----------------------------
# Custom Jump Points
# -----------------------------
label after_egg_catcher:
    "You finished the mini-game and return to the story!"
    jump story_scene_2

label bad_ending:
    scene black
    "Bad Ending"
    return

label good_ending:
    scene black
    "Good Ending"
    return