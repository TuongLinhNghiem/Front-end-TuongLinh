# integration_screen.rpy
# General Mini-game Integration Screen

init python:

    def show_minigame(game_name):
        """
        Call the mini-game using the manager.
        Returns 'complete' or 'quit'
        """
        from minigame_manager import play_minigame
        return play_minigame(game_name)

    def get_minigame_details(game_name):
        from minigame_manager import get_minigame_info
        return get_minigame_info(game_name) or {}

# -------------------------------------------------
# General Mini-game Screen
# -------------------------------------------------
screen minigame_screen(game_name):

    zorder 100
    modal True

    $ game_info = get_minigame_details(game_name)

    # Background overlay
    add Solid("#00000088")

    # Title frame
    frame:
        xalign 0.5
        yalign 0.1
        xsize 800
        background "#16213e"
        padding 20

        text (game_info.get("name", "Mini-Game")) size 32 color "#FFFFFF" xalign 0.5

    # Content frame
    frame:
        xalign 0.5
        yalign 0.5
        xsize 800
        ysize 500
        background "#0f3460"
        padding 20

        vbox:
            spacing 20
            xalign 0.5
            yalign 0.5

            text (game_info.get("description", "")) size 24 color "#FFFFFF" xalign 0.5
            text "Controls:" size 20 color "#FFD700" xalign 0.5
            text (game_info.get("controls", "")) size 18 color "#FFFFFF" xalign 0.5

            null height 30

            hbox:
                spacing 30
                xalign 0.5

                textbutton "🎮 Play Game":
                    xsize 200
                    ysize 60
                    text_size 22
                    action Return("play")

                textbutton "❌ Quit":
                    xsize 200
                    ysize 60
                    text_size 22
                    action Return("quit")

    # Footer
    frame:
        xsize 800
        ysize 50
        xalign 0.5
        yalign 0.95
        background "#00000080"

        text "Press ESC or click 'Quit' to exit the mini-game" size 16 color "#FFFFFF" xalign 0.5