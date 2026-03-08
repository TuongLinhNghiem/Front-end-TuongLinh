# Full Egg Catcher mini-game for Ren'Py (8.5+)

init python:
    import random
    import renpy.exports as renpy
    import time

# -----------------------------
# Game Variables
# -----------------------------
default basket_x = 400
default basket_width = 80
default basket_height = 40
default eggs = []
default score = 0
default lives = 3
default caught = 0
default level = 1
default egg_speed = 3
default spawn_rate = 1.5
default paused = False
default last_spawn = 0.0
default score_popups = []

# -----------------------------
# Functions
# -----------------------------
init python:

    def add_score_popup(text, x, y, popup_class="positive"):
        global score_popups
        score_popups.append({
            "text": text,
            "x": x,
            "y": y,
            "start_time": renpy.get_time(),
            "class": popup_class
        })

    def egg_catcher_update():
        global eggs, basket_x, score, lives, caught, level, egg_speed, spawn_rate, last_spawn

        if paused or lives <= 0:
            return

        import time
        current_time = time.time()

        # Spawn eggs
        if current_time - last_spawn > spawn_rate:
            last_spawn = current_time
            egg_type_rand = random.random()
            if egg_type_rand < 0.1:
                e_type = "golden"
            elif egg_type_rand < 0.2:
                e_type = "broken"
            else:
                e_type = "normal"
            eggs.append({"x": random.randint(0, 770), "y": -40, "type": e_type})

        new_eggs = []

        for e in eggs:
            e["y"] += egg_speed

            # Collision with basket
            if 500 <= e["y"] + 40 <= 500 + basket_height:
                if basket_x < e["x"] + 30 and basket_x + basket_width > e["x"]:
                    if e["type"] == "normal":
                        score += 10
                        caught += 1
                        add_score_popup("+10", e["x"], e["y"], "positive")
                    elif e["type"] == "golden":
                        score += 50
                        caught += 1
                        add_score_popup("+50", e["x"], e["y"], "positive")
                    elif e["type"] == "broken":
                        score = max(0, score - 20)
                        lives -= 1
                        add_score_popup("-20", e["x"], e["y"], "negative")
                    continue

            # Egg falls past bottom
            if e["y"] >= 600:
                if e["type"] in ["normal", "golden"]:
                    lives -= 1
                continue

            new_eggs.append(e)

        eggs = new_eggs

        # Level up
        if caught >= level * 15:
            level += 1
            egg_speed = min(6, egg_speed + 0.5)
            spawn_rate = max(0.8, spawn_rate - 0.1)

        # Remove old popups
        score_popups[:] = [p for p in score_popups if current_time - p["start_time"] < 1.0]

# -----------------------------
# Animations
# -----------------------------
transform BounceAnim:
    ypos 0
    linear 0.4 ypos -10
    linear 0.2 ypos -5
    linear 0.4 ypos 0
    repeat True

transform GlowAnim:
    alpha 1.0
    linear 1.0 alpha 0.6
    linear 1.0 alpha 1.0
    repeat True

transform semi_transparent:
    alpha 0.9

# -----------------------------
# Styles
# -----------------------------
style menu_frame:
    background None
    xpadding 0
    ypadding 0
    spacing 20

# -----------------------------
# Menu Screen
# -----------------------------
screen egg_catcher_menu():
    default particles = [(renpy.random.randint(0,800), renpy.random.randint(0,600), renpy.random.uniform(2,5)) for i in range(50)]
    add Solid("#fff0")

    for px, py, zoom in particles:
        add Solid("#ffffff") at Transform(xpos=px, ypos=py, zoom=zoom/5)

    frame:
        style "menu_frame"
        xalign 0.5
        yalign 0.2
        has vbox
        spacing 15

        text "🥚" size 60 xalign 0.5 at BounceAnim
        text "EGG CATCHER" size 80 color "#FFA500" xalign 0.5 at GlowAnim
        text "Catch the falling eggs and save the day!" size 30 color "#FFA500" xalign 0.5 at semi_transparent

        hbox:
            spacing 30
            textbutton "🎮 START GAME" text_size 40 action Jump("play_egg_catcher_game")
            textbutton "🏠 GO HOME" text_size 40 action Return("quit")

# -----------------------------
# Game Screen
# -----------------------------
screen egg_catcher_game():
    key "K_LEFT" action SetVariable("basket_x", max(basket_x-15,0))
    key "K_RIGHT" action SetVariable("basket_x", min(basket_x+800-basket_width,800))
    key "K_a" action SetVariable("basket_x", max(basket_x-15,0))
    key "K_d" action SetVariable("basket_x", min(basket_x+800-basket_width,800))
    key "K_SPACE" action SetVariable("paused", not paused)

    timer 0.016 repeat True action Function(egg_catcher_update)

    add Solid("#87CEEB")

    # Clouds
    for i in range(5):
        add Solid("#FFFFFF") at Transform(xpos=100*i + 50, ypos=100 + i*20, zoom=0.4)

    # Eggs
    for e in eggs:
        $ color = "#FFFFFF"
        if e["type"] == "golden":
            $ color = "#FFD700"
        elif e["type"] == "broken":
            $ color = "#8B4513"
        add Solid(color) at Transform(xpos=e["x"], ypos=e["y"], xzoom=0.4, yzoom=0.4)

    # Basket
    add Solid("#8B4513") at Transform(xpos=basket_x, ypos=500, xzoom=basket_width/80, yzoom=basket_height/40)

    # Score popups
    for popup in score_popups:
        $ elapsed = renpy.get_time() - popup["start_time"]
        $ y_pos = popup["y"] - 50 * elapsed
        $ alpha_val = max(0, 1 - elapsed)
        text popup["text"] size 30 color ("#00FF00" if popup["class"]=="positive" else "#FF0000") at Transform(xpos=popup["x"], ypos=y_pos, alpha=alpha_val)

    # HUD
    frame:
        xalign 0.0
        yalign 0.0
        xpadding 10
        ypadding 10
        has vbox
        spacing 5
        text "🏆 Score: [score]"
        text "❤️ Lives: [lives]"
        text "🥚 Caught: [caught]"

    frame:
        xalign 1.0
        yalign 0.0
        xpadding 10
        ypadding 10
        has vbox
        spacing 5
        text "Level: [level]"
        text "Speed: [egg_speed]x"

    # Paused overlay
    if paused:
        frame:
            xalign 0.5
            yalign 0.5
            background "#FFFFFFCC"
            padding 50
            has vbox
            spacing 20
            text "⏸️ Game Paused"
            text "Press SPACE to continue"

    # Game Over overlay
    if lives <= 0:
        frame:
            xalign 0.5
            yalign 0.5
            background "#FFFFFFDD"
            padding 50
            has vbox
            spacing 20
            text "🎯 Game Over!"
            text "Final Score: [score]"
            text "Eggs Caught: [caught]"
            text "Level Reached: [level]"

            hbox:
                spacing 20
                xalign 0.5
                textbutton "🔄 Play Again" action [
                    SetVariable("score",0),
                    SetVariable("lives",3),
                    SetVariable("caught",0),
                    SetVariable("level",1),
                    SetVariable("egg_speed",3),
                    SetVariable("eggs",[])
                ]
                textbutton "🏠 Back to Menu" action Return("quit")

# -----------------------------
# Single Fixed Label to Play Mini-Game
# -----------------------------
label play_egg_catcher_game:

    $ eggs = []
    $ score = 0
    $ lives = 3
    $ caught = 0
    $ level = 1

    # Call the Egg Catcher Game Screen
    $ result = call screen egg_catcher_game

    # Set last minigame score
    $ store.last_minigame_score = score

    # Return to menu or story depending on result
    if result == "quit":
        jump egg_catcher_menu
    else:
        return