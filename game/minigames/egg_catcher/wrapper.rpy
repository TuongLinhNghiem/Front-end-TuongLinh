init python:

    egg_catcher_config = {
        "name": "Egg Catcher",
        "description": "Catch falling eggs in your basket before they hit the ground!",
        "controls": "Use LEFT and RIGHT arrow keys or mouse to move the basket",
        "win_condition": "Catch as many eggs as possible before time runs out",
        "time_limit": 60,
        "scoring": "Each egg = 10 points"
    }

    def play_egg_catcher():
        """
        Launch the Egg Catcher mini-game.
        Returns the final score.
        """
        return play_minigame("egg_catcher")

    def get_egg_catcher_high_score():
        """Get the high score for Egg Catcher."""
        return get_minigame_score("egg_catcher")

    def set_egg_catcher_score(score):
        """Set the Egg Catcher score."""
        set_minigame_score("egg_catcher", score)


label play_egg_catcher_game:

    python:
        result = play_egg_catcher()

        if result == "complete":
            renpy.log("Egg Catcher completed with score: " + str(last_minigame_score))

    return