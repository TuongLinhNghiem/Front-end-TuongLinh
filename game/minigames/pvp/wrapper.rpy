init python:

    pvp_config = {
        "name": "PvP Battle",
        "description": "Two player competitive mini-game.",
        "controls": "Keyboard",
        "win_condition": "Defeat your opponent",
        "time_limit": 60,
        "scoring": "Victory"
    }

    def play_pvp():
        return play_minigame("pvp")


    def get_pvp_high_score():
        return get_minigame_score("pvp")


    def set_pvp_score(score):
        set_minigame_score("pvp", score)


label play_pvp_game:

    python:
        result = play_pvp()

        if result == "complete":
            renpy.log("PvP game finished")

    return