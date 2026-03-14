# Full Egg Catcher mini-game for Ren'Py (8.5+)
# IMPROVED: UI/UX redesign based on HTML reference
# - Better visual design with gradient backgrounds
# - Proper basket and egg sizing for 1280x720
# - Fixed collision detection matching visual size
# - Clean HUD with lives, time, and score
# - Smooth animations and effects

# -----------------------------
# Game Variables
# -----------------------------
default basket_x = 600
default basket_width = 80
default basket_height = 40
default eggs = []
default score = 0
default lives = 3
default caught = 0
default level = 1
default egg_speed = 3.0
default spawn_rate = 1.5
default paused = False
default last_spawn = 0.0
default score_popups = []
default egg_catcher_leaderboard = []
# Survival time tracking
default game_start_time = 0.0
default survival_time = 0.0
default move_left = False
default move_right = False

# -----------------------------
# Egg Catcher Mini-game Functions
# -----------------------------

init python:
    import random
    import time

    # Game constants - IMPROVED: Proper sizing for 1280x720
    GAME_WIDTH = 1280
    GAME_HEIGHT = 720
    EGG_WIDTH = 30
    EGG_HEIGHT = 40
    BASKET_WIDTH = 80
    BASKET_HEIGHT = 40
    BASKET_Y = 620  # Position from top
    MOVE_SPEED = 8

    def add_score_popup(text, pos_x, pos_y, popup_class="positive"):
        """
        Adds a popup for scoring or losing points.
        """
        global score_popups
        score_popups.append({
            "text": text,
            "x": pos_x,
            "y": pos_y,
            "start_time": time.time(),
            "class": popup_class
        })

    def egg_catcher_update():
        """
        Main game update function called by timer.
        IMPROVED: Better collision detection matching visual sizes.
        """
        global eggs, basket_x, score, lives, caught, level, egg_speed, spawn_rate, last_spawn, paused, survival_time
        global move_left, move_right

        if paused or lives <= 0:
            return

        current_time = time.time()
        
        # Update survival time
        survival_time = current_time - store.game_start_time

        # --------------------------------
        # Continuous basket movement
        # --------------------------------
        if move_left:
            basket_x = max(0, basket_x - MOVE_SPEED)

        if move_right:
            basket_x = min(GAME_WIDTH - BASKET_WIDTH, basket_x + MOVE_SPEED)

        # Spawn eggs
        if current_time - store.last_spawn > spawn_rate:
            store.last_spawn = current_time
            r = random.random()
            if r < 0.1:
                e_type = "golden"
            elif r < 0.2:
                e_type = "broken"
            else:
                e_type = "normal"
            # IMPROVED: Spawn within game bounds
            spawn_x = random.randint(0, GAME_WIDTH - EGG_WIDTH)
            eggs.append({"x": spawn_x, "y": -EGG_HEIGHT, "type": e_type})

        new_eggs = []

        basket_left = basket_x
        basket_right = basket_x + BASKET_WIDTH
        basket_top = BASKET_Y
        basket_bottom = BASKET_Y + BASKET_HEIGHT

        for e in eggs:
            e["y"] += egg_speed

            # IMPROVED: Accurate collision detection
            # Check if egg bottom is at basket level
            egg_left = e["x"]
            egg_right = e["x"] + EGG_WIDTH
            egg_top = e["y"]
            egg_bottom = e["y"] + EGG_HEIGHT
            
            # --------------------------------
        # Collision detection (AABB overlap)
        # --------------------------------
            collision = (
                egg_bottom >= basket_top and
                egg_top <= basket_bottom and
                egg_right >= basket_left and
                egg_left <= basket_right
            )

            if collision:

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

                continue  # Egg caught, don't add to new_eggs

            # Egg missed - fell below screen
            if egg_top > GAME_HEIGHT:
                if e["type"] in ["normal", "golden"]:
                    lives -= 1
                continue  # Don't add missed eggs

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

transform FloatAnim:
    linear 2.0 yoffset -10
    linear 2.0 yoffset 10
    repeat True

# IMPROVED: Egg falling animation
transform EggFall:
    linear 0.016 yoffset 0

# IMPROVED: Score popup animation
transform ScorePopup(y_start, y_offset):
    ypos y_start
    linear 1.0 ypos y_start - 50 alpha 0

# -----------------------------
# Egg Catcher Menu Screen
# IMPROVED: Better visual design based on HTML reference
# -----------------------------
screen egg_catcher_menu():
    modal True
    
    # Background gradient (sky to grass)
    add Solid("#87CEEB"):
        ysize 360
    add Solid("#98FB98"):
        ypos 360
        ysize 360
    
    # Decorative clouds
    for i in range(3):
        add Solid("#FFFFFF"):
            pos (100 + i * 400, 50 + (i % 2) * 30)
            xsize 120
            ysize 50
            alpha 0.8
    
    # Title area
    vbox:
        xalign 0.5
        yalign 0.3
        spacing 15
        
        text "🥚" size 80 xalign 0.5 at BounceAnim
        text "EGG CATCHER" size 72 color "#FFA500" xalign 0.5 bold True at GlowAnim
        text "Catch the falling eggs and save the day!" size 28 color "#8B4513" xalign 0.5
    
    # Menu buttons
    hbox:
        xalign 0.5
        yalign 0.65
        spacing 40
        
        # Play button
        button:
            xsize 200
            ysize 60
            background Solid("#1e3c72")
            hover_background Solid("#2a5298")
            
            action Return("start")
            
            text "🎮 START GAME" size 24 color "#FFFFFF" xalign 0.5 yalign 0.5
        
        # Quit button
        button:
            xsize 200
            ysize 60
            background Solid("#1e3c72")
            hover_background Solid("#2a5298")
            
            action Return("quit")
            
            text "🏠 GO HOME" size 24 color "#FFFFFF" xalign 0.5 yalign 0.5
    
    # Instructions
    text "Controls: ← → or A/D to move | SPACE to pause":
        size 18
        color "#8B4513"
        xalign 0.5
        yalign 0.9

# -----------------------------
# Egg Catcher Game Screen
# IMPROVED: Better layout, collision, and visuals
# -----------------------------
screen egg_catcher_game():
    # Keyboard controls
    # Left movement
    key "keydown_K_LEFT" action SetVariable("move_left", True)
    key "keyup_K_LEFT" action SetVariable("move_left", False)

    # Right movement
    key "keydown_K_RIGHT" action SetVariable("move_right", True)
    key "keyup_K_RIGHT" action SetVariable("move_right", False)

    # Optional WASD
    key "keydown_K_a" action SetVariable("move_left", True)
    key "keyup_K_a" action SetVariable("move_left", False)

    key "keydown_K_d" action SetVariable("move_right", True)
    key "keyup_K_d" action SetVariable("move_right", False)
    key "K_SPACE" action SetVariable("paused", not paused)
    
    # Game update timer
    timer 0.016 repeat True action [Function(egg_catcher_update), renpy.restart_interaction]
    
    # Background - gradient sky to grass (like HTML)
    add Solid("#87CEEB"):  # Sky blue
        ysize 500
    add Solid("#98FB98"):  # Light green grass
        ypos 500
        ysize 220
    
    # Decorative clouds
    for i in range(3):
        add Solid("#FFFFFF"):
            pos (80 + i * 450, 30 + (i % 2) * 20)
            xsize 150
            ysize 50
            alpha 0.8
    
    # IMPROVED: Falling eggs with proper sizing
    for e in eggs:
        if e["type"] == "normal":
            # White egg
            add Solid("#FFFFFF"):
                pos (e["x"], e["y"])
                xsize EGG_WIDTH
                ysize EGG_HEIGHT
                
        elif e["type"] == "golden":
            # Golden egg with glow effect
            add Solid("#FFD700"):
                pos (e["x"], e["y"])
                xsize EGG_WIDTH
                ysize EGG_HEIGHT
                
                additive 0.3
            add Solid("#FFA500"):
                pos (e["x"], e["y"])
                xsize EGG_WIDTH
                ysize EGG_HEIGHT
                
        elif e["type"] == "broken":
            # Brown broken egg
            add Solid("#8B4513"):
                pos (e["x"], e["y"])
                xsize EGG_WIDTH
                ysize EGG_HEIGHT
                
    
    # IMPROVED: Basket with proper size and position
    # Main basket body
    add Solid("#8B4513"):
        pos (basket_x, BASKET_Y)
        xsize BASKET_WIDTH
        ysize BASKET_HEIGHT
        
    # Basket rim
    add Solid("#654321"):
        pos (basket_x - 5, BASKET_Y - 5)
        xsize BASKET_WIDTH + 10
        ysize 10
        
    
    # Score popups
    for popup in score_popups:
        $ elapsed = time.time() - popup["start_time"]
        $ y_pos = popup["y"] - 50 * elapsed
        $ alpha_val = max(0, 1 - elapsed)
        $ popup_color = "#00FF00" if popup["class"] == "positive" else "#FF0000"
        text popup["text"]:
            pos (popup["x"], y_pos)
            size 28
            color popup_color
            
            bold True
            at Transform(alpha=alpha_val)
    
    # IMPROVED: HUD - Top left panel
    frame:
        pos (20, 20)
        background Solid("#FFFFFF")
        padding (15, 15)
        
        
        vbox:
            spacing 8
            $ display_time = int(survival_time)
            text "🏆 Score: [score]" size 22 color "#333333" bold True
            text "⏱️ Time: [display_time]s" size 22 color "#333333" bold True
            text "❤️ Lives: [lives]" size 22 color "#FF0000" bold True
            text "🥚 Caught: [caught]" size 22 color "#333333" bold True
    
    # Level indicator - Top right
    frame:
        pos (GAME_WIDTH - 150, 20)
        background Solid("#FFFFFF")
        padding (15, 15)
        
        
        vbox:
            spacing 5
            text "Level [level]" size 24 color "#FFA500" bold True xalign 0.5
            $ speed_display = "{:.1f}x".format(egg_speed)
            text "Speed: [speed_display]" size 18 color "#666666" xalign 0.5
    
    # Controls hint - Bottom right
    frame:
        pos (GAME_WIDTH - 220, GAME_HEIGHT - 60)
        background Solid("#FFFFFF")
        padding (10, 10)
        
        
        text "🎮 ← → or A/D | SPACE pause" size 16 color "#333333"
    
    # Pause overlay
    if paused:
        add Solid("#000000"):
            alpha 0.7
        
        frame:
            xalign 0.5
            yalign 0.5
            background Solid("#FFFFFF")
            padding (40, 40)
            
            
            vbox:
                spacing 20
                text "⏸️ PAUSED" size 48 color "#333333" xalign 0.5 bold True
                text "Press SPACE to continue" size 24 color "#666666" xalign 0.5
                button:
                    xsize 200
                    ysize 50
                    background Solid("#1e3c72")
                    hover_background Solid("#2a5298")
                    
                    action SetVariable("paused", False)
                    
                    text "▶️ Resume" size 22 color "#FFFFFF" xalign 0.5 yalign 0.5
    
    # Game Over overlay
    if lives <= 0:
        add Solid("#000000"):
            alpha 0.7
        
        frame:
            xalign 0.5
            yalign 0.5
            background Solid("#FFFFFF")
            padding (50, 50)
            
            
            vbox:
                spacing 15
                $ final_time = int(survival_time)
                text "🎯 Game Over!" size 48 color "#333333" xalign 0.5 bold True
                text "⏱️ Survival Time: [final_time] seconds" size 28 color "#FFA500" xalign 0.5 bold True
                text "🏆 Score: [score]" size 24 color "#333333" xalign 0.5
                text "🥚 Eggs Caught: [caught]" size 24 color "#333333" xalign 0.5
                text "📊 Level Reached: [level]" size 24 color "#333333" xalign 0.5
                
                null height 20
                
                hbox:
                    spacing 30
                    xalign 0.5
                    
                    # Play Again button
                    button:
                        xsize 180
                        ysize 50
                        background Solid("#1e3c72")
                        hover_background Solid("#2a5298")
                        
                        action [
                            SetVariable("score", 0),
                            SetVariable("lives", 3),
                            SetVariable("caught", 0),
                            SetVariable("level", 1),
                            SetVariable("egg_speed", 3.0),
                            SetVariable("eggs", []),
                            SetVariable("survival_time", 0.0),
                            SetVariable("game_start_time", time.time()),
                            SetVariable("last_spawn", time.time()),
                        ]
                        
                        text "🔄 Play Again" size 20 color "#FFFFFF" xalign 0.5 yalign 0.5
                    
                    # Back to Story button
                    button:
                        xsize 180
                        ysize 50
                        background Solid("#FF6B6B")
                        hover_background Solid("#ee5a24")
                        
                        action Return("story_continue")
                        
                        text "🏠 Back to Story" size 20 color "#FFFFFF" xalign 0.5 yalign 0.5

# -----------------------------
# Egg Catcher Start Label
# -----------------------------
label egg_catcher_start:
    # Initialize game start time for survival tracking
    $ import time
    $ game_start_time = time.time()
    $ survival_time = 0.0
    
    # Show menu first
    $ result = renpy.call_screen("egg_catcher_menu")

    if result == "start":
        # Call the actual game
        call play_egg_catcher_game

        # After finishing the game (win or lose)
        "You finished playing Egg Catcher!"
        return

    elif result == "quit":
        "You chose not to play."
        return

# -----------------------------
# Play Egg Catcher Label
# -----------------------------
label play_egg_catcher_game:
    # Reset game state
    $ eggs = []
    $ score = 0
    $ lives = 3
    $ caught = 0
    $ level = 1
    $ survival_time = 0.0
    $ egg_speed = 3.0
    $ spawn_rate = 1.5
    $ basket_x = 600
    $ import time
    $ game_start_time = time.time()
    $ last_spawn = time.time()

    # Call the game screen
    $ result = renpy.call_screen("egg_catcher_game")

    # Record survival time to leaderboard (top 20)
    $ final_survival_time = survival_time
    
    if final_survival_time > 0:
        $ egg_catcher_leaderboard.append({
            "survival_time": final_survival_time,
            "score": score,
            "timestamp": time.time(),
            "date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "player": store.player_name
        })
        # Sort by survival_time (longest first), then by timestamp
        $ egg_catcher_leaderboard.sort(key=lambda x: (-x["survival_time"], x["timestamp"]))
        # Keep only top 20
        $ egg_catcher_leaderboard = egg_catcher_leaderboard[:20]
        
        # Show result
        "Your survival time: [final_survival_time] seconds"

    return