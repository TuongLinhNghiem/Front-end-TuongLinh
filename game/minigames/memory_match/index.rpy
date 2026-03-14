# Shape Memory Match Mini-game for Ren'Py (8.5+)
# Based on HTML reference: Shape Matcher - Memory Mode
# Features:
# - 6 shape buttons (circle, square, triangle, diamond, star, hexagon)
# - Sequence memory gameplay
# - Progressive difficulty
# - Lives system
# - Leaderboard tracking

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
default memory_correct_shape = None
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

    def generate_memory_sequence():
        """Generate a random sequence of shapes."""
        global memory_sequence, memory_sequence_length
        memory_sequence = []
        for i in range(memory_sequence_length):
            random_shape = random.choice(MEMORY_SHAPES)
            memory_sequence.append(random_shape)

    def get_shape_display_name(shape):
        """Get display name for shape."""
        names = {
            'circle': '⚫ Circle',
            'square': '🟦 Square', 
            'triangle': '🔺 Triangle',
            'diamond': '💠 Diamond',
            'star': '⭐ Star',
            'hexagon': '⬡ Hexagon'
        }
        return names.get(shape, shape)

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
    
    # Animated shapes decoration
    for i, shape in enumerate(['circle', 'square', 'triangle', 'diamond']):
        $ colors = ['#ff6b6b', '#4834d4', '#00d2d3', '#ff9ff3']
        $ positions = [(200, 150), (400, 100), (700, 130), (950, 80)]
        add Solid(colors[i]):
            pos positions[i]
            xsize 80
            ysize 80
            # 40 if shape == 'circle' else 10
            alpha 0.3
            at FloatAnim
    
    # Title area
    vbox:
        xalign 0.5
        yalign 0.3
        spacing 15
        
        text "🔷 SHAPE MATCHER" size 64 color "#FFFFFF" xalign 0.5 bold True at GlowAnim
        text "Test your memory with morphing shapes!" size 28 color "#FFFFFF" xalign 0.5 alpha 0.9
    
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
            # 30
            action Return("start")
            
            text "🎮 PLAY GAME" size 24 color "#FFFFFF" xalign 0.5 yalign 0.5
        
        button:
            xsize 200
            ysize 60
            background Solid("#1e3c72")
            hover_background Solid("#2a5298")
            # 30
            action Return("quit")
            
            text "🏠 GO HOME" size 24 color "#FFFFFF" xalign 0.5 yalign 0.5
    
    # Instructions
    text "Remember the sequence and repeat it!":
        size 20
        color "#FFFFFF"
        xalign 0.5
        yalign 0.85
        alpha 0.8

# -----------------------------
# Memory Match Game Screen
# -----------------------------
screen memory_match_game():
    modal True
    
    # Background gradient
    add Solid("#667eea"):
        ysize 360
    add Solid("#764ba2"):
        ypos 360
        ysize 360
    
    # HUD - Top
    frame:
        pos (20, 20)
        background Solid("#FFFFFF")
        padding (20, 15)
        # 15
        
        hbox:
            spacing 40
            text "Level: [memory_level]" size 26 color "#333333" bold True
            text "Score: [memory_score]" size 26 color "#333333" bold True
            text "Lives: [memory_lives]" size 26 color "#FF0000" bold True
    
    # Sequence length indicator
    frame:
        pos (20, 80)
        background Solid("#FFFFFF")
        padding (15, 10)
        # 10
        
        text "Sequence: [memory_sequence_length] shapes" size 20 color "#666666"
    
    # Status message
    frame:
        xalign 0.5
        yalign 0.2
        background Solid("#FFFFFF")
        padding (20, 15)
        # 10
        
        if memory_showing_sequence:
            text "👀 Watch carefully..." size 28 color "#FFA500" bold True
        elif memory_game_active:
            text "🎯 Repeat the sequence!" size 28 color "#333333" bold True
        else:
            text "Press START to begin" size 28 color "#333333" bold True
    
    # Shape buttons grid (3x2)
    grid 3 2:
        xalign 0.5
        yalign 0.55
        spacing 30
        
        for shape in MEMORY_SHAPES:
            $ shape_color = MEMORY_SHAPE_COLORS.get(shape, '#FFFFFF')
            $ is_selected = (memory_selected_shape == shape)
            $ is_correct = (memory_correct_shape == shape)
            
            button:
                xsize 150
                ysize 150
                background Solid(shape_color)
                hover_background Solid(shape_color)
                if is_selected:
                    at CorrectPulse
                
                # Shape-specific styling
                if shape == 'circle':
                    # 75
                elif shape == 'triangle':
                    # Triangle approximation
                    # 10
                elif shape == 'diamond':
                    # 10
                elif shape == 'star':
                    # 10
                elif shape == 'hexagon':
                    # 10
                else:
                    # 10
                
                # Disable during sequence showing
                if not memory_game_active or memory_showing_sequence:
                    action None
                else:
                    action [SetVariable("memory_selected_shape", shape), Return(("shape_click", shape))]
                
                # Shape icon
                if shape == 'circle':
                    text "⚫" size 60 xalign 0.5 yalign 0.5
                elif shape == 'square':
                    text "⬛" size 60 xalign 0.5 yalign 0.5
                elif shape == 'triangle':
                    text "🔺" size 60 xalign 0.5 yalign 0.5
                elif shape == 'diamond':
                    text "💠" size 60 xalign 0.5 yalign 0.5
                elif shape == 'star':
                    text "⭐" size 60 xalign 0.5 yalign 0.5
                elif shape == 'hexagon':
                    text "⬡" size 60 xalign 0.5 yalign 0.5
    
    # Control buttons
    hbox:
        xalign 0.5
        yalign 0.92
        spacing 30
        
        if not memory_game_active:
            button:
                xsize 180
                ysize 50
                background Solid("#1e3c72")
                hover_background Solid("#2a5298")
                # 25
                action Return("start_game")
                
                text "▶️ Start Game" size 22 color "#FFFFFF" xalign 0.5 yalign 0.5
        
        if memory_game_active and not memory_showing_sequence:
            button:
                xsize 180
                ysize 50
                background Solid("#FFA500")
                hover_background Solid("#FF8C00")
                # 25
                action Return("replay")
                
                text "🔄 Replay" size 22 color "#FFFFFF" xalign 0.5 yalign 0.5
        
        button:
            xsize 180
            ysize 50
            background Solid("#FF6B6B")
            hover_background Solid("#ee5a24")
            # 25
            action Return("quit_game")
            
            text "🏠 Menu" size 22 color "#FFFFFF" xalign 0.5 yalign 0.5

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
        # 15
        
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
                    # 25
                    action Return("play_again")
                    
                    text "🔄 Play Again" size 20 color "#FFFFFF" xalign 0.5 yalign 0.5
                
                button:
                    xsize 180
                    ysize 50
                    background Solid("#FF6B6B")
                    hover_background Solid("#ee5a24")
                    # 25
                    action Return("quit_game")
                    
                    text "🏠 Back to Story" size 20 color "#FFFFFF" xalign 0.5 yalign 0.5

# -----------------------------
# Memory Match Start Label
# -----------------------------
label memory_match_start:
    $ result = renpy.call_screen("memory_match_menu")
    
    if result == "start":
        call play_memory_match_game
        return
    elif result == "quit":
        "You chose not to play."
        return

# -----------------------------
# Play Memory Match Label
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
    $ game_start_time = time.time()
    
    # Show game screen and handle game loop
    label memory_game_loop:
        $ result = renpy.call_screen("memory_match_game")
        
        if result == "start_game":
            # Start new game
            $ memory_game_active = True
            $ generate_memory_sequence()
            jump memory_show_sequence
        
        elif result[0] == "shape_click" if isinstance(result, tuple) else False:
            # Player clicked a shape
            $ shape_clicked = result[1]
            $ memory_player_sequence.append(shape_clicked)
            
            # Check if correct
            $ current_index = len(memory_player_sequence) - 1
            if memory_player_sequence[current_index] == memory_sequence[current_index]:
                # Correct!
                $ memory_correct_shape = shape_clicked
                "Correct!"
                
                # Check if sequence complete
                if len(memory_player_sequence) == len(memory_sequence):
                    # Level complete!
                    $ memory_score += memory_level * 100
                    $ memory_level += 1
                    $ memory_sequence_length = min(8, 2 + memory_level)
                    "Level [memory_level]! Score: [memory_score]"
                    
                    # Generate new sequence
                    $ generate_memory_sequence()
                    jump memory_show_sequence
            else:
                # Wrong!
                $ memory_lives -= 1
                if memory_lives <= 0:
                    jump memory_game_over
                else:
                    "Wrong! [memory_lives] lives left."
                    $ memory_player_sequence = []
                    jump memory_show_sequence
            
            jump memory_game_loop
        
        elif result == "replay":
            jump memory_show_sequence
        
        elif result == "quit_game":
            jump memory_match_end
        
        jump memory_game_loop
    
    # Show sequence to player
    label memory_show_sequence:
        $ memory_showing_sequence = True
        $ memory_player_sequence = []
        
        # Show each shape in sequence
        "Watch the sequence..."
        
        python:
            import time
            for shape in memory_sequence:
                memory_selected_shape = shape
                time.sleep(0.8)
                memory_selected_shape = None
                time.sleep(0.3)
            memory_showing_sequence = False
        
        "Now repeat it!"
        jump memory_game_loop
    
    # Game over
    label memory_game_over:
        $ result = renpy.call_screen("memory_match_gameover")
        
        if result == "play_again":
            $ memory_level = 1
            $ memory_score = 0
            $ memory_lives = 3
            $ memory_sequence_length = 3
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