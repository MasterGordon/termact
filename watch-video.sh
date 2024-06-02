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
framerate=$(ffprobe -v 0 -of csv=p=0 -select_streams v:0 -show_entries stream=r_frame_rate "video.webm" | sed 's#/# / #g' | bc -l)
echo "Framerate: $framerate"
cd ..

bun run examples/video.ts $framerate
