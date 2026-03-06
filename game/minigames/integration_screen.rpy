init python:
    MINIGAME_BRIDGE_JS = """
(function() {
    function sendToRenPy(type, data) {
        var message = JSON.stringify({
            type: type,
            data: data,
            timestamp: Date.now()
        });

        if (window.parent !== window) {
            window.parent.postMessage(message, '*');
        }

        try {
            localStorage.setItem('hoainiem_minigame_result', message);
        } catch(e) {
            console.log('Could not save to localStorage:', e);
        }
    }

    window.gameComplete = function(score, extras) {
        sendToRenPy('GAME_COMPLETE', {
            score: score || 0,
            extras: extras || {}
        });
    };

    window.gameQuit = function() {
        sendToRenPy('GAME_QUIT', {});
    };

    window.gameError = function(message) {
        sendToRenPy('GAME_ERROR', { message: message });
    };

    window.addEventListener('message', function(event) {
        try {
            var msg = JSON.parse(event.data);
            if (msg.type === 'PAUSE_GAME') {
                if (typeof window.pauseGame === 'function') {
                    window.pauseGame();
                }
            } else if (msg.type === 'RESUME_GAME') {
                if (typeof window.resumeGame === 'function') {
                    window.resumeGame();
                }
            }
        } catch(e) {
            console.log('Could not parse message:', e);
        }
    });

    console.log('Hoai Niem Mini-Game Bridge initialized');
})();
"""

    def inject_bridge_into_html(html_content):
        bridge_script = "<script>" + MINIGAME_BRIDGE_JS + "</script>"

        if "</head>" in html_content:
            return html_content.replace("</head>", bridge_script + "</head>")
        elif "</body>" in html_content:
            return html_content.replace("</body>", bridge_script + "</body>")
        else:
            return html_content + bridge_script


    def get_minigame_html_path(game_name):
        if game_name not in MINIGAMES:
            return None

        game_info = MINIGAMES[game_name]

        html_path = os.path.join(
            config.basedir,
            "game",
            "minigames",
            game_info["folder"],
            game_info["html_file"]
        )

        if os.path.exists(html_path):
            return html_path

        return None


    def create_minigame_launcher(game_name):
        game_info = MINIGAMES.get(game_name)
        if not game_info:
            return None

        launcher_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>""" + game_info["name"] + """</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
width:100vw;
height:100vh;
overflow:hidden;
background:#0f3460;
}
#game-container {
width:100%;
height:100%;
display:flex;
justify-content:center;
align-items:center;
}
#game-iframe {
width:100%;
height:100%;
border:none;
}
#loading {
position:absolute;
top:50%;
left:50%;
transform:translate(-50%,-50%);
color:#FF6B9D;
font-family:sans-serif;
font-size:24px;
}
</style>
<script>
window.addEventListener('message', function(event) {
try {
var msg = JSON.parse(event.data);
if (msg.type === 'GAME_COMPLETE') {
}
else if (msg.type === 'GAME_QUIT') {
}
} catch(e) {}
});
</script>
</head>

<body>
<div id="game-container">
<div id="loading">Loading """ + game_info["name"] + """...</div>

<iframe id="game-iframe"
src=\"""" + game_info["html_file"] + """\"
style="display:none;"
onload="this.style.display='block';document.getElementById('loading').style.display='none';">
</iframe>

</div>
</body>
</html>
"""

        launcher_path = os.path.join(
            config.basedir,
            "game",
            "minigames",
            game_info["folder"],
            "launcher.html"
        )

        try:
            with open(launcher_path, "w", encoding="utf-8") as f:
                f.write(launcher_html)
            return launcher_path
        except Exception as e:
            renpy.log("Error creating launcher: " + str(e))
            return None


screen minigame_html_screen(game_name):
    zorder 100
    modal True

    $ game_info = get_minigame_info(game_name)

    add "000000"

    frame:
        xysize(1280, 60)
        background "#16213e"
        yalign 0.0

        text (game_info["name"] if game_info else "Mini-Game"):
            style "title_text"
            size 28
            xalign 0.5
            yalign 0.5

        textbutton "\u2190 Return to Story":
            xalign 0.0
            xoffset 20
            yalign 0.5
            text_size 20
            text_color "#ffffff"
            text_hover_color "#FF6B9D"
            action [SetVariable("minigame_quit", True), Return("quit")]

    frame:
        xalign 0.5
        yalign 0.5
        xysize(1280, 660)
        background "#0f3460"

        vbox:
            xalign 0.5
            yalign 0.5
            spacing 30

            text "\U0001F3AE " + (game_info["name"] if game_info else "Mini-Game"):
                size 48
                color "#FF6B9D"
                xalign 0.5

            text (game_info["description"] if game_info else ""):
                size 24
                color "#888888"
                xalign 0.5

            null height 20

            text "Game Controls:":
                size 20
                color "#ffffff"
                xalign 0.5

            text (game_info["controls"] if game_info else ""):
                size 18
                color "#888888"
                xalign 0.5

            null height 30

            hbox:
                xalign 0.5
                spacing 20

                textbutton "\U0001F3AE Play Game":
                    xysize(200, 60)
                    text_size 22
                    text_color "#ffffff"
                    text_hover_color "#FF6B9D"
                    background "#16213e"
                    action [SetVariable("last_minigame_score", 100), Return("complete")]

                textbutton "\u274c Quit":
                    xysize(200, 60)
                    text_size 22
                    text_color "#ffffff"
                    text_hover_color "#FF6B9D"
                    background "#16213e"
                    action Return("quit")

    text "Score: [last_minigame_score]":
        xalign 0.95
        yalign 0.95
        size 28
        color "#ffffff"

    frame:
        xysize(1280, 50)
        background "#00000080"
        yalign 1.0

        text "Press ESC or click 'Return to Story' to exit the mini-game":
            size 16
            color "#888888"
            xalign 0.5
            yalign 0.5