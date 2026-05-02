# Shape Memory Match Mini-game for Ren'Py (8.5+)
# FIXED: UI/UX with integrated character feedback system
# - Character appears INSIDE game screen (not story layer)
# - Positioned on right side to not block gameplay
# - UI-based feedback (no Ren'Py dialogue/say system)
# - Fully screen-based gameplay

# -----------------------------
# Game Variables
# -----------------------------
default memory_level = 1
default memory_score = 0
default memory_lives = 3
default memory_sequence = []
default memory_player_sequence = []
default memory_game_active = False
default memory_showing_sequence = False
default memory_sequence_length = 3
default memory_selected_shape = None
default memory_sequence_timer = 0.6
default memory_feedback_message = ""
default memory_feedback_type = "neutral"  # neutral, watch, correct, wrong
default memory_character_expression = "neutral"
default memory_leaderboard = []

# -----------------------------
# Memory Match Functions
# -----------------------------
init python:
    import random
    import time

    MEMORY_SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon']
    MEMORY_SHAPE_COLORS = {
        'circle': '#ff6b6b',
        'square': '#4834d4',
        'triangle': '#00d2d3',
        'diamond': '#ff9ff3',
        'star': '#feca57',
        'hexagon': '#5f27cd'
    }

    # Character feedback messages
    MEMORY_FEEDBACK = {
        'watch': "👀 Watch carefully...",
        'repeat': "🎯 Your turn! Repeat the sequence!",
        'correct': "✨ Correct! Keep going!",
        'wrong': "❌ Oops! That wasn't right...",
        'level_up': "🎉 Level Up! Amazing!",
        'game_over': "💀 Game Over! Well tried!",
        'start': "🎮 Ready? Let's test your memory!",
        'waiting': "⏳ Press START when ready..."
    }

    def generate_memory_sequence():
        """Generate a random sequence of shapes."""
        store.memory_sequence = []
        for i in range(store.memory_sequence_length):
            random_shape = random.choice(MEMORY_SHAPES)
            store.memory_sequence.append(random_shape)

    def set_memory_feedback(feedback_type, message=None):
        """Set feedback message and character expression."""
        store.memory_feedback_type = feedback_type

        if message:
            store.memory_feedback_message = message
        else:
            store.memory_feedback_message = MEMORY_FEEDBACK.get(feedback_type, "")

        # Set character expression based on feedback type
        if feedback_type == 'watch':
            store.memory_character_expression = "focused"
        elif feedback_type == 'correct' or feedback_type == 'level_up':
            store.memory_character_expression = "happy"
        elif feedback_type == 'wrong':
            store.memory_character_expression = "worried"
        elif feedback_type == 'game_over':
            store.memory_character_expression = "sad"
        else:
            store.memory_character_expression = "neutral"

    def get_character_color():
        """Get character UI color based on target_name."""
        if store.target_name == "Niem":
            return "#6BB3FF"  # Blue for Niem
        return "#FF6B9D"  # Pink for Hoai

# -----------------------------
# Animations
# -----------------------------
transform ShapeHighlight:
    linear 0.2 zoom 1.1
    pause 0.3
    linear 0.2 zoom 1.0

transform CorrectPulse:
    linear 0.25 zoom 1.2
    linear 0.25 zoom 1.0

transform WrongShake:
    linear 0.1 xoffset -10
    linear 0.1 xoffset 10
    linear 0.1 xoffset -10
    linear 0.1 xoffset 10
    linear 0.1 xoffset 0

transform CharacterBounce:
    linear 0.3 yoffset -5
    linear 0.3 yoffset 0
    repeat True

transform CharacterHappy:
    linear 0.2 zoom 1.05
    linear 0.2 zoom 1.0
    repeat True

transform CharacterWorried:
    linear 0.1 xoffset -3
    linear 0.1 xoffset 3
    linear 0.1 xoffset -3
    linear 0.1 xoffset 0
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

# -----------------------------
# Memory Match Menu Screen
# -----------------------------
screen memory_match_menu():
    modal True

    # Background gradient
    add Solid("#667eea"):
        ysize 360
    add Solid("#764ba2"):
        ypos 360
        ysize 360

    # Title area
    vbox:
        xalign 0.5
        yalign 0.3
        spacing 15

        text "🔷 SHAPE MATCHER" size 64 color "#FFFFFF" xalign 0.5 bold True at GlowAnim
        text "Test your memory with morphing shapes!" size 28 color "#FFFFFF" xalign 0.5

    # Menu buttons
    hbox:
        xalign 0.5
        yalign 0.6
        spacing 40

        button:
            xsize 200
            ysize 60
            background Solid("#ff6b6b")
            hover_background Solid("#ee5a24")
            action Return("start")
            text "🎮 PLAY GAME" size 24 color "#FFFFFF" xalign 0.5 yalign 0.5

        button:
            xsize 200
            ysize 60
            background Solid("#1e3c72")
            hover_background Solid("#2a5298")
            action Return("quit")
            text "🏠 GO HOME" size 24 color "#FFFFFF" xalign 0.5 yalign 0.5

    text "Remember the sequence and repeat it!":
        size 20
        color "#FFFFFF"
        xalign 0.5
        yalign 0.85

# -----------------------------
# Memory Match Game Screen
# FIXED: Character integrated INSIDE game screen
# -----------------------------
screen memory_match_game():
    modal True

    # Background gradient
    add Solid("#667eea"):
        ysize 360
    add Solid("#764ba2"):
        ypos 360
        ysize 360

    # HUD - Top Left
    frame:
        pos (20, 20)
        background Solid("#FFFFFF")
        padding (15, 12)

        vbox:
            spacing 6
            text "Level: [memory_level]" size 22 color "#333333" bold True
            text "Score: [memory_score]" size 22 color "#333333" bold True
            text "Lives: [memory_lives]" size 22 color "#FF0000" bold True

    # Sequence length indicator
    frame:
        pos (20, 120)
        background Solid("#FFFFFF")
        padding (12, 8)

        text "Sequence: [memory_sequence_length] shapes" size 18 color "#666666"

    # -----------------------------
    # CHARACTER PANEL (Right Side)
    # FIXED: Now INSIDE game screen, not story layer
    # -----------------------------
    frame:
        pos (1050, 100)
        background Solid("#00000088")
        padding (15, 15)
        xsize 200
        ysize 350

        vbox:
            spacing 10
            xalign 0.5

            # Character name
            $ char_color = get_character_color()
            text "[target_name]" size 24 color char_color xalign 0.5 bold True

            # Character avatar area (colored placeholder)
            frame:
                background Solid(char_color)
                xsize 100
                ysize 100
                xalign 0.5

                # Expression indicator
                if memory_character_expression == "happy":
                    text "😊" size 50 xalign 0.5 yalign 0.5
                elif memory_character_expression == "worried":
                    text "😟" size 50 xalign 0.5 yalign 0.5 at CharacterWorried
                elif memory_character_expression == "focused":
                    text "🤔" size 50 xalign 0.5 yalign 0.5
                elif memory_character_expression == "sad":
                    text "😢" size 50 xalign 0.5 yalign 0.5
                else:
                    text "🙂" size 50 xalign 0.5 yalign 0.5

            # Feedback message box
            frame:
                background Solid("#FFFFFF")
                padding (10, 10)
                xsize 180
                ysize 100

                # Dynamic message based on game state
                if memory_showing_sequence:
                    text MEMORY_FEEDBACK['watch'] size 16 color "#FFA500" xalign 0.5 yalign 0.5 text_align 0.5
                elif memory_feedback_message != "":
                    $ msg_color = "#00AA00" if memory_feedback_type == "correct" else "#FF0000" if memory_feedback_type == "wrong" else "#333333"
                    text memory_feedback_message size 16 color msg_color xalign 0.5 yalign 0.5 text_align 0.5 bold True
                elif memory_game_active:
                    text MEMORY_FEEDBACK['repeat'] size 16 color "#333333" xalign 0.5 yalign 0.5 text_align 0.5
                else:
                    text MEMORY_FEEDBACK['waiting'] size 16 color "#666666" xalign 0.5 yalign 0.5 text_align 0.5

            # Progress indicator
            if memory_game_active and not memory_showing_sequence:
                text "Progress: [len(memory_player_sequence)]/[memory_sequence_length]" size 14 color "#FFFFFF" xalign 0.5

    # -----------------------------
    # SHAPE BUTTONS GRID (Left-Center)
    # Positioned to avoid character panel
    # -----------------------------
    grid 3 2:
        xalign 0.35
        yalign 0.55
        spacing 25

        for shape in MEMORY_SHAPES:
            $ shape_color = MEMORY_SHAPE_COLORS.get(shape, '#FFFFFF')
            $ is_selected = (memory_selected_shape == shape)

            button:
                xsize 130
                ysize 130
                background Solid(shape_color)
                hover_background Solid(shape_color)
                if is_selected:
                    at CorrectPulse

                # Disable during sequence showing
                if not memory_game_active or memory_showing_sequence:
                    action None
                else:
                    action [SetVariable("memory_selected_shape", shape), Return(("shape_click", shape))]

                # Shape icon
                if shape == 'circle':
                    text "⚫" size 50 xalign 0.5 yalign 0.5
                elif shape == 'square':
                    text "⬛" size 50 xalign 0.5 yalign 0.5
                elif shape == 'triangle':
                    text "🔺" size 50 xalign 0.5 yalign 0.5
                elif shape == 'diamond':
                    text "💠" size 50 xalign 0.5 yalign 0.5
                elif shape == 'star':
                    text "⭐" size 50 xalign 0.5 yalign 0.5
                elif shape == 'hexagon':
                    text "⬡" size 50 xalign 0.5 yalign 0.5

    # -----------------------------
    # Control Buttons (Bottom)
    # -----------------------------
    hbox:
        xalign 0.35
        yalign 0.92
        spacing 30

        if not memory_game_active:
            button:
                xsize 160
                ysize 45
                background Solid("#1e3c72")
                hover_background Solid("#2a5298")
                action Return("start_game")
                text "▶️ Start Game" size 20 color "#FFFFFF" xalign 0.5 yalign 0.5

        if memory_game_active and not memory_showing_sequence:
            button:
                xsize 160
                ysize 45
                background Solid("#FFA500")
                hover_background Solid("#FF8C00")
                action Return("replay")
                text "🔄 Replay" size 20 color "#FFFFFF" xalign 0.5 yalign 0.5

        button:
            xsize 160
            ysize 45
            background Solid("#FF6B6B")
            hover_background Solid("#ee5a24")
            action Return("quit_game")
            text "🏠 Menu" size 20 color "#FFFFFF" xalign 0.5 yalign 0.5

# -----------------------------
# Sequence Playback Screen
# -----------------------------
screen memory_match_sequence():
    modal True

    use memory_match_game

    timer memory_sequence_timer action Return("next_step")

# -----------------------------
# Game Over Screen
# -----------------------------
screen memory_match_gameover():
    modal True

    add Solid("#000000"):
        alpha 0.8

    frame:
        xalign 0.5
        yalign 0.5
        background Solid("#FFFFFF")
        padding (50, 50)

        vbox:
            spacing 20
            text "🎯 Game Over!" size 48 color "#333333" xalign 0.5 bold True
            text "Final Score: [memory_score]" size 28 color "#FFA500" xalign 0.5 bold True
            text "Level Reached: [memory_level]" size 24 color "#333333" xalign 0.5

            null height 20

            hbox:
                spacing 30
                xalign 0.5

                button:
                    xsize 180
                    ysize 50
                    background Solid("#1e3c72")
                    hover_background Solid("#2a5298")
                    action Return("play_again")
                    text "🔄 Play Again" size 20 color "#FFFFFF" xalign 0.5 yalign 0.5

                button:
                    xsize 180
                    ysize 50
                    background Solid("#FF6B6B")
                    hover_background Solid("#ee5a24")
                    action Return("quit_game")
                    text "🏠 Back to Story" size 20 color "#FFFFFF" xalign 0.5 yalign 0.5

# -----------------------------
# Memory Match Start Label
# -----------------------------
label memory_match_start:
    $ set_memory_feedback('neutral', MEMORY_FEEDBACK['start'])
    $ result = renpy.call_screen("memory_match_menu")

    if result == "start":
        window hide
        call play_memory_match_game
        window show
        return
    elif result == "quit":
        return

# -----------------------------
# Play Memory Match Label
# FIXED: All feedback via UI, no Ren'Py dialogue
# -----------------------------
label play_memory_match_game:
    # Initialize game state
    $ import time
    $ memory_level = 1
    $ memory_score = 0
    $ memory_lives = 3
    $ memory_sequence = []
    $ memory_player_sequence = []
    $ memory_game_active = False
    $ memory_showing_sequence = False
    $ memory_sequence_length = 3
    $ memory_feedback_message = ""
    $ memory_selected_shape = None
    $ memory_sequence_timer = 0.6
    $ game_start_time = time.time()

    # Show game screen and handle game loop
    label memory_game_loop:
        $ result = renpy.call_screen("memory_match_game")

        if result == "start_game":
            # Start new game - UI feedback
            $ memory_game_active = True
            $ set_memory_feedback('watch')
            $ generate_memory_sequence()
            jump memory_show_sequence

        elif result[0] == "shape_click" if isinstance(result, tuple) else False:
            # Player clicked a shape
            $ shape_clicked = result[1]
            $ memory_player_sequence.append(shape_clicked)
            $ memory_selected_shape = shape_clicked

            # Check if correct
            $ current_index = len(memory_player_sequence) - 1
            if memory_player_sequence[current_index] == memory_sequence[current_index]:
                # Correct! - UI feedback only
                $ set_memory_feedback('correct')

                # Check if sequence complete
                if len(memory_player_sequence) == len(memory_sequence):
                    # Level complete! - UI feedback
                    $ memory_score += memory_level * 100
                    $ memory_level += 1
                    $ memory_sequence_length = min(8, 2 + memory_level)
                    $ set_memory_feedback('level_up', "🎉 Level [memory_level]! Score: [memory_score]!")

                    # Generate new sequence
                    $ generate_memory_sequence()
                    jump memory_show_sequence
            else:
                # Wrong! - UI feedback only
                $ memory_lives -= 1
                $ set_memory_feedback('wrong', "❌ Wrong! [memory_lives] lives left.")
                if memory_lives <= 0:
                    $ set_memory_feedback('game_over')
                    jump memory_game_over
                else:
                    $ memory_player_sequence = []
                    $ memory_selected_shape = None
                    jump memory_game_loop

            jump memory_game_loop

        elif result == "replay":
            $ set_memory_feedback('watch')
            jump memory_show_sequence

        elif result == "quit_game":
            jump memory_match_end

        jump memory_game_loop

    # Show sequence to player - UI feedback only
    label memory_show_sequence:
        $ memory_showing_sequence = True
        $ memory_player_sequence = []
        $ set_memory_feedback('watch')

        # Brief pause then show sequence via UI
        $ i = 0
        while i < len(memory_sequence):
            $ memory_selected_shape = memory_sequence[i]
            $ memory_sequence_timer = 0.6
            $ result = renpy.call_screen("memory_match_sequence")
            if result == "quit_game":
                jump memory_match_end
            $ memory_selected_shape = None
            $ memory_sequence_timer = 0.2
            $ result = renpy.call_screen("memory_match_sequence")
            if result == "quit_game":
                jump memory_match_end
            $ i += 1

        $ memory_showing_sequence = False
        $ memory_selected_shape = None
        $ set_memory_feedback('repeat')
        jump memory_game_loop

    # Game over
    label memory_game_over:
        $ result = renpy.call_screen("memory_match_gameover")

        if result == "play_again":
            $ memory_level = 1
            $ memory_score = 0
            $ memory_lives = 3
            $ memory_sequence = []
            $ memory_player_sequence = []
            $ memory_game_active = False
            $ memory_showing_sequence = False
            $ memory_sequence_length = 3
            $ memory_feedback_message = ""
            $ memory_selected_shape = None
            $ memory_sequence_timer = 0.6
            $ set_memory_feedback('start')
            jump memory_game_loop
        else:
            jump memory_match_end

    label memory_match_end:
        # Record to leaderboard
        $ survival_time = time.time() - game_start_time
        $ memory_leaderboard.append({
            "score": memory_score,
            "level": memory_level,
            "timestamp": time.time(),
            "date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "player": store.player_name
        })
        $ memory_leaderboard.sort(key=lambda x: (-x["score"], x["timestamp"]))
        $ memory_leaderboard = memory_leaderboard[:20]

        return
