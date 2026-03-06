init python:

    memory_match_config = {
        "name": "Memory Match",
        "description": "Match pairs of cards.",
        "controls": "Mouse click",
        "win_condition": "Match all pairs",
        "time_limit": 120,
        "scoring": "Speed and accuracy"
    }

    def play_memory_match():
        return play_minigame("memory_match")


    def get_memory_match_high_score():
        return get_minigame_score("memory_match")


    def set_memory_match_score(score):
        set_minigame_score("memory_match", score)


label play_memory_match_game:

    python:
        result = play_memory_match()

        if result == "complete":
            renpy.log("Memory Match score: " + str(last_minigame_score))

    return