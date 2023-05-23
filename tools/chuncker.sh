#!/bin/bash

cd audio

mkdir -p 'chunks'

for filename in *.mp3; do
    mkdir -p ./chunks/${filename%.*}
    echo Created directory ${filename%.*}
    ffmpeg -i $filename -c:a aac -b:a 128k -muxdelay 0 -f segment -sc_threshold 0 -segment_time 7 -segment_list ./chunks/${filename%.*}/manfiest.m3u8 -segment_format mpegts "./chunks/${filename%.*}/frag%d.ts"
done
