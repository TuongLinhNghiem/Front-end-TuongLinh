init python:

    space_shooter_config = {
        "name": "Space Shooter",
        "description": "Destroy enemies in space.",
        "controls": "Arrow keys + Space",
        "win_condition": "Survive waves",
        "time_limit": 120,
        "scoring": "Enemies destroyed"
    }

    def play_space_shooter():
        return play_minigame("space_shooter")


    def get_space_shooter_high_score():
        return get_minigame_score("space_shooter")


    def set_space_shooter_score(score):
        set_minigame_score("space_shooter", score)


label play_space_shooter_game:

    python:
        result = play_space_shooter()

        if result == "complete":
            renpy.log("Space Shooter score: " + str(last_minigame_score))

    return