#!/bin/bash

mkdir -p 'dash'

for filename in *.mp3; do
    mkdir -p ./dash/${filename%.*}
    echo Created directory ${filename%.*}
    ffmpeg -re -i $filename -c:a aac -use_timeline 1 -use_template 1 -f dash ./dash/${filename%.*}/manifest.mpd
done
