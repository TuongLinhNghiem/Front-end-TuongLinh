# FlyMe2TheMoon Mini-game for Ren'Py (8.5+)
# Converted from HTML source: FlyMe2TheMoon (K-404) Space Jump
# Features:
# - Vertical scrolling rocket game
# - Collect stars, avoid obstacles
# - 3 lives (hearts) system
# - Thrust physics with momentum
# - Win at 30 stars
# - Leaderboard tracking

# -----------------------------
# Game Constants
# -----------------------------
define FLYME_GAME_WIDTH = 720
define FLYME_GAME_HEIGHT = 1080
define FLYME_VIEWPORT_HEIGHT = 720
define FLYME_FIELD_X = 280
define FLYME_FIELD_Y = 0
define FLYME_PLAYER_W = 60
define FLYME_PLAYER_H = 60
define FLYME_OBSTACLE_W = 70
define FLYME_OBSTACLE_H = 70
define FLYME_STAR_W = 40
define FLYME_STAR_H = 40
define FLYME_GRAVITY = 600
define FLYME_THRUST_FORCE = 800
define FLYME_MAX_VX = 300
define FLYME_MOVE_ACCEL = 1000

# -----------------------------
# Game Variables
# -----------------------------
default flyme_score = 0
default flyme_high = 0
default flyme_hearts = 3
default flyme_thrust_power = 0.0
default flyme_invulnerable = False
default flyme_invulnerable_time = 0.0
default flyme_game_won = False
default flyme_paused = True
default flyme_running = False
default flyme_time = 0.0
default flyme_leaderboard = []

# Player state
default flyme_player_x = 0
default flyme_player_y = 0
default flyme_player_vx = 0.0
default flyme_player_vy = 0.0
default flyme_player_direction = 0  # -1: left, 0: center, 1: right

# Camera and spawning
default flyme_camera_y = 0.0
default flyme_spawn_y = 0.0

# Game objects (stored as lists of dicts)
default flyme_obstacles = []
default flyme_stars = []
# Input state - using store variables for key tracking
default flyme_keys_left = False
default flyme_keys_right = False
default flyme_keys_space = False

# Key release tracking
default flyme_keys_left_pressed = False
default flyme_keys_right_pressed = False
default flyme_keys_space_pressed = False

# -----------------------------
# FlyMe2TheMoon Functions
# -----------------------------
init python:
    import random
    import math

    def flyme_reset_game():
        """Reset game state for a new game."""
        store.flyme_player_x = FLYME_GAME_WIDTH / 2 - 30
        store.flyme_player_y = 0.0
        store.flyme_player_vx = 0.0
        store.flyme_player_vy = 0.0
        store.flyme_player_direction = 0
        store.flyme_camera_y = store.flyme_player_y - FLYME_VIEWPORT_HEIGHT * 0.72
        store.flyme_spawn_y = store.flyme_player_y - 220
        store.flyme_time = 0.0
        store.flyme_obstacles = []
        store.flyme_stars = []
        store.flyme_score = 0
        store.flyme_hearts = 3
        store.flyme_thrust_power = 0.0
        store.flyme_invulnerable = False
        store.flyme_invulnerable_time = 0.0
        store.flyme_game_won = False

        # Spawn initial obstacles and stars
        for i in range(1, 18):
            flyme_spawn_row(store.flyme_player_y - i * 260)

    def flyme_spawn_row(y):
        """Spawn a row of obstacles and stars at given y position."""
        # Spawn obstacle
        ox = random.randint(40, FLYME_GAME_WIDTH - 140)
        obs = {
            "x": ox,
            "y": y,
            "w": FLYME_OBSTACLE_W,
            "h": FLYME_OBSTACLE_H,
            "base_y": y,
            "phase": random.random() * 6.28
        }
        store.flyme_obstacles.append(obs)

        # Spawn star (70% chance)
        if random.random() < 0.7:
            star = {
                "x": random.randint(30, FLYME_GAME_WIDTH - 90),
                "y": y - 100,
                "w": FLYME_STAR_W,
                "h": FLYME_STAR_H,
                "phase": random.random() * 6.28
            }
            store.flyme_stars.append(star)

        store.flyme_spawn_y = y

    def flyme_update(dt):
        """Update game state."""
        if store.flyme_hearts <= 0 or store.flyme_game_won:
            return

        store.flyme_time += dt

        # Update invulnerability
        if store.flyme_invulnerable:
            store.flyme_invulnerable_time -= dt
            if store.flyme_invulnerable_time <= 0:
                store.flyme_invulnerable = False

        # Thrust physics
        if store.flyme_keys_space:
            store.flyme_thrust_power = min(store.flyme_thrust_power + dt * 3, 1.0)
        else:
            store.flyme_thrust_power = max(store.flyme_thrust_power - dt * 2, 0.0)

        # Apply thrust force (upward)
        thrust_force = store.flyme_thrust_power * (-FLYME_THRUST_FORCE)

        # Apply gravity and thrust to vertical velocity
        store.flyme_player_vy += (FLYME_GRAVITY + thrust_force) * dt

        # Horizontal movement with momentum
        if store.flyme_keys_left:
            store.flyme_player_vx = max(store.flyme_player_vx - FLYME_MOVE_ACCEL * dt, -FLYME_MAX_VX)
            store.flyme_player_direction = -1
        elif store.flyme_keys_right:
            store.flyme_player_vx = min(store.flyme_player_vx + FLYME_MOVE_ACCEL * dt, FLYME_MAX_VX)
            store.flyme_player_direction = 1
        else:
            # Friction
            store.flyme_player_vx *= (0.1 ** dt)
            if abs(store.flyme_player_vx) < 10:
                store.flyme_player_vx = 0
                store.flyme_player_direction = 0

        # Apply velocities
        store.flyme_player_x += store.flyme_player_vx * dt
        store.flyme_player_y += store.flyme_player_vy * dt

        # Boundary check (horizontal)
        if store.flyme_player_x < 0:
            store.flyme_player_x = 0
            store.flyme_player_vx = 0
        if store.flyme_player_x > FLYME_GAME_WIDTH - FLYME_PLAYER_W:
            store.flyme_player_x = FLYME_GAME_WIDTH - FLYME_PLAYER_W
            store.flyme_player_vx = 0

        # Game over if player falls too far
        if store.flyme_player_y > store.flyme_camera_y + FLYME_VIEWPORT_HEIGHT + 220:
            store.flyme_hearts = 0
            return

        # Camera follows player
        target_camera_y = store.flyme_player_y - FLYME_VIEWPORT_HEIGHT * 0.72
        store.flyme_camera_y = min(store.flyme_camera_y, target_camera_y)

        # Spawn more obstacles as player goes higher
        while store.flyme_spawn_y > store.flyme_player_y - 3200:
            flyme_spawn_row(store.flyme_spawn_y - 260)

        # Update obstacle positions (oscillating)
        for obs in store.flyme_obstacles:
            obs["y"] = obs["base_y"] + math.sin(store.flyme_time * 2 + obs["phase"]) * 28

        # Collision with obstacles
        if not store.flyme_invulnerable:
            for obs in store.flyme_obstacles:
                if (store.flyme_player_x < obs["x"] + obs["w"] - 10 and
                    store.flyme_player_x + FLYME_PLAYER_W > obs["x"] + 10 and
                    store.flyme_player_y < obs["y"] + obs["h"] - 10 and
                    store.flyme_player_y + FLYME_PLAYER_H > obs["y"] + 10):
                    store.flyme_hearts -= 1
                    store.flyme_invulnerable = True
                    store.flyme_invulnerable_time = 2.0
                    if store.flyme_hearts <= 0:
                        return
                    break

        # Collision with stars
        stars_to_remove = []
        for i, star in enumerate(store.flyme_stars):
            if (store.flyme_player_x < star["x"] + star["w"] and
                store.flyme_player_x + FLYME_PLAYER_W > star["x"] and
                store.flyme_player_y < star["y"] + star["h"] and
                store.flyme_player_y + FLYME_PLAYER_H > star["y"]):
                store.flyme_score += 1
                if store.flyme_score > store.flyme_high:
                    store.flyme_high = store.flyme_score
                stars_to_remove.append(i)

        # Remove collected stars (reverse order to maintain indices)
        for i in reversed(stars_to_remove):
            store.flyme_stars.pop(i)

        if store.flyme_score >= 30:
            store.flyme_game_won = True

# -----------------------------
# Animations
# -----------------------------
transform FlymeFloat:
    linear 0.5 yoffset -10
    linear 0.5 yoffset 0
    repeat True

transform FlymeGlow:
    linear 0.5 alpha 0.6
    linear 0.5 alpha 1.0
    repeat True

transform FlymePulse:
    linear 0.25 zoom 1.1
    linear 0.25 zoom 1.0
    repeat True

# -----------------------------
# FlyMe2TheMoon Menu Screen
# -----------------------------
screen flyme_menu():
    modal True

    # Space background
    add Solid("#0a0a1a")

    # Starfield background effect
    for i in range(50):
        $ star_x = (i * 47) % FLYME_GAME_WIDTH
        $ star_y = (i * 73) % FLYME_GAME_HEIGHT
        add Solid("#ffffff"):
            pos (star_x, star_y)
            xsize 2
            ysize 2
            at FlymeGlow

    # Menu container
    frame:
        xalign 0.5
        yalign 0.5
        xsize 400
        background Solid("#000000aa")
        padding (20, 20)

        vbox:
            spacing 15
            xalign 0.5

            # Title
            text "🚀 FlyMe2TheMoon" size 36 color "#0fbbe0" xalign 0.5 bold True at FlymeGlow
            text "(K-404)" size 24 color "#ffffff" xalign 0.5

            null height 10

            # Start button
            button:
                xsize 200
                ysize 50
                xalign 0.5
                background Solid("#0fbbe0")
                hover_background Solid("#0dd5ff")
                action Return("start")

                text "▶ START" size 22 color "#001122" xalign 0.5 yalign 0.5 bold True

            # Story button
            button:
                xsize 200
                ysize 50
                xalign 0.5
                background Solid("#ffffff20")
                hover_background Solid("#ffffff40")
                action Show("flyme_story_popup")

                text "📜 Story" size 20 color "#ffffff" xalign 0.5 yalign 0.5

            null height 10

            # Controls info
            text "Controls:" size 18 color "#ffffff" xalign 0.5
            text "← → / A D to move" size 16 color "#aaaaaa" xalign 0.5
            text "SPACE to thrust (hold to go up)" size 16 color "#aaaaaa" xalign 0.5

screen flyme_story_popup():
    modal True
    zorder 100

    add Solid("#00000090")

    frame:
        xalign 0.5
        yalign 0.5
        xsize 500
        background Solid("#1a1a2e")
        padding (30, 30)

        vbox:
            spacing 15

            text "📜 Story" size 28 color "#0fbbe0" xalign 0.5 bold True

            text "Long ago, humanity dreamed of flying beyond the stars." size 18 color "#ffffff" xalign 0.5 text_align 0.5
            text "You are the last pilot on a mission to explore the unknown..." size 18 color "#ffffff" xalign 0.5 text_align 0.5

            null height 10

            text "Collect 30 stars to unlock the final area!" size 16 color "#ffd700" xalign 0.5

            button:
                xsize 150
                ysize 40
                xalign 0.5
                background Solid("#0fbbe0")
                action Hide("flyme_story_popup")

                text "Close" size 18 color "#001122" xalign 0.5 yalign 0.5

# -----------------------------
# FlyMe2TheMoon Game Screen
# -----------------------------
screen flyme_game():
    modal True

    # Key press bindings
    key "K_LEFT" action SetVariable("flyme_keys_left", True)
    key "K_RIGHT" action SetVariable("flyme_keys_right", True)
    key "K_a" action SetVariable("flyme_keys_left", True)
    key "K_d" action SetVariable("flyme_keys_right", True)
    key "K_SPACE" action SetVariable("flyme_keys_space", True)

    # Key release bindings (Ren'Py uses keyup_* event names)
    key "keyup_K_LEFT" action SetVariable("flyme_keys_left", False)
    key "keyup_K_RIGHT" action SetVariable("flyme_keys_right", False)
    key "keyup_K_a" action SetVariable("flyme_keys_left", False)
    key "keyup_K_d" action SetVariable("flyme_keys_right", False)
    key "keyup_K_SPACE" action SetVariable("flyme_keys_space", False)

    # Escape to pause
    key "K_ESCAPE" action Return("pause")

    # Game update timer (60 FPS)
    timer 0.016 repeat True action Function(flyme_update, 0.016)
    timer 0.016 repeat True action If(flyme_hearts <= 0, true=Return("gameover"), false=NullAction())
    timer 0.016 repeat True action If(flyme_game_won, true=Return("victory"), false=NullAction())

    add Solid("#060816")

    frame:
        pos (FLYME_FIELD_X, FLYME_FIELD_Y)
        xsize FLYME_GAME_WIDTH
        ysize FLYME_VIEWPORT_HEIGHT
        background Solid("#0a1028")
        padding (0, 0)

    add Solid("#152038"):
        pos (FLYME_FIELD_X, FLYME_FIELD_Y + FLYME_VIEWPORT_HEIGHT - 110)
        xsize FLYME_GAME_WIDTH
        ysize 110
        alpha 0.22

    add Solid("#7d89ff22"):
        pos (FLYME_FIELD_X + 28, FLYME_FIELD_Y + 32)
        xsize FLYME_GAME_WIDTH - 56
        ysize FLYME_VIEWPORT_HEIGHT - 120

    for i in range(40):
        $ bg_star_x = FLYME_FIELD_X + ((i * 97 + 43) % (FLYME_GAME_WIDTH - 20)) + 10
        $ bg_star_y = FLYME_FIELD_Y + (((i * 173) - int(flyme_camera_y * 0.18)) % FLYME_VIEWPORT_HEIGHT)
        $ bg_star_size = 2 + (i % 3)
        add Solid("#ffffff"):
            pos (bg_star_x, bg_star_y)
            xsize bg_star_size
            ysize bg_star_size
            alpha 0.65

    for i in range(4):
        $ nebula_base_y = -1600 + i * 420
        $ nebula_y = FLYME_FIELD_Y + (nebula_base_y - flyme_camera_y * 0.1)
        add Solid("#6574cd33"):
            pos (FLYME_FIELD_X + 40, nebula_y)
            xsize FLYME_GAME_WIDTH - 80
            ysize 120

    for star in flyme_stars:
        python:
            draw_y = FLYME_FIELD_Y + star["y"] - flyme_camera_y
            draw_x = FLYME_FIELD_X + star["x"]
        text "★":
            pos (draw_x + 2, draw_y - 2)
            size 36
            color "#ffd54f"
            outlines [(2, "#fff4b0", 0, 0)]
            at FlymeGlow

    for obs in flyme_obstacles:
        python:
            draw_y = FLYME_FIELD_Y + obs["y"] - flyme_camera_y
            draw_x = FLYME_FIELD_X + obs["x"]
        add Solid("#f2edf4"):
            pos (draw_x + 16, draw_y)
            xsize 38
            ysize 104
        add Solid("#f0c1d9"):
            pos (draw_x + 22, draw_y + 14)
            xsize 8
            ysize 22
        add Solid("#f0c1d9"):
            pos (draw_x + 38, draw_y + 46)
            xsize 8
            ysize 22
        add Solid("#f0c1d9"):
            pos (draw_x + 26, draw_y + 78)
            xsize 8
            ysize 18

    $ draw_y = FLYME_FIELD_Y + flyme_player_y - flyme_camera_y
    $ draw_x = FLYME_FIELD_X + flyme_player_x
    $ ship_alpha = 1.0
    if flyme_invulnerable:
        $ ship_alpha = 0.3 + 0.7 * abs(math.sin(flyme_time * 20))

    add Solid("#7bc043"):
        pos (draw_x + 14, draw_y + 18)
        xsize 32
        ysize 54
        alpha ship_alpha
    add Solid("#1f9eff"):
        pos (draw_x + 20, draw_y + 46)
        xsize 20
        ysize 22
        alpha ship_alpha
    text "▲":
        pos (draw_x - 2, draw_y - 6)
        size 64
        color "#d71f28"
        at Transform(alpha=ship_alpha)
    text "●":
        pos (draw_x + 19, draw_y + 16)
        size 28
        color "#f2d14b"
        at Transform(alpha=ship_alpha)
    text "◀":
        pos (draw_x + 2, draw_y + 38)
        size 34
        color "#d71f28"
        at Transform(alpha=ship_alpha)
    text "▶":
        pos (draw_x + 34, draw_y + 38)
        size 34
        color "#d71f28"
        at Transform(alpha=ship_alpha)

    if flyme_thrust_power > 0.1:
        text "◆":
            pos (draw_x + 13, draw_y + 62)
            size 22
            color "#ff5c46"
            at Transform(alpha=flyme_thrust_power)
        text "◆":
            pos (draw_x + 23, draw_y + 70)
            size 20
            color "#ffd447"
            at Transform(alpha=flyme_thrust_power)
        text "◆":
            pos (draw_x + 31, draw_y + 62)
            size 22
            color "#ff5c46"
            at Transform(alpha=flyme_thrust_power)

    frame:
        pos (20, 16)
        background Solid("#00000090")
        padding (16, 12)

        vbox:
            spacing 6
            text "FlyMe2TheMoon" size 22 color "#8ce8ff" bold True
            text "Score: [flyme_score]" size 18 color "#ffffff" bold True
            text "Best: [flyme_high]" size 18 color "#ffd54f"

    hbox:
        xpos 22
        ypos 110
        spacing 6

        if flyme_hearts >= 1:
            text "HP" size 20 color "#ff6b6b" bold True
        else:
            text "--" size 20 color "#666666" bold True
        if flyme_hearts >= 2:
            text "HP" size 20 color "#ff6b6b" bold True
        else:
            text "--" size 20 color "#666666" bold True
        if flyme_hearts >= 3:
            text "HP" size 20 color "#ff6b6b" bold True
        else:
            text "--" size 20 color "#666666" bold True

    if flyme_score < 30:
        frame:
            pos (20, 150)
            background Solid("#00000090")
            padding (8, 8)

            vbox:
                spacing 4
                bar:
                    value flyme_score
                    range 30
                    xsize 220
                    ysize 16
                    left_bar Solid("#ffd700")
                    right_bar Solid("#333333")

                text "[flyme_score]/30 stars to the moon" size 12 color "#ffffff"

    button:
        pos (FLYME_FIELD_X + FLYME_GAME_WIDTH - 64, 16)
        xsize 48
        ysize 32
        background Solid("#ffffff30")
        hover_background Solid("#ffffff55")
        action Return("pause")

        text "||" size 18 color "#ffffff" xalign 0.5 yalign 0.5

    text "Move with LEFT/RIGHT or A/D, hold SPACE to climb":
        size 14
        color "#b5c7ff"
        xalign 0.5
        ypos (FLYME_VIEWPORT_HEIGHT - 30)

# -----------------------------
# Pause Screen
# -----------------------------
screen flyme_pause():
    modal True
    zorder 100

    add Solid("#00000090")

    frame:
        xalign 0.5
        yalign 0.5
        xsize 400
        background Solid("#000000aa")
        padding (30, 30)

        vbox:
            spacing 20
            xalign 0.5

            text "⏸ PAUSED" size 36 color "#ffffff" xalign 0.5 bold True

            button:
                xsize 200
                ysize 50
                xalign 0.5
                background Solid("#0fbbe0")
                hover_background Solid("#0dd5ff")
                action Return("resume")

                text "▶ Resume" size 20 color "#001122" xalign 0.5 yalign 0.5

            button:
                xsize 200
                ysize 50
                xalign 0.5
                background Solid("#ff4444")
                hover_background Solid("#ff6666")
                action Return("quit")

                text "🏠 Menu" size 20 color "#ffffff" xalign 0.5 yalign 0.5

# -----------------------------
# Game Over Screen
# -----------------------------
screen flyme_gameover():
    modal True
    zorder 100

    add Solid("#00000090")

    frame:
        xalign 0.5
        yalign 0.5
        xsize 450
        background Solid("#1a1a2e")
        padding (40, 40)

        vbox:
            spacing 20
            xalign 0.5

            text "💀 Game Over" size 42 color "#ff4444" xalign 0.5 bold True
            text "Final Score: [flyme_score]" size 24 color "#ffffff" xalign 0.5
            text "Stars Collected: [flyme_score]" size 18 color "#aaaaaa" xalign 0.5

            null height 10

            hbox:
                spacing 20
                xalign 0.5

                button:
                    xsize 150
                    ysize 50
                    background Solid("#0fbbe0")
                    hover_background Solid("#0dd5ff")
                    action Return("restart")

                    text "🔄 Retry" size 18 color "#001122" xalign 0.5 yalign 0.5

                button:
                    xsize 150
                    ysize 50
                    background Solid("#ff4444")
                    hover_background Solid("#ff6666")
                    action Return("quit")

                    text "🏠 Menu" size 18 color "#ffffff" xalign 0.5 yalign 0.5

# -----------------------------
# Victory Screen
# -----------------------------
screen flyme_victory():
    modal True
    zorder 100

    add Solid("#00000090")

    frame:
        xalign 0.5
        yalign 0.5
        xsize 450
        background Solid("#ffd700")
        padding (40, 40)

        vbox:
            spacing 15
            xalign 0.5

            text "🎉 VICTORY! 🎉" size 42 color "#001122" xalign 0.5 bold True
            text "You reached the Moon!" size 24 color "#001122" xalign 0.5
            text "Stars Collected: [flyme_score]" size 20 color "#333333" xalign 0.5

            null height 10

            hbox:
                spacing 20
                xalign 0.5

                button:
                    xsize 150
                    ysize 50
                    background Solid("#0fbbe0")
                    hover_background Solid("#0dd5ff")
                    action Return("restart")

                    text "🔄 Play Again" size 16 color "#001122" xalign 0.5 yalign 0.5

                button:
                    xsize 150
                    ysize 50
                    background Solid("#333333")
                    hover_background Solid("#555555")
                    action Return("quit")

                    text "🏠 Menu" size 18 color "#ffffff" xalign 0.5 yalign 0.5

# -----------------------------
# PvP Start Label (preserved for compatibility)
# -----------------------------
label pvp_start:
    # Show menu screen
    $ result = renpy.call_screen("flyme_menu")

    if result == "start":
        call play_pvp_game
        return
    else:
        return

# -----------------------------
# Play PvP Game Label (preserved for compatibility)
# -----------------------------
label play_pvp_game:
    $ import time
    $ game_start_time = time.time()

    # Reset and initialize game
    $ flyme_reset_game()
    $ flyme_running = True
    $ flyme_paused = False

    label flyme_game_loop:
        # Check game state
        if flyme_hearts <= 0:
            jump flyme_game_over_label

        if flyme_game_won:
            jump flyme_victory_label

        # Run game screen
        $ result = renpy.call_screen("flyme_game")

        if result == "pause":
            $ pause_result = renpy.call_screen("flyme_pause")

            if pause_result == "resume":
                jump flyme_game_loop
            elif pause_result == "quit":
                jump flyme_end

        jump flyme_game_loop

    label flyme_game_over_label:
        $ result = renpy.call_screen("flyme_gameover")

        if result == "restart":
            $ flyme_reset_game()
            jump flyme_game_loop
        else:
            jump flyme_end

    label flyme_victory_label:
        $ result = renpy.call_screen("flyme_victory")

        if result == "restart":
            $ flyme_reset_game()
            jump flyme_game_loop
        else:
            jump flyme_end

    label flyme_end:
        # Record to leaderboard
        $ survival_time = time.time() - game_start_time
        $ flyme_leaderboard.append({
            "score": flyme_score,
            "won": flyme_game_won,
            "timestamp": time.time(),
            "date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "player": store.player_name
        })
        $ flyme_leaderboard.sort(key=lambda x: (-x["score"], x["timestamp"]))
        $ flyme_leaderboard = flyme_leaderboard[:20]

        return
