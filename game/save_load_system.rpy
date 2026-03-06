#Hoai Niem - Save/Load System

#Comprehensive save game management with JSON story support

init python:
    import json
    import os
    import time


# Save game data structure
def get_save_game_data():
    """
    Get the current game state for saving.

    Returns:
        dict: Current game state
    """
    return {
        "version": config.version,
        "timestamp": time.time(),
        "date": time.strftime("%Y-%m-%d %H:%M:%S"),
        "player": {
            "name": store.player_name,
            "gender": store.player_gender
        },
        "target": {
            "name": store.target_name,
            "gender": store.target_gender
        },
        "story": {
            "arc": store.current_arc,
            "scene": store.current_scene,
            "dialogue": store.current_dialogue
        },
        "minigames": store.minigame_results.copy(),
        "variables": {
            "bond_level": getattr(store, "bond_level", 0),
            "has_tried_curry": getattr(store, "has_tried_curry", False),
        }
    }

def save_game(slot_number):
    """
    Save the current game state to a slot.

    Args:
        slot_number (int): The save slot number (1-10)

    Returns:
        bool: True if successful, False otherwise
    """
    if not (1 <= slot_number <= 10):
        renpy.log("Invalid save slot: " + str(slot_number))
        return False

    try:
        # Use Ren'Py's built-in save system
        renpy.save(str(slot_number))

        # Save additional data to JSON
        save_data = get_save_game_data()
        json_path = os.path.join(config.savedir, "slot_" + str(slot_number) + ".json")

        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(save_data, f, indent=2, ensure_ascii=False)

        renpy.log("Game saved to slot " + str(slot_number))
        return True

    except Exception as e:
        renpy.log("Error saving game: " + str(e))
        return False

def load_game(slot_number):
    """
    Load a game state from a slot.

    Args:
        slot_number (int): The save slot number (1-10)

    Returns:
        bool: True if successful, False otherwise
    """
    if not (1 <= slot_number <= 10):
        renpy.log("Invalid save slot: " + str(slot_number))
        return False

    try:
        # Load JSON data
        json_path = os.path.join(config.savedir, "slot_" + str(slot_number) + ".json")

        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                save_data = json.load(f)

            # Restore variables
            store.player_name = save_data.get("player", {}).get("name", "Player")
            store.player_gender = save_data.get("player", {}).get("gender", "male")
            store.target_name = save_data.get("target", {}).get("name", "Niem")
            store.target_gender = save_data.get("target", {}).get("gender", "female")
            store.current_arc = save_data.get("story", {}).get("arc", "prologue")
            store.current_scene = save_data.get("story", {}).get("scene", 0)
            store.current_dialogue = save_data.get("story", {}).get("dialogue", 0)
            store.minigame_results = save_data.get("minigames", {})

            # Restore additional variables
            variables = save_data.get("variables", {})
            for var_name, var_value in variables.items():
                setattr(store, var_name, var_value)

            renpy.log("Game loaded from slot " + str(slot_number))

        # Use Ren'Py's built-in load system
        renpy.load(str(slot_number))
        return True

    except Exception as e:
        renpy.log("Error loading game: " + str(e))
        return False

def get_save_slots():
    """
    Get information about all save slots.

    Returns:
        dict: Information about each slot (1-10)
    """
    slots = {}

    for i in range(1, 11):
        slot_data = {
            "exists": False,
            "timestamp": None,
            "date": "Empty Slot",
            "arc": None,
            "scene": None
        }

        json_path = os.path.join(config.savedir, "slot_" + str(i) + ".json")

        if os.path.exists(json_path):
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    save_data = json.load(f)

                slot_data["exists"] = True
                slot_data["timestamp"] = save_data.get("timestamp", 0)
                slot_data["date"] = save_data.get("date", "Unknown")
                slot_data["arc"] = save_data.get("story", {}).get("arc", None)
                slot_data["scene"] = save_data.get("story", {}).get("scene", None)
                slot_data["player_name"] = save_data.get("player", {}).get("name", "Unknown")

            except Exception as e:
                renpy.log("Error reading save slot " + str(i) + ": " + str(e))

        slots[i] = slot_data

    return slots

def delete_save(slot_number):
    """
    Delete a save slot.

    Args:
        slot_number (int): The save slot number (1-10)

    Returns:
        bool: True if successful, False otherwise
    """
    if not (1 <= slot_number <= 10):
        renpy.log("Invalid save slot: " + str(slot_number))
        return False

    try:
        # Delete Ren'Py save file
        renpy.unlink_save(str(slot_number))

        # Delete JSON data
        json_path = os.path.join(config.savedir, "slot_" + str(slot_number) + ".json")
        if os.path.exists(json_path):
            os.remove(json_path)

        renpy.log("Save slot " + str(slot_number) + " deleted")
        return True

    except Exception as e:
        renpy.log("Error deleting save slot: " + str(e))
        return False

def quick_save():
    """
    Quick save to the quick save slot.
    Uses slot 10 for quick saves.
    """
    return save_game(10)

def quick_load():
    """
    Quick load from the quick save slot.
    Uses slot 10 for quick saves.
    """
    return load_game(10)

def get_save_game_name(slot_number):
    """
    Get a display name for a save slot.

    Args:
        slot_number (int): The save slot number

    Returns:
        str: Display name for the save slot
    """
    slots = get_save_slots()
    slot = slots.get(slot_number, {})

    if slot.get("exists", False):
        player_name = slot.get("player_name", "Player")
        arc = slot.get("arc", "Unknown")
        scene = slot.get("scene", 0)
        return "{} - {} (Scene {})".format(player_name, arc, scene)
    else:
        return "Empty Slot"

def auto_save():
    """
    Automatically save the game.
    Called at key story points.
    """
    save_game(1)  # Use slot 1 for auto-save
    renpy.log("Auto-saved game")

Quick save/load keyboard shortcuts

init:
    key "K_F5":
        action Function(quick_save)


key "K_F9":
    action Function(quick_load)

Auto-save at important points

label auto_save_point:
    python:
        auto_save()
    return