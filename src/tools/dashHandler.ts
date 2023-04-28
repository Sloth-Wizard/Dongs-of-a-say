//import dashjs from 'dashjs'
import type DayBar from '../components/dayBar/DayBar'
import { TimeData } from '../components/dayBar/interfaces'

interface manifestData {
    path: string
    skipToTime: number // in seconds
}

interface AudioBufferSourceNodeDash extends AudioBufferSourceNode {
    noteOn: (int: number) => {}
    playBackState: number
    readonly PLAYING_STATE: number
    readonly FINISHED_STATE: number
}

export const dash = {
    /**
     * ### Initialize the player
     * 
     * @param audio - Our audio html element
     * @param manifest - Manifest containing the data
     * 
     * @returns The generated player by dashjs
     */
    async init(audio: AudioContext, manifest: manifestData): Promise<void> {
        // Proceed to unlock audio on iOS
        window.addEventListener('unlockSound', async ev => {
            if (!(<CustomEvent>ev).detail) {
                console.error('Could not unlock the sound on your browser (DONGS_ERROR 564sdg564s65df4g64)')
            } else {
                console.log('Sound unlocked !')
                const buffer = await dash.load(`${import.meta.env.BASE_URL}${manifest.path}`, audio)
                console.log(buffer)
            }
        })
        
        dash.unlock(audio)

        //const player = dashjs.MediaPlayer().create()
        //player.initialize(undefined, `${import.meta.env.BASE_URL}${manifest.path}`, true, manifest.skipToTime)

        //return player
    },

    /**
     * ### Prepare the needed manifest to request with the player
     * 
     * @param time - The times we need to use for our math
     * @param dayBar - The dayBar component
     * 
     * @returns The manifest path and the time to skip to
     */
    async manifest(time: TimeData, dayBar: DayBar): Promise<manifestData> {
        const { seconds, interval } = time
        
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
    },

    /**
     * ### Load a new manifest to the audioContext
     */
    async load(url: string, audio: AudioContext): Promise<AudioBuffer | undefined> {
        let buffer: AudioBuffer | undefined = void 0

        const response = await window.fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        audio.decodeAudioData(arrayBuffer, 
            audioBuffer => {
                buffer = audioBuffer
            },
            err => {
                console.error(err)
            }
        )
        
        if (buffer) {
            this.play(buffer, audio)
        }

        return buffer
    },

    /**
     * ### Create an empty buffer and play it
     * 
     * @param audio 
     */
    async unlock(audio: AudioContext) {
        let buffer = audio.createBuffer(1, 1, 22050)
        let source = audio.createBufferSource() as AudioBufferSourceNodeDash

        source.buffer = buffer

        source.connect(audio.destination)

        // Play the file. noteOn is the older version of start()
        source.start ? source.start(0) : source.noteOn(0)

        // Check if we really unlocked the sound
        setTimeout(() => {
            if (source.playBackState === source.PLAYING_STATE || source.playBackState === source.FINISHED_STATE) {
                return window.dispatchEvent(new CustomEvent('unlockSound', { detail: true }))
            }

            return window.dispatchEvent(new CustomEvent('unlockSound', { detail: false }))
        }, 0)
    },

    /**
     * ### Play the loaded dash manifest
     */
    async play(buffer: AudioBuffer, audio: AudioContext) {
        const source = audio.createBufferSource()
        source.buffer = buffer
        source.connect(audio.destination)
        source.start()
    }
}
