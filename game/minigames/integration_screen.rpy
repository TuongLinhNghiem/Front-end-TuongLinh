# Integration Screen (Mini-Game Overlay)
# FIXED: Proper return value handling for minigame integration

screen minigame_screen(game_name):

    modal True
    add Solid("#00000088")

    $ game_info = get_minigame_info(game_name) or {}

    frame:
        xalign 0.5
        yalign 0.1
        background "#16213e"

        # CHANGED: padding must be a tuple, not an integer
        padding (20, 20)

        text (game_info.get("name", "Mini-Game")):
            size 32
            color "#FFF"

    frame:
        xalign 0.5
        yalign 0.5
        xsize 800
        ysize 500
        background "#0f3460"

        # CHANGED: padding must be a tuple
        padding (20, 20)

        vbox:
            spacing 20
            xalign 0.5
            yalign 0.5

            text (game_info.get("description", "")):
                size 24
                color "#FFF"

            text "Controls:":
                size 20
                color "#FFD700"

            text (game_info.get("controls", "")):
                size 18
                color "#FFF"

            null height 30

            hbox:
                spacing 30
                xalign 0.5

                # FIXED: Proper Return values for Play/Quit
                textbutton "🎮 Play Game":
                    action Return("play")

                textbutton "❌ Quit":
                    action Return("quit")