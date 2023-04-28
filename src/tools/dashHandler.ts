import dashjs from 'dashjs'
import type DayBar from '../components/dayBar/DayBar'
import { TimeData } from '../components/dayBar/interfaces'

interface manifestData {
    path: string
    skipToTime: number // in seconds
}


export const dash = {
    async init(audio: HTMLAudioElement, manifest: manifestData) {
        const player = dashjs.MediaPlayer().create()
        player.initialize(audio, `${manifest.path}`, true, 0)
    },

    /**
     * ### Prepare the needed manifest to request with the player
     * 
     * @param ev - The custom event passed from our dayBar module
     * @param dayBar - The dayBar component
     * 
     * @returns The manifest path and the time to skip to
     */
    async manifest(ev: CustomEvent<TimeData>, dayBar: DayBar): Promise<manifestData> {
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
        dayBar.setDayBar(intervalPosition, seconds, seconds / dayBar.barData.bar.timePerPixel)
    
        // Return the whole path to the manifest and the time we have to skip to
        return {
            path: `/audio/dash/${folderName}/manifest.mpd`,
            skipToTime: skipToTime
        }
    }
}
