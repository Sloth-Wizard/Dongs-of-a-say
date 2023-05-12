import { DayBarData } from '../components/dayBar/interfaces'

interface tracksData {
    startTime: number
    endTime: number
    title: string
}

// Displays the track information at the right time
export const tracks = {
    /**
     * ### Load the tracks information and parse the data
     * 
     * @returns The parsed response to a usable array with the time and title
     */
    async load(): Promise<tracksData[]> {
        const response = await fetch(`${import.meta.env.BASE_URL}/data/tracks.txt`)
        return await tracks.parseResponse(response)
    },

    /**
     * ### Start the tracks module
     * 
     * This checks the track to be displayed every seconds
     * 
     * @param dayBar - The dayBar component instance with all the needed data
     * @param data - Our parsed tracks
     */
    async start(dayBar: DayBarData, data: tracksData[]) {
        const trackTitleContainer = document.createElement('track')
        const trackTitleElement = document.createElement('span')
        trackTitleElement.innerText = '...'
        trackTitleContainer.insertAdjacentElement('afterbegin', trackTitleElement)

        // Add the tracks being played to the interface
        document.body.insertAdjacentElement('beforeend', trackTitleContainer)

        setInterval(() => {
            tracks.display(data, dayBar.bar.elapsedTime, trackTitleElement)
        }, 1000)
    },

    /**
     * ### Display the tracks informations at the correct time
     * 
     * @param data = The tracks in a well structured array of objects
     * @param time - The time of day we are at in seconds
     * @param trackTitleElement - The html element containing the track title
     */
    async display(data: tracksData[], time: number, trackTitleElement: HTMLSpanElement) {
        const currentTrack = data.find(track => {
            if (track.startTime <= time && track.endTime >= time) {
                return track
            }

            return false
        })

        // Update the track being played
        if (currentTrack) {
            trackTitleElement.innerText = currentTrack.title
        }
    },

    /**
     * ### Parse the loaded response
     * 
     * @param response - The response we got from loading our tracks data file
     * 
     * @returns The parsed response to a usable array with the time and title
     */
    async parseResponse(response: Response): Promise<tracksData[]> {
        // Prepare our response data to handlable strings
        const data = await response.text()

        // First split to get each lines in an iterable
        let bufTracks = data.split('\n')
        let tracksD: tracksData[] = []
        for (let i = 0; i < bufTracks.length; i++) {
            const trackSplit = bufTracks[i].split('=')

            let nextTrackSplit = []
            // Next track exists, otherwise go back to 0
            if (bufTracks[i+1]) {
                nextTrackSplit = bufTracks[i+1].split('=')
            } else {
                nextTrackSplit = bufTracks[0].split('=')
            }

            // The start time of the track
            const startTimeSplit = trackSplit[0].split(':') // 0 is hours, 1 is minutes and 2 is seconds
            const startSeconds = (parseInt(startTimeSplit[0]) * 3600) + (parseInt(startTimeSplit[1]) * 60) + parseInt(startTimeSplit[2])
            // The end time of the track
            const endTimeSplit = nextTrackSplit[0].split(':') // 0 is hours, 1 is minutes and 2 is seconds
            const endSeconds = (parseInt(endTimeSplit[0]) * 3600) + (parseInt(endTimeSplit[1]) * 60) + parseInt(endTimeSplit[2])

            // Now we populate our tracksD object
            tracksD.push({
                startTime: startSeconds,
                endTime: endSeconds,
                title: trackSplit[1]
            })
        }

        return tracksD
    }
}
