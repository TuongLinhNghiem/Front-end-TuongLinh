# Hoai Niem - Save/Load System (Updated)
# Comprehensive save game management with JSON story support

init python:
    import json
    import os
    import time

    # -----------------------------
    # Default Variables
    # -----------------------------
    default egg_catcher_leaderboard = []  # temporary leaderboard (top 20)
    default minigame_results = {}  # store other minigame scores

    # -----------------------------
    # Save game data structure
    # -----------------------------
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
                "egg_catcher_leaderboard": getattr(store, "egg_catcher_leaderboard", []),
            }
        }

    # -----------------------------
    # Save / Load Functions
    # -----------------------------
    def save_game(slot_number):
        if not (1 <= slot_number <= 10):
            renpy.log("Invalid save slot: " + str(slot_number))
            return False

        try:
            renpy.save(str(slot_number))
            save_data = get_save_game_data()
            json_path = os.path.join(config.savedir, f"slot_{slot_number}.json")
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, indent=2, ensure_ascii=False)
            renpy.log("Game saved to slot " + str(slot_number))
            return True
        except Exception as e:
            renpy.log("Error saving game: " + str(e))
            return False

    def load_game(slot_number):
        if not (1 <= slot_number <= 10):
            renpy.log("Invalid save slot: " + str(slot_number))
            return False

        try:
            json_path = os.path.join(config.savedir, f"slot_{slot_number}.json")
            if os.path.exists(json_path):
                with open(json_path, 'r', encoding='utf-8') as f:
                    save_data = json.load(f)

                # Restore core variables
                store.player_name = save_data.get("player", {}).get("name", "Player")
                store.player_gender = save_data.get("player", {}).get("gender", "male")
                store.target_name = save_data.get("target", {}).get("name", "Niem")
                store.target_gender = save_data.get("target", {}).get("gender", "female")
                store.current_arc = save_data.get("story", {}).get("arc", "prologue")
                store.current_scene = save_data.get("story", {}).get("scene", 0)
                store.current_dialogue = save_data.get("story", {}).get("dialogue", 0)
                store.minigame_results = save_data.get("minigames", {})

                # Restore additional variables (including leaderboard)
                variables = save_data.get("variables", {})
                for var_name, var_value in variables.items():
                    setattr(store, var_name, var_value)

                renpy.log("Game loaded from slot " + str(slot_number))

            renpy.load(str(slot_number))
            return True
        except Exception as e:
            renpy.log("Error loading game: " + str(e))
            return False

    # -----------------------------
    # Save Slots Info
    # -----------------------------
    def get_save_slots():
        slots = {}
        for i in range(1, 11):
            slot_data = {
                "exists": False,
                "timestamp": None,
                "date": "Empty Slot",
                "arc": None,
                "scene": None,
                "player_name": "Unknown"
            }

            json_path = os.path.join(config.savedir, f"slot_{i}.json")
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

    # -----------------------------
    # Delete Save
    # -----------------------------
    def delete_save(slot_number):
        if not (1 <= slot_number <= 10):
            renpy.log("Invalid save slot: " + str(slot_number))
            return False
        try:
            renpy.unlink_save(str(slot_number))
            json_path = os.path.join(config.savedir, f"slot_{slot_number}.json")
            if os.path.exists(json_path):
                os.remove(json_path)
            renpy.log("Save slot " + str(slot_number) + " deleted")
            return True
        except Exception as e:
            renpy.log("Error deleting save slot: " + str(e))
            return False

    # -----------------------------
    # Quick Save / Load
    # -----------------------------
    def quick_save():
        return save_game(10)

    def quick_load():
        return load_game(10)

    # -----------------------------
    # Save Slot Display Name
    # -----------------------------
    def get_save_game_name(slot_number):
        slots = get_save_slots()
        slot = slots.get(slot_number, {})
        if slot.get("exists", False):
            return "{} - {} (Scene {})".format(slot.get("player_name", "Player"), slot.get("arc", "Unknown"), slot.get("scene", 0))
        else:
            return "Empty Slot"

    # -----------------------------
    # Auto Save
    # -----------------------------
    def auto_save():
        save_game(1)
        renpy.log("Auto-saved game")


# -----------------------------
# Quick Save / Load Shortcuts
# -----------------------------
screen quick_keys():
    key "K_F5" action Function(quick_save)
    key "K_F9" action Function(quick_load)


# -----------------------------
# Auto Save Label
# -----------------------------
label auto_save_point:
    python:
        auto_save()
    return