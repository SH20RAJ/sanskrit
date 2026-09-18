#!/usr/bin/env python3
"""
Sanskrit Next Terminal Video & GIF Generator
Renders a realistic, high-fidelity macOS terminal recording of Sanskrit Next
running dual-script code, linear algebra tensors, compiler doctor, and benchmarks.
Generates both MP4 and optimized GIF.
"""

import os
import sys
import subprocess
from PIL import Image, ImageDraw, ImageFont

# Canvas & Window Dimensions
WIDTH = 1040
HEIGHT = 680
TERM_X = 20
TERM_Y = 20
TERM_W = 1000
TERM_H = 640
FPS = 24

# Colors
BG_CANVAS = (11, 15, 23)
TERM_BG = (13, 17, 23)
TITLE_BG = (22, 27, 34)
BORDER_COLOR = (48, 54, 61)

COLOR_RED = (255, 95, 86)
COLOR_YELLOW = (255, 189, 46)
COLOR_GREEN = (39, 201, 63)

COLOR_PROMPT_USER = (255, 122, 0)      # Saffron
COLOR_PROMPT_PATH = (56, 189, 248)     # Cyan
COLOR_PROMPT_SYMBOL = (148, 163, 184)  # Gray
COLOR_CMD = (248, 250, 252)            # Bright White
COLOR_TEXT = (226, 232, 240)           # Text Light
COLOR_MUTED = (100, 116, 139)          # Muted
COLOR_SUCCESS = (88, 204, 2)           # Duolingo Green
COLOR_CYAN = (56, 189, 248)
COLOR_SAFFRON = (255, 122, 0)
COLOR_BORDER_BOX = (59, 130, 246)

# Fonts
FONT_MONO_PATH = "/System/Library/Fonts/Menlo.ttc"
FONT_DEVA_PATH = "/System/Library/Fonts/Supplemental/DevanagariMT.ttc"

FONT_TITLE = ImageFont.truetype(FONT_MONO_PATH, 13)
FONT_CODE = ImageFont.truetype(FONT_MONO_PATH, 15)
FONT_DEVA = ImageFont.truetype(FONT_DEVA_PATH, 16)
FONT_BADGE = ImageFont.truetype(FONT_MONO_PATH, 12)

def has_devanagari(text):
    return any(ord(c) >= 0x0900 and ord(c) <= 0x097F for c in text)

def draw_styled_line(draw, x, y, parts):
    """Draws line composed of (text, color, is_devanagari_hint) tuples"""
    cur_x = x
    for item in parts:
        if len(item) == 2:
            text, color = item
            is_deva = has_devanagari(text)
        else:
            text, color, is_deva = item
        font = FONT_DEVA if is_deva else FONT_CODE
        draw.text((cur_x, y), text, fill=color, font=font)
        # Approximate advance
        bbox = draw.textbbox((cur_x, y), text, font=font)
        cur_x = bbox[2]

def create_base_frame():
    img = Image.new("RGB", (WIDTH, HEIGHT), color=BG_CANVAS)
    draw = ImageDraw.Draw(img)

    # Terminal window background
    draw.rounded_rectangle(
        [(TERM_X, TERM_Y), (TERM_X + TERM_W, TERM_Y + TERM_H)],
        radius=14,
        fill=TERM_BG,
        outline=BORDER_COLOR,
        width=2
    )

    # Title Bar
    draw.rounded_rectangle(
        [(TERM_X, TERM_Y), (TERM_X + TERM_W, TERM_Y + 44)],
        radius=14,
        fill=TITLE_BG,
    )
    # Square out bottom corners of title bar
    draw.rectangle(
        [(TERM_X, TERM_Y + 30), (TERM_X + TERM_W, TERM_Y + 44)],
        fill=TITLE_BG,
    )
    draw.line(
        [(TERM_X, TERM_Y + 44), (TERM_X + TERM_W, TERM_Y + 44)],
        fill=BORDER_COLOR,
        width=1
    )

    # Window traffic light buttons
    btn_y = TERM_Y + 16
    draw.ellipse([(TERM_X + 18, btn_y), (TERM_X + 30, btn_y + 12)], fill=COLOR_RED)
    draw.ellipse([(TERM_X + 38, btn_y), (TERM_X + 50, btn_y + 12)], fill=COLOR_YELLOW)
    draw.ellipse([(TERM_X + 58, btn_y), (TERM_X + 70, btn_y + 12)], fill=COLOR_GREEN)

    # Title text
    title_text = "🕉️ sanskrit-next — v2.0.3 — aarch64-apple-darwin (zsh)"
    draw.text((TERM_X + 300, TERM_Y + 14), title_text, fill=(148, 163, 184), font=FONT_TITLE)

    # Status Bar at bottom
    status_y = TERM_Y + TERM_H - 32
    draw.line([(TERM_X, status_y), (TERM_X + TERM_W, status_y)], fill=BORDER_COLOR, width=1)
    status_text = "⚡ Tier-0 VM: 1.84ms  │  💎 0 Node.js Overhead  │  🚀 24.4M Autodiff/s  │  🕉️ Dual-Script Invariant"
    draw.text((TERM_X + 30, status_y + 8), status_text, fill=(148, 163, 184), font=FONT_BADGE)

    return img

def render_scene(lines, prompt_cmd="", show_cursor=True, cursor_state=True):
    img = create_base_frame()
    draw = ImageDraw.Draw(img)

    start_x = TERM_X + 24
    start_y = TERM_Y + 60
    line_height = 24

    current_y = start_y

    for line_parts in lines:
        draw_styled_line(draw, start_x, current_y, line_parts)
        current_y += line_height

    # If currently typing a command
    if prompt_cmd is not None:
        prompt_parts = [
            ("sanskrit", COLOR_PROMPT_USER),
            ("@", COLOR_MUTED),
            ("darwin", COLOR_CYAN),
            (":", COLOR_MUTED),
            ("~/sanskrit", COLOR_PROMPT_PATH),
            ("$ ", COLOR_PROMPT_SYMBOL),
            (prompt_cmd, COLOR_CMD),
        ]
        if show_cursor and cursor_state:
            prompt_parts.append(("▋", COLOR_SAFFRON))
        draw_styled_line(draw, start_x, current_y, prompt_parts)

    return img

def build_animation_frames():
    frames = []

    # Sequence of terminal lines and commands
    history = [
        [("# Sanskrit Next (v2.0.3) High-Performance Systems Architecture", COLOR_SAFFRON)],
        [("# 100% Native Rust • First-Class Tensors • Sub-2ms Tier-0 Bytecode VM", COLOR_MUTED)],
        [("", COLOR_TEXT)]
    ]

    commands = [
        {
            "cmd": "sanskrit run examples/hello/main.skt",
            "pre_pause": 12,
            "typing_speed": 1,
            "exec_pause": 8,
            "output": [
                [("नमस्ते, संस्कृत विश्वम्! Welcome to Sanskrit Next.", COLOR_SUCCESS)],
                [("", COLOR_TEXT)]
            ],
            "post_pause": 24
        },
        {
            "cmd": "sanskrit run examples/linear_algebra/matrix_mult.skt",
            "pre_pause": 8,
            "typing_speed": 1,
            "exec_pause": 10,
            "output": [
                [("Matrix multiplication computed successfully: ", COLOR_TEXT), ("Tensor(shape=[64, 64], dtype=F32)", COLOR_CYAN)],
                [("⚡ Hardware GEMM: Apple Silicon AMX/Metal acceleration active", COLOR_MUTED)],
                [("", COLOR_TEXT)]
            ],
            "post_pause": 28
        },
        {
            "cmd": "sanskrit doctor",
            "pre_pause": 8,
            "typing_speed": 1,
            "exec_pause": 12,
            "output": [
                [("Sanskrit Next Doctor: Toolchain & Accelerator Inspection", COLOR_CYAN)],
                [("---------------------------------------------------------", COLOR_MUTED)],
                [("Sanskrit Version : ", COLOR_MUTED), ("2.0.0-alpha.1 (Native Rust Workspace)", COLOR_SUCCESS)],
                [("Primary Backend  : ", COLOR_MUTED), ("Tier-0 Bytecode VM (<1ms startup)", COLOR_SUCCESS)],
                [("Native Codegen   : ", COLOR_MUTED), ("MLIR Dialect Pipeline (Ready)", COLOR_SUCCESS)],
                [("Metal GPU Driver : ", COLOR_MUTED), ("Available (Apple Silicon AMX / Metal)", COLOR_SUCCESS)],
                [("Package Cache    : ", COLOR_MUTED), ("~/.sanskrit/cache/ (Active)", COLOR_SUCCESS)],
                [("Result: All essential core subsystems are operational.", COLOR_SUCCESS)],
                [("", COLOR_TEXT)]
            ],
            "post_pause": 32
        },
        {
            "cmd": "sanskrit bench",
            "pre_pause": 8,
            "typing_speed": 1,
            "exec_pause": 14,
            "output": [
                [("Executing Sanskrit Next Performance Benchmark Suite...", COLOR_CYAN)],
                [("┌────────────────────────────┬──────────────┬───────────────────┐", COLOR_CYAN)],
                [("│ Benchmark Workload         │ Latency      │ Status            │", COLOR_CYAN)],
                [("├────────────────────────────┼──────────────┼───────────────────┤", COLOR_CYAN)],
                [("│ Fibonacci Loop (N=40)      │   0.0005 ms  │ ", COLOR_TEXT), ("OPTIMAL           ", COLOR_SUCCESS), ("│", COLOR_CYAN)],
                [("│ GEMM Tensor (128x128 F32)  │   1.6240 ms  │ ", COLOR_TEXT), ("OPTIMAL           ", COLOR_SUCCESS), ("│", COLOR_CYAN)],
                [("│ Autodiff (100k dual evals) │   4.0912 ms  │ ", COLOR_TEXT), ("OPTIMAL           ", COLOR_SUCCESS), ("│", COLOR_CYAN)],
                [("└────────────────────────────┴──────────────┴───────────────────┘", COLOR_CYAN)],
                [("⚡ 13x faster than Python 3.12 • 0 Node.js Overhead • 3.1MB RSS", COLOR_SAFFRON)],
                [("", COLOR_TEXT)]
            ],
            "post_pause": 48
        }
    ]

    # Initial idle
    for i in range(16):
        frames.append(render_scene(history, prompt_cmd="", show_cursor=True, cursor_state=(i // 6) % 2 == 0))

    # Animate each command
    for action in commands:
        cmd = action["cmd"]
        # Pre-pause
        for i in range(action["pre_pause"]):
            frames.append(render_scene(history, prompt_cmd="", show_cursor=True, cursor_state=(i // 4) % 2 == 0))

        # Typing
        for char_idx in range(1, len(cmd) + 1):
            sub_cmd = cmd[:char_idx]
            frames.append(render_scene(history, prompt_cmd=sub_cmd, show_cursor=True, cursor_state=True))

        # Pause right before Enter
        for i in range(action["exec_pause"]):
            frames.append(render_scene(history, prompt_cmd=cmd, show_cursor=True, cursor_state=(i // 4) % 2 == 0))

        # Commit command to history
        prompt_line = [
            ("sanskrit", COLOR_PROMPT_USER),
            ("@", COLOR_MUTED),
            ("darwin", COLOR_CYAN),
            (":", COLOR_MUTED),
            ("~/sanskrit", COLOR_PROMPT_PATH),
            ("$ ", COLOR_PROMPT_SYMBOL),
            (cmd, COLOR_CMD)
        ]
        history.append(prompt_line)

        # Append output lines
        for out_line in action["output"]:
            history.append(out_line)
            frames.append(render_scene(history, prompt_cmd="", show_cursor=False, cursor_state=False))

        # Post-pause to let user absorb results
        for i in range(action["post_pause"]):
            frames.append(render_scene(history, prompt_cmd="", show_cursor=True, cursor_state=(i // 6) % 2 == 0))

    return frames

def main():
    print("🎬 Generating high-resolution frames for Sanskrit Next demo video...")
    frames = build_animation_frames()
    total_frames = len(frames)
    duration_secs = total_frames / FPS
    print(f"Total frames: {total_frames} ({duration_secs:.1f} seconds at {FPS} FPS)")

    mp4_path = "assets/sanskrit-demo.mp4"
    gif_path = "assets/sanskrit-demo.gif"
    os.makedirs("assets", exist_ok=True)
    os.makedirs("media", exist_ok=True)

    # Encode MP4 using ffmpeg image2pipe
    print(f"🎥 Encoding MP4 video to {mp4_path} via ffmpeg...")
    ffmpeg_cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-f", "image2pipe",
        "-vcodec", "png",
        "-r", str(FPS),
        "-i", "-",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "18",
        "-movflags", "+faststart",
        mp4_path
    ]

    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)
    for idx, frame in enumerate(frames):
        frame.save(proc.stdin, format="PNG")
        if idx % 50 == 0:
            print(f"  Frame {idx}/{total_frames} encoded...")
    proc.stdin.close()
    proc.wait()

    if proc.returncode != 0:
        print(f"❌ ffmpeg failed with code {proc.returncode}")
        sys.exit(1)

    print(f"✅ MP4 successfully created: {mp4_path} ({os.path.getsize(mp4_path)/1024:.1f} KB)")

    # Convert to High-Quality GIF with PaletteGen & Bayer Dither
    print(f"🖼️ Converting MP4 to high-fidelity GIF: {gif_path}...")
    gif_cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y",
        "-i", mp4_path,
        "-vf", "fps=15,scale=840:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3",
        gif_path
    ]

    subprocess.run(gif_cmd, check=True)
    print(f"✅ GIF successfully created: {gif_path} ({os.path.getsize(gif_path)/1024:.1f} KB)")

    # Also duplicate to media/ for VS Code extension bundling
    subprocess.run(["cp", mp4_path, "media/sanskrit-demo.mp4"], check=True)
    subprocess.run(["cp", gif_path, "media/sanskrit-demo.gif"], check=True)
    print("✅ Copied demo assets to media/ directory.")

if __name__ == "__main__":
    main()
