Hoai Niem - Custom Screens

UI Components, Mini-Game Screens, and Custom Overlays

init -1:
    # Screen scaling
    transform dissolve:
        alpha 0.0
        ease 0.5 alpha 1.0


transform slide_left:
    xalign 1.5
    ease 0.5 xalign 0.0

transform slide_right:
    xalign -0.5
    ease 0.5 xalign 0.0

transform fade_in:
    alpha 0.0
    ease 0.3 alpha 1.0

transform fade_out:
    alpha 1.0
    ease 0.3 alpha 0.0

transform bounce:
    yoffset -20
    ease 0.2 yoffset 0
    ease 0.1 yoffset -10
    ease 0.1 yoffset 0

# Character positions
transform pos_left:
    xalign 0.2

transform pos_center:
    xalign 0.5

transform pos_right:
    xalign 0.8

###############################################################################

CHARACTER SELECTION SCREEN (Index/Intro Page)

###############################################################################


screen character_selection():
    tag menu
    use game_menu(_("Hoai Niem"), scroll="viewport")


vbox:
    xalign 0.5
    yalign 0.4
    spacing 30

    text "Choose Your Protagonist":
        style "title_text"
        xalign 0.5
        size 60
        color "#FF6B9D"

    textbutton "Hoai":
        action SetVariable("player_name", "Hoai"), SetVariable("player_gender", "male"), SetVariable("target_name", "Niem"), SetVariable("target_gender", "female"), Start("prologue")
        text_size 40
        xalign 0.5
        xysize(400, 80)
        text_color "#888888"
        text_hover_color "#FF6B9D"

    textbutton "Niem":
        action SetVariable("player_name", "Niem"), SetVariable("player_gender", "female"), SetVariable("target_name", "Hoai"), SetVariable("target_gender", "male"), Start("prologue")
        text_size 40
        xalign 0.5
        xysize(400, 80)
        text_color "#888888"
        text_hover_color "#6BB3FF"

frame:
    xalign 0.5
    yalign 0.7
    xysize(600, 150)
    background "#00000080"

    text "Each character has a unique story and\

perspective. Your choice will shape the\
narrative ahead.":
            xalign 0.5
            yalign 0.5
            size 24
            color "#ffffff"
            text_align 0.5
            line_spacing 5


###############################################################################

DIALOGUE SCREEN

###############################################################################


screen dialogue_custom(dialogue):
    zorder 50


# Name box
if dialogue.who:
    frame:
        xalign 0.5
        ypos 480
        xysize(400, 60)
        background "#FF6B9D"
        if dialogue.who == "{player_name}" or dialogue.who == "Hoai":
            background "#FF6B9D"
        else:
            background "#6BB3FF"

        text dialogue.who:
            xalign 0.5
            yalign 0.5
            style "dialogue_name"

# Dialogue box
window:
    xalign 0.5
    ypos 550
    xysize(1200, 140)
    background "#000000CC"
    padding (20, 20)

    text dialogue.what:
        style "dialogue_text"

# Continue indicator
if renpy.is_skipping():
    text ">> SKIP >>":
        style "skip_text"
        xalign 0.95
        yalign 0.5
        color "#FF6B9D"
elif renpy.get_screen("quick_menu"):
    text "\u25b6":
        style "continue_text"
        xalign 0.95
        yalign 0.5
        color "#FF6B9D"
        at bounce

###############################################################################

CHOICE SCREEN

###############################################################################


screen custom_choice(items):
    style_prefix "choice"


vbox:
    xalign 0.5
    yalign 0.5
    spacing 20

    for i in items:
        button:
            xysize(800, 80)
            background "#000000CC"
            hover_background "#FF6B9D"
            action i.action
            text i.caption:
                style "choice_text"

###############################################################################

MINI-GAME SCREEN

###############################################################################


screen minigame_overlay():
    zorder 100
    modal True


# Semi-transparent background
add "00000080"

# Mini-game container frame
frame:
    xalign 0.5
    yalign 0.5
    xysize(1150, 650)
    background "#1a1a2e"
    padding (10, 10)

    # Mini-game title bar
    frame:
        xysize(1130, 50)
        yalign 0.0
        background "#16213e"

        textbutton "\u2716":
            xalign 0.99
            yalign 0.5
            text_size 24
            text_color "#ffffff"
            text_hover_color "#FF6B9D"
            action [Hide("minigame_overlay"), Return("quit")]

        text "Mini-Game":
            xalign 0.5
            yalign 0.5
            size 28
            color "#FF6B9D"

    # Mini-game content area
    frame:
        yalign 0.5
        xysize(1130, 590)
        background "#0f3460"
        yoffset 25

        # This is where the actual mini-game will be embedded
        # For HTML/JS games, we'll use a webview or iframe equivalent
        vbox:
            xalign 0.5
            yalign 0.5
            spacing 20

            text "Mini-Game: [minigame_name]":
                xalign 0.5
                size 32
                color "#ffffff"

            text "Game will be loaded here...":
                xalign 0.5
                size 20
                color "#888888"

            textbutton "Complete Game":
                xalign 0.5
                xysize(200, 50)
                text_size 20
                text_color "#ffffff"
                text_hover_color "#FF6B9D"
                action [SetVariable("last_minigame_score", 100), Return("complete")]

# Return to Story button (bottom)
frame:
    xalign 0.5
    yalign 0.92
    xysize(300, 50)

    textbutton "\u2190 Return to Story":
        text_size 22
        xalign 0.5
        text_color "#ffffff"
        text_hover_color "#FF6B9D"
        action [Hide("minigame_overlay"), Return("quit")]

###############################################################################

SAVE/LOAD SCREEN

###############################################################################


screen file_picker():
    frame:
        style_group "file_picker"
        xfill True
        yfill True


default page_name_value = FilePageNameInputValue(pattern=_("Page {}"), auto=_("Automatic saves"), quick=_("Quick saves"))

use file_picker_navigation(page_name_value=page_name_value)

$ columns = 2
$ rows = 5

grid columns rows:
    style_group "file_picker"
    transpose True
    xfill True
    yfill True

    for i in range(columns * rows):
        $ slot = i + 1

        button:
            style "file_picker_slot"
            action FileAction(slot)

            add FileScreenshot(slot) xalign 0.5 yalign 0.5

            text FileTime(slot, empty=_("Empty Slot")):
                style "file_picker_slot_time_text"

            text FileSaveName(slot):
                style "file_picker_slot_name_text"

            key "save_delete" action FileDelete(slot)

###############################################################################

QUICK MENU

###############################################################################


screen quick_menu():
    zorder 100


if main_menu:

    add "gui/overlay/quick_menu.png"

hbox:
    style_prefix "quick"

    xalign 0.5
    yalign 1.0

    textbutton _("Back") action Rollback()
    textbutton _("History") action ShowMenu("history")
    textbutton _("Skip") action Skip()
    textbutton _("Auto") action Preference("auto-forward", "toggle")
    textbutton _("Save") action ShowMenu("save")
    textbutton _("Q.Save") action QuickSave()
    textbutton _("Q.Load") action QuickLoad()
    textbutton _("Prefs") action ShowMenu("preferences")

init -1 python:
    style.title_text = Style(style.default)
    style.title_text.size = 60
    style.title_text.color = "#FF6B9D"
    style.title_text.font = "fonts/Nunito-Bold.ttf"


style.dialogue_text = Style(style.default)
style.dialogue_text.size = 28
style.dialogue_text.color = "#ffffff"
style.dialogue_text.font = "fonts/Nunito-Regular.ttf"

style.dialogue_name = Style(style.default)
style.dialogue_name.size = 32
style.dialogue_name.color = "#ffffff"
style.dialogue_name.font = "fonts/Nunito-Bold.ttf"

style.continue_text = Style(style.default)
style.continue_text.size = 24

style.skip_text = Style(style.default)
style.skip_text.size = 20

style.choice_text = Style(style.default)
style.choice_text.size = 24
style.choice_text.color = "#ffffff"
style.choice_text.font = "fonts/Nunito-Regular.ttf"