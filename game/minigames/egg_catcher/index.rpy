# Full Egg Catcher mini-game for Ren'Py (8.5+)

init python:
    import random
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
default egg_catcher_leaderboard = []  # Default leaderboard
default minigame_results = {}  # store other minigame scores

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

        current_time = time.time()

        # Spawn eggs
        if current_time - last_spawn > spawn_rate:
            last_spawn = current_time
            r = random.random()
            if r < 0.1:
                e_type = "golden"
            elif r < 0.2:
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
                        add_score_popup("+10", e["x"], e["y"])
                    elif e["type"] == "golden":
                        score += 50
                        caught += 1
                        add_score_popup("+50", e["x"], e["y"])
                    elif e["type"] == "broken":
                        score = max(0, score - 20)
                        lives -= 1
                        add_score_popup("-20", e["x"], e["y"], "negative")
                    continue

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
# Egg Catcher Menu
# -----------------------------
screen egg_catcher_menu():
    frame:
        xalign 0.5
        yalign 0.2
        has vbox
        spacing 15
        text "🥚 EGG CATCHER" size 60 xalign 0.5
        text "Catch the falling eggs!" size 30 xalign 0.5

        hbox:
            spacing 30
            textbutton "🎮 PLAY GAME" action Jump("play_egg_catcher_game")
            textbutton "🏠 QUIT" action Return("quit")

# -----------------------------
# Egg Catcher Game Screen
# -----------------------------
screen egg_catcher_game():
    key "K_LEFT" action SetVariable("basket_x", max(basket_x-15,0))
    key "K_RIGHT" action SetVariable("basket_x", min(basket_x+800-basket_width,800))
    key "K_a" action SetVariable("basket_x", max(basket_x-15,0))
    key "K_d" action SetVariable("basket_x", min(basket_x+800-basket_width,800))
    key "K_SPACE" action SetVariable("paused", not paused)

    timer 0.016 repeat True action Function(egg_catcher_update)

    add Solid("#87CEEB")  # Background

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
        has vbox
        spacing 5
        text "Score: [score]"
        text "Lives: [lives]"

    # Game Over overlay
    if lives <= 0:
        frame:
            xalign 0.5
            yalign 0.5
            background "#FFFFFFDD"
            padding 50
            has vbox
            spacing 20
            text "🎯 Game Over! Final Score: [score]"

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
                textbutton "🏠 Back to Story" action Return("story_continue")

# -----------------------------
# Play Egg Catcher Label
# -----------------------------
label play_egg_catcher_game:

    $ eggs = []
    $ score = 0
    $ lives = 3
    $ caught = 0
    $ level = 1

    # Call the game screen
    $ result = renpy.call_screen("egg_catcher_game")

    # Record to leaderboard (top 20) regardless of win/loss
    if score > 0:
        $ egg_catcher_leaderboard.append({
            "score": score,
            "timestamp": time.time()
        })
        $ egg_catcher_leaderboard.sort(key=lambda x: (-x["score"], x["timestamp"]))
        $ egg_catcher_leaderboard = egg_catcher_leaderboard[:20]

    return