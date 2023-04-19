export const keybinds = async (audio: HTMLAudioElement) => {
    document.body.onkeyup = ev => {
        // PAUSE
        if (ev.key === ' ' || ev.key === 'Space') {
            if (audio.paused) {
                audio.play()
            } else { 
                audio.pause()
            }
        }
    }
}
