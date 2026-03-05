Hoai Niem - Ren'Py Visual Novel

Configuration Options

Basic game information

define config.name = "Hoai Niem"
define config.version = "1.0.0"
define config.developer = "Hoai Niem Team"


Window settings

define config.screen_width = 1280
define config.screen_height = 720


Save game settings

define config.save_directory = "HoaiNiem-12345"
define config.save_compression = 2
define config.save_on_quit = True


Text settings

define config.default_text_cps = 50  # Characters per second for typewriter effect
define config.default_afm_time = 0   # Auto-forward mode time (0 = disabled by default)


Skip settings

define config.fast_skipping = True
define config.allow_skipping = True


Sound settings

define config.has_sound = True
define config.has_music = True
define config.has_voice = True


Character colors

define hoai_color = "#FF6B9D"
define niem_color = "#6BB3FF"


Theme and style

define gui.accent_color = "#FF6B9D"
define gui.idle_color = "#888888"
define gui.idle_hover_color = "#FF6B9D"
define gui.selected_color = "#ffffff"
define gui.insensitive_color = "#444444"


Button styling

define gui.button_text_font = "fonts/Nunito-Regular.ttf"
define gui.button_text_size = 24
define gui.button_text_idle_color = "#888888"
define gui.button_text_hover_color = "#FF6B9D"
define gui.button_text_selected_color = "#ffffff"


Dialogue styling

define gui.dialogue_text_font = "fonts/Nunito-Regular.ttf"
define gui.dialogue_text_size = 28
define gui.dialogue_text_color = "#ffffff"


Name box styling

define gui.name_text_font = "fonts/Nunito-Bold.ttf"
define gui.name_text_size = 32
define gui.name_text_color = "#ffffff"


Game variables - Player data

default player_name = "Player"
default player_gender = "male"
default target_name = "Niem"
default target_gender = "female"


Story progress tracking

default current_arc = "prologue"
default current_scene = 0
default current_dialogue = 0


Mini-game tracking

default minigame_results = {}
default last_minigame_score = 0


Skip and auto settings

default preferences.text_cps = 50
default preferences.afm_time = 0