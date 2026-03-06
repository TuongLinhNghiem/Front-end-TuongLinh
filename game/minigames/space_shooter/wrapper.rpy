#Space Shooter - Mini-Game Wrapper

#This file integrates the HTML/JS Space Shooter game into Ren'Py

init python:
    # Space Shooter game configuration
    space_shooter_config = {
        "name": "Space Shooter",
        "description": "Blast through waves of enemy ships in this arcade shooter!",
        "controls": "Arrow keys to move, Space to shoot",
        "win_condition": "Survive as long as possible and destroy enemies",
        "enemies": ["Basic Fighter", "Speed Ship", "Heavy Cruiser", "Boss"],
        "scoring": "Destroyed enemies = points"
    }


    def play_space_shooter():
    """
    Launch the Space Shooter mini-game.
    Returns the final score.
    """
    return play_minigame("space_shooter")

    def get_space_shooter_high_score():
    """Get the high score for Space Shooter."""
    return get_minigame_score("space_shooter")

    def set_space_shooter_score(score):
    """Set the Space Shooter score."""
    set_minigame_score("space_shooter", score)

#Story integration label

label play_space_shooter_game:
    python:
        result = play_space_shooter()
        if result == "complete":
            renpy.log("Space Shooter completed with score: " + str(last_minigame_score))


return