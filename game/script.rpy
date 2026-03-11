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
            renpy.show(image, at_list=[fade_in_anim])

        # Show character
        elif cmd_type == "show":
            character = command.get("character", "")
            expression = command.get("expression", "neutral")
            position = command.get("position", "center")
            image_name = "characters/" + character + "/" + character + "_" + expression

            if position == "left":
                renpy.show(image_name, at_list=[pos_left, fade_in_anim])
            elif position == "center": 
                renpy.show(image_name, at_list=[pos_center, fade_in_anim])
            elif position == "right":
                renpy.show(image_name, at_list=[pos_right, fade_in_anim])
            else:
                renpy.show(image_name, at_list=[fade_in_anim])

        # Hide character
        elif cmd_type == "hide":
            character = command.get("character", "")
            renpy.hide(f"characters/[character]")

        # Dialogue
        elif cmd_type == "dialogue":
            speaker = command.get("speaker", "")
            text = command.get("text", "")
            speaker = speaker.replace("{player_name}", store.player_name)
            speaker = speaker.replace("{target_name}", store.target_name)
            speaker = speaker.replace("{player_gender}", store.player_gender)
            speaker = speaker.replace("{target_gender}", store.target_gender)

            text = text.replace("{player_name}", store.player_name)
            text = text.replace("{target_name}", store.target_name)
            text = text.replace("{player_gender}", store.player_gender)
            text = text.replace("{target_gender}", store.target_gender)

            renpy.say(None if speaker == "" else speaker, text)


        # Choice
        elif cmd_type == "choice":
            options = command.get("options", [])
            choice_items = []

            # CHANGED: Removed the incorrect redirect that was causing navigation issues
            # The redirect was changing egg_catcher_menu to play_egg_catcher_game
            # but the JSON uses play_egg_catcher_scene which wasn't being handled
            for opt in options:
                text = opt.get("text", "")
                jump_to = opt.get("jump", "")

                text = text.replace("{player_name}", store.player_name)
                text = text.replace("{target_name}", store.target_name)
                text = text.replace("{player_gender}", store.player_gender)
                text = text.replace("{target_gender}", store.target_gender)

                # CHANGED: Store the jump target as-is, no redirect
                # The jump target will be handled by run_story_arc or special labels
            choice_items = [(opt.get("text", ""), opt.get("jump", "")) for opt in options]
            choice_result = renpy.display_menu(choice_items)
            return choice_result

        # Mini-game
        elif cmd_type == "minigame":
            game_name = command.get("game", "")
            on_complete = command.get("onComplete", None)

            # CHANGED: Call the minigame integration screen with proper return handling
            result = renpy.call_screen("minigame_screen", game_name)

            if result == "play":
                # Call the actual Egg Catcher game
                gameplay_label = MINIGAMES.get(game_name, {}).get("renpy_label")
                if gameplay_label:
                    renpy.call(gameplay_label)
                # After finishing, return the on_complete target to continue the story
                if on_complete:
                    return on_complete
            elif result == "quit":
                # Player chose to skip the minigame
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
                    renpy.jump(jump_label)
                    return

        renpy.log("Story arc completed: " + arc_name)


# -----------------------------
# Story Labels
# -----------------------------
label start:
    call screen character_selection
    jump prologue

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
# ADDED: Bridge label for play_egg_catcher_scene
# This label handles the choice from prologue.json and launches the minigame
# -----------------------------
label play_egg_catcher_scene:
    # ADDED: This bridge label connects the JSON choice to the minigame system
    # It calls the minigame screen which handles Play/Quit options
    $ result = renpy.call_screen("minigame_screen", "egg_catcher")
    
    if result == "play":
        # Player chose to play - call the egg catcher game
        call egg_catcher_start
        
    # After minigame completes (or if quit), continue to after_egg_catcher scene
    jump after_egg_catcher


# -----------------------------
# Custom Jump Points
# -----------------------------
label after_egg_catcher:
    # ADDED: This label continues the story after the minigame
    # It runs the remaining prologue scenes starting from the after_egg_catcher scene
    $ run_story_arc("prologue", start_scene=4)
    return