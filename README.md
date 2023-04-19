# HLS for 24h music

This is a 24h (86400 seconds) audio streamer using `m3u8` manifests to play `ts` audio chunks of type `text/vnd.trolltech.linguist`

## Before anything else

You must first install the needed dependencies

```sh
npm i
```

Then you need to chunk your `mp3` files

To do so, put all your `mp3` files in the `/public/audio` folder

Then execute the `chunker.sh` file

```sh
cd ./public/audio
./chunker.sh
```

This will put all your chunks into the `chunks` folder using the filename as foldername

> Note that you will need to install `ffmpeg` to be able to use the script. To do so run `sudo apt-get install ffmpeg` on the system you use to make the chunks

## For development

Run the following to start vite server

```sh
npm run dev
```

## For production

Run the following to build

```sh
npm run build
```

You will find all your files into the `./dist` folder

All you need to do is upload that folder to your server and you are done !
