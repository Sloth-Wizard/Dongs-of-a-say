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
        return await parseResponse(response)
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
            display(data, dayBar.bar.elapsedTime, trackTitleElement)
            //handleLongTitle(trackTitleContainer, trackTitleElement)
        }, 1000)

        // First alignement and scroll if needed
        setTimeout(() => {
            handleLongTitle(trackTitleContainer, trackTitleElement)
        }, 1000)
    }
}

/**
 * ### Display the tracks informations at the correct time
 * 
 * @param data = The tracks in a well structured array of objects
 * @param time - The time of day we are at in seconds
 * @param trackTitleElement - The html element containing the track title
 */
async function display(data: tracksData[], time: number, trackTitleElement: HTMLSpanElement) {
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
}

/**
 * ### Parse the loaded response
 * 
 * @param response - The response we got from loading our tracks data file
 * 
 * @returns The parsed response to a usable array with the time and title
 */
async function parseResponse(response: Response): Promise<tracksData[]> {
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

/**
 * ### Scroll longer track title left and right so we can read it all
 * 
 * @param trackTitleContainer - The track title container
 * @param trackTitleElement - The html element containing the track title
 */
async function handleLongTitle(trackTitleContainer: HTMLTrackElement,trackTitleElement: HTMLSpanElement) {
    // Handle the actual scrolling of the title
    trackTitleElement.addEventListener('startScroll', _ => {
        const scrollLeftTotalAmount = trackTitleElement.offsetWidth - trackTitleContainer.offsetWidth

        let leftSlide = 0
        while (leftSlide <= scrollLeftTotalAmount) {
            moveTitle(leftSlide, scrollLeftTotalAmount, trackTitleElement)
            leftSlide++
        }
    })

    // Title is bigger than the container so we need to scroll the title
    if (trackTitleContainer.offsetWidth < trackTitleElement.offsetWidth) {
        // First align it left
        trackTitleElement.style.left = '0'
        trackTitleElement.style.right = 'unset'

        // Then scroll the element
        setTimeout(() => {
            trackTitleElement.dispatchEvent(new CustomEvent('startScroll'))
        }, 5000)
    } else {
        // ReAlign content to the right
        trackTitleElement.style.left = 'unset'
        trackTitleElement.style.right = '0'
    }
}

/**
 * ### Move the title left to right
 * 
 * @param i - The iteration in the loop from a total move pixels value
 * @param max - The maximum number we should go to, trigger a go back signal when we get there
 * @param trackTitleElement - The element containing the title
 */
function moveTitle(i: number, max: number, trackTitleElement: HTMLSpanElement) {
    setTimeout(() => {
        if (i === max) {
            // Reset position after 5 sec
            setTimeout(() => {
                trackTitleElement.style.left = '0'
            }, 5 * 1000)

            // Restart the scrolling after 10 sec
            setTimeout(() => {
                trackTitleElement.dispatchEvent(new CustomEvent('startScroll'))
            }, 10 * 1000)
        }

        trackTitleElement.style.left = `-${i}px`
    }, (50 * i))
}
