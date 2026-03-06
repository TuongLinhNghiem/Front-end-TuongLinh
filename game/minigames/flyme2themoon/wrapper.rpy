#FlyMe2TheMoon - Mini-Game Wrapper

#This file integrates the HTML/JS FlyMe2TheMoon game into Ren'Py

init python:
    # FlyMe2TheMoon game configuration
    flyme2themoon_config = {
        "name": "Fly Me to the Moon",
        "description": "Fly your rocket as high as possible into space!",
        "controls": "Click or press Space to boost your rocket",
        "win_condition": "Reach the highest altitude possible",
        "obstacles": ["Asteroids", "Satellites", "Space debris"],
        "scoring": "Altitude = points"
    }


    def play_flyme2themoon():
    """
    Launch the FlyMe2TheMoon mini-game.
    Returns the final score.
    """
    return play_minigame("flyme2themoon")

    def get_flyme2themoon_high_score():
    """Get the high score for FlyMe2TheMoon."""
    return get_minigame_score("flyme2themoon")

    def set_flyme2themoon_score(score):
    """Set the FlyMe2TheMoon score."""
    set_minigame_score("flyme2themoon", score)

#Story integration label

label play_flyme2themoon_game:
    python:
        result = play_flyme2themoon()
        if result == "complete":
            renpy.log("FlyMe2TheMoon completed with score: " + str(last_minigame_score))


return