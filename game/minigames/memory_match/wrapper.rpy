Memory Match - Mini-Game Wrapper

This file integrates the HTML/JS Memory Match game into Ren'Py

init python:
    # Memory Match game configuration
    memory_match_config = {
        "name": "Memory Match",
        "description": "Find all matching pairs of cards!",
        "controls": "Click on cards to flip them and find matching pairs",
        "win_condition": "Match all pairs with the fewest moves",
        "difficulty_levels": ["Easy (4x3)", "Medium (4x4)", "Hard (6x4)"],
        "scoring": "Fewer moves = higher score"
    }


def play_memory_match():
    """
    Launch the Memory Match mini-game.
    Returns the final score.
    """
    return play_minigame("memory_match")

def get_memory_match_high_score():
    """Get the high score for Memory Match."""
    return get_minigame_score("memory_match")

def set_memory_match_score(score):
    """Set the Memory Match score."""
    set_minigame_score("memory_match", score)

Story integration label

label play_memory_match_game:
    python:
        result = play_memory_match()
        if result == "complete":
            renpy.log("Memory Match completed with score: " + str(last_minigame_score))


return