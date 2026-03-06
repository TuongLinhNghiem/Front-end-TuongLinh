init python:

    flyme2themoon_config = {
        "name": "Fly Me To The Moon",
        "description": "Control your ship and fly as far as possible.",
        "controls": "Arrow keys to move",
        "win_condition": "Survive as long as possible",
        "time_limit": 60,
        "scoring": "Distance travelled"
    }

    def play_flyme2themoon():
        """
        Launch Fly Me To The Moon mini-game
        """
        return play_minigame("flyme2themoon")


    def get_flyme2themoon_high_score():
        return get_minigame_score("flyme2themoon")


    def set_flyme2themoon_score(score):
        set_minigame_score("flyme2themoon", score)


label play_flyme2themoon_game:

    python:
        result = play_flyme2themoon()

        if result == "complete":
            renpy.log("FlyMe2TheMoon score: " + str(last_minigame_score))

    return