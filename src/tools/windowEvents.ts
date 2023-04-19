export const windowSoundEvents = async (audio: HTMLAudioElement, video: HTMLVideoElement, ev: CustomEvent<{play: boolean}>) => {
    if (ev.detail.play === true) {
        audio.play()
        video.play()
    }

    if (ev.detail.play === false) {
        audio.pause()
        video.pause()
    }
}
