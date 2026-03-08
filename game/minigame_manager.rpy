# minigame_manager.rpy
# Hoai Niem - Mini-Game Manager (Ren'Py version)
# Handles loading and playing embedded Ren'Py mini-games

init python:

    # -----------------------------
    # Mini-game definitions
    # -----------------------------
    MINIGAMES = {
        "egg_catcher": {
            "name": "Egg Catcher",
            "description": "Catch falling eggs in your basket before they hit the ground!",
            "controls": "Use LEFT/RIGHT or A/D to move. SPACE to pause.",
            "renpy_label": "egg_catcher_start",
        },
        "memory_match": {
            "name": "Memory Match",
            "description": "Match pairs of cards to win!",
            "controls": "Click on cards to reveal them.",
            "renpy_label": "memory_match_start",
        },
        "pvp": {
            "name": "PvP Battle",
            "description": "Compete against another player!",
            "controls": "Use arrow keys or WASD to move.",
            "renpy_label": "pvp_start",
        },
        "space_shooter": {
            "name": "Space Shooter",
            "description": "Blast through waves of enemies!",
            "controls": "Use arrow keys to move and SPACE to shoot.",
            "renpy_label": "space_shooter_start",
        },
        "racing": {
            "name": "Racing",
            "description": "Race to the finish line!",
            "controls": "Use arrow keys to steer and accelerate.",
            "renpy_label": "racing_start",
        },
        "flyme2themoon": {
            "name": "Fly Me to the Moon",
            "description": "Fly as high as you can!",
            "controls": "Use arrow keys or WASD to control the rocket.",
            "renpy_label": "flyme2themoon_start",
        }
    }

    # -----------------------------
    # Play mini-game
    # -----------------------------
    def play_minigame(game_name):
        """
        Launch a mini-game by Ren'Py label name.
        """
        game_info = MINIGAMES.get(game_name)
        if not game_info:
            renpy.log("Mini-game not found: " + game_name)
            return "quit"

        label_to_call = game_info.get("renpy_label")
        if label_to_call:
            renpy.call(label_to_call)
            return "complete"
        return "quit"

    # -----------------------------
    # Mini-game score management
    # -----------------------------
    if not hasattr(store, "minigame_results"):
        store.minigame_results = {}

    if not hasattr(store, "last_minigame_score"):
        store.last_minigame_score = 0

    def get_minigame_score(game_name):
        """
        Get the last score for a specific mini-game.
        """
        return store.minigame_results.get(game_name, 0)

    def set_minigame_score(game_name, score):
        """
        Set the score for a specific mini-game.
        """
        store.minigame_results[game_name] = score
        store.last_minigame_score = score

    def has_minigame_been_played(game_name):
        """
        Check if the mini-game has been played.
        """
        return game_name in store.minigame_results

    def get_minigame_info(game_name):
        """
        Get mini-game information dictionary.
        """
        return MINIGAMES.get(game_name)

    def get_all_minigames():
        """
        Return a copy of all mini-games info.
        """
        return MINIGAMES.copy()

# -----------------------------
# Current mini-game variable
# -----------------------------
default minigame_results = {}
default minigame_name = ""