# Aya Share - Usage Guide

## Overview

`app.py` is the centralized application that handles the complete audio-to-video pipeline:
1. **Split Audio** - Split audio file into chunks based on silence
2. **Transcribe** - Transcribe each chunk using an API
3. **Generate Video** - Create video with text overlays and audio

## Command Line Usage

### Full Pipeline (All Steps)
```bash
python app.py full --audio quran.mp3 --output final_video.mp4 --api-url YOUR_API_URL
```

### Individual Steps

#### 1. Split Audio Only
```bash
python app.py split --audio quran.mp3
```

#### 2. Transcribe Chunks Only
```bash
python app.py transcribe --api-url YOUR_API_URL
```

#### 3. Generate Video Only
```bash
python app.py generate --audio quran.mp3 --output final_video.mp4
```

### Optional Parameters

- `--bg PATH` - Custom background image (default: `testing/bg.png`)
- `--font PATH` - Custom font file (default: `testing/TheYearofTheCamel-Regular.otf`)
- `--chunks-dir DIR` - Custom chunks directory (default: `splitted_audio`)

## Python API Usage

### Import Functions
```python
from app import split_audio, transcribe_chunks, generate_video, process_full_pipeline
```

### Split Audio
```python
chunks = split_audio(
    audio_path="quran.mp3",
    output_dir="splitted_audio",
    min_silence_len=100,  # milliseconds
    silence_thresh_offset=16,  # dBFS
    keep_silence=25  # milliseconds
)
```

### Transcribe Chunks
```python
transcriptions = transcribe_chunks(
    chunks_dir="splitted_audio",
    api_url="https://your-api.com/transcribe"
)
```

### Generate Video
```python
video_path = generate_video(
    transcriptions_path="splitted_audio/transcriptions.json",
    audio_path="quran.mp3",
    output_video_path="final_video.mp4",
    bg_path="testing/bg.png",
    font_path="testing/TheYearofTheCamel-Regular.otf",
    fade_duration=0.8,
    font_size=60,
    text_color="white",
    fps=24
)
```

### Full Pipeline
```python
result = process_full_pipeline(
    audio_path="quran.mp3",
    output_video_path="final_video.mp4",
    api_url="https://your-api.com/transcribe",
    bg_path="testing/bg.png",
    font_path="testing/TheYearofTheCamel-Regular.otf"
)
print(result)
# {
#   "audio_path": "quran.mp3",
#   "chunks_count": 5,
#   "chunks_dir": "splitted_audio",
#   "transcriptions_count": 5,
#   "video_path": "final_video.mp4"
# }
```

## Configuration

You can modify default settings in the `Config` class inside `app.py`:

```python
class Config:
    OUTPUT_DIR = "splitted_audio"
    MIN_SILENCE_LEN = 100
    SILENCE_THRESH_OFFSET = 16
    KEEP_SILENCE = 25
    TRANSCRIBE_API_URL = "xxxx/transcribe"
    BG_PATH = "testing/bg.png"
    FONT_PATH = "testing/TheYearofTheCamel-Regular.otf"
    FADE_DURATION = 0.8
    MIN_DURATION_FOR_FADE = 1.0
    FONT_SIZE = 60
    TEXT_COLOR = "white"
    VIDEO_FPS = 24
```

## Output Files

- `splitted_audio/chunk_*.wav` - Individual audio chunks
- `splitted_audio/chunks.json` - Metadata about chunks
- `splitted_audio/transcriptions.json` - Transcriptions with timing
- `final_video.mp4` - Generated video file

## Examples

### Process a new audio file
```bash
python app.py full --audio new_audio.mp3 --output output.mp4 --api-url https://api.example.com/transcribe
```

### Use custom background and font
```bash
python app.py full \
    --audio quran.mp3 \
    --output video.mp4 \
    --bg custom_bg.png \
    --font custom_font.ttf \
    --api-url https://api.example.com/transcribe
```

### Re-generate video from existing transcriptions
```bash
python app.py generate --audio quran.mp3 --output new_video.mp4
```
