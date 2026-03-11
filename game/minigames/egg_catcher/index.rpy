# Full Egg Catcher mini-game for Ren'Py (8.5+)
# FIXED: Updated for Ren'Py 8.5.2 compatibility and survival time leaderboard

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
# ADDED: Survival time tracking
default game_start_time = 0.0
default survival_time = 0.0

# -----------------------------
# Egg Catcher Mini-game Functions
# -----------------------------

init python:
    import random
    import time

    # Ensure score popups exist
    if 'score_popups' not in globals():
        score_popups = []

    def add_score_popup(text, pos_x, pos_y, popup_class="positive"):
        """
        Adds a popup for scoring or losing points.
        pos_x and pos_y avoid conflicts with Ren'Py reserved x/y in screens.
        """
        global score_popups
        score_popups.append({
            "text": text,
            "x": pos_x,
            "y": pos_y,
            "start_time": time.time(),  # FIXED: Using time.time() instead of renpy.get_time()
            "class": popup_class
        })


    def egg_catcher_update():
        global eggs, basket_x, score, lives, caught, level, egg_speed, spawn_rate, last_spawn, paused, survival_time

        if paused or lives <= 0:
            return

        current_time = time.time()  # FIXED: Using time.time() instead of renpy.get_time()
        
        # ADDED: Update survival time
        survival_time = current_time - store.game_start_time

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
                    continue  # Skip adding to new_eggs, egg caught

            # Missed eggs
            if e["y"] >= 600:
                if e["type"] in ["normal", "golden"]:
                    lives -= 1
                continue  # Skip adding missed eggs

            new_eggs.append(e)

        eggs = new_eggs

        # Level up logic
        if caught >= level * 15:
            level += 1
            egg_speed = min(6, egg_speed + 0.5)
            spawn_rate = max(0.8, spawn_rate - 0.1)

        # Remove old popups after 1 second
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
# Egg Catcher Menu Screen
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
            textbutton "🎮 START GAME" text_size 40 action Return("start")
            textbutton "🏠 GO HOME" text_size 40 action Return("quit")

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
        # FIXED: Using time.time() instead of renpy.get_time()
        $ elapsed = time.time() - popup["start_time"]
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
        # ADDED: Display survival time
        $ display_time = int(survival_time)
        text "Time: [display_time]s"

    # Game Over overlay
    if lives <= 0:
        frame:
            xalign 0.5
            yalign 0.5
            background "#FFFFFFDD"
            padding 50
            has vbox
            spacing 20
            # ADDED: Show survival time in game over
            $ final_time = int(survival_time)
            text "🎯 Game Over!" size 40 xalign 0.5
            text "Survival Time: [final_time] seconds" size 30 xalign 0.5
            text "Score: [score]" size 24 xalign 0.5

            hbox:
                spacing 20
                xalign 0.5
                textbutton "🔄 Play Again" action [
                    SetVariable("score",0),
                    SetVariable("lives",3),
                    SetVariable("caught",0),
                    SetVariable("level",1),
                    SetVariable("egg_speed",3),
                    SetVariable("eggs",[]),
                    SetVariable("survival_time",0.0),
                    SetVariable("game_start_time", time.time()),
                ]
                textbutton "🏠 Back to Story" action Return("story_continue")

# -----------------------------
# Egg Catcher Start Label
# -----------------------------
label egg_catcher_start:
    # ADDED: Initialize game start time for survival tracking
    $ import time
    $ game_start_time = time.time()
    $ survival_time = 0.0
    
    $ result = renpy.call_screen("egg_catcher_menu")  # show menu first

    if result == "start":
        # Call the actual game
        call play_egg_catcher_game

        # After finishing the game (win or lose)
        "You finish playing Egg Catcher!"
        return  # FIXED: Return to caller instead of jumping to after_egg_catcher

    elif result == "quit":
        "You chose not to play."
        return  # FIXED: Return to caller instead of jumping to after_egg_catcher

# -----------------------------
# Play Egg Catcher Label
# -----------------------------
label play_egg_catcher_game:

    $ eggs = []
    $ score = 0
    $ lives = 3
    $ caught = 0
    $ level = 1
    $ survival_time = 0.0
    $ import time
    $ game_start_time = time.time()

    # Call the game screen
    $ result = renpy.call_screen("egg_catcher_game")

    # ADDED: Record survival time to leaderboard (top 20) regardless of win/loss
    # CHANGED: Now records survival_time instead of score
    $ final_survival_time = survival_time
    
    if final_survival_time > 0:
        $ egg_catcher_leaderboard.append({
            "survival_time": final_survival_time,
            "score": score,
            "timestamp": time.time(),
            "date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "player": store.player_name
        })
        # CHANGED: Sort by survival_time (longest first), then by timestamp (earliest first for ties)
        $ egg_catcher_leaderboard.sort(key=lambda x: (-x["survival_time"], x["timestamp"]))
        # Keep only top 20
        $ egg_catcher_leaderboard = egg_catcher_leaderboard[:20]
        
        # ADDED: Show leaderboard after game
        "Your survival time: [final_survival_time] seconds"

    return