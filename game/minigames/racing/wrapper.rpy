Racing - Mini-Game Wrapper

This file integrates the HTML/JS Racing game into Ren'Py

init python:
    # Racing game configuration
    racing_config = {
        "name": "Racing",
        "description": "Race to the finish line in this high-speed racing game!",
        "controls": "Arrow keys or WASD to control the car",
        "win_condition": "Cross the finish line first",
        "tracks": ["City Circuit", "Mountain Road", "Desert Highway", "Ocean Drive"],
        "scoring": "Best time is recorded"
    }


def play_racing():
    """
    Launch the Racing mini-game.
    Returns the final time/score.
    """
    return play_minigame("racing")

def get_racing_best_time():
    """Get the best racing time."""
    return get_minigame_score("racing")

def set_racing_result(result):
    """Set the Racing result."""
    set_minigame_score("racing", result)

Story integration label

label play_racing_game:
    python:
        result = play_racing()
        if result == "complete":
            renpy.log("Racing completed with result: " + str(last_minigame_score))


return