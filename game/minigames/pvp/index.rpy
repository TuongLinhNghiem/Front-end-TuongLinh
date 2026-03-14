# PvP Battle Mini-game for Ren'Py (8.5+)
# Based on HTML reference: Kiana Battle System
# Features:
# - Player vs AI battle
# - Hoai vs Niem characters (based on player selection)
# - HP and Ultimate bars
# - Attack and Ultimate abilities
# - Stage progression with story
# - Leaderboard tracking

# -----------------------------
# Game Variables
# -----------------------------
default pvp_player_hp = 25
default pvp_player_max_hp = 25
default pvp_player_ult = 0
default pvp_player_max_ult = 5
default pvp_enemy_hp = 25
default pvp_enemy_max_hp = 25
default pvp_enemy_ult = 0
default pvp_enemy_max_ult = 5
default pvp_stage = 0
default pvp_game_state = "playing"  # playing, paused, story, gameover
default pvp_is_attacking = False
default pvp_leaderboard = []

# -----------------------------
# PvP Battle Functions
# -----------------------------
init python:
    import random
    import time

    # Stage definitions - story content
    PVP_STAGES = [
        {
            "name": "First Encounter",
            "story": "A friendly sparring match begins. Let's see who's been training harder!"
        },
        {
            "name": "Training Grounds",
            "story": "The practice continues. Both of you are getting stronger with each exchange."
        },
        {
            "name": "Friendly Rivalry",
            "story": "The bond between you grows stronger through friendly competition."
        },
        {
            "name": "Final Showdown",
            "story": "This is it! The ultimate test of your skills. Give it everything you've got!"
        }
    ]

    def get_player_character():
        """Get player character name based on selection."""
        return store.player_name  # Hoai or Niem

    def get_enemy_character():
        """Get enemy character name (opposite of player)."""
        if store.player_name == "Hoai":
            return "Niem"
        return "Hoai"

    def pvp_reset_fight():
        """Reset fight state for new round."""
        global pvp_player_hp, pvp_enemy_hp, pvp_player_ult, pvp_enemy_ult, pvp_game_state, pvp_is_attacking
        pvp_player_hp = pvp_player_max_hp
        pvp_enemy_hp = pvp_enemy_max_hp
        pvp_player_ult = 0
        pvp_enemy_ult = 0
        pvp_game_state = "playing"
        pvp_is_attacking = False

# -----------------------------
# Animations
# -----------------------------
transform AttackMove:
    linear 0.2 xoffset 50
    linear 0.2 xoffset 0

transform HitShake:
    linear 0.1 xoffset -10
    linear 0.1 xoffset 10
    linear 0.1 xoffset -10
    linear 0.1 xoffset 0

transform UltimatePulse:
    linear 0.3 zoom 1.2
    linear 0.3 zoom 1.0

transform DamageFloat:
    linear 1.0 yoffset -50 alpha 0

# -----------------------------
# PvP Battle Menu Screen
# -----------------------------
screen pvp_menu():
    modal True
    
    # Dark background
    add Solid("#0a0a0a")
    
    # Title
    vbox:
        xalign 0.5
        yalign 0.3
        spacing 20
        
        text "⚔️ PVP BATTLE" size 72 color "#00ffff" xalign 0.5 bold True at GlowAnim
        text "[player_name] vs [target_name]" size 36 color "#FFFFFF" xalign 0.5
    
    # Character preview
    hbox:
        xalign 0.5
        yalign 0.55
        spacing 100
        
        # Player side
        vbox:
            spacing 10
            text "[player_name]" size 28 color "#00ffff" xalign 0.5 bold True
            text "❤️ [pvp_player_max_hp]" size 20 color "#FFFFFF" xalign 0.5
        
        text "VS" size 48 color "#FFA500" yalign 0.5
        
        # Enemy side
        vbox:
            spacing 10
            text "[target_name]" size 28 color "#ff0040" xalign 0.5 bold True
            text "❤️ [pvp_enemy_max_hp]" size 20 color "#FFFFFF" xalign 0.5
    
    # Menu buttons
    hbox:
        xalign 0.5
        yalign 0.8
        spacing 40
        
        button:
            xsize 200
            ysize 60
            background Solid("#1e3c72")
            hover_background Solid("#2a5298")
            corner_radius 30
            action Return("start")
            
            text "⚔️ BATTLE!" size 24 color "#FFFFFF" xalign 0.5 yalign 0.5
        
        button:
            xsize 200
            ysize 60
            background Solid("#333333")
            hover_background Solid("#444444")
            corner_radius 30
            action Return("quit")
            
            text "🏠 GO HOME" size 24 color "#FFFFFF" xalign 0.5 yalign 0.5
    
    # Controls info
    text "Controls: SPACE = Attack | U = Ultimate | P = Pause":
        size 18
        color "#666666"
        xalign 0.5
        yalign 0.92

# -----------------------------
# PvP Battle Game Screen
# -----------------------------
screen pvp_game():
    key "K_SPACE" action Return("player_attack")
    key "K_u" action Return("player_ultimate")
    key "K_p" action Return("toggle_pause")
    
    # Dark background with gradient
    add Solid("#0a0a0a")
    add Solid("#1a1a2e"):
        ysize 360
    
    # UI - Top Left (Player Info)
    frame:
        pos (20, 20)
        background Solid("#000000")
        padding (15, 15)
        corner_radius 10
        xsize 280
        
        vbox:
            spacing 10
            hbox:
                spacing 10
                # Player portrait placeholder
                add Solid("#00ffff"):
                    xsize 60
                    ysize 60
                    corner_radius 30
                vbox:
                    spacing 5
                    text "[player_name]" size 22 color "#00ffff" bold True
                    text "Player" size 14 color "#888888"
            
            # HP Bar
            hbox:
                spacing 5
                text "HP" size 14 color "#00ffff"
                bar:
                    value pvp_player_hp
                    range pvp_player_max_hp
                    xsize 180
                    ysize 20
                    left_bar Solid("#00ff88")
                    right_bar Solid("#333333")
                text "[pvp_player_hp]/[pvp_player_max_hp]" size 14 color "#FFFFFF"
            
            # Ultimate Bar
            hbox:
                spacing 5
                text "ULT" size 14 color "#ff8800"
                bar:
                    value pvp_player_ult
                    range pvp_player_max_ult
                    xsize 180
                    ysize 15
                    left_bar Solid("#ff8800")
                    right_bar Solid("#333333")
                text "[pvp_player_ult]/[pvp_player_max_ult]" size 14 color "#FFFFFF"
    
    # UI - Top Center (Stage Info)
    frame:
        xalign 0.5
        ypos 20
        background Solid("#000000")
        padding (20, 15)
        corner_radius 10
        
        vbox:
            spacing 5
            $ stage_name = PVP_STAGES[pvp_stage]["name"] if pvp_stage < len(PVP_STAGES) else "Final Stage"
            text "Stage [pvp_stage+1]: [stage_name]" size 22 color "#00ffff" bold True xalign 0.5
    
    # UI - Top Right (Enemy Info)
    frame:
        pos (980, 20)
        background Solid("#000000")
        padding (15, 15)
        corner_radius 10
        xsize 280
        
        vbox:
            spacing 10
            hbox:
                spacing 10
                vbox:
                    spacing 5
                    text "[target_name]" size 22 color "#ff0040" bold True xalign 1.0
                    text "Enemy" size 14 color "#888888" xalign 1.0
                # Enemy portrait placeholder
                add Solid("#ff0040"):
                    xsize 60
                    ysize 60
                    corner_radius 30
            
            # HP Bar
            hbox:
                spacing 5
                text "[pvp_enemy_hp]/[pvp_enemy_max_hp]" size 14 color "#FFFFFF"
                bar:
                    value pvp_enemy_hp
                    range pvp_enemy_max_hp
                    xsize 180
                    ysize 20
                    left_bar Solid("#ff0040")
                    right_bar Solid("#333333")
                text "HP" size 14 color "#ff0040"
            
            # Ultimate Bar
            hbox:
                spacing 5
                text "[pvp_enemy_ult]/[pvp_enemy_max_ult]" size 14 color "#FFFFFF"
                bar:
                    value pvp_enemy_ult
                    range pvp_enemy_max_ult
                    xsize 180
                    ysize 15
                    left_bar Solid("#ff0040")
                    right_bar Solid("#333333")
                text "ULT" size 14 color "#ff8800"
    
    # Battle Area
    hbox:
        xalign 0.5
        yalign 0.65
        spacing 200
        
        # Player character
        vbox:
            xalign 0.5
            add Solid("#00ffff"):
                xsize 120
                ysize 180
                corner_radius 10
            text "[player_name]" size 18 color "#00ffff" xalign 0.5
        
        # VS indicator
        text "⚔️" size 48 color "#FFA500" yalign 0.5
        
        # Enemy character
        vbox:
            xalign 0.5
            add Solid("#ff0040"):
                xsize 120
                ysize 180
                corner_radius 10
            text "[target_name]" size 18 color "#ff0040" xalign 0.5
    
    # Controls hint
    frame:
        xalign 0.5
        yalign 0.95
        background Solid("#000000")
        padding (15, 10)
        corner_radius 10
        
        text "SPACE: Attack | U: Ultimate | P: Pause" size 16 color "#888888"
    
    # Skip button
    button:
        pos (20, 650)
        xsize 120
        ysize 40
        background Solid("#333333")
        hover_background Solid("#444444")
        corner_radius 20
        action Return("skip")
        
        text "Skip Battle" size 16 color "#FFFFFF" xalign 0.5 yalign 0.5
    
    # Pause overlay
    if pvp_game_state == "paused":
        add Solid("#000000"):
            alpha 0.7
        
        frame:
            xalign 0.5
            yalign 0.5
            background Solid("#FFFFFF")
            padding (40, 40)
            corner_radius 15
            
            vbox:
                spacing 20
                text "⏸️ PAUSED" size 48 color "#333333" xalign 0.5 bold True
                button:
                    xsize 200
                    ysize 50
                    background Solid("#1e3c72")
                    hover_background Solid("#2a5298")
                    corner_radius 25
                    action Return("resume")
                    
                    text "▶️ Resume" size 22 color "#FFFFFF" xalign 0.5 yalign 0.5

# -----------------------------
# Story Screen (Between Stages)
# -----------------------------
screen pvp_story_screen():
    modal True
    
    add Solid("#000000"):
        alpha 0.9
    
    frame:
        xalign 0.5
        yalign 0.5
        background Solid("#1a1a2e")
        padding (50, 50)
        corner_radius 15
        xsize 700
        
        vbox:
            spacing 20
            $ stage_name = PVP_STAGES[pvp_stage]["name"] if pvp_stage < len(PVP_STAGES) else "Victory!"
            $ stage_story = PVP_STAGES[pvp_stage]["story"] if pvp_stage < len(PVP_STAGES) else "Congratulations! You've proven your strength!"
            
            text "Stage [pvp_stage+1] Complete: [stage_name]" size 32 color "#00ffff" xalign 0.5 bold True
            text "[stage_story]" size 20 color "#FFFFFF" xalign 0.5 text_align 0.5
            
            null height 20
            
            button:
                xsize 250
                ysize 50
                background Solid("#1e3c72")
                hover_background Solid("#2a5298")
                corner_radius 25
                xalign 0.5
                action Return("next_stage")
                
                if pvp_stage >= len(PVP_STAGES) - 1:
                    text "🏆 Finish Game" size 22 color "#FFFFFF" xalign 0.5 yalign 0.5
                else:
                    text "▶️ Next Stage" size 22 color "#FFFFFF" xalign 0.5 yalign 0.5

# -----------------------------
# Game Over Screen
# -----------------------------
screen pvp_gameover():
    modal True
    
    add Solid("#000000"):
        alpha 0.9
    
    frame:
        xalign 0.5
        yalign 0.5
        background Solid("#FFFFFF")
        padding (50, 50)
        corner_radius 15
        
        vbox:
            spacing 20
            text "💀 Game Over!" size 48 color "#ff0040" xalign 0.5 bold True
            text "[target_name] wins this round!" size 24 color "#333333" xalign 0.5
            
            null height 20
            
            hbox:
                spacing 30
                xalign 0.5
                
                button:
                    xsize 180
                    ysize 50
                    background Solid("#1e3c72")
                    hover_background Solid("#2a5298")
                    corner_radius 25
                    action Return("retry")
                    
                    text "🔄 Retry" size 20 color "#FFFFFF" xalign 0.5 yalign 0.5
                
                button:
                    xsize 180
                    ysize 50
                    background Solid("#FF6B6B")
                    hover_background Solid("#ee5a24")
                    corner_radius 25
                    action Return("quit")
                    
                    text "🏠 Back to Story" size 20 color "#FFFFFF" xalign 0.5 yalign 0.5

# -----------------------------
# PvP Start Label
# -----------------------------
label pvp_start:
    $ result = renpy.call_screen("pvp_menu")
    
    if result == "start":
        call play_pvp_game
        return
    elif result == "quit":
        "You chose not to battle."
        return

# -----------------------------
# Play PvP Game Label
# -----------------------------
label play_pvp_game:
    # Initialize game state
    $ import time
    $ pvp_stage = 0
    $ pvp_game_state = "playing"
    $ game_start_time = time.time()
    $ pvp_reset_fight()
    
    label pvp_game_loop:
        $ result = renpy.call_screen("pvp_game")
        
        if result == "player_attack":
            # Player attacks
            $ is_crit = random.random() < 0.2
            $ damage = 2 if is_crit else 1
            $ pvp_enemy_hp = max(0, pvp_enemy_hp - damage)
            $ pvp_player_ult = min(pvp_player_max_ult, pvp_player_ult + 1)
            
            if is_crit:
                "Critical hit! [damage] damage!"
            else:
                "You dealt [damage] damage!"
            
            # Check win
            if pvp_enemy_hp <= 0:
                jump pvp_stage_complete
            
            # Enemy counter-attack
            $ pvp_enemy_hp = max(0, pvp_enemy_hp)
            jump pvp_enemy_turn
        
        elif result == "player_ultimate":
            if pvp_player_ult >= pvp_player_max_ult:
                # Ultimate attack
                $ damage = 3
                $ pvp_enemy_hp = max(0, pvp_enemy_hp - damage)
                $ pvp_player_ult = 0
                "ULTIMATE! [damage] damage!"
                
                if pvp_enemy_hp <= 0:
                    jump pvp_stage_complete
            else:
                "Need [pvp_player_max_ult] ULT to use ultimate!"
            jump pvp_game_loop
        
        elif result == "toggle_pause":
            if pvp_game_state == "playing":
                $ pvp_game_state = "paused"
            jump pvp_game_loop
        
        elif result == "resume":
            $ pvp_game_state = "playing"
            jump pvp_game_loop
        
        elif result == "skip":
            jump pvp_stage_complete
        
        jump pvp_game_loop
    
    # Enemy turn
    label pvp_enemy_turn:
        # Enemy attacks
        $ enemy_damage = 1
        $ pvp_player_hp = max(0, pvp_player_hp - enemy_damage)
        $ pvp_enemy_ult = min(pvp_enemy_max_ult, pvp_enemy_ult + 1)
        
        "[target_name] attacks! [enemy_damage] damage!"
        
        # Check if enemy uses ultimate
        if pvp_enemy_ult >= pvp_enemy_max_ult:
            $ ult_damage = 3
            $ pvp_player_hp = max(0, pvp_player_hp - ult_damage)
            $ pvp_enemy_ult = 0
            "[target_name] uses ULTIMATE! [ult_damage] damage!"
        
        # Check lose
        if pvp_player_hp <= 0:
            jump pvp_game_over
        
        jump pvp_game_loop
    
    # Stage complete
    label pvp_stage_complete:
        $ result = renpy.call_screen("pvp_story_screen")
        
        if result == "next_stage":
            $ pvp_stage += 1
            if pvp_stage >= len(PVP_STAGES):
                "Congratulations! You've completed all stages!"
                jump pvp_end
            $ pvp_reset_fight()
            jump pvp_game_loop
        jump pvp_game_loop
    
    # Game over
    label pvp_game_over:
        $ result = renpy.call_screen("pvp_gameover")
        
        if result == "retry":
            $ pvp_reset_fight()
            jump pvp_game_loop
        else:
            jump pvp_end
    
    label pvp_end:
        # Record to leaderboard
        $ total_time = time.time() - game_start_time
        $ pvp_leaderboard.append({
            "stage": pvp_stage + 1,
            "timestamp": time.time(),
            "date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "player": store.player_name
        })
        $ pvp_leaderboard.sort(key=lambda x: (-x["stage"], x["timestamp"]))
        $ pvp_leaderboard = pvp_leaderboard[:20]
        
        return