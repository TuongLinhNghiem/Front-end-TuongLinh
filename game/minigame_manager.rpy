#Hoai Niem - Mini-Game Manager

#Handles loading and playing embedded mini-games

init python:
    import json
    import os


# Mini-game registry
MINIGAMES = {
    "egg_catcher": {
        "name": "Egg Catcher",
        "description": "Catch falling eggs in your basket!",
        "folder": "egg_catcher",
        "html_file": "index.html"
    },
    "memory_match": {
        "name": "Memory Match",
        "description": "Match pairs of cards to win!",
        "folder": "memory_match",
        "html_file": "index.html"
    },
    "pvp": {
        "name": "PvP Battle",
        "description": "Compete against another player!",
        "folder": "pvp",
        "html_file": "index.html"
    },
    "space_shooter": {
        "name": "Space Shooter",
        "description": "Blast through waves of enemies!",
        "folder": "space_shooter",
        "html_file": "index.html"
    },
    "racing": {
        "name": "Racing",
        "description": "Race to the finish line!",
        "folder": "racing",
        "html_file": "index.html"
    },
    "flyme2themoon": {
        "name": "Fly Me to the Moon",
        "description": "Fly as high as you can!",
        "folder": "flyme2themoon",
        "html_file": "index.html"
    }
}

def play_minigame(game_name):
        """
        Launch a mini-game and pause the VN story flow.

        Args:
            game_name (str): The name of the mini-game to play

        Returns:
            str: Result status ('complete', 'quit', or 'error')
        """
        if game_name not in MINIGAMES:
            renpy.log("Unknown mini-game: " + game_name)
            return "error"

        game_info = MINIGAMES[game_name]

        # Set the current mini-game name for display
        store.minigame_name = game_info["name"]

        # Try to use the enhanced HTML screen if available
        # Fall back to basic overlay if not
        try:
            result = renpy.call_screen("minigame_html_screen", game_name=game_name)
        except:
            result = renpy.call_screen("minigame_overlay")

        # Handle the result
        if result == "complete":
            # Store the result
            store.minigame_results[game_name] = store.last_minigame_score
            renpy.log("Mini-game completed with score: " + str(store.last_minigame_score))
            return "complete"
        else:
            # Player quit the mini-game
            return "quit"

def get_minigame_score(game_name):
    """
    Get the score for a specific mini-game.

    Args:
        game_name (str): The name of the mini-game

    Returns:
        int: The score achieved, or 0 if not found
    """
    return store.minigame_results.get(game_name, 0)

def has_minigame_been_played(game_name):
    """
    Check if a mini-game has been played.

    Args:
        game_name (str): The name of the mini-game

    Returns:
        bool: True if the game has been played, False otherwise
    """
    return game_name in store.minigame_results

def set_minigame_score(game_name, score):
    """
    Set the score for a specific mini-game.

    Args:
        game_name (str): The name of the mini-game
        score (int): The score to set
    """
    store.minigame_results[game_name] = score
    store.last_minigame_score = score

def get_minigame_info(game_name):
    """
    Get information about a mini-game.

    Args:
        game_name (str): The name of the mini-game

    Returns:
        dict: Game information, or None if not found
    """
    return MINIGAMES.get(game_name, None)

def get_all_minigames():
    """
    Get a list of all available mini-games.

    Returns:
        dict: Dictionary of all mini-games
    """
    return MINIGAMES.copy()

# Check if mini-game HTML file exists
def minigame_file_exists(game_name):
    """
    Check if the mini-game HTML file exists.

    Args:
        game_name (str): The name of the mini-game

    Returns:
        bool: True if the file exists, False otherwise
    """
    if game_name not in MINIGAMES:
        return False

    game_info = MINIGAMES[game_name]
    file_path = os.path.join(config.basedir, "game", "minigames", game_info["folder"], game_info["html_file"])

    return os.path.exists(file_path)

# Get mini-game file path
def get_minigame_file_path(game_name):
    """
    Get the file path for a mini-game.

    Args:
        game_name (str): The name of the mini-game

    Returns:
        str: The file path, or None if not found
    """
    if game_name not in MINIGAMES:
        return None

    game_info = MINIGAMES[game_name]
    file_path = os.path.join(config.basedir, "game", "minigames", game_info["folder"], game_info["html_file"])

    if os.path.exists(file_path):
        return file_path
    else:
        return None

#Variable to store current mini-game name for display

default minigame_name = ""