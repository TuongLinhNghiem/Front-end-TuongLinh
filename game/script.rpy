# Hoai Niem - Main Script
# Story labels, arc loader, and command execution system

init python:
    import json
    import os

    # Story JSON loader
    def load_story_json(arc_name):
        """
        Load a story arc from a JSON file.

        Args:
            arc_name (str): The name of the story arc (without .json extension)

        Returns:
            dict: The story arc data, or None if not found
        """
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


    # Process a single story command
    def process_command(command):
        """
        Execute a single story command.

        Args:
            command (dict): The command to execute

        Returns:
            str or None: Label to jump to, or None to continue
        """
        cmd_type = command.get("type", "")

        # Background change
        if cmd_type == "background":
            image = command.get("image", "black")
            transition = command.get("transition", "fade")

            if transition in ["fade", "dissolve"]:
                renpy.scene()
                renpy.show(image)
                renpy.transition(dissolve)
                renpy.pause(0.0)
            else:
                renpy.scene()
                renpy.show(image)

        # Show character
        elif cmd_type == "show":
            character = command.get("character", "")
            expression = command.get("expression", "neutral")
            position = command.get("position", "center")

            image_name = "characters/" + character + "/" + character + "_" + expression

            if position == "left":
                renpy.show(image_name, at_list=[pos_left, dissolve])
            elif position == "center":
                renpy.show(image_name, at_list=[pos_center, dissolve])
            elif position == "right":
                renpy.show(image_name, at_list=[pos_right, dissolve])
            else:
                renpy.show(image_name, at_list=[dissolve])

        # Hide character
        elif cmd_type == "hide":
            character = command.get("character", "")
            image_name = "characters/" + character
            renpy.hide(image_name)

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

            renpy.say(speaker, text)

        # Choice
        elif cmd_type == "choice":
            options = command.get("options", [])
            choice_items = []

            for opt in options:
                text = opt.get("text", "")
                jump_to = opt.get("jump", "")

                text = text.replace("{player_name}", store.player_name)
                text = text.replace("{target_name}", store.target_name)
                text = text.replace("{player_gender}", store.player_gender)
                text = text.replace("{target_gender}", store.target_gender)

                choice_items.append((text, jump_to))

            choice_result = renpy.display_menu(choice_items)
            return choice_result

        # Mini-game
        elif cmd_type == "minigame":
            game_name = command.get("game", "")
            on_complete = command.get("onComplete", None)

            result = play_minigame(game_name)

            if result == "complete" and on_complete:
                return on_complete

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
            transition = command.get("transition", "fade")

            if transition == "fade":
                renpy.scene()
                renpy.with_statement(Fade(0.5, 0.0, 0.5))
            else:
                renpy.scene()

        return None


    # Run a story arc
    def run_story_arc(arc_name, start_scene=0):
        """
        Run a complete story arc from a JSON file.

        Args:
            arc_name (str): The name of the story arc
            start_scene (int): The scene index to start from (default: 0)
        """
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


###############################################################################
# GAME START - Character Selection
###############################################################################

label start:
    call screen character_selection
    return


###############################################################################
# PROLOGUE
###############################################################################

label prologue:
    python:
        run_story_arc("prologue")
    return


###############################################################################
# ADDITIONAL STORY ARCS (Templates)
###############################################################################

label chapter1:
    python:
        run_story_arc("chapter1")
    return


label chapter2:
    python:
        run_story_arc("chapter2")
    return


label epilogue:
    python:
        run_story_arc("epilogue")
    return


###############################################################################
# CUSTOM JUMP POINTS (Used by story choices)
###############################################################################

label after_egg_catcher:
    python:
        run_story_arc("prologue", start_scene=2)
    return


label bad_ending:
    scene black
    "Bad Ending"
    "You made choices that led to an unhappy ending."
    return


label good_ending:
    scene black
    "Good Ending"
    "Congratulations! You reached the good ending."
    return