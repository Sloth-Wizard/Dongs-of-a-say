export const soundVolume = {
    /**
     * ### Handle the more or less volume buttons and applys it on the current audio
     * 
     * Limite to a minimum of 0 and maximum of 1
     * 
     * @param less - Less volume html button
     * @param more - More volume html button
     * @param audio - The main audio html element
     */
    async handleVolume(less: HTMLElement, more: HTMLElement, audio: HTMLAudioElement) {
        less.addEventListener('click', _ => {
            if (audio.volume <= 0) {
                audio.volume = 0
            } else {
                audio.volume = audio.volume - 0.1
            }
        })

        more.addEventListener('click', _ => {
            if (audio.volume >= 1) {
                audio.volume = 1
            } else {
                audio.volume = audio.volume + 0.1
            }
        })
    },

    /**
     * ### Sets the volume level span elements into the main volume container
     * 
     * @param audio - The main audio html element
     * @param levelContainer - The container containing previous volume spans
     */
    async setVolumeBar(audio: HTMLAudioElement, levelContainer: HTMLElement) {
        audio.addEventListener('volumechange', _ => {
            soundVolume.volumeLocalStorage('set', audio.volume)
            levelContainer.innerHTML = ''
            let activeVolume = audio.volume * 10
            for (let i = 0; i < activeVolume; i++) {
                levelContainer.insertAdjacentHTML('beforeend', '<span></span>')
            }
        })
    },

    /**
     * ### Save previous volume into the local storage
     * 
     * @param action - Action to perform ('set' or 'get')
     * @param volume - The volume level to be saved (optional)
     * 
     * @returns The volume storage value
     */
    async volumeLocalStorage(action: 'set' | 'get', volume?: number): Promise<string | null> {
        const volumeStore = window.localStorage.getItem('doas_v')

        if (action === 'set' && volume) {
            // Update or create the value
            if (!volumeStore || (volumeStore && volumeStore !== `${volume.toFixed(2)}`)) {
                window.localStorage.setItem('doas_v', `${volume.toFixed(2)}`)
            }
        }

        return window.localStorage.getItem('doas_v')
    }
}
