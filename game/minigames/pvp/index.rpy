# FlyMe2TheMoon Mini-game for Ren'Py (8.5+)
# Converted from HTML source: FlyMe2TheMoon (K-404) Space Jump
# Features:
# - Vertical scrolling rocket game
# - Collect stars, avoid obstacles
# - 3 lives (hearts) system
# - Thrust physics with momentum
# - Goal at 30 stars
# - Leaderboard tracking

# -----------------------------
# Game Constants
# -----------------------------
define FLYME_GAME_WIDTH = 720
define FLYME_GAME_HEIGHT = 1080
define FLYME_PLAYER_W = 60
define FLYME_PLAYER_H = 60
define FLYME_OBSTACLE_W = 70
define FLYME_OBSTACLE_H = 70
define FLYME_STAR_W = 40
define FLYME_STAR_H = 40
define FLYME_GOAL_W = 100
define FLYME_GOAL_H = 100
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
default flyme_goal = None

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
        store.flyme_player_y = FLYME_GAME_HEIGHT - 200
        store.flyme_player_vx = 0.0
        store.flyme_player_vy = 0.0
        store.flyme_player_direction = 0
        store.flyme_camera_y = store.flyme_player_y - FLYME_GAME_HEIGHT / 2
        store.flyme_spawn_y = store.flyme_player_y - 200
        store.flyme_time = 0.0
        store.flyme_obstacles = []
        store.flyme_stars = []
        store.flyme_goal = None
        store.flyme_score = 0
        store.flyme_hearts = 3
        store.flyme_thrust_power = 0.0
        store.flyme_invulnerable = False
        store.flyme_invulnerable_time = 0.0
        store.flyme_game_won = False

        # Spawn initial obstacles and stars
        for i in range(1, 16):
            flyme_spawn_row(store.flyme_player_y - i * 300)

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

        # Spawn goal when score >= 30
        if store.flyme_score >= 30 and store.flyme_goal is None:
            store.flyme_goal = {
                "x": FLYME_GAME_WIDTH / 2 - 50,
                "y": y - 500,
                "w": FLYME_GOAL_W,
                "h": FLYME_GOAL_H
            }

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
        if store.flyme_player_y > store.flyme_camera_y + FLYME_GAME_HEIGHT + 300:
            store.flyme_hearts = 0
            return

        # Camera follows player
        store.flyme_camera_y = store.flyme_player_y - FLYME_GAME_HEIGHT * 0.6

        # Spawn more obstacles as player goes higher
        while store.flyme_spawn_y > store.flyme_player_y - 3000:
            flyme_spawn_row(store.flyme_spawn_y - 300)

        # Update obstacle positions (oscillating)
        for obs in store.flyme_obstacles:
            obs["y"] = obs["base_y"] + math.sin(store.flyme_time * 2 + obs["phase"]) * 40

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

        # Collision with goal
        if store.flyme_goal and store.flyme_score >= 30:
            if (store.flyme_player_x < store.flyme_goal["x"] + store.flyme_goal["w"] and
                store.flyme_player_x + FLYME_PLAYER_W > store.flyme_goal["x"] and
                store.flyme_player_y < store.flyme_goal["y"] + store.flyme_goal["h"] and
                store.flyme_player_y + FLYME_PLAYER_H > store.flyme_goal["y"]):
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
    key "K_LEFT" action SetDict(store, "flyme_keys_left", True)
    key "K_RIGHT" action SetDict(store, "flyme_keys_right", True)
    key "K_a" action SetDict(store, "flyme_keys_left", True)
    key "K_d" action SetDict(store, "flyme_keys_right", True)
    key "K_SPACE" action SetDict(store, "flyme_keys_space", True)

    # Key release bindings (Ren'Py uses keyup_* event names)
    key "keyup_K_LEFT" action SetDict(store, "flyme_keys_left", False)
    key "keyup_K_RIGHT" action SetDict(store, "flyme_keys_right", False)
    key "keyup_K_a" action SetDict(store, "flyme_keys_left", False)
    key "keyup_K_d" action SetDict(store, "flyme_keys_right", False)
    key "keyup_K_SPACE" action SetDict(store, "flyme_keys_space", False)

    # Escape to pause
    key "K_ESCAPE" action Return("pause")

    # Game update timer (60 FPS)
    timer 0.016 repeat True action Function(flyme_update, 0.016)

    # Background - dark space
    add Solid("#0a0a1a")

    # Background stars
    for i in range(30):
        $ star_x = ((i * 47 + int(flyme_camera_y * 0.1)) % FLYME_GAME_WIDTH)
        $ star_y = ((i * 73) % FLYME_GAME_HEIGHT)
        add Solid("#ffffff"):
            pos (star_x, star_y)
            xsize 2
            ysize 2

    # Goal (if exists and score >= 30)
    if flyme_goal and flyme_score >= 30:
        $ draw_y = flyme_goal["y"] - flyme_camera_y
        if -120 < draw_y < FLYME_GAME_HEIGHT + 120:
            add Solid("#ffd700"):
                pos (flyme_goal["x"], draw_y)
                xsize flyme_goal["w"]
                ysize flyme_goal["h"]
                at FlymePulse

    # Stars
    for star in flyme_stars:
        $ draw_y = star["y"] - flyme_camera_y
        if -50 < draw_y < FLYME_GAME_HEIGHT + 50:
            add Solid("#ffd700"):
                pos (star["x"], draw_y)
                xsize star["w"]
                ysize star["h"]
                at FlymeGlow

    # Obstacles
    for obs in flyme_obstacles:
        $ draw_y = obs["y"] - flyme_camera_y
        if -80 < draw_y < FLYME_GAME_HEIGHT + 80:
            add Solid("#ff4444"):
                pos (obs["x"], draw_y)
                xsize obs["w"]
                ysize obs["h"]

    # Player
    $ draw_y = flyme_player_y - flyme_camera_y
    $ player_color = "#00ffff"
    if flyme_player_direction == -1:
        $ player_color = "#00dddd"
    elif flyme_player_direction == 1:
        $ player_color = "#00ffff"

    # Player with invulnerability effect
    if flyme_invulnerable:
        $ blink_alpha = 0.3 + 0.7 * abs(math.sin(flyme_time * 20))
        add Solid(player_color):
            pos (flyme_player_x, draw_y)
            xsize FLYME_PLAYER_W
            ysize FLYME_PLAYER_H
            alpha blink_alpha
    else:
        add Solid(player_color):
            pos (flyme_player_x, draw_y)
            xsize FLYME_PLAYER_W
            ysize FLYME_PLAYER_H

    # Thrust flame effect
    if flyme_thrust_power > 0.1:
        $ flame_height = int(flyme_thrust_power * 30)
        add Solid("#ff6600"):
            pos (flyme_player_x + FLYME_PLAYER_W/2 - 5, draw_y + FLYME_PLAYER_H)
            xsize 10
            ysize flame_height
            alpha flyme_thrust_power

    # HUD - Top
    frame:
        pos (10, 10)
        background Solid("#00000080")
        padding (15, 10)

        hbox:
            spacing 20
            text "Score: [flyme_score]" size 20 color "#ffffff" bold True
            text "High: [flyme_high]" size 20 color "#ffd700"

    # Hearts
    hbox:
        xalign 0.95
        ypos 10
        spacing 5

        if flyme_hearts >= 1:
            text "❤️" size 24
        else:
            text "🖤" size 24
        if flyme_hearts >= 2:
            text "❤️" size 24
        else:
            text "🖤" size 24
        if flyme_hearts >= 3:
            text "❤️" size 24
        else:
            text "🖤" size 24

    # Progress bar for 30 stars
    if flyme_score < 30:
        frame:
            pos (10, 45)
            background Solid("#00000080")
            padding (5, 5)

            bar:
                value flyme_score
                range 30
                xsize 200
                ysize 15
                left_bar Solid("#ffd700")
                right_bar Solid("#333333")

            text "[flyme_score]/30 stars" size 12 color "#ffffff" xalign 0.5

    # Menu button
    button:
        pos (FLYME_GAME_WIDTH - 60, 10)
        xsize 50
        ysize 30
        background Solid("#ffffff30")
        hover_background Solid("#ffffff50")
        action Return("pause")

        text "||" size 20 color "#ffffff" xalign 0.5 yalign 0.5

    # Controls hint
    text "← → to move | SPACE to thrust":
        size 14
        color "#666666"
        xalign 0.5
        ypos (FLYME_GAME_HEIGHT - 30)

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
