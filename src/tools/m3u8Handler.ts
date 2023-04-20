import Hls from 'hls.js'
import { DayBarData, TimeData } from '../components/dayBar/interfaces'

export interface hlsData {
    instance?: Hls,
    manifestPath: string
}

interface manifestData {
    path: string
    skipToTime: number // in seconds
}

export const m3u8 = {
    manifest: {
        /**
         * ### Create the correct url to retreive the wanted manifest
         * 
         * Also checks if the needed manifest is already loaded, in which case we will only change the time on the currect track being played
         * 
         * @param ev - The custom event passed from our dayBar module
         * @param dayBar - The dayBar component
         * 
         * @returns The whole path to our manifest and the time to skip to
         */
        prepare(ev: CustomEvent<TimeData>, dayBar: DayBarData): manifestData {
            const { seconds, interval } = ev.detail
        
            // Active position on the bar using an interval logic
            // The interval logic is calculated with 15 minutes increments in seconds (900)
            const intervalPosition = Math.floor(seconds / interval)
        
            // Total minutes from our active position on the bar
            const intervalPositionInMinutes = intervalPosition * 15
        
            // The minutes of our active position on the bar
            const minutes = Math.trunc(intervalPositionInMinutes % 60)
            // The hours of our active position on the bar
            const hours = Math.trunc(intervalPositionInMinutes / 60)
        
            // Construct the folder name we need to fetch the manifest
            const folderName = `${hours.toLocaleString('en-US', { minimumIntegerDigits: 2 })}h${minutes.toLocaleString('en-US', { minimumIntegerDigits: 2 })}`
        
            // Get the exact seconds on the 15 minutes track we clicked on
            const skipToTime = seconds % interval

            // Set all the needed data to our dayBar component
            dayBar.bar.dayIntervalPosition = intervalPosition
            dayBar.bar.elapsedTime = seconds
            dayBar.progressbar.progress = seconds / dayBar.bar.timePerPixel
        
            // Return the whole path to the manifest and the time we have to skip to
            return {
                path: `/audio/chunks/${folderName}/manfiest.m3u8`,
                skipToTime: skipToTime
            }
        }
    },

    hls: {
        /**
         * ### Load a source for hls
         * 
         * Checks if the current manifest is the one request, in that case skip the attaching and loading to the time skiping
         * 
         * @param hls - The `Hls` instance and manifest path
         * @param audio - Audio HTML element to attack the needed data
         * @param manifest - Path to the manifest to start loading the correct track chuncks and the time to jump to after it has been loaded
         * 
         * @returns The hls instance and it's loaded manifest path
         */
        async loadSource(hls: hlsData, audio: HTMLAudioElement, manifest: manifestData) {
            // Do not pause the audio ! It will cause a lot of issues when loading a new source when the browser tab runs in the background
            // Do not change the audio volume to 0 ! It will cause the same issue as pausing
            // Reset audio time instead
            audio.currentTime = 0

            // New manifest, load all the needed data
            if (hls.manifestPath !== `${import.meta.env.BASE_URL}${manifest.path}`) {
                // Remove the existing instance
                if (hls.instance) {
                    hls.instance.destroy()
                }

                // Start a new instance
                hls.instance = new Hls();
                hls.instance.attachMedia(audio)
                hls.instance.loadSource(`${import.meta.env.BASE_URL}${manifest.path}`)
                hls.instance.on(Hls.Events.MANIFEST_LOADED, () => {
                    audio.currentTime = manifest.skipToTime
                })
            } else { // No new manifest, skip time on current track
                audio.currentTime = manifest.skipToTime
            }

            // Save the loaded manifest into the hls data
            hls.manifestPath = `${import.meta.env.BASE_URL}${manifest.path}`

            return hls
        }
    }
}
