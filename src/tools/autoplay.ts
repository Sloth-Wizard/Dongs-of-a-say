export const autoplay = {
    /**
     * ### Checks if we can initially play the audio or not
     * 
     * Append a button to give auth if auth is not given initially
     * 
     * @param app - The main app container
     * @param audio - The html audio element
     * @param video - The html video element
     */
    async init(app: HTMLElement, audio: HTMLAudioElement, _video: HTMLVideoElement) {
        const hasAudioAuth = audio.play()
        //const hasVideoAuth = video.play()
        if (hasAudioAuth !== undefined /*&& hasVideoAuth !== undefined*/) {
            // Create the button to authorize sounds to be played
            const btnContainer = document.createElement('div')
            btnContainer.classList.add('sound')
            const btn = document.createElement('button')
            btn.classList.add('btn')
            btn.innerText = 'Press start'
            btn.addEventListener('click', () => {
                audio.play()
                //video.play()

                if (!audio.paused) {
                    btn.remove()
                }
            })
            
            btnContainer.insertAdjacentElement('beforeend', btn)

            if (audio.paused /*&& video.paused*/) {
                app.insertAdjacentElement('beforeend', btnContainer)
            }
            
        }
    },

    /**
     * ### Play the audio of the given html audio element
     * 
     * This acts as a wrapper for the async `play()` function
     * 
     * @param audio - Our html audio element
     */
    async playAudio(audio: HTMLAudioElement) {
        try {
            await audio.play()
        } catch (err) {
            console.error('Could not play the requested sound')
            console.log(err)
        }
    }
}