init python:

    racing_config = {
        "name": "Racing",
        "description": "Race to the finish line.",
        "controls": "Arrow keys",
        "win_condition": "Finish first",
        "time_limit": 90,
        "scoring": "Best time"
    }

    def play_racing():
        return play_minigame("racing")


    def get_racing_high_score():
        return get_minigame_score("racing")


    def set_racing_score(score):
        set_minigame_score("racing", score)


label play_racing_game:

    python:
        result = play_racing()

        if result == "complete":
            renpy.log("Racing score: " + str(last_minigame_score))

    return