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
default eggs = []  # list of dicts: {"x","y","type"}
default score = 0
default lives = 3
default caught = 0
default level = 1
default egg_speed = 3
default spawn_rate = 1.5  # seconds
default game_running = True
default paused = False
default last_spawn = 0.0
default score_popups = []  # each popup: {"text","x","y","start_time","class"}

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

        current_time = renpy.get_time()

        # --- Spawn eggs ---
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

        # --- Move eggs ---
        new_eggs = []
        for e in eggs:
            e['y'] += egg_speed
            # Basket collision
            if 500 <= e['y']+40 <= 500+basket_height:
                if basket_x < e['x']+30 and basket_x + basket_width > e['x']:
                    # Caught
                    if e['type']=="normal":
                        score += 10
                        caught +=1
                        add_score_popup("+10", e['x'], e['y'], "positive")
                    elif e['type']=="golden":
                        score +=50
                        caught +=1
                        add_score_popup("+50", e['x'], e['y'], "positive")
                    elif e['type']=="broken":
                        score = max(0, score-20)
                        lives -=1
                        add_score_popup("-20", e['x'], e['y'], "negative")
                    continue
            # Missed bottom
            if e['y'] >= 600:
                if e['type']=="normal" or e['type']=="golden":
                    lives -=1
                continue
            new_eggs.append(e)
        eggs = new_eggs

        # --- Level up ---
        if caught >= level*15:
            level +=1
            egg_speed = min(6, egg_speed+0.5)
            spawn_rate = max(0.8, spawn_rate-0.1)

        # --- Remove expired popups ---
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

    default particles = [ (renpy.random.randint(0, 800), renpy.random.randint(0, 600), renpy.random.uniform(2,5), renpy.random.uniform(0,2)) for i in range(50) ]

    # Background
    add Solid("#fff0") at Transform(xalign=0.5, yalign=0.5)

    # Particles layer
    for i, (px, py, zoom, delay) in enumerate(particles):
        add Solid("#ffffff") at Transform(x=px, y=py, zoom=zoom/5, ypos=py, linear=6, yoffset=-20, repeat=True, delay=delay)

    # Content
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
            textbutton "🎮 START GAME" text_size 40 action [Hide("egg_catcher_menu"), Call("play_egg_catcher_game")]
            textbutton "🏠 GO HOME" text_size 40 action Return()

# -----------------------------
# Game Screen
# -----------------------------
screen egg_catcher_game():

    key "K_LEFT" action SetScreenVariable("basket_x", max(basket_x-15,0))
    key "K_RIGHT" action SetScreenVariable("basket_x", min(basket_x+800-basket_width,800))
    key "K_a" action SetScreenVariable("basket_x", max(basket_x-15,0))
    key "K_d" action SetScreenVariable("basket_x", min(basket_x+800-basket_width,800))
    key "K_SPACE" action SetScreenVariable("paused", not paused)

    timer 0.016 repeat True action Function(lambda: egg_catcher_update())

    # Background
    add Solid("#87CEEB")

    # Clouds
    for i in range(5):
        add Solid("#FFFFFF") at Transform(x=random.randint(0,700), y=random.randint(50,200), zoom=random.uniform(0.3,0.6), linear=20, xoffset=900, repeat=True)

    # Eggs
    for e in eggs:
        if e['type'] == 'normal':
            add Solid("#FFFFFF") at Transform(x=e['x'], y=e['y'], xanchor=0, yanchor=0, zoom=0.4)
        elif e['type'] == 'golden':
            add Solid("#FFD700") at Transform(x=e['x'], y=e['y'], xanchor=0, yanchor=0, zoom=0.4)
        elif e['type'] == 'broken':
            add Solid("#8B4513") at Transform(x=e['x'], y=e['y'], xanchor=0, yanchor=0, zoom=0.4)

    # Basket
    add Solid("#8B4513") at Transform(x=basket_x, y=500, zoom=(basket_width/80, basket_height/40))

    # Score popups
    for popup in score_popups:
        $ elapsed = renpy.get_time() - popup["start_time"]
        $ y_pos = popup["y"] - 50 * elapsed
        $ alpha_val = max(0, 1 - elapsed)
        text popup["text"] color ("#00FF00" if popup["class"]=="positive" else "#FF0000") size 30 at Transform(x=popup["x"], y=y_pos, alpha=alpha_val)

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

    # Pause overlay
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
            textbutton "🔄 Play Again" action [SetScreenVariable("score",0), SetScreenVariable("lives",3), SetScreenVariable("caught",0), SetScreenVariable("level",1), SetScreenVariable("egg_speed",3), SetScreenVariable("eggs",[]), SetScreenVariable("game_running",True)]
            textbutton "🏠 Main Menu" action Return()

# -----------------------------
# Label to play game
# -----------------------------
label play_egg_catcher_game:
    call screen egg_catcher_game
    "You finished the Egg Catcher game! Final Score: [score]"
    return

# -----------------------------
# Label to open menu
# -----------------------------
label egg_catcher_start:
    call screen egg_catcher_menu
    return