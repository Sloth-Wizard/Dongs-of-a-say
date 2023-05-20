#!/bin/bash

cd audio

mkdir -p 'chunks'

for filename in *.mp3; do
    mkdir ./chunks/${filename%.*}
    echo Created directory ${filename%.*}
    ffmpeg -i $filename -c:a aac -b:a 64k -vn -hls_list_size 0 -hls_time 4 ./chunks/${filename%.*}/manfiest.m3u8
done
