# Hoai Niem - GUI Configuration

# Visual styling and interface configuration

# GUI Initialization

init python:
    # Button styling
    gui.init(1280, 720)


# Colors

define gui.idle_color = u'#888888'
define gui.idle_hover_color = u'#FF6B9D'
define gui.selected_color = u'#ffffff'
define gui.insensitive_color = u'#44444444'
define gui.muted_color = u'#666666'
define gui.hover_color = u'#FF6B9D'
define gui.selected_hover_color = u'#FF6B9D'
define gui.accent_color = u'#FF6B9D'


# Text colors

define gui.text_color = u'#ffffff'
define gui.interface_text_color = u'#ffffff'


# Fonts

define gui.text_font = "fonts/Nunito-Regular.ttf"
define gui.name_text_font = "fonts/Nunito-Bold.ttf"
define gui.interface_text_font = "fonts/Nunito-Regular.ttf"


# Text sizes

define gui.text_size = 28
define gui.name_text_size = 32
define gui.interface_text_size = 24
define gui.label_text_size = 24
define gui.notify_text_size = 24
define gui.title_text_size = 60


# Window styling

define gui.dialogue_text_xalign = 0.0
define gui.dialogue_text_yalign = 0.0
define gui.dialogue_text_textalign = 0.0
define gui.dialogue_text_layout = "subtitle"


# Dialogue box

define gui.dialogue_height = 140
define gui.dialogue_width = 1200
define gui.dialogue_xalign = 0.5
define gui.dialogue_yalign = 1.0


# Name box

define gui.name_xpos = 0.5
define gui.name_ypos = -50
define gui.name_xalign = 0.5
define gui.namebox_width = 400
define gui.namebox_height = 60
define gui.namebox_borders = Borders(20, 20, 20, 20)
define gui.namebox_tile = False


# Button styling

define gui.button_width = None
define gui.button_height = None
define gui.button_borders = Borders(10, 10, 10, 10)
define gui.button_tile = False
define gui.button_text_font = gui.interface_text_font
define gui.button_text_size = gui.interface_text_size
define gui.button_text_idle_color = gui.idle_color
define gui.button_text_hover_color = gui.hover_color
define gui.button_text_selected_color = gui.selected_color
define gui.button_text_selected_hover_color = gui.selected_hover_color
define gui.button_text_xalign = 0.5
define gui.button_text_xanchor = 0.5
define gui.button_text_yalign = 0.5
define gui.button_text_yanchor = 0.5


# Choice buttons

define gui.choice_button_width = 800
define gui.choice_button_height = 80
define gui.choice_button_borders = Borders(10, 10, 10, 10)
define gui.choice_button_text_font = gui.text_font
define gui.choice_button_text_size = gui.text_size
define gui.choice_button_text_xalign = 0.5
define gui.choice_button_text_idle_color = "#ffffff"
define gui.choice_button_text_hover_color = "#FF6B9D"


# Save slot buttons

define gui.slot_button_width = 276
define gui.slot_button_height = 206
define gui.slot_button_borders = Borders(10, 10, 10, 10)
define gui.slot_button_text_size = 14
define gui.slot_button_text_xalign = 0.5
define gui.slot_button_text_idle_color = gui.idle_color
define gui.slot_button_text_selected_hover_color = gui.hover_color


# File slot columns and rows

define gui.file_slot_columns = 2
define gui.file_slot_rows = 5


# Navigation buttons

define gui.navigation_xpos = 80
define gui.navigation_ypos = 80


# Skip/Notify

define gui.skip_ypos = 20
define gui.notify_ypos = 60


# Bar styling

define gui.bar_size = 25
define gui.scrollbar_size = 12
define gui.slider_size = 25
define gui.bar_tile = False
define gui.scrollbar_tile = False
define gui.slider_tile = False
define gui.bar_borders = Borders(4, 4, 4, 4)
define gui.scrollbar_borders = Borders(4, 4, 4, 4)
define gui.slider_borders = Borders(4, 4, 4, 4)
define gui.vbar_borders = Borders(4, 4, 4, 4)
define gui.vscrollbar_borders = Borders(4, 4, 4, 4)
define gui.vslider_borders = Borders(4, 4, 4, 4)


# Game menu

define gui.game_menu_background = "#000000aa"


# Preface

define gui.show_name = True
define gui.about = ""
define gui.save_directory = "HoaiNiem-12345"
define gui.window_icon = "gui/window_icon.png"