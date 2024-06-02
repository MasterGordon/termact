#!/bin/bash

if ! command -v yt-dlp &> /dev/null; then
  echo "yt-dlp is not installed"
  exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
  echo "ffmpeg is not installed"
  exit 1
fi

echo "Playing video: $1"
mkdir -p video
cd video
rm -rf *
yt-dlp -o video.webm $1
ffmpeg -i video.webm -vf scale=960:540 -vsync 0 $filename%01d.png
cd ..

bun run examples/video.ts
